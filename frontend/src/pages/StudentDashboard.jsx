// src/pages/StudentDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, FileText, Briefcase, Settings, LogOut, Bell, 
  CheckCircle, TrendingUp, LayoutDashboard, UploadCloud, 
  Target, Award, BookOpen, ChevronRight, Activity, 
  MapPin, DollarSign, Sparkles, CheckCircle2, Send, X, Info
} from 'lucide-react';

export default function StudentDashboard() {
  const navigate = useNavigate();
  const studentEmail = localStorage.getItem('nexus_email') || 'S.Raichur2005@gmail.com';

  // Navigation State
  const [activeView, setActiveView] = useState('overview'); 

  // Real Database States
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [extractedSkills, setExtractedSkills] = useState([]);
  const [allJobs, setAllJobs] = useState([]);
  const [myApplications, setMyApplications] = useState([]);
  
  // Application Form States
  const [applyingJob, setApplyingJob] = useState(null); 
  const [isApplying, setIsApplying] = useState(false);
  const [appForm, setAppForm] = useState({
    fullName: 'Sandeep', 
    phone: '',
    education_details: '', 
    cgpa: '',
    experience: '',
    cover_letter: '',
    termsAccepted: false
  });

  // Fetch real data from MongoDB on load
  const fetchRealData = async () => {
    try {
      const profileRes = await fetch(`http://localhost:8000/api/students/${studentEmail}`);
      if (profileRes.ok) {
        const profileData = await profileRes.json();
        if (profileData.extracted_skills) setExtractedSkills(profileData.extracted_skills);
      }

      const jobsRes = await fetch(`http://localhost:8000/api/jobs`);
      if (jobsRes.ok) setAllJobs(await jobsRes.json());

      const appsRes = await fetch(`http://localhost:8000/api/students/${studentEmail}/applications`);
      if (appsRes.ok) setMyApplications(await appsRes.json());
    } catch (err) {
      console.error("Failed to load database data", err);
    }
  };

  useEffect(() => {
    fetchRealData();
  }, [studentEmail]);

  // --- DYNAMIC CALCULATIONS ---
  const atsScore = extractedSkills.length > 0 ? Math.min(100, 45 + (extractedSkills.length * 4)) : 0;

  const rankedJobs = allJobs.map(job => {
    const required = job.required_skills || [];
    const matched = required.filter(s => extractedSkills.includes(s));
    const matchScore = required.length ? Math.round((matched.length / required.length) * 100) : 0;
    const missing = required.filter(s => !extractedSkills.includes(s));
    
    return { ...job, matchScore, missing: missing.length > 0 ? missing[0] : 'None' };
  }).sort((a,b) => b.matchScore - a.matchScore);

  const recommendedJobs = rankedJobs.filter(j => j.matchScore > 0);

  // Handlers
  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const handleFileChange = (e) => setFile(e.target.files[0]);

  const handleResumeUpload = async () => {
    if (!file) return alert("Please select a PDF resume first.");
    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(`http://localhost:8000/api/students/${studentEmail}/parse-resume`, {
        method: 'POST', body: formData
      });
      if (response.ok) {
        const data = await response.json();
        setExtractedSkills(data.extracted_skills);
        alert("Resume Parsed Successfully by AI Engine!");
        fetchRealData(); 
      } else {
        alert("Failed to parse resume.");
      }
    } catch (error) {
      alert("Backend connection failed.");
    } finally {
      setIsUploading(false);
    }
  };

  // --- Detailed Application Submission ---
  const submitApplication = async (e) => {
    e.preventDefault();
    if (!appForm.termsAccepted) return alert("You must accept the terms and conditions to apply.");
    if (!appForm.education_details) return alert("Please select your highest degree.");
    
    setIsApplying(true);
    try {
      const payload = {
        student_email: studentEmail,
        education_details: appForm.education_details,
        cgpa: parseFloat(appForm.cgpa) || 0.0,
        experience: appForm.experience,
        cover_letter: appForm.cover_letter,
        portfolio_link: "N/A"
      };

      const response = await fetch(`http://localhost:8000/api/jobs/${applyingJob._id}/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        alert("Application submitted successfully!");
        setApplyingJob(null); 
        // Reset form completely
        setAppForm({ ...appForm, phone: '', cgpa: '', experience: '', cover_letter: '', termsAccepted: false });
        fetchRealData(); 
        setActiveView('overview');
      } else {
        const errData = await response.json();
        alert(errData.detail || "Failed to apply.");
      }
    } catch (error) {
      alert("Could not connect to server.");
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      
      {/* SIDEBAR NAVIGATION */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col justify-between p-6 z-20">
        <div className="space-y-8">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-2 rounded-xl text-white shadow-lg shadow-blue-600/20">
              <LayoutDashboard className="h-5 w-5" />
            </div>
            <span className="text-xl font-black tracking-tighter">HireNexus<span className="text-blue-500">.ai</span></span>
          </div>

          <nav className="space-y-2">
            <button onClick={() => setActiveView('overview')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeView === 'overview' ? 'bg-blue-600 shadow-md text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
              <LayoutDashboard className="h-4 w-4" /> Overview
            </button>
            <button onClick={() => setActiveView('resume')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeView === 'resume' ? 'bg-blue-600 shadow-md text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
              <FileText className="h-4 w-4" /> My Profile & Resume
            </button>
            <button onClick={() => setActiveView('jobs')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeView === 'jobs' ? 'bg-blue-600 shadow-md text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
              <Briefcase className="h-4 w-4" /> Global Job Board
            </button>
          </nav>
        </div>

        <div className="pt-4 border-t border-slate-800">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl text-sm font-bold transition-all">
            <LogOut className="h-4 w-4" /> Sign Out
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT REGION */}
      <main className="flex-1 overflow-y-auto flex flex-col relative">
        <div className="absolute top-0 left-0 w-full h-48 bg-blue-600 z-0 rounded-br-[4rem]"></div>

        <header className="h-20 flex items-center justify-between px-8 relative z-10 text-white mt-2">
          <div>
            <h1 className="text-2xl font-black tracking-tight">Student Co-Pilot</h1>
            <p className="text-sm font-medium text-blue-100 opacity-90">Your personalized AI career acceleration hub</p>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2.5 text-white hover:bg-white/10 border border-white/20 rounded-xl relative transition-colors backdrop-blur-sm">
              <Bell className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-3 pl-4 border-l border-white/20">
              <div className="w-10 h-10 rounded-xl bg-white text-blue-600 flex items-center justify-center font-black text-sm shadow-lg">ST</div>
              <div>
                <h4 className="text-sm font-bold">{studentEmail.split('@')[0]}</h4>
                <p className="text-[10px] font-bold text-emerald-300 uppercase tracking-wider">Verified Profile</p>
              </div>
            </div>
          </div>
        </header>

        <div className="p-8 space-y-6 flex-1 relative z-10">
          
          {/* ========================================== */}
          {/* VIEW: OVERVIEW                             */}
          {/* ========================================== */}
          {activeView === 'overview' && (
            <AnimatePresence mode="wait">
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/40">
                    <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl w-fit mb-4"><Activity className="h-6 w-6" /></div>
                    <h3 className="text-3xl font-black text-slate-900">{atsScore}/100</h3>
                    <p className="text-sm font-bold text-slate-400 mt-1">Live ATS Score</p>
                  </div>
                  <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/40">
                    <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl w-fit mb-4"><Target className="h-6 w-6" /></div>
                    <h3 className="text-3xl font-black text-slate-900">{recommendedJobs.length}</h3>
                    <p className="text-sm font-bold text-slate-400 mt-1">Highly Matched Jobs</p>
                  </div>
                  <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/40">
                    <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl w-fit mb-4"><Briefcase className="h-6 w-6" /></div>
                    <h3 className="text-3xl font-black text-slate-900">{myApplications.length}</h3>
                    <p className="text-sm font-bold text-slate-400 mt-1">Active Applications</p>
                  </div>
                  <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/40">
                    <div className="p-3 bg-orange-50 text-orange-600 rounded-2xl w-fit mb-4"><Award className="h-6 w-6" /></div>
                    <h3 className="text-3xl font-black text-slate-900">{extractedSkills.length}</h3>
                    <p className="text-sm font-bold text-slate-400 mt-1">Skills Verified</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                  <div className="xl:col-span-2 space-y-6">
                    <div className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2"><Briefcase className="h-5 w-5 text-slate-400" /> Application Pipeline</h3>
                        <button onClick={() => setActiveView('jobs')} className="text-sm font-bold text-blue-600 hover:underline">Find Jobs</button>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left">
                          <thead>
                            <tr className="border-b border-slate-100 text-xs font-bold text-slate-400 uppercase tracking-wider">
                              <th className="pb-3">Company & Role</th><th className="pb-3">Date Applied</th><th className="pb-3 text-right">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-50">
                            {myApplications.length === 0 ? (
                              <tr><td colSpan="3" className="py-8 text-slate-500 font-medium text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">You haven't applied to any jobs yet. Go to the Job Board to get started!</td></tr>
                            ) : (
                              myApplications.map((app, idx) => (
                                <tr key={idx} className="hover:bg-slate-50 transition-colors">
                                  <td className="py-4"><p className="font-bold text-slate-900">{app.company}</p><p className="text-xs font-medium text-slate-500">{app.role}</p></td>
                                  <td className="py-4 text-sm font-medium text-slate-600">{app.applied_on || "Recently"}</td>
                                  <td className="py-4 text-right"><span className="px-3 py-1 rounded-lg text-xs font-bold bg-blue-50 text-blue-700 border border-blue-100">{app.status}</span></td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <div className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm">
                      <h3 className="text-lg font-bold text-slate-900 mb-1 flex items-center gap-2">
                        <BookOpen className="h-5 w-5 text-purple-600" /> Skill Gap Analysis
                      </h3>
                      <p className="text-xs font-medium text-slate-500 mb-6">Recommendations to boost your ATS Score</p>
                      
                      {extractedSkills.length === 0 ? (
                        <p className="text-sm text-slate-500 italic">Please upload your resume to generate a skill gap analysis.</p>
                      ) : (
                        <div className="bg-purple-50 border border-purple-100 rounded-2xl p-5 mb-4">
                          <p className="text-sm font-bold text-slate-800 mb-2">Target Role: Software Engineer</p>
                          <p className="text-xs text-slate-600 mb-4">To increase your ATS score to 95%, the AI recommends adding these missing skills based on current job trends:</p>
                          <div className="flex flex-wrap gap-2">
                            <span className="px-2.5 py-1 bg-white border border-purple-200 text-purple-700 text-xs font-bold rounded-lg shadow-sm">Docker</span>
                            <span className="px-2.5 py-1 bg-white border border-purple-200 text-purple-700 text-xs font-bold rounded-lg shadow-sm">AWS</span>
                            <span className="px-2.5 py-1 bg-white border border-purple-200 text-purple-700 text-xs font-bold rounded-lg shadow-sm">System Design</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="xl:col-span-1 space-y-6">
                    <div className="bg-slate-900 rounded-3xl p-8 shadow-xl text-white relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-6 opacity-10"><Target className="h-32 w-32" /></div>
                      <div className="relative z-10">
                        <h3 className="text-lg font-black mb-1">AI Job Matches</h3>
                        <p className="text-xs font-medium text-slate-400 mb-6">Based on your parsed resume</p>
                        <div className="space-y-4">
                          {extractedSkills.length === 0 ? (
                            <div className="text-center py-6 bg-slate-800/50 rounded-2xl border border-slate-700 border-dashed"><p className="text-sm text-slate-400 font-medium">Upload resume in Profile to see matches.</p></div>
                          ) : recommendedJobs.length === 0 ? (
                            <div className="text-center py-6 bg-slate-800/50 rounded-2xl border border-slate-700 border-dashed"><p className="text-sm text-slate-400 font-medium">No highly matched jobs found. Keep learning!</p></div>
                          ) : (
                            recommendedJobs.slice(0,4).map((job, idx) => (
                              <div key={idx} className="bg-slate-800/80 border border-slate-700 p-4 rounded-2xl hover:border-blue-500 transition-colors group cursor-pointer">
                                <div className="flex justify-between items-start mb-2">
                                  <div><h4 className="font-bold text-white truncate w-32">{job.title}</h4><p className="text-xs text-slate-400">{job.company}</p></div>
                                  <div className="text-right"><span className="text-lg font-black text-emerald-400">{job.matchScore}%</span></div>
                                </div>
                                <div className="flex justify-between items-center mt-3 pt-3 border-t border-slate-700">
                                  <p className="text-[10px] font-bold text-rose-400 uppercase">Missing: {job.missing}</p>
                                  <button onClick={() => setActiveView('jobs')} className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded text-xs font-bold transition-colors">View</button>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          )}

          {/* ========================================== */}
          {/* VIEW: MY RESUME & PROFILE                  */}
          {/* ========================================== */}
          {activeView === 'resume' && (
            <AnimatePresence mode="wait">
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="max-w-4xl mx-auto space-y-6">
                <div className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <div className="bg-blue-50 p-3 rounded-2xl text-blue-600"><FileText className="h-6 w-6" /></div>
                      <div>
                        <h3 className="text-xl font-black text-slate-900">AI Resume Engine</h3>
                        <p className="text-sm text-slate-500 font-medium">Extract skills and identify ATS gaps.</p>
                      </div>
                    </div>
                    {extractedSkills.length > 0 && <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-sm font-bold rounded-full border border-emerald-100 flex items-center gap-1"><CheckCircle className="h-4 w-4" /> Parsed</span>}
                  </div>

                  <div className="flex flex-col md:flex-row gap-4 items-center bg-slate-50 border-2 border-slate-200 border-dashed rounded-2xl p-8">
                    <input type="file" accept=".pdf" onChange={handleFileChange} className="flex-1 text-sm font-bold text-blue-600 file:mr-4 file:py-3 file:px-5 file:rounded-xl file:border-0 file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer shadow-sm" />
                    <button onClick={handleResumeUpload} disabled={isUploading} className="px-8 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-all shadow-md">
                      {isUploading ? 'Engine Running...' : 'Upload & Parse Resume'}
                    </button>
                  </div>

                  {extractedSkills.length > 0 && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-8 border-t border-slate-100 pt-6">
                      <h4 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2"><TrendingUp className="h-4 w-4 text-blue-500" /> Extracted Competencies</h4>
                      <div className="flex flex-wrap gap-2">
                        {extractedSkills.map((skill, index) => (
                          <span key={index} className="px-4 py-2 bg-slate-100 border border-slate-200 text-slate-700 text-sm font-bold rounded-xl shadow-sm">{skill}</span>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          )}

          {/* ========================================== */}
          {/* VIEW: GLOBAL JOB BOARD                     */}
          {/* ========================================== */}
          {activeView === 'jobs' && (
            <AnimatePresence mode="wait">
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
                <header className="mb-6 flex justify-between items-end">
                  <div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">Global Job Board</h2>
                    <p className="text-slate-500 mt-2 font-medium">Browse and apply to all active corporate requisitions.</p>
                  </div>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {allJobs.length === 0 ? (
                    <div className="col-span-full bg-white p-12 text-center rounded-3xl border border-slate-200">
                      <Briefcase className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                      <h3 className="text-xl font-bold text-slate-700">No Jobs Posted Yet</h3>
                      <p className="text-slate-500">Check back later when recruiters post new roles.</p>
                    </div>
                  ) : (
                    rankedJobs.map((job) => {
                      const hasApplied = myApplications.some(app => app.job_id === job._id);
                      return (
                        <div key={job._id} className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
                          <div>
                            <div className="flex justify-between items-start mb-4">
                              <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center font-black text-slate-700 text-xl border border-slate-200">
                                {job.company_name.charAt(0)}
                              </div>
                              {job.matchScore > 75 && <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-1 rounded uppercase flex items-center gap-1 border border-emerald-200"><Sparkles className="w-3 h-3"/> Top Match</span>}
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 leading-tight mb-1">{job.job_title}</h3>
                            <p className="text-sm font-bold text-blue-600 mb-4">{job.company_name}</p>
                            
                            <div className="space-y-2 mb-6">
                              <div className="flex items-center gap-2 text-sm text-slate-600 font-medium"><DollarSign className="w-4 h-4 text-slate-400" /> {job.ctc}</div>
                              <div className="flex items-center gap-2 text-sm text-slate-600 font-medium"><CheckCircle2 className="w-4 h-4 text-slate-400" /> Min CGPA: {job.min_cgpa}</div>
                            </div>
                          </div>

                          <button 
                            onClick={() => setApplyingJob(job)} 
                            disabled={hasApplied}
                            className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${hasApplied ? 'bg-emerald-50 text-emerald-600 border border-emerald-200 cursor-not-allowed' : 'bg-slate-900 hover:bg-slate-800 text-white shadow-md'}`}
                          >
                            {hasApplied ? <><CheckCircle className="w-4 h-4"/> Applied</> : <><Send className="w-4 h-4"/> Apply Now</>}
                          </button>
                        </div>
                      )
                    })
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          )}

        </div>
      </main>

      {/* ========================================== */}
      {/* DETAILED APPLICATION FORM MODAL            */}
      {/* ========================================== */}
      <AnimatePresence>
        {applyingJob && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40"
              onClick={() => setApplyingJob(null)}
            />
            <motion.div 
              initial={{ opacity: 0, y: 100, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 100, scale: 0.95 }}
              className="fixed top-[5%] left-1/2 -translate-x-1/2 w-full max-w-2xl bg-white rounded-[2rem] shadow-2xl z-50 flex flex-col overflow-hidden max-h-[90vh]"
            >
              <div className="p-6 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                <div>
                  <p className="text-sm font-bold text-blue-600 mb-1">Application for {applyingJob.company_name}</p>
                  <h3 className="text-2xl font-black text-slate-900">{applyingJob.job_title}</h3>
                </div>
                <button onClick={() => setApplyingJob(null)} className="p-2 hover:bg-slate-200 rounded-full transition-colors"><X className="w-5 h-5 text-slate-500" /></button>
              </div>

              <div className="p-8 overflow-y-auto flex-1 custom-scrollbar">
                <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 mb-6 flex items-start gap-3">
                  <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                  <p className="text-sm text-blue-800 font-medium">Please review and complete the form below. Your parsed resume data will be automatically attached to this submission.</p>
                </div>

                <form id="applicationForm" onSubmit={submitApplication} className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="text-sm font-bold text-slate-700">Full Name</label>
                      <input required type="text" value={appForm.fullName} onChange={e=>setAppForm({...appForm, fullName: e.target.value})} className="w-full mt-1.5 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none transition-all font-medium text-slate-800" />
                    </div>
                    <div>
                      <label className="text-sm font-bold text-slate-700">Phone Number</label>
                      <input required type="tel" value={appForm.phone} onChange={e=>setAppForm({...appForm, phone: e.target.value})} className="w-full mt-1.5 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none transition-all font-medium text-slate-800" placeholder="+91" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="text-sm font-bold text-slate-700">Highest Degree</label>
                      <select 
                        required 
                        value={appForm.education_details} 
                        onChange={e => setAppForm({...appForm, education_details: e.target.value})} 
                        className="w-full mt-1.5 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none transition-all font-medium text-slate-700 appearance-none"
                      >
                        <option value="" disabled>Select your degree</option>
                        <option value="Bachelor of Computer Applications (BCA)">Bachelor of Computer Applications (BCA)</option>
                        <option value="Bachelor of Technology (B.Tech)">Bachelor of Technology (B.Tech)</option>
                        <option value="Bachelor of Engineering (B.E)">Bachelor of Engineering (B.E)</option>
                        <option value="Bachelor of Science (B.Sc)">Bachelor of Science (B.Sc)</option>
                        <option value="Master of Computer Applications (MCA)">Master of Computer Applications (MCA)</option>
                        <option value="Master of Technology (M.Tech)">Master of Technology (M.Tech)</option>
                        <option value="Master of Science (M.Sc)">Master of Science (M.Sc)</option>
                        <option value="Master of Business Administration (MBA)">Master of Business Administration (MBA)</option>
                        <option value="Diploma">Diploma</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-bold text-slate-700">Current CGPA</label>
                      <input required type="number" step="0.01" value={appForm.cgpa} onChange={e=>setAppForm({...appForm, cgpa: e.target.value})} className="w-full mt-1.5 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none transition-all font-medium text-slate-800" placeholder="e.g. 8.5" />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-bold text-slate-700">Experience / Projects</label>
                    <textarea required rows="3" value={appForm.experience} onChange={e=>setAppForm({...appForm, experience: e.target.value})} className="w-full mt-1.5 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none transition-all font-medium resize-none text-slate-800" placeholder="Briefly mention your technical projects or internships..."></textarea>
                  </div>

                  <div>
                    <label className="text-sm font-bold text-slate-700">Cover Letter</label>
                    <textarea required rows="4" value={appForm.cover_letter} onChange={e=>setAppForm({...appForm, cover_letter: e.target.value})} className="w-full mt-1.5 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none transition-all font-medium resize-none text-slate-800" placeholder="Why are you a good fit for this role?"></textarea>
                  </div>

                  <div className="flex items-start gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <input required type="checkbox" id="terms" checked={appForm.termsAccepted} onChange={e=>setAppForm({...appForm, termsAccepted: e.target.checked})} className="mt-1 w-4 h-4 text-blue-600 rounded cursor-pointer" />
                    <label htmlFor="terms" className="text-sm text-slate-600 cursor-pointer">
                      I certify that the information provided is accurate and my parsed resume is up to date. I understand that false information will lead to disqualification from the campus drive.
                    </label>
                  </div>
                </form>
              </div>

              <div className="p-6 border-t border-slate-100 bg-white flex justify-end gap-4">
                <button onClick={() => setApplyingJob(null)} className="px-6 py-3 font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors">Cancel</button>
                <button type="submit" form="applicationForm" disabled={isApplying} className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-md flex items-center gap-2">
                  {isApplying ? 'Submitting...' : 'Submit Application'}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}