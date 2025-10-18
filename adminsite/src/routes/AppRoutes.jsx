// AppRoutes.jsx
import { Routes, Route, Router } from "react-router-dom";
import Home from "../pages/Home";
import StudentManagement from "../pages/StudentManagement";
import AppLayout from "../layout/AppLayout";
import ClassManagement from "../pages/ClassManagement";
import TeacherManagement from "../pages/TeacherManagement";
import HolidayManagement from "../pages/HolidayManagement";

export default function AppRoutes() {
  return (
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/student-management" element={<StudentManagement />} />
          <Route path="/class-management" element={<ClassManagement />} />
          <Route path="/teacher-management" element={<TeacherManagement />} />
          <Route path="/holiday-management" element={<HolidayManagement />} />
        </Route>
      </Routes>
  );
}