import React from "react";
import { format } from 'date-fns';
import {vi as viLocale} from 'date-fns/locale';
import TeacherScheduleDetailModal from './TeacherScheduleDetailModal';
import { getAllSemesters } from '../../services/semesterService';
import { getAllTeachers } from '../../services/teacherService';
import { fetchScheduleEventsByTeacher } from '../../services/scheduleService';
import { getAllTimeSlots } from '../../services/timeSlotService';
import ModernTimeTable from './ModernTimeTable';
import SemesterSchedule from './SemesterSchedule';

export default function TeacherSchedule() {
  const [query, setQuery] = React.useState('');
  const [teachers, setTeachers] = React.useState([]);
  const [teacherOptions, setTeacherOptions] = React.useState([]);
  const [selectedTeacherId, setSelectedTeacherId] = React.useState(null);
  const [showSuggestions, setShowSuggestions] = React.useState(false);
  const [semesters, setSemesters] = React.useState([]);
  const [selectedSemester, setSelectedSemester] = React.useState(null);
  const [events, setEvents] = React.useState([]);
  const [timeSlots, setTimeSlots] = React.useState([]);
  const [loadingTimeSlots, setLoadingTimeSlots] = React.useState(true);
  const [modal, setModal] = React.useState({open: false, detail: null});
  const [hasSearched, setHasSearched] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [mode, setMode] = React.useState('week');

  React.useEffect(() => {
    let mounted = true;
    async function loadData() {
      try {
        // Load semesters
        const semesterData = await getAllSemesters();
        if (!mounted) return;
        setSemesters(semesterData || []);
        if (Array.isArray(semesterData) && semesterData.length > 0) {
          const now = new Date();
          const current = semesterData.find(s => { try { return new Date(s.start) <= now && now <= new Date(s.end); } catch { return false; } });
          setSelectedSemester(current || semesterData[0]);
        }

        // Load teachers
        const teacherData = await getAllTeachers();
        if (!mounted) return;
        console.log('Teacher data from API:', teacherData);
        setTeachers(teacherData || []);
        
        // Format teachers for dropdown: key = "Tên - Mã", value = id
        const formattedOptions = (teacherData || []).map(teacher => {
          const formatted = {
            key: `${teacher.name || 'N/A'} - ${teacher.teacher_identifier || teacher.id}`,
            value: teacher.id,
            formattedLabel: `${teacher.name || 'N/A'} - ${teacher.teacher_identifier || teacher.id}`
          };
          console.log('Formatted teacher:', teacher.name, 'teacher_identifier:', teacher.teacher_identifier, 'formatted:', formatted.key);
          return formatted;
        });
        setTeacherOptions(formattedOptions);
        
        // Update teachers array with formattedLabel for autocomplete
        const updatedTeachers = (teacherData || []).map(teacher => ({
          ...teacher,
          formattedLabel: `${teacher.name || 'N/A'} - ${teacher.teacher_identifier || teacher.id}`
        }));
        setTeachers(updatedTeachers);
      } catch (err) {
        console.error('Error loading data for TeacherSchedule:', err);
      }
    }
    loadData();
    return () => { mounted = false; };
  }, []);

  // Load time slots once and provide to ModernTimeTable
  React.useEffect(() => {
    let mounted = true;
    const loadSlots = async () => {
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
        console.error('Failed to load time slots in TeacherSchedule:', err);
        setTimeSlots([]);
      } finally {
        if (mounted) setLoadingTimeSlots(false);
      }
    };
    loadSlots();
    return () => { mounted = false; };
  }, []);

  const handleSearch = async () => {
    let t = null;
    setLoading(true);
    if (selectedTeacherId) t = teachers.find(x => String(x.id) === String(selectedTeacherId));
    else if (query && query.trim()) {
      const q = query.trim().toLowerCase();
      // Match primarily against the single formatted label ("Name - Code").
      // Keep exact id match as a fallback.
      t = teachers.find(x => ((x.formattedLabel || x.displayLabel || '').toLowerCase().includes(q)
        || String(x.id).toLowerCase() === q));
      if (t) setSelectedTeacherId(t.id);
    }
    if (!t) {
      setEvents([]);
      setHasSearched(true);
      setLoading(false);
      return;
    }

    try {
      const semId = selectedSemester?.id || (semesters && semesters[0]?.id) || null;
      const fetched = await fetchScheduleEventsByTeacher(t.id, semId);
      setEvents(Array.isArray(fetched) ? fetched : []);
    } catch (err) {
      console.error('Error fetching teacher schedules:', err);
      setEvents([]);
    }
    setHasSearched(true);
    setLoading(false);
  };

  const handleSelectTeacher = async (t) => {
    setQuery(t.formattedLabel || (t.name || t.id));
    setSelectedTeacherId(t.id);
    setShowSuggestions(false);
    const semId = selectedSemester?.id || (semesters && semesters[0]?.id) || null;
    try {
      setLoading(true);
      const fetched = await fetchScheduleEventsByTeacher(t.id, semId);
      setEvents(Array.isArray(fetched) ? fetched : []);
    } catch (err) {
      console.error('Error fetching teacher schedules:', err);
      setEvents([]);
    } finally {
      setLoading(false);
    }
    setHasSearched(true);
  };

  const handleClear = () => {
    setQuery('');
    setSelectedTeacherId(null);
    setEvents([]);
    setHasSearched(false);
    setLoading(false);
  };

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

  const selectedTeacherObj = (teachers || []).find(t => String(t.id) === String(selectedTeacherId));
  const displayLabel = selectedTeacherObj
    ? (
        selectedTeacherObj.formattedLabel || `${selectedTeacherObj.name || ('#' + selectedTeacherObj.id)}${selectedTeacherObj.teacher_identifier ? ' - ' + selectedTeacherObj.teacher_identifier : ''}`
      )
    : query;

  // When the selected semester or selected teacher changes, refresh events
  // automatically so the timetable matches the chosen semester (like ClassSchedule).
  React.useEffect(() => {
    let mounted = true;
    async function refreshForSemester() {
      if (!selectedTeacherId) return;
      const semId = selectedSemester?.id || (semesters && semesters[0]?.id) || null;
      try {
        if (mounted) setLoading(true);
        const fetched = await fetchScheduleEventsByTeacher(selectedTeacherId, semId);
        if (!mounted) return;
        setEvents(Array.isArray(fetched) ? fetched : []);
        setHasSearched(true);
      } catch (err) {
        console.error('Error fetching teacher schedules after semester change:', err);
        if (!mounted) return;
        setEvents([]);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    refreshForSemester();
    return () => { mounted = false; };
  }, [selectedSemester, selectedTeacherId, semesters]);

  return (
      <div className="space-y-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="relative flex-1">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => { setQuery(e.target.value); setShowSuggestions(true); setSelectedTeacherId(null); }}
                  onFocus={() => setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleSearch(); } }}
                  placeholder="Tìm giảng viên theo tên hoặc mã..."
                  className="input input-bordered w-full"
                />
                {showSuggestions && query && Array.isArray(teachers) && teachers.filter(t => {
                  const q = query.trim().toLowerCase();
                  return (t.formattedLabel || '').toLowerCase().includes(q);
                }).slice(0,8).map(t => t).length > 0 && (
                  <ul className="absolute z-50 left-0 right-0 bg-white dark:bg-gray-800 border rounded mt-1 max-h-56 overflow-auto shadow">
                    {teachers.filter(t => { const q = query.trim().toLowerCase(); return (t.formattedLabel || '').toLowerCase().includes(q); }).slice(0,8).map(t => (
                      <li key={t.id} className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer" onMouseDown={() => handleSelectTeacher(t)}>
                        <div className="font-medium">
                          {t.formattedLabel}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
                </div>
                <select value={mode} onChange={(e) => setMode(e.target.value)}
                        className="select select-bordered w-40">
                    <option value="week">Tuần</option>
                    <option value="semester">Học kỳ</option>
                </select>
                <button onClick={handleClear} type="button" className="btn btn-outline">Clear</button>
            </div>
        </div>
        {hasSearched ? (
          selectedTeacherId ? (
            mode === 'week' ? (
              <ModernTimeTable events={events} viewMode={mode} onEventClick={handleEventClick} semesters={semesters} selectedSemester={selectedSemester} onSelectSemester={setSelectedSemester} externalTimeSlots={timeSlots} externalLoadingTimeSlots={loadingTimeSlots} />
            ) : (
              <SemesterSchedule events={events} semesters={semesters} selectedSemester={selectedSemester} onSelectSemester={setSelectedSemester} />
            )
          ) : (
            events.length === 0 ? (
              <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
                <p className="text-sm text-gray-600 dark:text-gray-300">Không tìm thấy lịch cho "{displayLabel}".</p>
              </div>
            ) : (
              mode === 'week' ? (
                <ModernTimeTable events={events} viewMode={mode} onEventClick={handleEventClick} semesters={semesters} selectedSemester={selectedSemester} onSelectSemester={setSelectedSemester} externalTimeSlots={timeSlots} externalLoadingTimeSlots={loadingTimeSlots} />
              ) : (
                <SemesterSchedule events={events} semesters={semesters} selectedSemester={selectedSemester} onSelectSemester={setSelectedSemester} />
              )
            )
          )
        ) : null}

        <TeacherScheduleDetailModal
          open={modal.open}
          onClose={() => setModal({open: false, detail: null})}
          detail={modal.detail}
        />
    </div>
  );
}
