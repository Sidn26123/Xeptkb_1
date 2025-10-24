import React, {useEffect, useMemo, useState} from 'react';
import {Calendar, ChevronDown, ChevronRight, Plus} from 'lucide-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faEnvelope } from '@fortawesome/free-solid-svg-icons';
import CommonTable from '../../commons/CommonTable.jsx';
import ScheduleGeneratorApp from './Scheduler.jsx';
import ScheduleViewer from './SchedulerViewer.jsx';
import {
    useCourses, useDepartments,
    useGAConfig,
    useRooms, useSchedulingActions, useSelectedCourses, useSelectedRooms, useSelectedTeachers,
    useSemesterConfig, useSubjects,
    useTeachers,
} from '../../stores/ScheduleDataStore.js';
import ScheduleAnalyzer from './SchedulerAnalyzer.jsx';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { CheckSquare, Square, RefreshCw, CheckCircle2, Users, BookOpen, Home } from 'lucide-react';


const SchedulerResourcesManagement = () => {
    const [expandedDepts, setExpandedDepts] = useState({});
    const [selectedClasses, setSelectedClasses] = useState({});
    const [selectedGrades, setSelectedGrades] = useState({
        10: true,
        11: true,
        12: true,
        9: false,
    });
    const [selectedSchool, setSelectedSchool] = useState('THCS Nghĩa Dân');
    const [selectedSubjects, setSelectedSubjects] = useState({
        'Chào cờ': true,
        'Tiếng Anh có yêu tố nước ngoài': false,
        'Sinh hoạt': true,
    });

    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isFacultyPartShown, setIsFacultyPartShown] = useState(true);
    const [isGradePartShown, setIsGradePartShown] = useState(false);
    const [isSubjectPartShown, setIsSubjectPartShown] = useState(true);
    const [activeTab, setActiveTab] = useState('data');

    const toggleCollapse = () => setIsCollapsed(!isCollapsed);

    const toggleFacultyPart = () => setIsFacultyPartShown(!isFacultyPartShown);

    const toggleGradePart = () => setIsGradePartShown(!isGradePartShown);

    const toggleSubjectPart = () => setIsSubjectPartShown(!isSubjectPartShown);

    const toggleDepartment = (deptId) => {
        setExpandedDepts((prev) => ({
            ...prev,
            [deptId]: !prev[deptId],
        }));
    };

    const toggleClass = (classId) => {
        setSelectedClasses((prev) => ({
            ...prev,
            [classId]: !prev[classId],
        }));
    };

    const toggleGrade = (grade) => {
        setSelectedGrades((prev) => ({
            ...prev,
            [grade]: !prev[grade],
        }));
    };

    const toggleSubject = (subject) => {
        setSelectedSubjects((prev) => ({
            ...prev,
            [subject]: !prev[subject],
        }));
    };

    const courses = useCourses();
    const teachers = useTeachers();
    const rooms = useRooms();
    const semester_config = useSemesterConfig();
    const ga_config = useGAConfig();
    const departments = useDepartments();
    const subjects = useSubjects();
    const selectedCourses = useSelectedCourses();
    const selectedTeachers = useSelectedTeachers();
    const selectedRooms = useSelectedRooms();
    const [result, setResult] = useState(null);

    const API_URL = 'http://localhost:5001/api/schedule';

    const generateSchedule = async () => {
        try {
            const data = {
                courses: selectedCourses,
                teachers: selectedTeachers,
                rooms: selectedRooms,
                semester_config: semester_config,
                ga_config: ga_config,
            };
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            const responseData = await response.json();

            if (response.ok && responseData.success) {
                setResult(responseData);
            } else {
                /* empty */
            }
        } catch (err) {
            /* empty */
        } finally {
            /* empty */
        }
    };
    // useEffect(() => {
    //     generateSchedule();
    // }, []);
    const handleStartGenerate = () => {
        generateSchedule();
    }
    return (
        <div className="p-6 min-h-full bg-surface-light dark:bg-surface-dark transition-colors duration-300">
            {/* Header */}
            <div className={"flex flex-col justify-between md:flex-row md:items-center mb-6"}>
                <div className="flex items-center gap-3 mb-6">
                    <Calendar className="w-8 h-8 text-blue-600"/>
                    <h1 className="text-3xl font-bold text-gray-800">
                        Tạo Thời Khóa Biểu Tự Động
                    </h1>
                </div>
                <div className="flex items-center gap-3 mb-6" onClick={handleStartGenerate}>
                    <Plus className="w-5 h-5 text-blue-600"/>
                    <span className="text-gray-600">
                                Tạo
                            </span>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-3 mb-6">
                <button
                    onClick={() => setActiveTab('data')}
                    className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 border
          ${
                        activeTab === 'data'
                            ? 'bg-primary text-white shadow'
                            : 'bg-card-light dark:bg-card-dark text-text-secondary-light dark:text-text-secondary-dark hover:bg-gray-100 dark:hover:bg-gray-700 border-border-light dark:border-border-dark'
                    }`}
                >
                    Dữ liệu
                </button>
                <button
                    onClick={() => setActiveTab('schedule')}
                    className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 border
          ${
                        activeTab === 'schedule'
                            ? 'bg-primary text-white shadow'
                            : 'bg-card-light dark:bg-card-dark text-text-secondary-light dark:text-text-secondary-dark hover:bg-gray-100 dark:hover:bg-gray-700 border-border-light dark:border-border-dark'
                    }`}
                >
                    Thời khoá biểu
                </button>
            </div>

            {activeTab === 'data' ? (
                <>
                    <ResourceManager/>
                </>
            ) : (
                <>
                    {/*<ScheduleGeneratorApp />*/}
                    {result && <ScheduleViewer courses = {courses} teachers = {teachers} rooms = {rooms} resultData={result}/>}
                    {/*{result && (*/}
                    {/*    <>*/}
                    {/*        <ScheduleAnalyzer/>*/}
                    {/*    </>*/}
                    {/*)}*/}
                </>
            )}
        </div>
    );
};

