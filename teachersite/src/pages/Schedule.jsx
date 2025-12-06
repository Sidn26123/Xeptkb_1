import React, { useEffect, useState, useMemo } from "react";

import ModernTimeTable from "../components/researchSchedule/ModernTimeTable";
import MonthView from "../components/researchSchedule/MonthView";
import { startOfWeek, addDays, setHours, setMinutes, addMinutes } from 'date-fns';
import ScheduleDetailModal from "../components/researchSchedule/ScheduleDetailModal";
import EditScheduleModal from "../components/researchSchedule/EditScheduleModal";
import { getAllSemesters } from "../services/semesterService";
import { getProfile } from "../services/authService";
import { fetchScheduleEventsByTeacher, getAllTimeSlots } from "../services/scheduleService";

export default function Schedule() {
  const [teacher, setTeacher] = useState(null);
  const [viewMode, setViewMode] = useState('week'); // 'week' or 'month'
  const [monthCursor, setMonthCursor] = useState(null); // Date for current month in month view

  const [events, setEvents] = useState([]);
  const [loadingSemesters, setLoadingSemesters] = useState(false);
  const [loadingClasses, setLoadingClasses] = useState(false);
  const [loadingSchedules, setLoadingSchedules] = useState(false);
  const [semesters, setSemesters] = useState([]);
  const [selectedSemester, setSelectedSemester] = useState(null);
  const [selectedWeekNumber, setSelectedWeekNumber] = useState(null);
  const [timeSlots, setTimeSlots] = useState([]);
  const [loadingTimeSlots, setLoadingTimeSlots] = useState(true);

  // compute an initial date for MonthView based on selected semester + selectedWeekNumber
  const initialMonthDate = useMemo(() => {
    try {
      if (!selectedSemester) return new Date();
      const semStart = new Date(selectedSemester.start);
      const weekStart = startOfWeek(semStart, { weekStartsOn: 1 });
      const offsetWeeks = Math.max(1, selectedWeekNumber || 1) - 1;
      return addDays(weekStart, offsetWeeks * 7);
    } catch {
      return new Date();
    }
  }, [selectedSemester, selectedWeekNumber]);

  // Set monthCursor when initialMonthDate changes
  useEffect(() => {
    setMonthCursor(initialMonthDate);
  }, [initialMonthDate]);

  

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoadingSemesters(true);
      setLoadingClasses(true);
      setLoadingSchedules(true);
      try {
        const sems = await getAllSemesters();
        if (mounted && Array.isArray(sems)) {
          setSemesters(sems);
          if (sems.length > 0) {
            const now = new Date();
            const currentSemester = sems.find(s => {
              try {
                return new Date(s.start) <= now && now <= new Date(s.end);
              } catch {
                return false;
              }
            });
            setSelectedSemester(currentSemester || sems[0]);
            if (currentSemester) {
              // Calculate current week number
              const startDate = new Date(currentSemester.start);
              const diffTime = now - startDate;
              const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
              const weekNumber = Math.floor(diffDays / 7) + 1;
              setSelectedWeekNumber(Math.max(1, weekNumber));
            } else {
              setSelectedWeekNumber(1);
            }
          }
        }
      } catch (err) {
        console.error("Failed to load semesters", err);
        if (mounted) {
          setSemesters([]);
          setSelectedSemester(null);
        }
      } finally {
        if (mounted) setLoadingSemesters(false);
      }

      // fetch teacher profile
      try {
        const profile = await getProfile();
        if (mounted && profile) {
          setTeacher(profile);
        } else if (mounted) {
          setTeacher(null);
        }
      } catch (err) {
        console.warn("Failed to load teacher profile", err);
        if (mounted) setTeacher(null);
      } finally {
        if (mounted) setLoadingClasses(false);
      }

      // fetch schedules will be done after teacher is loaded
    })();

    return () => {
      mounted = false;
    };
  }, []);

  // Fetch schedules when teacher or semester changes
  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!teacher || !selectedSemester) {
        if (mounted) setEvents([]);
        return;
      }
      setLoadingSchedules(true);
      try {
        let fetched = [];
        fetched = await fetchScheduleEventsByTeacher(teacher.id, selectedSemester.id);
        // Enrich with start/end
        const enriched = fetched.map(ev => {
          const slot = timeSlots.find(ts => ts.id === ev.time_slot_id);
          if (!slot) return { ...ev, start: new Date(ev.date + 'T00:00:00'), end: new Date(ev.date + 'T00:00:00') }; // fallback
          const eventDate = new Date(ev.date + 'T00:00:00');
          let start, end;
          if (slot.start_hour !== undefined && slot.start_min !== undefined) {
            start = setHours(setMinutes(eventDate, slot.start_min), slot.start_hour);
            end = addMinutes(start, ev.num_of_period * 45);
          } else {
            const baseStartTime = setHours(setMinutes(eventDate, 0), 7);
            const startMinutesOffset = (ev.time_slot_id - 1) * 45;
            start = addMinutes(baseStartTime, startMinutesOffset);
            end = addMinutes(start, ev.num_of_period * 45);
          }
          return { ...ev, start, end };
        });
        if (mounted) {
          setEvents(Array.isArray(enriched) ? enriched : []);
        }
      } catch (err) {
        console.warn('Failed to load schedules', err);
        if (mounted) setEvents([]);
      } finally {
        if (mounted) setLoadingSchedules(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [teacher, selectedSemester, viewMode, monthCursor, timeSlots]);

  // Fetch time slots once when the page mounts (or when teacher page is opened)
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoadingTimeSlots(true);
        const slots = await getAllTimeSlots();
        const mapped = (slots || []).map(slot => ({
          ...slot,
          label: slot.name || slot.label || `Tiết ${slot.idx || slot.id}`,
          start: slot.start || (slot.start_hour !== undefined ? `${String(slot.start_hour).padStart(2, '0')}:${String(slot.start_min||0).padStart(2, '0')}` : null),
          end: slot.end || (slot.end_hour !== undefined ? `${String(slot.end_hour).padStart(2, '0')}:${String(slot.end_min||0).padStart(2, '0')}` : null),
        }));
        if (!mounted) return;
        setTimeSlots(mapped);
      } catch (err) {
        console.warn('Failed to load time slots in Schedule page:', err);
        if (mounted) setTimeSlots([]);
      } finally {
        if (mounted) setLoadingTimeSlots(false);
      }
    })();

    return () => { mounted = false; };
  }, []);

  // In a real app we'd fetch teacher info from the API.
  // For now we keep teacher state from profile.

  const [modal, setModal] = useState({ open: false, detail: null });
  const [editModal, setEditModal] = useState({ open: false, detail: null });

  const handleEventClick = (event) => {
    setModal({
      open: true,
      detail: {
        id: event.id || event.raw?.id || event.raw?.instanceId || event.raw?.schedule_instance_id || null,
      }
    });
  };

  const handleEdit = (detail) => {
    setModal({ open: false, detail: null }); // Close detail modal
    setEditModal({ open: true, detail }); // Open edit modal
  };

  const handleSaveEdit = async () => {
    try {
      // Refresh events after apply, based on current viewMode
      if (teacher && selectedSemester) {
        let fetched = [];
        fetched = await fetchScheduleEventsByTeacher(teacher.id, selectedSemester.id);
        // Enrich with start/end
        const enriched = fetched.map(ev => {
          const slot = timeSlots.find(ts => ts.id === ev.time_slot_id);
          if (!slot) return { ...ev, start: new Date(ev.date + 'T00:00:00'), end: new Date(ev.date + 'T00:00:00') }; // fallback
          const eventDate = new Date(ev.date + 'T00:00:00');
          let start, end;
          if (slot.start_hour !== undefined && slot.start_min !== undefined) {
            start = setHours(setMinutes(eventDate, slot.start_min), slot.start_hour);
            end = addMinutes(start, ev.num_of_period * 45);
          } else {
            const baseStartTime = setHours(setMinutes(eventDate, 0), 7);
            const startMinutesOffset = (ev.time_slot_id - 1) * 45;
            start = addMinutes(baseStartTime, startMinutesOffset);
            end = addMinutes(start, ev.num_of_period * 45);
          }
          return { ...ev, start, end };
        });
        setEvents(Array.isArray(enriched) ? enriched : []);
      }
      alert('Cập nhật lịch học thành công!');
    } catch (error) {
      console.error('Failed to update schedule:', error);
      throw error; // Re-throw to let the modal handle the error
    }
  };

  // show loading placeholder while any of the core data is loading
  if (loadingSemesters || loadingClasses || loadingSchedules) {
    return (
      <div className="min-h-screen bg-gray-100">
        <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="text-lg font-semibold text-gray-700">Đang tải dữ liệu thời khóa biểu...</div>
            <div className="mt-3 text-sm text-gray-500">Vui lòng đợi hoặc kiểm tra kết nối tới server.</div>
          </div>
        </main>
      </div>
    );
  }

  return (
    // limit page to single viewport height; inner content scrolls
    <div className="h-full bg-gray-100 overflow-hidden flex items-center justify-center pb-20 pl-20 pr-20">
      <div className="w-full h-full bg-white rounded-lg shadow-lg p-6 scale-105 overflow-auto">
        <div className="space-y-4">
          <div>
            <div className="mb-3 flex items-center justify-end">
              <div className="flex items-center gap-2">
                <button onClick={() => setViewMode('week')} className={`px-2 py-1 rounded ${viewMode === 'week' ? 'bg-blue-600 text-white' : 'bg-transparent text-gray-600'}`}>Tuần</button>
                <button onClick={() => setViewMode('month')} className={`px-2 py-1 rounded ${viewMode === 'month' ? 'bg-blue-600 text-white' : 'bg-transparent text-gray-600'}`}>Tháng</button>
              </div>
            </div>

            {viewMode === 'month' ? (
              <MonthView
                currentMonth={monthCursor}
                onMonthChange={setMonthCursor}
                events={events}
                onEventClick={handleEventClick}
                semesters={semesters}
                selectedSemester={selectedSemester}
                externalWeekNumber={selectedWeekNumber}
                externalTimeSlots={timeSlots}
                externalLoadingTimeSlots={loadingTimeSlots}
                onSelectSemester={setSelectedSemester}
                />
            ) : (
              <ModernTimeTable
                events={events}
                onEventClick={handleEventClick}
                semesters={semesters}
                selectedSemester={selectedSemester}
                externalWeekNumber={selectedWeekNumber}
                externalTimeSlots={timeSlots}
                externalLoadingTimeSlots={loadingTimeSlots}
                onSelectSemester={setSelectedSemester}
              />
            )}
          </div>
        </div>
        <ScheduleDetailModal
          open={modal.open}
          onClose={() => setModal({ open: false, detail: null })}
          onEdit={handleEdit}
          detail={modal.detail}
        />
        <EditScheduleModal
          open={editModal.open}
          onClose={() => setEditModal({ open: false, detail: null })}
          onSave={handleSaveEdit}
          detail={editModal.detail}
        />
      </div>
    </div>
  );
}
