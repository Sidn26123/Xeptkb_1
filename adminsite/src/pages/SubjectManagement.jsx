import React, { useEffect, useState } from 'react';
import PageMeta from '../components/common/PageMeta.jsx';
import Button from '../components/ui/button/Button.jsx';
import Modal from '../components/ui/modal/index.jsx';
import { getAllSubjects, createSubject, updateSubject, deleteSubject } from '../services/subjectService.js';
import { getAllTrainingTypes } from '../services/trainingTypeService.js';
import { getAllEquipments } from '../services/equipmentService.js';
import {
  getAllSubjectRequiresEquipments,
  createSubjectRequiresEquipment,
  deleteSubjectRequiresEquipment,
} from '../services/subjectEquipmentService.js';

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

export default function SubjectManagement() {
  const [subjects, setSubjects] = useState([]);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editSubject, setEditSubject] = useState(null);
  const [trainingTypes, setTrainingTypes] = useState([]);
  const [equipments, setEquipments] = useState([]);
  const [isLoadingEquipments, setIsLoadingEquipments] = useState(false);
  const [selectedEquipments, setSelectedEquipments] = useState([]); // { equipment_id, quantity }
  const [search, setSearch] = useState('');
  // form and error state (missing before)
  const [form, setForm] = useState({ name: '', training_type_id: '', code: '', theory_hours: 0, self_study_hours: 0, practice_hours: 0, requires_lab: false });
  const [errors, setErrors] = useState(null);

  useEffect(() => { fetchList(); fetchTrainingTypes(); }, []);

  useEffect(() => { fetchEquipments(); }, []);

  const fetchEquipments = async () => {
    try {
      setIsLoadingEquipments(true);
      const data = await getAllEquipments();
      setEquipments(Array.isArray(data) ? data : []);
    } catch (err) { console.error('Failed to load equipments', err); setEquipments([]); }
    finally { setIsLoadingEquipments(false); }
  };

  const fetchTrainingTypes = async () => {
    try {
      const data = await getAllTrainingTypes();
      setTrainingTypes(Array.isArray(data) ? data : []);
    } catch (err) { console.error('Failed to load training types', err); }
  };

  const fetchList = async () => {
    try {
      const data = await getAllSubjects();
      setSubjects(Array.isArray(data) ? data : []);
    } catch (err) { console.error('Failed to load subjects', err); }
  };

  const handleAddOpen = () => { setForm({ name: '', training_type_id: '', code: '', theory_hours: 0, self_study_hours: 0, practice_hours: 0, requires_lab: false }); setSelectedEquipments([]); setErrors(null); setIsAddOpen(true); };
  const handleAddClose = () => setIsAddOpen(false);
  const handleEditOpen = (s) => { setEditSubject(s); setForm({ name: s.name || '', training_type_id: s.training_type_id || '', code: s.code || '', theory_hours: s.theory_hours || 0, self_study_hours: s.self_study_hours || 0, practice_hours: s.practice_hours || 0, requires_lab: !!s.requires_lab }); setErrors(null); setIsEditOpen(true); loadSubjectEquipmentsForEdit(s.id); };
  const handleEditClose = () => { setEditSubject(null); setIsEditOpen(false); };

  // Subject equipment helpers
  const updateEquipmentRow = (index, patch) => setSelectedEquipments(prev => prev.map((row, i) => i === index ? { ...row, ...patch } : row));
  const handleEquipmentCheckboxToggle = (equipmentId) => {
    setSelectedEquipments(prev => {
      const exists = prev.find(p => String(p.equipment_id) === String(equipmentId));
      if (exists) return prev.filter(p => String(p.equipment_id) !== String(equipmentId));
      return [...prev, { equipment_id: equipmentId, quantity: 1 }];
    });
  };
  const selectAllEquipments = () => setSelectedEquipments(equipments.map(e => ({ equipment_id: e.id, quantity: 1 })));
  const clearAllEquipments = () => setSelectedEquipments([]);

  const loadSubjectEquipmentsForEdit = async (subjectId) => {
    try {
      const all = await getAllSubjectRequiresEquipments();
      const related = (all || []).filter(re => String(re.subject_id) === String(subjectId)).map(re => ({ id: re.id, equipment_id: re.equipment_id, quantity: re.quantity }));
      setSelectedEquipments(related);
    } catch (err) { console.error('Failed to load subject equipments', err); setSelectedEquipments([]); }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setErrors(null);
    try {
      const created = await createSubject(form);
      const subjectId = created?.id || created?.data?.id || created?.data?.data?.id || created?.data?.id;
      const finalSubjectId = subjectId || created?.id;
      if (finalSubjectId && selectedEquipments && selectedEquipments.length > 0) {
        await Promise.all(selectedEquipments.filter(s => s.equipment_id).map(se => createSubjectRequiresEquipment({ subject_id: finalSubjectId, equipment_id: se.equipment_id, quantity: Number(se.quantity || 0) })));
      }
      setIsAddOpen(false);
      fetchList();
    } catch (err) {
      console.error('Failed to load subjects', err);
    }
  };

  // Map backend errors into component-level `errors` state
  const handleBackendErrors = (err) => {
    const payload = err?.response?.data;
    const list = payload?.errors;
    if (Array.isArray(list)) {
      // convert [{field, message}] into { field: message }
      const map = {};
      list.forEach((e) => {
        if (e.field) map[e.field] = e.message;
      });
      setErrors(map);
    } else {
      setErrors(payload?.message || err.message || 'Lỗi từ server');
    }
  };


  const handleUpdate = async () => {
    try {
      await updateSubject(editSubject.id, form);
      // sync subject requires equipments: delete existing relations and recreate
      try {
        const all = await getAllSubjectRequiresEquipments();
        const related = (all || []).filter(r => String(r.subject_id) === String(editSubject.id));
        await Promise.all(related.map(rItem => deleteSubjectRequiresEquipment(rItem.id)));
        if (selectedEquipments && selectedEquipments.length > 0) {
          await Promise.all(selectedEquipments.filter(s => s.equipment_id).map(se => createSubjectRequiresEquipment({ subject_id: editSubject.id, equipment_id: se.equipment_id, quantity: Number(se.quantity || 0) })));
        }
      } catch (syncErr) { console.error('Failed to sync subject equipments', syncErr); }
      setIsEditOpen(false);
      fetchList();
    } catch (err) {
      console.error('Update failed:', err);
      handleBackendErrors(err);
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

  const filtered = subjects.filter(s => {
    const q = (search || '').toLowerCase();
    const trainingTypeName = (trainingTypes.find(t => String(t.id) === String(s.training_type_id)) || {}).name || '';
    return (s.name || '').toLowerCase().includes(q) || (s.code || '').toLowerCase().includes(q) || trainingTypeName.toLowerCase().includes(q);
  });

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
            <div className="flex items-center gap-3">
              <Button
                  size="sm"
                  className="!px-6 !py-2 font-semibold bg-blue-600 hover:bg-blue-700"
              >
                Import Excel
              </Button>

              <Button size="md" variant="primary"
                      className="!px-6 !py-2 font-semibold bg-green-600 hover:bg-green-700"
                      onClick={handleAddOpen}>
                Thêm LHP
              </Button>
            </div>
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
                  <td className="px-4 py-3 text-start">{(trainingTypes.find(t => String(t.id) === String(s.training_type_id)) || {}).name || s.training_type_id}</td>
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
              <label className="block mb-1 text-sm">Kiểu đào tạo</label>
              <select className="w-full border rounded px-3 py-2" value={form.training_type_id || ''} onChange={(e) => setForm({ ...form, training_type_id: e.target.value })} required>
                <option value="">-- Chọn kiểu đào tạo --</option>
                {trainingTypes.map(tt => (<option key={tt.id} value={tt.id}>{tt.name || tt.id}</option>))}
              </select>
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
              <div className="flex-1">
                <label className="block mb-1 text-sm">Tự học</label>
                <input type="number" className="w-full border rounded px-3 py-2" value={form.self_study_hours} onChange={(e) => setForm({ ...form, self_study_hours: Number(e.target.value) })} />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <input id="requires_lab" type="checkbox" checked={form.requires_lab} onChange={(e) => setForm({ ...form, requires_lab: e.target.checked })} />
              <label htmlFor="requires_lab" className="text-sm">Yêu cầu phòng lab</label>
            </div>
            {/* Equipments required for subject */}
            <div className="bg-white rounded-lg p-3 border border-gray-200">
              <label className="block mb-2 text-sm font-semibold text-gray-700">Thiết bị cần cho môn</label>
              {isLoadingEquipments ? (
                <div className="text-center py-4">
                  <p className="text-gray-500">Đang tải danh sách thiết bị...</p>
                </div>
              ) : equipments.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-gray-500">Chưa có thiết bị</p>
                </div>
              ) : (
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <div className="text-sm text-gray-600">{selectedEquipments.length} thiết bị đã chọn</div>
                    <div className="flex gap-2">
                      <button type="button" className="text-sm text-blue-600" onClick={selectAllEquipments}>Chọn tất cả</button>
                      <button type="button" className="text-sm text-gray-600" onClick={clearAllEquipments}>Bỏ chọn</button>
                    </div>
                  </div>
                  <div className="max-h-44 overflow-y-auto border rounded p-2 bg-gray-50">
                    {equipments.map(eq => {
                      const sel = selectedEquipments.find(se => String(se.equipment_id) === String(eq.id));
                      return (
                        <div key={eq.id} className="flex items-center gap-3 mb-2">
                          <input type="checkbox" checked={!!sel} onChange={() => handleEquipmentCheckboxToggle(eq.id)} className="h-4 w-4" />
                          <div className="flex-1 text-sm">{eq.name || eq.code || `#${eq.id}`}</div>
                          {sel && (
                            <input type="number" min="0" value={sel.quantity || 1} onChange={(e) => updateEquipmentRow(selectedEquipments.findIndex(se => String(se.equipment_id) === String(eq.id)), { quantity: Number(e.target.value) })} className="w-20 border rounded px-2 py-1" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
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
              <label className="block mb-1 text-sm">Kiểu đào tạo</label>
              <select className="w-full border rounded px-3 py-2" value={form.training_type_id || ''} onChange={(e) => setForm({ ...form, training_type_id: e.target.value })} required>
                <option value="">-- Chọn kiểu đào tạo --</option>
                {trainingTypes.map(tt => (<option key={tt.id} value={tt.id}>{tt.name || tt.id}</option>))}
              </select>
            </div>
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="block mb-1 text-sm">Lý thuyết</label>
                <input type="number" className="w-full border rounded px-3 py-2" value={form.theory_hours} onChange={(e) => setForm({ ...form, theory_hours: Number(e.target.value) })} />
              </div>
              <div className="flex-1">
                <label className="block mb-1 text-sm">Thực hành</label>
                <input type="number" className="w-full border rounded px-3 py-2" value={form.practice_hours} onChange={(e) => setForm({ ...form, practice_hours: Number(e.target.value) })} />
              </div>
                <div className="flex-1">
                  <label className="block mb-1 text-sm">Tự học</label>
                  <input type="number" className="w-full border rounded px-3 py-2" value={form.self_study_hours} onChange={(e) => setForm({ ...form, self_study_hours: Number(e.target.value) })} />
                </div>
            </div>
            <div className="flex items-center gap-3">
              <input id="requires_lab_edit" type="checkbox" checked={form.requires_lab} onChange={(e) => setForm({ ...form, requires_lab: e.target.checked })} />
              <label htmlFor="requires_lab_edit" className="text-sm">Yêu cầu phòng lab</label>
            </div>
            {/* Field training_type_id */}
            {/* <div>
              <label className="block mb-1 text-sm">Kiểu đào tạo (ID)</label>
              <input {...addForm.register('training_type_id')} className="w-full border rounded px-3 py-2" />
              {addForm.formState.errors.training_type_id && (
                  <p className="text-red-500 text-sm mt-1">
                    {addForm.formState.errors.training_type_id.message}
                  </p>
              )}
            </div> */}
            {/* Equipments required for subject (edit) */}
            <div className="bg-white rounded-lg p-3 border border-gray-200">
              <label className="block mb-2 text-sm font-semibold text-gray-700">Thiết bị cần cho môn</label>
              {isLoadingEquipments ? (
                <div className="text-center py-4">
                  <p className="text-gray-500">Đang tải danh sách thiết bị...</p>
                </div>
              ) : equipments.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-gray-500">Chưa có thiết bị</p>
                </div>
              ) : (
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <div className="text-sm text-gray-600">{selectedEquipments.length} thiết bị đã chọn</div>
                    <div className="flex gap-2">
                      <button type="button" className="text-sm text-yellow-600" onClick={selectAllEquipments}>Chọn tất cả</button>
                      <button type="button" className="text-sm text-gray-600" onClick={clearAllEquipments}>Bỏ chọn</button>
                    </div>
                  </div>
                  <div className="max-h-44 overflow-y-auto border rounded p-2 bg-gray-50">
                    {equipments.map(eq => {
                      const sel = selectedEquipments.find(se => String(se.equipment_id) === String(eq.id));
                      return (
                        <div key={eq.id} className="flex items-center gap-3 mb-2">
                          <input type="checkbox" checked={!!sel} onChange={() => handleEquipmentCheckboxToggle(eq.id)} className="h-4 w-4" />
                          <div className="flex-1 text-sm">{eq.name || eq.code || `#${eq.id}`}</div>
                          {sel && (
                            <input type="number" min="0" value={sel.quantity || 1} onChange={(e) => updateEquipmentRow(selectedEquipments.findIndex(se => String(se.equipment_id) === String(eq.id)), { quantity: Number(e.target.value) })} className="w-20 border rounded px-2 py-1" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
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
