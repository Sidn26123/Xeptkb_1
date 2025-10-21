import React, { useEffect, useState } from 'react';
import PageMeta from '../components/common/PageMeta.jsx';
import Button from '../components/ui/button/Button.jsx';
import Modal from '../components/ui/modal/index.jsx';
import { getAllFaculties, createFaculty, updateFaculty, deleteFaculty } from '../services/facultyService.js';

export default function FacultyManagement() {
  const [faculties, setFaculties] = useState([]);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editFaculty, setEditFaculty] = useState(null);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({ name: '', faculty_id: '' });
  const [errors, setErrors] = useState(null);

  useEffect(() => { fetchList(); }, []);

  const fetchList = async () => {
    try {
      const data = await getAllFaculties();
      setFaculties(Array.isArray(data) ? data : []);
    } catch (err) { console.error('Failed to load faculties', err); }
  };

  const handleAddOpen = () => { setForm({ name: '', faculty_id: '' }); setErrors(null); setIsAddOpen(true); };
  const handleAddClose = () => setIsAddOpen(false);
  const handleEditOpen = (f) => { setEditFaculty(f); setForm({ name: f.name || '', faculty_id: f.faculty_id || '' }); setErrors(null); setIsEditOpen(true); };
  const handleEditClose = () => { setEditFaculty(null); setIsEditOpen(false); };

  const handleCreate = async (e) => {
    e.preventDefault();
    setErrors(null);
    try {
      await createFaculty(form);
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
      await updateFaculty(editFaculty.id, form);
      setIsEditOpen(false);
      fetchList();
    } catch (err) {
      console.error(err);
      const msg = err?.response?.data?.errors || err?.response?.data || err?.message;
      setErrors(msg);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa khoa này?')) return;
    try { await deleteFaculty(id); fetchList(); } catch (err) { console.error('Delete failed', err); }
  };

  const filtered = faculties.filter(f => (f.name || '').toLowerCase().includes(search.toLowerCase()) || (f.faculty_id || '').toLowerCase().includes(search.toLowerCase()));

  return (
    <>
      <PageMeta title="Quản lý khoa" description="Quản lý danh sách các khoa" />
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white p-4">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-3">
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Tìm theo tên hoặc mã khoa" className="border rounded px-3 py-2" />
            <Button size="sm" variant="outline" onClick={() => fetchList()}>Làm mới</Button>
          </div>
          <div>
            <Button size="md" variant="primary" onClick={handleAddOpen}>Thêm khoa</Button>
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
                    <Button size="sm" variant="outline" className="mr-2" onClick={() => handleEditOpen(f)}>Sửa</Button>
                    <Button size="sm" variant="danger" onClick={() => handleDelete(f.id)}>Xóa</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={isAddOpen} onClose={handleAddClose} className="max-w-lg w-full mx-auto bg-white/98 shadow-2xl">
        <div className="p-6">
          <h2 className="text-xl font-bold mb-4">Thêm khoa</h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block mb-1 text-sm">Tên khoa</label>
              <input className="w-full border rounded px-3 py-2" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div>
              <label className="block mb-1 text-sm">Mã khoa</label>
              <input className="w-full border rounded px-3 py-2" value={form.faculty_id} onChange={(e) => setForm({ ...form, faculty_id: e.target.value })} required />
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
          <h2 className="text-xl font-bold mb-4">Sửa khoa</h2>
          <form onSubmit={handleUpdate} className="space-y-4">
            <div>
              <label className="block mb-1 text-sm">Tên khoa</label>
              <input className="w-full border rounded px-3 py-2" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div>
              <label className="block mb-1 text-sm">Mã khoa</label>
              <input className="w-full border rounded px-3 py-2" value={form.faculty_id} onChange={(e) => setForm({ ...form, faculty_id: e.target.value })} required />
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
