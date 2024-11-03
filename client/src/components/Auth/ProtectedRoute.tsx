import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { isTokenValid } from '../../utils/auth';

const ProtectedRoute = () => {
  const token = localStorage.getItem('token');
  const isAuthenticated = isTokenValid(token);

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" />;
};

export default ProtectedRoute;
