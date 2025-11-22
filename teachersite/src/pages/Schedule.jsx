import React, { useEffect, useState } from "react";

import ModernTimeTable from "../components/researchSchedule/ModernTimeTable";
import ScheduleDetailModal from "../components/researchSchedule/ScheduleDetailModal";
import EditScheduleModal from "../components/researchSchedule/EditScheduleModal";
import { getAllSemesters } from "../services/semesterService";
import { getProfile } from "../services/authService";
import { fetchScheduleEventsByTeacher, getAllTimeSlots } from "../services/scheduleService";

export default function Schedule() {
  const [teacher, setTeacher] = useState(null);

  const [events, setEvents] = useState([]);
  const [loadingSemesters, setLoadingSemesters] = useState(false);
  const [loadingClasses, setLoadingClasses] = useState(false);
  const [loadingSchedules, setLoadingSchedules] = useState(false);
  const [semesters, setSemesters] = useState([]);
  const [selectedSemester, setSelectedSemester] = useState(null);
  const [selectedWeekNumber, setSelectedWeekNumber] = useState(null);
  const [timeSlots, setTimeSlots] = useState([]);
  const [loadingTimeSlots, setLoadingTimeSlots] = useState(true);

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
        const fetched = await fetchScheduleEventsByTeacher(teacher.id, selectedSemester.id);
        if (mounted) {
          setEvents(Array.isArray(fetched) ? fetched : []);
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
  }, [teacher, selectedSemester]);

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
      // Refresh events after apply
      if (teacher && selectedSemester) {
        const fetched = await fetchScheduleEventsByTeacher(teacher.id, selectedSemester.id);
        setEvents(Array.isArray(fetched) ? fetched : []);
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
    <div className="h-full bg-gray-100 overflow-hidden">
        <div className="space-y-4">
          <div>
            <ModernTimeTable
              events={events}
              viewMode="week"
              onEventClick={handleEventClick}
              semesters={semesters}
              selectedSemester={selectedSemester}
              externalWeekNumber={selectedWeekNumber}
              externalTimeSlots={timeSlots}
              externalLoadingTimeSlots={loadingTimeSlots}
              onSelectSemester={setSelectedSemester}
            />
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
  );
}
