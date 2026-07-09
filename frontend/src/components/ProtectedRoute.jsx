// src/components/ProtectedRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ children }) {
  // Check if the user is logged in by looking for a token or user data in local storage.
  // (Change 'token' to 'user' if your login page saves the data as 'user')
  const isAuthenticated = localStorage.getItem('token') || localStorage.getItem('user');

  if (!isAuthenticated) {
    // If they do NOT have a token, instantly redirect them to the Login page
    return <Navigate to="/login" replace />;
  }

  // If they DO have a token, open the door and let them render the dashboard
  return children;
}