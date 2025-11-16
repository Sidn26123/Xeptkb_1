import React, {useEffect, useMemo, useState} from "react";
import useSchedulerStore, {
    setCourses, setRooms, setSchedules, setSelectedSemester, setTeachers, updateSemesterConfig, useConstraints,
    useCourses,
    useRooms, useSchedulingActions,
    useSelectedCourses, useSelectedRooms, useSelectedSemester,
    useSelectedTeachers, useSemesterConfig, useSemesters,
    useTeachers
} from "../../stores/ScheduleDataStore.js";
import {BookOpen, CheckCircle2, CheckSquare, Home, RefreshCw, Square, Users} from "lucide-react";
import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell, Legend, Line,
    LineChart,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis
} from "recharts";
import {getAllCourseClasses} from "../../services/courseClassService.js";
import {getAllTeachers} from "../../services/teacherService.js";
import {getAllRooms} from "../../services/roomService.js";
import {callGenerateSchedule} from "../../services/scheduleService.js";
import ConstraintSelector from "../constrant/ConstraintSelector.jsx";
import {getAll} from "../../services/constraintService.js";

/**
 * Chuyển đổi chuỗi "2-1, 3-7" thành mảng [[2, 1], [3, 7]]
 */
const parseBusySlots = (slotsString) => {
    if (!slotsString) return [];
    try {
        return slotsString
            .split(",")
            .map((part) => part.trim())
            .filter((part) => part.includes("-"))
            .map((part) => {
                const [day, slot] = part.split("-");
                return [parseInt(day.trim()), parseInt(slot.trim())];
            })
            .filter((arr) => !isNaN(arr[0]) && !isNaN(arr[1]));
    } catch (error) {
        console.error("Lỗi parse busy slots:", error);
        return [];
    }
};

/**
 * Hàm chính để format dữ liệu cho API
 */
