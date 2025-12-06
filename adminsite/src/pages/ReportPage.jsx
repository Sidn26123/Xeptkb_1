import React, { useState, useEffect, useMemo } from 'react';
import {
    getGenerationStats,
    getPenaltyAnalysis,
    getFitnessTrend,
} from '../services/reportService'; // <-- Cập nhật đường dẫn này
import {
    LineChart, Line, BarChart, Bar, XAxis, YAxis,
    CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import {
    Loader2, AlertCircle, BarChart3, Activity, Award, TrendingDown
} from 'lucide-react';
import ScheduleDensityCharts from "../components/reports/ScheduleDensityCharts.jsx";
import SchedulerViewer from "../components/scheduler/SchedulerViewer.jsx";
import AlgorithmInputSelector from "../components/scheduler/SchedulerInput.jsx";

// === Component Thẻ Thống Kê (Helper) ===
const StatCard = ({ title, value, icon, bgColorClass }) => (
    <div className="bg-white p-6 rounded-lg shadow-md flex items-center">
        <div className={`p-3 rounded-full text-white mr-4 ${bgColorClass}`}>
            {icon}
        </div>
        <div>
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <p className="text-3xl font-bold text-gray-900">{value ?? 'N/A'}</p>
        </div>
    </div>
);

// === Component Báo Cáo Chính ===
export const ReportPage = () => {
    const [stats, setStats] = useState(null);
    const [penaltyData, setPenaltyData] = useState(null);
    const [trendData, setTrendData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // 1. Định nghĩa hàm fetch (theo style của bạn)
    const fetchReportData = async () => {
        setLoading(true);
        setError(null);
        try {
            // Dùng Promise.all để gọi 3 API song song cho nhanh
            const [statsRes, penaltyRes, trendRes] = await Promise.all([
                getGenerationStats(),
                getPenaltyAnalysis(),
                getFitnessTrend(),
            ]);

            setStats(statsRes);
            setPenaltyData(penaltyRes);
            setTrendData(trendRes);

        } catch (err) {
            console.error('Failed to load report data', err);
            setError('Không thể tải dữ liệu báo cáo. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    // 2. Gọi hàm fetch khi component mount (theo style của bạn)
    useEffect(() => {
        fetchReportData();
    }, []); // [] = chỉ chạy 1 lần khi mount

    // 3. Biến đổi dữ liệu cho biểu đồ (dùng useMemo để tối ưu)
    const penaltyChartData = useMemo(() => {
        if (!penaltyData || !penaltyData.totalPenaltyCounts) return [];

        // Chuyển { "key": value } thành [ { name: "key", count: value } ]
        return Object.entries(penaltyData.totalPenaltyCounts)
            .map(([name, count]) => ({
                name: name.replace(/_/g, ' '), // Thay "teacher_conflict" thành "teacher conflict"
                count: count,
            }))
            .sort((a, b) => b.count - a.count); // Sắp xếp giảm dần
    }, [penaltyData]);

    // Hàm format ngày tháng cho trục X của biểu đồ Line
    const formatXAxis = (tickItem) => {
        try {
            // tickItem là "2025-11-10T10:05:00Z"
            return new Date(tickItem).toLocaleDateString('vi-VN', {
                day: '2-digit',
                month: '2-digit',
            });
        } catch (e) {
            return tickItem;
        }
    };

    // === 4. Xử lý trạng thái Loading / Error ===
    if (loading) {
        return (
            <div className="flex items-center justify-center p-20 min-h-[500px]">
                <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
                <span className="ml-3 text-xl text-gray-700">Đang tải báo cáo...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center p-20 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="h-8 w-8 text-red-500" />
                <span className="ml-2 text-lg text-red-700">{error}</span>
            </div>
        );
    }

    // === 5. Render UI chính ===
    return (
        <div className="p-4 md:p-6 bg-gray-100 min-h-screen">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">
                Báo cáo & Thống kê
            </h1>

            {/* --- Phần 1: Thẻ Thống Kê (Endpoint 1) --- */}
            <div className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-700 mb-4">Tổng quan</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                    <StatCard
                        title="Tổng số lần tạo"
                        value={stats?.totalGenerations}
                        icon={<BarChart3 className="h-6 w-6" />}
                        bgColorClass="bg-blue-500"
                    />
                    <StatCard
                        title="Fitness Trung bình"
                        value={stats?.averageFitness?.toFixed(2)}
                        icon={<Activity className="h-6 w-6" />}
                        bgColorClass="bg-yellow-500"
                    />
                    <StatCard
                        title="Fitness Tốt nhất"
                        value={stats?.bestFitnessScore?.toFixed(2)}
                        icon={<Award className="h-6 w-6" />}
                        bgColorClass="bg-green-500"
                    />
                    <StatCard
                        title="Fitness Tệ nhất"
                        value={stats?.worstFitnessScore?.toFixed(2)}
                        icon={<TrendingDown className="h-6 w-6" />}
                        bgColorClass="bg-red-500"
                    />
                </div>
            </div>

            {/* --- Phần 2: Biểu đồ (Endpoint 2 & 3) --- */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 md:gap-6">

                {/* Biểu đồ Phân tích Lỗi (Bar Chart) */}
                <div className="lg:col-span-2 bg-white p-4 md:p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold text-gray-700 mb-4">
                        Phân tích Lỗi (Penalty)
                    </h2>
                    <p className="text-sm text-gray-500 mb-4">
                        Tổng hợp các vi phạm rà buộc (càng thấp càng tốt).
                    </p>
                    <div style={{ width: '100%', height: 400 }}>
                        <ResponsiveContainer>
                            <BarChart
                                data={penaltyChartData}
                                layout="vertical" // Dạng ngang dễ đọc tên lỗi
                                margin={{ left: 100 }} // Thêm lề trái cho tên lỗi
                            >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis type="number" />
                                <YAxis
                                    dataKey="name"
                                    type="category"
                                    width={150} // Tăng chiều rộng
                                    interval={0} // Hiển thị tất cả
                                    tick={{ fontSize: 12 }}
                                />
                                <Tooltip />
                                <Legend />
                                <Bar
                                    dataKey="count"
                                    fill="#8884d8"
                                    name="Số lần vi phạm"
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Biểu đồ Xu hướng Fitness (Line Chart) */}
                <div className="lg:col-span-3 bg-white p-4 md:p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold text-gray-700 mb-4">
                        Xu hướng Điểm Fitness
                    </h2>
                    <p className="text-sm text-gray-500 mb-4">
                        Biến động điểm fitness qua các lần tạo (càng thấp càng tốt).
                    </p>
                    <div style={{ width: '100%', height: 400 }}>
                        <ResponsiveContainer>
                            <LineChart
                                data={trendData}
                                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="generated_at" tickFormatter={formatXAxis} />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Line
                                    type="monotone"
                                    dataKey="fitness_score"
                                    name="Điểm Fitness"
                                    stroke="#82ca9d"
                                    activeDot={{ r: 8 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
            <ScheduleDensityCharts />

        </div>
    );
};

export default ReportPage;