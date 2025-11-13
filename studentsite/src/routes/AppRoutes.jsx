import { Routes, Route } from "react-router-dom";
import AppLayout from "../layout/AppLayout";
import RequireAuth from "../components/auth/RequireAuth";
import SignIn from "../pages/SignIn";
import Home from "../pages/Home";
import Schedule from "../pages/Schedule";
import Profile from "../pages/Profile";
import ChangePassword from "../pages/ChangePassword";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<SignIn />} />
      <Route element={<RequireAuth><AppLayout /></RequireAuth>}>
      <Route path="/student-home" element={<Home />} />
      <Route path="/schedule" element={<Schedule />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/change-password" element={<ChangePassword />} />
      </Route>
    </Routes>
  );
}