const formatDataForApi = (state, data) => {
    const {
        selectedRoomIds,
        selectedTeacherIds,
        selectedCourseIds,
        courseParams,
        teacherBusySlots,
        semesterConfig,
    } = state;

    const {allRooms, allTeachers, allCourses} = data;

    // 1. Format Rooms
    const rooms = allRooms
        .filter((room) => selectedRoomIds.has(room.id))
        .map((room) => ({
            id: room.id,
            name: room.name,
            capacity: room.capacity_max, // Sử dụng capacity_max
        }));

    // 2. Format Teachers
    const teachers = allTeachers
        .filter((teacher) => selectedTeacherIds.has(teacher.id))
        .map((teacher) => ({
            id: teacher.id,
            name: teacher.name,
            busy_slots: parseBusySlots(teacherBusySlots[teacher.id]),
        }));

    // 3. Format Courses
    const courses = allCourses
        .filter((course) => selectedCourseIds.has(course.id))
        .map((course) => {
            const params = courseParams[course.id] || {};
            return {
                id: course.id, // ID của chính lớp học phần
                course_id: course.subject_id, // ID của môn học (subject)
                teacher_id: course.teacher_id,
                class_id: course.class_id,
                student_count: parseInt(course.slot || 0),
                weeks_needed: parseInt(course.weeks_needed || 10),
                sessions_per_week: parseInt(course.session_per_week || 0),
                duration_per_session: parseInt(course.duration_per_session || 0),
            };
        });

    // 4. Format Config (thêm start_date)
    const finalSemesterConfig = {
        start_date: semesterConfig.start_date,
        start_week: parseInt(semesterConfig.start_week),
        end_week: parseInt(semesterConfig.end_week),
        max_concurrent_courses: parseInt(semesterConfig.max_concurrent_courses),
    };

    return {
        rooms,
        teachers,
        courses,
        semester_config: finalSemesterConfig,
    };
};
export const convertConstraintsToAPI = (selectedConstraints) => {
    return selectedConstraints.map(constraint => ({
        name: constraint.code,
        weight: constraint.weight
    }));
};
const testData = {
    "courses": [
        {
            "id": 1,
            "course_id": 101,
            "class_id": 1,
            "teacher_id": 1,
            "student_count": 50,
            "weeks_needed": 3,
            "sessions_per_week": 1,
            "duration_per_session": 4,
            "type": "theory",
            "required_equipment_ids": [1, 3],
            "dependency_id": 21
        },
        {
            "id": 21,
            "course_id": 101,
            "class_id": 1,
            "teacher_id": 1,
            "student_count": 25,
            "weeks_needed": 4,
            "sessions_per_week": 1,
            "duration_per_session": 2,
            "type": "lab",
            "required_equipment_ids": [2, 3, 5],
            "dependency_id": 1
        },
        {
            "id": 2,
            "course_id": 102,
            "class_id": 2,
            "teacher_id": 3,
            "student_count": 40,
            "weeks_needed": 5,
            "sessions_per_week": 1,
            "duration_per_session": 4,
            "type": "theory",
            "required_equipment_ids": [1, 2],
            "dependency_id": null
        },
        {
            "id": 3,
            "course_id": 103,
            "class_id": 2,
            "teacher_id": 2,
            "student_count": 60,
            "weeks_needed": 5,
            "sessions_per_week": 3,
            "duration_per_session": 2,
            "type": "theory",
            "required_equipment_ids": [1, 3],
            "dependency_id": null
        },
        {
            "id": 4,
            "course_id": 104,
            "class_id": 2,
            "teacher_id": 3,
            "student_count": 45,
            "weeks_needed": 4,
            "sessions_per_week": 2,
            "duration_per_session": 2,
            "type": "theory",
            "required_equipment_ids": [1, 3, 4],
            "dependency_id": null
        },
        {
            "id": 5,
            "course_id": 105,
            "class_id": 3,
            "teacher_id": 3,
            "student_count": 35,
            "weeks_needed": 3,
            "sessions_per_week": 2,
            "duration_per_session": 2,
            "type": "theory",
            "required_equipment_ids": [1, 3],
            "dependency_id": null
        },
        {
            "id": 6,
            "course_id": 106,
            "class_id": 3,
            "teacher_id": 4,
            "student_count": 35,
            "weeks_needed": 4,
            "sessions_per_week": 2,
            "duration_per_session": 2,
            "type": "theory",
            "required_equipment_ids": [1, 3],
            "dependency_id": null
        }
    ],
    "teachers": [
        {
            "id": 1,
            "name": "Teacher A",
            "busy_slots": [[2, 1], [2, 2], [2, 3], [2, 4]],
            "should_avoid_slots": [],
            "want_slots": [],
            "days_off": [6]
        },
        {
            "id": 2,
            "name": "Teacher B",
            "busy_slots": [[3, 7], [3, 8]],
            "should_avoid_slots": [],
            "want_slots": [],
            "days_off": []
        },
        {
            "id": 3,
            "name": "Teacher C",
            "busy_slots": [],
            "should_avoid_slots": [],
            "want_slots": [],
            "days_off": []
        },
        {
            "id": 4,
            "name": "Teacher D",
            "busy_slots": [[6, 1], [6, 2]],
            "should_avoid_slots": [],
            "want_slots": [],
            "days_off": []
        }
    ],
    "rooms": [
        {
            "id": 1,
            "name": "Room 101",
            "capacity": 60,
            "equipment_ids": [1, 2, 3, 4],
            "building_id": 1,
            "campus_id": 1
        },
        {
            "id": 2,
            "name": "Room 102",
            "capacity": 50,
            "equipment_ids": [1, 3],
            "building_id": 1,
            "campus_id": 1
        },
        {
            "id": 3,
            "name": "Room 103",
            "capacity": 40,
            "equipment_ids": [3],
            "building_id": 1,
            "campus_id": 1
        },
        {
            "id": 4,
            "name": "Lab 1",
            "capacity": 35,
            "equipment_ids": [2, 3, 5],
            "building_id": 1,
            "campus_id": 1
        },
        {
            "id": 5,
            "name": "Lab 2",
            "capacity": 35,
            "equipment_ids": [2, 3, 5],
            "building_id": 1,
            "campus_id": 1
        },
        {
            "id": 6,
            "name": "Room 201",
            "capacity": 70,
            "equipment_ids": [1, 2, 3, 4, 6],
            "building_id": 2,
            "campus_id": 1
        }
    ],
    "equipment": [
        {"id": 1, "name": "Projector"},
        {"id": 2, "name": "Computer"},
        {"id": 3, "name": "Whiteboard"},
        {"id": 4, "name": "Sound System"},
        {"id": 5, "name": "Lab Equipment"},
        {"id": 6, "name": "Smart Board"}
    ],
    "semester_config": {
        "start_week": 1,
        "end_week": 15,
        "max_concurrent_courses": 3,
        "blocked_slots": [[2, 1], [2, 2]],
        "prime_slots": [[2, 2], [2, 3], [2, 4], [2, 8]]
    },
    "constraints": [
        {
            "name": "HARD_CONFLICT_TEACHER",
            "weight": 1000000
        },
        {
            "name": "HARD_CONFLICT_ROOM",
            "weight": 1000000
        },
        {
            "name": "HARD_CONFLICT_CLASS",
            "weight": 1000000
        },
        {
            "name": "HARD_ROOM_CAPACITY",
            "weight": 1000000
        },
        {
            "name": "HARD_TEACHER_BUSY",
            "weight": 1000000
        },
        {
            "name": "HARD_OUT_OF_BOUNDS",
            "weight": 5000000
        },
        {
            "name": "HARD_ROOM_EQUIPMENT",
            "weight": 2000000
        },
        {
            "name": "HARD_THEORY_BEFORE_LAB",
            "weight": 1000000
        },
        {
            "name": "HARD_OUT_OF_DAILY_PERIODS",
            "weight": 1000000
        },
        {
            "name": "HARD_TEACHER_DAY_OFF",
            "weight": 1000000
        },
        {
            "name": "HARD_MEETING_BLOCK",
            "weight": 5000000
        },
        {
            "name": "HARD_INTER_CAMPUS_TRAVEL",
            "weight": 1000000
        },
        {
            "name": "SOFT_CONCURRENT_OVERLOAD",
            "weight": 1000
        },
        {
            "name": "SOFT_WEEKLY_IMBALANCE",
            "weight": 50
        },
        {
            "name": "SOFT_AVOID_LUNCH",
            "weight": 1000000
        },
        {
            "name": "SOFT_AVOID_EDGE",
            "weight": 25
        },
        {
            "name": "SOFT_STUDENT_GAPS",
            "weight": 75
        },
        {
            "name": "SOFT_TEACHER_GAPS",
            "weight": 50
        },
        {
            "name": "SOFT_STUDENT_DAYS",
            "weight": 100
        },
        {
            "name": "SOFT_LIMIT_CONTINUOUS",
            "weight": 50
        },
        {
            "name": "SOFT_PREFER_PRIME_SLOTS",
            "weight": 20
        },
        {
            "name": "SOFT_TEACHER_SUBJECT_CLUSTER",
            "weight": 70
        }
    ]
}

