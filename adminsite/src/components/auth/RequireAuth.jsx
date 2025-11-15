import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import authService from '../../services/authService';
import { showWarning } from '../../utils/toastUtils.js';

export default function RequireAuth({ children }) {
  const location = useLocation();
  const token = authService.getAccessToken();
  const role = authService.getRole && authService.getRole();
  // require both a token and the admin role
  if (!token || !role || String(role).toLowerCase() !== 'admin') {
    // clear any partial auth state and redirect to sign-in
    if (authService.clearTokens) authService.clearTokens();
    if (authService.clearRole) authService.clearRole();
    showWarning('Bạn không có quyền truy cập trang này');
    return <Navigate to="/" state={{ from: location }} replace />;
  }
  return children;
}
