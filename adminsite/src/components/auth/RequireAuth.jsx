import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import authService from '../../services/authService';

export default function RequireAuth({ children }) {
  const location = useLocation();
  const token = authService.getAccessToken();
  if (!token) {
    // redirect to sign-in and save current location
    return <Navigate to="/" state={{ from: location }} replace />;
  }
  return children;
}
