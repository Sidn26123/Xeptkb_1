import React, { useState, useEffect, useMemo } from 'react';
import { getSchedulesByDay, getSchedulesByTimeSlot } from '../../services/reportService.js';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { Loader2, AlertCircle } from 'lucide-react';

// Helper function để format giờ: (7, 0) -> "07:00"
const formatTime = (h, m) => `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;

const ScheduleDensityCharts = () => {
    const [dayData, setDayData] = useState([]);
    const [timeSlotData, setTimeSlotData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchDensityData = async () => {
        setLoading(true);
        setError(null);
        try {
            // Dùng Promise.all để gọi 2 API song song
            const [dayRes, timeSlotRes] = await Promise.all([
                getSchedulesByDay(),
                getSchedulesByTimeSlot(),
            ]);
            setDayData(dayRes);
            setTimeSlotData(timeSlotRes);
        } catch (err) {
            console.error('Failed to load schedule density data', err);
            setError('Không thể tải dữ liệu phân bổ lịch học.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDensityData();
    }, []);

    // Format lại data cho biểu đồ TimeSlot để trục X đẹp hơn
    const formattedTimeSlotData = useMemo(() => {
        return timeSlotData.map(slot => ({
            ...slot,
            // Tên hiển thị trên Tooltip (khi hover)
            // Ví dụ: "Tiết 1 (07:00 - 07:50)"
            tooltip_name: `${slot.name} (${formatTime(slot.start_hour, slot.start_min)} - ${formatTime(slot.end_hour, slot.end_min)})`,
            // Tên hiển thị trên trục X (chỉ "Tiết 1")
            name: slot.name
        }));
    }, [timeSlotData]);

    if (loading) {
        // Giao diện loading cho 2 biểu đồ
        return (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-6">
                <div className="bg-white p-6 rounded-lg shadow-md flex items-center justify-center min-h-[400px]">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                    <span className="ml-2">Đang tải biểu đồ phân bổ...</span>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md flex items-center justify-center min-h-[400px]">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                    <span className="ml-2">Đang tải biểu đồ phân bổ...</span>
                </div>
            </div>
        );
    }

    if (error) {
        // Giao diện lỗi chung
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 flex items-center justify-center">
                <AlertCircle className="h-8 w-8 text-red-500" />
                <span className="ml-2 text-lg text-red-700">{error}</span>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-6">

            {/* --- Biểu đồ Phân bổ theo Ngày --- */}
            <div className="bg-white p-4 md:p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold text-gray-700 mb-4">
                    Phân bổ lịch học (Theo Ngày)
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                    Mật độ lịch học trong các ngày của tuần.
                </p>
                <div style={{ width: '100%', height: 400 }}>
                    <ResponsiveContainer>
                        <BarChart data={dayData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="total_schedules" fill="#8884d8" name="Số lịch học" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* --- Biểu đồ Phân bổ theo Tiết học --- */}
            <div className="bg-white p-4 md:p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold text-gray-700 mb-4">
                    Phân bổ lịch học (Theo Tiết)
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                    Mật độ lịch học trong các tiết học của ngày.
                </p>
                <div style={{ width: '100%', height: 400 }}>
                    <ResponsiveContainer>
                        <BarChart data={formattedTimeSlotData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis
                                dataKey="name" // Chỉ hiển thị "Tiết 1", "Tiết 2"...
                                interval={0} // Hiển thị tất cả
                                tick={{ fontSize: 10 }} // Chữ nhỏ lại cho đỡ vỡ
                            />
                            <YAxis />
                            <Tooltip
                                // Custom lại Tooltip để hiển thị tên đầy đủ
                                labelFormatter={(label, payload) => {
                                    if (payload && payload[0]) {
                                        // Lấy "tooltip_name" từ data
                                        return payload[0].payload.tooltip_name;
                                    }
                                    return label;
                                }}
                            />
                            <Legend />
                            <Bar dataKey="total_schedules" fill="#82ca9d" name="Số lịch học" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default ScheduleDensityCharts;