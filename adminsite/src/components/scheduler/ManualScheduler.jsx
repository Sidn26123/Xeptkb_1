// import React, { useEffect, useState } from 'react';
// import {
//     Loader2, Save, GripVertical, Calendar,
//     User, Hash, XCircle, Building,
//     Monitor, Beaker, Filter, AlertTriangle
// } from 'lucide-react';
// import {
//     useBuildings,
//     useCourses,
//     useEquipments,
//     useRoomEquipments,
//     useRooms,
//     useSelectedCourses,
//     useSelectedRooms,
//     useSelectedSemester,
//     useSelectedTeachers,
//     useSubjectRequiresEquipment,
//     useSubjects,
//     useTeachers
// } from "../../stores/ScheduleDataStore.js";
//
// // ==========================================
// // 1. DATA & CONFIG (MOCK)
// // ==========================================
// const PERIODS = Array.from({ length: 12 }, (_, i) => i + 1);
// const DAYS = [
//     { id: 2, name: 'Thứ 2' }, { id: 3, name: 'Thứ 3' }, { id: 4, name: 'Thứ 4' },
//     { id: 5, name: 'Thứ 5' }, { id: 6, name: 'Thứ 6' }, { id: 7, name: 'Thứ 7' },
//     { id: 8, name: 'CN' }
// ];
//
// const BUILDINGS = [
//     { id: 1, name: 'Tòa nhà A (Lý thuyết)' },
//     { id: 2, name: 'Tòa nhà B (Công nghệ cao/Lab)' },
// ];
//
// const MOCK_ROOMS = [
//     // Tòa A - Lý thuyết
//     {
//         id: 1, building_id: 1, code: '101-A', name: 'P.101 A', capacity: 50,
//         type: 'theory', equipment: ['Projector', 'Mic', 'Whiteboard']
//     },
//     {
//         id: 2, building_id: 1, code: '102-A', name: 'P.102 A', capacity: 60,
//         type: 'theory', equipment: ['Projector', 'Whiteboard']
//     },
//     {
//         id: 3, building_id: 1, code: '201-A', name: 'Hội trường A', capacity: 150,
//         type: 'theory', equipment: ['Projector', 'Sound System', 'AC']
//     },
//     // Tòa B - Lab
//     {
//         id: 4, building_id: 2, code: 'LAB-01', name: 'Phòng Lab 01', capacity: 30,
//         type: 'lab', equipment: ['PC', 'Projector', 'AC']
//     },
//     {
//         id: 5, building_id: 2, code: 'LAB-02', name: 'Phòng Lab 02', capacity: 30,
//         type: 'lab', equipment: ['PC', 'Mac', 'VR Headset']
//     },
// ];
//
// const MOCK_UNSCHEDULED = [
//     {
//         id: 101, course_class_id: 1001, name: 'Lập trình Web (TH)', type: 'lab',
//         required_equipment: ['PC'], weeks_needed: 10,
//         teacher_name: 'Cô Nguyễn Thị A', duration: 3, subject_code: 'INT3306',
//         student_count: 25
//     },
//     {
//         id: 102, course_class_id: 1002, name: 'Triết học Mác - Lênin', type: 'theory',
//         required_equipment: ['Projector'], weeks_needed: 5,
//         teacher_name: 'Thầy Trần Văn B', duration: 2, subject_code: 'PHI1004',
//         student_count: 80
//     },
//     {
//         id: 103, course_class_id: 1003, name: 'Thực tế ảo (VR)', type: 'lab',
//         required_equipment: ['VR Headset'], weeks_needed: 8,
//         teacher_name: 'Thầy Lê C', duration: 4, subject_code: 'INT3309',
//         student_count: 20
//     },
//     {
//         id: 104, course_class_id: 1004, name: 'Tiếng Anh chuyên ngành', type: 'theory',
//         required_equipment: ['Mic'], weeks_needed: 15,
//         teacher_name: 'Cô Phạm D', duration: 3, subject_code: 'ENG2020',
//         student_count: 40
//     },
// ];
//
// const MOCK_SCHEDULED = [
//     {
//         id: 201,
//         course_class_id: 2001,
//         room_id: 1, // 101-A
//         day_id: 2, // Thứ 2
//         start_period: 2,
//         num_of_period: 3,
//         start_week: 1,
//         weeks_needed: 15,
//         subject_code: 'MAT1010',
//         name: 'Đại số tuyến tính',
//         teacher_code: 'GV001',
//         type: 'auto', // Lịch tự động
//         student_count: 45
//     },
//     {
//         id: 202,
//         course_class_id: 2002,
//         room_id: 4, // LAB-01
//         day_id: 3, // Thứ 3
//         start_period: 7,
//         num_of_period: 3,
//         start_week: 5, // Bắt đầu từ tuần 5
//         weeks_needed: 10,
//         subject_code: 'INT3301',
//         name: 'Lập trình mạng',
//         teacher_code: 'GV002',
//         type: 'manual', // Lịch thủ công
//         student_count: 30
//     }
// ];
//
// // ==========================================
// // 2. MAIN COMPONENT
// // ==========================================
// const ManualScheduler = () => {
//     // --- STATE ---
//     const [semesterId, setSemesterId] = useState(1);
//     // const [rooms, setRooms] = useState([]);
//     const [unscheduled, setUnscheduled] = useState([]);
//     const [scheduledEvents, setScheduledEvents] = useState([]);
//     const [loading, setLoading] = useState(false);
//
//     // Filters
//     const [selectedBuilding, setSelectedBuilding] = useState(1);
//     const [currentWeek, setCurrentWeek] = useState(1);
//
//     // Dragging
//     const [draggedItem, setDraggedItem] = useState(null);
//     const [dropTarget, setDropTarget] = useState(null); // { roomId, dayId, period }
//
//     const courses = useCourses();
//     const teachers = useTeachers();
//     const rooms = useRooms();
//     const buildings = useBuildings();
//     const subjects = useSubjects();
//     const equipments = useEquipments();
//     const roomEquipments = useRoomEquipments();
//     const subjectRequiresEquipments = useSubjectRequiresEquipment();
//     const selectedSemester = useSelectedSemester();
//     // --- EFFECT: LOAD DATA ---
//     useEffect(() => {
//         setLoading(true);
//         // Giả lập API call
//         console.log("Semester:", selectedSemester);
//         console.log("ALl teacher: ", teachers.slice(0,3));
//         console.log("All subject", subjects.slice(0,3));
//         console.log("All courses", courses.slice(0,3));
//         console.log("All buildings", buildings.slice(0,3));
//         //  log 20 first rooms
//         console.log("First 20 rooms", rooms.slice(0, 3));
//         // console.log("All rooms", rooms)
//         console.log("All equipment", equipments.slice(0,3));
//         console.log("All roomEquipments", roomEquipments.slice(0,3));
//         console.log("All subjectRequiresEquipments", subjectRequiresEquipments.slice(0,3));
//         setTimeout(() => {
//             // setRooms(MOCK_ROOMS);
//             // setUnscheduled(MOCK_UNSCHEDULED);
//             // setScheduledEvents(MOCK_SCHEDULED);
//             setLoading(false);
//         }, 800);
//     }, [semesterId]);
//
//     // --- LOGIC LỌC HIỂN THỊ ---
//
//     // 1. Lọc phòng theo Tòa nhà
//     const visibleRooms = rooms.filter(r => r.building_id === parseInt(selectedBuilding));
//
//     // 2. Lọc sự kiện theo Tuần hiện tại
//     const visibleEvents = scheduledEvents.filter(evt => {
//         const endWeek = evt.start_week + evt.weeks_needed - 1;
//         return currentWeek >= evt.start_week && currentWeek <= endWeek;
//     });
//
//     // --- HANDLERS ---
//
//     const handleDragStart = (e, item, source) => {
//         setDraggedItem({ ...item, source });
//         // Set drag image ghost nếu cần
//         e.dataTransfer.setData('text/plain', JSON.stringify(item));
//         e.dataTransfer.effectAllowed = 'move';
//     };
//
//     const handleDragOver = (e, roomId, dayId, period) => {
//         e.preventDefault();
//         // Debounce update state UI
//         if (dropTarget?.roomId !== roomId || dropTarget?.dayId !== dayId || dropTarget?.period !== period) {
//             setDropTarget({ roomId, dayId, period });
//         }
//     };
//
//     const handleDrop = (e, roomId, dayId, period) => {
//         e.preventDefault();
//         if (!draggedItem) return;
//
//         const targetRoom = rooms.find(r => r.id === roomId);
//
//         // --- VALIDATION 1: LOẠI PHÒNG (Type Check) ---
//         // Ví dụ: Kéo môn Lab vào phòng Lý thuyết
//         if (draggedItem.type && targetRoom.type && draggedItem.type !== targetRoom.type) {
//             const msg = `⚠️ SAI LOẠI PHÒNG!\n` +
//                 `Môn học yêu cầu: ${draggedItem.type.toUpperCase()}\n` +
//                 `Phòng hiện tại: ${targetRoom.type.toUpperCase()}\n\n` +
//                 `Bạn có chắc chắn muốn xếp vào đây không?`;
//             if (!window.confirm(msg)) {
//                 resetDragState();
//                 return;
//             }
//         }
//
//         // --- VALIDATION 2: THIẾT BỊ (Equipment Check) ---
//         if (draggedItem.required_equipment) {
//             const missing = draggedItem.required_equipment.filter(req => !targetRoom.equipment.includes(req));
//             if (missing.length > 0) {
//                 const msg = `⚠️ THIẾU THIẾT BỊ HỖ TRỢ:\n` +
//                     `Phòng ${targetRoom.code} thiếu: ${missing.join(', ')}\n` +
//                     `Vẫn tiếp tục xếp?`;
//                 if (!window.confirm(msg)) {
//                     resetDragState();
//                     return;
//                 }
//             }
//         }
//
//         // --- VALIDATION 3: SỨC CHỨA ---
//         if (draggedItem.student_count > targetRoom.capacity) {
//             const msg = `⚠️ QUÁ TẢI SĨ SỐ:\n` +
//                 `Lớp: ${draggedItem.student_count} SV\n` +
//                 `Phòng: ${targetRoom.capacity} chỗ\n` +
//                 `Vẫn tiếp tục xếp?`;
//             if (!window.confirm(msg)) {
//                 resetDragState();
//                 return;
//             }
//         }
//
//         // --- VALIDATION 4: TRÙNG LỊCH (Time Conflict) ---
//         // Chỉ check va chạm với các lớp ĐANG DIỄN RA trong cùng tuần start_week
//         // Logic thực tế cần phức tạp hơn (overlap khoảng tuần), ở đây demo check đơn giản với visibleEvents
//         const duration = draggedItem.duration || draggedItem.num_of_period;
//         const hasConflict = visibleEvents.some(evt =>
//             evt.room_id === roomId &&
//             evt.day_id === dayId &&
//             evt.id !== draggedItem.id && // Trừ chính nó
//             (
//                 (period >= evt.start_period && period < evt.start_period + evt.num_of_period) ||
//                 (period + duration - 1 >= evt.start_period && period + duration - 1 < evt.start_period + evt.num_of_period)
//             )
//         );
//
//         if (hasConflict) {
//             if (!window.confirm("⚠️ XUNG ĐỘT THỜI GIAN: Đã có lớp học tại khung giờ này trong tuần hiện tại. Bạn có muốn đè lên không?")) {
//                 resetDragState();
//                 return;
//             }
//         }
//
//         // --- SAVE LOGIC ---
//         const newEvent = {
//             ...draggedItem,
//             id: draggedItem.id || Date.now(), // Generate fake ID
//             room_id: roomId,
//             day_id: dayId,
//             start_period: period,
//             num_of_period: duration,
//
//             // Cập nhật thông tin hiển thị
//             subject_code: draggedItem.subject_code,
//             name: draggedItem.name,
//             teacher_code: draggedItem.teacher_name || draggedItem.teacher_code,
//
//             // Quan trọng: Gán tuần bắt đầu bằng tuần đang chọn (User Intent)
//             start_week: currentWeek,
//             weeks_needed: draggedItem.weeks_needed || 15,
//
//             type: 'manual'
//         };
//
//         if (draggedItem.source === 'sidebar') {
//             setScheduledEvents(prev => [...prev, newEvent]);
//             setUnscheduled(prev => prev.filter(i => i.id !== draggedItem.id));
//         } else {
//             // Update existing
//             setScheduledEvents(prev => prev.map(evt => evt.id === draggedItem.id ? newEvent : evt));
//         }
//
//         resetDragState();
//     };
//
//     const handleRemoveEvent = (e, eventId) => {
//         e.stopPropagation();
//         if(window.confirm("Gỡ lớp này khỏi lịch và đưa về hàng chờ?")) {
//             const evt = scheduledEvents.find(e => e.id === eventId);
//             setScheduledEvents(prev => prev.filter(e => e.id !== eventId));
//             setUnscheduled(prev => [...prev, {
//                 id: evt.id,
//                 course_class_id: evt.course_class_id,
//                 name: evt.name,
//                 teacher_name: evt.teacher_code,
//                 student_count: evt.student_count,
//                 duration: evt.num_of_period,
//                 subject_code: evt.subject_code,
//                 type: evt.type === 'manual' ? 'manual' : 'auto', // Giữ nguyên type hoặc reset
//                 weeks_needed: evt.weeks_needed,
//                 required_equipment: [] // Cần map lại nếu có
//             }]);
//         }
//     };
//
//     const resetDragState = () => {
//         setDraggedItem(null);
//         setDropTarget(null);
//     };
//
//     // --- RENDER ---
//     if (loading) return (
//         <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
//             <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-4" />
//             <p className="text-gray-500 font-medium">Đang tải dữ liệu thời khóa biểu...</p>
//         </div>
//     );
//
//     return (
//         <div className="flex h-screen bg-gray-100 overflow-hidden font-sans">
//
//             {/* ================= SIDEBAR (LỚP CHỜ) ================= */}
//             <div className="w-80 bg-white border-r shadow-xl flex flex-col z-20 shrink-0">
//                 <div className="p-5 border-b bg-gradient-to-r from-indigo-50 to-white">
//                     <h2 className="font-bold text-lg text-indigo-900 flex items-center gap-2">
//                         <Hash className="w-5 h-5"/> Lớp chưa xếp
//                         <span className="ml-auto bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full text-xs font-bold">
//                             {unscheduled.length}
//                         </span>
//                     </h2>
//                     <p className="text-xs text-gray-500 mt-1">Kéo thẻ vào ô trống trên lịch</p>
//                 </div>
//
//                 <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-gray-50/50">
//                     {unscheduled.map(item => (
//                         <div
//                             key={item.id}
//                             draggable
//                             onDragStart={(e) => handleDragStart(e, item, 'sidebar')}
//                             className={`
//                                 group p-3 rounded-lg border shadow-sm hover:shadow-md cursor-grab active:cursor-grabbing relative bg-white transition-all
//                                 ${item.type === 'lab' ? 'border-l-4 border-l-purple-500' : 'border-l-4 border-l-blue-500'}
//                             `}
//                         >
//                             <div className="pl-2">
//                                 <div className="flex justify-between items-start mb-1">
//                                     <span className="font-bold text-gray-800 text-sm">{item.subject_code}</span>
//                                     <span className={`text-[9px] px-1.5 py-0.5 rounded uppercase font-bold tracking-wider
//                                         ${item.type === 'lab' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
//                                         {item.type === 'lab' ? 'LAB' : 'LT'}
//                                     </span>
//                                 </div>
//                                 <h3 className="text-sm font-medium text-gray-700 leading-tight mb-2 line-clamp-2">
//                                     {item.name}
//                                 </h3>
//
//                                 <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
//                                     <User className="w-3 h-3" /> {item.teacher_name}
//                                 </div>
//
//                                 <div className="flex flex-wrap gap-2 items-center">
//                                     <div className="flex items-center text-xs text-gray-600 bg-gray-100 px-1.5 py-0.5 rounded border">
//                                         <Calendar className="w-3 h-3 mr-1"/> {item.weeks_needed} tuần
//                                     </div>
//                                     <div className="flex items-center text-xs text-gray-600 bg-gray-100 px-1.5 py-0.5 rounded border">
//                                         <User className="w-3 h-3 mr-1"/> {item.student_count} SV
//                                     </div>
//                                 </div>
//
//                                 {/* Equipment Tags */}
//                                 {item.required_equipment && item.required_equipment.length > 0 && (
//                                     <div className="mt-2 flex flex-wrap gap-1">
//                                         {item.required_equipment.map(eq => (
//                                             <span key={eq} className="text-[9px] bg-orange-50 border border-orange-100 text-orange-600 px-1 rounded">
//                                                 {eq}
//                                             </span>
//                                         ))}
//                                     </div>
//                                 )}
//                             </div>
//                         </div>
//                     ))}
//                     {unscheduled.length === 0 && (
//                         <div className="flex flex-col items-center justify-center h-40 text-gray-400 italic text-sm">
//                             <Save className="w-8 h-8 mb-2 opacity-20"/>
//                             Đã xếp hết các lớp!
//                         </div>
//                     )}
//                 </div>
//             </div>
//
//             {/* ================= MAIN CONTENT ================= */}
//             <div className="flex-1 flex flex-col h-full overflow-hidden relative">
//
//                 {/* TOOLBAR */}
//                 <div className="h-16 bg-white border-b flex items-center justify-between px-6 shadow-sm z-10 shrink-0 gap-6">
//
//                     {/* 1. Chọn Tòa nhà */}
//                     <div className="flex items-center gap-3">
//                         <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 border rounded-md hover:bg-gray-100 transition-colors">
//                             <Building className="w-4 h-4 text-gray-500"/>
//                             <span className="text-sm font-medium text-gray-600">Khu vực:</span>
//                             <select
//                                 className="bg-transparent text-sm font-bold text-gray-800 outline-none cursor-pointer min-w-[150px]"
//                                 value={selectedBuilding}
//                                 onChange={e => setSelectedBuilding(e.target.value)}
//                             >
//                                 {BUILDINGS.map(b => (
//                                     <option key={b.id} value={b.id}>{b.name}</option>
//                                 ))}
//                             </select>
//                         </div>
//                     </div>
//
//                     {/* 2. Chọn Tuần (Slider) */}
//                     <div className="flex-1 max-w-xl flex items-center gap-4 bg-gray-50 px-4 py-2 rounded-full border border-gray-200">
//                         <div className="flex flex-col items-center w-24 border-r border-gray-200 pr-2">
//                             <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wide">Hiển thị</span>
//                             <span className="text-sm font-bold text-indigo-600">Tuần {currentWeek}</span>
//                         </div>
//                         <input
//                             type="range"
//                             min="1" max="15"
//                             value={currentWeek}
//                             onChange={e => setCurrentWeek(parseInt(e.target.value))}
//                             className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600 hover:accent-indigo-700"
//                         />
//                         <span className="text-xs text-gray-400 font-medium whitespace-nowrap">15 tuần</span>
//                     </div>
//
//                     {/* Legend & Save */}
//                     <div className="flex items-center gap-4">
//                         <div className="flex flex-col text-[10px] text-gray-500 gap-0.5">
//                             <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500"></span> Tự động</div>
//                             <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> Thủ công</div>
//                         </div>
//                         <button
//                             className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 text-sm font-medium shadow-sm transition-all active:scale-95"
//                             onClick={() => alert("Gọi API lưu xuống DB...")}
//                         >
//                             <Save className="w-4 h-4" /> Lưu Lịch
//                         </button>
//                     </div>
//                 </div>
//
//                 {/* TIMETABLE GRID */}
//                 <div className="flex-1 overflow-auto bg-gray-100 p-4 relative scroll-smooth">
//                     <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden min-w-[1200px]">
//                         <table className="w-full border-collapse table-fixed">
//                             <thead>
//                             <tr>
//                                 <th className="w-40 p-3 border-b border-r bg-gray-50 text-gray-600 font-bold text-sm sticky top-0 left-0 z-30 shadow-sm text-left pl-4">
//                                     {BUILDINGS.find(b => b.id == selectedBuilding)?.name}
//                                 </th>
//                                 {DAYS.map(day => (
//                                     <th key={day.id} className="p-3 border-b border-r bg-gray-50 text-gray-700 font-bold text-sm sticky top-0 z-20 shadow-sm">
//                                         {day.name}
//                                     </th>
//                                 ))}
//                             </tr>
//                             </thead>
//                             <tbody>
//                             {visibleRooms.length === 0 && (
//                                 <tr>
//                                     <td colSpan={8} className="p-20 text-center text-gray-400 italic bg-gray-50/30">
//                                         <div className="flex flex-col items-center">
//                                             <Filter className="w-10 h-10 mb-2 opacity-20"/>
//                                             Không tìm thấy phòng nào trong khu vực này.
//                                         </div>
//                                     </td>
//                                 </tr>
//                             )}
//
//                             {visibleRooms.map(room => (
//                                 <tr key={room.id} className="divide-x divide-gray-200">
//                                     {/* Cột Tên Phòng */}
//                                     <td className="p-4 border-b bg-white font-bold text-gray-800 text-sm sticky left-0 z-10 align-top shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">
//                                         <div className="flex flex-col gap-2">
//                                             <div className="flex items-center justify-between">
//                                                 <span className="text-lg text-gray-900">{room.code}</span>
//                                                 {room.type === 'lab' ? <Beaker className="w-4 h-4 text-purple-500"/> : <Monitor className="w-4 h-4 text-blue-500"/>}
//                                             </div>
//                                             <div className="text-xs font-normal text-gray-500 flex items-center gap-1">
//                                                 <User className="w-3 h-3"/> {room.capacity} chỗ
//                                             </div>
//                                             <div className="flex flex-wrap gap-1 mt-1">
//                                                 {room.equipment.map(eq => (
//                                                     <span key={eq} className="text-[9px] bg-gray-100 px-1.5 py-0.5 rounded text-gray-600 border border-gray-200">
//                                                             {eq}
//                                                         </span>
//                                                 ))}
//                                             </div>
//                                         </div>
//                                     </td>
//
//                                     {/* Các Cột Ngày */}
//                                     {DAYS.map(day => (
//                                         <td key={day.id} className="p-0 border-b relative h-[480px] align-top bg-white hover:bg-gray-50 transition-colors">
//                                             {/* Background Grid Lines (12 Tiết) */}
//                                             <div className="w-full h-full relative grid grid-rows-12 pointer-events-none">
//                                                 {PERIODS.map(period => (
//                                                     <div key={period} className={`border-b border-gray-100 relative ${period === 6 ? 'border-b-gray-300' : ''}`}>
//                                                             <span className="absolute left-1 top-0.5 text-[8px] text-gray-300 font-mono select-none">
//                                                                 {period}
//                                                             </span>
//                                                     </div>
//                                                 ))}
//                                             </div>
//
//                                             {/* Active Drop Zones Layer */}
//                                             <div className="absolute inset-0 grid grid-rows-12">
//                                                 {PERIODS.map(period => (
//                                                     <div
//                                                         key={period}
//                                                         onDragOver={(e) => handleDragOver(e, room.id, day.id, period)}
//                                                         onDrop={(e) => handleDrop(e, room.id, day.id, period)}
//                                                         className={`z-10 transition-colors duration-75
//                                                                 ${dropTarget?.roomId === room.id && dropTarget?.dayId === day.id && dropTarget?.period === period
//                                                             ? 'bg-indigo-500/10 ring-inset ring-1 ring-indigo-400'
//                                                             : ''}
//                                                             `}
//                                                     />
//                                                 ))}
//                                             </div>
//
//                                             {/* Events Layer */}
//                                             {visibleEvents
//                                                 .filter(e => e.room_id === room.id && e.day_id === day.id)
//                                                 .map(evt => {
//                                                     const isManual = evt.type === 'manual';
//                                                     return (
//                                                         <div
//                                                             key={evt.id}
//                                                             draggable
//                                                             onDragStart={(e) => handleDragStart(e, evt, 'grid')}
//                                                             className={`
//                                                                     absolute left-1 right-1 rounded-md px-2 py-1.5 cursor-move shadow-sm border text-xs z-20 group
//                                                                     flex flex-col justify-between transition-all hover:shadow-md hover:scale-[1.01]
//                                                                     ${isManual
//                                                                 ? 'bg-emerald-50 border-emerald-200 text-emerald-900 border-l-4 border-l-emerald-500'
//                                                                 : 'bg-blue-50 border-blue-200 text-blue-900 border-l-4 border-l-blue-500'}
//                                                                 `}
//                                                             style={{
//                                                                 top: `${((evt.start_period - 1) / 12) * 100}%`,
//                                                                 height: `calc(${(evt.num_of_period / 12) * 100}% - 2px)`,
//                                                                 marginTop: '1px'
//                                                             }}
//                                                             title={`${evt.name} (${evt.subject_code})`}
//                                                         >
//                                                             {/* Hover Action: Remove */}
//                                                             <button
//                                                                 onClick={(e) => handleRemoveEvent(e, evt.id)}
//                                                                 className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 bg-white/80 rounded-full p-0.5 transition-all shadow-sm"
//                                                             >
//                                                                 <XCircle className="w-3.5 h-3.5" />
//                                                             </button>
//
//                                                             <div className="font-bold truncate text-[11px] leading-tight">
//                                                                 {evt.subject_code}
//                                                             </div>
//                                                             <div className="truncate text-[10px] opacity-80 leading-tight">
//                                                                 {evt.name}
//                                                             </div>
//
//                                                             <div className="mt-1 flex items-center justify-between opacity-70">
//                                                                 <div className="flex items-center gap-1">
//                                                                     <User className="w-3 h-3" /> {evt.teacher_code}
//                                                                 </div>
//                                                                 <div className="text-[9px] bg-white/60 px-1 rounded border border-black/5">
//                                                                     W{evt.start_week}-{evt.start_week + evt.weeks_needed - 1}
//                                                                 </div>
//                                                             </div>
//                                                         </div>
//                                                     );
//                                                 })}
//                                         </td>
//                                     ))}
//                                 </tr>
//                             ))}
//                             </tbody>
//                         </table>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// };
//
// export default ManualScheduler;

