import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Importing pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import StudentDashboard from './pages/StudentDashboard';
import CompanyDashboard from './pages/CompanyDashboard';
import TpoDashboard from './pages/TpoDashboard';

// Importing components
import ChatWidget from './components/ChatWidget';
import ProtectedRoute from './components/ProtectedRoute';

export default function App() {
  return (
    <BrowserRouter>
      <div className="relative min-h-screen">
        
        <Routes>
          {/* PUBLIC ROUTES - Anyone can visit these */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />

          {/* PROTECTED ROUTES - Wrapped in the Bouncer! */}
          <Route 
            path="/student/dashboard" 
            element={
              <ProtectedRoute>
                <StudentDashboard />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/company/dashboard" 
            element={
              <ProtectedRoute>
                <CompanyDashboard />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/admin/dashboard" 
            element={
              <ProtectedRoute>
                <TpoDashboard />
              </ProtectedRoute>
            } 
          />
          
          {/* Fallback route for 404 - Redirects to Home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

        {/* Floating AI Chat Widget */}
        <ChatWidget />

      </div>
    </BrowserRouter>
  );
}