import React, { useEffect, useState } from 'react';
import PageMeta from '../components/common/PageMeta.jsx';
import Button from '../components/ui/button/Button.jsx';
import Modal from '../components/ui/modal/index.jsx';

// Thư viện validate
import * as yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

// ----------------------------------------------------------------
// ⚠️ GIẢ LẬP API SERVICE - Bạn hãy thay thế bằng file service thật
// ----------------------------------------------------------------
import {
  getAllTimeSlots,
  createTimeSlot,
  updateTimeSlot,
  deleteTimeSlot,
} from '../services/timeSlotService.js';

/**
 * Helper: Định dạng giờ và phút thành chuỗi HH:mm
 * @param {number} h - Giờ
 * @param {number} m - Phút
 * @returns {string} - Chuỗi "HH:mm"
 */
const formatTime = (h, m) => {
    const hh = String(h ?? 0).padStart(2, '0');
    const mm = String(m ?? 0).padStart(2, '0');
    return `${hh}:${mm}`;
};

/**
 * Helper: Đảm bảo các trường số được gửi đi là kiểu number
 */
const parseNumericFields = (data) => ({
    idx: parseInt(data.idx, 10),
    start_hour: parseInt(data.start_hour, 10),
    start_min: parseInt(data.start_min, 10),
    end_hour: parseInt(data.end_hour, 10),
    end_min: parseInt(data.end_min, 10),
    is_break: !!data.is_break, // Chuyển đổi thành boolean
});

// 🧩 Schema validate cho Kíp học (Timeslot)
const timeSlotSchema = yup.object({
    name: yup
        .string()
        .trim()
        .required('Tên kíp học không được để trống')
        .max(100, 'Tên kíp học không được vượt quá 100 ký tự'),
    idx: yup
        .number()
        .typeError('Thứ tự phải là một con số')
        .required('Vui lòng nhập thứ tự')
        .min(0, 'Thứ tự phải lớn hơn hoặc bằng 0')
        .integer('Thứ tự phải là số nguyên'),
    start_hour: yup
        .number()
        .typeError('Giờ bắt đầu phải là số')
        .required('Vui lòng nhập giờ bắt đầu')
        .min(0, 'Giờ không hợp lệ')
        .max(23, 'Giờ không hợp lệ'),
    start_min: yup
        .number()
        .typeError('Phút bắt đầu phải là số')
        .required('Vui lòng nhập phút bắt đầu')
        .min(0, 'Phút không hợp lệ')
        .max(59, 'Phút không hợp lệ'),
    end_hour: yup
        .number()
        .typeError('Giờ kết thúc phải là số')
        .required('Vui lòng nhập giờ kết thúc')
        .min(0, 'Giờ không hợp lệ')
        .max(23, 'Giờ không hợp lệ'),
    end_min: yup
        .number()
        .typeError('Phút kết thúc phải là số')
        .required('Vui lòng nhập phút kết thúc')
        .min(0, 'Phút không hợp lệ')
        .max(59, 'Phút không hợp lệ'),
    is_break: yup.boolean().default(false),
}).test('time-order', 'Thời gian kết thúc phải sau thời gian bắt đầu', (value) => {
    // Validate ở mức object để truy cập được tất cả các trường
    const { start_hour, start_min, end_hour, end_min } = value;
    // Bỏ qua nếu bất kỳ trường nào không phải là số (đã bị chặn bởi các validate ở trên)
    if (
        typeof start_hour !== 'number' || typeof start_min !== 'number' ||
        typeof end_hour !== 'number' || typeof end_min !== 'number'
    ) {
        return true;
    }

    const startTimeInMinutes = start_hour * 60 + start_min;
    const endTimeInMinutes = end_hour * 60 + end_min;

    return endTimeInMinutes > startTimeInMinutes;
});

