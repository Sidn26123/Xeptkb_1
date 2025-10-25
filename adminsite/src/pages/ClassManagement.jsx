// import { useState } from "react";
// import Button from "../components/ui/button/Button.jsx";
// import Modal from "../components/ui/modal/index.jsx";
//
// import PageMeta from "../components/common/PageMeta.jsx";
// import { useEffect } from 'react';
// import { getAllClasses, createClass, updateClass, deleteClass } from '../services/classService.js';
// import { getAllTrainingTypes, createTrainingType, updateTrainingType } from '../services/trainingTypeService.js';
//
// export default function ClassManagement() {
//   const [classes, setClasses] = useState([]);
//   const [trainingTypes, setTrainingTypes] = useState([]);
//   const [selectedCategory, setSelectedCategory] = useState('all');
//   const [isTTModalOpen, setIsTTModalOpen] = useState(false);
//   const [editingTT, setEditingTT] = useState(null);
//   const [ttForm, setTtForm] = useState({ name: '', code: '', description: '' });
//   const [isAddOpen, setIsAddOpen] = useState(false);
//   const [isEditOpen, setIsEditOpen] = useState(false);
//   const [editClass, setEditClass] = useState(null);
//   const [form, setForm] = useState({ name: '', training_type_id: '', faculty_id: '' });
//   const [errors, setErrors] = useState(null);
//
//   const handleAddOpen = () => setIsAddOpen(true);
//   const handleAddClose = () => setIsAddOpen(false);
//
//   useEffect(() => { fetchList(); fetchTrainingTypes(); }, []);
//
//   const fetchList = async () => {
//     try {
//       const data = await getAllClasses();
//       setClasses(Array.isArray(data) ? data : []);
//     } catch (err) { console.error('Failed to load classes', err); }
//   };
//
//   const fetchTrainingTypes = async () => {
//     try {
//       const data = await getAllTrainingTypes();
//       setTrainingTypes(Array.isArray(data) ? data : []);
//     } catch (err) { console.error('Failed to load training types', err); }
//   };
//
//   const handleEditOpen = (cls) => {
//     setEditClass(cls);
//     setIsEditOpen(true);
//   };
//   const handleEditClose = () => {
//     setEditClass(null);
//     setIsEditOpen(false);
//   };
//
//   const handleCategoryChange = (id) => {
//     setSelectedCategory(id);
//   };
//
//   const openAddTT = () => { setEditingTT(null); setTtForm({ name: '', code: '', description: ''}); setIsTTModalOpen(true); };
//
//   const handleSaveTT = async (e) => {
//     e.preventDefault();
//     try {
//       if (editingTT) {
//         await updateTrainingType(editingTT.id, ttForm);
//       } else {
//         await createTrainingType(ttForm);
//       }
//       setIsTTModalOpen(false);
//       fetchTrainingTypes();
//     } catch (err) { console.error(err); }
//   };
//
//   // Note: training type edit/delete controls were removed from the UI.
//
//   return (
//     <>
//       <PageMeta title="Quản lý lớp học" description="Trang quản lý danh sách các lớp học trong hệ thống." />
//       <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
//         <div className="mb-6 overflow-x-auto p-4">
//           <div className="flex flex-wrap gap-2">
//             <Button
//               onClick={() => handleCategoryChange('all')}
//               size="sm"
//               variant={selectedCategory === 'all' ? 'primary' : 'outline'}
//             >
//               Tất cả
//             </Button>
//             {trainingTypes && trainingTypes.length > 0 && trainingTypes.map((tt) => (
//               <Button
//                 key={tt.id}
//                 onClick={() => handleCategoryChange(tt.id)}
//                 size="sm"
//                 variant={selectedCategory === tt.id ? 'primary' : 'outline'}
//               >
//                 {tt.name}
//               </Button>
//             ))}
//           </div>
//         </div>
//         {/* TrainingType modal */}
//         <Modal isOpen={isTTModalOpen} onClose={() => setIsTTModalOpen(false)} className="max-w-md w-full mx-auto bg-white/98 shadow-2xl">
//           <div className="p-6">
//             <h2 className="text-xl font-bold mb-4">{editingTT ? 'Sửa loại đào tạo' : 'Thêm loại đào tạo'}</h2>
//             <form onSubmit={handleSaveTT} className="space-y-4">
//               <div>
//                 <label className="block mb-1 text-sm">Tên</label>
//                 <input className="w-full border rounded px-3 py-2" value={ttForm.name} onChange={(e) => setTtForm({ ...ttForm, name: e.target.value })} required />
//               </div>
//               <div>
//                 <label className="block mb-1 text-sm">Mã</label>
//                 <input className="w-full border rounded px-3 py-2" value={ttForm.code} onChange={(e) => setTtForm({ ...ttForm, code: e.target.value })} required />
//               </div>
//               <div>
//                 <label className="block mb-1 text-sm">Mô tả</label>
//                 <textarea className="w-full border rounded px-3 py-2" value={ttForm.description} onChange={(e) => setTtForm({ ...ttForm, description: e.target.value })} />
//               </div>
//               <div className="flex justify-end gap-3">
//                 <Button type="button" variant="outline" onClick={() => setIsTTModalOpen(false)}>Hủy</Button>
//                 <Button type="submit" variant="primary">Lưu</Button>
//               </div>
//             </form>
//           </div>
//         </Modal>
//         <div className="flex justify-end items-center gap-3 p-4">
//           <Button size="md" variant="primary" className="!px-6 !py-2 font-semibold bg-blue-600 hover:bg-blue-700" onClick={handleAddOpen}>
//             Thêm lớp học
//           </Button>
//           <Button size="md" variant="secondary" className="!px-6 !py-2 font-semibold bg-gray-200 hover:bg-gray-300" onClick={openAddTT}>
//             Thêm loại đào tạo
//           </Button>
//         </div>
//         <div className="max-w-full overflow-x-auto">
//           <table className="min-w-full divide-y divide-gray-200">
//             <thead className="bg-gray-50">
//               <tr>
//                 <th className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">STT</th>
//                 <th className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Tên lớp</th>
//                 <th className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Loại hình đào tạo</th>
//                 <th className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Khoa</th>
//                 <th className="px-5 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400">Thao tác</th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
//   {classes.map((cls, idx) => (
//                 <tr key={cls.id}>
//                   <td className="px-5 py-4 sm:px-6 text-start">{idx + 1}</td>
//                   <td className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">{cls.name}</td>
//                   <td className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">{(trainingTypes.find(t => String(t.id) === String(cls.training_type_id)) || {}).name || cls.training_type_id}</td>
//                   <td className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">{cls.faculty_id}</td>
//                   <td className="px-4 py-3 text-center">
//                     <Button size="sm" variant="outline" className="mr-2" onClick={() => { setForm({ name: cls.name, training_type_id: cls.training_type_id, faculty_id: cls.faculty_id }); handleEditOpen(cls); }}>Sửa</Button>
//                     <Button size="sm" variant="danger" onClick={() => { if(window.confirm('Bạn có chắc muốn xóa lớp này?')) { deleteClass(cls.id).then(() => fetchList()).catch(e => console.error(e)); } }}>Xóa</Button>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       </div>
//
//       {/* Modal Thêm lớp học */}
//       <Modal isOpen={isAddOpen} onClose={handleAddClose} className="max-w-lg w-full mx-auto bg-white/98 shadow-2xl">
//         <div className="p-8 bg-gradient-to-br from-white via-gray-50 to-gray-100 rounded-xl shadow-lg">
//           <h2 className="text-2xl font-bold mb-6 text-center text-blue-700">Thêm lớp học</h2>
//           <form className="space-y-5" onSubmit={async (e) => { e.preventDefault(); setErrors(null); try { await createClass(form); setIsAddOpen(false); fetchList(); } catch (err) { console.error(err); setErrors(err?.response?.data || err?.message); } }}>
//             <div>
//               <label className="block mb-2 text-sm font-semibold text-gray-700">Tên lớp</label>
//               <input className="w-full border border-blue-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition" type="text" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} placeholder="Nhập tên lớp" required />
//             </div>
//             <div>
//               <label className="block mb-2 text-sm font-semibold text-gray-700">Loại hình đào tạo</label>
//               <select
//                 className="w-full border border-blue-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
//                 value={form.training_type_id || ''}
//                 onChange={(e) => setForm({ ...form, training_type_id: e.target.value })}
//                 required
//               >
//                 <option value="">-- Chọn loại hình đào tạo --</option>
//                 {trainingTypes && trainingTypes.map((tt) => (
//                   <option key={tt.id} value={tt.id}>{tt.name}</option>
//                 ))}
//               </select>
//             </div>
//             <div>
//               <label className="block mb-2 text-sm font-semibold text-gray-700">Khoa</label>
//               <input className="w-full border border-blue-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition" type="text" value={form.faculty_id} onChange={(e) => setForm({...form, faculty_id: e.target.value})} placeholder="Nhập khoa" required />
//             </div>
//             {errors && <div className="text-sm text-red-500">{typeof errors === 'string' ? errors : JSON.stringify(errors)}</div>}
//             <div className="flex justify-end mt-6 gap-3">
//               <Button size="md" variant="primary" className="bg-blue-600 hover:bg-blue-700 font-semibold px-6 py-2 rounded-lg shadow" type="submit">Lưu</Button>
//               <Button size="md" variant="outline" className="font-semibold px-6 py-2 rounded-lg shadow" onClick={handleAddClose}>Hủy</Button>
//             </div>
//           </form>
//         </div>
//       </Modal>
//
//       {/* Modal Sửa lớp học */}
//       <Modal isOpen={isEditOpen} onClose={handleEditClose} className="max-w-lg w-full mx-auto bg-white/98 shadow-2xl">
//         <div className="p-8 bg-gradient-to-br from-white via-gray-50 to-gray-100 rounded-xl shadow-lg">
//           <h2 className="text-2xl font-bold mb-6 text-center text-yellow-700">Sửa thông tin lớp học</h2>
//           <form className="space-y-5" onSubmit={async (e) => { e.preventDefault(); setErrors(null); try { await updateClass(editClass.id, form); setIsEditOpen(false); fetchList(); } catch (err) { console.error(err); setErrors(err?.response?.data || err?.message); } }}>
//             <div>
//               <label className="block mb-2 text-sm font-semibold text-gray-700">Tên lớp</label>
//               <input className="w-full border border-yellow-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition" type="text" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} required />
//             </div>
//             <div>
//               <label className="block mb-2 text-sm font-semibold text-gray-700">Loại hình đào tạo</label>
//               <select
//                 className="w-full border border-yellow-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition"
//                 value={form.training_type_id || ''}
//                 onChange={(e) => setForm({ ...form, training_type_id: e.target.value })}
//                 required
//               >
//                 <option value="">-- Chọn loại hình đào tạo --</option>
//                 {trainingTypes && trainingTypes.map((tt) => (
//                   <option key={tt.id} value={tt.id}>{tt.name}</option>
//                 ))}
//               </select>
//             </div>
//             <div>
//               <label className="block mb-2 text-sm font-semibold text-gray-700">Khoa</label>
//               <input className="w-full border border-yellow-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition" type="text" value={form.faculty_id} onChange={(e) => setForm({...form, faculty_id: e.target.value})} required />
//             </div>
//             {errors && <div className="text-sm text-red-500">{typeof errors === 'string' ? errors : JSON.stringify(errors)}</div>}
//             <div className="flex justify-end mt-6 gap-3">
//               <Button size="md" variant="primary" className="bg-yellow-500 hover:bg-yellow-600 font-semibold px-6 py-2 rounded-lg shadow" type="submit">Lưu</Button>
//               <Button size="md" variant="outline" className="font-semibold px-6 py-2 rounded-lg shadow" onClick={handleEditClose}>Hủy</Button>
//             </div>
//           </form>
//         </div>
//       </Modal>
//     </>
//   );
// }


