import React, {useEffect, useMemo, useState} from "react";
import useSchedulerStore, {
    setCourses, setRooms, setSchedules, setSelectedSemester, setTeachers, updateSemesterConfig, useSelectedConstraints,
    useCourses, useEquipments, useRoomEquipments,
    useRooms, useSchedulingActions,
    useSelectedCourses, useSelectedRooms, useSelectedSemester,
    useSelectedTeachers, useSemesterConfig, useSemesters, useSubjectRequiresEquipment, useSubjects,
    useTeachers, useConstraints, useCourseClasses, setConstraints
} from "../../stores/ScheduleDataStore.js";
import {BookOpen, CheckCircle2, CheckSquare, Home, RefreshCw, Square, Users, Clock, Maximize} from "lucide-react";
import {getAllCourseClasses} from "../../services/courseClassService.js";
import {getAllTeachers} from "../../services/teacherService.js";
import {getAllRooms, getAllRoomsWithEquipment} from "../../services/roomService.js";
import {callGenerateSchedule} from "../../services/scheduleService.js";
import ConstraintSelector from "../constrant/ConstraintSelector.jsx";
import {getAllConstraints} from "../../services/constraintService.js";
import {formatDataForApi, parseBusySlots, convertConstraintsToAPI} from "../../utils/resourceUtils.js";
import {BarChart2, PlayCircle} from "lucide-react"; // Thêm icon mới
import PreSchedulingDashboard from "./PreScheduleMetricDashboard.jsx"; // Import component mới
import {formatToTestData} from "../../utils/resourceUtils.js";
import ScheduleProgressModal from "./ScheduleProgressModal.jsx"; // Import hàm format
const testData = {
    "courses": [
        {
            "id": 1,
            "course_id": 101,
            "class_ids": [1],
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
            "class_ids": [1],
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
            "class_ids": [2],
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
            "class_ids": [2],
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
            "class_ids": [2],
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
            "class_ids": [3],
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
            "class_ids": [3],
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
    const subjects = useSubjects();
    const equipments = useEquipments();
    const roomEquipments = useRoomEquipments();
    const subjectRequiresEquipments = useSubjectRequiresEquipment();
    const selectedCourses = useSelectedCourses();
    const selectedTeachers = useSelectedTeachers();
    const selectedRooms = useSelectedRooms();
    const actions = useSchedulingActions();
    const constraints = useConstraints();
    const [courseParams, setCourseParams] = useState({}); // { courseId: { student_count: 50, ... } }
    const [teacherBusySlots, setTeacherBusySlots] = useState({}); // { teacherId: "2-1, 2-2" }
    const semesterConfig = useSemesterConfig();
    const semesters = useSemesters();
    const selectedSemester = useSelectedSemester();
    const [startWeek, setStartWeek] = useState('');
    const [endWeek, setEndWeek] = useState('');
    const [errors, setErrors] = useState({startWeek: '', endWeek: ''});
    const selectedConstraints = useSelectedConstraints();
    const [showDashboard, setShowDashboard] = useState(false); // State hiển thị popup
    const [dashboardData, setDashboardData] = useState(null);  // Data cho popup

    // --- STATE CHO STREAMING ---
    const [isScheduling, setIsScheduling] = useState(false); // Để bật Modal
    const [scheduleProgress, setScheduleProgress] = useState(0);
    const [currentPhase, setCurrentPhase] = useState('phase1'); // phase1, phase2, phase3
    const [fitnessValue, setFitnessValue] = useState(null);
    const [streamLogs, setStreamLogs] = useState([]);
    const [isStreamComplete, setIsStreamComplete] = useState(false);
    const [schedulingResult, setSchedulingResult] = useState(null); // Lưu kết quả cuối cùng


    // useEffect(() => {
    //     const fetchData = async () => {
    //         try {
    //             // Khởi tạo dữ liệu
    //             const [dataCourse, dataTeacher, dataRoom, constraints] = await Promise.all([
    //                 getAllCourseClasses(),
    //             ]);
    //
    //             console.log("Loaded data:", {dataCourse, dataTeacher, dataRoom, constraints});
    //
    //             setCourses(dataCourse);
    //         } catch (error) {
    //             console.error("Error loading data:", error);
    //         }
    //     };
    //
    //     fetchData();
    // }, []);

    useEffect(() => {
        console.log("Constraist Classes updated:", constraints);
        // setConstraints(courseClasses);
    }, []);

    // Hàm chuẩn bị dữ liệu và mở Dashboardc
    const handlePreCheck = () => {
        // Validate cơ bản trước
        if (!semesterConfig.start_week || !semesterConfig.end_week) {
            alert("Vui lòng cấu hình tuần học trước!");
            return;
        }

        const formattedData = formatToTestData(
            selectedCourses,
            selectedRooms,
            selectedTeachers, // Vẫn truyền teacher để check availability
            semesterConfig,
            constraints
        );

        setDashboardData(formattedData);
        setShowDashboard(true);
    };

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
        const safeCourses = courses || [];
        const selected = safeCourses.filter(c =>
            selectedCourses.some(sc => sc.id === c.id)
        );
        console.log(selected);
        const totalStudents = selected.reduce((sum, c) => sum + (c.total_enrollment || 0), 0);
        const totalHours = selected.reduce((sum, c) => sum + ((c.weeks_needed || 0) * (c.sessions_per_week || 0) * (c.duration_per_session || 0)), 0);

        return {
            total: safeCourses.length,
            selected: selected.length,
            totalStudents,
            totalHours,
            selectionRate: safeCourses.length > 0 ? ((selected.length / safeCourses.length) * 100).toFixed(1) : 0
        };
    }, [courses, selectedCourses]);

    const teacherStats = useMemo(() => {
        const selected = teachers.filter(t =>
            selectedTeachers.some(st => st.id === t.id)
        );

        return {
            total: teachers.length,
            selected: selected.length,
        };
    }, [teachers, selectedTeachers]);

    // const roomStats = useMemo(() => {
    //     const selected = rooms.filter(r =>
    //         selectedRooms.some(sr => sr.id === r.id)
    //     );
    //
    //     const totalCapacity = selected.reduce((sum, r) => sum + r.capacity, 0);
    //     const avgCapacity = selected.length > 0 ? (totalCapacity / selected.length).toFixed(1) : 0;
    //     const maxCapacity = selected.length > 0 ? Math.max(...selected.map(r => r.capacity)) : 0;
    //     const minCapacity = selected.length > 0 ? Math.min(...selected.map(r => r.capacity)) : 0;
    //
    //     return {
    //         total: rooms.length,
    //         selected: selected.length,
    //         totalCapacity,
    //         avgCapacity,
    //         maxCapacity,
    //         minCapacity,
    //     };
    // }, [rooms, selectedRooms]);
    const roomStats = useMemo(() => {
        const safeRooms = rooms || [];
        const selected = safeRooms.filter(r =>
            selectedRooms.some(sr => sr.id === r.id)
        );
        console.log("Selected rooms for stats:", selected);

        const totalCapacity = selected.reduce((sum, r) => sum + (r.capacity_max || 0), 0);
        const optimalCapacity = selected.reduce((sum, r) => sum + (r.capacity_optimal || 0), 0);
        const avgCapacity = selected.length > 0 ? (totalCapacity / selected.length).toFixed(1) : 0;

        return {
            total: safeRooms.length,
            selected: selected.length,
            totalCapacity: totalCapacity,
            optimalCapacity: optimalCapacity,
            avgCapacity: avgCapacity,
            selectionRate: safeRooms.length > 0 ? ((selected.length / safeRooms.length) * 100).toFixed(1) : 0
        };
    }, [rooms, selectedRooms]);

    const constraintStats = useMemo(() => {
        const safeConstraints = constraints || [];
        const safeSelected = selectedConstraints || [];

        // Đếm số lượng cứng/mềm đã chọn
        const hardSelected = safeSelected.filter(c => c.type === 'H').length;
        const softSelected = safeSelected.filter(c => c.type === 'S').length;

        return {
            total: safeConstraints.length,
            selected: safeSelected.length,
            hardSelected,
            softSelected,
            selectionRate: safeConstraints.length > 0 ? ((safeSelected.length / safeConstraints.length) * 100).toFixed(1) : 0
        };
    }, [constraints, selectedConstraints]);
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
            {courses.map(course => {
                const isSelected = selectedCourses.some(s => s.id === course.id);
                return (
                    <div
                        key={course.id}
                        className={`p-4 border rounded-lg cursor-pointer transition-all ${
                            isSelected
                                ? 'border-emerald-500 bg-emerald-50'
                                : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => toggleSelection(course, 'courses')}
                    >
                        <div className="flex items-start justify-between">
                            <div className="flex items-start space-x-3 flex-1">
                                {isSelected ? (
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
                )

            })}
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
            {rooms.map(room => {
                const isSelected = selectedRooms.some(s => s.id === room.id);
                return (
                    <div
                        key={room.id}
                        className={`p-4 border rounded-lg cursor-pointer transition-all ${
                            isSelected
                                ? 'border-purple-500 bg-purple-50'
                                : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => toggleSelection(room, 'rooms')}
                    >
                        <div className="flex items-start space-x-3">
                            {isSelected ? (
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
                    </div>)
            })}
        </div>
    );

    // const renderStatistics = () => {
    //     const stats = activeTab === 'courses' ? courseStats : activeTab === 'teachers' ? teacherStats : roomStats;
    //
    //     return (
    //         <div className="bg-white rounded-lg border border-gray-200 p-6">
    //             <h2 className="text-lg font-bold text-gray-900 mb-4">Thống kê chi tiết</h2>
    //
    //             {/* Summary Cards */}
    //             <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
    //                 <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg">
    //                     <div className="text-sm text-blue-600 font-medium">Tổng số</div>
    //                     <div className="text-2xl font-bold text-blue-900">{stats.total}</div>
    //                 </div>
    //                 <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-4 rounded-lg">
    //                     <div className="text-sm text-emerald-600 font-medium">Đã chọn</div>
    //                     <div className="text-2xl font-bold text-emerald-900">{stats.selected}</div>
    //                 </div>
    //                 {activeTab === 'courses' && (
    //                     <>
    //                         <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg">
    //                             <div className="text-sm text-purple-600 font-medium">Tổng SV</div>
    //                             <div className="text-2xl font-bold text-purple-900">{courseStats.totalStudents}</div>
    //                         </div>
    //                         <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg">
    //                             <div className="text-sm text-orange-600 font-medium">Tổng giờ</div>
    //                             <div className="text-2xl font-bold text-orange-900">{courseStats.totalHours}</div>
    //                         </div>
    //                     </>
    //                 )}
    //                 {activeTab === 'teachers' && (
    //                     <></>
    //                     // <>
    //                     //     <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg">
    //                     //         <div className="text-sm text-purple-600 font-medium">Khóa phủ</div>
    //                     //         <div className="text-2xl font-bold text-purple-900">{teacherStats.totalCoursesCovered}</div>
    //                     //     </div>
    //                     //     <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg">
    //                     //         <div className="text-sm text-orange-600 font-medium">TB khóa/GV</div>
    //                     //         <div className="text-2xl font-bold text-orange-900">{teacherStats.avgCoursesPerTeacher}</div>
    //                     //     </div>
    //                     // </>
    //                 )}
    //                 {activeTab === 'rooms' && (
    //                     <>
    //                         <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg">
    //                             <div className="text-sm text-purple-600 font-medium">Sức chứa</div>
    //                             <div className="text-2xl font-bold text-purple-900">{roomStats.totalCapacity}</div>
    //                         </div>
    //                         <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg">
    //                             <div className="text-sm text-orange-600 font-medium">TB/phòng</div>
    //                             <div className="text-2xl font-bold text-orange-900">{roomStats.avgCapacity}</div>
    //                         </div>
    //                     </>
    //                 )}
    //             </div>
    //
    //         </div>
    //     );
    // };

    const renderStatistics = () => {
        // Xác định stats dựa trên activeTab
        let stats;
        let tabTitle;

        switch (activeTab) {
            case 'courses':
                stats = courseStats;
                tabTitle = 'Khóa học';
                break;
            case 'teachers':
                stats = teacherStats;
                tabTitle = 'Giảng viên';
                break;
            case 'rooms':
                stats = roomStats;
                tabTitle = 'Phòng học';
                break;
            case 'constraints':
                stats = constraintStats;
                tabTitle = 'Ràng buộc';
                break;
            default:
                stats = courseStats;
                tabTitle = 'Mục';
        }

        // Helper component
        const StatCard = ({ title, value, subValue, colorClass, icon: Icon }) => (
            <div className={`p-4 rounded-lg border ${colorClass} transition-all duration-200 hover:shadow-md`}>
                <div className="flex items-center justify-between mb-2">
                    <div className="text-sm font-medium opacity-80">{title}</div>
                    {Icon && <Icon className="w-5 h-5 opacity-60" />}
                </div>
                <div className="text-2xl font-bold">{value}</div>
                {subValue && <div className="text-xs mt-1 opacity-70">{subValue}</div>}
            </div>
        );

        return (
            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        <BarChart2 className="w-5 h-5 text-indigo-600" />
                        Thống kê {tabTitle}
                    </h2>

                    <div className="flex items-center gap-3 text-sm text-gray-600">
                        <span>Đã chọn: <span className="font-bold text-indigo-700">{stats.selectionRate}%</span></span>
                        <div className="w-32 h-2.5 bg-gray-200 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-indigo-600 transition-all duration-500"
                                style={{ width: `${stats.selectionRate}%` }}
                            ></div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {/* Card 1 & 2: Chung cho tất cả */}
                    <StatCard
                        title="Tổng số lượng"
                        value={stats.total || 0}
                        subValue="Dữ liệu hệ thống"
                        colorClass="bg-blue-50 border-blue-100 text-blue-900"
                        icon={BookOpen}
                    />

                    <StatCard
                        title="Đã chọn"
                        value={stats.selected || 0}
                        subValue={`${stats.total - stats.selected} chưa chọn`}
                        colorClass="bg-emerald-50 border-emerald-100 text-emerald-900"
                        icon={CheckCircle2}
                    />

                    {/* Card 3 & 4: Tùy biến theo Tab */}
                    {activeTab === 'courses' && (
                        <>
                            <StatCard
                                title="Tổng Sinh viên"
                                value={stats.totalStudents?.toLocaleString() || 0}
                                subValue="Dự kiến tham gia"
                                colorClass="bg-purple-50 border-purple-100 text-purple-900"
                                icon={Users}
                            />
                            <StatCard
                                title="Tổng giờ dạy"
                                value={stats.totalHours?.toLocaleString() || 0}
                                subValue="Tổng tải hệ thống"
                                colorClass="bg-orange-50 border-orange-100 text-orange-900"
                                icon={Clock}
                            />
                        </>
                    )}

                    {activeTab === 'teachers' && (
                        <>
                            <StatCard
                                title="Số Khoa tham gia"
                                value={stats.uniqueFaculties || 0}
                                subValue="Dựa trên GV đã chọn"
                                colorClass="bg-purple-50 border-purple-100 text-purple-900"
                                icon={Home}
                            />
                            <StatCard
                                title="Tỷ lệ sẵn sàng"
                                value={`${stats.selectionRate}%`}
                                subValue="Mức độ phủ GV"
                                colorClass="bg-orange-50 border-orange-100 text-orange-900"
                                icon={BarChart2}
                            />
                        </>
                    )}

                    {activeTab === 'rooms' && (
                        <>
                            <StatCard
                                title="Tổng sức chứa"
                                value={stats.totalCapacity?.toLocaleString() || 0}
                                subValue={`Tối ưu: ${stats.optimalCapacity || 0}`}
                                colorClass="bg-purple-50 border-purple-100 text-purple-900"
                                icon={Users}
                            />
                            <StatCard
                                title="Trung bình / Phòng"
                                value={stats.avgCapacity || 0}
                                subValue="Sức chứa trung bình"
                                colorClass="bg-orange-50 border-orange-100 text-orange-900"
                                icon={Maximize}
                            />
                        </>
                    )}

                    {/* --- PHẦN MỚI CHO CONSTRAINTS --- */}
                    {activeTab === 'constraints' && (
                        <>
                            <StatCard
                                title="Ràng buộc Cứng"
                                value={stats.hardSelected || 0}
                                subValue="Bắt buộc thỏa mãn"
                                colorClass="bg-red-50 border-red-100 text-red-900"
                                // Bạn cần import ShieldAlert từ lucide-react hoặc dùng icon khác
                                icon={props => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>}
                            />
                            <StatCard
                                title="Ràng buộc Mềm"
                                value={stats.softSelected || 0}
                                subValue="Tối ưu hóa (Penalty)"
                                colorClass="bg-indigo-50 border-indigo-100 text-indigo-900"
                                // Bạn cần import Scale từ lucide-react hoặc dùng icon khác
                                icon={props => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="M7 21h10"/><path d="M12 3v18"/><path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2"/></svg>}
                            />
                        </>
                    )}
                </div>
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
        testData.constraints = convertConstraintsToAPI(selectedConstraints);
        const res = await callGenerateSchedule(testData);
        setSchedules(res);
    }

    const handleSemesterChange = (e) => {
        const semesterId = parseInt(e.target.value);
        const semester = semesters.find(s => s.id === semesterId);
        setSelectedSemester(semester);

        // Reset tuần và errors khi đổi học kỳ
        setStartWeek('');
        setEndWeek('');
        setErrors({startWeek: '', endWeek: ''});

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
        console.log("Semter:", selectedSemester);
        const week = parseInt(value);
        const newErrors = {...errors};

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
        const newErrors = {...errors};

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
        updateSemesterConfig({start_week: parseInt(value)});


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
        updateSemesterConfig({end_week: parseInt(value)});
    };

    // --- HÀM XỬ LÝ STREAMING (Thay thế handleSchedule cũ) ---
    const handleScheduleStream = async () => {
        // 1. Chuẩn bị dữ liệu (Giống hệt code cũ)
        const selectedCourseIds = new Set(extractIdsFromObjects(selectedCourses));
        const selectedRoomIds = new Set(extractIdsFromObjects(selectedRooms));


        const selectedTeacherIds = new Set();
        // console.log("Selected Courses for Teachers:", selectedCourses);
        // console.log("ALl teacher: ", teachers);
        // console.log("All subject", subjects);
        // //  log 20 first rooms
        // console.log("First 20 rooms", rooms.slice(0, 20));
        // // console.log("All rooms", rooms)
        // console.log("All equipment", equipments);
        // console.log("All roomEquipments", roomEquipments);
        // console.log("All subjectRequiresEquipments", subjectRequiresEquipments);
        for (const course of selectedCourses) {
            if (course.teacher_id) { // Kiểm tra an toàn để đảm bảo id tồn tại
                selectedTeacherIds.add(course.teacher_id);
            }
        }
        const formattedData = formatDataForApi(
            {
                selectedRoomIds,
                selectedTeacherIds,
                selectedCourseIds,
                courseParams,
                teacherBusySlots,
                semesterConfig
            },
            {
                allRooms: rooms,
                allTeachers: teachers,
                allCourses: selectedCourses, // Lưu ý: đây là danh sách selectedCourses
                allSubjects: subjects, // <--- THÊM MỚI
                allSubjectRequirements: subjectRequiresEquipments, // <--- THÊM MỚI
                allEquipments: equipments // <--- THÊM MỚI
            }
        );
        const payload = {
            courses: formattedData.courses,
            teachers: formattedData.teachers,
            rooms: formattedData.rooms,
            semester_config: formattedData.semester_config,
            constraints: convertConstraintsToAPI(selectedConstraints),
            // fixed_schedule: fixedScheduleData,
            ga_config: {
                population_size: 100,
                time_limit_seconds: 300
            }
        };
        console.log("Scheduling Payload:", payload);

        // 2. Reset State & Mở Modal
        setIsScheduling(true);
        setScheduleProgress(0);
        setStreamLogs(["Bắt đầu kết nối đến server..."]);
        setIsStreamComplete(false);
        setFitnessValue(null);
        setCurrentPhase('phase1');

        try {
            // 3. Gọi Fetch với POST method
            const response = await fetch('http://localhost:5001/api/schedule/stream', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) throw new Error("Lỗi kết nối server");

            // 4. Xử lý Stream Reader
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let buffer = '';

            while (true) {
                const {done, value} = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, {stream: true});

                // Tách các message SSE (phân cách bởi \n\n)
                const parts = buffer.split('\n\n');
                buffer = parts.pop(); // Giữ lại phần thừa chưa đủ message

                for (const part of parts) {
                    if (part.trim() === '') continue;

                    // Parse dòng: "data: {...}" hoặc "event: ... \n data: ..."
                    const lines = part.split('\n');
                    let eventType = 'message';
                    let dataStr = '';

                    for (const line of lines) {
                        if (line.startsWith('event: ')) eventType = line.substring(7).trim();
                        if (line.startsWith('data: ')) dataStr = line.substring(6).trim();
                    }

                    if (dataStr) {
                        try {
                            const data = JSON.parse(dataStr);

                            if (eventType === 'result') {
                                // --- HOÀN TẤT ---
                                console.log("Final Result:", data);
                                setSchedulingResult(data);
                                setSchedules(data); // Lưu vào Global Store
                                setIsStreamComplete(true);
                                setScheduleProgress(100);
                                setStreamLogs(prev => [...prev, "Xếp lịch hoàn tất!"]);
                            } else if (eventType === 'error') {
                                // --- LỖI ---
                                setStreamLogs(prev => [...prev, `❌ Error: ${data.message}`]);
                                setIsStreamComplete(true); // Dừng spinner
                            } else {
                                // --- UPDATE TIẾN ĐỘ ---
                                if (data.phase) setCurrentPhase(data.phase);
                                if (data.percent) setScheduleProgress(data.percent);
                                if (data.detail?.fitness) setFitnessValue(data.detail.final_fitness);
                                if (data.message) setStreamLogs(prev => [...prev, data.message]);
                            }
                        } catch (e) {
                            console.error("JSON Parse Error", e);
                        }
                    }
                }
            }

        } catch (error) {
            console.error("Stream Error:", error);
            setStreamLogs(prev => [...prev, `❌ Lỗi hệ thống: ${error.message}`]);
            setIsStreamComplete(true);
        }
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
                    {/*<button*/}
                    {/*    onClick={() => setActiveTab('teachers')}*/}
                    {/*    className={`px-6 py-3 font-medium transition-all ${*/}
                    {/*        activeTab === 'teachers'*/}
                    {/*            ? 'text-blue-600 border-b-2 border-blue-600'*/}
                    {/*            : 'text-gray-600 hover:text-gray-900'*/}
                    {/*    }`}*/}
                    {/*>*/}
                    {/*    <Users className="w-5 h-5 inline mr-2"/>*/}
                    {/*    Giảng viên*/}
                    {/*</button>*/}
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
                    <div className="flex gap-3">
                        {/* Nút Check Data Dashboard */}
                        <button
                            onClick={handlePreCheck}
                            className="px-5 py-2.5 bg-indigo-100 text-indigo-700 rounded-lg font-semibold hover:bg-indigo-200 transition-all flex items-center gap-2"
                        >
                            <BarChart2 className="w-5 h-5"/>
                            Phân tích & Kiểm tra
                        </button>

                        {/* Nút Xếp lịch trực tiếp */}
                        <button
                            onClick={handleScheduleStream}
                            className="px-5 py-2.5 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition-all flex items-center gap-2 shadow-sm"
                        >
                            <PlayCircle className="w-5 h-5"/>
                            Bắt đầu Xếp lịch
                        </button>
                    </div>
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
                    {/*{activeTab === 'constraints' && renderConstraintList()}*/}
                    {activeTab === 'constraints' && (
                        <ConstraintSelector constraintsProps={constraints}/>
                    )}
                    {showDashboard && dashboardData && (
                        <PreSchedulingDashboard
                            data={dashboardData}
                            onClose={() => setShowDashboard(false)}
                        />
                    )}
                    {/* Modal Progress */}
                    <ScheduleProgressModal
                        isOpen={isScheduling}
                        onClose={() => setIsScheduling(false)} // Đóng modal
                        progress={scheduleProgress}
                        logs={streamLogs}
                        currentPhase={currentPhase}
                        fitness={fitnessValue}
                        isComplete={isStreamComplete}
                        result={schedulingResult}
                    />
                </div>
            </div>
        </div>
    );
};

export default ResourceManager;
