// import React, { useEffect, useState } from 'react';
// import PageMeta from '../components/common/PageMeta.jsx';
// import Button from '../components/ui/button/Button.jsx';
// import Modal from '../components/ui/modal/index.jsx';
// import { getAllSubjects, createSubject, updateSubject, deleteSubject } from '../services/subjectService.js';
//
// export default function SubjectManagement() {
//   const [subjects, setSubjects] = useState([]);
//   const [isAddOpen, setIsAddOpen] = useState(false);
//   const [isEditOpen, setIsEditOpen] = useState(false);
//   const [editSubject, setEditSubject] = useState(null);
//   const [search, setSearch] = useState('');
//   const [form, setForm] = useState({ name: '', training_type_id: '', code: '', theory_hours: 0, self_study_hours: 0, practice_hours: 0, requires_lab: false });
//   const [errors, setErrors] = useState(null);
//
//   useEffect(() => { fetchList(); }, []);
//
//   const fetchList = async () => {
//     try {
//       const data = await getAllSubjects();
//       setSubjects(Array.isArray(data) ? data : []);
//     } catch (err) { console.error('Failed to load subjects', err); }
//   };
//
//   const handleAddOpen = () => { setForm({ name: '', training_type_id: '', code: '', theory_hours: 0, self_study_hours: 0, practice_hours: 0, requires_lab: false }); setErrors(null); setIsAddOpen(true); };
//   const handleAddClose = () => setIsAddOpen(false);
//   const handleEditOpen = (s) => { setEditSubject(s); setForm({ name: s.name || '', training_type_id: s.training_type_id || '', code: s.code || '', theory_hours: s.theory_hours || 0, self_study_hours: s.self_study_hours || 0, practice_hours: s.practice_hours || 0, requires_lab: !!s.requires_lab }); setErrors(null); setIsEditOpen(true); };
//   const handleEditClose = () => { setEditSubject(null); setIsEditOpen(false); };
//
//   const handleCreate = async (e) => {
//     e.preventDefault();
//     setErrors(null);
//     try {
//       await createSubject(form);
//       setIsAddOpen(false);
//       fetchList();
//     } catch (err) {
//       console.error(err);
//       const msg = err?.response?.data?.errors || err?.response?.data || err?.message;
//       setErrors(msg);
//     }
//   };
//
//   const handleUpdate = async (e) => {
//     e.preventDefault();
//     setErrors(null);
//     try {
//       await updateSubject(editSubject.id, form);
//       setIsEditOpen(false);
//       fetchList();
//     } catch (err) {
//       console.error(err);
//       const msg = err?.response?.data?.errors || err?.response?.data || err?.message;
//       setErrors(msg);
//     }
//   };
//
//   const handleDelete = async (id) => {
//     if (!window.confirm('Bạn có chắc muốn xóa môn học này?')) return;
//     try { await deleteSubject(id); fetchList(); } catch (err) { console.error('Delete failed', err); }
//   };
//
//   const filtered = subjects.filter(s => (s.name || '').toLowerCase().includes(search.toLowerCase()) || (s.code || '').toLowerCase().includes(search.toLowerCase()));
//
//   return (
//     <>
//       <PageMeta title="Quản lý môn học" description="Quản lý danh sách môn học" />
//       <div className="overflow-hidden rounded-xl border border-gray-200 bg-white p-4">
//         <div className="flex justify-between items-center mb-4">
//           <div className="flex items-center gap-3">
//             <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Tìm theo tên hoặc mã môn" className="border rounded px-3 py-2" />
//             <Button size="sm" variant="outline" onClick={() => fetchList()}>Làm mới</Button>
//           </div>
//           <div>
//             <Button size="md" variant="primary" onClick={handleAddOpen}>Thêm môn học</Button>
//           </div>
//         </div>
//
//         <div className="max-w-full overflow-x-auto">
//           <table className="min-w-full divide-y divide-gray-200">
//             <thead className="bg-gray-50">
//               <tr>
//                 <th className="px-5 py-3 text-start">STT</th>
//                 <th className="px-5 py-3 text-start">Tên môn</th>
//                 <th className="px-5 py-3 text-start">Mã</th>
//                 <th className="px-5 py-3 text-start">Kiểu đào tạo</th>
//                 <th className="px-5 py-3 text-center">Hành động</th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-gray-100">
//               {filtered.map((s, idx) => (
//                 <tr key={s.id}>
//                   <td className="px-5 py-4 text-start">{idx + 1}</td>
//                   <td className="px-4 py-3 text-start">{s.name}</td>
//                   <td className="px-4 py-3 text-start">{s.code}</td>
//                   <td className="px-4 py-3 text-start">{s.training_type_id}</td>
//                   <td className="px-4 py-3 text-center">
//                     <Button size="sm" variant="outline" className="mr-2" onClick={() => handleEditOpen(s)}>Sửa</Button>
//                     <Button size="sm" variant="danger" onClick={() => handleDelete(s.id)}>Xóa</Button>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       </div>
//
//       <Modal isOpen={isAddOpen} onClose={handleAddClose} className="max-w-lg w-full mx-auto bg-white/98 shadow-2xl">
//         <div className="p-6">
//           <h2 className="text-xl font-bold mb-4">Thêm môn học</h2>
//           <form onSubmit={handleCreate} className="space-y-4">
//             <div>
//               <label className="block mb-1 text-sm">Tên môn</label>
//               <input className="w-full border rounded px-3 py-2" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
//             </div>
//             <div>
//               <label className="block mb-1 text-sm">Mã môn</label>
//               <input className="w-full border rounded px-3 py-2" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} required />
//             </div>
//             <div>
//               <label className="block mb-1 text-sm">Kiểu đào tạo (id)</label>
//               <input className="w-full border rounded px-3 py-2" value={form.training_type_id} onChange={(e) => setForm({ ...form, training_type_id: e.target.value })} required />
//             </div>
//             <div className="flex gap-2">
//               <div className="flex-1">
//                 <label className="block mb-1 text-sm">Thực hành</label>
//                 <input type="number" className="w-full border rounded px-3 py-2" value={form.practice_hours} onChange={(e) => setForm({ ...form, practice_hours: Number(e.target.value) })} />
//               </div>
//               <div className="flex-1">
//                 <label className="block mb-1 text-sm">Lý thuyết</label>
//                 <input type="number" className="w-full border rounded px-3 py-2" value={form.theory_hours} onChange={(e) => setForm({ ...form, theory_hours: Number(e.target.value) })} />
//               </div>
//             </div>
//             <div className="flex items-center gap-3">
//               <input id="requires_lab" type="checkbox" checked={form.requires_lab} onChange={(e) => setForm({ ...form, requires_lab: e.target.checked })} />
//               <label htmlFor="requires_lab" className="text-sm">Yêu cầu phòng lab</label>
//             </div>
//             {errors && (<div className="text-sm text-red-500">{typeof errors === 'string' ? errors : JSON.stringify(errors)}</div>)}
//             <div className="flex justify-end gap-3">
//               <Button type="button" variant="outline" onClick={handleAddClose}>Hủy</Button>
//               <Button type="submit" variant="primary">Lưu</Button>
//             </div>
//           </form>
//         </div>
//       </Modal>
//
//       <Modal isOpen={isEditOpen} onClose={handleEditClose} className="max-w-lg w-full mx-auto bg-white/98 shadow-2xl">
//         <div className="p-6">
//           <h2 className="text-xl font-bold mb-4">Sửa môn học</h2>
//           <form onSubmit={handleUpdate} className="space-y-4">
//             <div>
//               <label className="block mb-1 text-sm">Tên môn</label>
//               <input className="w-full border rounded px-3 py-2" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
//             </div>
//             <div>
//               <label className="block mb-1 text-sm">Mã môn</label>
//               <input className="w-full border rounded px-3 py-2" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} required />
//             </div>
//             <div>
//               <label className="block mb-1 text-sm">Kiểu đào tạo (id)</label>
//               <input className="w-full border rounded px-3 py-2" value={form.training_type_id} onChange={(e) => setForm({ ...form, training_type_id: e.target.value })} required />
//             </div>
//             <div className="flex gap-2">
//               <div className="flex-1">
//                 <label className="block mb-1 text-sm">Thực hành</label>
//                 <input type="number" className="w-full border rounded px-3 py-2" value={form.practice_hours} onChange={(e) => setForm({ ...form, practice_hours: Number(e.target.value) })} />
//               </div>
//               <div className="flex-1">
//                 <label className="block mb-1 text-sm">Lý thuyết</label>
//                 <input type="number" className="w-full border rounded px-3 py-2" value={form.theory_hours} onChange={(e) => setForm({ ...form, theory_hours: Number(e.target.value) })} />
//               </div>
//             </div>
//             <div className="flex items-center gap-3">
//               <input id="requires_lab_edit" type="checkbox" checked={form.requires_lab} onChange={(e) => setForm({ ...form, requires_lab: e.target.checked })} />
//               <label htmlFor="requires_lab_edit" className="text-sm">Yêu cầu phòng lab</label>
//             </div>
//             {errors && (<div className="text-sm text-red-500">{typeof errors === 'string' ? errors : JSON.stringify(errors)}</div>)}
//             <div className="flex justify-end gap-3">
//               <Button type="button" variant="outline" onClick={handleEditClose}>Hủy</Button>
//               <Button type="submit" variant="primary">Lưu</Button>
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
import { getAllSubjects, createSubject, updateSubject, deleteSubject } from '../services/subjectService.js';

