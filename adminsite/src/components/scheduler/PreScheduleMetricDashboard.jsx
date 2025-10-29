import React, { useState } from 'react';
import { AlertCircle, Users, BookOpen, Home, GraduationCap, TrendingUp, AlertTriangle, CheckCircle, Calendar, BarChart3, PieChart, Activity } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, PieChart as RePieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter, ComposedChart, Area } from 'recharts';

const ScheduleMetricsDashboard = () => {
    const [activeTab, setActiveTab] = useState('overview');

    // Sample data
    const data = {
        "timestamp": "2025-10-25T17:12:13.429Z",
        "overview": {
            "totalCourses": 7,
            "totalTeachers": 4,
            "totalRooms": 4,
            "totalDepartments": 2,
            "totalClasses": 6,
            "totalWeeklyHoursNeeded": 32,
            "totalWeeklySessionsNeeded": 16,
            "totalSlotsPerWeek": 84,
            "utilizationRatio": 0.381,
            "avgStudentsPerCourse": 47.9,
            "semesterWeeks": 15,
            "maxConcurrentCourses": 4
        },
        "byCourse": [
            {
                "id": 1,
                "course_id": 101,
                "student_count": 50,
                "weeks_needed": 4,
                "sessions_per_week": 2,
                "duration_per_session": 2,
                "weeklyHours": 4,
                "totalHoursAcrossSemester": 16,
                "possibleTeachers": [{"id": 1, "name": "Teacher A"}],
                "teacherCoverage": 1,
                "roomFitCount": 3,
                "sessionSlotsNeeded": 2
            },
            {
                "id": 2,
                "course_id": 102,
                "student_count": 40,
                "weeks_needed": 3,
                "sessions_per_week": 2,
                "duration_per_session": 2,
                "weeklyHours": 4,
                "totalHoursAcrossSemester": 12,
                "possibleTeachers": [{"id": 1, "name": "Teacher A"}, {"id": 2, "name": "Teacher B"}],
                "teacherCoverage": 2,
                "roomFitCount": 4,
                "sessionSlotsNeeded": 2
            },
            {
                "id": 3,
                "course_id": 103,
                "student_count": 60,
                "weeks_needed": 5,
                "sessions_per_week": 3,
                "duration_per_session": 2,
                "weeklyHours": 6,
                "totalHoursAcrossSemester": 30,
                "possibleTeachers": [{"id": 2, "name": "Teacher B"}],
                "teacherCoverage": 1,
                "roomFitCount": 2,
                "sessionSlotsNeeded": 3
            },
            {
                "id": 4,
                "course_id": 104,
                "student_count": 45,
                "weeks_needed": 4,
                "sessions_per_week": 2,
                "duration_per_session": 2,
                "weeklyHours": 4,
                "totalHoursAcrossSemester": 16,
                "possibleTeachers": [{"id": 2, "name": "Teacher B"}, {"id": 3, "name": "Teacher C"}],
                "teacherCoverage": 2,
                "roomFitCount": 3,
                "sessionSlotsNeeded": 2
            },
            {
                "id": 5,
                "course_id": 105,
                "student_count": 50,
                "weeks_needed": 3,
                "sessions_per_week": 2,
                "duration_per_session": 2,
                "weeklyHours": 4,
                "totalHoursAcrossSemester": 12,
                "possibleTeachers": [{"id": 3, "name": "Teacher C"}],
                "teacherCoverage": 1,
                "roomFitCount": 3,
                "sessionSlotsNeeded": 2
            },
            {
                "id": 6,
                "course_id": 106,
                "student_count": 35,
                "weeks_needed": 4,
                "sessions_per_week": 2,
                "duration_per_session": 2,
                "weeklyHours": 4,
                "totalHoursAcrossSemester": 16,
                "possibleTeachers": [{"id": 3, "name": "Teacher C"}, {"id": 4, "name": "Teacher D"}],
                "teacherCoverage": 2,
                "roomFitCount": 4,
                "sessionSlotsNeeded": 2
            },
            {
                "id": 7,
                "course_id": 107,
                "student_count": 55,
                "weeks_needed": 5,
                "sessions_per_week": 3,
                "duration_per_session": 2,
                "weeklyHours": 6,
                "totalHoursAcrossSemester": 30,
                "possibleTeachers": [{"id": 4, "name": "Teacher D"}],
                "teacherCoverage": 1,
                "roomFitCount": 2,
                "sessionSlotsNeeded": 3
            }
        ],
        "feasibility": {
            "hardFeasibilityRatio": 1,
            "avgTeacherCoverage": 1.43,
            "avgRoomFit": 3,
            "feasibilitySummary": {
                "status": "good",
                "criticalIssues": 0,
                "highIssues": 4,
                "mediumIssues": 0
            },
            "potentialBottlenecks": [
                {"type": "course-teacher", "entity": "Course 101", "issue": "Chỉ có 1 giáo viên có thể dạy", "severity": "high"},
                {"type": "course-teacher", "entity": "Course 103", "issue": "Chỉ có 1 giáo viên có thể dạy", "severity": "high"},
                {"type": "course-teacher", "entity": "Course 105", "issue": "Chỉ có 1 giáo viên có thể dạy", "severity": "high"},
                {"type": "course-teacher", "entity": "Course 107", "issue": "Chỉ có 1 giáo viên có thể dạy", "severity": "high"}
            ]
        },
        "byTeacher": [
            {"id": 1, "name": "Teacher A", "canTeachCoursesCount": 2, "estimatedWeeklyTeachingHours": 8, "utilizationRate": 0.095, "estimatedWeeklySessions": 4, "maxCapacity": 50.4},
            {"id": 2, "name": "Teacher B", "canTeachCoursesCount": 3, "estimatedWeeklyTeachingHours": 14, "utilizationRate": 0.167, "estimatedWeeklySessions": 7, "maxCapacity": 50.4},
            {"id": 3, "name": "Teacher C", "canTeachCoursesCount": 3, "estimatedWeeklyTeachingHours": 12, "utilizationRate": 0.143, "estimatedWeeklySessions": 6, "maxCapacity": 50.4},
            {"id": 4, "name": "Teacher D", "canTeachCoursesCount": 2, "estimatedWeeklyTeachingHours": 10, "utilizationRate": 0.119, "estimatedWeeklySessions": 5, "maxCapacity": 50.4}
        ],
        "byRoom": [
            {"id": 1, "name": "Room 101", "capacity": 60, "suitableForCoursesCount": 7, "percentageCoverage": 100},
            {"id": 2, "name": "Room 102", "capacity": 50, "suitableForCoursesCount": 5, "percentageCoverage": 71.4},
            {"id": 3, "name": "Room 103", "capacity": 40, "suitableForCoursesCount": 2, "percentageCoverage": 28.6},
            {"id": 4, "name": "Room 201", "capacity": 70, "suitableForCoursesCount": 7, "percentageCoverage": 100}
        ],
        "advancedMetrics": {
            "entropyScore": {"teacherCoverage": 0.985, "roomFit": 1.557},
            "constraintTightness": {"ratio": 0.571},
            "fragmentationIndex": {"value": 0.327},
            "heatmapData": {
                "Thứ 2": [
                    {"period": 1, "demand": 0.61, "supply": 4, "pressure": 0.15},
                    {"period": 2, "demand": 0.6, "supply": 4, "pressure": 0.15},
                    {"period": 5, "demand": 0.66, "supply": 4, "pressure": 0.17},
                    {"period": 11, "demand": 0.68, "supply": 4, "pressure": 0.17}
                ],
                "Thứ 3": [
                    {"period": 1, "demand": 0.24, "supply": 4, "pressure": 0.06},
                    {"period": 4, "demand": 0.34, "supply": 4, "pressure": 0.09},
                    {"period": 7, "demand": 0.42, "supply": 4, "pressure": 0.11}
                ],
                "Thứ 4": [
                    {"period": 2, "demand": 0.29, "supply": 4, "pressure": 0.07},
                    {"period": 4, "demand": 0.49, "supply": 4, "pressure": 0.12},
                    {"period": 7, "demand": 0.46, "supply": 4, "pressure": 0.12}
                ],
                "Thứ 5": [
                    {"period": 3, "demand": 0.37, "supply": 4, "pressure": 0.09},
                    {"period": 4, "demand": 0.62, "supply": 4, "pressure": 0.16},
                    {"period": 9, "demand": 0.41, "supply": 4, "pressure": 0.1}
                ],
                "Thứ 6": [
                    {"period": 1, "demand": 0.6, "supply": 4, "pressure": 0.15},
                    {"period": 2, "demand": 0.69, "supply": 4, "pressure": 0.17},
                    {"period": 3, "demand": 0.54, "supply": 4, "pressure": 0.14},
                    {"period": 12, "demand": 0.65, "supply": 4, "pressure": 0.16}
                ]
            }
        }
    };

    // Prepare chart data
    const courseLoadData = data.byCourse.map(c => ({
        name: `Course ${c.course_id}`,
        students: c.student_count,
        weeklyHours: c.weeklyHours,
        totalHours: c.totalHoursAcrossSemester,
        teacherOptions: c.teacherCoverage,
        roomOptions: c.roomFitCount
    }));

    const teacherWorkloadData = data.byTeacher.map(t => ({
        name: t.name,
        courses: t.canTeachCoursesCount,
        weeklyHours: t.estimatedWeeklyTeachingHours,
        sessions: t.estimatedWeeklySessions,
        utilization: (t.utilizationRate * 100).toFixed(1)
    }));

    const roomUtilizationData = data.byRoom.map(r => ({
        name: r.name,
        capacity: r.capacity,
        coverage: r.percentageCoverage,
        suitableCourses: r.suitableForCoursesCount
    }));

    const resourceDistributionData = [
        { name: 'Giáo viên', value: data.overview.totalTeachers, color: '#3b82f6' },
        { name: 'Phòng học', value: data.overview.totalRooms, color: '#8b5cf6' },
        { name: 'Môn học', value: data.overview.totalCourses, color: '#10b981' },
        { name: 'Lớp học', value: data.overview.totalClasses, color: '#f59e0b' }
    ];

    const constraintAnalysisData = data.byCourse.map(c => ({
        course: `C${c.course_id}`,
        teacherCoverage: c.teacherCoverage,
        roomFit: c.roomFitCount,
        students: c.student_count,
        complexity: c.sessionSlotsNeeded
    }));

    const weeklyDemandData = Object.entries(data.advancedMetrics.heatmapData).map(([day, periods]) => {
        const avgPressure = periods.reduce((sum, p) => sum + p.pressure, 0) / periods.length;
        const maxPressure = Math.max(...periods.map(p => p.pressure));
        const totalDemand = periods.reduce((sum, p) => sum + p.demand, 0);

        return {
            day: day,
            avgPressure: (avgPressure * 100).toFixed(1),
            maxPressure: (maxPressure * 100).toFixed(1),
            totalDemand: totalDemand.toFixed(1)
        };
    });

    const radarMetrics = [
        { metric: 'Khả thi', value: data.feasibility.hardFeasibilityRatio * 100, fullMark: 100 },
        { metric: 'Phân bổ GV', value: (data.feasibility.avgTeacherCoverage / 3) * 100, fullMark: 100 },
        { metric: 'Phân bổ phòng', value: (data.feasibility.avgRoomFit / 4) * 100, fullMark: 100 },
        { metric: 'Sử dụng', value: data.overview.utilizationRatio * 100, fullMark: 100 },
        { metric: 'Cân bằng', value: (1 - data.advancedMetrics.fragmentationIndex.value) * 100, fullMark: 100 }
    ];

    const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899'];

    const MetricCard = ({ title, value, icon: Icon, color = "blue", subtitle }) => (
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4" style={{ borderColor: `var(--${color}-500, #3b82f6)` }}>
            <div className="flex items-center justify-between">
                <div className="flex-1">
                    <p className="text-sm text-gray-600 mb-1">{title}</p>
                    <p className="text-3xl font-bold text-gray-800">{value}</p>
                    {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
                </div>
                {Icon && <Icon className="w-12 h-12 text-gray-400 opacity-50" />}
            </div>
        </div>
    );

    const StatusBadge = ({ status }) => {
        const colors = {
            good: 'bg-green-100 text-green-800',
            warning: 'bg-yellow-100 text-yellow-800',
            critical: 'bg-red-100 text-red-800'
        };
        const icons = {
            good: <CheckCircle className="w-4 h-4" />,
            warning: <AlertTriangle className="w-4 h-4" />,
            critical: <AlertCircle className="w-4 h-4" />
        };
        return (
            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${colors[status]}`}>
        {icons[status]}
                {status === 'good' ? 'Khả thi' : status === 'warning' ? 'Cảnh báo' : 'Nghiêm trọng'}
      </span>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard Đánh Giá Thời Khóa Biểu</h1>
                    <p className="text-gray-600">Phân tích chi tiết các chỉ số và khả năng thực hiện</p>
                </div>

                {/* Tabs */}
                <div className="bg-white rounded-lg shadow-sm mb-6">
                    <div className="flex border-b overflow-x-auto">
                        <button onClick={() => setActiveTab('overview')} className={`px-6 py-3 font-medium transition-colors whitespace-nowrap ${activeTab === 'overview' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>
                            Tổng quan
                        </button>
                        <button onClick={() => setActiveTab('charts')} className={`px-6 py-3 font-medium transition-colors whitespace-nowrap ${activeTab === 'charts' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>
                            Biểu đồ phân tích
                        </button>
                        <button onClick={() => setActiveTab('feasibility')} className={`px-6 py-3 font-medium transition-colors whitespace-nowrap ${activeTab === 'feasibility' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>
                            Tính khả thi
                        </button>
                        <button onClick={() => setActiveTab('resources')} className={`px-6 py-3 font-medium transition-colors whitespace-nowrap ${activeTab === 'resources' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>
                            Nguồn lực
                        </button>
                        <button onClick={() => setActiveTab('advanced')} className={`px-6 py-3 font-medium transition-colors whitespace-nowrap ${activeTab === 'advanced' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>
                            Chỉ số nâng cao
                        </button>
                    </div>
                </div>

                {/* Overview Tab */}
                {activeTab === 'overview' && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <MetricCard title="Tổng số môn học" value={data.overview.totalCourses} icon={BookOpen} color="blue" />
                            <MetricCard title="Giáo viên" value={data.overview.totalTeachers} icon={GraduationCap} color="green" />
                            <MetricCard title="Phòng học" value={data.overview.totalRooms} icon={Home} color="purple" />
                            <MetricCard title="Lớp học" value={data.overview.totalClasses} icon={Users} color="orange" />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <MetricCard title="Giờ học/tuần" value={data.overview.totalWeeklyHoursNeeded} subtitle={`${data.overview.totalWeeklySessionsNeeded} buổi học`} icon={Calendar} color="indigo" />
                            <MetricCard title="Tỷ lệ sử dụng" value={`${(data.overview.utilizationRatio * 100).toFixed(1)}%`} subtitle={`${data.overview.totalSlotsPerWeek} slot khả dụng`} icon={TrendingUp} color="cyan" />
                            <MetricCard title="TB Sinh viên/Môn" value={data.overview.avgStudentsPerCourse.toFixed(1)} subtitle={`${data.overview.semesterWeeks} tuần học`} icon={Users} color="pink" />
                        </div>
                    </div>
                )}

                {/* Charts Tab */}
                {activeTab === 'charts' && (
                    <div className="space-y-6">
                        {/* Course Load Analysis */}
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <BarChart3 className="w-5 h-5 text-blue-500" />
                                Phân tích tải môn học
                            </h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <ComposedChart data={courseLoadData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis yAxisId="left" />
                                    <YAxis yAxisId="right" orientation="right" />
                                    <Tooltip />
                                    <Legend />
                                    <Bar yAxisId="left" dataKey="students" fill="#3b82f6" name="Số sinh viên" />
                                    <Bar yAxisId="left" dataKey="weeklyHours" fill="#8b5cf6" name="Giờ/tuần" />
                                    <Line yAxisId="right" type="monotone" dataKey="totalHours" stroke="#10b981" strokeWidth={2} name="Tổng giờ" />
                                </ComposedChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Teacher Workload */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="bg-white rounded-lg shadow-md p-6">
                                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                    <GraduationCap className="w-5 h-5 text-green-500" />
                                    Khối lượng công việc giáo viên
                                </h3>
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={teacherWorkloadData} layout="vertical">
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis type="number" />
                                        <YAxis dataKey="name" type="category" width={80} />
                                        <Tooltip />
                                        <Legend />
                                        <Bar dataKey="weeklyHours" fill="#10b981" name="Giờ/tuần" />
                                        <Bar dataKey="courses" fill="#3b82f6" name="Số môn" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>

                            <div className="bg-white rounded-lg shadow-md p-6">
                                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                    <PieChart className="w-5 h-5 text-purple-500" />
                                    Phân bổ nguồn lực
                                </h3>
                                <ResponsiveContainer width="100%" height={300}>
                                    <RePieChart>
                                        <Pie data={resourceDistributionData} cx="50%" cy="50%" labelLine={false} label={({ name, value }) => `${name}: ${value}`} outerRadius={80} fill="#8884d8" dataKey="value">
                                            {resourceDistributionData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </RePieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Room Utilization */}
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <Home className="w-5 h-5 text-purple-500" />
                                Hiệu suất sử dụng phòng học
                            </h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={roomUtilizationData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="capacity" fill="#8b5cf6" name="Sức chứa" />
                                    <Bar dataKey="coverage" fill="#06b6d4" name="% Phù hợp" />
                                    <Bar dataKey="suitableCourses" fill="#ec4899" name="Số môn phù hợp" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Constraint Analysis Scatter */}
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <Activity className="w-5 h-5 text-orange-500" />
                                Phân tích ràng buộc môn học
                            </h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <ScatterChart>
                                    <CartesianGrid />
                                    <XAxis type="number" dataKey="teacherCoverage" name="Số GV có thể dạy" />
                                    <YAxis type="number" dataKey="roomFit" name="Số phòng phù hợp" />
                                    <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                                    <Legend />
                                    <Scatter name="Môn học" data={constraintAnalysisData} fill="#f59e0b">
                                        {constraintAnalysisData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Scatter>
                                </ScatterChart>
                            </ResponsiveContainer>
                            <p className="text-xs text-gray-500 mt-2">
                                Góc trái dưới = ràng buộc cao (ít lựa chọn), góc phải trên = linh hoạt (nhiều lựa chọn)
                            </p>
                        </div>

                        {/* Weekly Demand */}
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <Calendar className="w-5 h-5 text-cyan-500" />
                                Nhu cầu theo ngày trong tuần
                            </h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <ComposedChart data={weeklyDemandData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="day" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Area type="monotone" dataKey="totalDemand" fill="#06b6d4" stroke="#0891b2" name="Tổng nhu cầu" />
                                    <Line type="monotone" dataKey="avgPressure" stroke="#f59e0b" strokeWidth={2} name="Áp lực TB (%)" />
                                    <Line type="monotone" dataKey="maxPressure" stroke="#ef4444" strokeWidth={2} name="Áp lực Max (%)" />
                                </ComposedChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Radar Chart */}
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <Activity className="w-5 h-5 text-indigo-500" />
                                Đánh giá tổng thể (Radar)
                            </h3>
                            <ResponsiveContainer width="100%" height={400}>
                                <RadarChart data={radarMetrics}>
                                    <PolarGrid />
                                    <PolarAngleAxis dataKey="metric" />
                                    <PolarRadiusAxis angle={90} domain={[0, 100]} />
                                    <Radar name="Điểm đánh giá" dataKey="value" stroke="#6366f1" fill="#6366f1" fillOpacity={0.6} />
                                    <Tooltip />
                                    <Legend />
                                </RadarChart>
                            </ResponsiveContainer>
                            <p className="text-xs text-gray-500 mt-2">
                                Diện tích lớn hơn = hiệu suất tốt hơn. Các góc nhọn cho thấy điểm cần cải thiện.
                            </p>
                        </div>
                    </div>
                )}

                {/* Feasibility Tab */}
                {activeTab === 'feasibility' && (
                    <div className="space-y-6">
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-gray-800">Đánh giá tổng thể</h2>
                                <StatusBadge status={data.feasibility.feasibilitySummary.status} />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                                <div className="text-center p-4 bg-green-50 rounded-lg">
                                    <p className="text-sm text-gray-600 mb-2">Tỷ lệ khả thi</p>
                                    <p className="text-3xl font-bold text-green-600">
                                        {(data.feasibility.hardFeasibilityRatio * 100).toFixed(0)}%
                                    </p>
                                </div>
                                <div className="text-center p-4 bg-blue-50 rounded-lg">
                                    <p className="text-sm text-gray-600 mb-2">TB Giáo viên/Môn</p>
                                    <p className="text-3xl font-bold text-blue-600">
                                        {data.feasibility.avgTeacherCoverage.toFixed(2)}
                                    </p>
                                </div>
                                <div className="text-center p-4 bg-purple-50 rounded-lg">
                                    <p className="text-sm text-gray-600 mb-2">TB Phòng phù hợp/Môn</p>
                                    <p className="text-3xl font-bold text-purple-600">
                                        {data.feasibility.avgRoomFit}
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4 mb-6">
                                <div className="text-center p-3 bg-red-50 rounded">
                                    <p className="text-2xl font-bold text-red-600">
                                        {data.feasibility.feasibilitySummary.criticalIssues}
                                    </p>
                                    <p className="text-xs text-gray-600">Vấn đề nghiêm trọng</p>
                                </div>
                                <div className="text-center p-3 bg-yellow-50 rounded">
                                    <p className="text-2xl font-bold text-yellow-600">
                                        {data.feasibility.feasibilitySummary.highIssues}
                                    </p>
                                    <p className="text-xs text-gray-600">Cảnh báo cao</p>
                                </div>
                                <div className="text-center p-3 bg-orange-50 rounded">
                                    <p className="text-2xl font-bold text-orange-600">
                                        {data.feasibility.feasibilitySummary.mediumIssues}
                                    </p>
                                    <p className="text-xs text-gray-600">Cảnh báo trung bình</p>
                                </div>
                            </div>
                        </div>

                        {/* Bottlenecks */}
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <AlertTriangle className="w-5 h-5 text-yellow-500" />
                                Các điểm nghẽn tiềm ẩn
                            </h3>
                            <div className="space-y-3">
                                {data.feasibility.potentialBottlenecks.map((bottleneck, index) => (
                                    <div key={index} className="flex items-start gap-3 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded">
                                        <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                                        <div className="flex-1">
                                            <p className="font-medium text-gray-800">{bottleneck.entity}</p>
                                            <p className="text-sm text-gray-600">{bottleneck.issue}</p>
                                        </div>
                                        <span className="px-2 py-1 text-xs font-medium bg-yellow-200 text-yellow-800 rounded">
                      {bottleneck.severity}
                    </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Resources Tab */}
                {activeTab === 'resources' && (
                    <div className="space-y-6">
                        {/* Teachers */}
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <GraduationCap className="w-5 h-5" />
                                Phân bổ giáo viên
                            </h3>
                            <div className="space-y-3">
                                {data.byTeacher.map((teacher) => (
                                    <div key={teacher.id} className="border rounded-lg p-4">
                                        <div className="flex justify-between items-start mb-3">
                                            <div>
                                                <p className="font-semibold text-gray-800">{teacher.name}</p>
                                                <p className="text-sm text-gray-600">
                                                    {teacher.canTeachCoursesCount} môn học • {teacher.estimatedWeeklyTeachingHours}h/tuần
                                                </p>
                                            </div>
                                            <span className="text-sm font-medium text-blue-600">
                        {(teacher.utilizationRate * 100).toFixed(1)}%
                      </span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div className="bg-blue-500 h-2 rounded-full transition-all" style={{ width: `${teacher.utilizationRate * 100}%` }} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Rooms */}
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <Home className="w-5 h-5" />
                                Phân bổ phòng học
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {data.byRoom.map((room) => (
                                    <div key={room.id} className="border rounded-lg p-4">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <p className="font-semibold text-gray-800">{room.name}</p>
                                                <p className="text-sm text-gray-600">Sức chứa: {room.capacity} sinh viên</p>
                                            </div>
                                            <span className="text-sm font-medium text-purple-600">
                        {room.percentageCoverage.toFixed(1)}%
                      </span>
                                        </div>
                                        <p className="text-xs text-gray-500 mb-2">
                                            Phù hợp cho {room.suitableForCoursesCount}/{data.overview.totalCourses} môn
                                        </p>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div className="bg-purple-500 h-2 rounded-full" style={{ width: `${room.percentageCoverage}%` }} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Advanced Metrics Tab */}
                {activeTab === 'advanced' && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-white rounded-lg shadow-md p-6">
                                <h3 className="text-sm font-semibold text-gray-600 mb-2">Entropy Score</h3>
                                <div className="space-y-3">
                                    <div>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="text-gray-600">Giáo viên</span>
                                            <span className="font-medium">{data.advancedMetrics.entropyScore.teacherCoverage.toFixed(3)}</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div className="bg-cyan-500 h-2 rounded-full" style={{ width: `${data.advancedMetrics.entropyScore.teacherCoverage * 50}%` }} />
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="text-gray-600">Phòng học</span>
                                            <span className="font-medium">{data.advancedMetrics.entropyScore.roomFit.toFixed(3)}</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div className="bg-teal-500 h-2 rounded-full" style={{ width: `${Math.min(data.advancedMetrics.entropyScore.roomFit * 50, 100)}%` }} />
                                        </div>
                                    </div>
                                </div>
                                <p className="text-xs text-gray-500 mt-3">Entropy cao = phân bổ đều hơn, thấp = tập trung</p>
                            </div>

                            <div className="bg-white rounded-lg shadow-md p-6">
                                <h3 className="text-sm font-semibold text-gray-600 mb-2">Độ chặt ràng buộc</h3>
                                <div className="text-center py-4">
                                    <p className="text-4xl font-bold text-orange-600">
                                        {(data.advancedMetrics.constraintTightness.ratio * 100).toFixed(1)}%
                                    </p>
                                    <p className="text-sm text-gray-600 mt-2">Tỷ lệ môn có ít lựa chọn</p>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
                                    <div className="bg-orange-500 h-2 rounded-full" style={{ width: `${data.advancedMetrics.constraintTightness.ratio * 100}%` }} />
                                </div>
                            </div>

                            <div className="bg-white rounded-lg shadow-md p-6">
                                <h3 className="text-sm font-semibold text-gray-600 mb-2">Chỉ số phân mảnh</h3>
                                <div className="text-center py-4">
                                    <p className="text-4xl font-bold text-pink-600">
                                        {data.advancedMetrics.fragmentationIndex.value.toFixed(3)}
                                    </p>
                                    <p className="text-sm text-gray-600 mt-2">Mức độ rời rạc lịch học</p>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
                                    <div className="bg-pink-500 h-2 rounded-full" style={{ width: `${data.advancedMetrics.fragmentationIndex.value * 100}%` }} />
                                </div>
                                <p className="text-xs text-gray-500 mt-3">Cao = lịch phân mảnh nhiều ngày</p>
                            </div>
                        </div>

                        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
                            <p className="text-sm text-blue-800">
                                <strong>Lưu ý:</strong> Các chỉ số này giúp đánh giá chất lượng và tính linh hoạt của thời khóa biểu.
                                Giá trị cao không luôn tốt - cần cân bằng giữa các yếu tố.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ScheduleMetricsDashboard;