const ResourceManager = () => {
    const [activeTab, setActiveTab] = useState('courses');

    // Lấy dữ liệu từ store
    const courses = useCourses();
    const teachers = useTeachers();
    const rooms = useRooms();
    const selectedCourses = useSelectedCourses();
    const selectedTeachers = useSelectedTeachers();
    const selectedRooms = useSelectedRooms();
    const actions = useSchedulingActions();
    const [courseParams, setCourseParams] = useState({}); // { courseId: { student_count: 50, ... } }
    const [teacherBusySlots, setTeacherBusySlots] = useState({}); // { teacherId: "2-1, 2-2" }
    const semesterConfig = useSemesterConfig();
    const semesters = useSemesters();
    const selectedSemester = useSelectedSemester();
    const [startWeek, setStartWeek] = useState('');
    const [endWeek, setEndWeek] = useState('');
    const [errors, setErrors] = useState({ startWeek: '', endWeek: '' });
    const [constraints, setConstraints] = useState([]);
    const selectedConstraints = useConstraints();
    useEffect(() => {
        const fetchData = async () => {
            try {
                // Khởi tạo dữ liệu
                const [dataCourse, dataTeacher, dataRoom, constraints] = await Promise.all([
                    getAllCourseClasses(),
                    getAllTeachers(),
                    getAllRooms(),
                    getAll()
                ]);

                console.log("Loaded data:", {dataCourse, dataTeacher, dataRoom, constraints});

                setCourses(dataCourse);
                setTeachers(dataTeacher);
                setRooms(dataRoom);
                setConstraints(constraints);
            } catch (error) {
                console.error("Error loading data:", error);
            }
        };

        fetchData();
    }, []);

    const extractIdsFromObjects = (objArray) => {
        return objArray.map(obj => obj.id);
    }

    // Toggle selection
    const toggleSelection = (item, type) => {
        const currentSelections = {
            courses: selectedCourses,
            teachers: selectedTeachers,
            rooms: selectedRooms,
        };

        const toggleActions = {
            courses: {
                select: actions.selectCourse,
                unselect: actions.unselectCourse,
            },
            teachers: {
                select: actions.selectTeacher,
                unselect: actions.unselectTeacher,
            },
            rooms: {
                select: actions.selectRoom,
                unselect: actions.unselectRoom,
            },
        };

        const currentSelection = currentSelections[type];
        const typeActions = toggleActions[type];

        // Kiểm tra xem item đã được chọn chưa (so sánh theo id)
        const isSelected = currentSelection.some((selected) => selected.id === item.id);

        if (isSelected) {
            typeActions.unselect(item.id);
        } else {
            // actions.selectCourse(item);
            typeActions.select(item); // Truyền object thay vì id
        }
    };

    // Select all
    const selectAll = (type) => {
        const data = {
            courses: courses,
            teachers: teachers,
            rooms: rooms,
        };

        const selectActions = {
            courses: actions.selectCourse,
            teachers: actions.selectTeacher,
            rooms: actions.selectRoom,
        };

        const currentSelections = {
            courses: selectedCourses,
            teachers: selectedTeachers,
            rooms: selectedRooms,
        };

        // Chỉ thêm những item chưa được chọn
        data[type].forEach((item) => {
            const isSelected = currentSelections[type].some(
                (selected) => selected.id === item.id
            );
            if (!isSelected) {
                selectActions[type](item); // Truyền object thay vì id
            }
        });
    };

    // Reset selection
    const resetSelection = (type) => {
        const clearActions = {
            courses: actions.clearSelectedCourses,
            teachers: actions.clearSelectedTeachers,
            rooms: actions.clearSelectedRooms,
        };
        clearActions[type]();
    };


    // Statistics calculations
    const courseStats = useMemo(() => {
        const selected = courses.filter(c =>
            selectedCourses.some(sc => sc.id === c.id)
        );

        const totalStudents = selected.reduce((sum, c) => sum + c.student_count, 0);
        const totalSessions = selected.reduce((sum, c) => sum + (c.weeks_needed * c.sessions_per_week), 0);
        const avgStudents = selected.length > 0 ? (totalStudents / selected.length).toFixed(1) : 0;
        const totalHours = selected.reduce((sum, c) => sum + (c.weeks_needed * c.sessions_per_week * c.duration_per_session), 0);

        return {
            total: courses.length,
            selected: selected.length,
            totalStudents,
            avgStudents,
            totalSessions,
            totalHours,
        };
    }, [courses, selectedCourses]);

    const teacherStats = useMemo(() => {
        const selected = teachers.filter(t =>
            selectedTeachers.some(st => st.id === t.id)
        );

        // const totalCoursesCovered = [...new Set(selected.flatMap(t => t.can_teach_courses))].length;
        // const avgCoursesPerTeacher = selected.length > 0 ? (selected.reduce((sum, t) => sum + t.can_teach_courses.length, 0) / selected.length).toFixed(1) : 0;

        return {
            total: teachers.length,
            selected: selected.length,
        };
    }, [teachers, selectedTeachers]);

    const roomStats = useMemo(() => {
        const selected = rooms.filter(r =>
            selectedRooms.some(sr => sr.id === r.id)
        );

        const totalCapacity = selected.reduce((sum, r) => sum + r.capacity, 0);
        const avgCapacity = selected.length > 0 ? (totalCapacity / selected.length).toFixed(1) : 0;
        const maxCapacity = selected.length > 0 ? Math.max(...selected.map(r => r.capacity)) : 0;
        const minCapacity = selected.length > 0 ? Math.min(...selected.map(r => r.capacity)) : 0;

        return {
            total: rooms.length,
            selected: selected.length,
            totalCapacity,
            avgCapacity,
            maxCapacity,
            minCapacity,
        };
    }, [rooms, selectedRooms]);

    // Chart data
    const courseChartData = useMemo(() => courses.map(c => ({
        name: `Course ${c.course_id}`,
        students: c.student_count,
        weeks: c.weeks_needed,
        sessions: c.sessions_per_week,
        selected: selectedCourses.includes(c.id),
    })), [courses, selectedCourses]);

    const roomCapacityData = useMemo(() => rooms.map(r => ({
        name: r.name,
        capacity: r.capacity,
        selected: selectedRooms.includes(r.id),
    })), [rooms, selectedRooms]);
    // //
    // const teacherCoverageData = useMemo(() => teachers.map(t => ({
    //     name: t.name,
    //     courses: t.can_teach_courses.length,
    //     selected: selectedTeachers.includes(t.id),
    // })), [teachers, selectedTeachers]);
    const teacherCoverageData = () => {

    }
    const selectionDistribution = useMemo(() => [
        {
            name: 'Đã chọn',
            value: activeTab === 'courses' ? courseStats.selected : activeTab === 'teachers' ? teacherStats.selected : roomStats.selected
        },
        {
            name: 'Chưa chọn',
            value: activeTab === 'courses' ? (courseStats.total - courseStats.selected) : activeTab === 'teachers' ? (teacherStats.total - teacherStats.selected) : (roomStats.total - roomStats.selected)
        },
    ], [activeTab, courseStats, teacherStats, roomStats]);

    const COLORS = ['#10b981', '#6b7280'];

    const renderCourseList = () => (
        <div className="space-y-2">
            {courses.map(course => (
                <div
                    key={course.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-all ${
                        selectedCourses.includes(course)
                            ? 'border-emerald-500 bg-emerald-50'
                            : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => toggleSelection(course, 'courses')}
                >
                    <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3 flex-1">
                            {selectedCourses.includes(course) ? (
                                <CheckSquare className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0"/>
                            ) : (
                                <Square className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0"/>
                            )}
                            <div className="flex-1">
                                <h3 className="font-semibold text-gray-900">{course.name}</h3>
                                <div className="mt-2 grid grid-cols-2 gap-2 text-sm text-gray-600">
                                    <div className="flex items-center">
                                        <span className="font-medium">Môn học:</span>
                                        <span className="ml-1">ID {course.subject_id}</span>
                                    </div>
                                    <div>
                                        <span className="font-medium">Lớp:</span>
                                        <span className="ml-1">ID {course.class_id}</span>
                                    </div>
                                    <div>
                                        <span className="font-medium">Học kỳ:</span>
                                        <span className="ml-1">ID {course.semester_id}</span>
                                    </div>
                                    <div>
                                        <span className="font-medium">Giảng viên:</span>
                                        <span className="ml-1">{course.teacher_id}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );

    const renderTeacherList = () => (
        <div className="space-y-2">
            {teachers.map(teacher => (
                <div
                    key={teacher.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-all ${
                        selectedTeachers.includes(teacher)
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => toggleSelection(teacher, 'teachers')}
                >
                    <div className="flex items-start space-x-3">
                        {selectedTeachers.includes(teacher) ? (
                            <CheckSquare className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0"/>
                        ) : (
                            <Square className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0"/>
                        )}
                        <div className="flex-1">
                            <h3 className="font-semibold text-gray-900">{teacher.name}</h3>
                            <div className="mt-2 text-sm text-gray-600">
                                <div className="flex items-center">
                                    <span className="font-medium">Mã GV:</span>
                                    <span className="ml-1">{teacher.teacher_identifier}</span>
                                </div>
                                <div className="flex items-center mt-1">
                                    <span className="font-medium">Khoa:</span>
                                    <span className="ml-1">ID {teacher.faculty_id}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );

    const renderRoomList = () => (
        <div className="space-y-2">
            {rooms.map(room => (
                <div
                    key={room.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-all ${
                        selectedRooms.includes(room)
                            ? 'border-purple-500 bg-purple-50'
                            : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => toggleSelection(room, 'rooms')}
                >
                    <div className="flex items-start space-x-3">
                        {selectedRooms.includes(room) ? (
                            <CheckSquare className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0"/>
                        ) : (
                            <Square className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0"/>
                        )}
                        <div className="flex-1">
                            <h3 className="font-semibold text-gray-900">{room.name}</h3>
                            <div className="mt-2 space-y-1 text-sm text-gray-600">
                                <div className="flex items-center">
                                    <span className="font-medium">Mã phòng:</span>
                                    <span className="ml-1">{room.code}</span>
                                </div>
                                {room.type && (
                                    <div className="flex items-center">
                                        <span className="font-medium">Loại:</span>
                                        <span
                                            className="ml-1 px-2 py-0.5 bg-gray-100 rounded text-xs">{room.type}</span>
                                    </div>
                                )}
                                <div className="flex items-center">
                                    <Home className="w-4 h-4 mr-1"/>
                                    <span>Tối đa: <span
                                        className="font-medium">{room.capacity_max}</span> | Tối ưu: <span
                                        className="font-medium">{room.capacity_optimal}</span></span>
                                </div>
                                {room.floor_number > 0 && (
                                    <div className="text-xs text-gray-500">
                                        Tầng {room.floor_number}
                                    </div>
                                )}
                                {room.status && (
                                    <div className="text-xs">
                                    <span className={`px-2 py-0.5 rounded ${
                                        room.status === 'active'
                                            ? 'bg-green-100 text-green-700'
                                            : 'bg-gray-100 text-gray-700'
                                    }`}>
                                        {room.status}
                                    </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );

    const renderStatistics = () => {
        const stats = activeTab === 'courses' ? courseStats : activeTab === 'teachers' ? teacherStats : roomStats;

        return (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Thống kê chi tiết</h2>

                {/* Summary Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg">
                        <div className="text-sm text-blue-600 font-medium">Tổng số</div>
                        <div className="text-2xl font-bold text-blue-900">{stats.total}</div>
                    </div>
                    <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-4 rounded-lg">
                        <div className="text-sm text-emerald-600 font-medium">Đã chọn</div>
                        <div className="text-2xl font-bold text-emerald-900">{stats.selected}</div>
                    </div>
                    {activeTab === 'courses' && (
                        <>
                            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg">
                                <div className="text-sm text-purple-600 font-medium">Tổng SV</div>
                                <div className="text-2xl font-bold text-purple-900">{courseStats.totalStudents}</div>
                            </div>
                            <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg">
                                <div className="text-sm text-orange-600 font-medium">Tổng giờ</div>
                                <div className="text-2xl font-bold text-orange-900">{courseStats.totalHours}</div>
                            </div>
                        </>
                    )}
                    {activeTab === 'teachers' && (
                        <></>
                        // <>
                        //     <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg">
                        //         <div className="text-sm text-purple-600 font-medium">Khóa phủ</div>
                        //         <div className="text-2xl font-bold text-purple-900">{teacherStats.totalCoursesCovered}</div>
                        //     </div>
                        //     <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg">
                        //         <div className="text-sm text-orange-600 font-medium">TB khóa/GV</div>
                        //         <div className="text-2xl font-bold text-orange-900">{teacherStats.avgCoursesPerTeacher}</div>
                        //     </div>
                        // </>
                    )}
                    {activeTab === 'rooms' && (
                        <>
                            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg">
                                <div className="text-sm text-purple-600 font-medium">Sức chứa</div>
                                <div className="text-2xl font-bold text-purple-900">{roomStats.totalCapacity}</div>
                            </div>
                            <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg">
                                <div className="text-sm text-orange-600 font-medium">TB/phòng</div>
                                <div className="text-2xl font-bold text-orange-900">{roomStats.avgCapacity}</div>
                            </div>
                        </>
                    )}
                </div>

                {/* Charts */}
                {/*<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">*/}
                {/*    /!* Distribution Pie Chart *!/*/}
                {/*    <div>*/}
                {/*        <h3 className="text-sm font-semibold text-gray-700 mb-3">Phân bố lựa chọn</h3>*/}
                {/*        <ResponsiveContainer width="100%" height={200}>*/}
                {/*            <PieChart>*/}
                {/*                <Pie*/}
                {/*                    data={selectionDistribution}*/}
                {/*                    cx="50%"*/}
                {/*                    cy="50%"*/}
                {/*                    labelLine={false}*/}
                {/*                    label={({name, value}) => `${name}: ${value}`}*/}
                {/*                    outerRadius={80}*/}
                {/*                    fill="#8884d8"*/}
                {/*                    dataKey="value"*/}
                {/*                >*/}
                {/*                    {selectionDistribution.map((entry, index) => (*/}
                {/*                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]}/>*/}
                {/*                    ))}*/}
                {/*                </Pie>*/}
                {/*                <Tooltip/>*/}
                {/*            </PieChart>*/}
                {/*        </ResponsiveContainer>*/}
                {/*    </div>*/}

                {/*    /!* Bar Chart based on tab *!/*/}
                {/*    <div>*/}
                {/*        <h3 className="text-sm font-semibold text-gray-700 mb-3">*/}
                {/*            {activeTab === 'courses' ? 'Số sinh viên theo khóa' :*/}
                {/*                activeTab === 'teachers' ? 'Số khóa giảng viên có thể dạy' :*/}
                {/*                    'Sức chứa phòng học'}*/}
                {/*        </h3>*/}
                {/*        <ResponsiveContainer width="100%" height={200}>*/}
                {/*            <BarChart data={activeTab === 'courses' ? courseChartData : roomCapacityData}>*/}
                {/*                <CartesianGrid strokeDasharray="3 3"/>*/}
                {/*                <XAxis dataKey="name" tick={{fontSize: 12}}/>*/}
                {/*                <YAxis/>*/}
                {/*                <Tooltip/>*/}
                {/*                <Bar*/}
                {/*                    dataKey={activeTab === 'courses' ? 'students' : activeTab === 'teachers' ? 'courses' : 'capacity'}*/}
                {/*                    fill="#3b82f6"*/}
                {/*                    radius={[8, 8, 0, 0]}*/}
                {/*                />*/}
                {/*            </BarChart>*/}
                {/*        </ResponsiveContainer>*/}
                {/*    </div>*/}
                {/*</div>*/}

                {/* Additional Course Statistics */}
                {/*{activeTab === 'courses' && (*/}
                {/*    <div className="mt-6">*/}
                {/*        <h3 className="text-sm font-semibold text-gray-700 mb-3">Phân tích chi tiết khóa học</h3>*/}
                {/*        <ResponsiveContainer width="100%" height={200}>*/}
                {/*            <LineChart data={courseChartData}>*/}
                {/*                <CartesianGrid strokeDasharray="3 3"/>*/}
                {/*                <XAxis dataKey="name" tick={{fontSize: 12}}/>*/}
                {/*                <YAxis/>*/}
                {/*                <Tooltip/>*/}
                {/*                <Legend/>*/}
                {/*                <Line type="monotone" dataKey="weeks" stroke="#8b5cf6" name="Số tuần"/>*/}
                {/*                <Line type="monotone" dataKey="sessions" stroke="#ec4899" name="Buổi/tuần"/>*/}
                {/*            </LineChart>*/}
                {/*        </ResponsiveContainer>*/}
                {/*    </div>*/}
                {/*)}*/}
            </div>
        );
    };

    const handleCourseParamChange = (courseId, field, value) => {
        setCourseParams((prev) => ({
            ...prev,
            [courseId]: {
                ...prev[courseId],
                [field]: value,
            },
        }));
    };

    const handleTeacherBusySlotChange = (teacherId, value) => {
        setTeacherBusySlots((prev) => ({
            ...prev,
            [teacherId]: value,
        }));
    };

    const handleConfigChange = (e) => {
        const {name, value} = e.target;
        setSemesterConfig((prev) => ({
            ...prev,
            [name]: value,
        }));
    };
    const calculateMaxWeeks = (startDate, endDate) => {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const diffTime = Math.abs(end - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return Math.ceil(diffDays / 7);
    };

    // Kiểm tra ngày có nằm trong khoảng học kỳ không
    const isDateInSemester = (weekNumber, semester) => {
        if (!semester || !weekNumber) return true;

        const maxWeeks = calculateMaxWeeks(semester.start, semester.end);
        return weekNumber >= 1 && weekNumber <= maxWeeks;
    };
    const handleSchedule = async () => {
        const selectedCourseIds = new Set(extractIdsFromObjects(selectedCourses));
        const selectedTeacherIds = new Set(extractIdsFromObjects(selectedTeachers));
        const selectedRoomIds = new Set(extractIdsFromObjects(selectedRooms));
        const formattedData = formatDataForApi(
            {
                selectedRoomIds,
                selectedTeacherIds,
                selectedCourseIds,
                courseParams,
                teacherBusySlots,
                semesterConfig,
            },
            {
                allRooms: rooms,
                allTeachers: teachers,
                allCourses: courses,
            }
        )
        console.log("Formatted data for schedule generation:", formattedData);
        testData.constraints = convertConstraintsToAPI(selectedConstraints);
        const res = await callGenerateSchedule(testData);
        setSchedules(res);
        console.log("Schedule generation response:", res);
    }
    const handleSemesterChange = (e) => {
        const semesterId = parseInt(e.target.value);
        const semester = semesters.find(s => s.id === semesterId);
        setSelectedSemester(semester);

        // Reset tuần và errors khi đổi học kỳ
        setStartWeek('');
        setEndWeek('');
        setErrors({ startWeek: '', endWeek: '' });

        // Gọi hàm xử lý tùy chỉnh của bạn ở đây
        onSemesterChange(semester);
    };
    const onSemesterChange = (semester) => {
        setSelectedSemester(semester);
    };

    // Format ngày hiển thị
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN');
    };
    // Validate tuần bắt đầu
    const validateStartWeek = (value) => {
        const week = parseInt(value);
        const newErrors = { ...errors };

        if (!selectedSemester) {
            newErrors.startWeek = 'Vui lòng chọn học kỳ trước';
            setErrors(newErrors);
            return false;
        }

        const maxWeeks = calculateMaxWeeks(selectedSemester.start, selectedSemester.end);

        if (!value) {
            newErrors.startWeek = 'Vui lòng nhập tuần bắt đầu';
        } else if (week < 1) {
            newErrors.startWeek = 'Tuần phải lớn hơn 0';
        } else if (week > maxWeeks) {
            newErrors.startWeek = `Tuần không được vượt quá ${maxWeeks} (tổng số tuần của học kỳ)`;
        } else if (endWeek && week > parseInt(endWeek)) {
            newErrors.startWeek = 'Tuần bắt đầu phải nhỏ hơn hoặc bằng tuần kết thúc';
        } else {
            newErrors.startWeek = '';
        }

        setErrors(newErrors);
        return !newErrors.startWeek;
    };

    // Validate tuần kết thúc
    const validateEndWeek = (value) => {
        const week = parseInt(value);
        const newErrors = { ...errors };

        if (!selectedSemester) {
            newErrors.endWeek = 'Vui lòng chọn học kỳ trước';
            setErrors(newErrors);
            return false;
        }

        const maxWeeks = calculateMaxWeeks(selectedSemester.start, selectedSemester.end);

        if (!value) {
            newErrors.endWeek = 'Vui lòng nhập tuần kết thúc';
        } else if (week < 1) {
            newErrors.endWeek = 'Tuần phải lớn hơn 0';
        } else if (week > maxWeeks) {
            newErrors.endWeek = `Tuần không được vượt quá ${maxWeeks} (tổng số tuần của học kỳ)`;
        } else if (startWeek && week < parseInt(startWeek)) {
            newErrors.endWeek = 'Tuần kết thúc phải lớn hơn hoặc bằng tuần bắt đầu';
        } else {
            newErrors.endWeek = '';
        }

        setErrors(newErrors);
        return !newErrors.endWeek;
    };

    // Xử lý thay đổi tuần bắt đầu
    const handleStartWeekChange = (e) => {
        const value = e.target.value;
        setStartWeek(value);
        validateStartWeek(value);

        // Re-validate tuần kết thúc nếu đã có giá trị
        if (endWeek) {
            validateEndWeek(endWeek);
        }
        updateSemesterConfig({start_week: parseInt(value) });


    };

    // Xử lý thay đổi tuần kết thúc
    const handleEndWeekChange = (e) => {
        const value = e.target.value;
        setEndWeek(value);
        validateEndWeek(value);

        // Re-validate tuần bắt đầu nếu đã có giá trị
        if (startWeek) {
            validateStartWeek(startWeek);
        }
        updateSemesterConfig({end_week: parseInt(value) });
    };

    return (
        <div className="min-h-screen bg-gray-50 text-gray-200 gray:text-gray-600">
            <div className="max-w-7xl mx-auto">
                <div className="container mx-auto p-6">
                    <div className="flex flex-row justify-between items-start gap-6">
                        {/* Cột trái: Chọn học kỳ */}
                        <div className="flex-1 max-w-[500px]">
                            <h2 className="text-2xl font-bold mb-4 text-gray-800">Chọn Học Kỳ</h2>

                            {/* Dropdown chọn học kỳ */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Học kỳ
                                </label>
                                <select
                                    value={selectedSemester?.id || ''}
                                    onChange={handleSemesterChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                                >
                                    <option value="">-- Chọn học kỳ --</option>
                                    {semesters.map((semester) => (
                                        <option key={semester.id} value={semester.id}>
                                            {semester.code} - {semester.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Hiển thị thông tin học kỳ đã chọn */}
                            {selectedSemester && (
                                <div className={`p-6 rounded-lg border-2 ${
                                    selectedSemester.status === 'finished'
                                        ? 'bg-red-50 border-red-300'
                                        : 'bg-blue-50 border-blue-300'
                                }`}>
                                    <h3 className="text-xl font-semibold mb-4 text-gray-800">
                                        Thông tin Học kỳ
                                    </h3>

                                    <div className="space-y-3">
                                        <div className="flex items-center">
                                            <span className="font-medium text-gray-700 w-32">Mã:</span>
                                            <span className="text-gray-900">{selectedSemester.code}</span>
                                        </div>

                                        <div className="flex items-center">
                                            <span className="font-medium text-gray-700 w-32">Tên:</span>
                                            <span className="text-gray-900">{selectedSemester.name}</span>
                                        </div>

                                        <div className="flex items-center">
                                            <span className="font-medium text-gray-700 w-32">Ngày bắt đầu:</span>
                                            <span className="text-gray-900">{formatDate(selectedSemester.start)}</span>
                                        </div>

                                        <div className="flex items-center">
                                            <span className="font-medium text-gray-700 w-32">Ngày kết thúc:</span>
                                            <span className="text-gray-900">{formatDate(selectedSemester.end)}</span>
                                        </div>

                                        <div className="flex items-center">
                                            <span className="font-medium text-gray-700 w-32">Tổng số tuần:</span>
                                            <span className="text-gray-900 font-semibold">
                    {calculateMaxWeeks(selectedSemester.start, selectedSemester.end)} tuần
                  </span>
                                        </div>

                                        <div className="flex items-center">
                                            <span className="font-medium text-gray-700 w-32">Trạng thái:</span>
                                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                                selectedSemester.status === 'finished'
                                                    ? 'bg-red-200 text-red-800'
                                                    : 'bg-green-200 text-green-800'
                                            }`}>
                    {selectedSemester.status === 'finished' ? 'Đã kết thúc' : 'Đang diễn ra'}
                  </span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Cột phải: Nhập tuần */}
                        <div className="flex-1 max-w-[500px]">
                            <h2 className="text-2xl font-bold mb-4 text-gray-800">Cấu hình Tuần</h2>

                            {/* Input tuần bắt đầu */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Tuần bắt đầu *
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    value={startWeek}
                                    onChange={handleStartWeekChange}
                                    disabled={!selectedSemester}
                                    placeholder="Nhập tuần bắt đầu"
                                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                ${errors.startWeek ? 'border-red-500' : 'border-gray-300'}
                ${!selectedSemester ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
                                />
                                {errors.startWeek && (
                                    <p className="mt-1 text-sm text-red-600">{errors.startWeek}</p>
                                )}
                                {selectedSemester && !errors.startWeek && (
                                    <p className="mt-1 text-xs text-gray-500">
                                        Tuần từ 1 đến {calculateMaxWeeks(selectedSemester.start, selectedSemester.end)}
                                    </p>
                                )}
                            </div>

                            {/* Input tuần kết thúc */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Tuần kết thúc *
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    value={endWeek}
                                    onChange={handleEndWeekChange}
                                    disabled={!selectedSemester}
                                    placeholder="Nhập tuần kết thúc"
                                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                ${errors.endWeek ? 'border-red-500' : 'border-gray-300'}
                ${!selectedSemester ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
                                />
                                {errors.endWeek && (
                                    <p className="mt-1 text-sm text-red-600">{errors.endWeek}</p>
                                )}
                                {selectedSemester && !errors.endWeek && (
                                    <p className="mt-1 text-xs text-gray-500">
                                        Tuần từ 1 đến {calculateMaxWeeks(selectedSemester.start, selectedSemester.end)}
                                    </p>
                                )}
                            </div>

                            {/* Hiển thị thông tin đã chọn */}
                            {selectedSemester && startWeek && endWeek && !errors.startWeek && !errors.endWeek && (
                                <div className="p-4 bg-green-50 border-2 border-green-300 rounded-lg">
                                    <h4 className="font-semibold text-green-800 mb-2">✓ Cấu hình hợp lệ</h4>
                                    <div className="text-sm text-gray-700 space-y-1">
                                        <p>Học kỳ: <span className="font-medium">{selectedSemester.code}</span></p>
                                        <p>Tuần: <span className="font-medium">{startWeek} - {endWeek}</span></p>
                                        <p>Tổng số tuần học: <span
                                            className="font-medium">{parseInt(endWeek) - parseInt(startWeek) + 1} tuần</span>
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Thông báo chưa chọn học kỳ */}
                            {!selectedSemester && (
                                <div className="p-4 bg-yellow-50 border-2 border-yellow-300 rounded-lg">
                                    <p className="text-sm text-yellow-800">
                                        ⚠️ Vui lòng chọn học kỳ trước khi nhập tuần
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex space-x-2 mb-6 border-b border-gray-200">
                    <button
                        onClick={() => setActiveTab('courses')}
                        className={`px-6 py-3 font-medium transition-all ${
                            activeTab === 'courses'
                                ? 'text-emerald-600 border-b-2 border-emerald-600'
                                : 'text-gray-600 hover:text-gray-900'
                        }`}
                    >
                        <BookOpen className="w-5 h-5 inline mr-2"/>
                        Khóa học
                    </button>
                    <button
                        onClick={() => setActiveTab('teachers')}
                        className={`px-6 py-3 font-medium transition-all ${
                            activeTab === 'teachers'
                                ? 'text-blue-600 border-b-2 border-blue-600'
                                : 'text-gray-600 hover:text-gray-900'
                        }`}
                    >
                        <Users className="w-5 h-5 inline mr-2"/>
                        Giảng viên
                    </button>
                    <button
                        onClick={() => setActiveTab('rooms')}
                        className={`px-6 py-3 font-medium transition-all ${
                            activeTab === 'rooms'
                                ? 'text-purple-600 border-b-2 border-purple-600'
                                : 'text-gray-600 hover:text-gray-900'
                        }`}
                    >
                        <Home className="w-5 h-5 inline mr-2"/>
                        Phòng học
                    </button>
                    <button
                        onClick={() => setActiveTab('constraints')}
                        className={`px-6 py-3 font-medium transition-all ${
                            activeTab === 'constraints'
                                ? 'text-purple-600 border-b-2 border-purple-600'
                                : 'text-gray-600 hover:text-gray-900'
                        }`}
                    >
                        <Home className="w-5 h-5 inline mr-2"/>
                        Ràng buộc
                    </button>
                    <button
                        onClick={() => handleSchedule('rooms')}
                        className = {"text-gray-600 hover:text-gray-900"}
                    >
                        <Home className="w-5 h-5 inline mr-2"/>
                        Xếp lịch
                    </button>
                </div>

                {/* Statistics Section */}
                <div className="mb-6">
                    {renderStatistics()}
                </div>

                {/* Resource List */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-bold text-gray-900">
                            Danh
                            sách {activeTab === 'courses' ? 'khóa học' : activeTab === 'teachers' ? 'giảng viên' : 'phòng học'}
                        </h2>
                        <div className="flex space-x-2">
                            <button
                                onClick={() => selectAll(activeTab)}
                                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center space-x-2"
                            >
                                <CheckCircle2 className="w-4 h-4"/>
                                <span>Chọn tất cả</span>
                            </button>
                            <button
                                onClick={() => resetSelection(activeTab)}
                                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center space-x-2"
                            >
                                <RefreshCw className="w-4 h-4"/>
                                <span>Đặt lại</span>
                            </button>
                        </div>
                    </div>

                    {activeTab === 'courses' && renderCourseList()}
                    {activeTab === 'teachers' && renderTeacherList()}
                    {activeTab === 'rooms' && renderRoomList()}
                    {activeTab === 'constraints' && (
                        <ConstraintSelector constraintsProps = {constraints}/>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ResourceManager;
