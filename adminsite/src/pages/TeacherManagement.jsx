import React, {useState, useEffect} from "react";
import PageMeta from "../components/common/PageMeta.jsx";
import Button from "../components/ui/button/Button.jsx";
import Modal from "../components/ui/modal/index.jsx";
import {useForm} from 'react-hook-form';
import {yupResolver} from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {showSuccess, showError} from '../utils/ToastUtils.js'; // 👈 import helper (use correct casing)
import {getAllFaculties} from '../services/facultyService.js';
import {
    getAllTeachers,
    createTeacher,
    updateTeacher,
    deleteTeacher,
    bulkImportTeachers
} from '../services/teacherService.js';
import {bulkImportStudents, getAllStudents} from "../services/studentService.js";
import DataImportModal from "../components/common/DataImportModal.jsx";

export default function TeacherManagement() {
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [editTeacher, setEditTeacher] = useState(null);
    const [faculties, setFaculties] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [search, setSearch] = useState('');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editStudent, setEditStudent] = useState(null);
    const [isImportOpen, setIsImportOpen] = useState(false);
    const [importErrors, setImportErrors] = useState([]);

    const importMapping = {
        'Mã giảng viên': 'teacher_identifier',  // Key quan trọng để check trùng
        'Họ và tên': 'name',
        'Mã Khoa': 'faculty_code',              // Excel nhập Mã -> Backend map sang ID
        'Học hàm/Học vị': 'academic_title',     // Vd: Thạc sĩ, Tiến sĩ...
        'Ngày sinh': 'date_of_birth',
        'Giới tính': 'gender',
        'Email trường': 'email_school',
        'Email cá nhân': 'email_personal',
        'Số điện thoại': 'phone',
        'Địa chỉ': 'address',
        'CCCD/CMND': 'id_number'
    };
    const fetchList = async () => {
        try {
            const data = await getAllTeachers();
            setTeachers(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Failed to load classes', err);
        }
    };

    const handleImportData = async (data) => {
        setImportErrors([]);
        try {
            // Gọi API
            await bulkImportTeachers(data);

            // Thành công
            setIsImportOpen(false);
            fetchList();
            showSuccess(`Đã thêm ${data.length} lớp học thành công!`);
        } catch (err) {
            console.error("Import failed", err);
            const res = err?.response?.data;

            // Xử lý lỗi 422 (Validation)
            if (res?.errors && Array.isArray(res.errors)) {
                setImportErrors(res.errors); // Hiển thị list lỗi trong Modal
            } else {
                // Lỗi khác hiển thị Toast
                showError(res?.error || res?.message || 'Lỗi import lớp học');
            }
        }
    };
    const handleOpenImport = () => {
        setImportErrors([]);
        setIsImportOpen(true);
    };

    // react-hook-form for add/edit (same pattern as students)
    const {register, handleSubmit, reset, watch, setValue, setError, formState: {errors}} = useForm({
        resolver: yupResolver(schema),
        defaultValues: {
            name: '',
            teacher_identifier: '',
            faculty_id: '',
            academic_title: '',
            email_school: '',
            phone: '',
            date_of_birth: '',
            gender: '',
            status: 'active',
            id_number: '',
            ethnicity: '',
            religion: '',
            place_of_birth: '',
            nationality: 'Việt Nam',
            address: '',
        }
    });

    // auto-generate email from identifier
    const watchedIdentifier = watch('teacher_identifier');
    useEffect(() => {
        const id = watchedIdentifier || '';
        if (id) setValue('email_school', `${String(id).toLowerCase()}@teacher.example.edu.vn`);
        else setValue('email_school', '');
    }, [watchedIdentifier, setValue]);

    // clear form when opening add
    const emptyDefaults = {
        name: '',
        teacher_identifier: '',
        faculty_id: '',
        academic_title: '',
        email_school: '',
        phone: '',
        date_of_birth: '',
        gender: '',
        status: 'active',
        id_number: '',
        ethnicity: '',
        religion: '',
        place_of_birth: '',
        nationality: 'Việt Nam',
        address: '',
    };

    const openAdd = () => {
        // explicitly reset to known empty defaults and clear any server errors
        reset(emptyDefaults);
        setServerErrors([]);
        setIsAddOpen(true);
    };

    const closeAdd = () => {
        setIsAddOpen(false);
        setServerErrors([]);
        // also reset form to empty to avoid values showing when reopened
        reset(emptyDefaults);
    };

    const handleBackendErrors = (err) => {
        const data = err?.response?.data || {};
        const errorsArr = data.errors;
        if (Array.isArray(errorsArr) && errorsArr.length > 0) {
            errorsArr.forEach((it) => {
                if (!it) return;
                const field = it.path || it.param || it.field || it.fieldName || it.key;
                const msg = it.msg || it.message || it.error || String(it);
                setError(String(field), {type: 'server', message: msg});
            });
            setError('error', {type: 'server', message: 'Validation failed'});
            return;
        }
        const message = data.message || data.error || err?.message || 'Lỗi từ server';
        setError('root.serverError', {type: 'server', message});
    };

    const handleEditOpen = (teacher) => {
        setEditTeacher(teacher);
        // populate form with teacher values
        reset({
            name: teacher.name || '',
            teacher_identifier: teacher.teacher_identifier || '',
            faculty_id: teacher.faculty_id || '',
            academic_title: teacher.academic_title || teacher.hoc_ham || '',
            email_school: teacher.email_school || (teacher.teacher_identifier ? `${String(teacher.teacher_identifier).toLowerCase()}@teacher.example.edu.vn` : ''),
            phone: teacher.phone || '',
            date_of_birth: teacher.date_of_birth || '',
            gender: teacher.gender || '',
            status: teacher.status || 'active',
            id_number: teacher.id_number || '',
            ethnicity: teacher.ethnicity || '',
            religion: teacher.religion || '',
            place_of_birth: teacher.place_of_birth || '',
            nationality: teacher.nationality || 'Việt Nam',
            address: teacher.address || '',
        });
        setIsEditOpen(true);
    };
    const handleEditClose = () => {
        setEditTeacher(null);
        setIsEditOpen(false);
        // clear form values after closing edit to avoid leaking into Add modal
        reset(emptyDefaults);
        setServerErrors([]);
    };
    const [serverErrors, setServerErrors] = useState([]);

    useEffect(() => {
        fetchFaculties();
    }, []);

    useEffect(() => {
        fetchTeachers();
    }, []);

    // listen for global creation events so other places using AddTeacherModal without
    // providing a callback still trigger a refresh
    useEffect(() => {
        const handler = () => {
            fetchTeachers();
        };
        window.addEventListener('teachers:created', handler);
        return () => window.removeEventListener('teachers:created', handler);
    }, []);

    const fetchTeachers = async () => {
        try {
            const data = await getAllTeachers();
            setTeachers(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Failed to load teachers', err);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Bạn có chắc muốn xóa giáo viên này?')) return;
        try {
            await deleteTeacher(id);
            fetchTeachers();
        } catch (err) {
            console.error(err);
        }
    };

    const fetchFaculties = async () => {
        try {
            const data = await getAllFaculties();
            setFaculties(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Failed to load faculties', err);
        }
    };

    // Search filter
    const filtered = teachers.filter(teacher =>
        (teacher.name || '').toLowerCase().includes(search.toLowerCase()) ||
        (teacher.teacher_identifier || '').toLowerCase().includes(search.toLowerCase())
    );

    return (
        <>
            <PageMeta title="Quản lý giáo viên" description="Trang quản lý danh sách giáo viên trong hệ thống."/>
            <div
                className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/5 dark:bg-white/3">
                <div className="flex justify-between items-center p-4">
                    <div className="flex items-center gap-3">
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Tìm theo tên hoặc mã giáo viên"
                            className="border rounded px-3 py-2"
                        />
                        <Button size="sm" variant="outline" onClick={() => fetchTeachers()}>Làm mới</Button>
                    </div>
                    {/*<div>*/}
                    {/*  <Button*/}
                    {/*      size="sm"*/}
                    {/*      className="!px-6 !py-2 font-semibold bg-blue-600 hover:bg-blue-700"*/}
                    {/*  >*/}
                    {/*    Import Excel*/}
                    {/*  </Button>*/}
                    {/*  <Button size="md" variant="primary" className="px-6 py-2 font-semibold bg-purple-600 hover:bg-purple-700" onClick={openAdd}>*/}
                    {/*    Thêm giáo viên*/}
                    {/*  </Button>*/}
                    {/*</div>*/}
                    <div className="flex items-center gap-3">
                        <Button
                            size="sm"
                            className="!px-6 !py-2 font-semibold bg-blue-600 hover:bg-blue-700"
                            onClick={handleOpenImport}
                        >
                            Import Excel
                        </Button>

                        <Button size="md" variant="primary"
                                className="!px-6 !py-2 font-semibold bg-green-600 hover:bg-green-700"
                                onClick={openAdd}>
                            Thêm giảng viên
                        </Button>
                    </div>
                </div>
                <div className="max-w-full overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                        <tr>
                            <th className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">STT</th>
                            <th className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Tên
                                giáo
                                viên
                            </th>
                            <th className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Mã
                                giáo viên
                            </th>
                            <th className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Khoa</th>
                            <th className="px-5 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400">Thao
                                tác
                            </th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                        {filtered.map((teacher, idx) => (
                            <tr key={teacher.id}>
                                <td className="px-5 py-4 sm:px-6 text-start">{idx + 1}</td>
                                <td className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">{teacher.name}</td>
                                <td className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">{teacher.teacher_identifier}</td>
                                <td className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">{(faculties.find(f => String(f.id) === String(teacher.faculty_id)) || {}).name || teacher.faculty_id}</td>
                                <td className="px-4 py-3 text-center">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="mr-2 font-semibold bg-yellow-400 hover:bg-yellow-500 text-white"
                                        onClick={() => handleEditOpen(teacher)}
                                    >
                                        Sửa
                                    </Button>
                                    <Button size="sm" variant="primary"
                                            className="bg-red-600 hover:bg-red-700 font-semibold"
                                            onClick={() => handleDelete(teacher.id)}>
                                        Xóa
                                    </Button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal Thêm giáo viên */}
            <Modal isOpen={isAddOpen} onClose={closeAdd} className="max-w-lg w-full mx-auto bg-white/98 shadow-2xl">
                <div className="p-8 bg-white rounded-xl shadow-lg">
                    <h2 className="text-2xl font-bold mb-6 text-center text-purple-700">Thêm giáo viên</h2>
                    <form className="space-y-5" onSubmit={handleSubmit(async (data) => {
                        setServerErrors([]);
                        try {
                            await createTeacher(data);
                            showSuccess('Tạo giáo viên thành công');
                            closeAdd(); // Đóng modal trước
                            await fetchTeachers(); // Đảm bảo luôn refresh dữ liệu mới nhất
                            reset();
                        } catch (err) {
                            console.error(err);
                            showError(err.response?.data?.message || 'Lỗi khi tạo giáo viên');
                            // map backend validation errors to form fields
                            handleBackendErrors(err);
                            if (err.response?.data?.errors) setServerErrors(err.response.data.errors);
                        }
                    })}>
                        <div>
                            <label className="block mb-2 text-sm font-semibold text-gray-700">Tên giáo viên</label>
                            <input {...register('name')}
                                   className="w-full border border-purple-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400 transition"
                                   type="text" placeholder="Nhập tên giáo viên"/>
                            <p className="text-red-500 text-sm">{errors.name?.message}</p>
                        </div>
                        <div>
                            <label className="block mb-2 text-sm font-semibold text-gray-700">Mã giáo viên</label>
                            <input {...register('teacher_identifier')}
                                   className="w-full border border-purple-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400 transition"
                                   type="text" placeholder="Nhập mã giáo viên"/>
                            <p className="text-red-500 text-sm">{errors.teacher_identifier?.message}</p>
                        </div>
                        <div>
                            <label className="block mb-2 text-sm font-semibold text-gray-700">Khoa</label>
                            <select {...register('faculty_id')}
                                    className="w-full border border-purple-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400 transition">
                                <option value="">-- Chọn khoa --</option>
                                {faculties.map(f => (<option key={f.id} value={f.id}>{f.name || f.id}</option>))}
                            </select>
                            <p className="text-red-500 text-sm">{errors.faculty_id?.message}</p>
                        </div>
                        <div>
                            <label className="block mb-2 text-sm font-semibold text-gray-700">Academic title</label>
                            <input {...register('academic_title')}
                                   className="w-full border border-purple-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400 transition"
                                   type="text" placeholder="e.g. Associate Professor"/>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block mb-2 text-sm font-semibold text-gray-700">Ngày sinh</label>
                                <input {...register('date_of_birth')} type="date"
                                       className="w-full border border-purple-300 rounded-lg px-3 py-2"/>
                            </div>
                            <div>
                                <label className="block mb-2 text-sm font-semibold text-gray-700">Giới tính</label>
                                <select {...register('gender')}
                                        className="w-full border border-purple-300 rounded-lg px-3 py-2">
                                    <option value="">-- Chọn --</option>
                                    <option value="male">Nam</option>
                                    <option value="female">Nữ</option>
                                    <option value="other">Khác</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block mb-2 text-sm font-semibold text-gray-700">Số CMND/CCCD</label>
                                <input {...register('id_number')}
                                       className="w-full border border-purple-300 rounded-lg px-4 py-2"
                                       placeholder="Số CMND/CCCD"/>
                            </div>
                            <div>
                                <label className="block mb-2 text-sm font-semibold text-gray-700">Dân tộc</label>
                                <input {...register('ethnicity')}
                                       className="w-full border border-purple-300 rounded-lg px-4 py-2"
                                       placeholder="Dân tộc"/>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block mb-2 text-sm font-semibold text-gray-700">Tôn giáo</label>
                                <input {...register('religion')}
                                       className="w-full border border-purple-300 rounded-lg px-4 py-2"
                                       placeholder="Tôn giáo"/>
                            </div>
                            <div>
                                <label className="block mb-2 text-sm font-semibold text-gray-700">Nơi sinh</label>
                                <input {...register('place_of_birth')}
                                       className="w-full border border-purple-300 rounded-lg px-4 py-2"
                                       placeholder="Nơi sinh"/>
                            </div>
                        </div>

                        <div>
                            <label className="block mb-2 text-sm font-semibold text-gray-700">Quốc tịch</label>
                            <input {...register('nationality')}
                                   className="w-full border border-purple-300 rounded-lg px-4 py-2"
                                   placeholder="Quốc tịch"/>
                        </div>

                        <div>
                            <label className="block mb-2 text-sm font-semibold text-gray-700">Địa chỉ</label>
                            <textarea {...register('address')}
                                      className="w-full border border-purple-300 rounded-lg px-4 py-2" rows={3}
                                      placeholder="Địa chỉ liên hệ"/>
                        </div>
                        <div>
                            <label className="block mb-2 text-sm font-semibold text-gray-700">Email trường</label>
                            <input {...register('email_school')} readOnly
                                   className="w-full border border-purple-300 rounded-lg px-4 py-2 bg-gray-50"
                                   type="email" placeholder="Email trường (tự sinh từ mã giáo viên)"/>
                            <p className="text-xs text-gray-500 mt-1">Được tạo tự động từ Mã giáo viên; không thể chỉnh
                                sửa.</p>
                        </div>
                        <div>
                            <label className="block mb-2 text-sm font-semibold text-gray-700">Số điện thoại</label>
                            <input {...register('phone')}
                                   className="w-full border border-purple-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400 transition"
                                   type="text" placeholder="Số điện thoại"/>
                        </div>
                        <div className="flex justify-end mt-6 gap-3">
                            <Button type="submit" size="md" variant="primary"
                                    className="bg-purple-600 hover:bg-purple-700 font-semibold px-6 py-2 rounded-lg shadow">
                                Lưu
                            </Button>
                            <Button type="button" size="md" variant="outline"
                                    className="font-semibold px-6 py-2 rounded-lg shadow" onClick={closeAdd}>
                                Hủy
                            </Button>
                        </div>

                        {serverErrors.length > 0 && (
                            <div className="bg-red-50 border border-red-300 text-red-700 p-3 rounded">
                                {serverErrors.map((err, idx) => (
                                    <p key={idx}>⚠️ {err.field || err.path || err.param || 'error'}: {err.message || err.msg || JSON.stringify(err)}</p>
                                ))}
                            </div>
                        )}
                    </form>
                </div>
            </Modal>
            {/* Modal Sửa giáo viên */}
            <Modal isOpen={isEditOpen} onClose={handleEditClose}
                   className="max-w-lg w-full mx-auto bg-white/98 shadow-2xl">
                <div className="p-8 bg-white rounded-xl shadow-lg">
                    <h2 className="text-2xl font-bold mb-6 text-center text-yellow-700">Sửa thông tin giáo viên</h2>
                    <form className="space-y-5" onSubmit={handleSubmit(async (data) => {
                        try {
                            await updateTeacher(editTeacher.id, data);
                            showSuccess('Cập nhật giáo viên thành công');
                            handleEditClose();
                            fetchTeachers();
                        } catch (err) {
                            console.error(err);
                            showError(err.response?.data?.message || 'Lỗi khi cập nhật giáo viên');
                            // map backend validation errors to form fields
                            handleBackendErrors(err);
                            if (err.response?.data?.errors) setServerErrors(err.response.data.errors);
                        }
                    })}>
                        <div>
                            <label className="block mb-2 text-sm font-semibold text-gray-700">Tên giáo viên</label>
                            <input {...register('name')}
                                   className="w-full border border-yellow-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition"
                                   type="text"/>
                            <p className="text-red-500 text-sm">{errors.name?.message}</p>
                        </div>

                        <div>
                            <label className="block mb-2 text-sm font-semibold text-gray-700">Mã giáo viên</label>
                            <input {...register('teacher_identifier')}
                                   className="w-full border border-yellow-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition"
                                   type="text"/>
                            <p className="text-red-500 text-sm">{errors.teacher_identifier?.message}</p>
                        </div>

                        <div>
                            <label className="block mb-2 text-sm font-semibold text-gray-700">Khoa</label>
                            <select {...register('faculty_id')}
                                    className="w-full border border-yellow-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition">
                                <option value="">-- Chọn khoa --</option>
                                {faculties.map(f => (<option key={f.id} value={f.id}>{f.name || f.id}</option>))}
                            </select>
                            <p className="text-red-500 text-sm">{errors.faculty_id?.message}</p>
                        </div>

                        <div>
                            <label className="block mb-2 text-sm font-semibold text-gray-700">Academic title</label>
                            <input {...register('academic_title')}
                                   className="w-full border border-yellow-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition"
                                   type="text" placeholder="e.g. Associate Professor"/>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block mb-2 text-sm font-semibold text-gray-700">Ngày sinh</label>
                                <input {...register('date_of_birth')} type="date"
                                       className="w-full border border-yellow-300 rounded-lg px-3 py-2"/>
                            </div>
                            <div>
                                <label className="block mb-2 text-sm font-semibold text-gray-700">Giới tính</label>
                                <select {...register('gender')}
                                        className="w-full border border-yellow-300 rounded-lg px-3 py-2">
                                    <option value="">-- Chọn --</option>
                                    <option value="male">Nam</option>
                                    <option value="female">Nữ</option>
                                    <option value="other">Khác</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block mb-2 text-sm font-semibold text-gray-700">Số CMND/CCCD</label>
                                <input {...register('id_number')}
                                       className="w-full border border-yellow-300 rounded-lg px-4 py-2"
                                       placeholder="Số CMND/CCCD"/>
                            </div>
                            <div>
                                <label className="block mb-2 text-sm font-semibold text-gray-700">Dân tộc</label>
                                <input {...register('ethnicity')}
                                       className="w-full border border-yellow-300 rounded-lg px-4 py-2"
                                       placeholder="Dân tộc"/>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block mb-2 text-sm font-semibold text-gray-700">Tôn giáo</label>
                                <input {...register('religion')}
                                       className="w-full border border-yellow-300 rounded-lg px-4 py-2"
                                       placeholder="Tôn giáo"/>
                            </div>
                            <div>
                                <label className="block mb-2 text-sm font-semibold text-gray-700">Nơi sinh</label>
                                <input {...register('place_of_birth')}
                                       className="w-full border border-yellow-300 rounded-lg px-4 py-2"
                                       placeholder="Nơi sinh"/>
                            </div>
                        </div>

                        <div>
                            <label className="block mb-2 text-sm font-semibold text-gray-700">Quốc tịch</label>
                            <input {...register('nationality')}
                                   className="w-full border border-yellow-300 rounded-lg px-4 py-2"
                                   placeholder="Quốc tịch"/>
                        </div>

                        <div>
                            <label className="block mb-2 text-sm font-semibold text-gray-700">Địa chỉ</label>
                            <textarea {...register('address')}
                                      className="w-full border border-yellow-300 rounded-lg px-4 py-2" rows={3}
                                      placeholder="Địa chỉ liên hệ"/>
                        </div>

                        <div>
                            <label className="block mb-2 text-sm font-semibold text-gray-700">Email trường</label>
                            <input {...register('email_school')} readOnly
                                   className="w-full border border-yellow-300 rounded-lg px-4 py-2 bg-gray-50"
                                   type="email"/>
                            <p className="text-xs text-gray-500 mt-1">Được tạo tự động từ Mã giáo viên; không thể chỉnh
                                sửa.</p>
                        </div>

                        <div>
                            <label className="block mb-2 text-sm font-semibold text-gray-700">Số điện thoại</label>
                            <input {...register('phone')}
                                   className="w-full border border-yellow-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition"
                                   type="text" placeholder="Số điện thoại"/>
                        </div>

                        <div className="flex justify-end mt-6 gap-3">
                            <Button type="submit" size="md" variant="primary"
                                    className="bg-yellow-500 hover:bg-yellow-600 font-semibold px-6 py-2 rounded-lg shadow">
                                Lưu
                            </Button>
                            <Button type="button" size="md" variant="outline"
                                    className="font-semibold px-6 py-2 rounded-lg shadow" onClick={handleEditClose}>
                                Hủy
                            </Button>
                        </div>

                        {serverErrors.length > 0 && (
                            <div className="bg-red-50 border border-red-300 text-red-700 p-3 rounded">
                                {serverErrors.map((err, idx) => (
                                    <p key={idx}>⚠️ {err.field || err.path || err.param || 'error'}: {err.message || err.msg || JSON.stringify(err)}</p>
                                ))}
                            </div>
                        )}
                    </form>
                </div>
            </Modal>
            <DataImportModal
                isOpen={isImportOpen}
                onClose={() => setIsImportOpen(false)}
                onImport={handleImportData}
                title="Import Lớp Học"
                templateName={"teacher_import_template.xlsx"}
                columnMapping={importMapping} // Map cột Excel
                errors={importErrors}         // Truyền lỗi vào
            />
        </>
    );
}


const schema = yup.object({
    name: yup
        .string()
        .required('Tên giáo viên không được để trống')
        .min(2, 'Tên giáo viên phải có ít nhất 2 ký tự')
        .max(255, 'Tên giáo viên không được vượt quá 255 ký tự'),
    teacher_identifier: yup
        .string()
        .required('Mã giáo viên không được để trống')
        .matches(/^[A-Za-z0-9_-]+$/, 'Mã giáo viên chỉ được chứa chữ, số, dấu gạch ngang hoặc gạch dưới')
        .max(50, 'Mã giáo viên không được vượt quá 50 ký tự'),
    faculty_id: yup.string().required('Vui lòng chọn khoa'),
});

export function AddTeacherModal({isAddOpen, handleAddClose, onCreated}) {
    const [serverErrors, setServerErrors] = useState([]);

    const {
        register,
        handleSubmit,
        formState: {errors},
        reset,
    } = useForm({resolver: yupResolver(schema)});

    const onSubmit = async (data) => {
        try {
            // use the shared service so base URL / auth is consistent
            await createTeacher(data);
            // success feedback
            showSuccess && showSuccess('Tạo giáo viên thành công');
            reset();
            // close modal if parent provided the handler
            if (typeof handleAddClose === 'function') handleAddClose();
            // notify parent via callback
            if (typeof onCreated === 'function') onCreated();
            // dispatch a global event so callers that didn't pass onCreated still refresh
            try {
                window.dispatchEvent(new CustomEvent('teachers:created'));
            } catch { /* ignore */
            }
        } catch (err) {
            // Prefer structured backend validation errors
            if (err.response?.data?.errors) {
                setServerErrors(err.response.data.errors);
            } else {
                // fallback to toast/alert
                showError && showError(err.response?.data?.message || 'Có lỗi xảy ra');
            }
        }
    };

    return (
        <Modal isOpen={isAddOpen} onClose={handleAddClose}
               className="max-w-lg w-full mx-auto bg-white shadow-lg rounded-lg">
            <div className="p-6">
                <h2 className="text-xl font-semibold text-center mb-4">Thêm giáo viên</h2>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Tên giáo viên</label>
                        <input {...register('name')} className="w-full border rounded px-3 py-2 mt-1"/>
                        <p className="text-red-500 text-sm">{errors.name?.message}</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Mã giáo viên</label>
                        <input {...register('teacher_identifier')} className="w-full border rounded px-3 py-2 mt-1"/>
                        <p className="text-red-500 text-sm">{errors.teacher_identifier?.message}</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Khoa</label>
                        <input {...register('faculty_id')} className="w-full border rounded px-3 py-2 mt-1"/>
                        <p className="text-red-500 text-sm">{errors.faculty_id?.message}</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">SĐT</label>
                        <input {...register('phone')} className="w-full border rounded px-3 py-2 mt-1"/>
                        <p className="text-red-500 text-sm">{errors.phone?.message}</p>
                    </div>

                    {/* Hiển thị lỗi từ backend */}
                    {serverErrors.length > 0 && (
                        <div className="bg-red-50 border border-red-300 text-red-700 p-3 rounded">
                            {serverErrors.map((err, idx) => (
                                <p key={idx}>⚠️ {err.field || err.path || err.param || 'error'}: {err.message || err.msg || JSON.stringify(err)}</p>
                            ))}
                        </div>
                    )}

                    <div className="flex justify-end gap-3 mt-6">
                        <button type="submit"
                                className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700">Lưu
                        </button>
                        <button type="button" onClick={() => {
                            if (typeof handleAddClose === 'function') handleAddClose();
                        }} className="border border-gray-400 px-4 py-2 rounded">Hủy
                        </button>
                    </div>
                </form>
            </div>
        </Modal>
    );
}
