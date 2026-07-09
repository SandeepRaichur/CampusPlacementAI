// src/pages/HomePage.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  GraduationCap, Building2, ChevronRight, 
  Sparkles, BrainCircuit, Target, BarChart3, 
  ScanText, Zap, ArrowRight 
} from 'lucide-react';

// IMPORT THE SMART NAVBAR HERE
import Navbar from '../components/Navbar'; 

// Reusable animated gradient background for cards
const GradientGlow = () => (
  <div className="absolute inset-0 z-0 opacity-40 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none">
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] rounded-full blur-[60px] bg-gradient-to-r from-blue-600/10 via-purple-500/10 to-transparent" />
  </div>
);

// Framer Motion Variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { y: 30, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
};

const staggerContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2, delayChildren: 0.1 }
  }
};

const gridItemVariants = {
  hidden: { y: 40, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] }
  }
};

const staggerChildrenVariantsSmall = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
};

const itemVariantsSmall = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-blue-600/20 overflow-x-hidden">
      
      {/* 1. THE NEW GLOBAL NAVBAR COMPONENT */}
      <Navbar />

      {/* 2. ADVANCED HERO SECTION */}
      <section className="relative pt-36 pb-24 lg:pt-52 lg:pb-36 px-6 overflow-hidden">
        <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] bg-blue-600/10 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-500/10 rounded-full blur-[100px] animate-pulse delay-1000" />

        <motion.div 
          className="max-w-5xl mx-auto text-center relative z-10"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <motion.div variants={itemVariants} className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-sm font-bold mb-8 shadow-sm">
            <Sparkles className="h-4 w-4" />
            <span className="tracking-tight">Pioneering AI-Driven Campus Recruitment for the 2026 Batch</span>
          </motion.div>
          
          <motion.h1 variants={itemVariants} className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter text-slate-950 mb-7 leading-tight">
            Unified, <span className="text-blue-600">Intelligent</span> Campus Placements.
          </motion.h1>

          <motion.p variants={itemVariants} className="text-lg md:text-xl text-slate-600 mb-12 max-w-3xl mx-auto font-medium leading-relaxed tracking-tight">
            Stop juggling spreadsheets. HireNexus.ai connects colleges, students, and companies in one powerful SaaS ecosystem, optimized with cutting-edge AI for higher placement rates and faster hiring.
          </motion.p>

          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center gap-5">
            <Link to="/student/setup" className="w-full sm:w-auto px-10 py-4 bg-blue-600 text-white rounded-xl font-extrabold text-lg shadow-2xl shadow-blue-600/40 hover:-translate-y-1 transition-all flex items-center justify-center gap-2.5 active:scale-95">
              Get Started Free <ChevronRight className="h-5 w-5" />
            </Link>
            <Link 
              to="/company/dashboard"
              className="w-full sm:w-auto px-10 py-4 bg-white border-2 border-slate-200 text-slate-800 rounded-xl font-extrabold text-lg hover:border-slate-300 hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
            >
              View Employer Portal
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* 3. BENTO BOX AI FEATURES GRID */}
      <section id="features" className="py-24 px-6 bg-slate-50/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20 max-w-2xl mx-auto">
            <motion.h2 
              className="text-4xl md:text-5xl font-black tracking-tighter text-slate-950 mb-5 leading-tight"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              Not Just a Portal.<br/> An Intelligent Operating System.
            </motion.h2>
            <p className="text-slate-600 font-medium tracking-tight text-lg">Discover how HireNexus.ai uses proven AI techniques to optimize every step of campus recruitment.</p>
          </div>

          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            variants={staggerContainerVariants}
          >
            {/* AI Feature 1: Large Bento Box */}
            <motion.div variants={gridItemVariants} className="md:col-span-2 group relative p-8 md:p-12 rounded-3xl bg-white border border-slate-200 shadow-sm overflow-hidden hover:border-blue-600/40 transition-colors duration-500">
              <GradientGlow />
              <div className="relative z-10 grid md:grid-cols-2 gap-8 items-center">
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-600/10 flex items-center justify-center border border-blue-600/20 mb-6">
                    <ScanText className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="text-2xl font-bold tracking-tight text-slate-950">AI Resume Parser (NLP)</h3>
                  <p className="text-slate-600 text-base leading-relaxed tracking-tight">Students upload a PDF. Our PyPDF2 & Natural Language Processing engine instantly extracts skills, education, and experience, automatically populating their profiles.</p>
                  <Link to="/student/setup" className="flex items-center gap-2 text-blue-600 text-sm font-bold pt-2 group-hover:gap-3 transition-all inline-flex">Try it now <ArrowRight className="h-4 w-4" /></Link>
                </div>
                <div className="p-5 bg-slate-900 rounded-xl font-mono text-xs text-green-400 space-y-2.5 shadow-inner">
                   <p><span className="text-purple-400"># extracting_entities...</span></p>
                   <p className="text-white">extracted_skills = ["Python", "React", "MySQL"]</p>
                   <p><span className="text-slate-400">parsing accuracy: 98.4%</span></p>
                </div>
              </div>
            </motion.div>

            {/* AI Feature 2 */}
            <motion.div variants={gridItemVariants} className="group relative p-8 rounded-3xl bg-white border border-slate-200 shadow-sm overflow-hidden hover:border-purple-500/30 transition-colors duration-500">
               <GradientGlow />
               <div className="relative z-10">
                 <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center border border-purple-200 mb-6">
                    <BrainCircuit className="h-6 w-6 text-purple-700" />
                 </div>
                 <h3 className="text-xl font-bold tracking-tight text-slate-950 mb-3">Cosine Similarity Math</h3>
                 <p className="text-slate-600 text-base leading-relaxed tracking-tight">Instantly rank students against Job Descriptions. Our Scikit-Learn AI calculates a proprietary Match Score by mathematically comparing vectors.</p>
               </div>
            </motion.div>

            {/* AI Feature 3 */}
            <motion.div variants={gridItemVariants} className="group relative p-8 rounded-3xl bg-white border border-slate-200 shadow-sm overflow-hidden hover:border-emerald-500/30 transition-colors duration-500">
                <GradientGlow />
                <div className="relative z-10">
                    <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center border border-emerald-200 mb-6">
                        <Zap className="h-6 w-6 text-emerald-700" />
                    </div>
                    <h3 className="text-xl font-bold tracking-tight text-slate-950 mb-3">Enterprise Application</h3>
                    <p className="text-slate-600 text-base leading-relaxed tracking-tight">Move past simple "1-click" applies. Generate comprehensive, deep-data dossiers including CGPA, digital portfolios, and dynamic cover letters.</p>
                </div>
            </motion.div>

            {/* AI Feature 4: Large Bento Box */}
            <motion.div variants={gridItemVariants} className="md:col-span-2 group relative p-8 md:p-12 rounded-3xl bg-white border border-slate-200 shadow-sm overflow-hidden hover:border-blue-500/30 transition-colors duration-500">
                <GradientGlow />
                <div className="relative z-10 grid md:grid-cols-2 gap-8 items-center">
                    <div className="p-6 bg-slate-50 rounded-xl border border-slate-200 flex items-end gap-3 h-48">
                       <div className="flex-1 bg-blue-600/20 h-[40%] rounded-md hover:bg-blue-600/40 transition-colors"></div>
                       <div className="flex-1 bg-blue-600 h-[80%] rounded-md shadow-md shadow-blue-600/20"></div>
                       <div className="flex-1 bg-blue-600/20 h-[60%] rounded-md hover:bg-blue-600/40 transition-colors"></div>
                       <div className="flex-1 bg-blue-600/20 h-[30%] rounded-md hover:bg-blue-600/40 transition-colors"></div>
                    </div>
                    <div className="space-y-4">
                        <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center border border-blue-200 mb-6">
                            <BarChart3 className="h-6 w-6 text-blue-700" />
                        </div>
                        <h3 className="text-2xl font-bold tracking-tight text-slate-950">ATS Pipeline Analytics</h3>
                        <p className="text-slate-600 text-base leading-relaxed tracking-tight">A beautiful, functional drag-and-drop pipeline interface for HR managers to easily identify, rank, and track the best candidates in the entire college batch.</p>
                    </div>
                </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* 4. THE STAKEHOLDER WORKFLOW SECTION */}
      <section className="py-28 px-6 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <motion.h2 
              className="text-4xl md:text-5xl font-black tracking-tighter text-slate-950 leading-tight"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              Unified Ecosystem. Personalized Experience.
            </motion.h2>
            <p className="text-slate-600 font-medium tracking-tight text-lg">Stop using three different systems to manage placements. HireNexus.ai provides dedicated, intelligent dashboards for every stakeholder.</p>
            
            <motion.div 
               className="space-y-5"
               initial="hidden"
               whileInView="visible"
               viewport={{ once: true }}
               variants={staggerChildrenVariantsSmall}
            >
              {[
                { icon: GraduationCap, title: "Students", text: "Resume Parser, AI Ranking Profiles, Detailed Application Forms.", color: "text-blue-600" },
                { icon: Building2, title: "Colleges (TPOs)", text: "Predictive Analytics, Smart Outreach Engine, Automated Analytics.", color: "text-purple-600" },
                { icon: Target, title: "Companies (HR)", text: "Instant JD Matching, Automized Shortlisting Pipeline.", color: "text-emerald-600" }
              ].map((role) => (
                <motion.div variants={itemVariantsSmall} key={role.title} className="flex gap-4 items-start p-6 bg-slate-50 border border-slate-200 rounded-2xl hover:shadow-md transition-shadow">
                    <role.icon className={`h-7 w-7 ${role.color} mt-0.5 flex-shrink-0`} />
                    <div>
                        <h4 className="font-extrabold text-lg text-slate-950 tracking-tight mb-1">{role.title}</h4>
                        <p className="text-base text-slate-600 tracking-tight">{role.text}</p>
                    </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
          
          <div className="relative h-[400px] flex items-center justify-center">
             <div className="absolute inset-0 bg-blue-600/5 rounded-full blur-[70px]"></div>
             <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 40, ease: "linear" }} className="relative h-72 w-72 rounded-full border-2 border-dashed border-slate-200">
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-blue-600 p-5 rounded-full text-white shadow-xl shadow-blue-600/30 z-10">
                 <Sparkles className="h-8 w-8" />
               </div>
               <div className="absolute top-[-20px] left-1/2 -translate-x-1/2 bg-white p-4 rounded-xl shadow-lg border border-slate-100 z-0 text-blue-600">
                 <GraduationCap className="h-6 w-6" />
               </div>
               <div className="absolute bottom-[-20px] left-1/2 -translate-x-1/2 bg-white p-4 rounded-xl shadow-lg border border-slate-100 z-0 text-purple-600">
                 <Building2 className="h-6 w-6" />
               </div>
               <div className="absolute top-1/2 right-[-20px] -translate-y-1/2 bg-white p-4 rounded-xl shadow-lg border border-slate-100 z-0 text-emerald-600">
                 <Target className="h-6 w-6" />
               </div>
             </motion.div>
          </div>
        </div>
      </section>

      {/* 5. MINIMALIST PRICING STRATEGY SECTION */}
      <section id="pricing" className="py-24 px-6 bg-slate-50/50 relative">
        <div className="absolute top-0 right-[-10%] w-[30%] h-[30%] bg-purple-500/10 rounded-full blur-[80px]" />

        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 max-w-xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-slate-950 mb-5">SaaS Pricing</h2>
            <p className="text-slate-600 font-medium tracking-tight text-lg">Flexible annual subscription plans built for colleges and institutions of all sizes.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 items-start">
            {[
              { name: "Starter", price: "Basic", desc: "For small institutions starting digitization.", features: ["Resume Upload", "Manual Drives", "Email Support"], primary: false },
              { name: "Pro AI", price: "Custom", desc: "For modern colleges needing AI intelligence.", features: ["AI Resume Parser", "Cosine Matching", "Predictive Analytics"], primary: true },
              { name: "Enterprise", price: "Custom", desc: "For large universities with multiple branches.", features: ["Deep Data Dossiers", "Custom Branding", "TPO Outreach Engine"], primary: false }
            ].map((plan, index) => (
                <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    key={plan.name} 
                    className={`p-10 rounded-3xl bg-white border border-slate-200 overflow-hidden relative ${plan.primary ? 'border-blue-600 ring-2 ring-blue-600/20 shadow-xl scale-105 z-10' : 'shadow-sm mt-4'}`}
                >
                  {plan.primary && <div className="absolute top-4 right-4 text-xs font-bold text-blue-600 bg-blue-600/10 px-3 py-1 rounded-full">Most Popular</div>}
                  <h3 className="text-xl font-extrabold text-slate-950 mb-1">{plan.name}</h3>
                  <div className="mb-6"><span className="text-4xl font-black text-slate-950 tracking-tighter">{plan.price}</span> <span className="text-slate-500 text-sm font-semibold">/year</span></div>
                  <p className="text-base text-slate-600 mb-8 font-medium leading-relaxed tracking-tight">{plan.desc}</p>
                  
                  <ul className="space-y-4 mb-10 text-slate-700 text-sm font-semibold">
                    {plan.features.map(f => <li key={f} className="flex gap-3 items-center"><Zap className="h-5 w-5 text-blue-600" /> {f}</li>)}
                  </ul>
                  
                  <button className={`w-full py-4 rounded-xl font-bold transition-all text-base ${plan.primary ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-600/30' : 'bg-slate-50 text-slate-800 border border-slate-200 hover:bg-slate-100'}`}>Request Demo</button>
                </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. MINIMALIST FOOTER */}
      <footer className="bg-slate-950 text-slate-400 py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center mb-10 pb-10 border-b border-slate-800 gap-6">
             <Link to="/" className="flex items-center gap-2.5">
               <div className="bg-blue-600 p-2 rounded-xl">
                 <GraduationCap className="h-6 w-6 text-white" />
               </div>
               <span className="text-2xl font-black tracking-tighter text-white">
                 HireNexus<span className="text-blue-600">.ai</span>
               </span>
             </Link>
             <div className="flex items-center gap-6 text-slate-400 text-sm font-medium">
                <a href="#features" className="hover:text-white transition-colors">AI Features</a>
                <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
                <a href="#" className="hover:text-white transition-colors">Contact</a>
             </div>
          </div>
          <div className="text-center text-slate-500 text-sm tracking-tight font-medium">
             © 2026 HireNexus.ai B2B SaaS Platform. All rights reserved. Hubballi, Karnataka, India.
          </div>
        </div>
      </footer>
    </div>
  );
}