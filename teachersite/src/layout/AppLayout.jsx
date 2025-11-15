import { Outlet, useNavigate } from "react-router-dom";
import { useEffect, useState } from 'react';
import NavBar from '../components/NavBar';
import authService from '../services/authService';
import { showSuccess } from '../utils/toastUtils';

export default function AppLayout() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const fetchProfile = async () => {
      try {
        const profile = await authService.getProfile();
        if (!cancelled) setProfile(profile?.data || profile || null);
      } catch (err) {
        // ignore silently; NavBar will show fallback
        console.debug('could not load teacher profile for navbar', err?.message || err);
      }
    };
    fetchProfile();
    return () => { cancelled = true; };
  }, []);

  const handleLogout = () => {
    // clear saved tokens and role
    try {
      authService.clearTokens();
      authService.clearRole();
      // also remove axios default auth header if set
      if (authService.apiClient && authService.apiClient.defaults && authService.apiClient.defaults.headers) {
        delete authService.apiClient.defaults.headers.common['Authorization'];
      }
    } catch {
      // ignore
    }
    showSuccess('Đăng xuất thành công');
    // navigate to sign-in page
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
  {/* Global top navbar for teachersite pages */}
  <NavBar teacher={profile ?? { name: '—' }} onLogout={handleLogout} />
      <main className="p-4 pt-20">
        <Outlet />
      </main>
    </div>
  );
}