import React, { useEffect, useState, useMemo } from 'react';
import {
    Loader2, Save, GripVertical, Calendar,
    User, Hash, XCircle, Building,
    Monitor, Beaker, Filter, AlertTriangle
} from 'lucide-react';
import {generateScheduleInstance, saveManualSchedule, saveSchedule} from "../../services/scheduleService.js";
import {showError, showSuccess} from "../../utils/ToastUtils.js";
import {useSemesterConfig} from "../../stores/ScheduleDataStore.js";

// ==========================================
// 0. MOCK STORE (Thay thế cho ScheduleDataStore.js)
// ==========================================

const MOCK_DATA = {
    semester: {
        id: 1,
        code: "HK1 2025-2026",
        name: "Học kỳ 1 2025-2026",
        start: "2025-09-01",
        end: "2026-01-15",
        status: "upcoming"
    },
    buildings: [
        { id: 1, name: "Tòa A1", code: "TSCH-A" },
        { id: 2, name: "Tòa B1", code: "TSCH-B" },
        { id: 3, name: "Tòa C1", code: "TSCH-C" }
    ],
    rooms: [
        {
            id: 1, buildings_id: 1, code: "1A01", name: "Phòng TSCH-A - 01",
            type: "Lý thuyết", capacity_max: 60, capacity_optimal: 40,
            equipments: [{ name: "Máy chiếu" }, { name: "Micro" }]
        },
        {
            id: 2, buildings_id: 1, code: "1A02", name: "Phòng TSCH-A - 02",
            type: "Thực hành", capacity_max: 30, capacity_optimal: 25,
            equipments: [{ name: "Máy tính" }, { name: "Máy chiếu" }]
        },
        {
            id: 3, buildings_id: 1, code: "1A03", name: "Phòng TSCH-A - 03",
            type: "Lý thuyết", capacity_max: 60, capacity_optimal: 40,
            equipments: [{ name: "TV" }]
        }
    ],
    teachers: [
        { id: 1, name: "Nguyễn Văn A", teacher_identifier: "GV001" },
        { id: 2, name: "Trần Thị B", teacher_identifier: "GV002" },
        { id: 3, name: "Lê Văn C", teacher_identifier: "GV003" }
    ],
    subjects: [
        { id: 1, code: "MH001", name: "Lập trình Cơ bản" },
        { id: 2, code: "MH002", name: "Cơ sở dữ liệu" },
        { id: 3, code: "MH003", name: "Trí tuệ nhân tạo" }
    ],
    courses: [
        {
            id: 1, name: "IT", subject_id: 2, teacher_id: 3,
            duration_per_session: 4, total_enrollment: 30
        },
        {
            id: 2, name: "IT1", subject_id: 1, teacher_id: 2,
            duration_per_session: 4, total_enrollment: 40
        },
        {
            id: 3, name: "AI", subject_id: 3, teacher_id: 1,
            duration_per_session: 4, total_enrollment: 30
        }
    ],
    equipments: [
        { id: 1, name: "Máy chiếu" },
        { id: 6, name: "Máy tính" }
    ],
    subjectReqs: [
        { subject_id: 1, equipment_id: 6, type: "REQ" }, // Lập trình cần Máy tính
        { subject_id: 2, equipment_id: 6, type: "REQ" }  // CSDL cần Máy tính
    ]
};

