import React, { useState, useMemo } from 'react';
import {
    AlertCircle,
    CheckCircle,
    XCircle,
    Calendar,
    Users,
    Clock,
    AlertTriangle,
    Activity,
    BarChart3,
    CheckSquare
} from 'lucide-react';

const ScheduleAnalyzer = ({ courses, teachers, rooms, result }) => {
    const [activeTab, setActiveTab] = useState('violations');

    // Helper: Lấy tên từ ID (Vì result chỉ trả về ID)
    const getCourseName = (id) => courses.find(c => c.id === id)?.name || `Course ${id}`;
    const getTeacherName = (id) => teachers.find(t => t.id === id)?.name || `Teacher ${id}`;
    const getRoomName = (id) => rooms.find(r => r.id === id)?.name || `Room ${id}`;

    // --- Main Analysis Logic ---
    const analysis = useMemo(() => {
        if (!result || !result.courses) return null;

        const violations = [];
        const warnings = [];
        const stats = {
            totalScheduled: result.courses.length,
            totalInputCourses: courses.length,
            totalStudents: 0,
            utilizationRate: 0
        };

        // 1. Kiểm tra môn học còn thiếu
        const scheduledIds = new Set(result.courses.map(c => c.course_id));
        const missing = courses.filter(c => !scheduledIds.has(c.id));

        if (missing.length > 0) {
            violations.push({
                type: 'MISSING_COURSES',
                severity: 'critical',
                message: `${missing.length} môn học chưa được xếp lịch`,
                details: missing.map(c => `${c.name} (ID: ${c.id})`)
            });
        }

        // Map để check conflict
        const teacherTimeMap = new Map(); // key: teacherId-week-day-period
        const roomTimeMap = new Map();    // key: roomId-week-day-period

        // 2. Duyệt qua từng môn đã xếp
        result.courses.forEach(scheduled => {
            // Lấy thông tin gốc từ props đầu vào
            const inputCourse = courses.find(c => c.id === scheduled.course_id);
            const room = rooms.find(r => r.id === scheduled.room_id);
            const teacher = teachers.find(t => t.id === scheduled.teacher_id);

            if (!inputCourse) return;

            // Cộng dồn thống kê (Lấy student_count từ inputCourse vì result không có)
            const studentCount = inputCourse.student_count || inputCourse.total_enrollment || 0;
            stats.totalStudents += studentCount;

            // --- A. Kiểm tra Sức chứa (Capacity) ---
            // Ưu tiên check capacity_max, fallback về capacity
            const roomCapacity = room ? (room.capacity_max || room.capacity) : 0;

            if (room && studentCount > roomCapacity) {
                violations.push({
                    type: 'CAPACITY_OVERFLOW',
                    severity: 'critical',
                    message: `Quá tải phòng học: ${inputCourse.name}`,
                    details: [
                        `Phòng ${room.name} (Sức chứa: ${roomCapacity})`,
                        `Sĩ số: ${studentCount}`,
                        `Vượt quá: ${studentCount - roomCapacity} sinh viên`
                    ]
                });
            }

            // --- B. Kiểm tra Giáo viên ---
            // Nếu input yêu cầu GV cố định mà kết quả khác
            if (inputCourse.teacher_id && inputCourse.teacher_id !== scheduled.teacher_id) {
                warnings.push({
                    type: 'TEACHER_MISMATCH',
                    severity: 'warning',
                    message: `Thay đổi giáo viên: ${inputCourse.name}`,
                    details: [
                        `Yêu cầu: ${getTeacherName(inputCourse.teacher_id)}`,
                        `Được xếp: ${getTeacherName(scheduled.teacher_id)}`
                    ]
                });
            }

            // --- C. Xây dựng Map Check Trùng Lịch ---
            scheduled.weekly_slots.forEach(slot => {
                // Loop qua các tuần học
                for (let w = scheduled.start_week; w <= scheduled.end_week; w++) {
                    // Loop qua các tiết trong slot
                    for (let p = 0; p < slot.duration; p++) {
                        const currentPeriod = slot.period + p;

                        // Check Teacher
                        const tKey = `${scheduled.teacher_id}-${w}-${slot.day}-${currentPeriod}`;
                        if (teacherTimeMap.has(tKey)) {
                            teacherTimeMap.get(tKey).push(scheduled.course_id);
                        } else {
                            teacherTimeMap.set(tKey, [scheduled.course_id]);
                        }

                        // Check Room
                        const rKey = `${scheduled.room_id}-${w}-${slot.day}-${currentPeriod}`;
                        if (roomTimeMap.has(rKey)) {
                            roomTimeMap.get(rKey).push(scheduled.course_id);
                        } else {
                            roomTimeMap.set(rKey, [scheduled.course_id]);
                        }
                    }
                }
            });
        });

        // 3. Tổng hợp Conflict từ Map

        // Conflict Giáo viên
        teacherTimeMap.forEach((courseIds, key) => {
            const uniqueCourses = [...new Set(courseIds)];
            if (uniqueCourses.length > 1) {
                const [tId, week, day, period] = key.split('-');
                violations.push({
                    type: 'TEACHER_CONFLICT',
                    severity: 'critical',
                    message: `Trùng lịch Giáo viên: ${getTeacherName(parseInt(tId))}`,
                    details: [
                        `Tuần ${week}, Thứ ${day}, Tiết ${period}`,
                        `Các môn: ${uniqueCourses.map(id => getCourseName(id)).join(', ')}`
                    ]
                });
            }
        });

        // Conflict Phòng
        roomTimeMap.forEach((courseIds, key) => {
            const uniqueCourses = [...new Set(courseIds)];
            if (uniqueCourses.length > 1) {
                const [rId, week, day, period] = key.split('-');
                violations.push({
                    type: 'ROOM_CONFLICT',
                    severity: 'critical',
                    message: `Trùng lịch Phòng: ${getRoomName(parseInt(rId))}`,
                    details: [
                        `Tuần ${week}, Thứ ${day}, Tiết ${period}`,
                        `Các môn: ${uniqueCourses.map(id => getCourseName(id)).join(', ')}`
                    ]
                });
            }
        });

        // Lọc bớt duplicate message (do trùng nhiều tiết liên tiếp)
        const uniqueViolations = violations.filter((v, i, a) =>
            a.findIndex(t => t.message === v.message && t.details[0] === v.details[0]) === i
        );

        return { violations: uniqueViolations, warnings, stats };
    }, [courses, teachers, rooms, result]);

    if (!result) return null;
    if (!analysis) return <div className="p-6 text-center">Đang phân tích dữ liệu...</div>;

    return (
        <div className="w-full max-w-7xl mx-auto p-6 bg-slate-50 min-h-screen font-sans text-slate-800">
            {/* Header */}
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-slate-200">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800 mb-2">
                            Kết Quả Xếp Thời Khóa Biểu
                        </h1>
                        <div className="flex flex-wrap gap-3 text-sm text-slate-500">
                            <Badge icon={Activity} label={`Fitness: ${result.final_fitness?.toFixed(2) || 0}`} />
                            <span className="text-slate-300">|</span>
                            <Badge icon={Clock} label={`Runtime: ${result.total_time_seconds?.toFixed(2) || 0}s`} />
                            {result.schedule_summary?.total_courses && (
                                <>
                                    <span className="text-slate-300">|</span>
                                    <Badge icon={CheckSquare} label={`Courses: ${result.schedule_summary.total_courses}`} />
                                </>
                            )}
                        </div>
                    </div>
                    <div className={`px-4 py-2 rounded-lg font-semibold border ${result.success ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                        {result.success ? 'Xếp lịch thành công' : 'Thất bại / Chưa tối ưu'}
                    </div>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <KpiCard
                    label="Vi phạm (Critical)"
                    value={analysis.violations.length}
                    icon={XCircle}
                    color="red"
                    subText={analysis.violations.length === 0 ? "Hợp lệ" : "Cần xử lý"}
                />
                <KpiCard
                    label="Cảnh báo (Warning)"
                    value={analysis.warnings.length}
                    icon={AlertTriangle}
                    color="yellow"
                    subText="Kiểm tra lại logic"
                />
                <KpiCard
                    label="Độ phủ môn học"
                    value={`${analysis.stats.totalScheduled}/${analysis.stats.totalInputCourses}`}
                    icon={Calendar}
                    color="blue"
                    subText={Math.round((analysis.stats.totalScheduled/analysis.stats.totalInputCourses)*100) + "% hoàn thành"}
                />
                <KpiCard
                    label="Tổng sinh viên"
                    value={analysis.stats.totalStudents}
                    icon={Users}
                    color="green"
                    subText="Đang phục vụ"
                />
            </div>

            {/* Tabs & Content */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-6">
                <div className="flex border-b border-slate-200 overflow-x-auto">
                    <TabButton
                        active={activeTab === 'violations'}
                        onClick={() => setActiveTab('violations')}
                        count={analysis.violations.length}
                        color="red"
                    >
                        Vi phạm
                    </TabButton>
                    <TabButton
                        active={activeTab === 'warnings'}
                        onClick={() => setActiveTab('warnings')}
                        count={analysis.warnings.length}
                        color="yellow"
                    >
                        Cảnh báo
                    </TabButton>
                    <TabButton
                        active={activeTab === 'insights'}
                        onClick={() => setActiveTab('insights')}
                        color="blue"
                    >
                        Phân tích tải & Penalty
                    </TabButton>
                </div>

                <div className="p-6">
                    {activeTab === 'violations' && (
                        <IssueList issues={analysis.violations} type="error" emptyMsg="Tuyệt vời! Không có vi phạm ràng buộc cứng." />
                    )}
                    {activeTab === 'warnings' && (
                        <IssueList issues={analysis.warnings} type="warning" emptyMsg="Không có cảnh báo nào." />
                    )}
                    {activeTab === 'insights' && (
                        <InsightView result={result} />
                    )}
                </div>
            </div>
        </div>
    );
};

// --- Sub Components ---

const Badge = ({ icon: Icon, label }) => (
    <span className="flex items-center gap-1.5">
        <Icon size={14} className="text-slate-400" />
        {label}
    </span>
);

const KpiCard = ({ label, value, icon: Icon, color, subText }) => {
    const styles = {
        red: "text-red-600 bg-red-50 border-red-100",
        yellow: "text-yellow-600 bg-yellow-50 border-yellow-100",
        blue: "text-blue-600 bg-blue-50 border-blue-100",
        green: "text-emerald-600 bg-emerald-50 border-emerald-100"
    };

    return (
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-2">
                <p className="text-slate-500 text-sm font-medium">{label}</p>
                <div className={`p-2 rounded-lg ${styles[color]}`}>
                    <Icon size={20} />
                </div>
            </div>
            <p className="text-2xl font-bold text-slate-800">{value}</p>
            <p className="text-xs text-slate-400 mt-1">{subText}</p>
        </div>
    );
};

const TabButton = ({ active, onClick, children, count, color }) => {
    let activeStyle = "border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50";
    if (active) {
        if (color === 'red') activeStyle = "border-red-500 text-red-700 bg-red-50/50";
        else if (color === 'yellow') activeStyle = "border-yellow-500 text-yellow-700 bg-yellow-50/50";
        else activeStyle = "border-blue-500 text-blue-700 bg-blue-50/50";
    }

    return (
        <button
            onClick={onClick}
            className={`flex-1 py-4 px-6 text-sm font-semibold border-b-2 transition-all flex justify-center items-center gap-2 whitespace-nowrap ${activeStyle}`}
        >
            {children}
            {count > 0 && (
                <span className={`px-2 py-0.5 rounded-full text-xs ${
                    color === 'red' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                }`}>
                    {count}
                </span>
            )}
        </button>
    );
};

const IssueList = ({ issues, type, emptyMsg }) => {
    if (issues.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center">
                <CheckCircle className="w-16 h-16 text-emerald-300 mb-4" />
                <p className="text-lg font-medium text-slate-700">{emptyMsg}</p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {issues.map((issue, idx) => (
                <div key={idx} className={`p-4 rounded-lg border-l-4 ${
                    type === 'error' ? 'bg-red-50 border-red-500' : 'bg-yellow-50 border-yellow-500'
                }`}>
                    <div className="flex items-start gap-3">
                        {type === 'error'
                            ? <XCircle className="w-5 h-5 text-red-600 mt-0.5" />
                            : <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                        }
                        <div>
                            <h3 className={`font-semibold ${type === 'error' ? 'text-red-800' : 'text-yellow-800'}`}>
                                {issue.message}
                            </h3>
                            <ul className={`mt-2 space-y-1 text-sm ${type === 'error' ? 'text-red-700' : 'text-yellow-700'}`}>
                                {issue.details.map((d, i) => <li key={i}>• {d}</li>)}
                            </ul>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

const InsightView = ({ result }) => {
    // Xử lý dữ liệu concurrent_load từ JSON
    const loadData = result.schedule_summary?.concurrent_load || {};
    // Chuyển object {"6": 1, ...} thành mảng để sort
    const sortedWeeks = Object.keys(loadData).sort((a, b) => parseInt(a) - parseInt(b));
    const maxLoad = Math.max(...Object.values(loadData), 1);
    const maxConcurrentLimit = result.semester?.max_concurrent || 4;

    return (
        <div className="space-y-8">
            {/* Chart: Phân bố tải theo tuần */}
            <div>
                <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-indigo-600" />
                    Phân bố tải theo tuần (Concurrent Load)
                </h3>
                <div className="bg-white p-6 rounded-lg border border-slate-200 overflow-x-auto">
                    <div className="flex items-end gap-2 h-48 min-w-[600px]">
                        {sortedWeeks.map(week => {
                            const count = loadData[week];
                            const heightPercentage = Math.max((count / maxLoad) * 100, 10); // Min 10% height
                            const isOverloaded = count > maxConcurrentLimit;

                            return (
                                <div key={week} className="flex-1 flex flex-col items-center group relative min-w-[30px]">
                                    {/* Tooltip */}
                                    <div className="absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 text-white text-xs py-1 px-2 rounded pointer-events-none whitespace-nowrap z-10">
                                        Tuần {week}: {count} môn
                                    </div>

                                    {/* Bar */}
                                    <div
                                        style={{ height: `${heightPercentage}%` }}
                                        className={`w-full rounded-t-md transition-all relative ${
                                            isOverloaded ? 'bg-red-400 hover:bg-red-500' : 'bg-indigo-400 hover:bg-indigo-500'
                                        }`}
                                    >
                                        <span className="absolute top-1 left-1/2 -translate-x-1/2 text-[10px] text-white font-bold">
                                            {count}
                                        </span>
                                    </div>

                                    {/* Label */}
                                    <span className="text-xs text-slate-500 mt-2 font-medium">W{week}</span>
                                </div>
                            );
                        })}
                    </div>
                    <div className="mt-4 flex gap-6 text-sm justify-center">
                        <div className="flex items-center gap-2">
                            <span className="w-3 h-3 bg-indigo-400 rounded"></span>
                            <span className="text-slate-600">Trong giới hạn (≤ {maxConcurrentLimit})</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="w-3 h-3 bg-red-400 rounded"></span>
                            <span className="text-slate-600">Quá tải</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Penalty Breakdown */}
                <div className="border border-slate-200 rounded-xl p-5 bg-white">
                    <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <Activity className="w-5 h-5 text-orange-500" />
                        Chi tiết điểm phạt (Penalty)
                    </h3>
                    <div className="space-y-3">
                        {Object.keys(result.penalty_breakdown || {}).length === 0 ? (
                            <p className="text-slate-400 italic text-center py-4">Không có penalty (Điểm tuyệt đối 0)</p>
                        ) : (
                            Object.entries(result.penalty_breakdown).map(([key, val]) => (
                                <div key={key} className="flex justify-between items-center text-sm p-2 bg-slate-50 rounded hover:bg-slate-100 transition-colors">
                                    <span className="text-slate-700 font-medium">{key}</span>
                                    <span className="font-mono font-bold text-red-600">-{val}</span>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Phase Results (Nếu có) */}
                {result.phase_results && (
                    <div className="border border-slate-200 rounded-xl p-5 bg-white">
                        <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <Clock className="w-5 h-5 text-blue-500" />
                            Tiến trình thuật toán
                        </h3>
                        <div className="space-y-3">
                            {Object.entries(result.phase_results).map(([phase, data]) => (
                                <div key={phase} className="flex items-center justify-between text-sm p-3 border border-slate-100 rounded-lg">
                                    <div className="flex flex-col">
                                        <span className="font-bold text-slate-700 capitalize">{phase}</span>
                                        <span className="text-xs text-slate-400">Generations: {data.generations}</span>
                                    </div>
                                    <div className={`px-3 py-1 rounded-full text-xs font-bold ${data.success ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                                        Fitness: {data.fitness.toFixed(1)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ScheduleAnalyzer;