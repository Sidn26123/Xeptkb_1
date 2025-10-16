import React, { useState } from 'react';
import { Loader2, Calendar, Settings, Play } from 'lucide-react';
import useInputStore from '../../stores/InputDataStore.js';

const DAYS = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ Nhật'];
const PERIODS = 14;

const defaultInputData = {
    courses: [
        {
            id: 1,
            course_id: 101,
            student_count: 50,
            weeks_needed: 4,
            sessions_per_week: 2,
            duration_per_session: 2,
        },
        {
            id: 2,
            course_id: 102,
            student_count: 40,
            weeks_needed: 3,
            sessions_per_week: 2,
            duration_per_session: 2,
        },
        {
            id: 3,
            course_id: 103,
            student_count: 60,
            weeks_needed: 5,
            sessions_per_week: 3,
            duration_per_session: 2,
        },
        {
            id: 4,
            course_id: 104,
            student_count: 45,
            weeks_needed: 4,
            sessions_per_week: 2,
            duration_per_session: 2,
        },
        {
            id: 5,
            course_id: 105,
            student_count: 50,
            weeks_needed: 3,
            sessions_per_week: 2,
            duration_per_session: 2,
        },
        {
            id: 6,
            course_id: 106,
            student_count: 35,
            weeks_needed: 4,
            sessions_per_week: 2,
            duration_per_session: 2,
        },
        {
            id: 7,
            course_id: 107,
            student_count: 55,
            weeks_needed: 5,
            sessions_per_week: 3,
            duration_per_session: 2,
        },
    ],
    teachers: [
        { id: 1, name: 'Teacher A', can_teach_courses: [101, 102] },
        { id: 2, name: 'Teacher B', can_teach_courses: [102, 103, 104] },
        { id: 3, name: 'Teacher C', can_teach_courses: [104, 105, 106] },
        { id: 4, name: 'Teacher D', can_teach_courses: [106, 107] },
    ],
    rooms: [
        { id: 1, name: 'Room 101', capacity: 60 },
        { id: 2, name: 'Room 102', capacity: 50 },
        { id: 3, name: 'Room 103', capacity: 40 },
        { id: 4, name: 'Room 201', capacity: 70 },
    ],
    semester_config: {
        start_week: 1,
        end_week: 15,
        max_concurrent_courses: 4,
    },
    ga_config: {
        population_size: 50,
        generations: 300,
        crossover_rate: 0.8,
        mutation_rate: 0.2,
        elite_size: 5,
        tournament_size: 3,
    },
};

