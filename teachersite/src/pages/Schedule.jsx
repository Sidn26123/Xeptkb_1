import React, { useEffect, useMemo, useState } from "react";
import { startOfWeek, addDays, setHours, setMinutes, format } from "date-fns";
import { vi as viLocale } from "date-fns/locale";
import ModernTimeTable from "../components/researchSchedule/ModernTimeTable";
import ScheduleDetailModal from "../components/researchSchedule/ScheduleDetailModal";
import SemesterSchedule from "../components/researchSchedule/SemesterSchedule";
import { getAllSemesters } from "../services/semesterService";

export default function Schedule() {
  const [mode, setMode] = useState("week");

  const mockTeacher = useMemo(
    () => ({ id: 1, teacher_id: 7, name: "Nguyễn Văn A" }),
    []
  );

  const [events, setEvents] = useState([]);
  const [loadingSemesters, setLoadingSemesters] = useState(false);
  const [loadingClasses, setLoadingClasses] = useState(false);
  const [loadingSchedules, setLoadingSchedules] = useState(false);
  const [_filter, setFilter] = useState({});
  const [_classes, setClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState("");
  const [query, setQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [semesters, setSemesters] = useState([]);
  const [selectedSemester, setSelectedSemester] = useState(null);
  const [selectedWeekNumber, setSelectedWeekNumber] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);

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
            setSelectedSemester(sems[0]);
            // default to week 1 of the semester
            setSelectedWeekNumber(1);
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

      // fetch classes
      try {
        const authSvc = await import("../services/authService");
        const res = await authSvc.default.apiClient.get("/classes");
        if (mounted && res && res.data && Array.isArray(res.data.data)) {
          setClasses(res.data.data);
        } else if (mounted) setClasses([]);
      } catch (err) {
        console.warn("Failed to load classes", err);
        if (mounted) setClasses([]);
      } finally {
        if (mounted) setLoadingClasses(false);
      }

      // fetch schedules and map to event objects (best-effort mapping)
      try {
        const { getAllSchedules } = await import('../services/scheduleService');
        const schedules = await getAllSchedules();
        if (mounted && Array.isArray(schedules)) {
          const monday = startOfWeek(new Date(), { weekStartsOn: 1 });
          const mapped = schedules.map((s) => {
            const dayIndex = (s.day_id || 1) - 1;
            const startDate = addDays(monday, Math.max(0, dayIndex));
            return {
              id: s.id,
              title: s.subject || s.name || `Lịch ${s.id}`,
              subject: s.subject_code || s.subject || null,
              teacher: s.scheduler || "",
              room: s.room || "",
              course_class_id: s.course_class_id,
              time_slot_id: s.time_slot_id,
              num_of_period: s.num_of_period || 1,
              // start date set to the target week day so ModernTimeTable can group by day
              start: startDate,
              end: startDate,
            };
          });
          setEvents(mapped);
        } else if (mounted) {
          setEvents([]);
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
  }, [mode]);

  // In a real app we'd fetch classes and teacher info from the API.
  // For now we keep mockTeacher and sample events in-memory.

  function getSampleEvents() {
    const today = new Date();
    const monday = startOfWeek(today, { weekStartsOn: 1 });
    return [
      {
        id: 1,
        title: "Toán cao cấp 1",
        subject: 'INT1332',
        start: setMinutes(setHours(addDays(monday, 0), 7), 0),
        end: setMinutes(setHours(addDays(monday, 0), 9), 30),
        teacher: "TS. Nguyễn Văn A",
        room: "P101 - Nhà A1",
        course_class_id: 101,
        // spans 4 periods starting at slot 1 (example to demonstrate merged cells)
        time_slot_id: 1,
        num_of_period: 4,
      },
      {
        id: 3,
        title: "Thực hành Lập trình C",
        subject: 'INT1331',
        start: setMinutes(setHours(addDays(monday, 2), 13), 30),
        end: setMinutes(setHours(addDays(monday, 2), 16), 0),
        teacher: "ThS. Trần Thị B",
        room: "Lab2 - Nhà A3",
        course_class_id: 102,
      },
      {
        id: 4,
        title: "Vật lý đại cương",
        subject: 'PHY1343',
        start: setMinutes(setHours(addDays(monday, 1), 7), 0),
        end: setMinutes(setHours(addDays(monday, 1), 9), 30),
        teacher: "PGS.TS Lê Văn C",
        room: "P105 - Nhà A1",
        course_class_id: 103,
      },
      {
        id: 5,
        title: "Tiếng Anh 1",
        subject: 'ENG1001',
        start: setMinutes(setHours(addDays(monday, 3), 9), 30),
        end: setMinutes(setHours(addDays(monday, 3), 12), 0),
        teacher: "ThS. Phạm Thị D",
        room: "P304 - Nhà B1",
        course_class_id: 101,
        // spans 2 periods starting at slot 3
        time_slot_id: 3,
        num_of_period: 2,
      },
      {
        id: 6,
        title: "Cấu trúc dữ liệu",
        start: setMinutes(setHours(addDays(monday, 4), 13), 30),
        end: setMinutes(setHours(addDays(monday, 4), 16), 0),
        teacher: "TS. Hoàng Văn E",
        room: "P201 - Nhà A2",
        course_class_id: 101,
      },
    ];
  }

  const classSchedules = useMemo(() => {
    return getSampleEvents().filter(
      (s) => String(s.course_class_id) === String(mockTeacher.class_id || 101)
    );
  }, [mockTeacher.class_id]);

  const [modal, setModal] = useState({ open: false, detail: null });

  const handleEventClick = (event) => {
    setModal({
      open: true,
      detail: {
        subject: event.title,
        teacher: event.teacher,
        room: event.room,
        time: `${format(event.start, "HH:mm")} - ${format(event.end, "HH:mm")}`,
        date: format(event.start, "EEEE, dd/MM/yyyy", { locale: viLocale }),
        type: event.type || "",
        code: event.subject || "",
      },
    });
  };

  // initialize view to teacher's class schedule by default
  useEffect(() => {
    setEvents(classSchedules);
    setHasSearched(true);
    setSelectedClassId(mockTeacher.class_id || 101);
    setFilter({ selectedClassId: mockTeacher.class_id || 101, mode });
  }, [classSchedules, mockTeacher.class_id, mode]);

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
    <div className="h-screen bg-gray-100">
      <div className="h-min overflow-auto">
        <div className="space-y-4">
          {mode === "week" ? (
            // constrain timetable height so whole page fits a single screen comfortably
            <div className="bg-white rounded-lg shadow overflow-auto max-h-[calc(100vh-12rem)] text-sm">
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
            <div className="bg-white rounded-lg shadow overflow-auto max-h-[calc(100vh-12rem)] text-sm">
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
    </div>
  );
}
