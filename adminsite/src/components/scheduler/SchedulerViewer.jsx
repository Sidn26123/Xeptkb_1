import React, {useState, useMemo} from 'react';
import {Plus, X, BarChart3, Calendar} from 'lucide-react';
import {saveSchedule} from "../../services/scheduleService.js";
import {showError, showSuccess} from "../../utils/toastUtils.js";
// import ScheduleAnalyzer from "./SchedulerAnalyzer.jsx";

const DAYS = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'CN'];
const PERIODS = 12;

// Sample data structure
// const scheduleData = {
//     success: true,
//     semester: {
//         start_week: 1,
//         end_week: 10,
//         max_concurrent: 4,
//     },
//     courses: [
//         {
//             "class_id": 1,
//             "course_id": 101,
//             "end_week": 15,
//             "room_id": 101,
//             "start_week": 11,
//             "student_count": 70,
//             "teacher_id": 1,
//             "weekly_slots": [
//                 {
//                     "day": 6,
//                     "duration": 2,
//                     "period": 1
//                 },
//                 {
//                     "day": 7,
//                     "duration": 2,
//                     "period": 10
//                 }
//             ],
//             "weeks_needed": 5
//         },
//         {
//             "class_id": 2,
//             "course_id": 102,
//             "end_week": 9,
//             "room_id": 101,
//             "start_week": 5,
//             "student_count": 70,
//             "teacher_id": 2,
//             "weekly_slots": [
//                 {
//                     "day": 5,
//                     "duration": 2,
//                     "period": 11
//                 },
//                 {
//                     "day": 5,
//                     "duration": 2,
//                     "period": 9
//                 }
//             ],
//             "weeks_needed": 5
//         },
//         {
//             "class_id": 3,
//             "course_id": 103,
//             "end_week": 7,
//             "room_id": 301,
//             "start_week": 3,
//             "student_count": 70,
//             "teacher_id": 3,
//             "weekly_slots": [
//                 {
//                     "day": 5,
//                     "duration": 2,
//                     "period": 3
//                 },
//                 {
//                     "day": 7,
//                     "duration": 2,
//                     "period": 8
//                 },
//                 {
//                     "day": 7,
//                     "duration": 2,
//                     "period": 1
//                 }
//             ],
//             "weeks_needed": 5
//         },
//         {
//             "class_id": 4,
//             "course_id": 201,
//             "end_week": 13,
//             "room_id": 301,
//             "start_week": 6,
//             "student_count": 100,
//             "teacher_id": 5,
//             "weekly_slots": [
//                 {
//                     "day": 7,
//                     "duration": 2,
//                     "period": 11
//                 },
//                 {
//                     "day": 3,
//                     "duration": 2,
//                     "period": 8
//                 }
//             ],
//             "weeks_needed": 8
//         },
//         {
//             "class_id": 5,
//             "course_id": 202,
//             "end_week": 11,
//             "room_id": 301,
//             "start_week": 5,
//             "student_count": 100,
//             "teacher_id": 3,
//             "weekly_slots": [
//                 {
//                     "day": 6,
//                     "duration": 2,
//                     "period": 9
//                 },
//                 {
//                     "day": 7,
//                     "duration": 2,
//                     "period": 3
//                 }
//             ],
//             "weeks_needed": 7
//         },
//         {
//             "class_id": 6,
//             "course_id": 1011,
//             "end_week": 11,
//             "room_id": 202,
//             "start_week": 2,
//             "student_count": 35,
//             "teacher_id": 1,
//             "weekly_slots": [
//                 {
//                     "day": 6,
//                     "duration": 3,
//                     "period": 6
//                 }
//             ],
//             "weeks_needed": 10
//         },
//         {
//             "class_id": 7,
//             "course_id": 1021,
//             "end_week": 10,
//             "room_id": 301,
//             "start_week": 1,
//             "student_count": 35,
//             "teacher_id": 2,
//             "weekly_slots": [
//                 {
//                     "day": 6,
//                     "duration": 3,
//                     "period": 6
//                 }
//             ],
//             "weeks_needed": 10
//         },
//         {
//             "class_id": 8,
//             "course_id": 301,
//             "end_week": 15,
//             "room_id": 101,
//             "start_week": 1,
//             "student_count": 45,
//             "teacher_id": 4,
//             "weekly_slots": [
//                 {
//                     "day": 2,
//                     "duration": 3,
//                     "period": 1
//                 }
//             ],
//             "weeks_needed": 15
//         },
//         {
//             "class_id": 9,
//             "course_id": 302,
//             "end_week": 15,
//             "room_id": 301,
//             "start_week": 1,
//             "student_count": 45,
//             "teacher_id": 5,
//             "weekly_slots": [
//                 {
//                     "day": 4,
//                     "duration": 2,
//                     "period": 1
//                 },
//                 {
//                     "day": 3,
//                     "duration": 2,
//                     "period": 5
//                 }
//             ],
//             "weeks_needed": 15
//         },
//         {
//             "class_id": 10,
//             "course_id": 401,
//             "end_week": 15,
//             "room_id": 101,
//             "start_week": 1,
//             "student_count": 80,
//             "teacher_id": 3,
//             "weekly_slots": [
//                 {
//                     "day": 3,
//                     "duration": 2,
//                     "period": 10
//                 },
//                 {
//                     "day": 4,
//                     "duration": 2,
//                     "period": 4
//                 }
//             ],
//             "weeks_needed": 15
//         }
//     ],
// };

