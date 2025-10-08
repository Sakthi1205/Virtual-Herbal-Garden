import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  const token = localStorage.getItem('token');

  console.log('ProtectedRoute - User:', user);

  // If no token or user data, redirect to login
  if (!token || !user) {
    console.log('No token or user data - redirecting to login');
    return <Navigate to="/login" replace />;
  }

  console.log('Access granted to protected route');
  // If user is logged in, render the child routes
  return <Outlet />;
};

export default ProtectedRoute;
