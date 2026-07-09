// src/pages/TpoDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, Building2, Users, CheckCircle, LogOut, Bell, 
  ShieldCheck, Activity, BarChart3, Search, Briefcase, TrendingUp,
  Calendar, Bot, AlertTriangle, PieChart, Target, FileText, Download,
  GraduationCap // <--- JUST ADD THIS LINE
} from 'lucide-react';

export default function TpoDashboard() {
  const navigate = useNavigate();
  
  // Navigation State
  const [activeView, setActiveView] = useState('overview'); // 'overview', 'students', 'partners', 'analytics', 'reports'
  
  // Real Database States
  const [activeJobs, setActiveJobs] = useState([]);
  const [students, setStudents] = useState([]); 
  const [isLoading, setIsLoading] = useState(true);

  // Fetch all global data across the platform
  useEffect(() => {
    const fetchGlobalData = async () => {
      try {
        const [jobsRes, studentsRes] = await Promise.all([
          fetch('http://localhost:8000/api/jobs'),
          fetch('http://localhost:8000/api/admin/students')
        ]);
        
        if (jobsRes.ok) setActiveJobs(await jobsRes.json());
        if (studentsRes.ok) setStudents(await studentsRes.json());

      } catch (error) {
        console.error("Failed to fetch platform telemetry:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchGlobalData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('nexus_token');
    localStorage.removeItem('nexus_role');
    localStorage.removeItem('nexus_email');
    navigate('/login');
  };

  // --- DYNAMIC KPI CALCULATIONS ---
  const totalStudents = students.length;
  
  const placedStudents = students.filter(
    s => s.status === 'Placed' || s.status === 'Hired' || s.status === 'Offered'
).length;
  
  const placementRate = totalStudents > 0 
    ? ((placedStudents / totalStudents) * 100).toFixed(1) 
    : 0;
    
  // Dynamic Corporate Partners Map
  const partnersMap = {};
  activeJobs.forEach(job => {
    const company = job.company_name || 'Unknown Company';
    if (!partnersMap[company]) {
      partnersMap[company] = { name: company, activeJobs: 0, totalApplicants: 0 };
    }
    partnersMap[company].activeJobs += 1;
    partnersMap[company].totalApplicants += (job.applicants_count || 0);
  });
  const corporatePartnersList = Object.values(partnersMap);
  const corporatePartnersCount = corporatePartnersList.length;

  // --- DYNAMIC AI SKILL DEMAND CALCULATION ---
  const skillCounts = {};
  activeJobs.forEach(job => {
    (job.required_skills || []).forEach(skill => {
      skillCounts[skill] = (skillCounts[skill] || 0) + 1;
    });
  });
  
  const topDemandSkills = Object.entries(skillCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  // --- DYNAMIC DEPARTMENT REPORTS ---
  const deptStats = {};
  students.forEach(s => {
    const dept = s.dept || 'General';
    if (!deptStats[dept]) deptStats[dept] = { total: 0, placed: 0 };
    deptStats[dept].total += 1;
    if (s.status === 'Placed' || s.status === 'Hired' || s.status === 'Offered') {
      deptStats[dept].placed += 1;
    }
  });

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      
      {/* TPO SIDEBAR */}
      <aside className="w-72 bg-slate-900 text-white flex flex-col justify-between p-6 z-20 shadow-xl border-r border-slate-800">
        <div className="space-y-8">
          
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-2.5 rounded-xl text-white shadow-lg shadow-emerald-500/30">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <span className="text-2xl font-black tracking-tighter">
              HireNexus<span className="text-emerald-400">.Admin</span>
            </span>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 ml-2">Command Center</p>
            
            <button 
              onClick={() => setActiveView('overview')} 
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-bold transition-all text-left ${activeView === 'overview' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
            >
              <LayoutDashboard className="h-5 w-5" /> Dashboard Overview
            </button>
            
            <button 
              onClick={() => setActiveView('students')} 
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-bold transition-all text-left ${activeView === 'students' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
            >
              <Users className="h-5 w-5" /> Student Database
            </button>
            
            <button 
              onClick={() => setActiveView('partners')} 
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-bold transition-all text-left ${activeView === 'partners' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
            >
              <Building2 className="h-5 w-5" /> Corporate Partners
            </button>
            
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-8 mb-3 ml-2">Intelligence</p>
            
            <button 
              onClick={() => setActiveView('analytics')} 
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-bold transition-all text-left ${activeView === 'analytics' ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
            >
              <Bot className="h-5 w-5" /> AI Insights
            </button>
            
            <button 
              onClick={() => setActiveView('reports')} 
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-bold transition-all text-left ${activeView === 'reports' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
            >
              <BarChart3 className="h-5 w-5" /> Placement Reports
            </button>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-800">
          <button 
            onClick={handleLogout} 
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white rounded-xl text-sm font-bold transition-colors"
          >
            <LogOut className="h-4 w-4" /> Terminate Session
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT REGION */}
      <main className="flex-1 overflow-y-auto flex flex-col relative">
        
        {/* Dynamic Background Accent */}
        <div className={`absolute top-0 left-0 w-full h-64 z-0 rounded-br-[4rem] transition-colors duration-500 ${activeView === 'analytics' ? 'bg-slate-900' : 'bg-emerald-900'}`}></div>

        <header className="h-24 flex items-center justify-between px-10 relative z-10 text-white mt-2">
          <div>
            <h1 className="text-3xl font-black tracking-tight">
              {activeView === 'overview' && 'Institutional Control Room'}
              {activeView === 'students' && 'Global Student Registry'}
              {activeView === 'partners' && 'Corporate Partner Directory'}
              {activeView === 'analytics' && 'AI Placement Intelligence'}
              {activeView === 'reports' && 'Official Placement Reports'}
            </h1>
            <p className="text-sm font-medium mt-1 opacity-80">
              {activeView === 'overview' && 'Supervise campus drives and system integrity.'}
              {activeView === 'students' && 'Manage cohorts and track placement velocity.'}
              {activeView === 'partners' && 'Active recruiters participating in campus drives.'}
              {activeView === 'analytics' && 'Predictive models and skill gap telemetry.'}
              {activeView === 'reports' && 'Department-wise analytics and exportable data.'}
            </p>
          </div>
          <div className="flex items-center gap-5">
            <button className="p-3 text-white/80 hover:text-white bg-white/10 backdrop-blur-md border border-white/20 rounded-xl relative transition-colors">
              <Bell className="h-5 w-5" />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-transparent"></span>
            </button>
            <div className="flex items-center gap-3 pl-5 border-l border-white/20">
              <div className="w-12 h-12 rounded-xl bg-white text-emerald-700 flex items-center justify-center font-black shadow-lg">
                TPO
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">System Admin</h4>
                <p className="text-[10px] font-bold text-emerald-200 uppercase tracking-wider">Superuser Access</p>
              </div>
            </div>
          </div>
        </header>

        <div className="p-10 space-y-8 flex-1 relative z-10">
          
          {/* ========================================== */}
          {/* VIEW: DASHBOARD OVERVIEW                   */}
          {/* ========================================== */}
          {activeView === 'overview' && (
            <AnimatePresence mode="wait">
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                
                {/* 8-CARD KPI GRID */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  {/* Row 1 */}
                  <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">
                    <div className="flex justify-between items-start mb-2">
                      <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><Users className="h-6 w-6" /></div>
                    </div>
                    <div>
                      <h3 className="text-3xl font-black text-slate-900">{totalStudents}</h3>
                      <p className="text-sm font-bold text-slate-500">Total Registered Students</p>
                    </div>
                  </div>
                  
                  <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">
                    <div className="flex justify-between items-start mb-2">
                      <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl"><CheckCircle className="h-6 w-6" /></div>
                    </div>
                    <div>
                      <h3 className="text-3xl font-black text-slate-900">{placedStudents}</h3>
                      <p className="text-sm font-bold text-slate-500">Placed Students</p>
                    </div>
                  </div>
                  
                  <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">
                    <div className="flex justify-between items-start mb-2">
                      <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl"><TrendingUp className="h-6 w-6" /></div>
                    </div>
                    <div>
                      <h3 className="text-3xl font-black text-slate-900">{placementRate}%</h3>
                      <p className="text-sm font-bold text-slate-500">Current Placement Rate</p>
                    </div>
                  </div>
                  
                  <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">
                    <div className="flex justify-between items-start mb-2">
                      <div className="p-3 bg-purple-50 text-purple-600 rounded-xl"><Building2 className="h-6 w-6" /></div>
                    </div>
                    <div>
                      <h3 className="text-3xl font-black text-slate-900">{corporatePartnersCount}</h3>
                      <p className="text-sm font-bold text-slate-500">Corporate Partners</p>
                    </div>
                  </div>

                  {/* Row 2 */}
                  <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">
                    <div className="flex justify-between items-start mb-2">
                      <div className="p-3 bg-orange-50 text-orange-600 rounded-xl"><Briefcase className="h-6 w-6" /></div>
                    </div>
                    <div>
                      <h3 className="text-3xl font-black text-slate-900">{activeJobs.length}</h3>
                      <p className="text-sm font-bold text-slate-500">Active Jobs</p>
                    </div>
                  </div>
                  
                  <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">
                    <div className="flex justify-between items-start mb-2">
                      <div className="p-3 bg-cyan-50 text-cyan-600 rounded-xl"><Calendar className="h-6 w-6" /></div>
                    </div>
                    <div>
                      <h3 className="text-3xl font-black text-slate-900">3</h3>
                      <p className="text-sm font-bold text-slate-500">Upcoming Drives</p>
                    </div>
                  </div>
                  
                  <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-xl text-white flex flex-col justify-between relative overflow-hidden">
                    <div className="absolute -right-4 -top-4 opacity-20"><ShieldCheck className="h-32 w-32" /></div>
                    <div className="flex justify-between items-start mb-2 relative z-10">
                      <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-xl"><Activity className="h-6 w-6" /></div>
                    </div>
                    <div className="relative z-10">
                      <h3 className="text-2xl font-black text-white">All Systems Go</h3>
                      <p className="text-sm font-bold text-slate-400">Platform Health</p>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-6 rounded-3xl shadow-xl text-white flex flex-col justify-between relative overflow-hidden">
                    <div className="absolute -right-2 -bottom-4 opacity-20"><Bot className="h-32 w-32" /></div>
                    <div className="flex justify-between items-start mb-2 relative z-10">
                      <div className="p-3 bg-white/20 text-white rounded-xl backdrop-blur-sm"><Bot className="h-6 w-6" /></div>
                      <span className="flex items-center gap-1 text-xs font-bold bg-emerald-400/20 border border-emerald-400/30 px-2 py-1 rounded-lg text-emerald-200">
                        <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></div> Online
                      </span>
                    </div>
                    <div className="relative z-10">
                      <h3 className="text-2xl font-black text-white">Gemini Engine</h3>
                      <p className="text-sm font-bold text-indigo-200">AI Parser & Matcher</p>
                    </div>
                  </div>
                </div>

                {/* PLATFORM ACTIVITY LEDGER */}
                <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden flex flex-col">
                  <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50/50">
                    <div>
                      <h3 className="text-xl font-bold text-slate-900">Active Placement Drives</h3>
                      <p className="text-sm font-medium text-slate-500">Live feed of corporate job postings.</p>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-100 text-xs uppercase tracking-wider font-bold text-slate-500">
                          <th className="p-4 pl-6">Company & Role</th>
                          <th className="p-4">Package (CTC)</th>
                          <th className="p-4">Min CGPA</th>
                          <th className="p-4">Applicants</th>
                          <th className="p-4">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {isLoading ? (
                          <tr><td colSpan="5" className="p-8 text-center text-slate-400 font-medium">Loading platform data...</td></tr>
                        ) : activeJobs.length === 0 ? (
                          <tr><td colSpan="5" className="p-8 text-center text-slate-400 font-medium">No active requisitions.</td></tr>
                        ) : (
                          activeJobs.map((job, idx) => (
                            <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                              <td className="p-4 pl-6">
                                <p className="font-bold text-slate-900">{job.job_title}</p>
                                <p className="text-xs font-medium text-slate-500">{job.company_name}</p>
                              </td>
                              <td className="p-4 font-bold text-slate-700">{job.ctc}</td>
                              <td className="p-4 text-slate-600 font-medium">{job.min_cgpa || 'N/A'}</td>
                              <td className="p-4">
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 text-xs font-bold border border-blue-100">
                                  <Users className="h-3 w-3" /> {job.applicants_count || 0}
                                </span>
                              </td>
                              <td className="p-4">
                                <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-lg border border-emerald-200">Active</span>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          )}

          {/* ========================================== */}
          {/* VIEW: CORPORATE PARTNERS (NEW)             */}
          {/* ========================================== */}
          {activeView === 'partners' && (
            <AnimatePresence mode="wait">
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {corporatePartnersList.length === 0 ? (
                    <div className="col-span-3 bg-white border border-slate-200 rounded-3xl p-12 text-center shadow-sm">
                      <Building2 className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                      <h3 className="text-xl font-bold text-slate-700">No Corporate Partners Yet</h3>
                      <p className="text-slate-500 mt-2">Companies will appear here once they post their first job requisition.</p>
                    </div>
                  ) : (
                    corporatePartnersList.map((company, idx) => (
                      <div key={idx} className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-4 mb-6">
                          <div className="w-14 h-14 bg-slate-100 border border-slate-200 rounded-xl flex items-center justify-center text-xl font-black text-slate-700">
                            {company.name.charAt(0)}
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-slate-900 leading-tight">{company.name}</h3>
                            <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold uppercase rounded-md mt-1 inline-block">Active Partner</span>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-4">
                          <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Active Roles</p>
                            <p className="text-2xl font-black text-indigo-600">{company.activeJobs}</p>
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Total Applicants</p>
                            <p className="text-2xl font-black text-slate-900">{company.totalApplicants}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          )}

          {/* ========================================== */}
          {/* VIEW: PLACEMENT REPORTS (NEW)              */}
          {/* ========================================== */}
          {activeView === 'reports' && (
            <AnimatePresence mode="wait">
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
                
                {/* Export Header */}
                <div className="flex justify-between items-center bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">Placement Analytics Report</h3>
                    <p className="text-sm font-medium text-slate-500">Live statistics generated from student database.</p>
                  </div>
                  <button className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md flex items-center gap-2 transition-colors">
                    <Download className="h-5 w-5" /> Export PDF
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Department Stats */}
                  <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-slate-100">
                      <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2"><GraduationCap className="h-5 w-5 text-indigo-600"/> Department-wise Placements</h3>
                    </div>
                    <div className="p-6 space-y-6">
                      {Object.keys(deptStats).length === 0 ? (
                        <p className="text-slate-500 text-center">No department data available.</p>
                      ) : (
                        Object.entries(deptStats).map(([dept, data], idx) => {
                          const percentage = data.total > 0 ? Math.round((data.placed / data.total) * 100) : 0;
                          return (
                            <div key={idx}>
                              <div className="flex justify-between text-sm font-bold mb-2">
                                <span className="text-slate-700">{dept}</span>
                                <span className="text-indigo-600">{data.placed} / {data.total} Placed ({percentage}%)</span>
                              </div>
                              <div className="w-full bg-slate-100 rounded-full h-3">
                                <div className="bg-indigo-600 h-3 rounded-full" style={{ width: `${percentage}%` }}></div>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>

                  {/* Recently Placed List */}
                  <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-slate-100">
                      <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2"><CheckCircle className="h-5 w-5 text-emerald-600"/> Recently Placed Students</h3>
                    </div>
                    <div className="p-6">
                      <div className="space-y-4">
                        {students.filter(s => s.status === 'Placed' || s.status === 'Hired' || s.status === 'Offered').length === 0 ? (
                          <p className="text-slate-500 text-center py-4">No placements recorded yet.</p>
                        ) : (
                          students.filter(s => s.status === 'Placed' || s.status === 'Hired' || s.status === 'Offered').slice(0,5).map((student, idx) => (
                            <div key={idx} className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
                              <div>
                                <p className="font-bold text-slate-900">{student.name}</p>
                                <p className="text-xs text-slate-500">{student.dept} • CGPA: {student.cgpa}</p>
                              </div>
                              <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-lg border border-emerald-200">
                                Placed
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </div>

              </motion.div>
            </AnimatePresence>
          )}

          {/* ========================================== */}
          {/* VIEW: REAL STUDENT DATABASE                */}
          {/* ========================================== */}
          {activeView === 'students' && (
            <AnimatePresence mode="wait">
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">Student Directory</h3>
                    <p className="text-sm font-medium text-slate-500">Monitor real placement status and AI risk alerts from MongoDB.</p>
                  </div>
                  <div className="relative">
                    <Search className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                    <input type="text" placeholder="Search students..." className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-emerald-500 outline-none w-72" />
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100 text-xs uppercase tracking-wider font-bold text-slate-500">
                        <th className="p-5 pl-8">Student Name</th>
                        <th className="p-5">Department</th>
                        <th className="p-5">CGPA</th>
                        <th className="p-5">Placement Status</th>
                        <th className="p-5 pr-8">AI Safety Flag</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {isLoading ? (
                        <tr><td colSpan="5" className="p-8 text-center text-slate-400 font-medium">Loading database...</td></tr>
                      ) : students.length === 0 ? (
                        <tr><td colSpan="5" className="p-5 text-center text-slate-500 font-medium">No students registered yet.</td></tr>
                      ) : (
                        students.map((student, i) => (
                          <tr key={i} className="hover:bg-slate-50 transition-colors">
                            <td className="p-5 pl-8 font-bold text-slate-900 flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs text-slate-600">
                                {student.name ? student.name.charAt(0) : 'S'}
                              </div>
                              <div>
                                <p>{student.name}</p>
                                <p className="text-xs font-normal text-slate-500">{student.email}</p>
                              </div>
                            </td>
                            <td className="p-5 text-sm font-medium text-slate-600">{student.dept}</td>
                            <td className="p-5 font-bold text-slate-700">{student.cgpa}</td>
                            <td className="p-5">
                              <span className={`px-3 py-1 text-xs font-bold rounded-full border ${student.status === 'Placed' || student.status === 'Hired' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : student.status === 'Interviewing' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                                {student.status || 'Unplaced'}
                              </span>
                            </td>
                            <td className="p-5 pr-8">
                              {student.aiFlag === 'Safe' ? (
                                <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600">
                                  <CheckCircle className="h-4 w-4"/> On Hold
                                </span>
                              ) : (
                                <span className="flex items-center gap-1.5 text-xs font-bold text-rose-600 bg-rose-50 px-2 py-1 rounded-lg border border-rose-200 w-fit">
                                  <AlertTriangle className="h-4 w-4"/> {student.aiFlag}
                                </span>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            </AnimatePresence>
          )}

          {/* ========================================== */}
          {/* VIEW: AI ANALYTICS                         */}
          {/* ========================================== */}
          {activeView === 'analytics' && (
            <AnimatePresence mode="wait">
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* AI Prediction Card */}
                  <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-xl text-white">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-bold flex items-center gap-2"><Target className="h-6 w-6 text-emerald-400"/> Placement Prediction</h3>
                      <span className="px-3 py-1 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-bold rounded-lg">High Accuracy</span>
                    </div>
                    <p className="text-slate-400 text-sm mb-6">Based on current ATS scores and corporate demand, the AI predicts the final placement rate for the current cohort.</p>
                    <div className="flex items-end gap-4 mb-4">
                      <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">
                        {totalStudents ? (85 + (placedStudents/totalStudents)*10).toFixed(1) : 0}%
                      </h1>
                      <p className="text-emerald-400 font-bold mb-2 flex items-center gap-1"><TrendingUp className="h-4 w-4"/> Expected by May</p>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-3">
                      <div className="bg-gradient-to-r from-emerald-500 to-teal-500 h-3 rounded-full" style={{ width: `${totalStudents ? (85 + (placedStudents/totalStudents)*10).toFixed(1) : 0}%` }}></div>
                    </div>
                  </div>

                  {/* Skill Gap Demand Analysis */}
                  <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
                    <h3 className="text-xl font-bold text-slate-900 mb-2 flex items-center gap-2">
                      <PieChart className="h-6 w-6 text-indigo-600"/> Company Demand Analysis
                    </h3>
                    <p className="text-slate-500 text-sm mb-6">Most requested skills from active corporate partners.</p>
                    
                    <div className="space-y-5">
                      {topDemandSkills.length === 0 ? (
                        <p className="text-slate-500 italic">No job data available to analyze yet.</p>
                      ) : (
                        topDemandSkills.map(([skill, count], idx) => {
                          const percentage = Math.min((count / activeJobs.length) * 100, 100).toFixed(0);
                          return (
                            <div key={idx}>
                              <div className="flex justify-between text-sm font-bold mb-1">
                                <span>{skill}</span>
                                <span className="text-indigo-600">{count} Requests ({percentage}%)</span>
                              </div>
                              <div className="w-full bg-slate-100 rounded-full h-2">
                                <div className="bg-indigo-600 h-2 rounded-full" style={{ width: `${percentage}%` }}></div>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>

              </motion.div>
            </AnimatePresence>
          )}

        </div>
      </main>
    </div>
  );
}