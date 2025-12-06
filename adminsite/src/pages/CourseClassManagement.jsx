import React, { useEffect, useState } from 'react';
import PageMeta from '../components/common/PageMeta.jsx';
import Button from '../components/ui/button/Button.jsx';
import Modal from '../components/ui/modal/index.jsx';

// Thư viện validate
import * as yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

import {
  getAllCourseClasses,
  createCourseClass,
  updateCourseClass,
  deleteCourseClass,
} from '../services/courseClassService.js';

import {
    getAllSubjects
} from "../services/subjectService.js";

import {
    getAllClasses
} from "../services/classService.js";

import {
    getAllTeachers
} from "../services/teacherService.js";

import {
    getAllSemesters
} from "../services/semesterService.js";

const courseClassSchema = yup.object({
    name: yup
        .string()
        .trim()
        .required('Tên lớp học phần không được để trống')
        .max(255, 'Tên không được vượt quá 255 ký tự'),
    subject_id: yup
        .string() // Dùng string vì value từ <select> thường là string
        .required('Vui lòng chọn môn học'),
    class_id: yup
        .string()
        .required('Vui lòng chọn lớp (sinh viên)'),
    semester_id: yup
        .string()
        .required('Vui lòng chọn học kỳ'),
    teacher_id: yup
        .string()
        .required('Vui lòng chọn giảng viên'),
});

/**
 * Helper: Đảm bảo các trường foreign key được gửi đi là kiểu number
 */
const parseForeignKeyFields = (data) => ({
    subject_id: parseInt(data.subject_id, 10),
    class_id: parseInt(data.class_id, 10),
    semester_id: parseInt(data.semester_id, 10),
    teacher_id: parseInt(data.teacher_id, 10),
});


