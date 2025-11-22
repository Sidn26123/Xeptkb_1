import React from 'react';
import { proposeRoomChange, proposeTimeChange, applyScheduleChange, getScheduleInstanceById } from '../../services/scheduleService';
import { getSemesterById } from '../../services/semesterService';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { toast } from 'sonner';

export default function EditScheduleModal({ open = false, onClose = () => {}, onSave = () => {}, detail = {} }) {
  const [selectedTab, setSelectedTab] = React.useState('change-room');
  const [showConfirmModal, setShowConfirmModal] = React.useState(false);

  // Detail fetching
  const [fullDetail, setFullDetail] = React.useState(null);
  const [loadingDetail, setLoadingDetail] = React.useState(false);

  // Tab states
  const [availableRooms, setAvailableRooms] = React.useState([]);
  const [loadingRooms, setLoadingRooms] = React.useState(false);
  const [selectedRoom, setSelectedRoom] = React.useState(null);
  const [reason, setReason] = React.useState('');
  const [errorMessage, setErrorMessage] = React.useState(null);

  // For change-datetime tab
  const [newDate, setNewDate] = React.useState(detail?.dateISO || '');
  const [openDatePicker, setOpenDatePicker] = React.useState(false);
  const [semesterRange, setSemesterRange] = React.useState({ start: null, end: null });
  // Removed newSlot state as it's not needed

  // Helper to extract courseClassId from various shapes in `detail`
  const courseClassIdFromDetail = (d) => {
    return d?.courseClassId || d?.course_class_id || d?.raw?.courseClassId || d?.raw?.course_class_id || d?.raw?.schedule?.course_class_id || null;
  };

  // Reset when modal opens/closes
  React.useEffect(() => {
    if (open) {
      setSelectedTab('change-room');
      setShowConfirmModal(false);
      setAvailableRooms([]);
      setSelectedRoom(null);
      setReason('');
      setErrorMessage(null);
      // For change-datetime tab we want the datepicker to start empty
      setNewDate('');
      setOpenDatePicker(false);
      setFullDetail(null); // Reset full detail
      setLoadingDetail(false);
      // Removed newSlot reset
    }
  }, [open]);

  // Fetch full detail when modal opens
  React.useEffect(() => {
    if (open && detail?.id && !fullDetail) {
      fetchFullDetail();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, detail?.id, fullDetail]);

  // Load proposals after fullDetail is fetched
  React.useEffect(() => {
    if (open && fullDetail && selectedTab === 'change-room') {
      loadProposalsForTab('change-room');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, fullDetail, selectedTab]);

  const fetchFullDetail = async () => {
    if (!detail?.id) return;
    setLoadingDetail(true);
    try {
      const data = await getScheduleInstanceById(detail.id);
      if (data) {
        // Some responses put room under `data.room`, others under `data.schedule.room`.
        const schedRoom = data.schedule?.room;
        const topRoom = data.room;
        const roomCode = topRoom?.code || topRoom?.room_code || schedRoom?.code || schedRoom?.room_code || null;
        const roomName = topRoom?.name || topRoom?.room_name || schedRoom?.name || schedRoom?.room_name || roomCode || null;

        // prefer time info from instance.timeSlot, fall back to schedule.timeSlot
        const instTimeSlot = data.timeSlot;
        const schedTimeSlot = data.schedule?.timeSlot;
        const timeLabel = instTimeSlot?.name || schedTimeSlot?.name || (data.time_slot_id ? `Tiết ${data.time_slot_id}` : null);
        // helper to format either {start,end} or {start_hour,start_min,end_hour,end_min}
        const pad2 = (n) => (n === undefined || n === null) ? '00' : String(n).padStart(2, '0');
        const formatSlot = (ts) => {
          if (!ts) return null;
          if (ts.start && ts.end) return `${ts.start} - ${ts.end}`;
          if (ts.start_hour !== undefined) {
            const sh = pad2(ts.start_hour);
            const sm = pad2(ts.start_min);
            const eh = pad2(ts.end_hour);
            const em = pad2(ts.end_min);
            return `${sh}:${sm} - ${eh}:${em}`;
          }
          return null;
        };
        const timeDisplay = formatSlot(instTimeSlot) || formatSlot(schedTimeSlot) || 'Thời gian';

        setFullDetail({
          id: data.id,
          subject: data.schedule?.courseClass?.name || data.subject_name || 'Môn học',
          teacher: data.schedule?.teacher?.name || data.teacher_name || 'Giảng viên',
          room: { code: roomCode },
          roomName: roomName,
          className: data.schedule?.courseClass?.name || data.class_name || '',
          time: timeDisplay,
          date: data.date ? new Date(data.date).toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'Ngày',
          dateISO: data.date,
          type: data.type || data.schedule?.type || 'Lý thuyết',
          code: data.schedule?.courseClass?.code || data.subject_code,
          timeSlotId: instTimeSlot?.id || data.time_slot_id || schedTimeSlot?.id,
          timeSlotLabel: timeLabel || `Tiết ${data.time_slot_id}`,
          teacherId: data.schedule?.teacher?.id || data.teacher_id,
          roomId: topRoom?.id || topRoom?.room_id || schedRoom?.id || schedRoom?.room_id,
          courseClassId: data.schedule?.courseClass?.id || data.course_class_id,
          num_of_period: data.num_of_period || data.schedule?.num_of_period || 1,
          raw: data
        });

        // Try to fetch semester range from courseClass if available
        const semesterId = data.schedule?.courseClass?.semester_id || data.schedule?.semester_id || data.semester_id || null;
        if (semesterId) {
          try {
            console.debug('Fetching semester for date picker limits, semesterId=', semesterId);
            const sem = await getSemesterById(semesterId);
            if (sem && sem.start && sem.end) {
              setSemesterRange({ start: new Date(sem.start), end: new Date(sem.end) });
            }
          } catch (e) {
            // ignore semester fetch errors
            console.debug('Failed fetching semester for date picker limits', e?.message || e);
          }
        }
      }
    } catch (err) {
      console.error('Error fetching detail:', err);
      setErrorMessage('Không thể tải thông tin chi tiết');
    } finally {
      setLoadingDetail(false);
    }
  };

  // Close on Escape
  React.useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') onClose();
    }
    if (open) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  // Load proposals when tab changes or inputs change
  React.useEffect(() => {
    if (!open || showConfirmModal) return;

    // If user is on 'change-room' always load proposals
    if (selectedTab === 'change-room') {
      loadProposalsForTab('change-room');
      return;
    }

    // If user is on 'change-datetime', only call API when a date is selected
    if (selectedTab === 'change-datetime') {
      if (newDate) {
        loadProposalsForTab('change-datetime');
      } else {
        // clear available rooms while waiting for user selection
        setAvailableRooms([]);
        setErrorMessage(null);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTab, newDate, open, showConfirmModal]);

  const loadProposalsForTab = async (tab) => {
    const courseClassId = courseClassIdFromDetail(fullDetail || detail);
    if (!courseClassId) {
      console.error('Missing courseClassId in detail', { detail, fullDetail });
      setAvailableRooms([]);
      return;
    }

    setLoadingRooms(true);
    setErrorMessage(null);
    
    try {
      let resp;
      if (tab === 'change-room') {
        // Room-only flow: prefer to call the room-only API with scheduleInstanceId
        const date = (fullDetail || detail)?.dateISO || (fullDetail || detail)?.date || '';
        const scheduleInstanceId = (fullDetail || detail)?.id || null;
        console.log('[DEBUG] Requesting ROOM-only proposals with:', { date, courseClassId, scheduleInstanceId });
        // payload: { date, courseClassId, scheduleInstanceId }
        // Truyền thêm ngày cũ (oldDate) từ form edit lên backend
        const oldDate = (fullDetail || detail)?.dateISO || (fullDetail || detail)?.date || '';
        resp = await proposeRoomChange(date, courseClassId, { scheduleInstanceId, oldDate });
      } else {
        // Time+room flow: scan the whole day for available start slots and rooms
        if (!newDate) {
          setAvailableRooms([]);
          setLoadingRooms(false);
          return;
        }
        console.log('[DEBUG] Requesting TIME+ROOM proposals with:', { date: newDate, courseClassId });
        // payload: { date, courseClassId } (optionally prefer/maxCandidates can be added)
        resp = await proposeTimeChange(newDate, courseClassId);
      }

      if (!resp.success) {
        setErrorMessage(resp.message || 'Không tìm thấy phương án phù hợp');
        setAvailableRooms([]);
        setLoadingRooms(false);
        return;
      }

      const proposals = resp?.proposals || [];
      const mapped = proposals.map(p => ({
        id: p.room_id,
        name: p.room_name || p.room_code || p.room_id,
        code: p.room_code || p.room_code || '',
        capacity: p.capacity || p.capacity_max || p.capacity_min || null,
        type: p.room_type || null,
        status: 'Đề xuất',
        start_slot: p.start_slot || p.start_slot_idx,
        occupied_slots: p.occupied_slots || p.occupied || [],
      }));
      setAvailableRooms(Array.isArray(mapped) ? mapped : []);
    } catch (err) {
      console.error('Error loading proposals:', err);
      setAvailableRooms([]);
    }
    setLoadingRooms(false);
  };

  const handleChooseRoom = (room) => {
    setSelectedRoom(room);
  };

  const handleContinue = () => {
    if (!selectedRoom) {
      setErrorMessage('Vui lòng chọn phòng');
      return;
    }
    setShowConfirmModal(true);
  };

  const handleConfirm = async () => {
    if (!selectedRoom) return;
    
    const applyDate = selectedTab === 'change-room' ? ((fullDetail || detail)?.dateISO || (fullDetail || detail)?.date || '') : newDate;
    const applyStartSlot = selectedRoom.start_slot || null;
    const scheduleInstanceId = (fullDetail || detail)?.id;
    if (!applyDate || !applyStartSlot || !scheduleInstanceId) {
      toast.error('Thiếu thông tin', {
        description: 'Thiếu ngày, tiết hoặc mã lịch để áp dụng'
      });
      return;
    }

    // Show loading toast
    const promise = applyScheduleChange({
      date: applyDate,
      courseClassId: courseClassIdFromDetail(fullDetail || detail),
      roomId: selectedRoom.id,
      startSlot: Number(applyStartSlot),
      reason: reason || 'Thay đổi từ UI',
      scheduleInstanceId
    });

    toast.promise(promise, {
      loading: 'Đang cập nhật lịch học...',
      success: (res) => {
        if (!res.success) {
          throw new Error(res.message || 'Cập nhật thất bại');
        }
        // Close modal and trigger parent refetch
        try { onSave(res); } catch { /* ignore */ }
        onClose();
        return `Đã cập nhật lịch học thành công!`;
      },
      error: (err) => {
        console.error('Apply failed:', err);
        setErrorMessage(err?.message || 'Cập nhật thất bại');
        setShowConfirmModal(false);
        return err?.message || 'Có lỗi xảy ra khi cập nhật lịch học';
      }
    });
  };

  if (!open) return null;

  return (
    <>
      {/* Main Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" aria-hidden="true" />
        
        <div className="relative w-full max-w-3xl mx-4 md:mx-6 lg:mx-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl overflow-hidden">
            <div className="p-4 md:p-5">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Cập nhật lịch học</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-300 mt-1">{(fullDetail || detail)?.subject || 'Môn học'} — {(fullDetail || detail)?.className || ''}</p>
                </div>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-2 rounded-lg">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {errorMessage && (
                <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-md">{errorMessage}</div>
              )}

              {/* Tabs */}
              <div className="mt-6">
                <div className="border-b border-gray-200 dark:border-gray-700">
                  <nav className="-mb-px flex space-x-8">
                    <button
                      onClick={() => setSelectedTab('change-room')}
                      className={`py-2 px-1 border-b-2 font-medium text-sm ${
                        selectedTab === 'change-room'
                          ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      Đổi phòng
                    </button>
                    <button
                      onClick={() => setSelectedTab('change-datetime')}
                      className={`py-2 px-1 border-b-2 font-medium text-sm ${
                        selectedTab === 'change-datetime'
                          ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      Đổi ngày
                    </button>
                  </nav>
                </div>

                <div className="mt-6">
                  {/* Thông tin hiện tại */}
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">Thông tin hiện tại</h4>
                    {loadingDetail ? (
                      <div className="text-center py-4">
                        <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                        <p className="mt-2 text-sm text-gray-500">Đang tải thông tin...</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="text-xs text-gray-500">Ngày</div>
                          <div className="font-medium mt-1">{(fullDetail || detail)?.date || '-'}</div>
                        </div>
                        <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="text-xs text-gray-500">Tiết</div>
                          <div className="font-medium mt-1">{(fullDetail || detail)?.timeSlotLabel || (fullDetail || detail)?.timeSlotId || '-'}</div>
                        </div>
                        <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="text-xs text-gray-500">Phòng</div>
                          <div className="font-medium mt-1">{(fullDetail || detail)?.roomName || '-'}</div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Tab content */}
                  {selectedTab === 'change-datetime' && (
                    <div className="mb-6">
                      <div>
                        <label className="block text-sm text-gray-600 dark:text-gray-300 mb-2">Chọn ngày</label>
                        <input
                          type="text"
                          readOnly
                          value={newDate ? (() => {
                            try { const d = new Date(newDate); return isNaN(d.getTime()) ? '' : d.toLocaleDateString('vi-VN'); } catch { return ''; }
                          })() : ''}
                          onClick={() => setOpenDatePicker(!openDatePicker)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 cursor-pointer"
                          placeholder="Chọn ngày"
                        />
                        {openDatePicker && (
                          <div className="mt-2 relative z-50">
                            <div className="absolute bg-white dark:bg-gray-800 shadow-xl rounded-lg border border-gray-200 dark:border-gray-700">
                              <DatePicker
                                selected={newDate ? new Date(newDate) : null}
                                onChange={(d) => {
                                  if (!d) return;
                                  // Create ISO string using local date components to avoid timezone shift
                                  const year = d.getFullYear();
                                  const month = String(d.getMonth() + 1).padStart(2, '0');
                                  const day = String(d.getDate()).padStart(2, '0');
                                  const iso = `${year}-${month}-${day}`;
                                  setNewDate(iso);
                                  setOpenDatePicker(false);
                                  setErrorMessage(null);
                                }}
                                inline
                                dateFormat="dd/MM/yyyy"
                                onClickOutside={() => setOpenDatePicker(false)}
                                // Disable past dates
                                minDate={new Date()}
                                // If semester range available, only allow dates inside range
                                filterDate={(d) => {
                                  // normalize day start
                                  const day = new Date(d.getFullYear(), d.getMonth(), d.getDate());
                                  const today = new Date();
                                  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
                                  if (day < todayStart) return false;
                                  if (semesterRange.start && semesterRange.end) {
                                    const s = new Date(semesterRange.start.getFullYear(), semesterRange.start.getMonth(), semesterRange.start.getDate());
                                    const e = new Date(semesterRange.end.getFullYear(), semesterRange.end.getMonth(), semesterRange.end.getDate());
                                    return day >= s && day <= e;
                                  }
                                  return true;
                                }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Available rooms */}
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
                      {selectedTab === 'change-room' ? 'Phòng phù hợp' : 'Phòng trống trên ngày đã chọn'}
                    </h4>
                    
                    {loadingRooms ? (
                      <div className="text-center py-8">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <p className="mt-2 text-sm text-gray-500">Đang tìm phòng...</p>
                      </div>
                    ) : availableRooms.length === 0 ? (
                      <div className="text-center py-8 text-sm text-gray-500">
                        {selectedTab === 'change-room' 
                          ? 'Không tìm thấy phòng phù hợp cho ngày hiện tại.' 
                          : 'Không tìm thấy phòng trống trên ngày đã chọn. Hãy thử chọn ngày khác.'
                        }
                      </div>
                    ) : (
                      <div className="max-h-[300px] overflow-y-auto pr-2">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                          {availableRooms.map(room => (
                            <div 
                              key={`${room.id}-${room.start_slot}`} 
                              className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                                selectedRoom?.id === room.id && selectedRoom?.start_slot === room.start_slot
                                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                                  : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
                              }`}
                              onClick={() => handleChooseRoom(room)}
                            >
                              <div className="font-medium text-gray-900 dark:text-gray-100">{room.name}</div>
                              {room.code && (
                                <div className="text-xs text-gray-500 mt-1">Mã: {room.code}</div>
                              )}
                              <div className="text-sm text-gray-500 mt-1">
                                Sức chứa: {room.capacity || 'N/A'} — Loại: {room.type || 'N/A'}
                                {room.start_slot && (
                                  <span> — Tiết: {room.start_slot}</span>
                                )}
                              </div>
                              {selectedRoom?.id === room.id && selectedRoom?.start_slot === room.start_slot && (
                                <div className="mt-2 text-xs text-blue-600 font-medium">✓ Đã chọn</div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Lý do */}
                  <div className="mb-6">
                    <label className="block text-sm text-gray-600 dark:text-gray-300 mb-2">
                      Lý do {selectedTab === 'change-room' ? 'đổi phòng' : 'đổi ngày'} (tùy chọn)
                    </label>
                    <textarea
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      rows={2}
                      maxLength={500}
                      placeholder={`Nhập lý do ${selectedTab === 'change-room' ? 'đổi phòng' : 'đổi ngày'}...`}
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                    />
                    <div className="text-xs text-gray-500 mt-1">{reason.length}/500 ký tự</div>
                  </div>

                  {/* Buttons */}
                  <div className="flex justify-end gap-3">
                    <button 
                      onClick={onClose} 
                      className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      Hủy
                    </button>
                    <button
                      onClick={handleContinue}
                      disabled={!selectedRoom || loadingRooms}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Tiếp tục
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && selectedRoom && (
        <div className="fixed inset-0 z-60 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" aria-hidden="true" />
          
          <div className="relative w-full max-w-3xl mx-4 md:mx-6 lg:mx-8">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl overflow-hidden">
              <div className="p-4 md:p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Xác nhận thay đổi</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-300 mt-1">Vui lòng kiểm tra thông tin trước khi xác nhận</p>
                  </div>
                  <button onClick={() => setShowConfirmModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-2 rounded-lg">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">Thông tin hiện tại</div>
                    <div className="space-y-2">
                      <div><span className="text-xs text-gray-500">Ngày:</span> {(fullDetail || detail)?.date || '-'}</div>
                      <div><span className="text-xs text-gray-500">Tiết:</span> {(fullDetail || detail)?.timeSlotLabel || (fullDetail || detail)?.timeSlotId || '-'}</div>
                      <div><span className="text-xs text-gray-500">Phòng:</span> {(fullDetail || detail)?.roomName || '-'}</div>
                    </div>
                  </div>

                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-3">Thông tin mới</div>
                    <div className="space-y-2">
                      <div><span className="text-xs text-blue-700 dark:text-blue-300">Ngày:</span> {selectedTab === 'change-room' ? ((fullDetail || detail)?.date || '-') : (newDate || '-')}</div>
                      <div><span className="text-xs text-blue-700 dark:text-blue-300">Tiết:</span> {selectedTab === 'change-room' ? ((fullDetail || detail)?.timeSlotLabel || (fullDetail || detail)?.timeSlotId || '-') : `Tiết ${selectedRoom?.start_slot || '-'}`}</div>
                      <div><span className="text-xs text-blue-700 dark:text-blue-300">Phòng:</span> {selectedRoom?.name}</div>
                    </div>
                  </div>
                </div>

                {reason && (
                  <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                    <div className="text-sm text-yellow-800 dark:text-yellow-200">
                      <span className="font-medium">Lý do:</span> {reason}
                    </div>
                  </div>
                )}

                <div className="mt-4 flex justify-end gap-3">
                  <button 
                    onClick={() => setShowConfirmModal(false)} 
                    className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    Quay lại
                  </button>
                  <button
                    onClick={handleConfirm}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Xác nhận thay đổi
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
