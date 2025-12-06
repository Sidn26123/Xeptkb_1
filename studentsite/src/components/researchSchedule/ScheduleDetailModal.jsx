import React from "react";
import { getScheduleInstanceById, getAllTimeSlots } from '../../services/scheduleService';

export default function ScheduleDetailModal({ open = false, onClose = () => {}, detail = null }) {
  const [fullDetail, setFullDetail] = React.useState(null);
  const [loadingDetail, setLoadingDetail] = React.useState(false);

  React.useEffect(() => {
    if (open && detail?.id && !fullDetail) {
      fetchFullDetail();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, detail?.id, fullDetail]);

  React.useEffect(() => {
    if (open) {
      setFullDetail(null);
      setLoadingDetail(false);
    }
  }, [open]);

  const fetchFullDetail = async () => {
    if (!detail?.id) return;
    setLoadingDetail(true);
    try {
      const data = await getScheduleInstanceById(detail.id);
      if (data) {
        // Fetch time slots to calculate time range
        const rawTimeSlots = await getAllTimeSlots();
        const timeSlots = (rawTimeSlots || []).map(slot => ({
          ...slot,
          start: slot.start || (slot.start_hour !== undefined ? `${String(slot.start_hour).padStart(2, '0')}:${String(slot.start_min || 0).padStart(2, '0')}` : null),
          end: slot.end || (slot.end_hour !== undefined ? `${String(slot.end_hour).padStart(2, '0')}:${String(slot.end_min || 0).padStart(2, '0')}` : null),
        }));
        const timeSlotId = data.timeSlot?.id || data.time_slot_id || data.schedule?.timeSlot?.id;
        const numOfPeriod = data.num_of_period || data.schedule?.num_of_period || 1;
        let timeDisplay = 'Thời gian';
        if (timeSlotId && timeSlots.length > 0) {
          const startSlot = timeSlots.find(ts => ts.id === timeSlotId);
          const endSlotId = timeSlotId + numOfPeriod - 1;
          const endSlot = timeSlots.find(ts => ts.id === endSlotId);
          if (startSlot && endSlot && startSlot.start && endSlot.end) {
            timeDisplay = `${startSlot.start} - ${endSlot.end}`;
          } else if (startSlot && startSlot.start) {
            timeDisplay = startSlot.start;
          }
        }

        // Some endpoints return room under `data.room`, others nest under `data.schedule.room`.
        const schedRoom = data.schedule?.room;
        const topRoom = data.room;
        const roomCode = topRoom?.code || topRoom?.room_code || schedRoom?.code || schedRoom?.room_code || null;
        const roomName = topRoom?.name || topRoom?.room_name || schedRoom?.name || schedRoom?.room_name || roomCode || null;

        setFullDetail({
          id: data.id,
          subject: data.schedule?.courseClass?.name || data.subject_name || 'Môn học',
          teacher: data.schedule?.teacher?.name || data.teacher_name || 'Giảng viên',
          room: { code: roomCode },
          roomName: roomName,
          className: data.schedule?.courseClass?.class?.name || data.class_name || '',
          time: timeDisplay,
          date: data.date ? new Date(data.date).toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'Ngày',
          dateISO: data.date,
          type: data.type || data.schedule?.type || 'Lý thuyết',
          code: data.schedule?.courseClass?.code || data.subject_code,
          timeSlotId: timeSlotId,
          timeSlotLabel: data.timeSlot?.name || data.schedule?.timeSlot?.name || `Tiết ${timeSlotId}`,
          teacherId: data.schedule?.teacher?.id || data.teacher_id,
          roomId: topRoom?.id || topRoom?.room_id || schedRoom?.id || schedRoom?.room_id,
          courseClassId: data.schedule?.courseClass?.id || data.course_class_id,
          num_of_period: numOfPeriod,
          raw: data
        });
      }
    } catch (err) {
      console.error('Error fetching detail:', err);
    } finally {
      setLoadingDetail(false);
    }
  };
    // Prepare display values
  const resolved = fullDetail || detail;
  const displayRoomName = resolved?.roomName || null;
  const displayRoomCode = resolved?.room?.code || resolved?.room_code || null;
    // Determine if the schedule's date is in the past (date-only comparison)
    const eventDateISO = resolved?.dateISO || resolved?.date || null;
    const isPastDate = (() => {
      if (!eventDateISO) return false;
      try {
        const d = new Date(eventDateISO);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        d.setHours(0, 0, 0, 0);
        return d < today;
      } catch {
        return false;
      }
    })();
  if (!open) return null;
  
  return (
    <div className="fixed inset-0 z-100000 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl p-6 m-4 transform transition-all">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h4 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Chi tiết buổi học</h4>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Thông tin chi tiết về lịch học</p>
          </div>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {(fullDetail || detail) ? (
          loadingDetail ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-gray-500 dark:text-gray-400">Đang tải thông tin...</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-linear-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-4 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="shrink-0 w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h5 className="text-xl font-bold text-gray-900 dark:text-gray-100">{(fullDetail || detail).subject}</h5>
                    {(fullDetail || detail).code && (
                      <p className="text-sm text-gray-600 dark:text-gray-300">Mã môn: {(fullDetail || detail).code}</p>
                    )}
                  </div>
                  {(fullDetail || detail).type && (
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      (fullDetail || detail).type === 'Lý thuyết' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                      (fullDetail || detail).type === 'Thực hành' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200' :
                      'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    }`}>
                      {(fullDetail || detail).type}
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div className="shrink-0 w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Giảng viên</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 mt-1">
                      {(fullDetail || detail).teacher  || "-"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div className="shrink-0 w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Phòng học</p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 mt-1">{displayRoomName || displayRoomCode || "-"}</p>
                      {displayRoomName && displayRoomCode && (
                        <p className="text-xs text-gray-500 dark:text-gray-300 mt-1">Mã phòng: {displayRoomCode}</p>
                      )}
                      {!displayRoomName && displayRoomCode && (
                        <p className="text-xs text-gray-500 dark:text-gray-300 mt-1">Mã phòng: {displayRoomCode}</p>
                      )}
                    </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div className="shrink-0 w-10 h-10 bg-rose-100 dark:bg-rose-900/30 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-rose-600 dark:text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Thời gian</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 mt-1">{(fullDetail || detail).time || "-"}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div className="shrink-0 w-10 h-10 bg-teal-100 dark:bg-teal-900/30 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-teal-600 dark:text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Ngày học</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 mt-1">{(fullDetail || detail).date || "-"}</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                >
                  Đóng
                </button>
                <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                  </svg>
                  Xuất PDF
                </button>
              </div>
            </div>
          )
        ) : (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="mt-4 text-gray-500 dark:text-gray-400">Không có dữ liệu</p>
          </div>
        )}
      </div>
    </div>
  );
}