export default function CourseClassManagement() {
    const [courseClasses, setCourseClasses] = useState([]);
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [editCourseClass, setEditCourseClass] = useState(null);
    const [search, setSearch] = useState('');

    // State cho 4 danh sách dependencies
    const [subjects, setSubjects] = useState([]);
    const [studentClasses, setStudentClasses] = useState([]); // Dùng "studentClasses" để tránh trùng tên "class"
    const [semesters, setSemesters] = useState([]);
    const [teachers, setTeachers] = useState([]);

    // -------------------------------------------------
    // Tích hợp React Hook Form
    // -------------------------------------------------

    const defaultFormValues = {
        name: '',
        subject_id: '',
        class_id: '',
        semester_id: '',
        teacher_id: '',
    };

    const addForm = useForm({
        resolver: yupResolver(courseClassSchema),
        defaultValues: defaultFormValues,
    });

    const editForm = useForm({
        resolver: yupResolver(courseClassSchema),
        defaultValues: defaultFormValues,
    });

    // -------------------------------------------------
    // Load dữ liệu
    // -------------------------------------------------

    useEffect(() => {
        fetchList();
        fetchDependencies(); // Gọi API cho cả 4 dependencies
    }, []);

    const fetchList = async () => {
        try {
            const data = await getAllCourseClasses();
            setCourseClasses(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Failed to load course classes', err);
        }
    };

    const fetchDependencies = async () => {
        try {
            // Gọi song song 4 API
            const [subjectsData, classesData, semestersData, teachersData] = await Promise.all([
                getAllSubjects(),
                getAllClasses(),
                getAllSemesters(),
                getAllTeachers(),
            ]);
            setSubjects(Array.isArray(subjectsData) ? subjectsData : []);
            setStudentClasses(Array.isArray(classesData) ? classesData : []);
            setSemesters(Array.isArray(semestersData) ? semestersData : []);
            setTeachers(Array.isArray(teachersData) ? teachersData : []);
        } catch (err) {
            console.error('Failed to load dependencies', err);
        }
    };

    // -------------------------------------------------
    // Xử lý Modal
    // -------------------------------------------------

    const handleAddOpen = () => {
        addForm.reset(defaultFormValues);
        setIsAddOpen(true);
    };
    const handleAddClose = () => setIsAddOpen(false);

    const handleEditOpen = (item) => {
        setEditCourseClass(item);
        editForm.reset({ // Nạp dữ liệu
            name: item.name || '',
            subject_id: String(item.subject_id || ''), // Chuyển sang string cho <select>
            class_id: String(item.class_id || ''),
            semester_id: String(item.semester_id || ''),
            teacher_id: String(item.teacher_id || ''),
        });
        setIsEditOpen(true);
    };
    const handleEditClose = () => {
        setEditCourseClass(null);
        setIsEditOpen(false);
    };

    // -------------------------------------------------
    // Xử lý CRUD
    // -------------------------------------------------

    const handleBackendErrors = (formInstance, err) => {
        const payload = err?.response?.data;
        const list = payload?.errors;

        if (Array.isArray(list)) {
            list.forEach((e) => {
                if (e.field) {
                    formInstance.setError(e.field, { type: 'server', message: e.message });
                }
            });
        } else {
            const message = payload?.message || err.message || 'Lỗi không xác định từ server';
            formInstance.setError('root.serverError', { type: 'server', message });
        }
    };

    const onSubmitAdd = async (data) => {
        try {
            const dataToSave = parseForeignKeyFields(data);
            await createCourseClass({ name: data.name, ...dataToSave });
            setIsAddOpen(false);
            fetchList();
        } catch (err) {
            console.error('Failed to create course class', err);
            handleBackendErrors(addForm, err);
        }
    };

    const onSubmitEdit = async (data) => {
        try {
            const dataToSave = parseForeignKeyFields(data);
            await updateCourseClass(editCourseClass.id, { name: data.name, ...dataToSave });
            setIsEditOpen(false);
            fetchList();
        } catch (err) {
            console.error('Update failed:', err);
            handleBackendErrors(editForm, err);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Bạn có chắc muốn xóa lớp học phần này?')) return;
        try {
            await deleteCourseClass(id);
            fetchList();
        } catch (err) {
            console.error('Delete failed:', err);
            alert(err?.response?.data?.message || 'Lỗi khi xóa lớp học phần');
        }
    };

    // -------------------------------------------------
    // Helpers & Render
    // -------------------------------------------------

    /**
     * Helper: Tìm tên từ ID trong danh sách dependency
     * @param {string|number} id - ID cần tìm
     * @param {Array} list - Danh sách (vd: subjects, teachers)
     * @returns {string} - Tên hoặc ID nếu không tìm thấy
     */
    const getDepName = (id, list) => {
        const found = list.find(item => String(item.id) === String(id));
        return found ? found.name : `(ID: ${id})`;
    };

    const filtered = courseClasses.filter(cc => {
        const q = (search || '').toLowerCase();
        return (cc.name || '').toLowerCase().includes(q);
    });

    /**
     * Helper component để render trường input
     */
    const FormInput = ({ name, label, form, ...props }) => {
        const error = form.formState.errors[name];
        return (
            <div>
                <label className="block mb-1 text-sm">{label}</label>
                <input
                    {...form.register(name)}
                    {...props}
                    className={`w-full border rounded px-3 py-2 ${error ? 'border-red-500' : ''}`}
                />
                {error && <p className="text-red-500 text-sm mt-1">{error.message}</p>}
            </div>
        );
    };

    /**
     * Helper component để render trường select
     */
    const FormSelect = ({ name, label, form, children, ...props }) => {
        const error = form.formState.errors[name];
        return (
            <div>
                <label className="block mb-1 text-sm">{label}</label>
                <select
                    {...form.register(name)}
                    {...props}
                    className={`w-full border rounded px-3 py-2 ${error ? 'border-red-500' : ''}`}
                >
                    {children}
                </select>
                {error && <p className="text-red-500 text-sm mt-1">{error.message}</p>}
            </div>
        );
    };

    /**
     * Render form body cho cả Add và Edit modal
     */
    const renderFormBody = (formInstance) => (
        <div className="space-y-4">
            <FormInput name="name" label="Tên Lớp học phần" form={formInstance} placeholder="Ví dụ: Lớp Toán 1A" />

            <FormSelect name="subject_id" label="Môn học" form={formInstance}>
                <option value="">-- Chọn Môn học --</option>
                {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </FormSelect>

            <FormSelect name="class_id" label="Lớp (sinh viên)" form={formInstance}>
                <option value="">-- Chọn Lớp --</option>
                {studentClasses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </FormSelect>

            <FormSelect name="semester_id" label="Học kỳ" form={formInstance}>
                <option value="">-- Chọn Học kỳ --</option>
                {semesters.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </FormSelect>

            <FormSelect name="teacher_id" label="Giảng viên" form={formInstance}>
                <option value="">-- Chọn Giảng viên --</option>
                {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </FormSelect>

            {/* Lỗi chung từ server */}
            {formInstance.formState.errors.root?.serverError && (
                <div className="text-sm text-red-500">{formInstance.formState.errors.root.serverError.message}</div>
            )}
        </div>
    );

    return (
        <>
            <PageMeta title="Quản lý Lớp học phần" description="Trang quản lý danh sách lớp học phần (course class)." />

            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white p-4">
                <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-3">
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Tìm theo tên lớp học phần..."
                            className="border rounded px-3 py-2"
                        />
                        <Button size="sm" variant="outline" onClick={fetchList}>
                            Làm mới
                        </Button>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button
                            size="sm"
                            className="!px-6 !py-2 font-semibold bg-blue-600 hover:bg-blue-700"
                        >
                            Import Excel
                        </Button>

                        <Button size="md" variant="primary"
                                className="!px-6 !py-2 font-semibold bg-green-600 hover:bg-green-700"
                                onClick={handleAddOpen}>
                            Thêm LHP
                        </Button>
                    </div>
                </div>

                {/* Bảng dữ liệu */}
                <div className="max-w-full overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 text-sm">
                        <thead className="bg-gray-50">
                        <tr>
                            <th className="px-5 py-3 text-start">STT</th>
                            <th className="px-5 py-3 text-start">Tên Lớp học phần</th>
                            <th className="px-5 py-3 text-start">Môn học</th>
                            <th className="px-5 py-3 text-start">Lớp SV</th>
                            <th className="px-5 py-3 text-start">Học kỳ</th>
                            <th className="px-5 py-3 text-start">Giảng viên</th>
                            <th className="px-5 py-3 text-center">Thao tác</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                        {filtered.map((cc, idx) => (
                            <tr key={cc.id}>
                                <td className="px-5 py-4 text-start">{idx + 1}</td>
                                <td className="px-4 py-3 text-start font-medium text-gray-900">{cc.name}</td>
                                <td className="px-4 py-3 text-start">{getDepName(cc.subject_id, subjects)}</td>
                                <td className="px-4 py-3 text-start">{getDepName(cc.class_id, studentClasses)}</td>
                                <td className="px-4 py-3 text-start">{getDepName(cc.semester_id, semesters)}</td>
                                <td className="px-4 py-3 text-start">{getDepName(cc.teacher_id, teachers)}</td>
                                <td className="px-4 py-3 text-center">
                                    <Button size="sm" variant="outline" className="mr-2" onClick={() => handleEditOpen(cc)}>Sửa</Button>
                                    <Button size="sm" variant="danger" onClick={() => handleDelete(cc.id)}>Xóa</Button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal Thêm mới */}
            <Modal isOpen={isAddOpen} onClose={handleAddClose} className="max-w-lg w-full mx-auto bg-white/98 shadow-2xl">
                <div className="p-6">
                    <h2 className="text-xl font-bold mb-4">Thêm Lớp học phần</h2>
                    <form onSubmit={addForm.handleSubmit(onSubmitAdd)}>
                        {renderFormBody(addForm)}
                        <div className="flex justify-end gap-3 pt-6">
                            <Button type="button" variant="outline" onClick={handleAddClose}>Hủy</Button>
                            <Button type="submit" variant="primary" disabled={addForm.formState.isSubmitting}>
                                {addForm.formState.isSubmitting ? 'Đang lưu...' : 'Lưu'}
                            </Button>
                        </div>
                    </form>
                </div>
            </Modal>

            {/* Modal Chỉnh sửa */}
            <Modal isOpen={isEditOpen} onClose={handleEditClose} className="max-w-lg w-full mx-auto bg-white/98 shadow-2xl">
                <div className="p-6">
                    <h2 className="text-xl font-bold mb-4">Sửa Lớp học phần</h2>
                    <form onSubmit={editForm.handleSubmit(onSubmitEdit)}>
                        {renderFormBody(editForm)}
                        <div className="flex justify-end gap-3 pt-6">
                            <Button type="button" variant="outline" onClick={handleEditClose}>Hủy</Button>
                            <Button type="submit" variant="primary" disabled={editForm.formState.isSubmitting}>
                                {editForm.formState.isSubmitting ? 'Đang lưu...' : 'Lưu thay đổi'}
                            </Button>
                        </div>
                    </form>
                </div>
            </Modal>
        </>
    );
}