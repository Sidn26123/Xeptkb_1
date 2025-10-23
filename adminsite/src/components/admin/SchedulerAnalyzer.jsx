import React, { useState } from 'react';
import {
    AlertCircle,
    CheckCircle,
    XCircle,
    Calendar,
    Users,
    Clock,
    AlertTriangle,
} from 'lucide-react';

const ScheduleAnalyzer = () => {
    // Input data
    const courses = [
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
    ];

    const teachers = [
        { id: 1, name: 'Teacher A', can_teach_courses: [101, 102] },
        { id: 2, name: 'Teacher B', can_teach_courses: [102, 103, 104] },
        { id: 3, name: 'Teacher C', can_teach_courses: [104, 105, 106] },
        { id: 4, name: 'Teacher D', can_teach_courses: [106, 107] },
    ];

    const rooms = [
        { id: 1, name: 'Room 101', capacity: 60 },
        { id: 2, name: 'Room 102', capacity: 50 },
        { id: 3, name: 'Room 103', capacity: 40 },
        { id: 4, name: 'Room 201', capacity: 70 },
    ];

    const result = {
        success: true,
        semester: {
            start_week: 1,
            end_week: 10,
            max_concurrent: 4,
        },
        courses: [
            {
                course_id: 106,
                class_id: 6,
                teacher_id: 4,
                room_id: 3,
                start_week: 1,
                end_week: 4,
                duration: 4,
                student_count: 35,
                weekly_slots: [
                    { day: 3, period: 2, duration: 2 },
                    { day: 6, period: 2, duration: 2 },
                ],
            },
            {
                course_id: 107,
                class_id: 7,
                teacher_id: 4,
                room_id: 1,
                start_week: 6,
                end_week: 10,
                duration: 5,
                student_count: 55,
                weekly_slots: [
                    { day: 4, period: 3, duration: 2 },
                    { day: 6, period: 6, duration: 2 },
                    { day: 2, period: 10, duration: 2 },
                ],
            },
            {
                course_id: 104,
                class_id: 4,
                teacher_id: 3,
                room_id: 2,
                start_week: 1,
                end_week: 4,
                duration: 4,
                student_count: 45,
                weekly_slots: [
                    { day: 6, period: 5, duration: 2 },
                    { day: 4, period: 4, duration: 2 },
                ],
            },
            {
                course_id: 102,
                class_id: 2,
                teacher_id: 1,
                room_id: 4,
                start_week: 5,
                end_week: 7,
                duration: 3,
                student_count: 40,
                weekly_slots: [
                    { day: 2, period: 9, duration: 2 },
                    { day: 3, period: 7, duration: 2 },
                ],
            },
            {
                course_id: 101,
                class_id: 1,
                teacher_id: 1,
                room_id: 1,
                start_week: 1,
                end_week: 4,
                duration: 4,
                student_count: 50,
                weekly_slots: [
                    { day: 2, period: 3, duration: 2 },
                    { day: 6, period: 4, duration: 2 },
                ],
            },
            {
                course_id: 105,
                class_id: 5,
                teacher_id: 3,
                room_id: 1,
                start_week: 5,
                end_week: 7,
                duration: 3,
                student_count: 50,
                weekly_slots: [
                    { day: 2, period: 5, duration: 2 },
                    { day: 6, period: 1, duration: 2 },
                ],
            },
            {
                course_id: 104,
                class_id: 4,
                teacher_id: 2,
                room_id: 2,
                start_week: 6,
                end_week: 9,
                duration: 4,
                student_count: 45,
                weekly_slots: [
                    { day: 5, period: 8, duration: 2 },
                    { day: 7, period: 3, duration: 2 },
                ],
            },
        ],
        fitness: 18,
        generations: 4,
    };

    const [activeTab, setActiveTab] = useState('violations');

    // Analysis functions
    const analyzeSchedule = () => {
        const violations = [];
        const warnings = [];
        const stats = {
            totalCourses: result.courses.length,
            totalSessions: 0,
            totalHours: 0,
        };

        // Check missing courses
        const scheduledCourseIds = new Set(
            result.courses.map((c) => c.course_id)
        );
        const missingCourses = courses.filter(
            (c) => !scheduledCourseIds.has(c.course_id)
        );

        if (missingCourses.length > 0) {
            violations.push({
                type: 'MISSING_COURSES',
                severity: 'critical',
                message: `${missingCourses.length} môn học chưa được xếp lịch`,
                details: missingCourses.map((c) => `Course ${c.course_id}`),
            });
        }

        // Check each scheduled course
        result.courses.forEach((scheduled) => {
            const courseInfo = courses.find(
                (c) => c.course_id === scheduled.course_id
            );
            if (!courseInfo) return;

            const expectedSessions =
                courseInfo.weeks_needed * courseInfo.sessions_per_week;
            const scheduledSessions =
                scheduled.weekly_slots.length * scheduled.duration;
            const expectedHours =
                expectedSessions * courseInfo.duration_per_session;
            const scheduledHours =
                scheduled.weekly_slots.reduce(
                    (sum, slot) => sum + slot.duration,
                    0
                ) * scheduled.duration;

            stats.totalSessions += scheduledSessions;
            stats.totalHours += scheduledHours;

            // Check missing sessions
            if (scheduledHours < expectedHours) {
                violations.push({
                    type: 'INSUFFICIENT_HOURS',
                    severity: 'critical',
                    message: `Course ${scheduled.course_id} thiếu tiết học`,
                    details: [
                        `Cần: ${expectedHours} tiết, Có: ${scheduledHours} tiết`,
                    ],
                });
            }

            // Check duration mismatch
            if (scheduled.duration !== courseInfo.weeks_needed) {
                warnings.push({
                    type: 'DURATION_MISMATCH',
                    severity: 'warning',
                    message: `Course ${scheduled.course_id} thời gian không khớp`,
                    details: [
                        `Cần: ${courseInfo.weeks_needed} tuần, Có: ${scheduled.duration} tuần`,
                    ],
                });
            }

            // Check sessions per week
            if (
                scheduled.weekly_slots.length !== courseInfo.sessions_per_week
            ) {
                warnings.push({
                    type: 'SESSIONS_MISMATCH',
                    severity: 'warning',
                    message: `Course ${scheduled.course_id} số buổi/tuần không khớp`,
                    details: [
                        `Cần: ${courseInfo.sessions_per_week} buổi, Có: ${scheduled.weekly_slots.length} buổi`,
                    ],
                });
            }

            // Check room capacity
            const room = rooms.find((r) => r.id === scheduled.room_id);
            if (room && scheduled.student_count > room.capacity) {
                violations.push({
                    type: 'ROOM_CAPACITY',
                    severity: 'critical',
                    message: `Course ${scheduled.course_id} vượt sức chứa phòng`,
                    details: [
                        `${scheduled.student_count} SV > ${room.capacity} chỗ (${room.name})`,
                    ],
                });
            }

            // Check teacher assignment
            const teacher = teachers.find((t) => t.id === scheduled.teacher_id);
            if (
                teacher &&
                !teacher.can_teach_courses.includes(scheduled.course_id)
            ) {
                violations.push({
                    type: 'INVALID_TEACHER',
                    severity: 'critical',
                    message: `Course ${scheduled.course_id} giáo viên không đủ năng lực`,
                    details: [
                        `${teacher.name} không thể dạy Course ${scheduled.course_id}`,
                    ],
                });
            }
        });

        // Check time conflicts
        const conflicts = checkTimeConflicts();
        violations.push(...conflicts.violations);
        warnings.push(...conflicts.warnings);

        return { violations, warnings, stats };
    };

    const checkTimeConflicts = () => {
        const violations = [];
        const warnings = [];

        // Group courses by week
        for (
            let week = result.semester.start_week;
            week <= result.semester.end_week;
            week++
        ) {
            const coursesInWeek = result.courses.filter(
                (c) => c.start_week <= week && c.end_week >= week
            );

            // Check teacher conflicts
            const teacherSlots = {};
            coursesInWeek.forEach((course) => {
                course.weekly_slots.forEach((slot) => {
                    const key = `${course.teacher_id}-${slot.day}-${slot.period}`;
                    if (!teacherSlots[key]) teacherSlots[key] = [];
                    teacherSlots[key].push(course.course_id);
                });
            });

            Object.entries(teacherSlots).forEach(([key, courseIds]) => {
                if (courseIds.length > 1) {
                    const [teacherId, day, period] = key.split('-');
                    const teacher = teachers.find(
                        (t) => t.id === parseInt(teacherId)
                    );
                    violations.push({
                        type: 'TEACHER_CONFLICT',
                        severity: 'critical',
                        message: `${teacher?.name || 'Teacher ' + teacherId} bị trùng lịch`,
                        details: [
                            `Tuần ${week}, Thứ ${day}, Tiết ${period}: Courses ${courseIds.join(', ')}`,
                        ],
                    });
                }
            });

            // Check room conflicts
            const roomSlots = {};
            coursesInWeek.forEach((course) => {
                course.weekly_slots.forEach((slot) => {
                    const key = `${course.room_id}-${slot.day}-${slot.period}`;
                    if (!roomSlots[key]) roomSlots[key] = [];
                    roomSlots[key].push(course.course_id);
                });
            });

            Object.entries(roomSlots).forEach(([key, courseIds]) => {
                if (courseIds.length > 1) {
                    const [roomId, day, period] = key.split('-');
                    const room = rooms.find((r) => r.id === parseInt(roomId));
                    violations.push({
                        type: 'ROOM_CONFLICT',
                        severity: 'critical',
                        message: `${room?.name || 'Room ' + roomId} bị trùng lịch`,
                        details: [
                            `Tuần ${week}, Thứ ${day}, Tiết ${period}: Courses ${courseIds.join(', ')}`,
                        ],
                    });
                }
            });
        }

        return { violations, warnings };
    };

    const getInsights = () => {
        const insights = [];

        // Course load distribution
        const coursesByWeek = {};
        for (
            let w = result.semester.start_week;
            w <= result.semester.end_week;
            w++
        ) {
            coursesByWeek[w] = result.courses.filter(
                (c) => c.start_week <= w && c.end_week >= w
            ).length;
        }

        const maxLoad = Math.max(...Object.values(coursesByWeek));
        const minLoad = Math.min(...Object.values(coursesByWeek));

        insights.push({
            title: 'Phân bố tải',
            value: `${minLoad}-${maxLoad} môn/tuần`,
            description: `Tải cao nhất: ${maxLoad} môn, thấp nhất: ${minLoad} môn`,
        });

        // Teacher workload
        const teacherLoads = {};
        result.courses.forEach((c) => {
            teacherLoads[c.teacher_id] = (teacherLoads[c.teacher_id] || 0) + 1;
        });

        const avgLoad =
            Object.values(teacherLoads).reduce((a, b) => a + b, 0) /
            teachers.length;
        insights.push({
            title: 'Khối lượng giảng dạy',
            value: `${avgLoad.toFixed(1)} môn/GV`,
            description: `Từ ${Math.min(...Object.values(teacherLoads))} đến ${Math.max(...Object.values(teacherLoads))} môn`,
        });

        // Room utilization
        const roomUsage = {};
        result.courses.forEach((c) => {
            const slots = c.weekly_slots.length * c.duration;
            roomUsage[c.room_id] = (roomUsage[c.room_id] || 0) + slots;
        });

        const totalSlots = Object.values(roomUsage).reduce((a, b) => a + b, 0);
        insights.push({
            title: 'Sử dụng phòng',
            value: `${totalSlots} buổi học`,
            description: `${rooms.length} phòng được sử dụng`,
        });

        // Fitness score interpretation
        const fitnessLevel =
            result.fitness < 10
                ? 'Xuất sắc'
                : result.fitness < 30
                  ? 'Tốt'
                  : result.fitness < 50
                    ? 'Chấp nhận được'
                    : 'Cần cải thiện';
        insights.push({
            title: 'Điểm đánh giá',
            value: fitnessLevel,
            description: `Fitness: ${result.fitness} (${result.generations} thế hệ)`,
        });

        return insights;
    };

    const analysis = analyzeSchedule();
    const insights = getInsights();

    return (
        <div className="w-full max-w-6xl mx-auto p-6 bg-gray-50">
            <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">
                    Phân Tích Kết Quả Xếp TKB
                </h1>
                <p className="text-gray-600">
                    Kiểm tra tính hợp lệ và đánh giá chất lượng thời khóa biểu
                </p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-lg shadow p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-500 text-sm">
                                Vi phạm nghiêm trọng
                            </p>
                            <p className="text-3xl font-bold text-red-600">
                                {analysis.violations.length}
                            </p>
                        </div>
                        <XCircle className="w-12 h-12 text-red-600 opacity-20" />
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-500 text-sm">Cảnh báo</p>
                            <p className="text-3xl font-bold text-yellow-600">
                                {analysis.warnings.length}
                            </p>
                        </div>
                        <AlertTriangle className="w-12 h-12 text-yellow-600 opacity-20" />
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-500 text-sm">
                                Môn học đã xếp
                            </p>
                            <p className="text-3xl font-bold text-blue-600">
                                {analysis.stats.totalCourses}
                            </p>
                        </div>
                        <Calendar className="w-12 h-12 text-blue-600 opacity-20" />
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-500 text-sm">
                                Tổng số tiết
                            </p>
                            <p className="text-3xl font-bold text-green-600">
                                {analysis.stats.totalHours}
                            </p>
                        </div>
                        <Clock className="w-12 h-12 text-green-600 opacity-20" />
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-lg shadow-lg mb-6">
                <div className="border-b border-gray-200">
                    <div className="flex space-x-4 px-6">
                        <button
                            onClick={() => setActiveTab('violations')}
                            className={`py-4 px-4 border-b-2 font-medium text-sm ${
                                activeTab === 'violations'
                                    ? 'border-red-500 text-red-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            Vi phạm ({analysis.violations.length})
                        </button>
                        <button
                            onClick={() => setActiveTab('warnings')}
                            className={`py-4 px-4 border-b-2 font-medium text-sm ${
                                activeTab === 'warnings'
                                    ? 'border-yellow-500 text-yellow-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            Cảnh báo ({analysis.warnings.length})
                        </button>
                        <button
                            onClick={() => setActiveTab('insights')}
                            className={`py-4 px-4 border-b-2 font-medium text-sm ${
                                activeTab === 'insights'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            Thông tin chi tiết
                        </button>
                    </div>
                </div>

                <div className="p-6">
                    {activeTab === 'violations' && (
                        <div>
                            {analysis.violations.length === 0 ? (
                                <div className="text-center py-12">
                                    <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                                    <p className="text-xl font-semibold text-green-600">
                                        Không có vi phạm nghiêm trọng!
                                    </p>
                                    <p className="text-gray-600 mt-2">
                                        Thời khóa biểu hợp lệ và đáp ứng các
                                        ràng buộc bắt buộc
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {analysis.violations.map((v, idx) => (
                                        <div
                                            key={idx}
                                            className="border-l-4 border-red-500 bg-red-50 p-4 rounded"
                                        >
                                            <div className="flex items-start">
                                                <XCircle className="w-5 h-5 text-red-600 mt-0.5 mr-3" />
                                                <div className="flex-1">
                                                    <p className="font-semibold text-red-800">
                                                        {v.message}
                                                    </p>
                                                    <ul className="mt-2 text-sm text-red-700 space-y-1">
                                                        {v.details.map(
                                                            (d, i) => (
                                                                <li key={i}>
                                                                    • {d}
                                                                </li>
                                                            )
                                                        )}
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'warnings' && (
                        <div>
                            {analysis.warnings.length === 0 ? (
                                <div className="text-center py-12">
                                    <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                                    <p className="text-xl font-semibold text-green-600">
                                        Không có cảnh báo!
                                    </p>
                                    <p className="text-gray-600 mt-2">
                                        Tất cả các thông số đều ổn
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {analysis.warnings.map((w, idx) => (
                                        <div
                                            key={idx}
                                            className="border-l-4 border-yellow-500 bg-yellow-50 p-4 rounded"
                                        >
                                            <div className="flex items-start">
                                                <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 mr-3" />
                                                <div className="flex-1">
                                                    <p className="font-semibold text-yellow-800">
                                                        {w.message}
                                                    </p>
                                                    <ul className="mt-2 text-sm text-yellow-700 space-y-1">
                                                        {w.details.map(
                                                            (d, i) => (
                                                                <li key={i}>
                                                                    • {d}
                                                                </li>
                                                            )
                                                        )}
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'insights' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {insights.map((insight, idx) => (
                                <div
                                    key={idx}
                                    className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow"
                                >
                                    <h3 className="text-lg font-semibold text-gray-800 mb-2">
                                        {insight.title}
                                    </h3>
                                    <p className="text-3xl font-bold text-blue-600 mb-2">
                                        {insight.value}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        {insight.description}
                                    </p>
                                </div>
                            ))}

                            <div className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow md:col-span-2">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                                    Phân bố môn học theo tuần
                                </h3>
                                <div className="flex items-end space-x-2 h-32">
                                    {Object.entries(
                                        result.schedule_summary
                                            ?.concurrent_load || {}
                                    ).map(([week, count]) => (
                                        <div
                                            key={week}
                                            className="flex-1 flex flex-col items-center"
                                        >
                                            <div
                                                className={`w-full rounded-t transition-all ${
                                                    count > 3
                                                        ? 'bg-red-500'
                                                        : count > 2
                                                          ? 'bg-yellow-500'
                                                          : 'bg-green-500'
                                                }`}
                                                style={{
                                                    height: `${(count / 4) * 100}%`,
                                                }}
                                            />
                                            <span className="text-xs text-gray-600 mt-2">
                                                {week}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                                <p className="text-sm text-gray-600 mt-4">
                                    <span className="inline-block w-3 h-3 bg-green-500 rounded mr-2">
                                        Nhẹ (≤2 môn)
                                    </span>

                                    <span className="inline-block w-3 h-3 bg-yellow-500 rounded ml-4 mr-2">
                                        Vừa (3 môn)
                                    </span>
                                    <span className="inline-block w-3 h-3 bg-red-500 rounded ml-4 mr-2">
                                        Cao (tren 3 môn)
                                    </span>
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ScheduleAnalyzer;
