import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const token = localStorage.getItem('authToken');
  const userInfo = localStorage.getItem('userInfo');

  // Check if user is authenticated
  if (!token || !userInfo) {
    return <Navigate to="/login" replace />;
  }

  // Parse user info
  let user;
  try {
    user = JSON.parse(userInfo);
  } catch (error) {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userInfo');
    return <Navigate to="/login" replace />;
  }

  // Check if user role is allowed
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    // Redirect based on user role
    if (user.role === 'admin') {
      return <Navigate to="/admin-dashboard" replace />;
    } else {
      return <Navigate to="/" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;