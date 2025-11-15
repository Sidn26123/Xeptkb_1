import React, { useEffect, useMemo, useState } from "react";
import { startOfWeek, addDays, setHours, setMinutes, format } from "date-fns";
import { vi as viLocale } from "date-fns/locale";
import ModernTimeTable from "../components/researchSchedule/ModernTimeTable";
import ScheduleDetailModal from "../components/researchSchedule/ScheduleDetailModal";
import SemesterSchedule from "../components/researchSchedule/SemesterSchedule";
import { getAllSemesters } from "../services/semesterService";
import { getProfile } from "../services/authService";
import { fetchScheduleEventsByTeacher } from "../services/scheduleService";

export default function Schedule() {
  const [mode, setMode] = useState("week");

  const [teacher, setTeacher] = useState(null);

  const [events, setEvents] = useState([]);
  const [loadingSemesters, setLoadingSemesters] = useState(false);
  const [loadingClasses, setLoadingClasses] = useState(false);
  const [loadingSchedules, setLoadingSchedules] = useState(false);
  const [semesters, setSemesters] = useState([]);
  const [selectedSemester, setSelectedSemester] = useState(null);
  const [selectedWeekNumber, setSelectedWeekNumber] = useState(null);

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
  }, [mode]);

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

  // In a real app we'd fetch teacher info from the API.
  // For now we keep teacher state from profile.

  const [modal, setModal] = useState({ open: false, detail: null });

  const handleEventClick = (event) => {
    setModal({
      open: true,
      detail: {
        subject: event.title,
        teacher: event.teacher,
        room: event.room,
        className: event.className || event.class_name || event.group || event.class || event.courseClassName || '',
        time: `${format(event.start, 'HH:mm')} - ${format(event.end, 'HH:mm')}`,
        date: format(event.start, 'EEEE, dd/MM/yyyy', {locale: viLocale}),
        type: event.type === 'lecture' ? 'Lý thuyết' : event.type === 'lab' ? 'Thực hành' : 'Thi',
        code: event.subject,
      }
    });
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
          {mode === "week" ? (
            // constrain timetable height so whole page fits a single screen comfortably
            <div>
              <ModernTimeTable
                events={events}
                viewMode={mode || "week"}
                onEventClick={handleEventClick}
                semesters={semesters}
                selectedSemester={selectedSemester}
                externalWeekNumber={selectedWeekNumber}
                onSelectSemester={setSelectedSemester}
              />
            </div>
          ) : mode === "semester" ? (
            <div className="bg-white rounded-lg shadow overflow-auto max-h-[calc(100vh-12rem)] text-sm p-4">
              <SemesterSchedule
                events={events}
                semesters={semesters}
                selectedSemester={selectedSemester}
                onSelectSemester={setSelectedSemester}
              />
            </div>
          ) : null}
        </div>
        <ScheduleDetailModal
          open={modal.open}
          onClose={() => setModal({ open: false, detail: null })}
          detail={modal.detail}
        />
    </div>
  );
}
