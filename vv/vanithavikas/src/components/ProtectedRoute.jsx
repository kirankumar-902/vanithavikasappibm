import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, requiredRole = null }) => {
  const token = localStorage.getItem('token');
  const userData = localStorage.getItem('user');

  // Check if user is authenticated
  if (!token || !userData) {
    return <Navigate to="/login" replace />;
  }

  // Check role if specified
  if (requiredRole) {
    const user = JSON.parse(userData);
    if (user.role !== requiredRole) {
      // Redirect to appropriate dashboard based on user role
      const redirectPath = user.role === 'provider' ? '/provider-dashboard' : '/service-dashboard';
      return <Navigate to={redirectPath} replace />;
    }
  }

  return children;
};

export default ProtectedRoute;