import React, { useEffect, useState } from 'react';
import PageMeta from '../components/common/PageMeta.jsx';
import Button from '../components/ui/button/Button.jsx';
import Modal from '../components/ui/modal/index.jsx';
import { getAllSubjects, createSubject, updateSubject, deleteSubject } from '../services/subjectService.js';

export default function SubjectManagement() {
  const [subjects, setSubjects] = useState([]);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editSubject, setEditSubject] = useState(null);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({ name: '', training_type_id: '', code: '', theory_hours: 0, self_study_hours: 0, practice_hours: 0, requires_lab: false });
  const [errors, setErrors] = useState(null);

  useEffect(() => { fetchList(); }, []);

  const fetchList = async () => {
    try {
      const data = await getAllSubjects();
      setSubjects(Array.isArray(data) ? data : []);
    } catch (err) { console.error('Failed to load subjects', err); }
  };

  const handleAddOpen = () => { setForm({ name: '', training_type_id: '', code: '', theory_hours: 0, self_study_hours: 0, practice_hours: 0, requires_lab: false }); setErrors(null); setIsAddOpen(true); };
  const handleAddClose = () => setIsAddOpen(false);
  const handleEditOpen = (s) => { setEditSubject(s); setForm({ name: s.name || '', training_type_id: s.training_type_id || '', code: s.code || '', theory_hours: s.theory_hours || 0, self_study_hours: s.self_study_hours || 0, practice_hours: s.practice_hours || 0, requires_lab: !!s.requires_lab }); setErrors(null); setIsEditOpen(true); };
  const handleEditClose = () => { setEditSubject(null); setIsEditOpen(false); };

  const handleCreate = async (e) => {
    e.preventDefault();
    setErrors(null);
    try {
      await createSubject(form);
      setIsAddOpen(false);
      fetchList();
    } catch (err) {
      console.error(err);
      const msg = err?.response?.data?.errors || err?.response?.data || err?.message;
      setErrors(msg);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setErrors(null);
    try {
      await updateSubject(editSubject.id, form);
      setIsEditOpen(false);
      fetchList();
    } catch (err) {
      console.error(err);
      const msg = err?.response?.data?.errors || err?.response?.data || err?.message;
      setErrors(msg);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa môn học này?')) return;
    try { await deleteSubject(id); fetchList(); } catch (err) { console.error('Delete failed', err); }
  };

  const filtered = subjects.filter(s => (s.name || '').toLowerCase().includes(search.toLowerCase()) || (s.code || '').toLowerCase().includes(search.toLowerCase()));

  return (
    <>
      <PageMeta title="Quản lý môn học" description="Quản lý danh sách môn học" />
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white p-4">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-3">
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Tìm theo tên hoặc mã môn" className="border rounded px-3 py-2" />
            <Button size="sm" variant="outline" onClick={() => fetchList()}>Làm mới</Button>
          </div>
          <div>
            <Button size="md" variant="primary" onClick={handleAddOpen}>Thêm môn học</Button>
          </div>
        </div>

        <div className="max-w-full overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-5 py-3 text-start">STT</th>
                <th className="px-5 py-3 text-start">Tên môn</th>
                <th className="px-5 py-3 text-start">Mã</th>
                <th className="px-5 py-3 text-start">Kiểu đào tạo</th>
                <th className="px-5 py-3 text-center">Hành động</th>
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
                    <Button size="sm" variant="outline" className="mr-2" onClick={() => handleEditOpen(s)}>Sửa</Button>
                    <Button size="sm" variant="danger" onClick={() => handleDelete(s.id)}>Xóa</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={isAddOpen} onClose={handleAddClose} className="max-w-lg w-full mx-auto bg-white/98 shadow-2xl">
        <div className="p-6">
          <h2 className="text-xl font-bold mb-4">Thêm môn học</h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block mb-1 text-sm">Tên môn</label>
              <input className="w-full border rounded px-3 py-2" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div>
              <label className="block mb-1 text-sm">Mã môn</label>
              <input className="w-full border rounded px-3 py-2" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} required />
            </div>
            <div>
              <label className="block mb-1 text-sm">Kiểu đào tạo (id)</label>
              <input className="w-full border rounded px-3 py-2" value={form.training_type_id} onChange={(e) => setForm({ ...form, training_type_id: e.target.value })} required />
            </div>
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="block mb-1 text-sm">Thực hành</label>
                <input type="number" className="w-full border rounded px-3 py-2" value={form.practice_hours} onChange={(e) => setForm({ ...form, practice_hours: Number(e.target.value) })} />
              </div>
              <div className="flex-1">
                <label className="block mb-1 text-sm">Lý thuyết</label>
                <input type="number" className="w-full border rounded px-3 py-2" value={form.theory_hours} onChange={(e) => setForm({ ...form, theory_hours: Number(e.target.value) })} />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <input id="requires_lab" type="checkbox" checked={form.requires_lab} onChange={(e) => setForm({ ...form, requires_lab: e.target.checked })} />
              <label htmlFor="requires_lab" className="text-sm">Yêu cầu phòng lab</label>
            </div>
            {errors && (<div className="text-sm text-red-500">{typeof errors === 'string' ? errors : JSON.stringify(errors)}</div>)}
            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={handleAddClose}>Hủy</Button>
              <Button type="submit" variant="primary">Lưu</Button>
            </div>
          </form>
        </div>
      </Modal>

      <Modal isOpen={isEditOpen} onClose={handleEditClose} className="max-w-lg w-full mx-auto bg-white/98 shadow-2xl">
        <div className="p-6">
          <h2 className="text-xl font-bold mb-4">Sửa môn học</h2>
          <form onSubmit={handleUpdate} className="space-y-4">
            <div>
              <label className="block mb-1 text-sm">Tên môn</label>
              <input className="w-full border rounded px-3 py-2" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div>
              <label className="block mb-1 text-sm">Mã môn</label>
              <input className="w-full border rounded px-3 py-2" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} required />
            </div>
            <div>
              <label className="block mb-1 text-sm">Kiểu đào tạo (id)</label>
              <input className="w-full border rounded px-3 py-2" value={form.training_type_id} onChange={(e) => setForm({ ...form, training_type_id: e.target.value })} required />
            </div>
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="block mb-1 text-sm">Thực hành</label>
                <input type="number" className="w-full border rounded px-3 py-2" value={form.practice_hours} onChange={(e) => setForm({ ...form, practice_hours: Number(e.target.value) })} />
              </div>
              <div className="flex-1">
                <label className="block mb-1 text-sm">Lý thuyết</label>
                <input type="number" className="w-full border rounded px-3 py-2" value={form.theory_hours} onChange={(e) => setForm({ ...form, theory_hours: Number(e.target.value) })} />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <input id="requires_lab_edit" type="checkbox" checked={form.requires_lab} onChange={(e) => setForm({ ...form, requires_lab: e.target.checked })} />
              <label htmlFor="requires_lab_edit" className="text-sm">Yêu cầu phòng lab</label>
            </div>
            {errors && (<div className="text-sm text-red-500">{typeof errors === 'string' ? errors : JSON.stringify(errors)}</div>)}
            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={handleEditClose}>Hủy</Button>
              <Button type="submit" variant="primary">Lưu</Button>
            </div>
          </form>
        </div>
      </Modal>
    </>
  );
}
