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
  const [form, setForm] = useState({ code: '', name: '', total: 0, description: '' });
  // errors is an object mapping field -> message, plus optional `general`
  const [errors, setErrors] = useState({});
  const [search, setSearch] = useState('');

  useEffect(() => { fetchList(); }, []);

  const fetchList = async () => {
    try {
      const data = await getAllEquipments();
      setEquipments(Array.isArray(data) ? data : []);
    } catch (err) { console.error('Failed to load equipments', err); }
  };

  // Apply server-side validation payload to local `errors` state.
  // Expected server payload shape:
  // { error: 'Validation failed', errors: [{ type: 'field', value, msg, path, location }] }
  const applyServerValidation = (data) => {
    // Build a fresh errors object from server payload to avoid spreading null/old state
    try {
      const next = {};
      if (data) {
        if (Array.isArray(data.errors)) {
          data.errors.forEach((it) => {
            try {
              if (it) {
                if (it.path) {
                  next[it.path] = it.msg || it.message || String(it);
                } else {
                  // global / constraint errors without a path -> aggregate into general
                  next.general = (next.general ? `${next.general}; ` : '') + (it.msg || it.message || String(it));
                }
              }
            } catch { /* ignore malformed item */ }
          });
        }
        if (data.error || data.message) next.general = next.general ? `${next.general}; ${data.error || data.message}` : (data.error || data.message);
      }
      setErrors(next);
      // scroll to first field error (ignore `general`)
      const keys = Object.keys(next).filter(k => next[k] && k !== 'general');
      if (keys.length > 0) {
        const first = keys[0];
        const el = document.getElementById(first);
        if (el && typeof el.scrollIntoView === 'function') {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          try { el.focus && el.focus(); } catch { /* ignore */ }
        }
      }
    } catch {
      // fallback: show a generic error
      setErrors({ general: data?.error || data?.message || 'Lỗi không xác định' });
    }
  };

  const handleAddOpen = () => { setForm({ code: '', name: '', total: 0, description: '' }); setErrors({}); setIsAddOpen(true); };
  const handleAddClose = () => setIsAddOpen(false);
  const handleEditOpen = (e) => { setEditEquipment(e); setForm({ code: e.code || '', name: e.name || '', total: e.total || 0, description: e.description || '' }); setErrors({}); setIsEditOpen(true); };
  const handleEditClose = () => { setEditEquipment(null); setIsEditOpen(false); };

  const handleCreate = async (ev) => {
    ev.preventDefault(); setErrors(null);
    try {
      // client-side sanity checks
      if (Number.isNaN(Number(form.total)) || Number(form.total) < 0) {
        setErrors({ total: 'Tổng phải là số nguyên >= 0' });
        return;
      }
      await createEquipment(form);
      setIsAddOpen(false); fetchList();
    } catch (err) {
      console.error(err);
      const data = err?.response?.data;
      if (data) {
        applyServerValidation(data);
      } else {
        const msg = err?.message || String(err) || 'Lỗi không xác định';
        setErrors({ general: msg });
      }
    }
  };

  const handleUpdate = async (ev) => {
    ev.preventDefault(); setErrors(null);
    try {
      // client-side sanity checks
      if (Number.isNaN(Number(form.total)) || Number(form.total) < 0) {
        setErrors({ total: 'Tổng phải là số nguyên >= 0' });
        return;
      }
      await updateEquipment(editEquipment.id, form);
      setIsEditOpen(false); fetchList();
    } catch (err) {
      console.error(err);
      const data = err?.response?.data;
      if (data) {
        applyServerValidation(data);
      } else {
        const msg = err?.message || String(err) || 'Lỗi không xác định';
        setErrors({ general: msg });
      }
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa thiết bị này?')) return;
    try { await deleteEquipment(id); fetchList(); } catch (err) { console.error('Delete failed', err); }
  };

  const filtered = equipments.filter(eq => {
    const q = (search || '').toLowerCase();
    return (eq.name || '').toLowerCase().includes(q) || (eq.code || '').toLowerCase().includes(q) || (eq.description || '').toLowerCase().includes(q);
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
              <input id="code" className="w-full border rounded px-3 py-2" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} required />
              {errors && errors.code && <p className="text-sm text-red-500 mt-1">{errors.code}</p>}
            </div>
            <div>
                <label className="block mb-1 text-sm">Tên thiết bị</label>
                <input id="name" className="w-full border rounded px-3 py-2" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                {errors && errors.name && <p className="text-sm text-red-500 mt-1">{errors.name}</p>}
            </div>
            <div>
                <label className="block mb-1 text-sm">Mô tả</label>
                <textarea id="description" className="w-full border rounded px-3 py-2" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                {errors && errors.description && <p className="text-sm text-red-500 mt-1">{errors.description}</p>}
            </div>
            <div>
                <label className="block mb-1 text-sm">Tổng số lượng</label>
                <input id="total" type="number" className="w-full border rounded px-3 py-2" value={form.total} onChange={(e) => setForm({ ...form, total: Number(e.target.value) })} />
                {errors && errors.total && <p className="text-sm text-red-500 mt-1">{errors.total}</p>}
            </div>
              {errors && errors.general && (<div className="text-sm text-red-500">{errors.general}</div>)}
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
              <input id="code" className="w-full border rounded px-3 py-2" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} required />
              {errors && errors.code && <p className="text-sm text-red-500 mt-1">{errors.code}</p>}
            </div>
            <div>
              <label className="block mb-1 text-sm">Tên thiết bị</label>
              <input id="name" className="w-full border rounded px-3 py-2" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              {errors && errors.name && <p className="text-sm text-red-500 mt-1">{errors.name}</p>}
            </div>
            <div>
              <label className="block mb-1 text-sm">Mô tả</label>
              <textarea id="description" className="w-full border rounded px-3 py-2" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              {errors && errors.description && <p className="text-sm text-red-500 mt-1">{errors.description}</p>}
            </div>
            <div>
              <label className="block mb-1 text-sm">Tổng số lượng</label>
              <input id="total" type="number" className="w-full border rounded px-3 py-2" value={form.total} onChange={(e) => setForm({ ...form, total: Number(e.target.value) })} />
              {errors && errors.total && <p className="text-sm text-red-500 mt-1">{errors.total}</p>}
            </div>
            {errors && errors.general && (<div className="text-sm text-red-500">{errors.general}</div>)}
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
