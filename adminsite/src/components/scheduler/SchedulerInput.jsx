import React, { useState } from "react";
import {setSelectedSemester} from "../../stores/ScheduleDataStore.js";

// --- Dữ liệu giả lập (Mock Data) ---
// Đây là dữ liệu gốc từ database của bạn
const MOCK_ROOMS = [
    {
        id: 1,
        code: "A01",
        name: "A01",
        capacity_max: 50,
        capacity_optimal: 50,
    },
    {
        id: 2,
        code: "A101",
        name: "Phòng học A101",
        type: "LEC",
        capacity_max: 50,
        capacity_optimal: 40,
    },
    {
        id: 3,
        code: "B205",
        name: "Phòng máy B205",
        type: "LAB",
        capacity_max: 70,
        capacity_optimal: 60,
    },
];

const MOCK_COURSES = [
    {
        id: 1,
        name: "IT",
        subject_id: 101,
        class_id: 1,
        semester_id: 5,
        teacher_id: 3,
    },
    {
        id: 2,
        name: "IT1",
        subject_id: 102,
        class_id: 2,
        semester_id: 4,
        teacher_id: 1,
    },
    {
        id: 3,
        name: "INT2",
        subject_id: 103,
        class_id: 1,
        semester_id: 4,
        teacher_id: 2,
    },
    {
        id: 4,
        name: "Toán cao cấp",
        subject_id: 104,
        class_id: 1,
        semester_id: 1,
        teacher_id: 1,
    },
];

const MOCK_TEACHERS = [
    {
        id: 1,
        name: "Nguyễn Văn A",
        teacher_identifier: "GV001",
        faculty_id: 1,
    },
    {
        id: 2,
        name: "Trần Thị B",
        teacher_identifier: "GV002",
        faculty_id: 2,
    },
    { id: 3, name: "Lê Văn C", teacher_identifier: "GV003", faculty_id: 1 },
];
// --- Kết thúc Mock Data ---

/**
 * Component chính để chọn dữ liệu cho thuật toán
 */
