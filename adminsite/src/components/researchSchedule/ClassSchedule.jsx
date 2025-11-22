import React from "react";
import {startOfWeek, addDays, setHours, setMinutes, format, addMinutes} from 'date-fns';
import {vi as viLocale} from 'date-fns/locale';
import ModernTimeTable from "./ModernTimeTable";
import ClassScheduleDetailModal from "./ClassScheduleDetailModal";
import SemesterSchedule from "./SemesterSchedule";
import {getAllSemesters} from '../../services/semesterService';
import {getAllClasses} from '../../services/classService';
import {getAllRooms} from '../../services/roomService.js';
import {getAllCourseClasses} from '../../services/courseClassService.js';
import {getAllSchedules} from "../../services/scheduleService.js";
import {fetchScheduleEvents} from "../../services/scheduleService.js";
import { getAllTimeSlots } from '../../services/timeSlotService';

export default function ClassSchedule() {
    const [events, setEvents] = React.useState([]);
    const [timeSlots, setTimeSlots] = React.useState([]);
    const [loadingTimeSlots, setLoadingTimeSlots] = React.useState(true);
    const [_filter, setFilter] = React.useState({});
    const [_classes, setClasses] = React.useState([]);
    const [modal, setModal] = React.useState({open: false, detail: null});
    const [selectedClassId, setSelectedClassId] = React.useState("");
    const [query, setQuery] = React.useState("");
    const [showSuggestions, setShowSuggestions] = React.useState(false);
    const [mode, setMode] = React.useState("week");
    const [loading, setLoading] = React.useState(false);
    const [semesters, setSemesters] = React.useState([]);
    const [selectedSemester, setSelectedSemester] = React.useState(null);
    const [hasSearched, setHasSearched] = React.useState(false);
    const [rooms, setRooms] = React.useState([]);
    const [courseClasses, setCourseClasses] = React.useState([]);

    // We fetch classes once; events will be generated when the user clicks "Tìm".
    React.useEffect(() => {
        let mounted = true;
        async function fetchClasses() {
            try {
                const data = await getAllClasses();
                if (!mounted) return;
                setClasses(data || []);
            } catch (err) {
                console.error('Error fetching classes in ClassSchedule:', err);
            }
        }
        fetchClasses();
        return () => { mounted = false; };
    }, []);

    // Preload rooms and course-classes once to avoid per-item API calls when
    // converting schedules or when doing UI lookups (use cache only).
    React.useEffect(() => {
        let mounted = true;
        async function fetchCaches() {
            try {
                const [roomsData, ccData] = await Promise.all([
                    getAllRooms(),
                    getAllCourseClasses(),
                ]);
                if (!mounted) return;
                setRooms(roomsData || []);
                setCourseClasses(ccData || []);
            } catch (err) {
                console.error('Error preloading rooms/course-classes:', err);
            }
        }
        fetchCaches();
        return () => { mounted = false; };
    }, []);

    // Fetch semesters once so multiple views can reuse the list and the
    // selected semester value.
    React.useEffect(() => {
        let mounted = true;
        async function fetchSemesters() {
            try {
                const data = await getAllSemesters();
                if (!mounted) return;
                setSemesters(data || []);

                if (Array.isArray(data) && data.length > 0) {
                    const now = new Date();
                    // Find semester that contains 'now' (inclusive)
                    const current = data.find(s => {
                        try {
                            const start = new Date(s.start);
                            const end = new Date(s.end);
                            return start <= now && now <= end;
                        } catch {
                            return false;
                        }
                    });

                    // If a matching semester exists choose it, otherwise fallback to first
                    setSelectedSemester(current || data[0]);
                }
            } catch (err) {
                console.error('Error fetching semesters in StudentSchedule:', err);
            }
        }

        fetchSemesters();
        return () => {
            mounted = false;
        };
    }, []);

        // Load time slots once for ModernTimeTable
        React.useEffect(() => {
            let mounted = true;
            const load = async () => {
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
                    console.error('Failed to load time slots in ClassSchedule:', err);
                    setTimeSlots([]);
                } finally {
                    if (mounted) setLoadingTimeSlots(false);
                }
            };
            load();
            return () => { mounted = false; };
        }, []);

    // When the selected semester changes (or selected class changes), refetch
    // schedule events for the currently selected class so the view matches the
    // chosen semester automatically.
    React.useEffect(() => {
        let mounted = true;
        async function refreshEventsForSemester() {
            if (!selectedClassId) return;

            const semesterId = selectedSemester?.id || (semesters && semesters[0]?.id) || null;
            try {
                setLoading(true);
                const fetched = await fetchScheduleEvents(selectedClassId, semesterId);
                if (!mounted) return;
                setEvents(Array.isArray(fetched) ? fetched : []);
            } catch (err) {
                console.error('Error fetching schedule after semester change:', err);
                if (!mounted) return;
                setEvents([]);
            } finally {
                if (mounted) setLoading(false);
            }
        }

        refreshEventsForSemester();
        return () => { mounted = false; };
    }, [selectedSemester, selectedClassId, semesters]);

    const handleEventClick = (event) => {
        setModal({
            open: true,
            detail: {
                subject: event.title,
                teacher: event.teacher,
                room: event.room,
                time: `${format(event.start, 'HH:mm')} - ${format(event.end, 'HH:mm')}`,
                date: format(event.start, 'EEEE, dd/MM/yyyy', {locale: viLocale}),
                type: event.type === 'lecture' ? 'Lý thuyết' : event.type === 'lab' ? 'Thực hành' : 'Thi',
                code: event.subject,
            }
        });
    };

    const handleSearch = async () => {
        setLoading(true);
        // Determine semester id to query (use selectedSemester or fallback to first)
        const semesterId = selectedSemester?.id || (semesters && semesters[0]?.id) || null;

        // If user didn't click a suggestion, try to match typed query to a class
        // If user didn't click a suggestion, try to match typed query to a class
        let cls = null;
        if (selectedClassId) {
            cls = (_classes || []).find(c => String(c.id) === String(selectedClassId));
        } else if (query && String(query).trim().length > 0) {
            const q = query.trim().toLowerCase();
            cls = (_classes || []).find(c => ((c.name || '').toLowerCase().includes(q)) || ((c.code || '').toLowerCase().includes(q)) || String(c.id) === q);
            if (cls) setSelectedClassId(cls.id);
        }
        if (!cls) {
            // nothing matched
            setEvents([]);
            setHasSearched(true);
            setFilter({selectedClassId: null, mode});
            return;
        }

        try {
            // fetch schedule events for the selected class + semester
            const fetched = await fetchScheduleEvents(cls.id, semesterId);
            setEvents(Array.isArray(fetched) ? fetched : []);
        } catch (err) {
            console.error('Error fetching schedule for class in handleSearch:', err);
            setEvents([]);
        }

        setHasSearched(true);
        setFilter({selectedClassId: cls.id, mode});
        setLoading(false);
    };

    const handleSelectClass = async  (c) => {
        const id = c?.id;
        setQuery((c.name || c.id) + (c.code ? ` (${c.code})` : ''));
        setSelectedClassId(id);
        setShowSuggestions(false);
        // build events for the selected class (for the currently selected semester)
        const semesterId = selectedSemester?.id || (semesters && semesters[0]?.id) || null;

        try {
            setLoading(true);
            const fetched = await fetchScheduleEvents(id, semesterId);
            setEvents(Array.isArray(fetched) ? fetched : []);
        } catch (err) {
            console.error('Error fetching schedule for selected class:', err);
            setEvents([]);
        } finally {
            setLoading(false);
        }

        setHasSearched(true);
        setFilter({selectedClassId: id, mode});
    };

    const handleClear = () => {
        setQuery('');
        setSelectedClassId('');
        setEvents([]);
        setHasSearched(false);
        setFilter({});
    };

    // Helper to build sample events (shared with live filtering)
    function getSampleEvents() {
        const today = new Date();
        const monday = startOfWeek(today, {weekStartsOn: 1});
        return [
            {
                id: 1,
                title: 'Toán cao cấp 1',
                start: setMinutes(setHours(addDays(monday, 0), 7), 0),
                end: setMinutes(setHours(addDays(monday, 0), 9), 30),
                teacher: 'TS. Nguyễn Văn A',
                room: 'P101 - Nhà A1',
                type: 'lecture',
                subject: 'INT1332',
            },
            {
                id: 2,
                title: 'Lập trình C',
                start: setMinutes(setHours(addDays(monday, 0), 9), 30),
                end: setMinutes(setHours(addDays(monday, 0), 12), 0),
                teacher: 'ThS. Trần Thị B',
                room: 'P203 - Nhà A2',
                type: 'lecture',
                subject: 'INT1331',
            },
            {
                id: 3,
                title: 'Thực hành Lập trình C',
                start: setMinutes(setHours(addDays(monday, 2), 13), 30),
                end: setMinutes(setHours(addDays(monday, 2), 16), 0),
                teacher: 'ThS. Trần Thị B',
                room: 'Lab2 - Nhà A3',
                type: 'lab',
                subject: 'INT1331',
            },
            {
                id: 4,
                title: 'Vật lý đại cương',
                start: setMinutes(setHours(addDays(monday, 1), 7), 0),
                end: setMinutes(setHours(addDays(monday, 1), 9), 30),
                teacher: 'PGS.TS Lê Văn C',
                room: 'P105 - Nhà A1',
                type: 'lecture',
                subject: 'PHY1343',
            },
            {
                id: 5,
                title: 'Tiếng Anh 1',
                start: setMinutes(setHours(addDays(monday, 3), 9), 30),
                end: setMinutes(setHours(addDays(monday, 3), 12), 0),
                teacher: 'ThS. Phạm Thị D',
                room: 'P304 - Nhà B1',
                type: 'lecture',
                subject: 'ENG1001',
            },
            {
                id: 6,
                title: 'Cấu trúc dữ liệu',
                start: setMinutes(setHours(addDays(monday, 4), 13), 30),
                end: setMinutes(setHours(addDays(monday, 4), 16), 0),
                teacher: 'TS. Hoàng Văn E',
                room: 'P201 - Nhà A2',
                type: 'lecture',
                subject: 'INT2204',
            },
        ];
    }


    // const convertSchedulesToUI = async () => {
    //     const schedules = await getAllSchedules();
    //
    //     const monday = startOfWeek(new Date(), {weekStartsOn: 1});
    //
    //     const result = [];
    //
    //     for (const s of schedules) {
    //         const courseClass = await getClassById(s.course_class_id);
    //         // const timeSlot = await getTimeSlotById(s.time_slot_id);
    //         const room = await getRoomById(s.room_id);
    //         // const day = await getDayById(s.day_id);
    //
    //         const start = setMinutes(
    //             setHours(
    //                 addDays(monday, day.idx),
    //                 timeSlot.start_hour
    //             ), timeSlot.start_min
    //         );
    //
    //         const end = setMinutes(
    //             setHours(
    //                 addDays(monday, day.idx),
    //                 timeSlot.end_hour
    //             ), timeSlot.end_min
    //         );
    //
    //         result.push({
    //             id: s.id,
    //             title: courseClass?.Subject?.name,
    //             start,
    //             end,
    //             teacher: courseClass?.Teacher?.name,
    //             room: `${room.name} - ${room.building}`,
    //             type: courseClass?.type ?? 'lecture',
    //             subject: courseClass?.Subject?.code,
    //         });
    //     }
    //
    //     return result;
    // };

    const convertSchedulesToUI = async () => {
        const schedules = await getAllSchedules();
        const monday = startOfWeek(new Date(), { weekStartsOn: 1 }); // Thứ 2 tuần này

        const result = [];

        for (const s of schedules) {
            // Use preloaded courseClasses and rooms cache to avoid many API calls
            const courseClass = (courseClasses || []).find(cc => String(cc.id) === String(s.course_class_id)) || null;
            const room = (rooms || []).find(r => String(r.id) === String(s.room_id)) || null;

            // DAY: day_id = số thứ tự trong tuần (1 = Thứ 2)
            const eventDate = addDays(monday, s.day_id - 1);

            // TIME SLOT: mỗi slot 45 phút bắt đầu từ 7:00
            const startMinutesOffset = (s.time_slot_id - 1) * 45;
            const start = addMinutes(setHours(setMinutes(eventDate, 0), 7), startMinutesOffset);

            // Kéo dài theo num_of_period
            const end = addMinutes(start, s.num_of_period * 45);

            // Prefer showing the actual class (student group) name when available.
            // `courseClass` may belong to a `Class` (via class_id). Use the
            // preloaded `_classes` cache to find that name and fall back to
            // courseClass or subject if missing.
            const classObj = ( _classes || [] ).find(cl => String(cl.id) === String(courseClass?.class_id)) || null;

            result.push({
                id: s.id,
                title: classObj?.name || courseClass?.name || courseClass?.Subject?.name || '',
                start,
                end,
                teacher: courseClass?.Teacher?.name || '',
                room: `${room?.name || ''} - ${room?.building_id || ''}`,
                type: courseClass?.type ?? 'lecture',
                subject: courseClass?.Subject?.code || '',
                day_id: s.day_id,
            });
        }

        return result;
    };

    const selectedClassObj = (_classes || []).find(c => String(c.id) === String(selectedClassId));
    const displayLabel = selectedClassObj ? (selectedClassObj.name || selectedClassObj.code || selectedClassObj.id) : query;

    return (
        <div className="space-y-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <div className="relative flex-1">
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => {
                                setQuery(e.target.value);
                                setShowSuggestions(true);
                                setSelectedClassId('');
                            }}
                            onFocus={() => setShowSuggestions(true)}
                            onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    handleSearch();
                                }
                            }}
                            placeholder="Tìm lớp theo tên"
                            className="input input-bordered w-full"
                        />
                        {showSuggestions && query && Array.isArray(_classes) && _classes.filter(c => {
                            const q = query.trim().toLowerCase();
                            return (c.name || '').toLowerCase().includes(q) || (c.code || '').toLowerCase().includes(q) || String(c.id).toLowerCase().includes(q);
                        }).slice(0, 8).map(c => c).length > 0 && (
                            <ul className="absolute z-50 left-0 right-0 bg-white dark:bg-gray-800 border rounded mt-1 max-h-56 overflow-auto shadow">
                                {Array.isArray(_classes) && _classes.filter(c => {
                                    const q = query.trim().toLowerCase();
                                    return (c.name || '').toLowerCase().includes(q) || (c.code || '').toLowerCase().includes(q) || String(c.id).toLowerCase().includes(q);
                                }).slice(0, 8).map(c => (
                                    <li key={c.id}
                                        className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                                        onMouseDown={() => {
                                            handleSelectClass(c);
                                        }}>
                                        <div className="font-medium">{c.name || `#${c.id}`}</div>
                                        <div className="text-sm text-gray-500 dark:text-gray-400">{c.code || ''}</div>
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
                selectedClassId ? (
                    // A class was selected (by click or matched from query) -> always render timetable even if events is empty
                    mode === 'week' ? (
                        <ModernTimeTable
                            events={events}
                            viewMode={mode || "week"}
                            onEventClick={handleEventClick}
                            semesters={semesters}
                            selectedSemester={selectedSemester}
                            onSelectSemester={setSelectedSemester}
                            externalTimeSlots={timeSlots}
                            externalLoadingTimeSlots={loadingTimeSlots}
                        />
                    ) : mode === 'semester' ? (
                        <SemesterSchedule
                            events={events}
                            semesters={semesters}
                            selectedSemester={selectedSemester}
                            onSelectSemester={setSelectedSemester}
                        />
                    ) : null
                ) : (
                    events.length === 0 ? (
                        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
                            <p className="text-sm text-gray-600 dark:text-gray-300">Không tìm thấy lịch cho
                                "{displayLabel}".</p>
                        </div>
                    ) : (
                        mode === 'week' ? (
                            <ModernTimeTable
                                events={events}
                                viewMode={mode || "week"}
                                onEventClick={handleEventClick}
                                semesters={semesters}
                                selectedSemester={selectedSemester}
                                onSelectSemester={setSelectedSemester}
                                externalTimeSlots={timeSlots}
                                externalLoadingTimeSlots={loadingTimeSlots}
                            />
                        ) : mode === 'semester' ? (
                            <SemesterSchedule
                                events={events}
                                semesters={semesters}
                                selectedSemester={selectedSemester}
                                onSelectSemester={setSelectedSemester}
                            />
                        ) : null
                    )
                )
            ) : null}
            <ClassScheduleDetailModal
                open={modal.open}
                onClose={() => setModal({open: false, detail: null})}
                detail={modal.detail}
            />
        </div>
    );
}
