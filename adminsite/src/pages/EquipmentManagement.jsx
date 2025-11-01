import React, { useEffect, useState } from 'react';
import PageMeta from '../components/common/PageMeta.jsx';
import Button from '../components/ui/button/Button.jsx';
import Modal from '../components/ui/modal/index.jsx';
import { getAllEquipments, createEquipment, updateEquipment, deleteEquipment } from '../services/equipmentService.js';

export default function EquipmentManagement() {
  const [equipments, setEquipments] = useState([]);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editEquipment, setEditEquipment] = useState(null);
  const [form, setForm] = useState({ code: '', name: '', total: 0 });
  const [errors, setErrors] = useState(null);
  const [search, setSearch] = useState('');

  useEffect(() => { fetchList(); }, []);

  const fetchList = async () => {
    try {
      const data = await getAllEquipments();
      setEquipments(Array.isArray(data) ? data : []);
    } catch (err) { console.error('Failed to load equipments', err); }
  };

  const handleAddOpen = () => { setForm({ code: '', name: '', total: 0 }); setErrors(null); setIsAddOpen(true); };
  const handleAddClose = () => setIsAddOpen(false);
  const handleEditOpen = (e) => { setEditEquipment(e); setForm({ code: e.code || '', name: e.name || '', total: e.total || 0 }); setErrors(null); setIsEditOpen(true); };
  const handleEditClose = () => { setEditEquipment(null); setIsEditOpen(false); };

  const handleCreate = async (ev) => {
    ev.preventDefault(); setErrors(null);
    try {
      await createEquipment(form);
      setIsAddOpen(false); fetchList();
    } catch (err) {
      console.error(err);
      const msg = err?.response?.data?.errors || err?.response?.data || err?.message;
      setErrors(msg);
    }
  };

  const handleUpdate = async (ev) => {
    ev.preventDefault(); setErrors(null);
    try {
      await updateEquipment(editEquipment.id, form);
      setIsEditOpen(false); fetchList();
    } catch (err) {
      console.error(err);
      const msg = err?.response?.data?.errors || err?.response?.data || err?.message;
      setErrors(msg);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa thiết bị này?')) return;
    try { await deleteEquipment(id); fetchList(); } catch (err) { console.error('Delete failed', err); }
  };

  const filtered = equipments.filter(eq => {
    const q = (search || '').toLowerCase();
    return (eq.name || '').toLowerCase().includes(q) || (eq.code || '').toLowerCase().includes(q);
  });

  return (
    <>
      <PageMeta title="Quản lý thiết bị" description="Quản lý danh sách thiết bị" />
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white p-4">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-3">
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Tìm theo tên hoặc mã thiết bị" className="border rounded px-3 py-2" />
            <Button size="sm" variant="outline" onClick={() => fetchList()}>Làm mới</Button>
          </div>
          <div>
            <Button size="md" variant="primary" onClick={handleAddOpen}>Thêm thiết bị</Button>
          </div>
        </div>

        <div className="max-w-full overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-5 py-3 text-start">STT</th>
                <th className="px-5 py-3 text-start">Tên thiết bị</th>
                <th className="px-5 py-3 text-start">Mã</th>
                <th className="px-5 py-3 text-start">Tổng</th>
                <th className="px-5 py-3 text-center">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((s, idx) => (
                <tr key={s.id}>
                  <td className="px-5 py-4 text-start">{idx + 1}</td>
                  <td className="px-4 py-3 text-start">{s.name}</td>
                  <td className="px-4 py-3 text-start">{s.code}</td>
                  <td className="px-4 py-3 text-start">{s.total}</td>
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
          <h2 className="text-xl font-bold mb-4">Thêm thiết bị</h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block mb-1 text-sm">Mã thiết bị</label>
              <input className="w-full border rounded px-3 py-2" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} required />
            </div>
            <div>
              <label className="block mb-1 text-sm">Tên thiết bị</label>
              <input className="w-full border rounded px-3 py-2" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div>
              <label className="block mb-1 text-sm">Tổng số lượng</label>
              <input type="number" className="w-full border rounded px-3 py-2" value={form.total} onChange={(e) => setForm({ ...form, total: Number(e.target.value) })} />
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
          <h2 className="text-xl font-bold mb-4">Sửa thiết bị</h2>
          <form onSubmit={handleUpdate} className="space-y-4">
            <div>
              <label className="block mb-1 text-sm">Mã thiết bị</label>
              <input className="w-full border rounded px-3 py-2" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} required />
            </div>
            <div>
              <label className="block mb-1 text-sm">Tên thiết bị</label>
              <input className="w-full border rounded px-3 py-2" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div>
              <label className="block mb-1 text-sm">Tổng số lượng</label>
              <input type="number" className="w-full border rounded px-3 py-2" value={form.total} onChange={(e) => setForm({ ...form, total: Number(e.target.value) })} />
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