// --- SIMULATED HOOKS ---
const useBuildings = () => MOCK_DATA.buildings;
const useRooms = () => MOCK_DATA.rooms;
const useCourses = () => MOCK_DATA.courses;
const useTeachers = () => MOCK_DATA.teachers;
const useSubjects = () => MOCK_DATA.subjects;
const useEquipments = () => MOCK_DATA.equipments;
const useSubjectRequiresEquipment = () => MOCK_DATA.subjectReqs;
const useSelectedSemester = () => MOCK_DATA.semester;


// ==========================================
// 1. CONSTANTS
// ==========================================
const PERIODS = Array.from({ length: 12 }, (_, i) => i + 1);
const DAYS = [
    { id: 2, name: 'Thứ 2' }, { id: 3, name: 'Thứ 3' }, { id: 4, name: 'Thứ 4' },
    { id: 5, name: 'Thứ 5' }, { id: 6, name: 'Thứ 6' }, { id: 7, name: 'Thứ 7' },
    { id: 8, name: 'CN' }
];

// Helper: Tính toán số tuần dựa trên ngày bắt đầu/kết thúc học kỳ
const calculateWeeks = (start, end) => {
    if (!start || !end) return 15;
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffTime = Math.abs(endDate - startDate);
    const diffWeeks = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 7));
    return diffWeeks || 15;
};