export default function TimeslotManagement() {
    const [timeSlots, setTimeslots] = useState([]);
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [editTimeslot, setEditTimeslot] = useState(null);
    const [search, setSearch] = useState('');

    // -------------------------------------------------
    // Tích hợp React Hook Form
    // -------------------------------------------------

    // Form cho Thêm mới
    const addForm = useForm({
        resolver: yupResolver(timeSlotSchema),
        defaultValues: {
            name: '',
            idx: 0,
            start_hour: 7,
            start_min: 0,
            end_hour: 8,
            end_min: 50,
            is_break: false,
        },
    });

    // Form cho Chỉnh sửa
    const editForm = useForm({
        resolver: yupResolver(timeSlotSchema),
        defaultValues: {
            name: '',
            idx: 0,
            start_hour: 0,
            start_min: 0,
            end_hour: 0,
            end_min: 0,
            is_break: false,
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
            const data = await getAllTimeSlots();
            setTimeslots(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Failed to load timeSlots', err);
        }
    };

    // -------------------------------------------------
    // Xử lý Modal
    // -------------------------------------------------

    const handleAddOpen = () => {
        addForm.reset({
            name: '',
            idx: (timeSlots.length > 0 ? Math.max(...timeSlots.map(t => t.idx)) + 1 : 0),
            start_hour: 7,
            start_min: 0,
            end_hour: 8,
            end_min: 50,
            is_break: false,
        }); // Gợi ý idx tiếp theo
        setIsAddOpen(true);
    };
    const handleAddClose = () => setIsAddOpen(false);

    const handleEditOpen = (t) => {
        setEditTimeslot(t);
        editForm.reset({ // Nạp dữ liệu của kíp học đang sửa vào form
            name: t.name || '',
            idx: t.idx ?? 0,
            start_hour: t.start_hour ?? 0,
            start_min: t.start_min ?? 0,
            end_hour: t.end_hour ?? 0,
            end_min: t.end_min ?? 0,
            is_break: !!t.is_break,
        });
        setIsEditOpen(true);
    };
    const handleEditClose = () => {
        setEditTimeslot(null);
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

    // Xử lý Submit form Thêm mới
    const onSubmitAdd = async (data) => {
        try {
            const dataToSave = parseNumericFields(data);
            await createTimeSlot({ ...data, ...dataToSave }); // Giữ lại name (string) và ghi đè các trường số
            setIsAddOpen(false);
            fetchList();
        } catch (err) {
            console.error('Failed to create timeSlot', err);
            handleBackendErrors(addForm, err);
        }
    };

    // Xử lý Submit form Cập nhật
    const onSubmitEdit = async (data) => {
        try {
            const dataToSave = parseNumericFields(data);
            await updateTimeSlot(editTimeslot.id, { ...data, ...dataToSave });
            setIsEditOpen(false);
            fetchList();
        } catch (err) {
            console.error('Update failed:', err);
            handleBackendErrors(editForm, err);
        }
    };

    // Xử lý Xóa
    const handleDelete = async (id) => {
        if (!window.confirm('Bạn có chắc muốn xóa kíp học này?')) return;
        try {
            await deleteTimeSlot(id);
            fetchList();
        } catch (err) {
            console.error('Delete failed:', err);
            alert(err?.response?.data?.message || 'Lỗi khi xóa kíp học');
        }
    };

    // -------------------------------------------------
    // Lọc và Render
    // -------------------------------------------------

    const filtered = timeSlots.filter(t => {
        const q = (search || '').toLowerCase();
        return (t.name || '').toLowerCase().includes(q);
    });

    /**
     * Helper component để render trường input trong form
     */
    const FormInput = ({ name, label, form, type = 'text', placeholder = '' }) => {
        const error = form.formState.errors[name];
        return (
            <div>
                <label className="block mb-1 text-sm">{label}</label>
                <input
                    type={type}
                    {...form.register(name)}
                    className={`w-full border rounded px-3 py-2 ${error ? 'border-red-500' : ''}`}
                    placeholder={placeholder}
                />
                {error && (
                    <p className="text-red-500 text-sm mt-1">{error.message}</p>
                )}
            </div>
        );
    };

    /**
     * Render form body cho cả Add và Edit modal
     */
    const renderFormBody = (formInstance) => {
        // Lấy lỗi validate của cả object (nếu có)
        const timeOrderError = formInstance.formState.errors['']?.message;

        return (
            <div className="space-y-4">
                <FormInput name="name" label="Tên kíp học" form={formInstance} placeholder="Ví dụ: Kíp 1 (Sáng)" />
                <FormInput name="idx" label="Thứ tự (idx)" type="number" form={formInstance} placeholder="Ví dụ: 0" />

                <div className="grid grid-cols-2 gap-4">
                    <FormInput name="start_hour" label="Giờ bắt đầu" type="number" form={formInstance} />
                    <FormInput name="start_min" label="Phút bắt đầu" type="number" form={formInstance} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <FormInput name="end_hour" label="Giờ kết thúc" type="number" form={formInstance} />
                    <FormInput name="end_min" label="Phút kết thúc" type="number" form={formInstance} />
                </div>

                {/* Hiển thị lỗi so sánh thời gian */}
                {timeOrderError && (
                    <p className="text-red-500 text-sm -mt-2">{timeOrderError}</p>
                )}

                <div className="flex items-center gap-3 pt-2">
                    <input
                        id={formInstance === addForm ? 'is_break_add' : 'is_break_edit'}
                        type="checkbox"
                        {...formInstance.register('is_break')}
                        className="h-4 w-4"
                    />
                    <label htmlFor={formInstance === addForm ? 'is_break_add' : 'is_break_edit'} className="text-sm">Là kíp nghỉ (giải lao, nghỉ trưa...)</label>
                </div>

                {/* Lỗi chung từ server */}
                {formInstance.formState.errors.root?.serverError && (
                    <div className="text-sm text-red-500">{formInstance.formState.errors.root.serverError.message}</div>
                )}
            </div>
        );
    };

    return (
        <>
            <PageMeta title="Quản lý kíp học" description="Trang quản lý danh sách kíp học (ca học) trong hệ thống." />

            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white p-4">
                <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-3">
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Tìm theo tên kíp học..."
                            className="border rounded px-3 py-2"
                        />
                        <Button size="sm" variant="outline" onClick={fetchList}>
                            Làm mới
                        </Button>
                    </div>
                    <Button size="md" variant="primary" onClick={handleAddOpen}>
                        Thêm kíp học
                    </Button>
                </div>

                {/* Bảng dữ liệu */}
                <div className="max-w-full overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                        <tr>
                            <th className="px-5 py-3 text-start">STT</th>
                            <th className="px-5 py-3 text-start">Tên kíp học</th>
                            <th className="px-5 py-3 text-start">Thứ tự (idx)</th>
                            <th className="px-5 py-3 text-start">Bắt đầu</th>
                            <th className="px-5 py-3 text-start">Kết thúc</th>
                            <th className="px-5 py-3 text-start">Loại kíp</th>
                            <th className="px-5 py-3 text-center">Thao tác</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                        {filtered.map((t, idx) => (
                            <tr key={t.id}>
                                <td className="px-5 py-4 text-start">{idx + 1}</td>
                                <td className="px-4 py-3 text-start">{t.name}</td>
                                <td className="px-4 py-3 text-start">{t.idx}</td>
                                <td className="px-4 py-3 text-start">{formatTime(t.start_hour, t.start_min)}</td>
                                <td className="px-4 py-3 text-start">{formatTime(t.end_hour, t.end_min)}</td>
                                <td className="px-4 py-3 text-start">
                                    {t.is_break ?
                                        (<span className="text-xs font-medium bg-gray-100 text-gray-600 px-2 py-1 rounded-full">Nghỉ</span>) :
                                        (<span className="text-xs font-medium bg-blue-100 text-blue-700 px-2 py-1 rounded-full">Học</span>)
                                    }
                                </td>
                                <td className="px-4 py-3 text-center">
                                    <Button size="sm" variant="outline" className="mr-2" onClick={() => handleEditOpen(t)}>Sửa</Button>
                                    <Button size="sm" variant="danger" onClick={() => handleDelete(t.id)}>Xóa</Button>
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
                    <h2 className="text-xl font-bold mb-4">Thêm kíp học</h2>
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
            <Modal isOpen={isEditOpen} onClose={handleEditClose} className="max-w-md w-full mx-auto bg-white/98 shadow-2xl">
                <div className="p-6">
                    <h2 className="text-xl font-bold mb-4">Sửa kíp học</h2>
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