export default function AlgorithmInputSelector() {
    // State để lưu trữ các ID đã chọn
    const [selectedRoomIds, setSelectedRoomIds] = useState(new Set());
    const [selectedTeacherIds, setSelectedTeacherIds] = useState(new Set());
    const [selectedCourseIds, setSelectedCourseIds] = useState(new Set());

    // State để lưu các tham số nhập thêm
    const [courseParams, setCourseParams] = useState({}); // { courseId: { student_count: 50, ... } }
    const [teacherBusySlots, setTeacherBusySlots] = useState({}); // { teacherId: "2-1, 2-2" }
    const [semesterConfig, setSemesterConfig] = useState({
        start_date: "2025-01-01",
        start_week: 1,
        end_week: 20,
        max_concurrent_courses: 6,
    });

    // --- Hàm xử lý Toggle Checkbox ---

    const toggleCheckbox = (id, selectedIds, setter) => {
        const newIds = new Set(selectedIds);
        if (newIds.has(id)) {
            newIds.delete(id);
        } else {
            newIds.add(id);
        }
        setter(newIds);
    };

    const toggleSelectAll = (allItems, selectedIds, setter) => {
        if (selectedIds.size === allItems.length) {
            setter(new Set()); // Deselect all
        } else {
            setter(new Set(allItems.map((item) => item.id))); // Select all
        }
    };

    // --- Hàm xử lý thay đổi Input ---

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
        const { name, value } = e.target;
        setSemesterConfig((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // --- Hàm xử lý Submit và Chuyển đổi Dữ liệu ---

    const handleSubmit = () => {
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
                allRooms: MOCK_ROOMS,
                allTeachers: MOCK_TEACHERS,
                allCourses: MOCK_COURSES,
            }
        );
        console.log("Dữ liệu gửi đến API:", JSON.stringify(formattedData, null, 2));
        alert("Đã tạo dữ liệu! Vui lòng kiểm tra Console (F12).");
    };



    return (
        <div className="container mx-auto p-6 bg-gray-50 min-h-screen">
            <h1 className="text-3xl font-bold mb-6 text-gray-800">
                Cấu hình đầu vào Thuật toán Xếp lịch
            </h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* --- CỘT 1: PHÒNG HỌC --- */}
                <DataCard
                    title="Chọn Phòng học"
                    items={MOCK_ROOMS}
                    selectedIds={selectedRoomIds}
                    onToggleSelectAll={() =>
                        toggleSelectAll(MOCK_ROOMS, selectedRoomIds, setSelectedRoomIds)
                    }
                    onToggleItem={(id) =>
                        toggleCheckbox(id, selectedRoomIds, setSelectedRoomIds)
                    }
                    renderItem={(room) => `${room.code} - ${room.name} (Max: ${room.capacity_max})`}
                />

                {/* --- CỘT 2: GIÁO VIÊN --- */}
                <DataCard
                    title="Chọn Giáo viên"
                    items={MOCK_TEACHERS}
                    selectedIds={selectedTeacherIds}
                    onToggleSelectAll={() =>
                        toggleSelectAll(
                            MOCK_TEACHERS,
                            selectedTeacherIds,
                            setSelectedTeacherIds
                        )
                    }
                    onToggleItem={(id) =>
                        toggleCheckbox(id, selectedTeacherIds, setSelectedTeacherIds)
                    }
                    renderItem={(teacher) => `${teacher.teacher_identifier} - ${teacher.name}`}
                    renderExtraInputs={(teacher) => (
                        <div className="mt-2 ml-7">
                            <label className="text-xs font-semibold text-gray-600">
                                Tiết bận (vd: 2-1, 2-2, 3-7)
                            </label>
                            <input
                                type="text"
                                placeholder="Thứ-Tiết, Thứ-Tiết,..."
                                className="w-full text-sm p-1.5 border rounded"
                                value={teacherBusySlots[teacher.id] || ""}
                                onChange={(e) =>
                                    handleTeacherBusySlotChange(teacher.id, e.target.value)
                                }
                            />
                        </div>
                    )}
                />

                {/* --- CỘT 3: CẤU HÌNH HỌC KỲ --- */}
                <div className="bg-white p-6 rounded-lg shadow-lg">
                    <h3 className="text-xl font-semibold mb-4 text-blue-700">
                        Cấu hình Học kỳ
                    </h3>
                    <div className="space-y-4">
                        <ConfigInput
                            label="Ngày bắt đầu"
                            name="start_date"
                            type="date"
                            value={semesterConfig.start_date}
                            onChange={handleConfigChange}
                        />
                        <ConfigInput
                            label="Tuần bắt đầu (tương đối)"
                            name="start_week"
                            type="number"
                            value={semesterConfig.start_week}
                            onChange={handleConfigChange}
                        />
                        <ConfigInput
                            label="Tuần kết thúc"
                            name="end_week"
                            type="number"
                            value={semesterConfig.end_week}
                            onChange={handleConfigChange}
                        />
                        <ConfigInput
                            label="Số môn học tối đa / lớp"
                            name="max_concurrent_courses"
                            type="number"
                            value={semesterConfig.max_concurrent_courses}
                            onChange={handleConfigChange}
                        />
                    </div>
                </div>
            </div>

            {/* --- HÀNG 2: LỚP HỌC PHẦN (COURSES) --- */}
            <div className="mt-6">
                <DataCard
                    title="Chọn Lớp học phần & Nhập tham số"
                    items={MOCK_COURSES}
                    selectedIds={selectedCourseIds}
                    onToggleSelectAll={() =>
                        toggleSelectAll(
                            MOCK_COURSES,
                            selectedCourseIds,
                            setSelectedCourseIds
                        )
                    }
                    onToggleItem={(id) =>
                        toggleCheckbox(id, selectedCourseIds, setSelectedCourseIds)
                    }
                    renderItem={(course) =>
                        `ID: ${course.id} - ${course.name} (GV: ${course.teacher_id} | Lớp: ${course.class_id})`
                    }
                    renderExtraInputs={(course) => (
                        <div
                            className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-2 mt-2 ml-7 p-3 bg-gray-50 rounded">
                            <ConfigInput
                                label="Sĩ số"
                                type="number"
                                placeholder="50"
                                value={courseParams[course.id]?.student_count || ""}
                                onChange={(e) =>
                                    handleCourseParamChange(
                                        course.id,
                                        "student_count",
                                        e.target.value
                                    )
                                }
                            />
                            <ConfigInput
                                label="Số tuần học"
                                type="number"
                                placeholder="15"
                                value={courseParams[course.id]?.weeks_needed || ""}
                                onChange={(e) =>
                                    handleCourseParamChange(
                                        course.id,
                                        "weeks_needed",
                                        e.target.value
                                    )
                                }
                            />
                            <ConfigInput
                                label="Số buổi / tuần"
                                type="number"
                                placeholder="2"
                                value={courseParams[course.id]?.sessions_per_week || ""}
                                onChange={(e) =>
                                    handleCourseParamChange(
                                        course.id,
                                        "sessions_per_week",
                                        e.target.value
                                    )
                                }
                            />
                            <ConfigInput
                                label="Số tiết / buổi"
                                type="number"
                                placeholder="3"
                                value={courseParams[course.id]?.duration_per_session || ""}
                                onChange={(e) =>
                                    handleCourseParamChange(
                                        course.id,
                                        "duration_per_session",
                                        e.target.value
                                    )
                                }
                            />
                        </div>
                    )}
                />
            </div>

            {/* --- NÚT SUBMIT --- */}
            <div className="mt-8 text-center">
                <button
                    onClick={handleSubmit}
                    className="px-8 py-3 bg-green-600 text-white font-bold rounded-lg shadow-md hover:bg-green-700 transition-colors"
                >
                    Tạo Dữ Liệu và Gửi (Xem Console)
                </button>
            </div>
        </div>
    );
}

