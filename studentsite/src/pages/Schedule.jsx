import React, { useEffect, useState } from "react";
import { startOfWeek, addDays, format } from "date-fns";
import { vi as viLocale } from "date-fns/locale";
import ModernTimeTable from "../components/researchSchedule/ModernTimeTable";
import ScheduleDetailModal from "../components/researchSchedule/ScheduleDetailModal";
import SemesterSchedule from "../components/researchSchedule/SemesterSchedule";
import { getAllSemesters } from "../services/semesterService";
import { getProfile } from "../services/authService";
import { getAllTimeSlots } from "../services/timeSlotService";

export default function Schedule() {
  const [mode] = useState("week");

  const [student, setStudent] = useState(null);
  const [events, setEvents] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);
  const [loadingTimeSlots, setLoadingTimeSlots] = useState(true);
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
            const currentSemester = sems.find((s) => {
              try {
                return new Date(s.start) <= now && now <= new Date(s.end);
              } catch {
                return false;
              }
            });
            setSelectedSemester(currentSemester || sems[0]);
            if (currentSemester) {
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

      // fetch student profile
      try {
        const profile = await getProfile();
        if (mounted && profile) {
          setStudent(profile);
        } else if (mounted) {
          setStudent(null);
        }
      } catch (err) {
        console.warn("Failed to load student profile", err);
        if (mounted) setStudent(null);
      } finally {
        if (mounted) setLoadingClasses(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [mode]);

  // Load time slots once and pass to ModernTimeTable
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoadingTimeSlots(true);
        const slots = await getAllTimeSlots();
        if (!mounted) return;
        const mapped = (slots || []).map(slot => ({
          ...slot,
          label: slot.name || slot.label || `Tiết ${slot.idx || slot.id}`,
          start: slot.start || (slot.start_hour !== undefined ? `${String(slot.start_hour).padStart(2, '0')}:${String(slot.start_min||0).padStart(2, '0')}` : null),
          end: slot.end || (slot.end_hour !== undefined ? `${String(slot.end_hour).padStart(2, '0')}:${String(slot.end_min||0).padStart(2, '0')}` : null),
        }));
        setTimeSlots(mapped);
      } catch (err) {
        console.error('Failed to load time slots in Student Schedule:', err);
        setTimeSlots([]);
      } finally {
        if (mounted) setLoadingTimeSlots(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  // Fetch schedules when student or semester changes
  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!student || !selectedSemester) {
        if (mounted) setEvents([]);
        return;
      }
      setLoadingSchedules(true);
      try {
        // Try to use a dedicated API if available; otherwise fallback to getAllSchedules and filter by student/class
        const svc = await import("../services/scheduleService");
        if (svc.fetchScheduleEventsByStudent) {
          // fetchScheduleEventsByStudent expects a classId (server filters by class)
          const classId = student.class_id || student.class?.id || student.classId || null;
          const fetched = await svc.fetchScheduleEventsByStudent(classId, selectedSemester.id);
          if (mounted) setEvents(Array.isArray(fetched) ? fetched : []);
        } else if (svc.getAllSchedules) {
          const all = await svc.getAllSchedules();
          const filtered = Array.isArray(all)
            ? all.filter((e) => String(e.student_id) === String(student.id) || String(e.course_class_id) === String(student.class_id))
            : [];
          if (mounted) setEvents(filtered);
        } else {
          if (mounted) setEvents([]);
        }
      } catch (err) {
        console.warn("Failed to load schedules", err);
        if (mounted) setEvents([]);
      } finally {
        if (mounted) setLoadingSchedules(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [student, selectedSemester]);

  const [modal, setModal] = useState({ open: false, detail: null });

  const handleEventClick = (event) => {
    setModal({
      open: true,
      detail: {
        subject: event.title,
        teacher: event.teacher,
        room: event.room,
        className: event.className || event.class_name || event.group || event.class || event.courseClassName || '',
        time: `${format(event.start, "HH:mm")} - ${format(event.end, "HH:mm")}`,
        date: format(event.start, "EEEE, dd/MM/yyyy", { locale: viLocale }),
        type: event.type === 'lecture' ? 'Lý thuyết' : event.type === 'lab' ? 'Thực hành' : 'Thi',
        code: event.subject,
      },
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
    <div className="h-full bg-gray-100 overflow-hidden">
      <div className="space-y-4">
        {mode === "week" ? (
          <div>
            <ModernTimeTable
              events={events}
              viewMode={mode || "week"}
              onEventClick={handleEventClick}
              semesters={semesters}
              selectedSemester={selectedSemester}
              externalWeekNumber={selectedWeekNumber}
              onSelectSemester={setSelectedSemester}
              externalTimeSlots={timeSlots}
              externalLoadingTimeSlots={loadingTimeSlots}
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
