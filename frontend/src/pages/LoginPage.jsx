// src/pages/LoginPage.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { GraduationCap, Building2, ArrowRight, Bot, ShieldCheck, Eye, EyeOff, Shield } from 'lucide-react';

export default function LoginPage() {
  const navigate = useNavigate();
  const [role, setRole] = useState(null); 
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false); 
  const [showPassword, setShowPassword] = useState(false); 

  // Real Database Input States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Strict Password Validation Rules
  const validatePassword = (pw) => {
    if (pw.length < 8) return "Password must be at least 8 characters.";
    if (!/^[A-Z]/.test(pw)) return "Password must start with a capital letter.";
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(pw)) return "Password must contain at least one special character.";
    return ""; // Valid
  };

  const handlePasswordChange = (e) => {
    const val = e.target.value;
    setPassword(val);
    if (isSignUp) {
      setPasswordError(validatePassword(val));
    } else {
      setPasswordError('');
    }
  };

  // The Real Database Connection
  const handleAuth = async (e) => {
    e.preventDefault();

    // Block submission if signing up with an invalid password
    if (isSignUp && passwordError) {
      alert("Please fix your password to meet the security requirements.");
      return;
    }

    setIsAuthenticating(true);
    
    const endpoint = isSignUp ? '/api/signup' : '/api/login';

    try {
      const response = await fetch(`http://127.0.0.1:8000${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role })
      });

      const data = await response.json();

      if (response.ok) {
        // FIXED: Using standard keys so ProtectedRoute allows entry
        localStorage.setItem('token', data.token || 'auth_token_set');
        localStorage.setItem('userEmail', email);
        localStorage.setItem('role', role);
        
        // Route to exact dashboard based on role
        if (role === 'student') {
          navigate('/student/setup'); 
        } else if (role === 'hr') {
          navigate('/company/dashboard');
        } else if (role === 'tpo') {
          navigate('/admin/dashboard'); // FIXED: Matches App.jsx route
        }
      } else {
        alert(`Authentication Error: ${data.detail}`);
      }
    } catch (err) {
      alert("Could not connect to the database. Is the Python server running?");
    } finally {
      setIsAuthenticating(false);
    }
  };

  // Clears the form if they change their mind and go back
  const handleBack = () => {
    setRole(null);
    setIsSignUp(false);
    setEmail('');
    setPassword('');
    setPasswordError('');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 selection:bg-blue-600/20 relative overflow-hidden">
      
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="w-full max-w-5xl bg-white rounded-[2rem] shadow-2xl shadow-slate-200/50 border border-slate-100 flex flex-col md:flex-row overflow-hidden relative z-10 min-h-[600px]">
        
        {/* Left Side: Branding */}
        <div className="w-full md:w-5/12 bg-slate-900 text-white p-12 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[200%] h-[200%] bg-gradient-to-br from-blue-600/20 to-purple-600/20 blur-[80px] -translate-y-1/2 translate-x-1/4 pointer-events-none"></div>
          
          <div className="relative z-10">
            <Link to="/" className="flex items-center gap-2 mb-16 inline-flex">
              <div className="bg-blue-600 p-2 rounded-xl">
                <Bot className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-black tracking-tighter text-white">
                HireNexus<span className="text-blue-500">.ai</span>
              </span>
            </Link>
            <h2 className="text-4xl font-black tracking-tight mb-4 leading-tight">Welcome to the future of hiring.</h2>
            <p className="text-slate-400 font-medium text-lg mb-8">Sign in to access your AI-powered campus recruitment ecosystem.</p>
            <div className="flex items-center gap-2 text-sm font-bold text-emerald-400 bg-emerald-400/10 px-4 py-2 rounded-full w-fit border border-emerald-400/20">
              <ShieldCheck className="h-4 w-4" /> Enterprise Grade Security
            </div>
          </div>
          <div className="relative z-10 mt-12 md:mt-0 text-sm font-medium text-slate-500">
            © 2026 HireNexus Technologies.
          </div>
        </div>

        {/* Right Side: Login Selection & Form */}
        <div className="w-full md:w-7/12 p-12 lg:p-16 flex flex-col justify-center bg-white relative">
          
          <AnimatePresence mode="wait">
            {!role ? (
              // Step 1: Choose Role
              <motion.div key="choose-role" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="w-full max-w-md mx-auto">
                <h3 className="text-3xl font-black text-slate-900 mb-2">Select your portal</h3>
                <p className="text-slate-500 font-medium mb-10">How are you accessing HireNexus today?</p>
                
                <div className="space-y-4">
                  <button onClick={() => setRole('student')} className="w-full flex items-center justify-between p-6 bg-slate-50 border-2 border-slate-200 hover:border-blue-600 hover:bg-blue-50/50 rounded-2xl transition-all group text-left">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center border border-slate-100 group-hover:scale-110 transition-transform">
                        <GraduationCap className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-slate-900">Student Portal</h4>
                        <p className="text-sm font-medium text-slate-500">Access your AI resume & apply</p>
                      </div>
                    </div>
                    <ArrowRight className="h-5 w-5 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                  </button>

                  <button onClick={() => setRole('hr')} className="w-full flex items-center justify-between p-6 bg-slate-50 border-2 border-slate-200 hover:border-purple-600 hover:bg-purple-50/50 rounded-2xl transition-all group text-left">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center border border-slate-100 group-hover:scale-110 transition-transform">
                        <Building2 className="h-6 w-6 text-purple-600" />
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-slate-900">Employer ATS</h4>
                        <p className="text-sm font-medium text-slate-500">Post jobs & rank candidates</p>
                      </div>
                    </div>
                    <ArrowRight className="h-5 w-5 text-slate-400 group-hover:text-purple-600 group-hover:translate-x-1 transition-all" />
                  </button>

                  {/* Added TPO Admin Role */}
                  <button onClick={() => setRole('tpo')} className="w-full flex items-center justify-between p-6 bg-slate-50 border-2 border-slate-200 hover:border-emerald-600 hover:bg-emerald-50/50 rounded-2xl transition-all group text-left">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center border border-slate-100 group-hover:scale-110 transition-transform">
                        <Shield className="h-6 w-6 text-emerald-600" />
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-slate-900">TPO Control Room</h4>
                        <p className="text-sm font-medium text-slate-500">Manage placement drives</p>
                      </div>
                    </div>
                    <ArrowRight className="h-5 w-5 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" />
                  </button>
                </div>
              </motion.div>
            ) : (
              // Step 2: Real Database Auth Form
              <motion.div key="auth-form" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="w-full max-w-md mx-auto">
                <button onClick={handleBack} className="text-sm font-bold text-slate-500 hover:text-slate-900 mb-8 flex items-center gap-1 transition-colors">
                  ← Back to portal selection
                </button>
                
                <h3 className="text-3xl font-black text-slate-900 mb-2">
                  {isSignUp ? 'Create an account' : (role === 'student' ? 'Student Sign In' : role === 'hr' ? 'Employer Sign In' : 'TPO Sign In')}
                </h3>
                <p className="text-slate-500 font-medium mb-8">
                  {isSignUp ? 'Join HireNexus to start your journey.' : 'Enter your credentials to continue.'}
                </p>

                <form onSubmit={handleAuth} className="space-y-4">
                  <div>
                    <label className="text-sm font-bold text-slate-700">Email Address</label>
                    <input 
                      required 
                      type="email" 
                      placeholder="name@example.com" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full mt-1.5 px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all font-medium" 
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center">
                      <label className="text-sm font-bold text-slate-700">Password</label>
                      {!isSignUp && <a href="#" className="text-xs font-bold text-blue-600 hover:underline">Forgot?</a>}
                    </div>
                    <div className="relative mt-1.5">
                      <input 
                        required 
                        type={showPassword ? "text" : "password"} 
                        placeholder="••••••••" 
                        value={password}
                        onChange={handlePasswordChange}
                        className={`w-full px-4 py-3.5 bg-slate-50 border ${isSignUp && passwordError ? 'border-red-500 focus:ring-red-600' : 'border-slate-200 focus:ring-blue-600'} rounded-xl outline-none focus:ring-2 focus:bg-white transition-all font-medium tracking-widest pr-12`} 
                      />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                    
                    {/* Live Password Validation Error Display */}
                    {isSignUp && passwordError && (
                      <p className="text-xs font-bold text-red-500 mt-2 flex items-center gap-1">
                        <span className="w-1 h-1 bg-red-500 rounded-full inline-block"></span>
                        {passwordError}
                      </p>
                    )}
                  </div>

                  <button 
                    disabled={isAuthenticating || (isSignUp && passwordError !== '')} 
                    type="submit" 
                    className="w-full py-4 mt-6 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 text-lg"
                  >
                    {isAuthenticating ? (
                      <span className="flex items-center gap-2"><Bot className="h-5 w-5 animate-spin" /> {isSignUp ? 'Creating Account...' : 'Authenticating...'}</span>
                    ) : (
                      isSignUp ? 'Create Account' : 'Secure Login'
                    )}
                  </button>
                </form>

                <p className="mt-8 text-center text-sm font-medium text-slate-500">
                  {isSignUp ? "Already have an account? " : "Don't have an account? "}
                  <button type="button" onClick={() => { setIsSignUp(!isSignUp); setPasswordError(''); }} className="text-blue-600 font-bold hover:underline">
                    {isSignUp ? "Sign In" : "Create one"}
                  </button>
                </p>

              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </div>
    </div>
  );
}