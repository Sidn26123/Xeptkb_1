// // App.jsx
// import {BrowserRouter as Router} from 'react-router-dom';
// import {AppWrapper} from "./components/common/PageMeta.jsx";
// import {ThemeProvider} from "./context/ThemeContext.jsx";
// import {SidebarProvider} from "./context/SidebarContext.jsx";
// import AppRoutes from './routes/AppRoutes';
// import {
//     setSelectedConstraints,
//     setDays,
//     setEquipments,
//     setRooms,
//     setSemesters,
//     setTimeslots,
//     useSemesters,
//     setConstraints,
//     setTeachers,
//     setFaculties,
//     setSubjects,
//     setRoomEquipments,
//     setSubjectRequiresEquipment,
//     setCourseClasses
// } from "./stores/ScheduleDataStore.js";
// import {getAllSemesters} from "./services/semesterService.js";
// import {useEffect} from "react";
// import {ToastContainer} from "react-toastify";
// import {getAllRooms, getAllRoomsWithEquipment} from "./services/roomService.js";
// import {getAllEquipments} from "./services/equipmentService.js";
// import {getAllDays} from "./services/dayService.js";
// import {getAllTimeSlots} from "./services/timeSlotService.js";
// import {getAllConstraints} from "./services/constraintService.js";
// import {getAllTeachers} from "./services/teacherService.js";
// import {getAllFaculties} from "./services/facultyService.js";
// import {getAllSubjects} from "./services/subjectService.js";
// import {getAllRoomEquipments} from "./services/roomEquipmentService.js";
// import {getAllSubjectRequiresEquipments} from "./services/subjectEquipmentService.js";
// import {getAllCourseClasses} from "./services/courseClassService.js";
//
// function App() {
//
//     const loadInitialData = () => {
//         getAllSemesters().then(data => {
//             setSemesters(data);
//         });
//         getAllRoomsWithEquipment().then(data => {
//             setRooms(data);
//         });
//         getAllEquipments().then(data => {
//             setEquipments(data);
//         });
//         getAllDays().then(data => {
//             setDays(data);
//         });
//         getAllTimeSlots().then(data => {
//             setTimeslots(data);
//         });
//         getAllConstraints().then(data => {
//             setConstraints(data);
//         });
//         getAllFaculties().then(data => {
//             setFaculties(data);
//         });
//         getAllTeachers().then(data => {
//             setTeachers(data);
//         });
//         getAllSubjects().then(data => {
//             setSubjects(data);
//         });
//         getAllRoomEquipments().then(data => {
//             setRoomEquipments(data);
//         });
//         getAllSubjectRequiresEquipments().then(data => {
//             setSubjectRequiresEquipment(data);
//         });
//         getAllCourseClasses().then(data => {
//             setCourseClasses(data);
//             console.log("Loaded course classes:", data);
//         });
//
//     }
//     useEffect(() => {
//         loadInitialData();
//
//     }, []);
//
//     return (
//         <Router>
//             <ThemeProvider>
//                 <SidebarProvider>
//                     <AppWrapper>
//                         <AppRoutes/>
//                     </AppWrapper>
//
//                 </SidebarProvider>
//             </ThemeProvider>
//         </Router>
//     );
// }
//
// export default App;
// App.jsx
import {BrowserRouter as Router} from 'react-router-dom';
import {AppWrapper} from "./components/common/PageMeta.jsx";
import {ThemeProvider} from "./context/ThemeContext.jsx";
import {SidebarProvider} from "./context/SidebarContext.jsx";
import AppRoutes from './routes/AppRoutes';
import {
    setDays, setEquipments, setRooms, setSemesters, setTimeslots,
    setConstraints, setTeachers, setFaculties, setSubjects,
    setRoomEquipments, setSubjectRequiresEquipment, setCourseClasses, setCourses, setBuildings
} from "./stores/ScheduleDataStore.js";
import {getAllSemesters} from "./services/semesterService.js";
// Thêm useState vào import
import {useEffect, useState} from "react";
import {getAllRoomsWithEquipment} from "./services/roomService.js";
import {getAllEquipments} from "./services/equipmentService.js";
import {getAllDays} from "./services/dayService.js";
import {getAllTimeSlots} from "./services/timeSlotService.js";
import {getAllConstraints} from "./services/constraintService.js";
import {getAllTeachers} from "./services/teacherService.js";
import {getAllFaculties} from "./services/facultyService.js";
import {getAllSubjects} from "./services/subjectService.js";
import {getAllRoomEquipments} from "./services/roomEquipmentService.js";
import {getAllSubjectRequiresEquipments} from "./services/subjectEquipmentService.js";
import {getAllCourseClasses} from "./services/courseClassService.js";
import {getAllBuildings} from "./services/buildingService.js";

function App() {
    // 1. Tạo state để kiểm soát trạng thái loading
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadInitialData = async () => {
            try {
                // 2. Sử dụng Promise.all để chạy tất cả request song song
                // Nó sẽ đợi TẤT CẢ các hàm bên trong hoàn thành
                await Promise.all([
                    getAllSemesters().then(setSemesters),
                    getAllRoomsWithEquipment().then(setRooms),
                    getAllEquipments().then(setEquipments),
                    getAllDays().then(setDays),
                    getAllTimeSlots().then(setTimeslots),
                    getAllConstraints().then(setConstraints),
                    getAllFaculties().then(setFaculties),
                    getAllTeachers().then(setTeachers),
                    getAllSubjects().then(setSubjects),
                    getAllBuildings().then(setBuildings),
                    getAllRoomEquipments().then(setRoomEquipments),
                    getAllSubjectRequiresEquipments().then(setSubjectRequiresEquipment),
                    getAllCourseClasses().then((data) => {
                        setCourses(data);
                    })
                ]);
            } catch (error) {
                console.error("Lỗi khi tải dữ liệu khởi tạo:", error);
                // Bạn có thể show toast error ở đây nếu muốn
            } finally {
                // 3. Dù thành công hay thất bại, tắt loading để hiển thị App (hoặc trang lỗi)
                setIsLoading(false);
            }
        };

        loadInitialData();
    }, []);

    // 4. Màn hình chờ (Loading Screen)
    if (isLoading) {
        return (
            <div style={{
                height: '100vh',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                flexDirection: 'column'
            }}>
                {/* Bạn có thể thay bằng Spinner component đẹp hơn ở đây */}
                <h3>Đang tải dữ liệu...</h3>
            </div>
        );
    }

    return (
        <Router>
            <ThemeProvider>
                <SidebarProvider>
                    <AppWrapper>
                        <AppRoutes/>
                    </AppWrapper>
                </SidebarProvider>
            </ThemeProvider>
        </Router>
    );
}

export default App;