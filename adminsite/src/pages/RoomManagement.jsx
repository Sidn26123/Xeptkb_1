import { useState, useEffect, useRef, useMemo } from "react";
import Button from "../components/ui/button/Button.jsx";
import Modal from "../components/ui/modal/index.jsx";
import PageMeta from "../components/common/PageMeta.jsx";
import { getAllRooms, createRoom, updateRoom, deleteRoom } from '../services/roomService.js';
import { getAllBuildings, getBuildingById } from '../services/buildingService.js';
// client-side validation removed per request (yup validation disabled)
import { getAllCampus } from '../services/campusService.js';
import { getAllEquipments } from '../services/equipmentService.js';
import { createRoomEquipment, getRoomEquipmentsByRoomId, deleteRoomEquipment } from '../services/roomEquipmentService.js';
import parseRoomCode from '../utils/parseRoomCode.js';
import {showError, showSuccess} from "../utils/toastUtils.js";

export default function RoomManagement() {
  const [rooms, setRooms] = useState([]);
  const [buildings, setBuildings] = useState([]);
  const [allBuildings, setAllBuildings] = useState([]);
  const [campuses, setCampuses] = useState([]);
  const [selectedCampus, setSelectedCampus] = useState('');
  const [search, setSearch] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editRoom, setEditRoom] = useState(null);
  const [form, setForm] = useState({ code: '', name: '', type: '', capacity_max: '', capacity_optimal: '', floor_number: '', status: '', buildings_id: '', room_seq: '' });
  const [equipments, setEquipments] = useState([]);
  const [isLoadingEquipments, setIsLoadingEquipments] = useState(false);
  const [selectedEquipments, setSelectedEquipments] = useState([]); // { equipment_id, quantity, id? }

  // NOTE: fetch functions are defined below; the actual on-mount effect is placed after their definitions.
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
      // keep a master list of buildings for table lookups
      setAllBuildings(all);
      if (campusId) {
        setBuildings(all.filter(b => String(b.campus_id) === String(campusId)));
      } else {
        // do not auto-populate the building dropdown when no campus selected
        setBuildings([]);
      }
    } catch (err) { console.error('Failed to load buildings', err); setBuildings([]); }
  };

  // fetch campuses
  const fetchCampuses = async () => {
    try {
      const data = await getAllCampus();
      setCampuses(Array.isArray(data) ? data : []);
    } catch (err) { console.error('Failed to load campuses', err); setCampuses([]); }
  };

  // fetch equipments
  const fetchEquipments = async () => {
    try {
      setIsLoadingEquipments(true);
      const data = await getAllEquipments();
      setEquipments(Array.isArray(data) ? data : []);
    } catch (err) { console.error('Failed to load equipments', err); setEquipments([]); }
    finally { setIsLoadingEquipments(false); }
  };

  // refs and helper state
  const addFormRef = useRef(null);
  const editFormRef = useRef(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // modal open/close helpers
  const openAddRoom = () => {
    setForm({ code: '', name: '', type: '', capacity_max: '', capacity_optimal: '', floor_number: '', status: '', buildings_id: '', room_seq: '' });
    setSelectedCampus('');
    setBuildings([]);
    setSelectedEquipments([]);
    setErrors({});
    setIsAddOpen(true);
  };

  const handleAddClose = () => {
    setIsAddOpen(false);
  };

  const handleEditClose = () => {
    setIsEditOpen(false);
    setEditRoom(null);
  };

  const handleEditOpen = async (r) => {
    if (!r) return;
    setEditRoom(r);
    // clear previous errors and selected equipments when opening edit modal
    setErrors({});
    setSelectedEquipments([]);
    // populate form with room values
    setForm({
      code: r.code || '',
      name: r.name || '',
      type: r.type || '',
      capacity_max: r.capacity_max ?? '',
      capacity_optimal: r.capacity_optimal ?? '',
      floor_number: r.floor_number ?? '',
      status: r.status || '',
      buildings_id: r.buildings_id || '',
      room_seq: r.room_seq || '',
    });
    // fetch building to determine campus and populate buildings list
    try {
      // Ensure we have a master list of buildings available for parsing/matching
      if (!allBuildings || allBuildings.length === 0) {
        await fetchBuildings(); // populates `allBuildings`
      }

      // If a concrete building id exists on the room, prefer that (lookup campus and buildings list)
      if (r.buildings_id) {
        const b = await getBuildingById(r.buildings_id);
        const campusId = b?.campus_id || '';
        setSelectedCampus(campusId);
        await fetchBuildings(campusId);
        // ensure form.buildings_id stays in sync (in case it's missing)
        setForm(prev => ({ ...prev, buildings_id: r.buildings_id || prev.buildings_id }));
      }

      // If any of the position pieces are missing (building, floor, or room_seq),
      // try to parse them from the room code as a fallback.
      if (r.code && (!r.buildings_id || r.floor_number === undefined || r.floor_number === null || r.room_seq === undefined || r.room_seq === null)) {
        try {
          const parsed = parseRoomCode(r.code, allBuildings || []);
          if (parsed) {
            // parsed.campusPart may be an id or a code; try to resolve against loaded campuses
            let campusToUse = parsed.campusPart;
            const campusMatch = campuses.find(c => String(c.id) === String(parsed.campusPart) || String(c.code) === String(parsed.campusPart));
            if (campusMatch) campusToUse = campusMatch.id;

            setSelectedCampus(campusToUse || '');

            // fetch buildings for the resolved campus so the building dropdown populates
            if (campusToUse) await fetchBuildings(campusToUse);

            // try to resolve parsed.buildingId to an actual building id in allBuildings
            let buildingIdToUse = parsed.buildingId;
            if (parsed.buildingId) {
              const bMatch = (allBuildings || []).find(bb => String(bb.id) === String(parsed.buildingId) || String(bb.code) === String(parsed.buildingId) || String(bb.name) === String(parsed.buildingId));
              if (bMatch) buildingIdToUse = bMatch.id;
            }

            setForm(prev => ({
              ...prev,
              buildings_id: buildingIdToUse || prev.buildings_id || '',
              floor_number: parsed.floor ?? prev.floor_number,
              room_seq: parsed.room_seq ?? prev.room_seq,
            }));
          }
        } catch (pe) {
          // parsing failed — continue without parsed values
          console.warn('handleEditOpen: parseRoomCode failed', pe);
        }
      }
      // If after all attempts we don't have a campus/buildings list, ensure UI shows empty
      if (!selectedCampus) {
        // leave selectedCampus as '' (controlled select will show placeholder)
      }
    } catch (err) {
      console.error('handleEditOpen: failed to load building', err);
    }
    // load existing equipments for this room so the edit modal can render checked items
    try {
      // ensure equipments list is loaded so labels and ids exist when rendering
      if (!equipments || equipments.length === 0) {
        await fetchEquipments();
      }
      const existing = await getRoomEquipmentsByRoomId(r.id);
      const nextSelected = (existing || []).map(ex => ({ equipment_id: ex.equipment_id, quantity: Number(ex.quantity) || 1, id: ex.id }));
      setSelectedEquipments(nextSelected);
    } catch (err) {
      console.error('handleEditOpen: failed to load room equipments', err);
      setSelectedEquipments([]);
    }
    // don't overwrite existing code while editing (we will compute code from fields below)
    setIsEditOpen(true);
  };

  // On mount: fetch campuses, equipments and room list.
  useEffect(() => { fetchCampuses(); fetchEquipments(); fetchList(); }, []);
  // client-side error map (field => message)
  const [errors, setErrors] = useState({});

  // Apply server-side validation payload to local `errors` state.
  // Expected server payload shape:
  // { error: 'Validation failed', errors: [{ type: 'field', value, msg, path, location }] }
  const applyServerValidation = (data) => {
    try {
      const next = { ...errors };
      if (data) {
        // map field errors
        if (Array.isArray(data.errors)) {
          data.errors.forEach((it) => {
            try {
              if (it && it.path) {
                next[it.path] = it.msg || it.message || String(it);
              }
            } catch { /* ignore malformed item */ }
          });
        }

        // top-level error -> errors.general
        if (data.error || data.message) {
          next.general = data.error || data.message;
        }
      }
      setErrors(next);
      // scroll to first error field if any
      const keys = Object.keys(next).filter(k => next[k]);
      if (keys.length > 0) {
        const first = keys[0];
        const el = document.getElementById(first);
        if (el && typeof el.scrollIntoView === 'function') {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          try { el.focus && el.focus(); } catch { /* ignore focus errors */ }
        }
      }
    } catch {
      // fallback: set generic message
      setErrors(prev => ({ ...prev, general: data?.error || data?.message || 'Lỗi không xác định' }));
    }
  };

  // Debounced search to reduce frequent filtering during typing
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 250);
    return () => clearTimeout(t);
  }, [search]);

  // client-side validation removed — no local validation or error state

  // Helper to set form field and clear field-specific error when user edits
  const setFormField = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors && errors[field]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  // Return <option> elements for floors of a building (uses fetched `buildings` data)
  const getFloorOptions = (buildingId) => {
    if (!buildingId) return null;
    const selectedBuilding = buildings.find(b => String(b.id) === String(buildingId));
    // If building.floor_count = N, we treat floors as 0..N-1 where 0 is the ground floor (tầng trệt)
    const maxFloor = Number(selectedBuilding?.floor_count) || 0;
    if (maxFloor <= 0) return null;
    return Array.from({ length: maxFloor }, (_, i) => (
      // value = floor index (0 = ground)
      <option key={i} value={i}>{i === 0 ? 'Tầng trệt' : `Tầng ${i}`}</option>
    ));
  };

    // Auto-generate room code when campus/building/floor/room_seq are set.
  // Note: floor may be '0' (ground floor) so check explicitly for empty/undefined values.
  useEffect(() => {
  const campus = selectedCampus;
  const buildingId = form.buildings_id;
  const floor = form.floor_number;
  const seq = form.room_seq;
    // require non-empty campus and building (campus may be 0 so check explicit emptiness)
    const campusMissing = (campus === '' || campus === null || typeof campus === 'undefined');
    const buildingMissing = (buildingId === '' || buildingId === null || typeof buildingId === 'undefined');
    const floorMissing = (floor === '' || floor === null || typeof floor === 'undefined');
    const seqMissing = (seq === '' || seq === null || typeof seq === 'undefined');

    // if any position info is missing, clear auto-generated code
    if (campusMissing || buildingMissing || floorMissing || seqMissing) {
      // only clear if there's currently a code to avoid unnecessary state updates
      if (form.code) setForm(prev => ({ ...prev, code: '' }));
      return;
    }

    // try to find building label (first alnum token or char)
    let bLabel = '';
    const b = buildings.find(x => String(x.id) === String(buildingId)) || allBuildings.find(x => String(x.id) === String(buildingId));
    if (b) {
      // prefer building.code when available, fallback to name then id
      // Use the LAST alphanumeric token and take its LAST character as building label
      const raw = String(b.code || b.name || b.id || '').trim();
      const tokens = raw.match(/[A-Za-z0-9]+/g) || [];
      const token = tokens.length ? tokens[tokens.length - 1] : raw;
      if (token && token.length) bLabel = String(token.charAt(token.length - 1)).toUpperCase();
      else bLabel = '';
    }
    const campusLabel = String(campus);
    const newCode = `${campusLabel}${bLabel}${String(floor)}${String(seq)}`;
    setForm(prev => ({ ...prev, code: newCode }));
  }, [selectedCampus, form.buildings_id, form.floor_number, form.room_seq, buildings, allBuildings, form.code]);

  // Validate room form client-side before submit
  const validateForm = () => {
    const newErrors = {};
    // code (required, 2-30 chars)
    if (!String(form.code || '').trim()) {
      newErrors.code = 'Mã phòng là bắt buộc';
    } else if (String(form.code).trim().length < 2 || String(form.code).trim().length > 30) {
      newErrors.code = 'Mã phòng phải có độ dài từ 2 đến 30 ký tự';
    }
    // name (required)
    if (!String(form.name || '').trim()) {
      newErrors.name = 'Tên phòng là bắt buộc';
    }
    // buildings_id (required)
    if (!form.buildings_id) {
      newErrors.buildings_id = 'Vui lòng chọn tòa nhà';
    }
    // campus (required)
    if (!selectedCampus) {
      newErrors.selectedCampus = 'Vui lòng chọn cơ sở';
    }
    // type (required)
    if (!String(form.type || '').trim()) {
      newErrors.type = 'Vui lòng nhập loại phòng';
    }
    // status (required)
    if (!String(form.status || '').trim()) {
      newErrors.status = 'Vui lòng chọn trạng thái phòng';
    }
    // capacity_max (required, integer >=1, <=1000)
    if (form.capacity_max === '' || form.capacity_max === null || typeof form.capacity_max === 'undefined') {
      newErrors.capacity_max = 'Sức chứa tối đa là bắt buộc';
    } else {
      const n = Number(form.capacity_max);
      if (!Number.isInteger(n) || isNaN(n)) {
        newErrors.capacity_max = 'Sức chứa tối đa phải là số nguyên';
      } else if (n < 1) {
        newErrors.capacity_max = 'Sức chứa tối đa phải lớn hơn hoặc bằng 1';
      } else if (n > 1000) {
        newErrors.capacity_max = 'Sức chứa tối đa không được vượt quá 1000';
      }
    }
    // capacity_optimal (required, integer >=0 and <= capacity_max)
    if (form.capacity_optimal === '' || form.capacity_optimal === null || typeof form.capacity_optimal === 'undefined') {
      newErrors.capacity_optimal = 'Sức chứa tối ưu là bắt buộc';
    } else {
      const m = Number(form.capacity_optimal);
      if (!Number.isInteger(m) || isNaN(m)) {
        newErrors.capacity_optimal = 'Sức chứa tối ưu phải là số nguyên';
      } else if (m < 0) {
        newErrors.capacity_optimal = 'Sức chứa tối ưu không được nhỏ hơn 0';
      } else if ((form.capacity_max !== '' && form.capacity_max !== null && typeof form.capacity_max !== 'undefined') && Number(form.capacity_max) <= m) {
        // Enforce strict inequality: optimal must be less than max
        newErrors.capacity_optimal = 'Sức chứa tối ưu phải nhỏ hơn sức chứa tối đa';
      }
    }
    // floor_number (required, integer between -10 and 100)
    if (form.floor_number === '' || form.floor_number === null || typeof form.floor_number === 'undefined') {
      newErrors.floor_number = 'Vui lòng chọn tầng';
    } else {
      const f = Number(form.floor_number);
      if (!Number.isInteger(f) || isNaN(f)) {
        newErrors.floor_number = 'Tầng phải là một số nguyên';
      } else if (f < -10 || f > 100) {
        newErrors.floor_number = 'Tầng không hợp lệ';
      }
    }
    // room sequence (required to auto-generate code)
    if (!form.room_seq && String(form.room_seq) !== '0') {
      newErrors.room_seq = 'Vui lòng nhập số phòng';
    }

    setErrors(newErrors);

    // scroll to first error field if any
    const keys = Object.keys(newErrors);
    if (keys.length > 0) {
      const first = keys[0];
      const el = document.getElementById(first);
      if (el && typeof el.scrollIntoView === 'function') {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        try { el.focus && el.focus(); } catch { /* ignore focus errors */ }
      }
    }
    return keys.length === 0;
  };

  // Submit handler for creating a new room
  const handleAddSubmit = async (e) => {
    e && e.preventDefault && e.preventDefault();
    // prevent duplicate submits
    if (isSubmitting) return;

    // clear previous general errors
    setErrors(prev => ({ ...prev, general: undefined }));

    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      // prepare payload: cast numeric fields
      const payload = {
        code: String(form.code || '').trim(),
        name: String(form.name || '').trim(),
        type: String(form.type || '').trim(),
        status: String(form.status || '').trim(),
        buildings_id: form.buildings_id || null,
        room_seq: form.room_seq === '' || form.room_seq === null || typeof form.room_seq === 'undefined' ? null : Number(form.room_seq),
        capacity_max: form.capacity_max === '' ? null : Number(form.capacity_max),
        capacity_optimal: form.capacity_optimal === '' ? null : Number(form.capacity_optimal),
        floor_number: form.floor_number === '' ? null : Number(form.floor_number),
      };

      const created = await createRoom(payload);
      if (!created || !created.id) {
        setErrors(prev => ({ ...prev, general: 'Tạo phòng thất bại, vui lòng thử lại.' }));
        showError('Tạo phòng thất bại');
        return;
      }

      // create room-equipment relations if any selected
      if (selectedEquipments && selectedEquipments.length > 0) {
        await Promise.all(selectedEquipments.map(se => createRoomEquipment({ room_id: created.id, equipment_id: Number(se.equipment_id), quantity: Number(se.quantity || 1) })).map(p => p.catch(err => { console.error('createRoomEquipment failed', err); })));
      }

      showSuccess('Tạo phòng thành công');
      handleAddClose();
      fetchList();
    } catch (err) {
      console.error('handleAddSubmit error', err);
      const data = err?.response?.data;
      if (data) {
        applyServerValidation(data);
        const top = data.message || data.error || err?.message || 'Lỗi không xác định';
        showError(top);
      } else {
        const msg = err?.message || 'Lỗi không xác định';
        setErrors(prev => ({ ...prev, general: msg }));
        showError(msg);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit handler for updating an existing room
  const handleEditSubmit = async (e) => {
    e && e.preventDefault && e.preventDefault();
    if (!editRoom) return;
    if (isSubmitting) return;

    setErrors(prev => ({ ...prev, general: undefined }));

    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const payload = {
        code: String(form.code || '').trim(),
        name: String(form.name || '').trim(),
        type: String(form.type || '').trim(),
        status: String(form.status || '').trim(),
        buildings_id: form.buildings_id || null,
        room_seq: form.room_seq === '' || form.room_seq === null || typeof form.room_seq === 'undefined' ? null : Number(form.room_seq),
        capacity_max: form.capacity_max === '' ? null : Number(form.capacity_max),
        capacity_optimal: form.capacity_optimal === '' ? null : Number(form.capacity_optimal),
        floor_number: form.floor_number === '' ? null : Number(form.floor_number),
      };

      const updated = await updateRoom(editRoom.id, payload);
      if (!updated) {
        setErrors(prev => ({ ...prev, general: 'Cập nhật phòng thất bại, vui lòng thử lại.' }));
        showError('Cập nhật phòng thất bại');
        return;
      }

      // sync equipments: remove all existing relations for this room then recreate from selectedEquipments
      try {
  const existing = await getRoomEquipmentsByRoomId(editRoom.id);

  // delete existing relations
  await Promise.all((existing || []).map(ex => deleteRoomEquipment(ex.id).catch(err => { console.error('deleteRoomEquipment failed', err); })));

        // recreate based on selectedEquipments
        if (selectedEquipments && selectedEquipments.length > 0) {
          await Promise.all(selectedEquipments.map(se => createRoomEquipment({ room_id: editRoom.id, equipment_id: Number(se.equipment_id), quantity: Number(se.quantity || 1) }).catch(err => { console.error('createRoomEquipment failed', err); })));
        }
      } catch (err) {
        console.error('sync room equipments failed', err);
        // don't fail the whole update - just warn
        showError('Cập nhật thiết bị cho phòng gặp lỗi (bỏ qua)');
      }

      showSuccess('Cập nhật phòng thành công');
      handleEditClose();
      fetchList();
    } catch (err) {
      console.error('handleEditSubmit error', err);
      const data = err?.response?.data;
      if (data) {
        applyServerValidation(data);
        const top = data.message || data.error || err?.message || 'Lỗi không xác định';
        showError(top);
      } else {
        const msg = err?.message || 'Lỗi không xác định';
        setErrors(prev => ({ ...prev, general: msg }));
        showError(msg);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const filtered = useMemo(() => {
    const q = (debouncedSearch || '').toLowerCase();
    return rooms.filter((r) => (r.name || '').toLowerCase().includes(q) || (r.code || '').toLowerCase().includes(q) || String(r.buildings_id || '').includes(q));
  }, [rooms, debouncedSearch]);

  // equipment row helpers (manual add removed — selection only from fetched list)
  const updateEquipmentRow = (index, patch) => {
    setSelectedEquipments(prev => {
      const next = prev.map((row, i) => i === index ? { ...row, ...patch } : row);
      return next;
    });
  };

  // quick checkbox helpers for equipments list
  const handleEquipmentCheckboxToggle = (equipmentId) => {
    setSelectedEquipments(prev => {
      const exists = prev.find(p => String(p.equipment_id) === String(equipmentId));
      const next = exists ? prev.filter(p => String(p.equipment_id) !== String(equipmentId)) : [...prev, { equipment_id: equipmentId, quantity: 1 }];
      return next;
    });
  };

  const selectAllEquipments = () => {
    const next = equipments.map(e => ({ equipment_id: e.id, quantity: 1 }));
    setSelectedEquipments(next);
  };

  const clearAllEquipments = () => {
    setSelectedEquipments([]);
  };

  return (
    <>
      <PageMeta title="Quản lý phòng" description="Trang quản lý danh sách phòng trong hệ thống." />
  <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/5 dark:bg-white/3">
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
            <Button size="md" variant="primary" className="px-6 py-2 font-semibold bg-blue-600 hover:bg-blue-700" onClick={openAddRoom}>
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
            <tbody className="divide-y divide-gray-100 dark:divide-white/5">
              {filtered.map((r, idx) => (
                <tr key={r.id}>
                  <td className="px-5 py-4 sm:px-6 text-start">{idx + 1}</td>
                  <td className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">{r.code}</td>
                  <td className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">{r.name}</td>
                  <td className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">{(allBuildings.find(b => String(b.id) === String(r.buildings_id)) || {}).name || r.buildings_id}</td>
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
          <div className="p-6 bg-linear-to-r from-blue-600 to-blue-700 rounded-t-xl">
            <h2 className="text-2xl font-bold text-white text-center">Thêm phòng mới</h2>
          </div>
          <div className="overflow-y-auto px-8 py-6 bg-linear-to-br from-white via-gray-50 to-gray-100">
            <form ref={addFormRef} className="space-y-4" onSubmit={handleAddSubmit}>
              {/* general form-level error (show server or general validation messages here) */}
              {errors && (errors.general || errors._global) && (
                <div className="mb-4 p-3 rounded bg-red-50 border border-red-200 text-red-800">
                  <strong className="block font-medium">Lỗi</strong>
                  <p className="text-sm mt-1">{errors.general || errors._global}</p>
                </div>
              )}
              {/* Vị trí */}
              <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-700 mb-3 flex items-center">
                  <span className="bg-blue-100 text-blue-700 rounded-full w-6 h-6 flex items-center justify-center mr-2 text-sm">1</span>
                  Vị trí
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-1 text-sm font-semibold text-gray-700">Cơ sở <span className="text-red-500">*</span></label>
                    <select id="selectedCampus" className={`w-full rounded-lg px-3 py-2 border ${errors.selectedCampus ? 'border-red-500' : 'border-blue-500'} focus:ring-2 focus:ring-blue-500 focus:border-blue-500`} value={selectedCampus || ''} onChange={(e) => {
                        const val = e.target.value;
                        setSelectedCampus(val);
                        // clear campus-specific error when user changes selection
                        setErrors(prev => { const next = { ...prev }; delete next.selectedCampus; return next; });
                        // fetch buildings that belong to selected campus and reset dependent fields
                        fetchBuildings(val);
                        const next = { ...form, buildings_id: '', floor_number: '', room_seq: '' };
                        setForm(next);
                      }}>
                      <option value="">-- Chọn cơ sở --</option>
                      {campuses.map(c => (<option key={c.id} value={c.id}>{c.name || c.code || c.id}</option>))}
                    </select>
                    {errors.selectedCampus && <p className="text-red-500 text-xs mt-1">{errors.selectedCampus}</p>}
                  </div>
                  <div>
                    <label className="block mb-1 text-sm font-semibold text-gray-700">Tòa nhà <span className="text-red-500">*</span></label>
                      <select id="buildings_id" className={`w-full rounded-lg px-3 py-2 border focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.buildings_id ? 'border-red-500' : 'border-blue-500'}`} value={form.buildings_id || ''} onChange={(e) => {
                        const next = { ...form, buildings_id: e.target.value, floor_number: '' };
                        setForm(next);
                        // clear building-specific error
                        setErrors(prev => { const n = { ...prev }; delete n.buildings_id; return n; });
                      }}>
                      <option value="">-- Chọn tòa --</option>
                      {buildings.map(b => (<option key={b.id} value={b.id}>{b.name || b.id} {b.floor_count ? `(${b.floor_count} tầng)` : ''}</option>))}
                    </select>
                    {errors.buildings_id && <p className="text-red-500 text-xs mt-1">{errors.buildings_id}</p>}
                  </div>
                  <div>
                    <label className="block mb-1 text-sm font-semibold text-gray-700">Tầng</label>
                      <select id="floor_number"
                      className={`w-full rounded-lg px-3 py-2 border focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.floor_number ? 'border-red-500' : 'border-blue-500'}`}
                      value={form.floor_number ?? ''} 
                          onChange={(e) => setFormField('floor_number', e.target.value)}
                    >
                      <option value="">-- Chọn tầng --</option>
                      {getFloorOptions(form.buildings_id)}
                    </select>
                    {errors.floor_number && <p className="text-red-500 text-xs mt-1">{errors.floor_number}</p>}
                  </div>
                  <div>
                    <label className="block mb-1 text-sm font-semibold text-gray-700">Số phòng <span className="text-red-500">*</span></label>
                    <input id="room_seq" className={`w-full rounded-lg px-3 py-2 border ${errors.room_seq ? 'border-red-500' : 'border-blue-500'} focus:ring-2 focus:ring-blue-500 focus:border-blue-500`} type="number" value={form.room_seq || ''} onChange={(e) => setFormField('room_seq', e.target.value)} placeholder="VD: 1" />
                    {errors.room_seq && <p className="text-red-500 text-xs mt-1">{errors.room_seq}</p>}
                  </div>
                </div>
              </div>

              {/* Thông tin cơ bản */}
              <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-700 mb-3 flex items-center">
                  <span className="bg-blue-100 text-blue-700 rounded-full w-6 h-6 flex items-center justify-center mr-2 text-sm">2</span>
                  Thông tin cơ bản
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-1 text-sm font-semibold text-gray-700">Mã phòng <span className="text-red-500">*</span></label>
                    <input id="code" className={`w-full rounded-lg px-3 py-2 border ${errors.code ? 'border-red-500' : 'border-blue-500'} focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-100`} type="text" value={form.code} readOnly disabled placeholder="(Tự sinh)" />
                    {errors.code && <p className="text-red-500 text-xs mt-1">{errors.code}</p>}
                  </div>
                  <div>
                    <label className="block mb-1 text-sm font-semibold text-gray-700">Tên phòng <span className="text-red-500">*</span></label>
                    <input id="name" className={`w-full rounded-lg px-3 py-2 border ${errors.name ? 'border-red-500' : 'border-blue-500'} focus:ring-2 focus:ring-blue-500 focus:border-blue-500`} type="text" value={form.name} onChange={(e) => setFormField('name', e.target.value)} placeholder="VD: Phòng học 101" />
                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                  </div>
                  <div>
                    <label className="block mb-1 text-sm font-semibold text-gray-700">Loại phòng <span className="text-red-500">*</span></label>
                    <input id="type" className={`w-full rounded-lg px-3 py-2 border ${errors.type ? 'border-red-500' : 'border-blue-500'} focus:ring-2 focus:ring-blue-500 focus:border-blue-500`} type="text" value={form.type} onChange={(e) => setFormField('type', e.target.value)} placeholder="VD: Lý thuyết, Thực hành" />
                    {errors.type && <p className="text-red-500 text-xs mt-1">{errors.type}</p>}
                  </div>
                  <div>
                    <label className="block mb-1 text-sm font-semibold text-gray-700">Trạng thái <span className="text-red-500">*</span></label>
                    <select id="status" className={`w-full rounded-lg px-3 py-2 border ${errors.status ? 'border-red-500' : 'border-blue-500'} focus:ring-2 focus:ring-blue-500 focus:border-blue-500`} value={form.status} onChange={(e) => setFormField('status', e.target.value)}>
                      <option value="">-- Chọn trạng thái --</option>
                      <option value="active">Hoạt động</option>
                      <option value="inactive">Không hoạt động</option>
                      <option value="maintenance">Bảo trì</option>
                    </select>
                    {errors.status && <p className="text-red-500 text-xs mt-1">{errors.status}</p>}
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
                    <input id="capacity_max" className={`w-full rounded-lg px-3 py-2 border ${errors.capacity_max ? 'border-red-500' : 'border-blue-500'} focus:ring-2 focus:ring-blue-500 focus:border-blue-500`} type="number" value={form.capacity_max} onChange={(e) => setFormField('capacity_max', e.target.value)} placeholder="Số người tối đa" />
                    {errors.capacity_max && <p className="text-red-500 text-xs mt-1">{errors.capacity_max}</p>}
                  </div>
                  <div>
                    <label className="block mb-1 text-sm font-semibold text-gray-700">Sức chứa tối ưu</label>
                    <input id="capacity_optimal" className={`w-full rounded-lg px-3 py-2 border ${errors.capacity_optimal ? 'border-red-500' : 'border-blue-500'} focus:ring-2 focus:ring-blue-500 focus:border-blue-500`} type="number" value={form.capacity_optimal} onChange={(e) => setFormField('capacity_optimal', e.target.value)} placeholder="Số người tối ưu" />
                    {errors.capacity_optimal && <p className="text-red-500 text-xs mt-1">{errors.capacity_optimal}</p>}
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
                                className="h-4 w-4 text-blue-600 border-blue-500 rounded focus:ring-blue-500"
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
                                  className="w-16 border border-blue-500 rounded px-2 py-1 text-sm"
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

              
            
            </form>
          </div>
          <div className="flex justify-end gap-3 p-6 bg-gray-50 border-t border-gray-200 rounded-b-xl">
            <Button size="md" variant="outline" className="font-semibold px-6 py-2" onClick={handleAddClose}>Hủy</Button>
            <Button size="md" variant="primary" className="bg-blue-600 hover:bg-blue-700 font-semibold px-6 py-2 disabled:opacity-50 disabled:cursor-not-allowed" disabled={isSubmitting} aria-disabled={isSubmitting} onClick={() => addFormRef.current?.requestSubmit()}>
              <svg className="w-5 h-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              Lưu phòng
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal Sửa phòng */}
      <Modal isOpen={isEditOpen} onClose={handleEditClose} className="max-w-2xl w-full mx-auto bg-white shadow-2xl">
        <div className="flex flex-col max-h-[90vh]">
          <div className="p-6 bg-linear-to-r from-blue-600 to-blue-700 rounded-t-xl">
            <h2 className="text-2xl font-bold text-white text-center">Chỉnh sửa phòng</h2>
          </div>
          <div className="overflow-y-auto px-8 py-6 bg-linear-to-br from-white via-gray-50 to-gray-100">
            <form ref={editFormRef} className="space-y-4" onSubmit={handleEditSubmit}>
              {/* general form-level error (show server or general validation messages here) */}
              {errors && (errors.general || errors._global) && (
                <div className="mb-4 p-3 rounded bg-red-50 border border-red-200 text-red-800">
                  <strong className="block font-medium">Lỗi</strong>
                  <p className="text-sm mt-1">{errors.general || errors._global}</p>
                </div>
              )}
              {/* server errors are shown via toast in addition to inline messages */}
              {/* Vị trí */}
              <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-700 mb-3 flex items-center">
                  <span className="bg-blue-100 text-blue-700 rounded-full w-6 h-6 flex items-center justify-center mr-2 text-sm">1</span>
                  Vị trí
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-1 text-sm font-semibold text-gray-700">Cơ sở <span className="text-red-500">*</span></label>
                    <select id="selectedCampus" className={`w-full rounded-lg px-3 py-2 border ${errors.selectedCampus ? 'border-red-500' : 'border-blue-500'} focus:ring-2 focus:ring-blue-500 focus:border-blue-500`} value={selectedCampus || ''} onChange={(e) => {
                        const val = e.target.value;
                        setSelectedCampus(val);
                        // clear campus-specific error
                        setErrors(prev => { const next = { ...prev }; delete next.selectedCampus; return next; });
                        fetchBuildings(val);
                        const next = { ...form, buildings_id: '', floor_number: '', room_seq: '' };
                        setForm(next);
                      }}>
                      <option value="">-- Chọn cơ sở --</option>
                      {campuses.map(c => (<option key={c.id} value={c.id}>{c.name || c.code || c.id}</option>))}
                    </select>
                    {errors.selectedCampus && <p className="text-red-500 text-xs mt-1">{errors.selectedCampus}</p>}
                  </div>
                  <div>
                    <label className="block mb-1 text-sm font-semibold text-gray-700">Tòa nhà <span className="text-red-500">*</span></label>
                    <select id="buildings_id" className={`w-full rounded-lg px-3 py-2 border focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.buildings_id ? 'border-red-500' : 'border-blue-500'}`} value={form.buildings_id || ''} onChange={(e) => {
                        const next = { ...form, buildings_id: e.target.value, floor_number: '' };
                        setForm(next);
                        // clear building-specific error
                        setErrors(prev => { const n = { ...prev }; delete n.buildings_id; return n; });
                      }}>
                      <option value="">-- Chọn tòa --</option>
                      {buildings.map(b => (<option key={b.id} value={b.id}>{b.name || b.id} {b.floor_count ? `(${b.floor_count} tầng)` : ''}</option>))}
                    </select>
                    {errors.buildings_id && <p className="text-red-500 text-xs mt-1">{errors.buildings_id}</p>}
                  </div>
                  <div>
                    <label className="block mb-1 text-sm font-semibold text-gray-700">Tầng</label>
                    <select id="floor_number" 
                      className={`w-full rounded-lg px-3 py-2 border focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.floor_number ? 'border-red-500' : 'border-blue-500'}`}
                      value={form.floor_number ?? ''} 
                      onChange={(e) => setFormField('floor_number', e.target.value)}
                    >
                      <option value="">-- Chọn tầng --</option>
                      {getFloorOptions(form.buildings_id)}
                    </select>
                    {errors.floor_number && <p className="text-red-500 text-xs mt-1">{errors.floor_number}</p>}
                  </div>
                  <div>
                    <label className="block mb-1 text-sm font-semibold text-gray-700">Số phòng <span className="text-red-500">*</span></label>
                    <input id="room_seq" className={`w-full rounded-lg px-3 py-2 border ${errors.room_seq ? 'border-red-500' : 'border-blue-500'} focus:ring-2 focus:ring-blue-500 focus:border-blue-500`} type="number" value={form.room_seq || ''} onChange={(e) => setFormField('room_seq', e.target.value)} placeholder="VD: 1" />
                    {errors.room_seq && <p className="text-red-500 text-xs mt-1">{errors.room_seq}</p>}
                  </div>
                </div>
              </div>

              {/* Thông tin cơ bản */}
              <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-700 mb-3 flex items-center">
                  <span className="bg-blue-100 text-blue-700 rounded-full w-6 h-6 flex items-center justify-center mr-2 text-sm">2</span>
                  Thông tin cơ bản
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-1 text-sm font-semibold text-gray-700">Mã phòng <span className="text-red-500">*</span></label>
                    <input id="code" className={`w-full rounded-lg px-3 py-2 border ${errors.code ? 'border-red-500' : 'border-blue-500'} focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-100`} type="text" value={form.code} readOnly disabled placeholder="(Tự sinh)" />
                    {errors.code && <p className="text-red-500 text-xs mt-1">{errors.code}</p>}
                  </div>
                  <div>
                    <label className="block mb-1 text-sm font-semibold text-gray-700">Tên phòng <span className="text-red-500">*</span></label>
                    <input id="name" className={`w-full rounded-lg px-3 py-2 border ${errors.name ? 'border-red-500' : 'border-blue-500'} focus:ring-2 focus:ring-blue-500 focus:border-blue-500`} type="text" value={form.name} onChange={(e) => setFormField('name', e.target.value)} placeholder="VD: Phòng học 101" />
                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                  </div>
                  <div>
                    <label className="block mb-1 text-sm font-semibold text-gray-700">Loại phòng <span className="text-red-500">*</span></label>
                    <input id="type" className={`w-full rounded-lg px-3 py-2 border ${errors.type ? 'border-red-500' : 'border-blue-500'} focus:ring-2 focus:ring-blue-500 focus:border-blue-500`} type="text" value={form.type} onChange={(e) => setFormField('type', e.target.value)} placeholder="VD: Lý thuyết, Thực hành" />
                    {errors.type && <p className="text-red-500 text-xs mt-1">{errors.type}</p>}
                  </div>
                  <div>
                    <label className="block mb-1 text-sm font-semibold text-gray-700">Trạng thái <span className="text-red-500">*</span></label>
                    <select id="status" className={`w-full rounded-lg px-3 py-2 border ${errors.status ? 'border-red-500' : 'border-blue-500'} focus:ring-2 focus:ring-blue-500 focus:border-blue-500`} value={form.status} onChange={(e) => setFormField('status', e.target.value)}>
                      <option value="">-- Chọn trạng thái --</option>
                      <option value="active">Hoạt động</option>
                      <option value="inactive">Không hoạt động</option>
                      <option value="maintenance">Bảo trì</option>
                    </select>
                    {errors.status && <p className="text-red-500 text-xs mt-1">{errors.status}</p>}
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
                    <input id="capacity_max" className={`w-full rounded-lg px-3 py-2 border ${errors.capacity_max ? 'border-red-500' : 'border-blue-500'} focus:ring-2 focus:ring-blue-500 focus:border-blue-500`} type="number" value={form.capacity_max} onChange={(e) => setFormField('capacity_max', e.target.value)} placeholder="Số người tối đa" />
                    {errors.capacity_max && <p className="text-red-500 text-xs mt-1">{errors.capacity_max}</p>}
                  </div>
                  <div>
                    <label className="block mb-1 text-sm font-semibold text-gray-700">Sức chứa tối ưu</label>
                    <input id="capacity_optimal" className={`w-full rounded-lg px-3 py-2 border ${errors.capacity_optimal ? 'border-red-500' : 'border-blue-500'} focus:ring-2 focus:ring-blue-500 focus:border-blue-500`} type="number" value={form.capacity_optimal} onChange={(e) => setFormField('capacity_optimal', e.target.value)} placeholder="Số người tối ưu" />
                    {errors.capacity_optimal && <p className="text-red-500 text-xs mt-1">{errors.capacity_optimal}</p>}
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
                                id={`equip-edit-${eq.id}`}
                                checked={!!selected}
                                onChange={() => handleEquipmentCheckboxToggle(eq.id)}
                                className="h-4 w-4 text-blue-600 border-blue-500 rounded focus:ring-blue-500"
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
                                  className="w-16 border border-blue-500 rounded px-2 py-1 text-sm"
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
            </form>
          </div>
          <div className="flex justify-end gap-3 p-6 bg-gray-50 border-t border-gray-200 rounded-b-xl">
            <Button size="md" variant="outline" className="font-semibold px-6 py-2" onClick={handleEditClose}>Hủy</Button>
            <Button size="md" variant="primary" className="bg-blue-600 hover:bg-blue-700 font-semibold px-6 py-2 disabled:opacity-50 disabled:cursor-not-allowed" disabled={isSubmitting} aria-disabled={isSubmitting} onClick={() => editFormRef.current?.requestSubmit()}>
              <svg className="w-5 h-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              Cập nhật
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
