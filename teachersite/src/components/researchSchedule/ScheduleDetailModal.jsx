import React, { useState, useEffect } from "react";
import { createScheduleChangeRequest, getRequestsByInstance } from '../../services/scheduleChangeService';

export default function ScheduleDetailModal({ open = false, onClose = () => {}, detail = null, onRequestSubmit = () => {} }) {
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [cancelled, setCancelled] = useState(false);
  const [hasAnyRequest, setHasAnyRequest] = useState(false);
  const isCancellationRequested = (d) => {
    if (!d) return false;
    if (d.hasCancellationRequest || d.cancellationRequested) return true;
    if (Array.isArray(d.existing_requests) && d.existing_requests.some(r => r.request_type === 'cancellation' && r.status !== 'rejected')) return true;
    if (Array.isArray(d.requests) && d.requests.some(r => r.request_type === 'cancellation' && r.status !== 'rejected')) return true;
    if (d.raw) {
      if (Array.isArray(d.raw.requests) && d.raw.requests.some(r => r.request_type === 'cancellation' && r.status !== 'rejected')) return true;
      if (d.raw.request_type === 'cancellation' && d.raw.status !== 'rejected') return true;
    }
    return false;
  };

  useEffect(() => {
    let mounted = true;

    const resolveCancelState = async () => {
      // do nothing when modal is closed
      if (!open) {
        if (mounted) {
          setCancelled(false);
          setHasAnyRequest(false);
        }
        return;
      }

      if (isCancellationRequested(detail)) {
        if (mounted) {
          setCancelled(true);
          setHasAnyRequest(true);
        }
        return;
      }

      const scheduleInstanceId =
        detail?.id ||
        detail?.schedule_instance_id ||
        detail?.scheduleInstanceId ||
        detail?.raw?.id ||
        detail?.raw?.instanceId ||
        detail?.raw?.schedule_instance_id ||
        null;

      if (!scheduleInstanceId) {
        if (mounted) {
          setCancelled(false);
          setHasAnyRequest(false);
        }
        return;
      }

      try {
        console.debug('ScheduleDetailModal: checking requests for instance', scheduleInstanceId);
        const all = await getRequestsByInstance(scheduleInstanceId);
        console.debug('ScheduleDetailModal: requests returned count=', (all || []).length, all);
        if (!mounted) return;
        const has = (all || []).length > 0;
        const foundCancel = (all || []).some(r => r.request_type === 'cancellation' && r.status !== 'rejected');
        if (mounted) {
          setHasAnyRequest(Boolean(has));
          setCancelled(Boolean(foundCancel));
        }
      } catch (err) {
        console.debug('Failed to fetch requests by instance', err);
        if (mounted) {
          setCancelled(false);
          setHasAnyRequest(false);
        }
      }
    };

    resolveCancelState();
    return () => { mounted = false; };
  }, [open, detail]);

  if (!open) return null;
  
  return (
    <div className="fixed inset-0 z-[100000] flex items-center justify-center bg-black/50 backdrop-blur-sm">
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
        
        {detail ? (
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-4 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h5 className="text-xl font-bold text-gray-900 dark:text-gray-100">{detail.subject}</h5>
                  {detail.code && (
                    <p className="text-sm text-gray-600 dark:text-gray-300">Mã môn: {detail.code}</p>
                  )}
                </div>
                {detail.type && (
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    detail.type === 'Lý thuyết' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                    detail.type === 'Thực hành' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200' :
                    'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                  }`}>
                    {detail.type}
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="flex-shrink-0 w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Lớp học</p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 mt-1">
                    {detail.className  || "-"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="flex-shrink-0 w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Phòng học</p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 mt-1">{detail.room || "-"}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="flex-shrink-0 w-10 h-10 bg-rose-100 dark:bg-rose-900/30 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-rose-600 dark:text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Thời gian</p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 mt-1">{detail.time || "-"}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="flex-shrink-0 w-10 h-10 bg-teal-100 dark:bg-teal-900/30 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-teal-600 dark:text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Ngày học</p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 mt-1">{detail.date || "-"}</p>
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
              <div className="flex flex-col items-end gap-2">
                <button
                  disabled={hasAnyRequest || cancelled}
                  onClick={() => { if (!hasAnyRequest && !cancelled) setShowRequestModal(true); }}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-2 ${
                    hasAnyRequest || cancelled
                      ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  {hasAnyRequest || cancelled ? (
                    cancelled ? 'Đã yêu cầu hủy lịch' : 'Đã có yêu cầu chỉnh sửa đang chờ xử lý'
                  ) : (
                    'Yêu cầu chỉnh sửa'
                  )}
                </button>
              </div>
              <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                </svg>
                Xuất PDF
              </button>
            </div>
            {showRequestModal && (
              <RequestChangeModal
                detail={detail}
                onClose={() => setShowRequestModal(false)}
                onSubmit={(payload) => {
                  // forward to parent handler (if provided)
                  onRequestSubmit(payload);
                  setShowRequestModal(false);
                }}
              />
            )}
          </div>
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

function RequestChangeModal({ detail = null, onClose = () => {}, onSubmit = () => {} }) {
  // request types: room_change, teacher_change, time_change
  const [type, setType] = useState('room_change');
  const [newDate, setNewDate] = useState('');
  const [reason, setReason] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const scheduleInstanceId =
      detail?.id ||
      detail?.schedule_instance_id ||
      detail?.scheduleInstanceId ||
      detail?.raw?.id ||
      detail?.raw?.instanceId ||
      detail?.raw?.schedule_instance_id ||
      null;
    // coerce to number when possible
    const coercedScheduleInstanceId = scheduleInstanceId ? Number(scheduleInstanceId) : null;
    const payload = {
      schedule_instance_id: coercedScheduleInstanceId,
      request_type: type,
      reason: reason || null,
    };
    // normalize dates to DATEONLY (YYYY-MM-DD)
    const toDateOnly = (v) => {
      if (!v) return null;
      if (v instanceof Date) return v.toISOString().slice(0,10);
      if (typeof v !== 'string') return null;
      if (/^\d{4}-\d{2}-\d{2}$/.test(v)) return v;
      if (/^\d{4}-\d{2}-\d{2}T/.test(v)) return v.slice(0,10);
      const m = v.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
      if (m) {
        const dd = m[1].padStart(2,'0');
        const mm = m[2].padStart(2,'0');
        const yyyy = m[3];
        return `${yyyy}-${mm}-${dd}`;
      }
      const m2 = v.match(/(\d{4})-(\d{2})-(\d{2})/);
      if (m2) return `${m2[1]}-${m2[2]}-${m2[3]}`;
      return null;
    };

    if (type === 'time_change') {
      payload.new_date = toDateOnly(newDate) || null;
    }

    // include old values for reference (read-only fields shown in UI)
    if (detail) {
      payload.old_room_id = detail.roomId || null;
      payload.old_time_slot_id = detail.timeSlotId || null;
      payload.old_date = toDateOnly(detail.dateISO || detail.date || detail.raw?.date || detail.raw?.start) || null;
      payload.old_teacher_id = detail.teacherId || null;
    }

    // Client-side validation: require schedule_instance_id for now
    if (!coercedScheduleInstanceId) {
      alert('Không tìm thấy id buổi học (schedule_instance_id). Vui lòng mở chi tiết buổi học từ lịch để gửi yêu cầu.');
      return;
    }

    // submit via service, then forward to parent
    // debug: print payload to browser console so we can verify what's sent
    console.debug('RequestChangeModal: sending payload', payload);

    (async () => {
      try {
        // also log the network-friendly copy (helps debugging when payload has undefined)
        const networkPayload = JSON.parse(JSON.stringify(payload));
        console.debug('RequestChangeModal: network payload', networkPayload);

        await createScheduleChangeRequest(networkPayload);
        // notify parent and close
        onSubmit && onSubmit(payload);
        onClose && onClose();
        // simple feedback, can be replaced with toast
        alert('Gửi yêu cầu thành công');
      } catch (err) {
        console.error(err);
        alert('Gửi yêu cầu thất bại: ' + (err.message || 'Lỗi'));
      }
    })();
  };

  return (
    <div className="fixed inset-0 z-[110000] flex items-center justify-center bg-black/40">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-2xl p-6 m-4">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Yêu cầu chỉnh sửa lịch</h4>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 rounded-lg">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-300">Loại yêu cầu</label>
            <select value={type} onChange={(e) => setType(e.target.value)} className="mt-1 block w-full rounded-md border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm p-2">
              <option value="room_change">Đổi phòng</option>
              <option value="teacher_change">Đổi giáo viên</option>
              <option value="time_change">Đổi ngày</option>
            </select>
          </div>

          {/* Read-only old fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Old room */}
            <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <p className="text-xs text-gray-500">Phòng hiện tại</p>
              <p className="text-sm font-semibold mt-1">{detail?.room || '-'}</p>
            </div>

            {/* Old teacher */}
            <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <p className="text-xs text-gray-500">Giáo viên hiện tại</p>
              <p className="text-sm font-semibold mt-1">{detail?.teacher || '-'}</p>
            </div>

            {/* Old date */}
            <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <p className="text-xs text-gray-500">Ngày hiện tại</p>
              <p className="text-sm font-semibold mt-1">{detail?.date || '-'}</p>
            </div>

            {/* Old timeslot */}
            <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <p className="text-xs text-gray-500">Tiết hiện tại</p>
              <p className="text-sm font-semibold mt-1">{detail?.time || '-'}</p>
            </div>
          </div>

          {type === 'time_change' && (
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-300">Ngày mới</label>
              <input type="date" value={newDate} onChange={(e) => setNewDate(e.target.value)} className="mt-1 block w-full rounded-md border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm p-2" />
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-300">Lý do</label>
            <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={3} className="mt-1 block w-full rounded-md border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm p-2" placeholder="Nêu rõ lý do"></textarea>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm bg-gray-100 dark:bg-gray-700 rounded-lg">Hủy</button>
            <button type="submit" className="px-4 py-2 text-sm bg-emerald-600 text-white rounded-lg">Gửi yêu cầu</button>
          </div>
        </form>
      </div>
    </div>
  );
}
