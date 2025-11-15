import { Navigate, useLocation } from 'react-router-dom';
import authService from '../../services/authService';
import { showWarning } from '../../utils/toastUtils.js';
export default function RequireAuth({ children }) {
  const location = useLocation();
  const token = authService.getAccessToken && authService.getAccessToken();
  const role = authService.getRole && authService.getRole();

  // Only allow authenticated users with role === 'teacher'
  if (!token || !role || String(role).toLowerCase() !== 'teacher') {
    if (authService.clearTokens) authService.clearTokens();
    if (authService.clearRole) authService.clearRole();
    showWarning('Bạn không có quyền truy cập trang này');
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return children;
}
