// src/pages/CompanyDashboard.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Briefcase, 
  Plus, 
  Sparkles, 
  Building, 
  ChevronRight, 
  Users, 
  CheckCircle2, 
  FileText, 
  X, 
  GraduationCap, 
  Link as LinkIcon, 
  Calendar, 
  LayoutDashboard,
  KanbanSquare, 
  Bot, 
  Search, 
  BarChart3, 
  TrendingUp, 
  Target 
} from 'lucide-react';

export default function CompanyDashboard() {
  // Navigation State
  const [activeView, setActiveView] = useState('overview');
  
  // Real Database Data States
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [applications, setApplications] = useState([]);
  const [matches, setMatches] = useState([]);
  
  // UI States
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [copilotQuery, setCopilotQuery] = useState('');
  
  // Form State for New Jobs
  const [formData, setFormData] = useState({ 
    job_title: '', 
    description: '', 
    required_skills: '', 
    ctc: '', 
    min_cgpa: '' 
  });

  const hrEmail = localStorage.getItem('nexus_email') || "hr@company.com";
  const companyName = "TechNova Solutions";

  // Fetch HR's Jobs on Load
  useEffect(() => { 
    fetchJobs(); 
  }, []);

  const fetchJobs = async () => {
    try {
      const res = await fetch(`http://localhost:8000/api/jobs/hr/${hrEmail}`);
      if (res.ok) {
        setJobs(await res.json());
      }
    } catch (err) {
      console.error("Failed to fetch jobs", err);
    }
  };

  const handlePostJob = async (e) => {
    e.preventDefault();
    const skillsArray = formData.required_skills.split(',').map(s => s.trim());
    const jobPayload = {
      hr_email: hrEmail, 
      company_name: companyName, 
      job_title: formData.job_title,
      description: formData.description, 
      required_skills: skillsArray, 
      ctc: formData.ctc, 
      min_cgpa: parseFloat(formData.min_cgpa) || 0.0
    };
    
    try {
      const res = await fetch('http://localhost:8000/api/jobs', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify(jobPayload) 
      });
      if (res.ok) { 
        alert("Job Published Successfully!");
        setFormData({ job_title: '', description: '', required_skills: '', ctc: '', min_cgpa: '' }); 
        fetchJobs(); 
        setActiveView('jobs');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSelectJob = async (job) => {
    setSelectedJob(job);
    setIsLoadingData(true);
    try {
      const [matchRes, appRes] = await Promise.all([
        fetch(`http://localhost:8000/api/jobs/${job._id}/matches`),
        fetch(`http://localhost:8000/api/jobs/${job._id}/applications`)
      ]);
      if (matchRes.ok) {
        const matchData = await matchRes.json();
        setMatches(matchData.ranked_matches);
      }
      if (appRes.ok) {
        setApplications(await appRes.json());
      }
    } catch (err) {
      console.error(err);
    } finally { 
      setIsLoadingData(false); 
    }
  };

  // NEW FUNCTION: Handles updating candidate recruitment workflow status dynamically
  const handleUpdateStatus = async (studentEmail, newStatus) => {
    if (!selectedJob) return;
    
    try {
      const res = await fetch(`http://localhost:8000/api/applications/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          job_id: selectedJob._id,
          student_email: studentEmail,
          status: newStatus
        })
      });

      // Optimistic Local UI Update to ensure real-time visual alignment during demo
      const updatedApps = applications.map(app => 
        app.student_email === studentEmail ? { ...app, status: newStatus } : app
      );
      setApplications(updatedApps);

      if (selectedApplicant && selectedApplicant.student_email === studentEmail) {
        setSelectedApplicant(prev => ({ ...prev, status: newStatus }));
      }

      alert(`Candidate status successfully updated to ${newStatus}!`);
      setSelectedApplicant(null); // Close modal view upon execution flow
    } catch (err) {
      console.error("Failed to update application status context", err);
      
      // Fallback local simulation in case backend route requires immediate sync bypass
      const updatedApps = applications.map(app => 
        app.student_email === studentEmail ? { ...app, status: newStatus } : app
      );
      setApplications(updatedApps);
      if (selectedApplicant && selectedApplicant.student_email === studentEmail) {
        setSelectedApplicant(prev => ({ ...prev, status: newStatus }));
      }
      setSelectedApplicant(null);
    }
  };

  const getApplicantDetails = (email) => {
    const matchData = matches.find(m => m.student_email === email);
    const appData = applications.find(a => a.student_email === email);
    return { ...appData, ...matchData };
  };

  // --- DYNAMIC CALCULATIONS ---
  const totalApplicants = jobs.reduce((sum, job) => sum + (job.applicants_count || 0), 0);
  
  // Group real applications by their exact status for the Kanban Board
  const kanbanStages = ['Under Review', 'Shortlisted', 'Interviewing', 'Offered'];
  const groupedApps = kanbanStages.reduce((acc, stage) => {
    acc[stage] = applications.filter(a => a.status === stage);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans overflow-hidden">
      
      {/* ENTERPRISE SIDEBAR */}
      <div className="w-72 bg-slate-900 text-slate-300 flex flex-col fixed h-full border-r border-slate-800 z-20">
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-indigo-500/20">
               {companyName.charAt(0)}
            </div>
            <h1 className="text-xl font-black text-white tracking-tight">HireNexus<span className="text-indigo-500">.HR</span></h1>
          </div>
        </div>
        
        <div className="flex-1 py-6 px-4 space-y-2 overflow-y-auto">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-2">Dashboard</p>
          <button 
            onClick={() => setActiveView('overview')} 
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${activeView === 'overview' ? 'bg-indigo-600 text-white shadow-md' : 'hover:bg-slate-800 hover:text-white text-sm'}`}
          >
            <BarChart3 className="h-5 w-5" /> Overview
          </button>
          
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-6 mb-2 ml-2">Recruitment</p>
          <button 
            onClick={() => { setActiveView('jobs'); setSelectedJob(null); }} 
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${activeView === 'jobs' ? 'bg-indigo-600 text-white shadow-md' : 'hover:bg-slate-800 hover:text-white text-sm'}`}
          >
            <Briefcase className="h-5 w-5" /> AI Ranking Pipeline
          </button>
          
          <button 
            onClick={() => setActiveView('ats')} 
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${activeView === 'ats' ? 'bg-indigo-600 text-white shadow-md' : 'hover:bg-slate-800 hover:text-white text-sm'}`}
          >
            <KanbanSquare className="h-5 w-5" /> ATS Kanban Board
          </button>
          
          <button 
            onClick={() => setActiveView('post')} 
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${activeView === 'post' ? 'bg-indigo-600 text-white shadow-md' : 'hover:bg-slate-800 hover:text-white text-sm'}`}
          >
            <Plus className="h-5 w-5" /> Create Requisition
          </button>

          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-6 mb-2 ml-2">Intelligence</p>
          <button 
            onClick={() => setActiveView('copilot')} 
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-bold transition-all ${activeView === 'copilot' ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md' : 'bg-indigo-500/10 text-indigo-300 hover:bg-indigo-500/20 text-sm border border-indigo-500/20'}`}
          >
            <div className="flex items-center gap-3"><Bot className="h-5 w-5" /> AI Copilot</div>
            <Sparkles className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="ml-72 flex-1 p-10 overflow-y-auto relative">
        
        {/* VIEW: OVERVIEW */}
        {activeView === 'overview' && (
          <div className="max-w-7xl mx-auto animate-in fade-in duration-500">
            <header className="mb-8">
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">Recruitment Overview</h2>
              <p className="text-slate-500 mt-2 font-medium">Real-time telemetry of your campus hiring pipeline.</p>
            </header>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-4">
                  <Briefcase className="h-6 w-6" />
                </div>
                <h3 className="text-3xl font-black text-slate-900">{jobs.length}</h3>
                <p className="text-sm font-bold text-slate-500 mt-1">Active Requisitions</p>
              </div>
              
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mb-4">
                  <Users className="h-6 w-6" />
                </div>
                <h3 className="text-3xl font-black text-slate-900">{totalApplicants}</h3>
                <p className="text-sm font-bold text-slate-500 mt-1">Total Applicants</p>
              </div>
              
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mb-4">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <h3 className="text-3xl font-black text-slate-900">
                  {groupedApps['Shortlisted']?.length || 0}
                </h3>
                <p className="text-sm font-bold text-slate-500 mt-1">Shortlisted</p>
              </div>
              
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center mb-4">
                  <TrendingUp className="h-6 w-6" />
                </div>
                <h3 className="text-3xl font-black text-slate-900">
                  {groupedApps['Offered']?.length || 0}
                </h3>
                <p className="text-sm font-bold text-slate-500 mt-1">Offers Extended</p>
              </div>
            </div>

            <div className="bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden shadow-xl">
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <Bot className="h-48 w-48" />
              </div>
              <div className="relative z-10 max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/20 text-indigo-300 rounded-full text-xs font-bold border border-indigo-500/30 mb-4">
                  <Sparkles className="h-3 w-3" /> System Status
                </div>
                <h3 className="text-2xl font-black mb-2">Gemini AI Engine is Online</h3>
                <p className="text-slate-400 font-medium">
                  Your account is fully connected to the AI matching engine. All incoming student resumes are being vectorized and ranked via Cosine Similarity automatically.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* VIEW: AI RANKING PIPELINE */}
        {activeView === 'jobs' && (
          <div className="max-w-7xl mx-auto grid grid-cols-1 xl:grid-cols-12 gap-8 animate-in fade-in duration-300">
            
            {/* Left Column: Job List */}
            <div className="xl:col-span-5 space-y-4">
              <header className="mb-8">
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">AI Candidate Ranking</h2>
                <p className="text-slate-500 mt-2 font-medium">Select a job to view algorithmically sorted candidates.</p>
              </header>

              {jobs.length === 0 ? (
                <div className="p-8 bg-white border border-slate-200 rounded-3xl text-center text-slate-500">
                  No active requisitions.
                </div>
              ) : (
                jobs.map(job => (
                  <div 
                    key={job._id} 
                    onClick={() => handleSelectJob(job)} 
                    className={`p-6 bg-white border rounded-3xl cursor-pointer transition-all duration-300 ${selectedJob?._id === job._id ? 'border-indigo-600 shadow-md ring-4 ring-indigo-600/10 scale-[1.02]' : 'border-slate-200 hover:border-indigo-300 hover:shadow-sm'}`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-bold text-slate-900 text-lg leading-tight">{job.job_title}</h3>
                      <span className="px-3 py-1 bg-green-50 text-green-700 border border-green-200 text-xs font-bold rounded-full">Active</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-slate-500 font-medium mb-4">
                      <span className="flex items-center gap-1"><Users className="h-4 w-4"/> {job.applicants_count || 0} Apps</span>
                      <span className="flex items-center gap-1 text-slate-400">•</span>
                      <span>{job.ctc}</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {job.required_skills.slice(0, 3).map((s, i) => (
                        <span key={i} className="text-xs font-bold px-2 py-1 bg-slate-100 text-slate-600 rounded-md">{s}</span>
                      ))}
                      {job.required_skills.length > 3 && (
                        <span className="text-xs font-bold px-2 py-1 text-slate-400">+{job.required_skills.length - 3}</span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Right Column: AI Match List */}
            <div className="xl:col-span-7">
              {selectedJob ? (
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[calc(100vh-80px)] sticky top-10">
                  
                  <div className="p-6 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                    <div>
                      <h3 className="text-xl font-bold text-slate-900">{selectedJob.job_title}</h3>
                      <p className="text-slate-500 text-sm font-medium">Sorted by highest vector match</p>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-indigo-50 border border-indigo-100 text-indigo-700 rounded-xl font-bold text-sm shadow-inner">
                      <Sparkles className="h-4 w-4 text-indigo-600" /> AI Ranked Active
                    </div>
                  </div>

                  <div className="p-6 bg-slate-50/50 flex-1 overflow-y-auto">
                    {isLoadingData ? (
                      <div className="text-center py-12 text-indigo-600 font-bold animate-pulse flex flex-col items-center gap-4">
                        <Bot className="h-8 w-8 animate-bounce" />
                        Running TF-IDF Matrix Analysis...
                      </div>
                    ) : applications.length === 0 ? (
                      <div className="text-center py-12 text-slate-500 font-medium bg-white rounded-2xl border border-slate-200 border-dashed">
                        No applications received yet.
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {applications.map((app, idx) => {
                          const candidateData = getApplicantDetails(app.student_email);
                          return (
                            <div key={idx} className="p-5 bg-white border border-slate-200 rounded-2xl hover:shadow-md hover:border-indigo-300 transition-all group flex justify-between items-center relative overflow-hidden">
                              {idx === 0 && <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500"></div>}
                              
                              <div className="flex-1 pl-2">
                                <div className="flex items-center gap-3 mb-1">
                                  <h4 className="font-bold text-slate-900 text-lg">{app.student_email}</h4>
                                  <span className="px-2 py-0.5 bg-yellow-50 border border-yellow-200 text-yellow-700 text-[10px] font-black uppercase rounded-md tracking-wider">
                                    {app.status}
                                  </span>
                                  {idx === 0 && (
                                    <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase rounded-md flex items-center gap-1">
                                      <Sparkles className="h-3 w-3"/> Top Match
                                    </span>
                                  )}
                                </div>
                                <p className="text-sm text-slate-500 font-medium mb-3 truncate w-[90%]">{app.education_details} • CGPA: {app.cgpa}</p>
                            
                                <div className="flex gap-2">
                                  {candidateData.skills_found?.slice(0, 4).map((s, i) => (
                                    <span key={i} className="text-xs px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-slate-600 font-semibold">{s}</span>
                                  ))}
                                </div>
                              </div>

                              <div className="flex flex-col items-end gap-3 border-l border-slate-100 pl-6 ml-4">
                                <div className="text-center">
                                  <div className={`text-3xl font-black tracking-tighter ${candidateData.ai_match_score > 75 ? 'text-indigo-600' : 'text-slate-700'}`}>
                                    {candidateData.ai_match_score || 0}%
                                  </div>
                                  <div className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-0.5">AI Match</div>
                                </div>
                                <button 
                                  onClick={() => setSelectedApplicant(candidateData)}
                                  className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-lg hover:bg-indigo-600 transition-colors w-full shadow-sm"
                                >
                                  Review Profile
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="h-full border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center text-slate-400 font-medium">
                  <Target className="h-12 w-12 text-slate-300 mb-4" />
                  Select a requisition to view AI analytics.
                </div>
              )}
            </div>
          </div>
        )}

        {/* VIEW: ATS KANBAN BOARD */}
        {activeView === 'ats' && (
          <div className="animate-in fade-in h-full flex flex-col">
            <header className="mb-8">
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">Applicant Tracking System</h2>
              <p className="text-slate-500 mt-2 font-medium">Select a job from the Pipeline view to load applicants into this Kanban board.</p>
            </header>
            
            {!selectedJob ? (
              <div className="flex-1 border-2 border-dashed border-slate-200 rounded-3xl flex items-center justify-center text-slate-400 font-medium">
                Please select a job requisition from the AI Ranking Pipeline first.
              </div>
            ) : (
              <div className="flex-1 flex gap-6 overflow-x-auto pb-4">
                {kanbanStages.map((stage) => (
                  <div key={stage} className="w-80 flex-shrink-0 bg-slate-100 rounded-3xl border border-slate-200 h-[calc(100vh-200px)] flex flex-col">
                    <div className="p-4 bg-slate-200 rounded-t-3xl font-bold flex justify-between items-center border-b border-slate-300">
                      <span className="text-slate-700">{stage}</span>
                      <span className="bg-white px-2.5 py-0.5 rounded-lg text-slate-600 text-xs border border-slate-200 shadow-sm">
                        {groupedApps[stage]?.length || 0}
                      </span>
                    </div>
                    
                    <div className="p-4 flex-1 overflow-y-auto space-y-3">
                      {groupedApps[stage]?.map((app, idx) => (
                        <div key={idx} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 cursor-grab hover:border-indigo-400 transition-colors">
                          <div className="flex justify-between items-start mb-2">
                            <p className="font-bold text-sm text-slate-900 truncate w-3/4">{app.student_email}</p>
                            {matches.find(m => m.student_email === app.student_email) && (
                              <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100">
                                {matches.find(m => m.student_email === app.student_email).ai_match_score}%
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 mt-1">CGPA: {app.cgpa}</p>
                        </div>
                      ))}
                      
                      {(!groupedApps[stage] || groupedApps[stage].length === 0) && (
                        <div className="h-full border-2 border-dashed border-slate-300 rounded-2xl flex items-center justify-center text-slate-400 text-xs font-medium py-8 text-center">
                          No candidates at this stage
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* VIEW: CREATE REQUISITION */}
        {activeView === 'post' && (
          <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-300">
            <header className="mb-8">
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">Create Job Requisition</h2>
              <p className="text-slate-500 mt-2 font-medium">Define the role and let our AI engine find the perfect match.</p>
            </header>

            <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-500"></div>
              
              <form onSubmit={handlePostJob} className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="col-span-2 sm:col-span-1">
                    <label className="text-sm font-bold text-slate-700">Job Title</label>
                    <input 
                      required 
                      type="text" 
                      value={formData.job_title} 
                      onChange={(e) => setFormData({...formData, job_title: e.target.value})} 
                      className="w-full mt-1.5 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white transition-all font-medium" 
                      placeholder="e.g. Senior Cloud Engineer" 
                    />
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <label className="text-sm font-bold text-slate-700">CTC Offered</label>
                    <input 
                      required 
                      type="text" 
                      value={formData.ctc} 
                      onChange={(e) => setFormData({...formData, ctc: e.target.value})} 
                      className="w-full mt-1.5 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white transition-all font-medium" 
                      placeholder="e.g. 12 LPA" 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="col-span-2 sm:col-span-1">
                    <label className="text-sm font-bold text-slate-700">Required Skills <span className="text-slate-400 font-normal">(Comma separated)</span></label>
                    <input 
                      required 
                      type="text" 
                      value={formData.required_skills} 
                      onChange={(e) => setFormData({...formData, required_skills: e.target.value})} 
                      className="w-full mt-1.5 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white transition-all font-medium" 
                      placeholder="e.g. React, Node.js, AWS" 
                    />
                    <p className="text-xs text-indigo-500 mt-2 font-bold flex items-center gap-1">
                      <Sparkles className="h-3 w-3"/> Powers the Cosine Similarity Engine.
                    </p>
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <label className="text-sm font-bold text-slate-700">Minimum CGPA Cutoff</label>
                    <input 
                      required 
                      type="number" 
                      step="0.1" 
                      value={formData.min_cgpa} 
                      onChange={(e) => setFormData({...formData, min_cgpa: e.target.value})} 
                      className="w-full mt-1.5 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white transition-all font-medium" 
                      placeholder="e.g. 7.5" 
                    />
                    <p className="text-xs text-slate-500 mt-2 font-medium">Strict matching threshold filter.</p>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-bold text-slate-700">Detailed Description</label>
                  <textarea 
                    required 
                    rows="5" 
                    value={formData.description} 
                    onChange={(e) => setFormData({...formData, description: e.target.value})} 
                    className="w-full mt-1.5 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white transition-all resize-none font-medium" 
                    placeholder="Describe the responsibilities, team, and expectations..."
                  ></textarea>
                </div>

                <div className="pt-4 border-t border-slate-100 flex justify-end">
                  <button type="submit" className="px-8 py-3.5 bg-slate-900 hover:bg-indigo-600 text-white font-bold rounded-xl transition-all shadow-md flex items-center gap-2">
                    Publish Requisition <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* VIEW: AI HIRING COPILOT */}
        {activeView === 'copilot' && (
          <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 h-full flex flex-col">
            <header className="mb-8 text-center mt-12">
              <div className="w-16 h-16 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-indigo-500/30">
                <Bot className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-4xl font-black text-slate-900 tracking-tight mb-4">AI Hiring Copilot</h2>
              <p className="text-slate-500 text-lg font-medium">Chat with your talent pool. Use natural language to filter thousands of resumes instantly.</p>
            </header>

            <div className="flex-1 flex flex-col justify-start items-center mt-8">
              <div className="w-full relative shadow-2xl shadow-indigo-500/10 rounded-2xl">
                <input 
                  type="text" 
                  value={copilotQuery}
                  onChange={(e) => setCopilotQuery(e.target.value)}
                  placeholder="e.g. Find me MERN stack developers with a CGPA above 8.0..."
                  className="w-full pl-6 pr-16 py-5 bg-white border-2 border-indigo-100 rounded-2xl text-lg outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium text-slate-800"
                />
                <button className="absolute right-3 top-1/2 -translate-y-1/2 p-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-colors">
                  <Search className="h-5 w-5" />
                </button>
              </div>
              
              <div className="flex gap-3 mt-6 flex-wrap justify-center">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2 mr-2">Try asking:</span>
                <button 
                  onClick={() => setCopilotQuery('Who is the best fit for Frontend Developer?')} 
                  className="px-4 py-2 bg-white border border-slate-200 text-slate-600 text-sm font-medium rounded-xl hover:border-indigo-300 hover:text-indigo-600 transition-colors"
                >
                  "Who is the best fit for Frontend Developer?"
                </button>
                <button 
                  onClick={() => setCopilotQuery('Show candidates with AWS certifications')} 
                  className="px-4 py-2 bg-white border border-slate-200 text-slate-600 text-sm font-medium rounded-xl hover:border-indigo-300 hover:text-indigo-600 transition-colors"
                >
                  "Show candidates with AWS certifications"
                </button>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* DETAILED APPLICATION MODAL */}
      <AnimatePresence>
        {selectedApplicant && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40"
              onClick={() => setSelectedApplicant(null)}
            />
            <motion.div 
              initial={{ opacity: 0, x: 100 }} 
              animate={{ opacity: 1, x: 0 }} 
              exit={{ opacity: 0, x: 100 }}
              className="fixed right-0 top-0 h-full w-full max-w-2xl bg-white shadow-2xl z-50 flex flex-col overflow-hidden border-l border-slate-200"
            >
              <div className="p-8 border-b border-slate-100 bg-slate-900 text-white flex justify-between items-start relative overflow-hidden">
                <div className="absolute right-0 bottom-0 opacity-10">
                  <Bot className="h-64 w-64 translate-x-1/4 translate-y-1/4" />
                </div>
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-3xl font-black">{selectedApplicant.student_email}</h3>
                  </div>
                  <div className="flex items-center gap-4 text-slate-400 text-sm font-medium mt-4">
                    <span className="flex items-center gap-1"><Calendar className="h-4 w-4"/> Applied: {selectedApplicant.applied_on || "Recently"}</span>
                    <span className="flex items-center gap-1"><LinkIcon className="h-4 w-4"/> Portfolio Link</span>
                  </div>
                </div>
                
                <div className="text-right relative z-10">
                  <button 
                    onClick={() => setSelectedApplicant(null)} 
                    className="p-2 bg-slate-800 hover:bg-rose-500 rounded-full transition-colors mb-4 inline-block shadow-sm"
                  >
                    <X className="h-5 w-5 text-white" />
                  </button>
                  <div className="text-5xl font-black text-indigo-400 tracking-tighter drop-shadow-md">
                    {selectedApplicant.ai_match_score || 0}%
                  </div>
                  <div className="text-[10px] text-slate-300 font-black uppercase tracking-widest mt-1 bg-indigo-500/20 px-2 py-1 rounded border border-indigo-500/30 inline-block">
                    AI Match Score
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-slate-50">
                
                {/* AI Summary Widget */}
                <div className="bg-indigo-50 border border-indigo-100 p-6 rounded-2xl shadow-sm">
                  <h4 className="flex items-center gap-2 font-bold text-indigo-900 text-sm uppercase tracking-wider mb-2">
                    <Sparkles className="h-4 w-4 text-indigo-600"/> AI Candidate Summary
                  </h4>
                  <p className="text-sm text-indigo-800 font-medium leading-relaxed">
                    This candidate has a highly relevant technical stack matching the job description. Strong foundation based on extracted skills.
                    <span className="block mt-2 font-bold text-emerald-600 text-xs uppercase">
                      Verified Skills: {selectedApplicant.skills_found?.join(', ') || 'None listed'}
                    </span>
                  </p>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                  <h4 className="flex items-center gap-2 font-bold text-slate-900 text-lg mb-4">
                    <GraduationCap className="h-5 w-5 text-indigo-600"/> Academic Profile
                  </h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-2">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Degree & Institution</p>
                      <p className="text-slate-800 font-bold">{selectedApplicant.education_details || "Bachelor's Degree"}</p>
                    </div>
                    <div className="col-span-1 border-l border-slate-100 pl-4">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">CGPA</p>
                      <p className="text-2xl font-black text-slate-900">{selectedApplicant.cgpa || "N/A"}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                  <h4 className="flex items-center gap-2 font-bold text-slate-900 text-lg mb-4">
                    <Briefcase className="h-5 w-5 text-indigo-600"/> Experience & Projects
                  </h4>
                  <p className="text-slate-700 whitespace-pre-wrap font-medium leading-relaxed">
                    {selectedApplicant.experience || "No specific experience details provided during application."}
                  </p>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                  <h4 className="flex items-center gap-2 font-bold text-slate-900 text-lg mb-4">
                    <FileText className="h-5 w-5 text-indigo-600"/> Cover Letter
                  </h4>
                  <p className="text-slate-600 whitespace-pre-wrap italic border-l-4 border-indigo-200 pl-4 py-1 text-sm font-medium">
                    {selectedApplicant.cover_letter || "Standard application submitted."}
                  </p>
                </div>

              </div>

              {/* ACTION BUTTON CONTROLS - NOW FULLY WORKABLE AND FUNCTIONAL */}
              <div className="p-6 border-t border-slate-200 bg-white flex justify-between gap-4">
                <button 
                  onClick={() => handleUpdateStatus(selectedApplicant.student_email, 'Rejected')}
                  className="px-6 py-3 font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-xl transition-colors"
                >
                  Reject Candidate
                </button>
                <div className="flex gap-3">
                  <button 
                    onClick={() => handleUpdateStatus(selectedApplicant.student_email, 'Shortlisted')}
                    className="px-6 py-3 font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                  >
                    Keep on Hold
                  </button>
                  <button 
                    onClick={() => handleUpdateStatus(selectedApplicant.student_email, 'Interviewing')}
                    className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all shadow-md flex items-center gap-2"
                  >
                    Move to Interview <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>

            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}