export default SchedulerResourcesManagement;


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
        const selected = courses.filter(c => selectedCourses.includes(c.id));
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
        const selected = teachers.filter(t => selectedTeachers.includes(t.id));
        const totalCoursesCovered = [...new Set(selected.flatMap(t => t.can_teach_courses))].length;
        const avgCoursesPerTeacher = selected.length > 0 ? (selected.reduce((sum, t) => sum + t.can_teach_courses.length, 0) / selected.length).toFixed(1) : 0;

        return {
            total: teachers.length,
            selected: selected.length,
            totalCoursesCovered,
            avgCoursesPerTeacher,
        };
    }, [teachers, selectedTeachers]);

    const roomStats = useMemo(() => {
        const selected = rooms.filter(r => selectedRooms.includes(r.id));
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

    const teacherCoverageData = useMemo(() => teachers.map(t => ({
        name: t.name,
        courses: t.can_teach_courses.length,
        selected: selectedTeachers.includes(t.id),
    })), [teachers, selectedTeachers]);

    const selectionDistribution = useMemo(() => [
        { name: 'Đã chọn', value: activeTab === 'courses' ? courseStats.selected : activeTab === 'teachers' ? teacherStats.selected : roomStats.selected },
        { name: 'Chưa chọn', value: activeTab === 'courses' ? (courseStats.total - courseStats.selected) : activeTab === 'teachers' ? (teacherStats.total - teacherStats.selected) : (roomStats.total - roomStats.selected) },
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
                                <CheckSquare className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                            ) : (
                                <Square className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                            )}
                            <div className="flex-1">
                                <h3 className="font-semibold text-gray-900">Khóa học {course.course_id}</h3>
                                <div className="mt-2 grid grid-cols-2 gap-2 text-sm text-gray-600">
                                    <div className="flex items-center">
                                        <Users className="w-4 h-4 mr-1" />
                                        <span>{course.student_count} sinh viên</span>
                                    </div>
                                    <div>
                                        <span className="font-medium">{course.weeks_needed}</span> tuần
                                    </div>
                                    <div>
                                        <span className="font-medium">{course.sessions_per_week}</span> buổi/tuần
                                    </div>
                                    <div>
                                        <span className="font-medium">{course.duration_per_session}</span> giờ/buổi
                                    </div>
                                </div>
                                <div className="mt-2 text-xs text-gray-500">
                                    Tổng: {course.weeks_needed * course.sessions_per_week * course.duration_per_session} giờ
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
                            <CheckSquare className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                        ) : (
                            <Square className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                        )}
                        <div className="flex-1">
                            <h3 className="font-semibold text-gray-900">{teacher.name}</h3>
                            <div className="mt-2 text-sm text-gray-600">
                                <span className="font-medium">Có thể dạy:</span>
                                <div className="mt-1 flex flex-wrap gap-1">
                                    {teacher.can_teach_courses.map(courseId => (
                                        <span key={courseId} className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                      Course {courseId}
                    </span>
                                    ))}
                                </div>
                            </div>
                            <div className="mt-2 text-xs text-gray-500">
                                {teacher.can_teach_courses.length} khóa học
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
                            <CheckSquare className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                        ) : (
                            <Square className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                        )}
                        <div className="flex-1">
                            <h3 className="font-semibold text-gray-900">{room.name}</h3>
                            <div className="mt-2 flex items-center text-sm text-gray-600">
                                <Home className="w-4 h-4 mr-1" />
                                <span>Sức chứa: <span className="font-medium">{room.capacity}</span> người</span>
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
                        <>
                            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg">
                                <div className="text-sm text-purple-600 font-medium">Khóa phủ</div>
                                <div className="text-2xl font-bold text-purple-900">{teacherStats.totalCoursesCovered}</div>
                            </div>
                            <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg">
                                <div className="text-sm text-orange-600 font-medium">TB khóa/GV</div>
                                <div className="text-2xl font-bold text-orange-900">{teacherStats.avgCoursesPerTeacher}</div>
                            </div>
                        </>
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
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Distribution Pie Chart */}
                    <div>
                        <h3 className="text-sm font-semibold text-gray-700 mb-3">Phân bố lựa chọn</h3>
                        <ResponsiveContainer width="100%" height={200}>
                            <PieChart>
                                <Pie
                                    data={selectionDistribution}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, value }) => `${name}: ${value}`}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {selectionDistribution.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Bar Chart based on tab */}
                    <div>
                        <h3 className="text-sm font-semibold text-gray-700 mb-3">
                            {activeTab === 'courses' ? 'Số sinh viên theo khóa' :
                                activeTab === 'teachers' ? 'Số khóa giảng viên có thể dạy' :
                                    'Sức chứa phòng học'}
                        </h3>
                        <ResponsiveContainer width="100%" height={200}>
                            <BarChart data={activeTab === 'courses' ? courseChartData : activeTab === 'teachers' ? teacherCoverageData : roomCapacityData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                                <YAxis />
                                <Tooltip />
                                <Bar
                                    dataKey={activeTab === 'courses' ? 'students' : activeTab === 'teachers' ? 'courses' : 'capacity'}
                                    fill="#3b82f6"
                                    radius={[8, 8, 0, 0]}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Additional Course Statistics */}
                {activeTab === 'courses' && (
                    <div className="mt-6">
                        <h3 className="text-sm font-semibold text-gray-700 mb-3">Phân tích chi tiết khóa học</h3>
                        <ResponsiveContainer width="100%" height={200}>
                            <LineChart data={courseChartData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Line type="monotone" dataKey="weeks" stroke="#8b5cf6" name="Số tuần" />
                                <Line type="monotone" dataKey="sessions" stroke="#ec4899" name="Buổi/tuần" />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto">

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
                        <BookOpen className="w-5 h-5 inline mr-2" />
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
                        <Users className="w-5 h-5 inline mr-2" />
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
                        <Home className="w-5 h-5 inline mr-2" />
                        Phòng học
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
                            Danh sách {activeTab === 'courses' ? 'khóa học' : activeTab === 'teachers' ? 'giảng viên' : 'phòng học'}
                        </h2>
                        <div className="flex space-x-2">
                            <button
                                onClick={() => selectAll(activeTab)}
                                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center space-x-2"
                            >
                                <CheckCircle2 className="w-4 h-4" />
                                <span>Chọn tất cả</span>
                            </button>
                            <button
                                onClick={() => resetSelection(activeTab)}
                                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center space-x-2"
                            >
                                <RefreshCw className="w-4 h-4" />
                                <span>Đặt lại</span>
                            </button>
                        </div>
                    </div>

                    {activeTab === 'courses' && renderCourseList()}
                    {activeTab === 'teachers' && renderTeacherList()}
                    {activeTab === 'rooms' && renderRoomList()}
                </div>
            </div>
        </div>
    );
};

export {ResourceManager};
