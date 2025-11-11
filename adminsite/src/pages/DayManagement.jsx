import React, { useEffect, useState } from 'react';
import PageMeta from '../components/common/PageMeta.jsx';
import Button from '../components/ui/button/Button.jsx';
import Modal from '../components/ui/modal/index.jsx';

// Thư viện validate
import * as yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';


import {
  getAllDays,
  createDay,
  updateDay,
  deleteDay,
} from '../services/dayService.js';


// 🧩 Schema validate cho Ngày học (Day)
const daySchema = yup.object({
    name: yup
        .string()
        .trim()
        .required('Tên ngày không được để trống')
        .max(50, 'Tên ngày không được vượt quá 50 ký tự'),
    idx: yup
        .number()
        .typeError('Thứ tự phải là một con số') // Hiển thị khi nhập chữ
        .required('Vui lòng nhập thứ tự')
        .min(0, 'Thứ tự phải lớn hơn hoặc bằng 0')
        .integer('Thứ tự phải là số nguyên'),
});

export default function DayManagement() {
    const [days, setDays] = useState([]);
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [editDay, setEditDay] = useState(null);
    const [search, setSearch] = useState('');

    // -------------------------------------------------
    // Tích hợp React Hook Form
    // -------------------------------------------------

    // Form cho Thêm mới
    const addForm = useForm({
        resolver: yupResolver(daySchema),
        defaultValues: {
            name: '',
            idx: 0,
        },
    });

    // Form cho Chỉnh sửa
    const editForm = useForm({
        resolver: yupResolver(daySchema),
        defaultValues: {
            name: '',
            idx: 0,
        },
    });

    // -------------------------------------------------
    // Load dữ liệu
    // -------------------------------------------------

    useEffect(() => {
        fetchList();
    }, []);

    const fetchList = async () => {
        try {
            const data = await getAllDays();
            setDays(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Failed to load days', err);
        }
    };

    // -------------------------------------------------
    // Xử lý Modal
    // -------------------------------------------------

    const handleAddOpen = () => {
        addForm.reset({ name: '', idx: (days.length > 0 ? Math.max(...days.map(d => d.idx)) + 1 : 0) }); // Gợi ý idx tiếp theo
        setIsAddOpen(true);
    };
    const handleAddClose = () => setIsAddOpen(false);

    const handleEditOpen = (d) => {
        setEditDay(d);
        editForm.reset({ // Nạp dữ liệu của ngày đang sửa vào form
            name: d.name || '',
            idx: d.idx ?? 0, // Dùng ?? 0 vì idx có thể là 0 (falsy)
        });
        setIsEditOpen(true);
    };
    const handleEditClose = () => {
        setEditDay(null);
        setIsEditOpen(false);
    };

    // -------------------------------------------------
    // Xử lý CRUD
    // -------------------------------------------------

    /**
     * Hiển thị lỗi từ backend (nếu có) lên form
     * @param {object} formInstance - instance của useForm (addForm hoặc editForm)
     * @param {Error} err - Lỗi bắt được từ try...catch
     */
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

    // Xử lý Submit form Thêm mới
    const onSubmitAdd = async (data) => {
        try {
            // Đảm bảo idx là số nguyên trước khi gửi
            await createDay({ ...data, idx: parseInt(data.idx, 10) });
            setIsAddOpen(false);
            fetchList();
        } catch (err) {
            console.error('Failed to create day', err);
            handleBackendErrors(addForm, err);
        }
    };

    // Xử lý Submit form Cập nhật
    const onSubmitEdit = async (data) => {
        try {
            await updateDay(editDay.id, { ...data, idx: parseInt(data.idx, 10) });
            setIsEditOpen(false);
            fetchList();
        } catch (err) {
            console.error('Update failed:', err);
            handleBackendErrors(editForm, err);
        }
    };

    // Xử lý Xóa
    const handleDelete = async (id) => {
        if (!window.confirm('Bạn có chắc muốn xóa ngày này?')) return;
        try {
            await deleteDay(id);
            fetchList();
        } catch (err) {
            console.error('Delete failed:', err);
            alert(err?.response?.data?.message || 'Lỗi khi xóa ngày');
        }
    };

    // -------------------------------------------------
    // Lọc và Render
    // -------------------------------------------------

    const filtered = days.filter(d => {
        const q = (search || '').toLowerCase();
        return (d.name || '').toLowerCase().includes(q);
    });

    return (
        <>
            <PageMeta title="Quản lý ngày học" description="Trang quản lý danh sách các ngày học trong tuần." />

            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white p-4">
                <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-3">
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Tìm theo tên ngày..."
                            className="border rounded px-3 py-2"
                        />
                        <Button size="sm" variant="outline" onClick={fetchList}>
                            Làm mới
                        </Button>
                    </div>
                    <Button size="md" variant="primary" onClick={handleAddOpen}>
                        Thêm ngày
                    </Button>
                </div>

                {/* Bảng dữ liệu */}
                <div className="max-w-full overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                        <tr>
                            <th className="px-5 py-3 text-start">STT</th>
                            <th className="px-5 py-3 text-start">Tên ngày</th>
                            <th className="px-5 py-3 text-start">Thứ tự (idx)</th>
                            <th className="px-5 py-3 text-center">Thao tác</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                        {filtered.map((d, idx) => (
                            <tr key={d.id}>
                                <td className="px-5 py-4 text-start">{idx + 1}</td>
                                <td className="px-4 py-3 text-start">{d.name}</td>
                                <td className="px-4 py-3 text-start">{d.idx}</td>
                                <td className="px-4 py-3 text-center">
                                    <Button size="sm" variant="outline" className="mr-2" onClick={() => handleEditOpen(d)}>Sửa</Button>
                                    <Button size="sm" variant="danger" onClick={() => handleDelete(d.id)}>Xóa</Button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal Thêm mới */}
            <Modal isOpen={isAddOpen} onClose={handleAddClose} className="max-w-md w-full mx-auto bg-white/98 shadow-2xl">
                <div className="p-6">
                    <h2 className="text-xl font-bold mb-4">Thêm ngày</h2>
                    <form onSubmit={addForm.handleSubmit(onSubmitAdd)} className="space-y-4">
                        <div>
                            <label className="block mb-1 text-sm">Tên ngày</label>
                            <input
                                {...addForm.register('name')}
                                className={`w-full border rounded px-3 py-2 ${addForm.formState.errors.name ? 'border-red-500' : ''}`}
                                placeholder="Ví dụ: Thứ Hai"
                            />
                            {addForm.formState.errors.name && (
                                <p className="text-red-500 text-sm mt-1">{addForm.formState.errors.name.message}</p>
                            )}
                        </div>
                        <div>
                            <label className="block mb-1 text-sm">Thứ tự (idx)</label>
                            <input
                                type="number"
                                {...addForm.register('idx')}
                                className={`w-full border rounded px-3 py-2 ${addForm.formState.errors.idx ? 'border-red-500' : ''}`}
                                placeholder="Ví dụ: 0 (cho Thứ Hai)"
                            />
                            {addForm.formState.errors.idx && (
                                <p className="text-red-500 text-sm mt-1">{addForm.formState.errors.idx.message}</p>
                            )}
                        </div>

                        {/* Lỗi chung từ server */}
                        {addForm.formState.errors.root?.serverError && (
                            <div className="text-sm text-red-500">{addForm.formState.errors.root.serverError.message}</div>
                        )}

                        <div className="flex justify-end gap-3 pt-4">
                            <Button type="button" variant="outline" onClick={handleAddClose}>Hủy</Button>
                            <Button type="submit" variant="primary" disabled={addForm.formState.isSubmitting}>
                                {addForm.formState.isSubmitting ? 'Đang lưu...' : 'Lưu'}
                            </Button>
                        </div>
                    </form>
                </div>
            </Modal>

            {/* Modal Chỉnh sửa */}
            <Modal isOpen={isEditOpen} onClose={handleEditClose} className="max-w-md w-full mx-auto bg-white/98 shadow-2xl">
                <div className="p-6">
                    <h2 className="text-xl font-bold mb-4">Sửa ngày</h2>
                    <form onSubmit={editForm.handleSubmit(onSubmitEdit)} className="space-y-4">
                        <div>
                            <label className="block mb-1 text-sm">Tên ngày</label>
                            <input
                                {...editForm.register('name')}
                                className={`w-full border rounded px-3 py-2 ${editForm.formState.errors.name ? 'border-red-500' : ''}`}
                            />
                            {editForm.formState.errors.name && (
                                <p className="text-red-500 text-sm mt-1">{editForm.formState.errors.name.message}</p>
                            )}
                        </div>
                        <div>
                            <label className="block mb-1 text-sm">Thứ tự (idx)</label>
                            <input
                                type="number"
                                {...editForm.register('idx')}
                                className={`w-full border rounded px-3 py-2 ${editForm.formState.errors.idx ? 'border-red-500' : ''}`}
                            />
                            {editForm.formState.errors.idx && (
                                <p className="text-red-500 text-sm mt-1">{editForm.formState.errors.idx.message}</p>
                            )}
                        </div>

                        {/* Lỗi chung từ server */}
                        {editForm.formState.errors.root?.serverError && (
                            <div className="text-sm text-red-500">{editForm.formState.errors.root.serverError.message}</div>
                        )}

                        <div className="flex justify-end gap-3 pt-4">
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