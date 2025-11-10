import React from "react";
import {startOfWeek, addDays, setHours, setMinutes, format, addMinutes} from 'date-fns';
import {vi as viLocale} from 'date-fns/locale';
import ModernTimeTable from "./ModernTimeTable";
import ScheduleDetailModal from "./ScheduleDetailModal";
import SemesterSchedule from "./SemesterSchedule";
import {getAllSemesters} from '../../services/semesterService';
import {getAllClasses, getClassById} from '../../services/classService';
import {getRoomById} from "../../services/roomService.js";
import {getAllSchedules} from "../../services/scheduleService.js";

export default function StudentSchedule() {
    const [events, setEvents] = React.useState([]);
    const [_filter, setFilter] = React.useState({});
    const [_classes, setClasses] = React.useState([]);
    const [modal, setModal] = React.useState({open: false, detail: null});
    const [selectedClassId, setSelectedClassId] = React.useState("");
    const [query, setQuery] = React.useState("");
    const [showSuggestions, setShowSuggestions] = React.useState(false);
    const [mode, setMode] = React.useState("week");
    const [semesters, setSemesters] = React.useState([]);
    const [selectedSemester, setSelectedSemester] = React.useState(null);
    const [hasSearched, setHasSearched] = React.useState(false);

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
        return () => {
            mounted = false;
        };
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
                if (data && data.length > 0) {
                    setSelectedSemester(data[0]);
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
        // Build sample events now that the user requested a search.
        const sampleEvents =await convertSchedulesToUI();
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
        const qName = (cls?.name || '').toLowerCase();
        const qCode = (cls?.code || cls?.code_name || '').toLowerCase();

        // const filtered = sampleEvents.filter(e => (
        //     (qCode && e.subject && e.subject.toLowerCase().includes(qCode)) ||
        //     (qName && e.title && e.title.toLowerCase().includes(qName))
        // ));

        setEvents(sampleEvents);
        setHasSearched(true);
        setFilter({selectedClassId: cls.id, mode});
    };

    const handleSelectClass = async  (c) => {
        const id = c?.id;
        setQuery((c.name || c.id) + (c.code ? ` (${c.code})` : ''));
        setSelectedClassId(id);
        setShowSuggestions(false);

        // build events even if empty, then show timetable
        const sampleEvents = await convertSchedulesToUI();
        console.log('sampleEvents', sampleEvents);
        const qName = (c?.name || '').toLowerCase();
        const qCode = (c?.code || c?.code_name || '').toLowerCase();
        // const filtered = sampleEvents.filter(e => (
        //     (qCode && e.subject && e.subject.toLowerCase().includes(qCode)) ||
        //     (qName && e.title && e.title.toLowerCase().includes(qName))
        // ));
        setEvents(sampleEvents);
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
            const courseClass = await getClassById(s.course_class_id);
            const room = await getRoomById(s.room_id);
            console.log('schedule item', s, 'class', courseClass, 'room', room);
            // DAY: day_id = số thứ tự trong tuần (1 = Thứ 2)
            const eventDate = addDays(monday, s.day_id - 1);

            // TIME SLOT: mỗi slot 45 phút bắt đầu từ 7:00
            const startMinutesOffset = (s.time_slot_id - 1) * 45;
            const start = addMinutes(setHours(setMinutes(eventDate, 0), 7), startMinutesOffset);

            // Kéo dài theo num_of_period
            const end = addMinutes(start, s.num_of_period * 45);

            result.push({
                id: s.id,
                title: courseClass?.name,
                start,
                end,
                teacher: courseClass?.Teacher?.name,
                room: `${room.name} - ${room.building_id}`,
                type: courseClass?.type ?? 'lecture',
                subject: courseClass?.Subject?.code,
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
            <ScheduleDetailModal
                open={modal.open}
                onClose={() => setModal({open: false, detail: null})}
                detail={modal.detail}
            />
        </div>
    );
}