// ==========================================
// 2. MAIN COMPONENT
// ==========================================
const ManualScheduler = () => {
    // --- STORE HOOKS ---
    const rawBuildings = useBuildings();
    const rawRooms = useRooms();
    const rawCourses = useCourses();
    const rawTeachers = useTeachers();
    const rawSubjects = useSubjects();
    const rawEquipments = useEquipments();
    const rawSubjectReqs = useSubjectRequiresEquipment();
    const selectedSemester = {
        "id": 1,
        "AcademicYearsid": 1,
        "code": "HK1 2025-2026",
        "name": "Học kỳ 1 2025-2026",
        "start": "2025-09-01",
        "end": "2026-01-15",
        "status": "upcoming"
    } //useSelectedSemester();

    // --- LOCAL STATE ---
    // scheduledEvents chính là "Pattern" đang được xếp trên client
    const [scheduledEvents, setScheduledEvents] = useState([]);

    // Filters & UI State
    const [selectedBuilding, setSelectedBuilding] = useState(null); // ID tòa nhà
    const [currentWeek, setCurrentWeek] = useState(1);
    const [loading, setLoading] = useState(true);
    const [semesterWeeks, setSemesterWeeks] = useState(15);

    // Dragging State
    const [draggedItem, setDraggedItem] = useState(null);
    const [dropTarget, setDropTarget] = useState(null);

    // --- DATA TRANSFORMATION (MEMOIZED) ---

    // 1. Xử lý dữ liệu Phòng & Thiết bị
    const formattedRooms = useMemo(() => {
        if (!rawRooms || rawRooms.length === 0) return [];
        return rawRooms.map(r => {
            // Map Vietnamese types to UI keys
            const uiType = r.type === 'Thực hành' ? 'lab' : 'theory';

            // Extract equipment names from nested objects if available, or find manually
            // Dựa trên log, rooms có sẵn r.equipments (nested)
            const eqList = r.equipments ? r.equipments.map(e => e.name) : [];

            return {
                id: r.id,
                building_id: r.buildings_id, // Lưu ý: API trả về 'buildings_id'
                code: r.code,
                name: r.name,
                capacity: r.capacity_optimal || r.capacity_max, // Ưu tiên optimal
                type: uiType,
                equipment: eqList
            };
        });
    }, [rawRooms]);

    // 2. Xử lý dữ liệu Lớp học (Courses) chưa xếp
    // Logic: Lấy tất cả courses, trừ đi những cái đã có trong scheduledEvents
    const unscheduledItems = useMemo(() => {
        if (!rawCourses) return [];

        const allItems = rawCourses.map(c => {
            const subject = rawSubjects.find(s => s.id === c.subject_id);
            const teacher = rawTeachers.find(t => t.id === c.teacher_id);

            // Tìm thiết bị bắt buộc
            const reqIds = rawSubjectReqs
                .filter(req => req.subject_id === c.subject_id && req.type === 'REQ')
                .map(req => req.equipment_id);

            const reqNames = reqIds.map(id => {
                const eq = rawEquipments.find(e => e.id === id);
                return eq ? eq.name : null;
            }).filter(Boolean);

            // Xác định loại lớp (Heuristic: Nếu cần Máy tính -> Lab, ngược lại Theory)
            // Hoặc dựa vào subject.practice_hours > theory_hours
            // Ở đây mình check nếu cần "Máy tính" (thường là EQ006 theo log)
            const needsPC = reqNames.some(n => n.toLowerCase().includes('máy tính') || n.toLowerCase().includes('pc'));
            const type = needsPC ? 'lab' : 'theory';

            return {
                id: c.id, // course_class_id
                course_class_id: c.id, // Giữ key này để mapping lúc save
                name: c.name, // e.g. "IT1"
                subject_code: subject ? subject.code : 'N/A',
                subject_name: subject ? subject.name : 'Unknown Subject',
                type: type,
                teacher_name: teacher ? teacher.name : 'Chưa phân công',
                teacher_code: teacher ? teacher.teacher_identifier : 'N/A',
                teacher_id: c.teacher_id,
                student_count: c.total_enrollment,
                duration: c.duration_per_session || 3, // Default 3 tiết nếu null
                weeks_needed: 15, // Mặc định full kỳ nếu không có data specific
                required_equipment: reqNames
            };
        });

        // Filter out items that are already scheduled
        // So sánh course_class_id
        return allItems.filter(item => !scheduledEvents.some(evt => evt.course_class_id === item.id));

    }, [rawCourses, rawSubjects, rawTeachers, rawSubjectReqs, rawEquipments, scheduledEvents]);


    // --- EFFECTS ---

    useEffect(() => {
        // Init logic
        if (selectedSemester) {
            const weeks = calculateWeeks(selectedSemester.start, selectedSemester.end);
            setSemesterWeeks(weeks);
        }

        // Default selected building
        if (rawBuildings.length > 0 && !selectedBuilding) {
            setSelectedBuilding(rawBuildings[0].id);
        }

        // Simulate initial fetch delay or wait for store
        if (rawRooms.length > 0) {
            setLoading(false);
        }
    }, [selectedSemester, rawBuildings, rawRooms]);


    // --- LOGIC LỌC HIỂN THỊ TRÊN GRID ---

    // 1. Lọc phòng theo Tòa nhà đang chọn
    // Note: rawRooms có buildings_id, rawBuildings có id
    const visibleRooms = formattedRooms.filter(r => r.building_id === parseInt(selectedBuilding));

    // 2. Lọc sự kiện hiển thị theo Tuần hiện tại (Slider)
    const visibleEvents = scheduledEvents.filter(evt => {
        const endWeek = evt.start_week + evt.weeks_needed - 1;
        return currentWeek >= evt.start_week && currentWeek <= endWeek;
    });

    // --- HANDLERS (DRAG & DROP) ---

    const handleDragStart = (e, item, source) => {
        setDraggedItem({ ...item, source });
        e.dataTransfer.setData('text/plain', JSON.stringify(item));
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e, roomId, dayId, period) => {
        e.preventDefault();
        if (dropTarget?.roomId !== roomId || dropTarget?.dayId !== dayId || dropTarget?.period !== period) {
            setDropTarget({ roomId, dayId, period });
        }
    };

    const handleDrop = (e, roomId, dayId, period) => {
        e.preventDefault();
        if (!draggedItem) return;

        const targetRoom = formattedRooms.find(r => r.id === roomId);

        // --- VALIDATION 1: Type Check ---
        if (draggedItem.type && targetRoom.type && draggedItem.type !== targetRoom.type) {
            const msg = `⚠️ CẢNH BÁO LOẠI PHÒNG!\n` +
                `Môn: ${draggedItem.type === 'lab' ? 'THỰC HÀNH' : 'LÝ THUYẾT'}\n` +
                `Phòng: ${targetRoom.type === 'lab' ? 'THỰC HÀNH' : 'LÝ THUYẾT'}\n` +
                `Vẫn muốn xếp vào?`;
            if (!window.confirm(msg)) {
                resetDragState();
                return;
            }
        }

        // --- VALIDATION 2: Equipment Check ---
        if (draggedItem.required_equipment && draggedItem.required_equipment.length > 0) {
            const missing = draggedItem.required_equipment.filter(req =>
                !targetRoom.equipment.some(eqName => eqName.toLowerCase().includes(req.toLowerCase()))
            );

            if (missing.length > 0) {
                const msg = `⚠️ THIẾU THIẾT BỊ:\n` +
                    `Phòng ${targetRoom.code} thiếu: ${missing.join(', ')}\n` +
                    `Tiếp tục?`;
                if (!window.confirm(msg)) {
                    resetDragState();
                    return;
                }
            }
        }

        // --- VALIDATION 3: Capacity ---
        if (draggedItem.student_count > targetRoom.capacity) {
            if (!window.confirm(`⚠️ QUÁ TẢI: Lớp ${draggedItem.student_count} SV > Phòng ${targetRoom.capacity} chỗ. Tiếp tục?`)) {
                resetDragState();
                return;
            }
        }

        // --- VALIDATION 4: Conflict Check (Client-side) ---
        const duration = draggedItem.duration;
        const hasConflict = visibleEvents.some(evt =>
            evt.room_id === roomId &&
            evt.day_id === dayId &&
            evt.id !== draggedItem.id && // Ignore self if moving
            (
                (period >= evt.start_period && period < evt.start_period + evt.num_of_period) ||
                (period + duration - 1 >= evt.start_period && period + duration - 1 < evt.start_period + evt.num_of_period)
            )
        );

        if (hasConflict) {
            if (!window.confirm("⚠️ TRÙNG LỊCH: Đã có lớp học tại đây. Bạn có muốn ghi đè/xếp chồng không?")) {
                resetDragState();
                return;
            }
        }

        // --- UPDATE STATE (PATTERN) ---
        const newEvent = {
            ...draggedItem,
            id: draggedItem.id || `temp-${Date.now()}`, // Ensure ID
            // Các trường quan trọng cho Backend
            room_id: roomId,
            day_id: dayId,
            start_period: period,
            num_of_period: duration,
            start_week: currentWeek, // User chọn tuần bắt đầu

            // Metadata hiển thị
            type: 'manual', // Đánh dấu là sửa tay
            is_new: true
        };

        if (draggedItem.source === 'sidebar') {
            setScheduledEvents(prev => [...prev, newEvent]);
        } else {
            // Update existing in grid
            setScheduledEvents(prev => prev.map(evt => evt.id === draggedItem.id ? newEvent : evt));
        }

        resetDragState();
    };

    const handleRemoveEvent = (e, eventId) => {
        e.stopPropagation();
        if(window.confirm("Gỡ lớp này về danh sách chờ?")) {
            setScheduledEvents(prev => prev.filter(e => e.id !== eventId));
        }
    };

    const resetDragState = () => {
        setDraggedItem(null);
        setDropTarget(null);
    };

    // --- API CALL HANDLER ---
    const semester_config = useSemesterConfig();
    const handleSaveSchedule = async () => {
        // ... validation code cũ ...
        setLoading(true);

        const payload = {
            semester_id: selectedSemester?.id,
            semester: selectedSemester,
            semester_config: semester_config,
            generation_name: `Lịch thủ công (Lưu lúc ${new Date().getHours()}:${new Date().getMinutes()})`,
            schedules: scheduledEvents.map(evt => ({
                course_class_id: evt.course_class_id,
                teacher_id: evt.teacher_id,
                day_id: evt.day_id,
                room_id: evt.room_id,
                start_period: evt.start_period, // Đảm bảo trường này tồn tại
                num_of_period: evt.num_of_period,
                week_start: evt.start_week,
                week_end: evt.start_week + evt.weeks_needed - 1,
            }))
        };

        try {
            // GỌI API THỰC TẾ
            const response = await saveManualSchedule(payload);
            console.log("Save response:", response);
            if (response.success) {
                alert(`${response.message}\nMã phương án: ${response.data.generation_id}`);
                // Có thể reset state hoặc chuyển hướng user tại đây
            }
        } catch (error) {
            console.error("Save failed:", error);
            const errMsg = error.response?.data?.message || error.message;
            alert("Lưu thất bại: " + errMsg);
        } finally {
            setLoading(false);
        }
    };

    // --- RENDER ---

    // Fallback loading
    if (loading && rawRooms.length === 0) return (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
            <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-4" />
            <p className="text-gray-500 font-medium">Đang tải dữ liệu thực tế...</p>
        </div>
    );

    return (
        <div className="flex h-screen bg-gray-100 overflow-hidden font-sans">

            {/* ================= SIDEBAR ================= */}
            <div className="w-80 bg-white border-r shadow-xl flex flex-col z-20 shrink-0">
                <div className="p-5 border-b bg-gradient-to-r from-indigo-50 to-white">
                    <h2 className="font-bold text-lg text-indigo-900 flex items-center gap-2">
                        <Hash className="w-5 h-5"/> Lớp chưa xếp
                        <span className="ml-auto bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full text-xs font-bold">
                            {unscheduledItems.length}
                        </span>
                    </h2>
                    <p className="text-xs text-gray-500 mt-1">
                        {selectedSemester?.name || 'Học kỳ ...'}
                    </p>
                </div>

                <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-gray-50/50">
                    {unscheduledItems.map(item => (
                        <div
                            key={item.id}
                            draggable
                            onDragStart={(e) => handleDragStart(e, item, 'sidebar')}
                            className={`
                                group p-3 rounded-lg border shadow-sm hover:shadow-md cursor-grab active:cursor-grabbing relative bg-white transition-all
                                ${item.type === 'lab' ? 'border-l-4 border-l-purple-500' : 'border-l-4 border-l-blue-500'}
                            `}
                        >
                            <div className="pl-2">
                                <div className="flex justify-between items-start mb-1">
                                    <span className="font-bold text-gray-800 text-sm">{item.subject_code}</span>
                                    <span className={`text-[9px] px-1.5 py-0.5 rounded uppercase font-bold tracking-wider
                                        ${item.type === 'lab' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                                        {item.type === 'lab' ? 'LAB' : 'LT'}
                                    </span>
                                </div>
                                <h3 className="text-sm font-medium text-gray-700 leading-tight mb-1">
                                    {item.subject_name}
                                </h3>
                                <p className="text-xs text-gray-400 mb-2">Lớp: {item.name}</p>

                                <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                                    <User className="w-3 h-3" /> {item.teacher_name}
                                </div>

                                <div className="flex flex-wrap gap-2 items-center">
                                    <div className="flex items-center text-xs text-gray-600 bg-gray-100 px-1.5 py-0.5 rounded border">
                                        <Monitor className="w-3 h-3 mr-1"/> {item.duration} tiết
                                    </div>
                                    <div className="flex items-center text-xs text-gray-600 bg-gray-100 px-1.5 py-0.5 rounded border">
                                        <User className="w-3 h-3 mr-1"/> {item.student_count} SV
                                    </div>
                                </div>

                                {item.required_equipment && item.required_equipment.length > 0 && (
                                    <div className="mt-2 flex flex-wrap gap-1">
                                        {item.required_equipment.map((eq, idx) => (
                                            <span key={idx} className="text-[9px] bg-orange-50 border border-orange-100 text-orange-600 px-1 rounded">
                                                {eq}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                    {unscheduledItems.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-40 text-gray-400 italic text-sm">
                            <Save className="w-8 h-8 mb-2 opacity-20"/>
                            Đã xếp hết các lớp!
                        </div>
                    )}
                </div>
            </div>

            {/* ================= MAIN GRID ================= */}
            <div className="flex-1 flex flex-col h-full overflow-hidden relative">

                {/* TOOLBAR */}
                <div className="h-16 bg-white border-b flex items-center justify-between px-6 shadow-sm z-10 shrink-0 gap-6">

                    {/* Selector Tòa nhà (Dữ liệu thực) */}
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 border rounded-md hover:bg-gray-100 transition-colors">
                            <Building className="w-4 h-4 text-gray-500"/>
                            <span className="text-sm font-medium text-gray-600">Khu vực:</span>
                            <select
                                className="bg-transparent text-sm font-bold text-gray-800 outline-none cursor-pointer min-w-[150px]"
                                value={selectedBuilding || ''}
                                onChange={e => setSelectedBuilding(e.target.value)}
                            >
                                {rawBuildings.map(b => (
                                    <option key={b.id} value={b.id}>{b.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Slider Tuần */}
                    <div className="flex-1 max-w-xl flex items-center gap-4 bg-gray-50 px-4 py-2 rounded-full border border-gray-200">
                        <div className="flex flex-col items-center w-24 border-r border-gray-200 pr-2">
                            <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wide">Hiển thị</span>
                            <span className="text-sm font-bold text-indigo-600">Tuần {currentWeek}</span>
                        </div>
                        <input
                            type="range"
                            min="1" max={semesterWeeks}
                            value={currentWeek}
                            onChange={e => setCurrentWeek(parseInt(e.target.value))}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600 hover:accent-indigo-700"
                        />
                        <span className="text-xs text-gray-400 font-medium whitespace-nowrap">{semesterWeeks} tuần</span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-4">
                        <button
                            onClick={handleSaveSchedule}
                            disabled={loading}
                            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 text-sm font-medium shadow-sm transition-all active:scale-95 disabled:opacity-50"
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin"/> : <Save className="w-4 h-4" />}
                            Lưu thay đổi
                        </button>
                    </div>
                </div>

                {/* TIMETABLE */}
                <div className="flex-1 overflow-auto bg-gray-100 p-4 relative scroll-smooth">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden min-w-[1200px]">
                        <table className="w-full border-collapse table-fixed">
                            <thead>
                            <tr>
                                <th className="w-48 p-3 border-b border-r bg-gray-50 text-gray-600 font-bold text-sm sticky top-0 left-0 z-30 shadow-sm text-left pl-4">
                                    {rawBuildings.find(b => b.id == selectedBuilding)?.name || 'Phòng học'}
                                </th>
                                {DAYS.map(day => (
                                    <th key={day.id} className="p-3 border-b border-r bg-gray-50 text-gray-700 font-bold text-sm sticky top-0 z-20 shadow-sm">
                                        {day.name}
                                    </th>
                                ))}
                            </tr>
                            </thead>
                            <tbody>
                            {visibleRooms.length === 0 && (
                                <tr>
                                    <td colSpan={8} className="p-20 text-center text-gray-400 italic bg-gray-50/30">
                                        <div className="flex flex-col items-center">
                                            <Filter className="w-10 h-10 mb-2 opacity-20"/>
                                            Không tìm thấy phòng nào trong khu vực này.
                                        </div>
                                    </td>
                                </tr>
                            )}

                            {visibleRooms.map(room => (
                                <tr key={room.id} className="divide-x divide-gray-200">
                                    {/* Cột thông tin phòng */}
                                    <td className="p-4 border-b bg-white font-bold text-gray-800 text-sm sticky left-0 z-10 align-top shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">
                                        <div className="flex flex-col gap-2">
                                            <div className="flex items-center justify-between">
                                                <span className="text-lg text-gray-900">{room.code}</span>
                                                {/* Icon phân biệt Lab/Theory ngay tại phòng */}
                                                {room.type === 'lab'
                                                    ? <div title="Phòng Thực hành"><Beaker className="w-4 h-4 text-purple-600"/></div>
                                                    : <div title="Phòng Lý thuyết"><Monitor className="w-4 h-4 text-blue-600"/></div>
                                                }
                                            </div>
                                            <div className="text-xs font-normal text-gray-500 flex items-center gap-1">
                                                <User className="w-3 h-3"/> {room.capacity} chỗ
                                            </div>
                                            <div className="flex flex-wrap gap-1 mt-1">
                                                {room.equipment.map((eq, idx) => (
                                                    <span key={idx} className="text-[9px] bg-gray-100 px-1.5 py-0.5 rounded text-gray-600 border border-gray-200 truncate max-w-[100px]">
                                                        {eq.name || eq}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </td>

                                    {/* Các cột Ngày */}
                                    {DAYS.map(day => (
                                        <td key={day.id} className="p-0 border-b relative h-[480px] align-top bg-white hover:bg-gray-50 transition-colors">
                                            {/* Grid Lines */}
                                            <div className="w-full h-full relative grid grid-rows-12 pointer-events-none">
                                                {PERIODS.map(period => (
                                                    <div key={period} className={`border-b border-gray-100 relative ${period === 6 ? 'border-b-gray-300' : ''}`}>
                                                        <span className="absolute left-1 top-0.5 text-[8px] text-gray-300 font-mono select-none">
                                                            {period}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Drop Zones */}
                                            <div className="absolute inset-0 grid grid-rows-12">
                                                {PERIODS.map(period => (
                                                    <div
                                                        key={period}
                                                        onDragOver={(e) => handleDragOver(e, room.id, day.id, period)}
                                                        onDrop={(e) => handleDrop(e, room.id, day.id, period)}
                                                        className={`z-10 transition-colors duration-75 
                                                            ${dropTarget?.roomId === room.id && dropTarget?.dayId === day.id && dropTarget?.period === period
                                                            ? 'bg-indigo-500/10 ring-inset ring-1 ring-indigo-400'
                                                            : ''}
                                                        `}
                                                    />
                                                ))}
                                            </div>

                                            {/* Render Events */}
                                            {visibleEvents
                                                .filter(e => e.room_id === room.id && e.day_id === day.id)
                                                .map(evt => (
                                                    <div
                                                        key={evt.id}
                                                        draggable
                                                        onDragStart={(e) => handleDragStart(e, evt, 'grid')}
                                                        className={`
                                                            absolute left-1 right-1 rounded-md px-2 py-1.5 cursor-move shadow-sm border text-xs z-20 group
                                                            flex flex-col justify-between transition-all hover:shadow-md hover:scale-[1.01]
                                                            ${evt.type === 'lab'
                                                            ? 'bg-purple-50 border-purple-200 text-purple-900 border-l-4 border-l-purple-500'
                                                            : 'bg-blue-50 border-blue-200 text-blue-900 border-l-4 border-l-blue-500'}
                                                        `}
                                                        style={{
                                                            top: `${((evt.start_period - 1) / 12) * 100}%`,
                                                            height: `calc(${(evt.num_of_period / 12) * 100}% - 2px)`,
                                                            marginTop: '1px'
                                                        }}
                                                        title={`${evt.subject_name} (${evt.teacher_name})`}
                                                    >
                                                        <button
                                                            onClick={(e) => handleRemoveEvent(e, evt.id)}
                                                            className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 bg-white/80 rounded-full p-0.5 transition-all shadow-sm"
                                                        >
                                                            <XCircle className="w-3.5 h-3.5" />
                                                        </button>

                                                        <div className="font-bold truncate text-[11px] leading-tight">
                                                            {evt.subject_code}
                                                        </div>
                                                        <div className="truncate text-[10px] opacity-80 leading-tight">
                                                            {evt.name}
                                                        </div>

                                                        <div className="mt-1 flex items-center justify-between opacity-70">
                                                            <div className="flex items-center gap-1 truncate max-w-[70px]">
                                                                <User className="w-3 h-3" /> {evt.teacher_code}
                                                            </div>
                                                            <div className="text-[9px] bg-white/60 px-1 rounded border border-black/5">
                                                                W{evt.start_week}-{evt.start_week + evt.weeks_needed - 1}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ManualScheduler;