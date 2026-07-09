// src/components/Navbar.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Bot, LogIn, LayoutDashboard, Menu, X, LogOut } from 'lucide-react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Every time the URL changes, check if the user has an ID card (token)
  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
  }, [location]);

  const handleLogout = () => {
    localStorage.clear(); // Destroy token
    setIsAuthenticated(false);
    navigate('/'); // Kick to home
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 shadow-sm transition-all">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        
        {/* LOGO */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="bg-blue-600 p-2 rounded-xl text-white group-hover:scale-105 transition-transform">
            <Bot className="h-6 w-6" />
          </div>
          <span className="text-2xl font-black tracking-tighter text-slate-900">
            HireNexus<span className="text-blue-500">.ai</span>
          </span>
        </Link>

        {/* DESKTOP NAVIGATION LINKS (FIXED) */}
        <div className="hidden md:flex items-center gap-8">
          <Link to="/" className="text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors">Home</Link>
          <a href="/#features" className="text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors">Features</a>
          <a href="/#institutions" className="text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors">For Colleges</a>
          <Link to="/login" className="text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors">For Employers</Link>
        </div>

        {/* AUTHENTICATION BUTTONS */}
        <div className="hidden md:flex items-center gap-4">
          {!isAuthenticated ? (
            // User is NOT logged in
            <>
              <Link to="/login" className="text-sm font-bold text-slate-600 hover:text-blue-600 transition-colors px-4 py-2">
                Sign In
              </Link>
              <Link to="/login" className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold rounded-xl transition-all shadow-md flex items-center gap-2">
                Get Started <LogIn className="h-4 w-4" />
              </Link>
            </>
          ) : (
            // User IS logged in
            <>
              <Link to="/student/dashboard" className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-all shadow-md flex items-center gap-2">
                <LayoutDashboard className="h-4 w-4" /> Go to Dashboard
              </Link>
              <button onClick={handleLogout} className="p-2.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all" title="Sign Out">
                <LogOut className="h-5 w-5" />
              </button>
            </>
          )}
        </div>

        {/* MOBILE MENU TOGGLE */}
        <button onClick={() => setIsOpen(!isOpen)} className="md:hidden p-2 text-slate-600">
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* MOBILE DROPDOWN MENU (FIXED) */}
      {isOpen && (
        <div className="md:hidden absolute top-20 left-0 right-0 bg-white border-b border-slate-100 shadow-xl p-6 flex flex-col gap-4">
          <Link to="/" onClick={() => setIsOpen(false)} className="text-sm font-bold text-slate-600 p-2 hover:bg-slate-50 rounded-lg">Home</Link>
          <a href="/#features" onClick={() => setIsOpen(false)} className="text-sm font-bold text-slate-600 p-2 hover:bg-slate-50 rounded-lg">Features</a>
          <a href="/#institutions" onClick={() => setIsOpen(false)} className="text-sm font-bold text-slate-600 p-2 hover:bg-slate-50 rounded-lg">For Colleges</a>
          <Link to="/login" onClick={() => setIsOpen(false)} className="text-sm font-bold text-slate-600 p-2 hover:bg-slate-50 rounded-lg">For Employers</Link>
          
          <div className="h-px w-full bg-slate-100 my-2"></div>
          
          {!isAuthenticated ? (
            <Link to="/login" className="w-full py-3 bg-slate-900 text-white text-center text-sm font-bold rounded-xl flex items-center justify-center gap-2">
              Sign In / Get Started <LogIn className="h-4 w-4" />
            </Link>
          ) : (
            <div className="flex flex-col gap-2">
              <Link to="/student/dashboard" className="w-full py-3 bg-blue-600 text-white text-center text-sm font-bold rounded-xl flex items-center justify-center gap-2">
                <LayoutDashboard className="h-4 w-4" /> Go to Dashboard
              </Link>
              <button onClick={handleLogout} className="w-full py-3 bg-rose-50 text-rose-600 text-center text-sm font-bold rounded-xl flex items-center justify-center gap-2">
                <LogOut className="h-4 w-4" /> Sign Out
              </button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}