// AppRoutes.jsx
import { Routes, Route, Router } from "react-router-dom";
import Home from "../pages/Home";
import StudentManagement from "../pages/StudentManagement";
import AppLayout from "../layout/AppLayout";
import RequireAuth from "../components/auth/RequireAuth";
import ClassManagement from "../pages/ClassManagement";
import TeacherManagement from "../pages/TeacherManagement";
import SemesterManagement from "../pages/SemesterManagement";
import AcademicYearManagement from "../pages/AcademicYearManagement";
import FacultyManagement from "../pages/FacultyManagement";
import SubjectManagement from "../pages/SubjectManagement";
import SignIn from "../pages/SignIn";
import RAGApp from "../components/chatbot/RagApp.jsx";
import GuidePage from "../pages/GuidePage.jsx";
import TutorialPage from "../pages/GuidePage.jsx";
import SchedulerResourcesManagement from "../components/admin/SchedulerResources.jsx";
import {InputResourcesManagement} from "../components/admin/InputComponent.jsx";
import HolidayManagement from "../pages/HolidayManagement";
import EquipmentManagement from "../pages/EquipmentManagement.jsx";
import RoomManagement from "../pages/RoomManagement.jsx";
import ResearchScheduleManagement from "../pages/ResearchScheduleManagement";
import TimeSlotManagement from "../pages/TimeSlotManagement.jsx";
import DayManagement from "../pages/DayManagement.jsx";
import CourseClassManagement from "../pages/CourseClassManagement.jsx";
import {ReportPage} from "../pages/ReportPage.jsx";
import SchedulerPage from "../pages/SchedulerPage.jsx";
// research schedule is a single management page; child views are rendered inside it

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<SignIn />} />
      <Route element={<RequireAuth><AppLayout /></RequireAuth>}>
        <Route path="/admin-home" element={<Home />} />
        <Route path="/student-management" element={<StudentManagement />} />
        <Route path="/class-management" element={<ClassManagement />} />
        <Route path="/teacher-management" element={<TeacherManagement />} />
        <Route path="/semester-management" element={<SemesterManagement />} />
        <Route path="/academicyear-management" element={<AcademicYearManagement />} />
        <Route path="/faculty-management" element={<FacultyManagement />} />
        <Route path="/subject-management" element={<SubjectManagement />} />
        <Route path={"/time-slot-management"} element={<TimeSlotManagement />} />
        <Route path={"/day-management"} element={<DayManagement />} />
        <Route path={"/course-class-management"} element={<CourseClassManagement />} />
        <Route path="/chatbot" element={<RAGApp />} />
        <Route path="/guide" element={<TutorialPage />} />
        <Route path={`/scheduler/inputs`} element={<InputResourcesManagement />}/>
        <Route path={`/scheduler/schedule`} element={<SchedulerResourcesManagement />}/>
        <Route path="/report" element={<ReportPage />} />
        <Route path="/holiday-management" element={<HolidayManagement />} />
        <Route path="/equipment-management" element={<EquipmentManagement />} />
        <Route path="/room-management" element={<RoomManagement />} />
        <Route path="/research-schedule" element={<ResearchScheduleManagement />} />
      </Route>
    </Routes>
  );
}