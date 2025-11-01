import { useState, useEffect } from "react";
import Button from "../components/ui/button/Button.jsx";
import Modal from "../components/ui/modal/index.jsx";
import PageMeta from "../components/common/PageMeta.jsx";
import { getAllRooms, createRoom, updateRoom, deleteRoom } from '../services/roomService.js';
import { getAllBuildings } from '../services/buildingService.js';
import { getAllCampus } from '../services/campusService.js';
import { getAllEquipments } from '../services/equipmentService.js';
import { createRoomEquipment, getAllRoomEquipments, deleteRoomEquipment } from '../services/roomEquipmentService.js';

export default function RoomManagement() {
  const [rooms, setRooms] = useState([]);
  const [buildings, setBuildings] = useState([]);
  const [campuses, setCampuses] = useState([]);
  const [selectedCampus, setSelectedCampus] = useState('');
  const [search, setSearch] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editRoom, setEditRoom] = useState(null);
  const [form, setForm] = useState({ code: '', name: '', type: '', capacity_max: '', capacity_optimal: '', floor_number: '', status: '', buildings_id: '' });
  const [errors, setErrors] = useState(null);
  const [equipments, setEquipments] = useState([]);
  const [isLoadingEquipments, setIsLoadingEquipments] = useState(false);
  const [selectedEquipments, setSelectedEquipments] = useState([]); // { equipment_id, quantity, id? }

  useEffect(() => { fetchList(); fetchBuildings(); fetchEquipments(); fetchCampuses(); }, []);

  const fetchList = async () => {
    try {
      const data = await getAllRooms();
      setRooms(Array.isArray(data) ? data : []);
    } catch (err) { console.error('Failed to load rooms', err); }
  };

  // fetch buildings optionally filtered by campusId
  const fetchBuildings = async (campusId) => {
    try {
      const data = await getAllBuildings();
      const all = Array.isArray(data) ? data : [];
      if (campusId) {
        setBuildings(all.filter(b => String(b.campus_id) === String(campusId)));
      } else {
        setBuildings(all);
      }
    } catch (err) { console.error('Failed to load buildings', err); setBuildings([]); }
  };

  const fetchCampuses = async () => {
    try {
      const data = await getAllCampus();
      setCampuses(Array.isArray(data) ? data : []);
    } catch (err) { console.error('Failed to load campuses', err); setCampuses([]); }
  };

  const fetchEquipments = async () => {
    try {
      setIsLoadingEquipments(true);
      const data = await getAllEquipments();
      // Debug logging to help diagnose why adminsite may not show equipments
      console.log('[RoomManagement] fetchEquipments - raw data from service:', data);
      const normalized = Array.isArray(data) ? data : (data && data.data) ? data.data : [];
      console.log('[RoomManagement] fetchEquipments - normalized equipments array:', normalized);
      setEquipments(normalized);
    } catch (err) { console.error('Failed to load equipments', err); setEquipments([]); }
    finally { setIsLoadingEquipments(false); }
  };

  const handleAddOpen = () => { setForm({ code: '', name: '', type: '', capacity_max: '', capacity_optimal: '', floor_number: '', status: '', buildings_id: '' }); setIsAddOpen(true); };
  // reset selected equipments when opening add and clear campus/buildings selection
  const openAddRoom = () => { setSelectedEquipments([]); setSelectedCampus(''); setBuildings([]); handleAddOpen(); };
  const handleAddClose = () => setIsAddOpen(false);

  const handleEditOpen = (r) => {
    setEditRoom(r);
    setForm({
      code: r.code || '',
      name: r.name || '',
      type: r.type || '',
      capacity_max: r.capacity_max ?? '',
      capacity_optimal: r.capacity_optimal ?? '',
      floor_number: r.floor_number ?? '',
      status: r.status || '',
      buildings_id: r.buildings_id || '',
    });
    // try to pre-select campus based on the room's building
    try {
      const b = buildings.find(bi => String(bi.id) === String(r.buildings_id));
      if (b) {
        setSelectedCampus(b.campus_id || '');
        fetchBuildings(b.campus_id || '');
      }
    } catch {
      // ignore
    }
    setIsEditOpen(true);
    // load equipments assigned to this room
    loadRoomEquipmentsForEdit(r.id);
  };
  // load existing room equipments when editing
  const loadRoomEquipmentsForEdit = async (roomId) => {
    try {
      const all = await getAllRoomEquipments();
      const related = (all || []).filter(re => String(re.room_id) === String(roomId)).map(re => ({ id: re.id, equipment_id: re.equipment_id, quantity: re.quantity }));
      setSelectedEquipments(related);
    } catch (err) { console.error('Failed to load room equipments', err); setSelectedEquipments([]); }
  };
  const handleEditClose = () => { setEditRoom(null); setIsEditOpen(false); };

  const filtered = rooms.filter((r) => {
    const q = (search || '').toLowerCase();
    return (r.name || '').toLowerCase().includes(q) || (r.code || '').toLowerCase().includes(q) || String(r.buildings_id || '').includes(q);
  });

  // equipment row helpers (manual add removed — selection only from fetched list)
  const updateEquipmentRow = (index, patch) => setSelectedEquipments(prev => prev.map((row, i) => i === index ? { ...row, ...patch } : row));

  // quick checkbox helpers for equipments list
  const handleEquipmentCheckboxToggle = (equipmentId) => {
    setSelectedEquipments(prev => {
      const exists = prev.find(p => String(p.equipment_id) === String(equipmentId));
      if (exists) return prev.filter(p => String(p.equipment_id) !== String(equipmentId));
      return [...prev, { equipment_id: equipmentId, quantity: 1 }];
    });
  };

  const selectAllEquipments = () => {
    setSelectedEquipments(equipments.map(e => ({ equipment_id: e.id, quantity: 1 })));
  };

  const clearAllEquipments = () => setSelectedEquipments([]);

  return (
    <>
      <PageMeta title="Quản lý phòng" description="Trang quản lý danh sách phòng trong hệ thống." />
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="flex justify-between items-center p-4">
          <div className="flex items-center gap-3">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm theo tên, mã hoặc tòa"
              className="border rounded px-3 py-2"
            />
            <Button size="sm" variant="outline" onClick={() => fetchList()}>Làm mới</Button>
          </div>
          <div className="flex justify-end items-center gap-3">
            <Button size="md" variant="primary" className="!px-6 !py-2 font-semibold bg-blue-600 hover:bg-blue-700" onClick={openAddRoom}>
              Thêm phòng
            </Button>
          </div>
        </div>

        <div className="max-w-full overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">STT</th>
                <th className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Mã</th>
                <th className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Tên</th>
                <th className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Tòa</th>
                <th className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Loại</th>
                <th className="px-5 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400">Sức chứa</th>
                <th className="px-5 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {filtered.map((r, idx) => (
                <tr key={r.id}>
                  <td className="px-5 py-4 sm:px-6 text-start">{idx + 1}</td>
                  <td className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">{r.code}</td>
                  <td className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">{r.name}</td>
                  <td className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">{(buildings.find(b => String(b.id) === String(r.buildings_id)) || {}).name || r.buildings_id}</td>
                  <td className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">{r.type}</td>
                  <td className="px-4 py-3 text-gray-500 text-center text-theme-sm dark:text-gray-400">{r.capacity_max ?? '-'}</td>
                  <td className="px-4 py-3 text-center">
                    <Button size="sm" variant="outline" className="mr-2" onClick={() => handleEditOpen(r)}>Sửa</Button>
                    <Button size="sm" variant="danger" onClick={() => { if(window.confirm('Bạn có chắc muốn xóa phòng này?')) { deleteRoom(r.id).then(() => fetchList()).catch(e => console.error(e)); } }}>Xóa</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Thêm phòng */}
      <Modal isOpen={isAddOpen} onClose={handleAddClose} className="max-w-2xl w-full mx-auto bg-white shadow-2xl">
        <div className="flex flex-col max-h-[90vh]">
          <div className="p-6 bg-gradient-to-r from-blue-600 to-blue-700 rounded-t-xl">
            <h2 className="text-2xl font-bold text-white text-center">Thêm phòng mới</h2>
          </div>
          <div className="overflow-y-auto px-8 py-6 bg-gradient-to-br from-white via-gray-50 to-gray-100">
            <form className="space-y-4" onSubmit={async (e) => {
              e.preventDefault(); setErrors(null);
              try {
                // convert numeric fields
                const payload = {
                  ...form,
                  capacity_max: form.capacity_max === '' ? null : Number(form.capacity_max),
                  capacity_optimal: form.capacity_optimal === '' ? null : Number(form.capacity_optimal),
                  floor_number: form.floor_number === '' ? null : Number(form.floor_number),
                  buildings_id: form.buildings_id === '' ? null : Number(form.buildings_id),
                };
                await createRoom(payload);
                // after room is created, create room-equipment links
                const created = await createRoom(payload);
                const roomId = created?.id || created?.data?.id || created?.data?.data?.id || created?.data?.id;
                // try to fallback to created.id
                const finalRoomId = roomId || created?.id;
                if (finalRoomId && selectedEquipments && selectedEquipments.length > 0) {
                  await Promise.all(selectedEquipments.filter(s => s.equipment_id).map(se => createRoomEquipment({ room_id: finalRoomId, equipment_id: se.equipment_id, quantity: Number(se.quantity || 1) })));
                }
                setIsAddOpen(false);
                fetchList();
              } catch (err) { console.error(err); setErrors(err?.response?.data || err?.message); }
            }}>
              {/* Thông tin cơ bản */}
              <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-700 mb-3 flex items-center">
                  <span className="bg-blue-100 text-blue-700 rounded-full w-6 h-6 flex items-center justify-center mr-2 text-sm">1</span>
                  Thông tin cơ bản
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-1 text-sm font-semibold text-gray-700">Mã phòng <span className="text-red-500">*</span></label>
                    <input className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent" type="text" value={form.code} onChange={(e) => setForm({...form, code: e.target.value})} required placeholder="VD: P101" />
                  </div>
                  <div>
                    <label className="block mb-1 text-sm font-semibold text-gray-700">Tên phòng <span className="text-red-500">*</span></label>
                    <input className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent" type="text" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} required placeholder="VD: Phòng học 101" />
                  </div>
                  <div>
                    <label className="block mb-1 text-sm font-semibold text-gray-700">Loại phòng</label>
                    <input className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent" type="text" value={form.type} onChange={(e) => setForm({...form, type: e.target.value})} placeholder="VD: Lý thuyết, Thực hành" />
                  </div>
                  <div>
                    <label className="block mb-1 text-sm font-semibold text-gray-700">Trạng thái</label>
                    <select className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent" value={form.status} onChange={(e) => setForm({...form, status: e.target.value})}>
                      <option value="">-- Chọn trạng thái --</option>
                      <option value="active">Hoạt động</option>
                      <option value="inactive">Không hoạt động</option>
                      <option value="maintenance">Bảo trì</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Vị trí */}
              <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-700 mb-3 flex items-center">
                  <span className="bg-blue-100 text-blue-700 rounded-full w-6 h-6 flex items-center justify-center mr-2 text-sm">2</span>
                  Vị trí
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block mb-1 text-sm font-semibold text-gray-700">Cơ sở <span className="text-red-500">*</span></label>
                    <select className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent" value={selectedCampus || ''} onChange={(e) => { setSelectedCampus(e.target.value); fetchBuildings(e.target.value); setForm({...form, buildings_id: '', floor_number: ''}); }} required>
                      <option value="">-- Chọn cơ sở --</option>
                      {campuses.map(c => (<option key={c.id} value={c.id}>{c.name || c.code || c.id}</option>))}
                    </select>
                  </div>
                  <div>
                    <label className="block mb-1 text-sm font-semibold text-gray-700">Tòa nhà <span className="text-red-500">*</span></label>
                    <select className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent" value={form.buildings_id || ''} onChange={(e) => setForm({...form, buildings_id: e.target.value, floor_number: ''})} required>
                      <option value="">-- Chọn tòa --</option>
                      {buildings.map(b => (<option key={b.id} value={b.id}>{b.name || b.id} {b.floor_count ? `(${b.floor_count} tầng)` : ''}</option>))}
                    </select>
                  </div>
                  <div>
                    <label className="block mb-1 text-sm font-semibold text-gray-700">Tầng</label>
                    <select 
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                      value={form.floor_number || ''} 
                      onChange={(e) => setForm({...form, floor_number: e.target.value})}
                      disabled={!form.buildings_id}
                    >
                      <option value="">-- Chọn tầng --</option>
                      {form.buildings_id && (() => {
                        const selectedBuilding = buildings.find(b => String(b.id) === String(form.buildings_id));
                        const maxFloor = selectedBuilding?.floor_count || 10;
                        return Array.from({length: maxFloor}, (_, i) => (
                          <option key={i+1} value={i+1}>Tầng {i+1}</option>
                        ));
                      })()}
                    </select>
                  </div>
                </div>
              </div>

              {/* Sức chứa */}
              <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-700 mb-3 flex items-center">
                  <span className="bg-blue-100 text-blue-700 rounded-full w-6 h-6 flex items-center justify-center mr-2 text-sm">3</span>
                  Sức chứa
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-1 text-sm font-semibold text-gray-700">Sức chứa tối đa</label>
                    <input className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent" type="number" value={form.capacity_max} onChange={(e) => setForm({...form, capacity_max: e.target.value})} placeholder="Số người tối đa" />
                  </div>
                  <div>
                    <label className="block mb-1 text-sm font-semibold text-gray-700">Sức chứa tối ưu</label>
                    <input className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent" type="number" value={form.capacity_optimal} onChange={(e) => setForm({...form, capacity_optimal: e.target.value})} placeholder="Số người tối ưu" />
                  </div>
                </div>
              </div>

              {/* Thiết bị */}
              <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-700 mb-3 flex items-center">
                  <span className="bg-blue-100 text-blue-700 rounded-full w-6 h-6 flex items-center justify-center mr-2 text-sm">4</span>
                  Thiết bị
                </h3>
                {isLoadingEquipments ? (
                  <div className="text-center py-6">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-blue-600"></div>
                    <p className="text-gray-500 mt-2">Đang tải danh sách thiết bị...</p>
                  </div>
                ) : equipments.length === 0 ? (
                  <div className="text-center py-6 bg-gray-50 rounded-lg">
                    <p className="text-gray-500">Chưa có thiết bị trong hệ thống</p>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-sm text-gray-600">Chọn thiết bị cho phòng ({selectedEquipments.length} đã chọn)</span>
                      <div className="flex gap-2">
                        <button type="button" className="text-sm text-blue-600 hover:text-blue-800 font-medium" onClick={selectAllEquipments}>Chọn tất cả</button>
                        <span className="text-gray-400">|</span>
                        <button type="button" className="text-sm text-gray-600 hover:text-gray-800 font-medium" onClick={clearAllEquipments}>Bỏ chọn</button>
                      </div>
                    </div>
                    <div className="border border-gray-300 rounded-lg p-3 max-h-48 overflow-y-auto bg-gray-50">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {equipments.map(eq => {
                          const selected = selectedEquipments.find(se => String(se.equipment_id) === String(eq.id));
                          return (
                            <div key={eq.id} className="flex items-center gap-2 bg-white rounded p-2 hover:bg-blue-50 transition-colors">
                              <input
                                type="checkbox"
                                id={`equip-${eq.id}`}
                                checked={!!selected}
                                onChange={() => handleEquipmentCheckboxToggle(eq.id)}
                                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                              />
                              <label htmlFor={`equip-${eq.id}`} className="flex-1 text-sm text-gray-700 cursor-pointer">{eq.name || eq.code || `#${eq.id}`}</label>
                              {selected && (
                                <input
                                  type="number"
                                  min="1"
                                  value={selected.quantity || 1}
                                  onChange={(e) => {
                                    const idx = selectedEquipments.findIndex(se => String(se.equipment_id) === String(eq.id));
                                    if (idx !== -1) updateEquipmentRow(idx, { quantity: e.target.value });
                                  }}
                                  className="w-16 border border-gray-300 rounded px-2 py-1 text-sm"
                                  placeholder="SL"
                                />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </>
                )}
              </div>

              {errors && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm text-red-600">{typeof errors === 'string' ? errors : JSON.stringify(errors)}</p>
                </div>
              )}
            </form>
          </div>
          <div className="flex justify-end gap-3 p-6 bg-gray-50 border-t border-gray-200 rounded-b-xl">
            <Button size="md" variant="outline" className="font-semibold px-6 py-2" onClick={handleAddClose}>Hủy</Button>
            <Button size="md" variant="primary" className="bg-blue-600 hover:bg-blue-700 font-semibold px-6 py-2" onClick={() => document.querySelector('form').requestSubmit()}>
              <svg className="w-5 h-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              Lưu phòng
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal Sửa phòng */}
      <Modal isOpen={isEditOpen} onClose={handleEditClose} className="max-w-2xl w-full mx-auto bg-white shadow-2xl">
        <div className="flex flex-col max-h-[90vh]">
          <div className="p-6 bg-gradient-to-r from-yellow-600 to-yellow-700 rounded-t-xl">
            <h2 className="text-2xl font-bold text-white text-center">Chỉnh sửa phòng</h2>
          </div>
          <div className="overflow-y-auto px-8 py-6 bg-gradient-to-br from-white via-gray-50 to-gray-100">
            <form className="space-y-4" onSubmit={async (e) => { e.preventDefault(); setErrors(null); try {
            const payload = {
              ...form,
              capacity_max: form.capacity_max === '' ? null : Number(form.capacity_max),
              capacity_optimal: form.capacity_optimal === '' ? null : Number(form.capacity_optimal),
              floor_number: form.floor_number === '' ? null : Number(form.floor_number),
              buildings_id: form.buildings_id === '' ? null : Number(form.buildings_id),
            };
            await updateRoom(editRoom.id, payload);
            // remove existing relations and recreate
            try {
              const allRE = await getAllRoomEquipments();
              const related = (allRE || []).filter(re => String(re.room_id) === String(editRoom.id));
              await Promise.all(related.map(rItem => deleteRoomEquipment(rItem.id)));
              if (selectedEquipments && selectedEquipments.length > 0) {
                await Promise.all(selectedEquipments.filter(s => s.equipment_id).map(se => createRoomEquipment({ room_id: editRoom.id, equipment_id: se.equipment_id, quantity: Number(se.quantity || 1) })));
              }
            } catch (ree) { console.error('Failed to sync room equipments', ree); }
            setIsEditOpen(false);
            fetchList();
          } catch (err) { console.error(err); setErrors(err?.response?.data || err?.message); } }}>
              {/* Thông tin cơ bản */}
              <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-700 mb-3 flex items-center">
                  <span className="bg-yellow-100 text-yellow-700 rounded-full w-6 h-6 flex items-center justify-center mr-2 text-sm">1</span>
                  Thông tin cơ bản
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-1 text-sm font-semibold text-gray-700">Mã phòng <span className="text-red-500">*</span></label>
                    <input className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-yellow-500 focus:border-transparent" type="text" value={form.code} onChange={(e) => setForm({...form, code: e.target.value})} required placeholder="VD: P101" />
                  </div>
                  <div>
                    <label className="block mb-1 text-sm font-semibold text-gray-700">Tên phòng <span className="text-red-500">*</span></label>
                    <input className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-yellow-500 focus:border-transparent" type="text" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} required placeholder="VD: Phòng học 101" />
                  </div>
                  <div>
                    <label className="block mb-1 text-sm font-semibold text-gray-700">Loại phòng</label>
                    <input className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-yellow-500 focus:border-transparent" type="text" value={form.type} onChange={(e) => setForm({...form, type: e.target.value})} placeholder="VD: Lý thuyết, Thực hành" />
                  </div>
                  <div>
                    <label className="block mb-1 text-sm font-semibold text-gray-700">Trạng thái</label>
                    <select className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-yellow-500 focus:border-transparent" value={form.status} onChange={(e) => setForm({...form, status: e.target.value})}>
                      <option value="">-- Chọn trạng thái --</option>
                      <option value="active">Hoạt động</option>
                      <option value="inactive">Không hoạt động</option>
                      <option value="maintenance">Bảo trì</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Vị trí */}
              <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-700 mb-3 flex items-center">
                  <span className="bg-yellow-100 text-yellow-700 rounded-full w-6 h-6 flex items-center justify-center mr-2 text-sm">2</span>
                  Vị trí
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-1 text-sm font-semibold text-gray-700">Tòa nhà <span className="text-red-500">*</span></label>
                    <select className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-yellow-500 focus:border-transparent" value={form.buildings_id || ''} onChange={(e) => setForm({...form, buildings_id: e.target.value, floor_number: ''})} required>
                      <option value="">-- Chọn tòa --</option>
                      {buildings.map(b => (<option key={b.id} value={b.id}>{b.name || b.id} {b.floor_count ? `(${b.floor_count} tầng)` : ''}</option>))}
                    </select>
                  </div>
                  <div>
                    <label className="block mb-1 text-sm font-semibold text-gray-700">Tầng</label>
                    <select 
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-yellow-500 focus:border-transparent" 
                      value={form.floor_number || ''} 
                      onChange={(e) => setForm({...form, floor_number: e.target.value})}
                      disabled={!form.buildings_id}
                    >
                      <option value="">-- Chọn tầng --</option>
                      {form.buildings_id && (() => {
                        const selectedBuilding = buildings.find(b => String(b.id) === String(form.buildings_id));
                        const maxFloor = selectedBuilding?.floor_count || 10;
                        return Array.from({length: maxFloor}, (_, i) => (
                          <option key={i+1} value={i+1}>Tầng {i+1}</option>
                        ));
                      })()}
                    </select>
                  </div>
                </div>
              </div>

              {/* Sức chứa */}
              <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-700 mb-3 flex items-center">
                  <span className="bg-yellow-100 text-yellow-700 rounded-full w-6 h-6 flex items-center justify-center mr-2 text-sm">3</span>
                  Sức chứa
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-1 text-sm font-semibold text-gray-700">Sức chứa tối đa</label>
                    <input className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-yellow-500 focus:border-transparent" type="number" value={form.capacity_max} onChange={(e) => setForm({...form, capacity_max: e.target.value})} placeholder="Số người tối đa" />
                  </div>
                  <div>
                    <label className="block mb-1 text-sm font-semibold text-gray-700">Sức chứa tối ưu</label>
                    <input className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-yellow-500 focus:border-transparent" type="number" value={form.capacity_optimal} onChange={(e) => setForm({...form, capacity_optimal: e.target.value})} placeholder="Số người tối ưu" />
                  </div>
                </div>
              </div>

              {/* Thiết bị */}
              <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-700 mb-3 flex items-center">
                  <span className="bg-yellow-100 text-yellow-700 rounded-full w-6 h-6 flex items-center justify-center mr-2 text-sm">4</span>
                  Thiết bị
                </h3>
                {isLoadingEquipments ? (
                  <div className="text-center py-6">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-yellow-600"></div>
                    <p className="text-gray-500 mt-2">Đang tải danh sách thiết bị...</p>
                  </div>
                ) : equipments.length === 0 ? (
                  <div className="text-center py-6 bg-gray-50 rounded-lg">
                    <p className="text-gray-500">Chưa có thiết bị trong hệ thống</p>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-sm text-gray-600">Chọn thiết bị cho phòng ({selectedEquipments.length} đã chọn)</span>
                      <div className="flex gap-2">
                        <button type="button" className="text-sm text-yellow-600 hover:text-yellow-800 font-medium" onClick={selectAllEquipments}>Chọn tất cả</button>
                        <span className="text-gray-400">|</span>
                        <button type="button" className="text-sm text-gray-600 hover:text-gray-800 font-medium" onClick={clearAllEquipments}>Bỏ chọn</button>
                      </div>
                    </div>
                    <div className="border border-gray-300 rounded-lg p-3 max-h-48 overflow-y-auto bg-gray-50">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {equipments.map(eq => {
                          const selected = selectedEquipments.find(se => String(se.equipment_id) === String(eq.id));
                          return (
                            <div key={eq.id} className="flex items-center gap-2 bg-white rounded p-2 hover:bg-yellow-50 transition-colors">
                              <input
                                type="checkbox"
                                id={`equip-edit-${eq.id}`}
                                checked={!!selected}
                                onChange={() => handleEquipmentCheckboxToggle(eq.id)}
                                className="h-4 w-4 text-yellow-600 border-gray-300 rounded focus:ring-yellow-500"
                              />
                              <label htmlFor={`equip-edit-${eq.id}`} className="flex-1 text-sm text-gray-700 cursor-pointer">{eq.name || eq.code || `#${eq.id}`}</label>
                              {selected && (
                                <input
                                  type="number"
                                  min="1"
                                  value={selected.quantity || 1}
                                  onChange={(e) => {
                                    const idx = selectedEquipments.findIndex(se => String(se.equipment_id) === String(eq.id));
                                    if (idx !== -1) updateEquipmentRow(idx, { quantity: e.target.value });
                                  }}
                                  className="w-16 border border-gray-300 rounded px-2 py-1 text-sm"
                                  placeholder="SL"
                                />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </>
                )}
              </div>

              {errors && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm text-red-600">{typeof errors === 'string' ? errors : JSON.stringify(errors)}</p>
                </div>
              )}
            </form>
          </div>
          <div className="flex justify-end gap-3 p-6 bg-gray-50 border-t border-gray-200 rounded-b-xl">
            <Button size="md" variant="outline" className="font-semibold px-6 py-2" onClick={handleEditClose}>Hủy</Button>
            <Button size="md" variant="primary" className="bg-yellow-500 hover:bg-yellow-600 font-semibold px-6 py-2" onClick={() => document.querySelectorAll('form')[1]?.requestSubmit()}>
              <svg className="w-5 h-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              Cập nhật
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
