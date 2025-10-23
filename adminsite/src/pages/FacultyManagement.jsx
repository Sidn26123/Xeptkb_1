import React, { useEffect, useState } from 'react';
import PageMeta from '../components/common/PageMeta.jsx';
import Button from '../components/ui/button/Button.jsx';
import Modal from '../components/ui/modal/index.jsx';
import { getAllFaculties, createFaculty, updateFaculty, deleteFaculty } from '../services/facultyService.js';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
import {showError, showSuccess} from "../utils/toastUtils.js";

const facultySchema = yup.object({
  name: yup
      .string()
      .trim()
      .required('Tên khoa không được để trống')
      .min(3, 'Tên khoa phải có ít nhất 3 ký tự')
      .max(255, 'Tên khoa không được vượt quá 255 ký tự'),
  faculty_id: yup
      .string()
      .trim()
      .required('Mã khoa không được để trống')
      .matches(/^[A-Za-z0-9_-]+$/, 'Mã khoa chỉ được chứa chữ, số, gạch dưới hoặc gạch ngang'),
});

export default function FacultyManagement() {
  const [faculties, setFaculties] = useState([]);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editFaculty, setEditFaculty] = useState(null);
  const [search, setSearch] = useState('');

  // Form cho Add
  const addForm = useForm({
    resolver: yupResolver(facultySchema),
    defaultValues: { name: '', faculty_id: '' }
  });

  // Form cho Edit
  const editForm = useForm({
    resolver: yupResolver(facultySchema),
    defaultValues: { name: '', faculty_id: '' }
  });

  useEffect(() => {
    fetchList();
  }, []);

  const fetchList = async () => {
    try {
      const data = await getAllFaculties();
      setFaculties(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load faculties', err);
    }
  };

  const handleAddOpen = () => {
    addForm.reset({ name: '', faculty_id: '' });
    addForm.clearErrors();
    setIsAddOpen(true);
  };

  const handleAddClose = () => {
    setIsAddOpen(false);
    addForm.reset();
    addForm.clearErrors();
  };

  const handleEditOpen = (f) => {
    setEditFaculty(f);
    editForm.reset({
      name: f.name || '',
      faculty_id: f.faculty_id || '',
    });
    editForm.clearErrors();
    setIsEditOpen(true);
  };

  const handleEditClose = () => {
    setEditFaculty(null);
    setIsEditOpen(false);
    editForm.reset();
    editForm.clearErrors();
  };

  // Hàm xử lý lỗi backend và map vào form
  const handleBackendErrors = (err, formInstance) => {
    const errors = err?.response?.data?.errors;

    if (Array.isArray(errors)) {
      // Map lỗi backend vào từng field
      errors.forEach((error) => {
        if (error.field) {
          formInstance.setError(error.field, {
            type: 'server',
            message: error.message
          });
        }
      });
    } else {
      // Lỗi chung không có field cụ thể
      const message = err?.response?.data?.message || err.message;
      formInstance.setError('root.serverError', {
        type: 'server',
        message: message
      });
    }
  };

  const handleCreate = async (data) => {
    try {
      await createFaculty(data);
      setIsAddOpen(false);
      addForm.reset();
      showSuccess('Thêm khoa thành công');
      fetchList();
    } catch (err) {
      showError('Lỗi khi thêm khoa');
      handleBackendErrors(err, addForm);
    }
  };

  const handleUpdate = async (data) => {
    try {
      await updateFaculty(editFaculty.id, data);
      setIsEditOpen(false);
        showSuccess('Cập nhật khoa thành công');
      editForm.reset();
      fetchList();
    } catch (err) {
        showError('Lỗi khi cập nhật khoa');
      handleBackendErrors(err, editForm);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa khoa này?')) return;
    try {
      await deleteFaculty(id);
      fetchList();
    } catch (err) {
      console.error('Delete failed', err);
      alert(err?.response?.data?.message || 'Lỗi khi xóa khoa');
    }
  };

  const filtered = faculties.filter(
      (f) =>
          (f.name || '').toLowerCase().includes(search.toLowerCase()) ||
          (f.faculty_id || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
      <>
        <PageMeta title="Quản lý khoa" description="Quản lý danh sách các khoa" />
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white p-4">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-3">
              <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Tìm theo tên hoặc mã khoa"
                  className="border rounded px-3 py-2"
              />
              <Button size="sm" variant="outline" onClick={fetchList}>
                Làm mới
              </Button>
            </div>
            <div>
              <Button size="md" variant="primary" onClick={handleAddOpen}>
                Thêm khoa
              </Button>
            </div>
          </div>

          <div className="max-w-full overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
              <tr>
                <th className="px-5 py-3 text-start">STT</th>
                <th className="px-5 py-3 text-start">Tên khoa</th>
                <th className="px-5 py-3 text-start">Mã khoa</th>
                <th className="px-5 py-3 text-center">Hành động</th>
              </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
              {filtered.map((f, idx) => (
                  <tr key={f.id}>
                    <td className="px-5 py-4 text-start">{idx + 1}</td>
                    <td className="px-4 py-3 text-start">{f.name}</td>
                    <td className="px-4 py-3 text-start">{f.faculty_id}</td>
                    <td className="px-4 py-3 text-center">
                      <Button
                          size="sm"
                          variant="outline"
                          className="mr-2"
                          onClick={() => handleEditOpen(f)}
                      >
                        Sửa
                      </Button>
                      <Button
                          size="sm"
                          variant="danger"
                          onClick={() => handleDelete(f.id)}
                      >
                        Xóa
                      </Button>
                    </td>
                  </tr>
              ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal thêm */}
        <Modal
            isOpen={isAddOpen}
            onClose={handleAddClose}
            className="max-w-lg w-full mx-auto bg-white/98 shadow-2xl"
        >
          <div className="p-6">
            <h2 className="text-xl font-bold mb-4">Thêm khoa</h2>
            <form onSubmit={addForm.handleSubmit(handleCreate)} className="space-y-4">
              <div>
                <label className="block mb-1 text-sm font-medium">Tên khoa</label>
                <input
                    {...addForm.register('name')}
                    className="w-full border rounded px-3 py-2"
                    placeholder="Nhập tên khoa"
                />
                {addForm.formState.errors.name && (
                    <p className="text-red-500 text-sm mt-1">
                      {addForm.formState.errors.name.message}
                    </p>
                )}
              </div>

              <div>
                <label className="block mb-1 text-sm font-medium">Mã khoa</label>
                <input
                    {...addForm.register('faculty_id')}
                    className="w-full border rounded px-3 py-2"
                    placeholder="Nhập mã khoa"
                />
                {addForm.formState.errors.faculty_id && (
                    <p className="text-red-500 text-sm mt-1">
                      {addForm.formState.errors.faculty_id.message}
                    </p>
                )}
              </div>

              {/* Lỗi chung từ server (không thuộc field cụ thể) */}
              {addForm.formState.errors.root?.serverError && (
                  <div className="bg-red-50 border border-red-300 text-red-700 p-3 rounded">
                    {addForm.formState.errors.root.serverError.message}
                  </div>
              )}

              <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={handleAddClose}>
                  Hủy
                </Button>
                <Button type="submit" variant="primary">
                  Lưu
                </Button>
              </div>
            </form>
          </div>
        </Modal>

        {/* Modal sửa */}
        <Modal
            isOpen={isEditOpen}
            onClose={handleEditClose}
            className="max-w-lg w-full mx-auto bg-white/98 shadow-2xl"
        >
          <div className="p-6">
            <h2 className="text-xl font-bold mb-4">Sửa khoa</h2>
            <form onSubmit={editForm.handleSubmit(handleUpdate)} className="space-y-4">
              <div>
                <label className="block mb-1 text-sm font-medium">Tên khoa</label>
                <input
                    {...editForm.register('name')}
                    className="w-full border rounded px-3 py-2"
                    placeholder="Nhập tên khoa"
                />
                {editForm.formState.errors.name && (
                    <p className="text-red-500 text-sm mt-1">
                      {editForm.formState.errors.name.message}
                    </p>
                )}
              </div>

              <div>
                <label className="block mb-1 text-sm font-medium">Mã khoa</label>
                <input
                    {...editForm.register('faculty_id')}
                    className="w-full border rounded px-3 py-2"
                    placeholder="Nhập mã khoa"
                />
                {editForm.formState.errors.faculty_id && (
                    <p className="text-red-500 text-sm mt-1">
                      {editForm.formState.errors.faculty_id.message}
                    </p>
                )}
              </div>

              {editForm.formState.errors.root?.serverError && (
                  <div className="bg-red-50 border border-red-300 text-red-700 p-3 rounded">
                    {editForm.formState.errors.root.serverError.message}
                  </div>
              )}

              <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={handleEditClose}>
                  Hủy
                </Button>
                <Button type="submit" variant="primary">
                  Lưu
                </Button>
              </div>
            </form>
          </div>
        </Modal>
      </>
  );
}