// Thư viện validate
import * as yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

// 🧩 Schema validate cho Môn học
const subjectSchema = yup.object({
  name: yup
      .string()
      .trim()
      .required('Tên môn không được để trống')
      .min(3, 'Tên môn phải có ít nhất 3 ký tự')
      .max(255, 'Tên môn không được vượt quá 255 ký tự'),
  code: yup
      .string()
      .trim()
      .required('Mã môn không được để trống')
      .matches(/^[A-Za-z0-9_-]+$/, 'Mã chỉ được chứa chữ, số, gạch dưới hoặc gạch ngang'),
  training_type_id: yup
      .string()
      .required('Vui lòng nhập hoặc chọn loại hình đào tạo'),
  theory_hours: yup
      .number()
      .min(0, 'Số giờ lý thuyết không hợp lệ')
      .required('Vui lòng nhập số giờ lý thuyết'),
  practice_hours: yup
      .number()
      .min(0, 'Số giờ thực hành không hợp lệ')
      .required('Vui lòng nhập số giờ thực hành'),
  self_study_hours: yup
      .number()
      .min(0, 'Số giờ tự học không hợp lệ')
      .required('Vui lòng nhập số giờ tự học'),
  requires_lab: yup.boolean().default(false)
});

export default function SubjectManagement() {
  const [subjects, setSubjects] = useState([]);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editSubject, setEditSubject] = useState(null);
  const [search, setSearch] = useState('');

  // --- Form cho thêm mới ---
  const addForm = useForm({
    resolver: yupResolver(subjectSchema),
    defaultValues: {
      name: '',
      code: '',
      training_type_id: '',
      theory_hours: 0,
      practice_hours: 0,
      self_study_hours: 0,
      requires_lab: false
    }
  });

  // --- Form cho sửa ---
  const editForm = useForm({
    resolver: yupResolver(subjectSchema),
    defaultValues: {
      name: '',
      code: '',
      training_type_id: '',
      theory_hours: 0,
      practice_hours: 0,
      self_study_hours: 0,
      requires_lab: false
    }
  });

  useEffect(() => {
    fetchList();
  }, []);

  const fetchList = async () => {
    try {
      const data = await getAllSubjects();
      setSubjects(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load subjects', err);
    }
  };

  // 🧩 Hàm xử lý lỗi từ backend
  const handleBackendErrors = (err, formInstance) => {
    const errors = err?.response?.data?.errors;
    if (Array.isArray(errors)) {
      errors.forEach((e) => {
        if (e.field) {
          formInstance.setError(e.field, { type: 'server', message: e.message });
        }
      });
    } else {
      const msg = err?.response?.data?.message || err.message;
      formInstance.setError('root.serverError', { type: 'server', message: msg });
    }
  };

  // --- Xử lý mở/đóng modal ---
  const handleAddOpen = () => {
    addForm.reset();
    addForm.clearErrors();
    setIsAddOpen(true);
  };
  const handleAddClose = () => {
    setIsAddOpen(false);
    addForm.reset();
  };

  const handleEditOpen = (subject) => {
    setEditSubject(subject);
    editForm.reset(subject);
    editForm.clearErrors();
    setIsEditOpen(true);
  };
  const handleEditClose = () => {
    setEditSubject(null);
    setIsEditOpen(false);
    editForm.reset();
  };

  // --- Submit form ---
  const handleCreate = async (data) => {
    try {
      await createSubject(data);
      handleAddClose();
      fetchList();
    } catch (err) {
      console.error('Create failed:', err);
      handleBackendErrors(err, addForm);
    }
  };

  const handleUpdate = async (data) => {
    try {
      await updateSubject(editSubject.id, data);
      handleEditClose();
      fetchList();
    } catch (err) {
      console.error('Update failed:', err);
      handleBackendErrors(err, editForm);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa môn học này?')) return;
    try {
      await deleteSubject(id);
      fetchList();
    } catch (err) {
      console.error('Delete failed:', err);
      alert(err?.response?.data?.message || 'Lỗi khi xóa môn học');
    }
  };

  const filtered = subjects.filter(
      (s) =>
          (s.name || '').toLowerCase().includes(search.toLowerCase()) ||
          (s.code || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
      <>
        <PageMeta title="Quản lý môn học" description="Trang quản lý danh sách môn học trong hệ thống." />

        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white p-4">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-3">
              <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Tìm theo tên hoặc mã môn"
                  className="border rounded px-3 py-2"
              />
              <Button size="sm" variant="outline" onClick={() => fetchList()}>
                Làm mới
              </Button>
            </div>
            <Button size="md" variant="primary" onClick={handleAddOpen}>
              Thêm môn học
            </Button>
          </div>

          <div className="max-w-full overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
              <tr>
                <th className="px-5 py-3 text-start">STT</th>
                <th className="px-5 py-3 text-start">Tên môn</th>
                <th className="px-5 py-3 text-start">Mã</th>
                <th className="px-5 py-3 text-start">Loại hình đào tạo</th>
                <th className="px-5 py-3 text-center">Thao tác</th>
              </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
              {filtered.map((s, idx) => (
                  <tr key={s.id}>
                    <td className="px-5 py-4 text-start">{idx + 1}</td>
                    <td className="px-4 py-3 text-start">{s.name}</td>
                    <td className="px-4 py-3 text-start">{s.code}</td>
                    <td className="px-4 py-3 text-start">{s.training_type_id}</td>
                    <td className="px-4 py-3 text-center">
                      <Button size="sm" variant="outline" className="mr-2" onClick={() => handleEditOpen(s)}>
                        Sửa
                      </Button>
                      <Button size="sm" variant="danger" onClick={() => handleDelete(s.id)}>
                        Xóa
                      </Button>
                    </td>
                  </tr>
              ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal Thêm Môn */}
        <Modal isOpen={isAddOpen} onClose={handleAddClose} className="max-w-lg w-full mx-auto bg-white/98 shadow-2xl">
          <div className="p-6">
            <h2 className="text-xl font-bold mb-4">Thêm môn học</h2>
            <form onSubmit={addForm.handleSubmit(handleCreate)} className="space-y-4">
              {/* Field name */}
              <div>
                <label className="block mb-1 text-sm">Tên môn</label>
                <input {...addForm.register('name')} className="w-full border rounded px-3 py-2" />
                {addForm.formState.errors.name && (
                    <p className="text-red-500 text-sm mt-1">{addForm.formState.errors.name.message}</p>
                )}
              </div>

              {/* Field code */}
              <div>
                <label className="block mb-1 text-sm">Mã môn</label>
                <input {...addForm.register('code')} className="w-full border rounded px-3 py-2" />
                {addForm.formState.errors.code && (
                    <p className="text-red-500 text-sm mt-1">{addForm.formState.errors.code.message}</p>
                )}
              </div>

              {/* Field training_type_id */}
              <div>
                <label className="block mb-1 text-sm">Kiểu đào tạo (ID)</label>
                <input {...addForm.register('training_type_id')} className="w-full border rounded px-3 py-2" />
                {addForm.formState.errors.training_type_id && (
                    <p className="text-red-500 text-sm mt-1">
                      {addForm.formState.errors.training_type_id.message}
                    </p>
                )}
              </div>

              {/* Hours */}
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="block mb-1 text-sm">Lý thuyết</label>
                  <input type="number" {...addForm.register('theory_hours')} className="w-full border rounded px-3 py-2" />
                  {addForm.formState.errors.theory_hours && (
                      <p className="text-red-500 text-sm mt-1">
                        {addForm.formState.errors.theory_hours.message}
                      </p>
                  )}
                </div>
                <div className="flex-1">
                  <label className="block mb-1 text-sm">Thực hành</label>
                  <input type="number" {...addForm.register('practice_hours')} className="w-full border rounded px-3 py-2" />
                  {addForm.formState.errors.practice_hours && (
                      <p className="text-red-500 text-sm mt-1">
                        {addForm.formState.errors.practice_hours.message}
                      </p>
                  )}
                </div>
              </div>

              {/* Checkbox */}
              <div className="flex items-center gap-2">
                <input type="checkbox" {...addForm.register('requires_lab')} id="requires_lab" />
                <label htmlFor="requires_lab" className="text-sm">Yêu cầu phòng lab</label>
              </div>

              {/* Server error */}
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

        {/* Modal Sửa Môn */}
        <Modal isOpen={isEditOpen} onClose={handleEditClose} className="max-w-lg w-full mx-auto bg-white/98 shadow-2xl">
          <div className="p-6">
            <h2 className="text-xl font-bold mb-4">Sửa môn học</h2>
            <form onSubmit={editForm.handleSubmit(handleUpdate)} className="space-y-4">
              <div>
                <label className="block mb-1 text-sm">Tên môn</label>
                <input {...editForm.register('name')} className="w-full border rounded px-3 py-2" />
                {editForm.formState.errors.name && (
                    <p className="text-red-500 text-sm mt-1">{editForm.formState.errors.name.message}</p>
                )}
              </div>

              <div>
                <label className="block mb-1 text-sm">Mã môn</label>
                <input {...editForm.register('code')} className="w-full border rounded px-3 py-2" />
                {editForm.formState.errors.code && (
                    <p className="text-red-500 text-sm mt-1">{editForm.formState.errors.code.message}</p>
                )}
              </div>

              <div>
                <label className="block mb-1 text-sm">Kiểu đào tạo (ID)</label>
                <input {...editForm.register('training_type_id')} className="w-full border rounded px-3 py-2" />
                {editForm.formState.errors.training_type_id && (
                    <p className="text-red-500 text-sm mt-1">
                      {editForm.formState.errors.training_type_id.message}
                    </p>
                )}
              </div>

              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="block mb-1 text-sm">Lý thuyết</label>
                  <input type="number" {...editForm.register('theory_hours')} className="w-full border rounded px-3 py-2" />
                  {editForm.formState.errors.theory_hours && (
                      <p className="text-red-500 text-sm mt-1">
                        {editForm.formState.errors.theory_hours.message}
                      </p>
                  )}
                </div>
                <div className="flex-1">
                  <label className="block mb-1 text-sm">Thực hành</label>
                  <input type="number" {...editForm.register('practice_hours')} className="w-full border rounded px-3 py-2" />
                  {editForm.formState.errors.practice_hours && (
                      <p className="text-red-500 text-sm mt-1">
                        {editForm.formState.errors.practice_hours.message}
                      </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input type="checkbox" {...editForm.register('requires_lab')} id="requires_lab_edit" />
                <label htmlFor="requires_lab_edit" className="text-sm">Yêu cầu phòng lab</label>
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
                  Cập nhật
                </Button>
              </div>
            </form>
          </div>
        </Modal>
      </>
  );
}