import React, { useEffect, useState } from 'react';
import PageMeta from '../components/common/PageMeta.jsx';
import Button from '../components/ui/button/Button.jsx';
import Modal from '../components/ui/modal/index.jsx';
import { getAllClasses, createClass, updateClass, deleteClass } from '../services/classService.js';
import { getAllTrainingTypes, createTrainingType, updateTrainingType } from '../services/trainingTypeService.js';

// Imports cho validate
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
import {showError, showSuccess} from "../utils/ToastUtils.js";

// Schema cho Lớp học
const classSchema = yup.object({
  name: yup
      .string()
      .trim()
      .required('Tên lớp không được để trống')
      .min(3, 'Tên lớp phải có ít nhất 3 ký tự')
      .max(255, 'Tên lớp không được vượt quá 255 ký tự'),
  training_type_id: yup
      .string()
      .required('Vui lòng chọn loại hình đào tạo'),
  faculty_id: yup
      .string()
      .trim()
      .required('Khoa không được để trống')
      .max(100, 'Khoa không được vượt quá 100 ký tự'),
});

// Schema cho Loại đào tạo
const trainingTypeSchema = yup.object({
  name: yup
      .string()
      .trim()
      .required('Tên không được để trống')
      .min(3, 'Tên phải có ít nhất 3 ký tự')
      .max(255, 'Tên không được vượt quá 255 ký tự'),
  code: yup
      .string()
      .trim()
      .required('Mã không được để trống')
      .matches(/^[A-Za-z0-9_-]+$/, 'Mã chỉ được chứa chữ, số, gạch dưới hoặc gạch ngang'),
  description: yup.string().trim().optional(),
});