/**
 * Component Card chung để hiển thị danh sách
 */
const DataCard = ({
                      title,
                      items,
                      selectedIds,
                      onToggleSelectAll,
                      onToggleItem,
                      renderItem,
                      renderExtraInputs,
                  }) => (
    <div className="bg-white p-6 rounded-lg shadow-lg">
        <h3 className="text-xl font-semibold mb-4 text-blue-700">{title}</h3>
        <button
            onClick={onToggleSelectAll}
            className="mb-3 text-sm font-medium text-blue-600 hover:text-blue-800"
        >
            {selectedIds.size === items.length ? "Bỏ chọn tất cả" : "Chọn tất cả"}
        </button>
        <div className="max-h-96 overflow-y-auto space-y-2 pr-2">
            {items.map((item) => {
                const isSelected = selectedIds.has(item.id);
                return (
                    <div key={item.id} className="block">
                        <label className="flex items-center p-2 rounded hover:bg-gray-100 cursor-pointer">
                            <input
                                type="checkbox"
                                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                checked={isSelected}
                                onChange={() => onToggleItem(item.id)}
                            />
                            <span className="ml-3 text-sm text-gray-700">
                {renderItem(item)}
              </span>
                        </label>
                        {isSelected && renderExtraInputs && renderExtraInputs(item)}
                    </div>
                );
            })}
        </div>
    </div>
);

/**
 * Component Input chung cho Form
 */
const ConfigInput = ({ label, name, ...props }) => (
    <div>
        <label
            htmlFor={name || props.placeholder}
            className="block text-xs font-semibold text-gray-600 mb-1"
        >
            {label}
        </label>
        <input
            id={name || props.placeholder}
            name={name}
            {...props}
            className="w-full text-sm p-1.5 border rounded border-gray-300 focus:ring-blue-500 focus:border-blue-500"
        />
    </div>
);

// --- HÀM CHUYỂN ĐỔI DỮ LIỆU ---

