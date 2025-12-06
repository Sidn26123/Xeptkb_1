import React, { useEffect, useState } from 'react';
import WeekUnavailableGrid from './WeekUnavailableGrid';
import unavailableService from '../../services/unavailableTimeService';
import scheduleService from '../../services/scheduleService';

const DEFAULT_DAYS = [
  { id: 1, label: 'Thứ 2' },
  { id: 2, label: 'Thứ 3' },
  { id: 3, label: 'Thứ 4' },
  { id: 4, label: 'Thứ 5' },
  { id: 5, label: 'Thứ 6' },
  { id: 6, label: 'Thứ 7' },
  { id: 7, label: 'Chủ Nhật' },
];

export default function UnavailableTimesModal({ open = false, onClose = () => {}, onSaved = () => {} }) {
  const [timeSlots, setTimeSlots] = useState([]);
  const [days] = useState(DEFAULT_DAYS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [setKeys, setSetKeys] = useState(new Set());

  useEffect(() => {
    if (!open) return;
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const slots = await scheduleService.getAllTimeSlots();
        const mapped = (slots || []).map(s => ({ id: s.id, label: s.label || s.name || `Tiết ${s.idx || s.id}`, start: s.start || (s.start_hour !== undefined ? `${String(s.start_hour).padStart(2,'0')}:${String(s.start_min||0).padStart(2,'0')}` : null) }));
        if (!mounted) return;
        setTimeSlots(mapped);

        const rows = await unavailableService.listUnavailableTimes();
        if (!mounted) return;
        const s = new Set((rows || []).map(r => `${r.day_id}:${r.time_slot_id}`));
        setSetKeys(s);
      } catch (err) {
        console.error('Failed to load unavailable times:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [open]);

  const handleToggle = (dayId, slotId) => {
    const k = `${dayId}:${slotId}`;
    const copy = new Set(setKeys);
    if (copy.has(k)) copy.delete(k); else copy.add(k);
    setSetKeys(copy);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const items = Array.from(setKeys).map(k => {
        const [day_id, time_slot_id] = k.split(':').map(Number);
        return { day_id, time_slot_id };
      });
      const saved = await unavailableService.replaceUnavailableTimes(items);
      const s = new Set((saved || []).map(r => `${r.day_id}:${r.time_slot_id}`));
      setSetKeys(s);
      onSaved(saved);
      onClose();
    } catch (err) {
      console.error('Save failed', err);
      alert('Lưu thất bại');
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" aria-hidden="true" />
      <div className="relative w-full max-w-4xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden transform transition-all duration-200 ease-out">
          <div className="p-4 md:p-6">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-xl md:text-2xl font-semibold text-gray-900 dark:text-gray-100">Chọn thời gian bận (Tuần)</h3>
                <p className="text-sm text-gray-500 dark:text-gray-300 mt-1">Nhấn vào các ô để chọn/huỷ. Nhấn <span className="font-semibold">Lưu</span> để lưu lại tất cả ô đã chọn.</p>
              </div>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-2 rounded-lg focus:outline-none">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* subtle accent bar under header */}
            <div className="h-1 w-full rounded-full bg-gradient-to-r from-indigo-200 to-blue-200 my-3" aria-hidden="true" />

            <div className="mt-4">
              {loading ? (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <p className="mt-2 text-sm text-gray-500">Đang tải...</p>
                </div>
              ) : (
                <div className="rounded-lg border border-gray-100 p-3 md:p-4 bg-white">
                  <WeekUnavailableGrid timeSlots={timeSlots} days={days} value={setKeys} onToggle={handleToggle} />
                </div>
              )}
            </div>

            <div className="mt-5 flex flex-col sm:flex-row justify-end gap-3">
              <button onClick={onClose} className="w-full sm:w-auto px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 shadow-sm">Huỷ</button>
              <button onClick={handleSave} disabled={saving} className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-indigo-600 to-blue-500 text-white rounded-lg hover:from-indigo-700 hover:to-blue-600 disabled:opacity-50 shadow-md">
                {saving ? 'Đang lưu...' : 'Lưu' }
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