const ScheduleViewer = ({courses, teachers, rooms, resultData}) => {
    const [currentWeek, setCurrentWeek] = useState(1);
    const [viewMode, setViewMode] = useState('schedule'); // 'schedule', 'overview', 'data'
    const [selectedCell, setSelectedCell] = useState(null);
    const [isAdmin] = useState(true); // Set to true for admin features
    const result = resultData || scheduleData;
    console.log("ScheduleViewer result:", result);
    // Get classes for a specific cell
    const getCellContent = (day, period) => {
        return result.courses.filter((course) => {
            if (
                currentWeek < course.start_week ||
                currentWeek > course.end_week
            ) {
                return false;
            }
            return course.weekly_slots.some(
                (slot) => slot.day === day && slot.period === period
            );
        });
    };

    // Calculate cell usage percentage across all weeks
    const getCellUsageData = (day, period) => {
        const totalWeeks =
            result.semester.end_week - result.semester.start_week + 1;
        let usedWeeks = 0;

        for (
            let week = result.semester.start_week;
            week <= result.semester.end_week;
            week++
        ) {
            const hasClass = result.courses.some((course) => {
                if (week < course.start_week || week > course.end_week)
                    return false;
                return course.weekly_slots.some(
                    (slot) => slot.day === day && slot.period === period
                );
            });
            if (hasClass) usedWeeks++;
        }

        const percentage = (usedWeeks / totalWeeks) * 100;
        return {percentage, usedWeeks, totalWeeks};
    };

    // Get color based on usage percentage
    const getUsageColor = (percentage) => {
        if (percentage < 30) return 'bg-orange-400';
        if (percentage < 80) return 'bg-green-400';
        if (percentage < 90) return 'bg-yellow-400';
        return 'bg-red-400';
    };

    // Get cell color for schedule view
    const getCellColor = (classes) => {
        if (classes.length === 0) return 'bg-white';
        if (classes.length === 1) return 'bg-blue-400';

        const teachers = new Set(classes.map((c) => c.teacher_id));
        const rooms = new Set(classes.map((c) => c.room_id));

        if (teachers.size < classes.length || rooms.size < classes.length) {
            return 'bg-red-400';
        }
        return 'bg-green-400';
    };

    // Calculate overview statistics
    const overviewStats = useMemo(() => {
        const courseMap = new Map();

        result.courses.forEach((course) => {
            const key = course.course_id;
            if (!courseMap.has(key)) {
                courseMap.set(key, {
                    course_id: key,
                    classes: [],
                    totalPeriods: 0,
                    theoryPeriods: 0,
                    practicePeriods: 0,
                    credits: 0,
                });
            }

            const data = courseMap.get(key);
            data.classes.push(course);

            course.weekly_slots.forEach((slot) => {
                data.totalPeriods +=
                    slot.duration * (course.end_week - course.start_week + 1);
                // Giả sử period 1-6 là lý thuyết, 7-12 là thực hành
                if (slot.period <= 6) {
                    data.theoryPeriods +=
                        slot.duration *
                        (course.end_week - course.start_week + 1);
                } else {
                    data.practicePeriods +=
                        slot.duration *
                        (course.end_week - course.start_week + 1);
                }
            });
            data.credits = Math.ceil(data.totalPeriods / 15); // Giả định 15 tiết = 1 tín chỉ
        });

        return Array.from(courseMap.values()).sort(
            (a, b) => a.course_id - b.course_id
        );
    }, [result.courses]);

    const totalStats = useMemo(() => {
        return overviewStats.reduce(
            (acc, course) => ({
                totalCourses: acc.totalCourses + 1,
                totalPeriods: acc.totalPeriods + course.totalPeriods,
                theoryPeriods: acc.theoryPeriods + course.theoryPeriods,
                practicePeriods: acc.practicePeriods + course.practicePeriods,
                totalCredits: acc.totalCredits + course.credits,
            }),
            {
                totalCourses: 0,
                totalPeriods: 0,
                theoryPeriods: 0,
                practicePeriods: 0,
                totalCredits: 0,
            }
        );
    }, [overviewStats]);

    const handleWeekChange = (delta) => {
        const newWeek = currentWeek + delta;
        if (
            newWeek >= result.semester.start_week &&
            newWeek <= result.semester.end_week
        ) {
            setCurrentWeek(newWeek);
        }
    };

    const handleSemesterChange = (e) => {
        const semesterId = e.target.value;
        // Fetch and update schedule data based on selected semester
        console.log("Selected semester ID:", semesterId);
    }

    return (
        <div className="min-h-screen bg-gray-100 p-6">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold mb-6 text-gray-800">
                    Quản Lý Thời Khóa Biểus
                </h1>
                <div className="p-6 bg-gray-50 min-h-screen">
                    <h1 className="text-2xl font-bold mb-4 text-gray-800">Chọn học kỳ</h1>

                    <div className="max-w-md">
                        <label className="block mb-2 text-sm font-semibold text-gray-700">
                            Học kỳ
                        </label>
                        <select
                            onChange={handleSemesterChange}
                            className="w-full border rounded-lg px-4 py-2 shadow-sm focus:ring-2 focus:ring-blue-500"
                            defaultValue=""
                        >
                            <option value="" disabled>
                                -- Chọn học kỳ --
                            </option>
                            {semesters.map((s) => (
                                <option
                                    key={s.id}
                                    value={s.id}
                                    className={
                                        s.status === "finished" ? "text-red-500 font-semibold" : ""
                                    }
                                >
                                    {`${s.code} - ${s.name} (${s.start} → ${s.end})`}
                                </option>
                            ))}
                        </select>

                        {selectedSemester && (
                            <div className="mt-4 p-3 rounded-lg border bg-white shadow-sm">
                                <p>
                                    <strong>Mã:</strong> {selectedSemester.code}
                                </p>
                                <p>
                                    <strong>Tên:</strong> {selectedSemester.name}
                                </p>
                                <p>
                                    <strong>Thời gian:</strong>{" "}
                                    {selectedSemester.start} → {selectedSemester.end}
                                </p>
                                <p
                                    className={
                                        selectedSemester.status === "finished"
                                            ? "text-red-500 font-semibold"
                                            : "text-green-600 font-semibold"
                                    }
                                >
                                    Trạng thái: {selectedSemester.status}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
                {/* View Mode Selector */}
                {isAdmin && (
                    <div className="mb-6 flex gap-2">
                        <button
                            onClick={() => setViewMode('schedule')}
                            className={`px-4 py-2 rounded-md flex items-center gap-2 ${
                                viewMode === 'schedule'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-white text-gray-700 border'
                            }`}
                        >
                            <Calendar size={18}/>
                            Lịch Học
                        </button>
                        <button
                            onClick={() => setViewMode('overview')}
                            className={`px-4 py-2 rounded-md flex items-center gap-2 ${
                                viewMode === 'overview'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-white text-gray-700 border'
                            }`}
                        >
                            <BarChart3 size={18}/>
                            Tổng Quan
                        </button>
                        <button
                            onClick={() => setViewMode('data')}
                            className={`px-4 py-2 rounded-md flex items-center gap-2 ${
                                viewMode === 'data'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-white text-gray-700 border'
                            }`}
                        >
                            <BarChart3 size={18}/>
                            Dữ Liệu
                        </button>
                        <button
                            onClick={() => setViewMode('analysis')}
                            className={`px-4 py-2 rounded-md flex items-center gap-2 ${
                                viewMode === 'analysis'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-white text-gray-700 border'
                            }`}
                        >
                            <BarChart3 size={18}/>
                            Dữ Liệu
                        </button>
                    </div>
                )}

                {/* Schedule View */}
                {viewMode === 'schedule' && (
                    <div>
                        <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg mb-4">
                            <button
                                onClick={() => handleWeekChange(-1)}
                                disabled={
                                    currentWeek <= result.semester.start_week
                                }
                                className="px-4 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
                            >
                                ⬅ Tuần trước
                            </button>
                            <div className="text-lg font-semibold">
                                Tuần{' '}
                                <span className="text-blue-600">
                                    {currentWeek}
                                </span>{' '}
                                / {result.semester.end_week}
                            </div>
                            <button
                                onClick={() => handleWeekChange(1)}
                                disabled={
                                    currentWeek >= result.semester.end_week
                                }
                                className="px-4 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
                            >
                                Tuần sau ➡
                            </button>
                        </div>

                        <div className="bg-white rounded-lg shadow-md overflow-x-auto">
                            <table className="w-full border-collapse">
                                <thead>
                                <tr>
                                    <th className="bg-blue-500 text-white p-3 border border-gray-300 sticky left-0 z-10">
                                        Tiết
                                    </th>
                                    {DAYS.map((day, idx) => (
                                        <th
                                            key={idx}
                                            className="bg-blue-500 text-white p-3 border border-gray-300"
                                        >
                                            {day}
                                        </th>
                                    ))}
                                </tr>
                                </thead>
                                <tbody>
                                {Array.from(
                                    {length: PERIODS},
                                    (_, periodIdx) => (
                                        <tr key={periodIdx}>
                                            <td className="bg-blue-100 text-center font-semibold p-3 border border-gray-300 sticky left-0 z-10">
                                                {periodIdx + 1}
                                            </td>
                                            {DAYS.map((_, dayIdx) => {
                                                const classes =
                                                    getCellContent(
                                                        dayIdx + 2,
                                                        periodIdx + 1
                                                    );
                                                const cellColor =
                                                    getCellColor(classes);
                                                return (
                                                    <td
                                                        key={dayIdx}
                                                        className={`${cellColor} border border-gray-300 p-2 min-w-[120px] relative group`}
                                                    >
                                                        {classes.length >
                                                            0 && (
                                                                <div
                                                                    className="text-xs space-y-1 text-white font-medium">
                                                                    {classes.map(
                                                                        (
                                                                            cls,
                                                                            idx
                                                                        ) => (
                                                                            <div
                                                                                key={
                                                                                    idx
                                                                                }
                                                                            >
                                                                                <div>
                                                                                    Lớp:{' '}
                                                                                    {
                                                                                        cls.class_id
                                                                                    }
                                                                                </div>
                                                                                <div>
                                                                                    MH:{' '}
                                                                                    {
                                                                                        cls.course_id
                                                                                    }
                                                                                </div>
                                                                                <div>
                                                                                    Phòng:{' '}
                                                                                    {
                                                                                        cls.room_id
                                                                                    }
                                                                                </div>
                                                                            </div>
                                                                        )
                                                                    )}
                                                                </div>
                                                            )}
                                                        <button
                                                            onClick={() =>
                                                                setSelectedCell(
                                                                    {
                                                                        day:
                                                                            dayIdx +
                                                                            2,
                                                                        period:
                                                                            periodIdx +
                                                                            1,
                                                                        classes,
                                                                    }
                                                                )
                                                            }
                                                            className="absolute bottom-1 right-1 bg-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-md hover:bg-gray-100"
                                                        >
                                                            <Plus
                                                                size={14}
                                                                className="text-blue-600"
                                                            />
                                                        </button>
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    )
                                )}
                                </tbody>
                            </table>
                        </div>

                        <div className="mt-6 bg-white rounded-lg shadow-md p-4">
                            <h3 className="font-semibold mb-3">Chú thích:</h3>
                            <div className="flex flex-wrap gap-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 bg-blue-400 border border-gray-300 rounded"></div>
                                    <span className="text-sm">
                                        Tiết học bình thường
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 bg-green-400 border border-gray-300 rounded"></div>
                                    <span className="text-sm">
                                        Nhiều lớp (không xung đột)
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 bg-red-400 border border-gray-300 rounded"></div>
                                    <span className="text-sm">
                                        Xung đột (cùng GV/phòng)
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Overview Mode */}
                {viewMode === 'overview' && (
                    <div>
                        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                            <h2 className="text-xl font-bold mb-4">
                                Thống Kê Tổng Quan
                            </h2>
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                <div className="bg-blue-50 p-4 rounded-lg">
                                    <div className="text-2xl font-bold text-blue-600">
                                        {totalStats.totalCourses}
                                    </div>
                                    <div className="text-sm text-gray-600">
                                        Tổng số môn
                                    </div>
                                </div>
                                <div className="bg-green-50 p-4 rounded-lg">
                                    <div className="text-2xl font-bold text-green-600">
                                        {totalStats.totalPeriods}
                                    </div>
                                    <div className="text-sm text-gray-600">
                                        Tổng số tiết
                                    </div>
                                </div>
                                <div className="bg-purple-50 p-4 rounded-lg">
                                    <div className="text-2xl font-bold text-purple-600">
                                        {totalStats.theoryPeriods}
                                    </div>
                                    <div className="text-sm text-gray-600">
                                        Tiết lý thuyết
                                    </div>
                                </div>
                                <div className="bg-orange-50 p-4 rounded-lg">
                                    <div className="text-2xl font-bold text-orange-600">
                                        {totalStats.practicePeriods}
                                    </div>
                                    <div className="text-sm text-gray-600">
                                        Tiết thực hành
                                    </div>
                                </div>
                                <div className="bg-indigo-50 p-4 rounded-lg">
                                    <div className="text-2xl font-bold text-indigo-600">
                                        {totalStats.totalCredits}
                                    </div>
                                    <div className="text-sm text-gray-600">
                                        Tổng tín chỉ
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-lg shadow-md p-6">
                            <h2 className="text-xl font-bold mb-4">
                                Chi Tiết Môn Học
                            </h2>
                            <div className="space-y-3">
                                {overviewStats.map((course, idx) => (
                                    <CourseDetailCard
                                        key={idx}
                                        course={course}
                                        isFirst={idx === 0}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Data Mode */}
                {viewMode === 'data' && (
                    <div>
                        <div className="bg-white rounded-lg shadow-md p-4 mb-4">
                            <h3 className="font-semibold mb-2">
                                Chú thích % sử dụng:
                            </h3>
                            <div className="flex flex-wrap gap-4 text-sm">
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 bg-orange-400 border rounded"></div>
                                    <span>&lt; 30%</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 bg-green-400 border rounded"></div>
                                    <span>30-79%</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 bg-yellow-400 border rounded"></div>
                                    <span>80-89%</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 bg-red-400 border rounded"></div>
                                    <span>≥ 90%</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow-md overflow-x-auto">
                            <table className="w-full border-collapse">
                                <thead>
                                <tr>
                                    <th className="bg-blue-500 text-white p-3 border sticky left-0 z-10">
                                        Tiết
                                    </th>
                                    {DAYS.map((day, idx) => (
                                        <th
                                            key={idx}
                                            className="bg-blue-500 text-white p-3 border"
                                        >
                                            {day}
                                        </th>
                                    ))}
                                </tr>
                                </thead>
                                <tbody>
                                {Array.from(
                                    {length: PERIODS},
                                    (_, periodIdx) => (
                                        <tr key={periodIdx}>
                                            <td className="bg-blue-100 text-center font-semibold p-3 border sticky left-0 z-10">
                                                {periodIdx + 1}
                                            </td>
                                            {DAYS.map((_, dayIdx) => {
                                                const usageData =
                                                    getCellUsageData(
                                                        dayIdx + 2,
                                                        periodIdx + 1
                                                    );
                                                const color = getUsageColor(
                                                    usageData.percentage
                                                );
                                                return (
                                                    <td
                                                        key={dayIdx}
                                                        className={`${color} border p-3 min-w-[120px] text-center`}
                                                    >
                                                        <div className="text-white font-bold text-lg">
                                                            {usageData.percentage.toFixed(
                                                                0
                                                            )}
                                                            %
                                                        </div>
                                                        <div className="text-white text-xs mt-1">
                                                            {
                                                                usageData.usedWeeks
                                                            }
                                                            /
                                                            {
                                                                usageData.totalWeeks
                                                            }{' '}
                                                            tuần
                                                        </div>
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    )
                                )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {viewMode === 'analysis' && (
                    <>
                        {/*<ScheduleAnalyzer courses={courses} teachers={teachers} rooms={rooms} result={resultData}/>*/}
                    </>
                )
                }
                {/* Cell Detail Modal */}
                {selectedCell && (
                    <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-bold">
                                    Chi Tiết - {DAYS[selectedCell.day - 2]} Tiết{' '}
                                    {selectedCell.period}
                                </h3>
                                <button
                                    onClick={() => setSelectedCell(null)}
                                    className="text-gray-500 hover:text-gray-700"
                                >
                                    <X size={24}/>
                                </button>
                            </div>

                            {selectedCell.classes.length > 0 ? (
                                <div className="space-y-4">
                                    {selectedCell.classes.map((cls, idx) => (
                                        <div
                                            key={idx}
                                            className="bg-gray-50 p-4 rounded-lg"
                                        >
                                            <div className="grid grid-cols-2 gap-2 text-sm">
                                                <div>
                                                    <span className="font-semibold">
                                                        Mã lớp:
                                                    </span>{' '}
                                                    {cls.class_id}
                                                </div>
                                                <div>
                                                    <span className="font-semibold">
                                                        Môn học:
                                                    </span>{' '}
                                                    {cls.course_id}
                                                </div>
                                                <div>
                                                    <span className="font-semibold">
                                                        Giảng viên:
                                                    </span>{' '}
                                                    {cls.teacher_id}
                                                </div>
                                                <div>
                                                    <span className="font-semibold">
                                                        Phòng:
                                                    </span>{' '}
                                                    {cls.room_id}
                                                </div>
                                                <div>
                                                    <span className="font-semibold">
                                                        Tuần:
                                                    </span>{' '}
                                                    {cls.start_week} -{' '}
                                                    {cls.end_week}
                                                </div>
                                                <div>
                                                    <span className="font-semibold">
                                                        Sinh viên:
                                                    </span>{' '}
                                                    {cls.student_count}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-gray-500">
                                    Không có lớp học trong tiết này
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

const CourseDetailCard = ({course, isFirst}) => {
    const [expanded, setExpanded] = useState(isFirst);

    return (
        <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="bg-gray-50 p-4 flex justify-between items-center">
                <div className="flex-1">
                    <div className="font-semibold text-lg">
                        Môn: {course.course_id}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                        {course.classes.length} lớp | {course.totalPeriods} tiết
                        | {course.credits} tín chỉ
                    </div>
                </div>
                <button
                    onClick={() => setExpanded(!expanded)}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                    {expanded ? 'Thu gọn' : 'Mở rộng'}
                </button>
            </div>

            {expanded && (
                <div className="p-4 bg-white">
                    <div className="grid grid-cols-3 gap-4 mb-4 text-sm">
                        <div className="bg-blue-50 p-3 rounded">
                            <div className="font-semibold text-blue-600">
                                {course.totalPeriods}
                            </div>
                            <div className="text-gray-600">Tổng tiết</div>
                        </div>
                        <div className="bg-purple-50 p-3 rounded">
                            <div className="font-semibold text-purple-600">
                                {course.theoryPeriods}
                            </div>
                            <div className="text-gray-600">Lý thuyết</div>
                        </div>
                        <div className="bg-orange-50 p-3 rounded">
                            <div className="font-semibold text-orange-600">
                                {course.practicePeriods}
                            </div>
                            <div className="text-gray-600">Thực hành</div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <h4 className="font-semibold">Danh sách lớp:</h4>
                        {course.classes.map((cls, idx) => (
                            <div
                                key={idx}
                                className="bg-gray-50 p-3 rounded text-sm"
                            >
                                <div className="flex justify-between">
                                    <span className="font-medium">
                                        Lớp {cls.class_id}
                                    </span>
                                    <span className="text-gray-600">
                                        Tuần {cls.start_week}-{cls.end_week}
                                    </span>
                                </div>
                                <div className="text-gray-600 mt-1">
                                    GV: {cls.teacher_id} | Phòng: {cls.room_id}{' '}
                                    | SV: {cls.student_count}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ScheduleViewer;