export default function ClassManagement() {
  const [classes, setClasses] = useState([]);
  const [trainingTypes, setTrainingTypes] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isTTModalOpen, setIsTTModalOpen] = useState(false);
  const [editingTT, setEditingTT] = useState(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editClass, setEditClass] = useState(null);

  // Form cho Thêm Lớp
  const classAddForm = useForm({
    resolver: yupResolver(classSchema),
    defaultValues: { name: '', training_type_id: '', faculty_id: '' }
  });

  // Form cho Sửa Lớp
  const classEditForm = useForm({
    resolver: yupResolver(classSchema),
    defaultValues: { name: '', training_type_id: '', faculty_id: '' }
  });

  // Form cho Loại Đào Tạo (TT)
  const ttFormInstance = useForm({
    resolver: yupResolver(trainingTypeSchema),
    defaultValues: { name: '', code: '', description: '' }
  });

  useEffect(() => {
    fetchList();
    fetchTrainingTypes();
  }, []);

  const fetchList = async () => {
    try {
      const data = await getAllClasses();
      setClasses(Array.isArray(data) ? data : []);
    } catch (err) { console.error('Failed to load classes', err); }
  };

  const fetchTrainingTypes = async () => {
    try {
      const data = await getAllTrainingTypes();
      setTrainingTypes(Array.isArray(data) ? data : []);
    } catch (err) { console.error('Failed to load training types', err); }
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

  // --- Handlers cho Lớp Học ---

  const handleAddOpen = () => {
    classAddForm.reset({ name: '', training_type_id: '', faculty_id: '' });
    classAddForm.clearErrors();
    setIsAddOpen(true);
  };
  const handleAddClose = () => {
    setIsAddOpen(false);
    classAddForm.reset();
  };

  const handleEditOpen = (cls) => {
    setEditClass(cls);
    classEditForm.reset({
      name: cls.name || '',
      training_type_id: cls.training_type_id || '',
      faculty_id: cls.faculty_id || '',
    });
    classEditForm.clearErrors();
    setIsEditOpen(true);
  };
  const handleEditClose = () => {
    setEditClass(null);
    setIsEditOpen(false);
    classEditForm.reset();
  };

  const handleCreateClass = async (data) => {
    try {
      await createClass(data);
      handleAddClose();
      showSuccess('Thêm lớp học thành công.');
      fetchList();
    } catch (err) {
      // console.error('Create failed:', err);
      showError('Thêm lớp học thất bại.');
      handleBackendErrors(err, classAddForm);
    }
  };

  const handleUpdateClass = async (data) => {
    try {
      await updateClass(editClass.id, data);
      handleEditClose();
      showSuccess('Cập nhật lớp học thành công.');
      fetchList();
    } catch (err) {
      showError('Cập nhật lớp học thất bại.');
      handleBackendErrors(err, classEditForm);
    }
  };

  const handleDeleteClass = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa lớp này?')) return;
    try {
      await deleteClass(id);
      fetchList();
    } catch (err) {
      console.error('Delete failed', err);
      alert(err?.response?.data?.message || 'Lỗi khi xóa lớp');
    }
  };


  // --- Handlers cho Loại Đào Tạo (TT) ---

  const handleCategoryChange = (id) => {
    setSelectedCategory(id);
  };

  const openAddTT = () => {
    setEditingTT(null);
    ttFormInstance.reset({ name: '', code: '', description: '' });
    ttFormInstance.clearErrors();
    setIsTTModalOpen(true);
  };

  // Note: Mặc dù UI không có nút Sửa TT, logic vẫn hỗ trợ
  const openEditTT = (tt) => {
    setEditingTT(tt);
    ttFormInstance.reset({
      name: tt.name || '',
      code: tt.code || '',
      description: tt.description || ''
    });
    ttFormInstance.clearErrors();
    setIsTTModalOpen(true);
  };

  const closeTTModal = () => {
    setIsTTModalOpen(false);
    setEditingTT(null);
    ttFormInstance.reset();
  };

  const handleSaveTTSubmit = async (data) => {
    try {
      if (editingTT) {
        await updateTrainingType(editingTT.id, data);
      } else {
        await createTrainingType(data);
      }
      closeTTModal();
      fetchTrainingTypes();
    } catch (err) {
      console.error('Save TT failed:', err);
      handleBackendErrors(err, ttFormInstance);
    }
  };

  // Lọc danh sách lớp học
  const filteredClasses = classes.filter(
      (cls) =>
          selectedCategory === 'all' ||
          String(cls.training_type_id) === String(selectedCategory)
  );

  return (
      <>
        <PageMeta title="Quản lý lớp học" description="Trang quản lý danh sách các lớp học trong hệ thống." />
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
          <div className="mb-6 overflow-x-auto p-4">
            <div className="flex flex-wrap gap-2">
              <Button
                  onClick={() => handleCategoryChange('all')}
                  size="sm"
                  variant={selectedCategory === 'all' ? 'primary' : 'outline'}
              >
                Tất cả
              </Button>
              {trainingTypes && trainingTypes.length > 0 && trainingTypes.map((tt) => (
                  <Button
                      key={tt.id}
                      onClick={() => handleCategoryChange(tt.id)}
                      size="sm"
                      variant={selectedCategory === tt.id ? 'primary' : 'outline'}
                  >
                    {tt.name}
                  </Button>
              ))}
            </div>
          </div>

          {/* TrainingType modal */}
          <Modal isOpen={isTTModalOpen} onClose={closeTTModal} className="max-w-md w-full mx-auto bg-white/98 shadow-2xl">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">{editingTT ? 'Sửa loại đào tạo' : 'Thêm loại đào tạo'}</h2>
              <form onSubmit={ttFormInstance.handleSubmit(handleSaveTTSubmit)} className="space-y-4">
                <div>
                  <label className="block mb-1 text-sm">Tên</label>
                  <input
                      {...ttFormInstance.register('name')}
                      className="w-full border rounded px-3 py-2"
                      required
                  />
                  {ttFormInstance.formState.errors.name && (
                      <p className="text-red-500 text-sm mt-1">
                        {ttFormInstance.formState.errors.name.message}
                      </p>
                  )}
                </div>
                <div>
                  <label className="block mb-1 text-sm">Mã</label>
                  <input
                      {...ttFormInstance.register('code')}
                      className="w-full border rounded px-3 py-2"
                      required
                  />
                  {ttFormInstance.formState.errors.code && (
                      <p className="text-red-500 text-sm mt-1">
                        {ttFormInstance.formState.errors.code.message}
                      </p>
                  )}
                </div>
                <div>
                  <label className="block mb-1 text-sm">Mô tả</label>
                  <textarea
                      {...ttFormInstance.register('description')}
                      className="w-full border rounded px-3 py-2"
                  />
                </div>

                {ttFormInstance.formState.errors.root?.serverError && (
                    <div className="bg-red-50 border border-red-300 text-red-700 p-3 rounded">
                      {ttFormInstance.formState.errors.root.serverError.message}
                    </div>
                )}

                <div className="flex justify-end gap-3">
                  <Button type="button" variant="outline" onClick={closeTTModal}>Hủy</Button>
                  <Button type="submit" variant="primary">Lưu</Button>
                </div>
              </form>
            </div>
          </Modal>

          <div className="flex justify-end items-center gap-3 p-4">
            <Button size="md" variant="primary" className="!px-6 !py-2 font-semibold bg-blue-600 hover:bg-blue-700" onClick={handleAddOpen}>
              Thêm lớp học
            </Button>
            <Button size="md" variant="secondary" className="!px-6 !py-2 font-semibold bg-gray-200 hover:bg-gray-300" onClick={openAddTT}>
              Thêm loại đào tạo
            </Button>
          </div>
          <div className="max-w-full overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
              <tr>
                <th className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">STT</th>
                <th className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Tên lớp</th>
                <th className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Loại hình đào tạo</th>
                <th className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Khoa</th>
                <th className="px-5 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400">Thao tác</th>
              </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {filteredClasses.map((cls, idx) => (
                  <tr key={cls.id}>
                    <td className="px-5 py-4 sm:px-6 text-start">{idx + 1}</td>
                    <td className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">{cls.name}</td>
                    <td className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">{(trainingTypes.find(t => String(t.id) === String(cls.training_type_id)) || {}).name || cls.training_type_id}</td>
                    <td className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">{cls.faculty_id}</td>
                    <td className="px-4 py-3 text-center">
                      <Button size="sm" variant="outline" className="mr-2" onClick={() => handleEditOpen(cls)}>Sửa</Button>
                      <Button size="sm" variant="danger" onClick={() => handleDeleteClass(cls.id)}>Xóa</Button>
                    </td>
                  </tr>
              ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal Thêm lớp học */}
        <Modal isOpen={isAddOpen} onClose={handleAddClose} className="max-w-lg w-full mx-auto bg-white/98 shadow-2xl">
          <div className="p-8 bg-gradient-to-br from-white via-gray-50 to-gray-100 rounded-xl shadow-lg">
            <h2 className="text-2xl font-bold mb-6 text-center text-blue-700">Thêm lớp học</h2>
            <form className="space-y-5" onSubmit={classAddForm.handleSubmit(handleCreateClass)}>
              <div>
                <label className="block mb-2 text-sm font-semibold text-gray-700">Tên lớp</label>
                <input
                    {...classAddForm.register('name')}
                    className="w-full border border-blue-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                    type="text"
                    placeholder="Nhập tên lớp"
                />
                {classAddForm.formState.errors.name && (
                    <p className="text-red-500 text-sm mt-1">
                      {classAddForm.formState.errors.name.message}
                    </p>
                )}
              </div>
              <div>
                <label className="block mb-2 text-sm font-semibold text-gray-700">Loại hình đào tạo</label>
                <select
                    {...classAddForm.register('training_type_id')}
                    className="w-full border border-blue-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                >
                  <option value="">-- Chọn loại hình đào tạo --</option>
                  {trainingTypes && trainingTypes.map((tt) => (
                      <option key={tt.id} value={tt.id}>{tt.name}</option>
                  ))}
                </select>
                {classAddForm.formState.errors.training_type_id && (
                    <p className="text-red-500 text-sm mt-1">
                      {classAddForm.formState.errors.training_type_id.message}
                    </p>
                )}
              </div>
              <div>
                <label className="block mb-2 text-sm font-semibold text-gray-700">Khoa</label>
                <input
                    {...classAddForm.register('faculty_id')}
                    className="w-full border border-blue-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                    type="text"
                    placeholder="Nhập mã/tên khoa"
                />
                {classAddForm.formState.errors.faculty_id && (
                    <p className="text-red-500 text-sm mt-1">
                      {classAddForm.formState.errors.faculty_id.message}
                    </p>
                )}
              </div>

              {classAddForm.formState.errors.root?.serverError && (
                  <div className="bg-red-50 border border-red-300 text-red-700 p-3 rounded">
                    {classAddForm.formState.errors.root.serverError.message}
                  </div>
              )}

              <div className="flex justify-end mt-6 gap-3">
                <Button size="md" variant="primary" className="bg-blue-600 hover:bg-blue-700 font-semibold px-6 py-2 rounded-lg shadow" type="submit">Lưu</Button>
                <Button size="md" variant="outline" className="font-semibold px-6 py-2 rounded-lg shadow" type="button" onClick={handleAddClose}>Hủy</Button>
              </div>
            </form>
          </div>
        </Modal>

        {/* Modal Sửa lớp học */}
        <Modal isOpen={isEditOpen} onClose={handleEditClose} className="max-w-lg w-full mx-auto bg-white/98 shadow-2xl">
          <div className="p-8 bg-gradient-to-br from-white via-gray-50 to-gray-100 rounded-xl shadow-lg">
            <h2 className="text-2xl font-bold mb-6 text-center text-yellow-700">Sửa thông tin lớp học</h2>
            <form className="space-y-5" onSubmit={classEditForm.handleSubmit(handleUpdateClass)}>
              <div>
                <label className="block mb-2 text-sm font-semibold text-gray-700">Tên lớp</label>
                <input
                    {...classEditForm.register('name')}
                    className="w-full border border-yellow-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition"
                    type="text"
                />
                {classEditForm.formState.errors.name && (
                    <p className="text-red-500 text-sm mt-1">
                      {classEditForm.formState.errors.name.message}
                    </p>
                )}
              </div>
              <div>
                <label className="block mb-2 text-sm font-semibold text-gray-700">Loại hình đào tạo</label>
                <select
                    {...classEditForm.register('training_type_id')}
                    className="w-full border border-yellow-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition"
                >
                  <option value="">-- Chọn loại hình đào tạo --</option>
                  {trainingTypes && trainingTypes.map((tt) => (
                      <option key={tt.id} value={tt.id}>{tt.name}</option>
                  ))}
                </select>
                {classEditForm.formState.errors.training_type_id && (
                    <p className="text-red-500 text-sm mt-1">
                      {classEditForm.formState.errors.training_type_id.message}
                    </p>
                )}
              </div>
              <div>
                <label className="block mb-2 text-sm font-semibold text-gray-700">Khoa</label>
                <input
                    {...classEditForm.register('faculty_id')}
                    className="w-full border border-yellow-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition"
                    type="text"
                />
                {classEditForm.formState.errors.faculty_id && (
                    <p className="text-red-500 text-sm mt-1">
                      {classEditForm.formState.errors.faculty_id.message}
                    </p>
                )}
              </div>

              {classEditForm.formState.errors.root?.serverError && (
                  <div className="bg-red-50 border border-red-300 text-red-700 p-3 rounded">
                    {classEditForm.formState.errors.root.serverError.message}
                  </div>
              )}

              <div className="flex justify-end mt-6 gap-3">
                <Button size="md" variant="primary" className="bg-yellow-500 hover:bg-yellow-600 font-semibold px-6 py-2 rounded-lg shadow" type="submit">Lưu</Button>
                <Button size="md" variant="outline" className="font-semibold px-6 py-2 rounded-lg shadow" type="button" onClick={handleEditClose}>Hủy</Button>
              </div>
            </form>
          </div>
        </Modal>
      </>
  );
}