export default function ScheduleGeneratorApp() {
    const [inputData, setInputData] = useState(
        JSON.stringify(defaultInputData, null, 2)
    );

    const { courses, teachers, rooms, semester_config, ga_config } =
        useInputStore();

    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');
    const [currentWeek, setCurrentWeek] = useState(1);
    const [schedule, setSchedule] = useState(null);
    const [activeTab, setActiveTab] = useState('input');

    const API_URL = 'http://localhost:5000/api/schedule';

    const generateSchedule = async () => {
        setLoading(true);
        setError('');
        setResult(null);

        try {
            const data = {
                courses,
                teachers,
                rooms,
                semester_config,
                ga_config,
            };

            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            const responseData = await response.json();

            if (response.ok && responseData.success) {
                setResult(responseData);
                setCurrentWeek(responseData.semester.start_week);
                buildSchedule(
                    responseData.courses,
                    responseData.semester.start_week
                );
                setActiveTab('schedule');
            } else {
                setError(responseData.error || 'Unknown error occurred');
            }
        } catch (err) {
            setError('Lỗi kết nối API hoặc JSON không hợp lệ: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const buildSchedule = (coursesData, week) => {
        const matrix = {};
        coursesData.forEach((course) => {
            if (week >= course.start_week && week <= course.end_week) {
                course.weekly_slots.forEach((slot) => {
                    const { day, period, duration } = slot;
                    for (let i = 0; i < duration; i++) {
                        const p = period + i;
                        const key = `${day}-${p}`;
                        if (!matrix[key]) matrix[key] = [];
                        matrix[key].push({
                            class_id: course.class_id,
                            course_id: course.course_id,
                            teacher_id: course.teacher_id,
                            room_id: course.room_id,
                            student_count: course.student_count,
                        });
                    }
                });
            }
        });
        setSchedule(matrix);
    };

    const getCellContent = (day, period) => {
        if (!schedule) return [];
        return schedule[`${day}-${period}`] || [];
    };

    const getCellColor = (classes) => {
        if (classes.length === 0) return 'bg-white';
        if (classes.length > 1) {
            let conflict = 0;
            for (let i = 0; i < classes.length; i++) {
                for (let j = i + 1; j < classes.length; j++) {
                    if (
                        classes[i].teacher_id === classes[j].teacher_id ||
                        classes[i].room_id === classes[j].room_id
                    ) {
                        conflict++;
                    }
                }
            }
            return conflict > 0 ? 'bg-red-400' : 'bg-green-400';
        }
        return 'bg-blue-400';
    };

    const handleWeekChange = (direction) => {
        if (!result) return;
        let newWeek = currentWeek + direction;
        if (
            newWeek < result.semester.start_week ||
            newWeek > result.semester.end_week
        )
            return;
        setCurrentWeek(newWeek);
        buildSchedule(result.courses, newWeek);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6 text-gray-800">
            <div className="max-w-7xl mx-auto">
                <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
                    <div className="flex items-center gap-3 mb-6">
                        <Calendar className="w-8 h-8 text-blue-600" />
                        <h1 className="text-3xl font-bold text-gray-800">
                            Tạo Thời Khóa Biểu Tự Động
                        </h1>
                    </div>

                    <div className="flex gap-2 mb-6 border-b">
                        <button
                            onClick={() => setActiveTab('input')}
                            className={`px-4 py-2 font-medium transition ${
                                activeTab === 'input'
                                    ? 'text-blue-600 border-b-2 border-blue-600'
                                    : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            <Settings className="w-4 h-4 inline mr-2" />
                            Cấu hình đầu vào
                        </button>
                        <button
                            onClick={() => setActiveTab('schedule')}
                            disabled={!result}
                            className={`px-4 py-2 font-medium transition ${
                                activeTab === 'schedule'
                                    ? 'text-blue-600 border-b-2 border-blue-600'
                                    : 'text-gray-500 hover:text-gray-700'
                            } ${!result && 'opacity-50 cursor-not-allowed'}`}
                        >
                            <Calendar className="w-4 h-4 inline mr-2" />
                            Thời khóa biểu
                        </button>
                    </div>

                    {activeTab === 'input' && (
                        <div>
                            {/*<label className="block text-sm font-medium text-gray-700 mb-2">*/}
                            {/*    Nhập dữ liệu JSON (courses, teachers, rooms,*/}
                            {/*    configs):*/}
                            {/*</label>*/}
                            {/*<textarea*/}
                            {/*    value={inputData}*/}
                            {/*    onChange={(e) => setInputData(e.target.value)}*/}
                            {/*    className="w-full h-96 p-4 border border-gray-300 rounded-lg font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"*/}
                            {/*    placeholder="Nhập cấu hình JSON..."*/}
                            {/*/>*/}
                            {error && (
                                <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                                    ❌ {error}
                                </div>
                            )}
                            <button
                                onClick={generateSchedule}
                                disabled={loading}
                                className="mt-4 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Đang xử lý...
                                    </>
                                ) : (
                                    <>
                                        <Play className="w-5 h-5" />
                                        Tạo thời khóa biểu
                                    </>
                                )}
                            </button>

                            {result && (
                                <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                                    <h3 className="font-semibold text-green-800 mb-2">
                                        ✅ Thành công!
                                    </h3>
                                    <div className="text-sm text-gray-700 space-y-1">
                                        <p>
                                            Fitness Score:{' '}
                                            <strong>
                                                {result.fitness.toFixed(2)}
                                            </strong>
                                        </p>
                                        <p>
                                            Số thế hệ:{' '}
                                            <strong>
                                                {result.generations}
                                            </strong>
                                        </p>
                                        <p>
                                            Số môn học:{' '}
                                            <strong>
                                                {result.courses.length}
                                            </strong>
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'schedule' && result && (
                        <div>
                            <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg mb-4">
                                <button
                                    onClick={() => handleWeekChange(-1)}
                                    disabled={
                                        currentWeek <=
                                        result.semester.start_week
                                    }
                                    className="px-4 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
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
                                    className="px-4 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
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
                                            { length: PERIODS },
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
                                                            getCellColor(
                                                                classes
                                                            );
                                                        return (
                                                            <td
                                                                key={dayIdx}
                                                                className={`${cellColor} border border-gray-300 p-2 min-w-[120px]`}
                                                            >
                                                                {classes.length >
                                                                    0 && (
                                                                    <div className="text-xs space-y-1 text-white font-medium">
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
                                <h3 className="font-semibold mb-3">
                                    Chú thích:
                                </h3>
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
                </div>
            </div>
        </div>
    );
}
