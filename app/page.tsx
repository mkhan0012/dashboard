"use client";

import { login, logout, getUserSession } from "@/app/actions"; 
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { 
  ArrowRight, Sparkles, Mail, BrainCircuit, Zap, CheckCircle2, 
  PlayCircle, Search, Bell, LogOut, User, MousePointerClick, RefreshCw 
} from "lucide-react";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function LandingPage() {
  const [user, setUser] = useState<any>(undefined);

  // Check Login Status on Load
  useEffect(() => {
    getUserSession().then((u) => setUser(u));
  }, []);

  const scrollToDemo = () => {
    const demoSection = document.getElementById("demo-section");
    if (demoSection) {
      demoSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white selection:bg-indigo-500/30 overflow-x-hidden font-sans">
      
      {/* Background Gradients */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px]" />
      </div>

      {/* Navbar */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-2 font-bold text-xl tracking-tight cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <div className="bg-gradient-to-tr from-indigo-500 to-purple-500 p-1.5 rounded-lg shadow-lg shadow-indigo-500/20">
            <Sparkles size={18} className="text-white" />
          </div>
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-400">
            JobTracker
          </span>
        </div>
        
        <div className="flex items-center gap-4">
          {user === undefined ? (
             <div className="w-24 h-10" />
          ) : user ? (
             <div className="flex items-center gap-4 animate-in fade-in duration-500">
                <div className="hidden md:flex items-center gap-2 text-sm font-medium text-zinc-300 bg-zinc-900/50 px-3 py-1.5 rounded-full border border-zinc-800">
                   <User size={14} className="text-indigo-400" />
                   {user.email?.split('@')[0]}
                </div>
                <form action={logout}>
                   <button type="submit" className="text-xs font-bold text-zinc-500 hover:text-red-400 transition-colors flex items-center gap-1">
                      <LogOut size={14} /> Logout
                   </button>
                </form>
                <Link href="/dashboard">
                   <Button className="bg-indigo-600 hover:bg-indigo-500 rounded-full px-6 text-white shadow-lg shadow-indigo-500/20">
                      Dashboard
                   </Button>
                </Link>
             </div>
          ) : (
             <>
               <form action={login}>
                 <button type="submit" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">
                   Login
                 </button>
               </form>
               <form action={login}>
                 <Button type="submit" className="bg-white text-zinc-950 hover:bg-zinc-200 rounded-full px-6 font-semibold transition-all hover:scale-105">
                   Launch App
                 </Button>
               </form>
             </>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 pt-20 pb-32 px-6 text-center max-w-5xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900/50 border border-zinc-800 text-xs font-medium text-indigo-400 mb-4 hover:border-indigo-500/50 transition-colors cursor-default">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            v2.0 Now with AI Resume Coach
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-tight">
            Stop guessing. <br />
            Start <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">getting hired.</span>
          </h1>
          
          <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            The all-in-one AI career copilot. Sync your emails, analyze your resume, 
            and draft perfect replies in seconds.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
            {user ? (
               <Link href="/dashboard">
                  <Button size="lg" className="h-12 px-8 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-lg shadow-[0_0_30px_rgba(79,70,229,0.3)] transition-all hover:scale-105 hover:shadow-indigo-500/40">
                     Open Dashboard <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
               </Link>
            ) : (
               <form action={login}>
                  <Button type="submit" size="lg" className="h-12 px-8 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-lg shadow-[0_0_30px_rgba(79,70,229,0.3)] transition-all hover:scale-105 hover:shadow-indigo-500/40">
                     Get Started for Free <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
               </form>
            )}
            
            <Button 
              onClick={scrollToDemo}
              variant="outline" 
              size="lg" 
              className="h-12 px-8 rounded-full border-zinc-800 text-zinc-300 hover:bg-zinc-900 hover:text-white hover:border-zinc-700 transition-all"
            >
              <PlayCircle className="mr-2 h-5 w-5" /> View Demo
            </Button>
          </div>
        </motion.div>

        {/* === How it Works Steps === */}
        <div className="mt-24 grid md:grid-cols-3 gap-8 text-left relative z-20">
           <StepCard 
              num="01" 
              title="Connect Gmail" 
              desc="Log in securely with Google. We only scan for job-related emails." 
           />
           <StepCard 
              num="02" 
              title="Click 'Sync'" 
              desc="Hit the sync button in the dashboard to fetch your applications instantly." 
           />
           <StepCard 
              num="03" 
              title="Get Hired" 
              desc="Use AI to analyze offers, draft replies, and track your progress." 
           />
        </div>

        {/* Dashboard Preview Visual (REAL MINI DASHBOARD) */}
        <motion.div 
           id="demo-section" 
           initial={{ opacity: 0, y: 40 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.8, delay: 0.2 }}
           className="mt-20 relative mx-auto max-w-5xl scroll-mt-24"
        >
          {/* ✅ FIXED TOOLTIP POSITION: Now points to the mail icon */}
          <div className="absolute top-[-30px] right-[55px] z-50 hidden md:block animate-bounce">
             <div className="bg-indigo-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg mb-2">
                Click here to Sync!
             </div>
             <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-indigo-600 mx-auto"></div>
          </div>

          <div className="rounded-xl bg-zinc-900/50 border border-zinc-800 p-2 backdrop-blur-sm shadow-2xl relative">
            <div className="rounded-lg overflow-hidden bg-zinc-950 aspect-[16/9] relative group border border-zinc-900 flex flex-col">
              
              {/* === MINI DASHBOARD HEADER === */}
              <div className="h-14 border-b border-zinc-800 flex items-center justify-between px-6 bg-zinc-900/50">
                 <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-red-500/20 border border-red-500/50"></div>
                    <div className="h-3 w-3 rounded-full bg-amber-500/20 border border-amber-500/50"></div>
                    <div className="h-3 w-3 rounded-full bg-green-500/20 border border-green-500/50"></div>
                 </div>
                 <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black border border-zinc-800 text-xs text-zinc-400">
                       <Search size={12} /> Search...
                    </div>
                    
                    {/* FAKE SYNC BUTTON FOR DEMO */}
                    <div className="p-2 rounded-full bg-indigo-500/20 border border-indigo-500/50 text-indigo-400 animate-pulse cursor-pointer hover:bg-indigo-500/30 transition-colors">
                       <Mail size={14} />
                    </div>

                    <Bell size={14} className="text-zinc-500" />
                    <div className="h-6 w-6 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500"></div>
                 </div>
              </div>

              {/* === MINI DASHBOARD BODY === */}
              <div className="flex-1 p-6 flex gap-6 overflow-hidden">
                 
                 {/* Sidebar (Left) */}
                 <div className="w-48 hidden md:flex flex-col gap-2">
                    <div className="px-3 py-2 rounded-lg bg-indigo-500/10 text-indigo-400 text-xs font-bold flex items-center gap-2 border border-indigo-500/20">
                       <Sparkles size={12} /> Overview
                    </div>
                    <div className="px-3 py-2 rounded-lg hover:bg-white/5 text-zinc-500 text-xs font-medium flex items-center gap-2 transition-colors">
                       <Mail size={12} /> Applications
                    </div>
                    <div className="px-3 py-2 rounded-lg hover:bg-white/5 text-zinc-500 text-xs font-medium flex items-center gap-2 transition-colors">
                       <BrainCircuit size={12} /> AI Insights
                    </div>
                 </div>

                 {/* Main Content (Right) */}
                 <div className="flex-1 flex flex-col gap-6">
                    
                    {/* KPI Cards */}
                    <div className="grid grid-cols-3 gap-4">
                       <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 relative overflow-hidden">
                          <div className="text-[10px] uppercase text-zinc-500 font-bold mb-1">Total Applied</div>
                          <div className="text-2xl font-bold text-white">124</div>
                          <div className="absolute right-0 bottom-0 opacity-10"><Mail size={60}/></div>
                       </div>
                       <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 relative overflow-hidden">
                          <div className="text-[10px] uppercase text-indigo-400 font-bold mb-1">Interviews</div>
                          <div className="text-2xl font-bold text-indigo-400">8</div>
                          <div className="absolute right-0 bottom-0 opacity-10 text-indigo-500"><BrainCircuit size={60}/></div>
                       </div>
                       <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 relative overflow-hidden">
                          <div className="text-[10px] uppercase text-emerald-400 font-bold mb-1">Offers</div>
                          <div className="text-2xl font-bold text-emerald-400">2</div>
                          <div className="absolute right-0 bottom-0 opacity-10 text-emerald-500"><CheckCircle2 size={60}/></div>
                       </div>
                    </div>

                    <div className="flex gap-6 flex-1 min-h-0">
                       {/* Mock Chart */}
                       <div className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex flex-col justify-between">
                          <div className="flex justify-between items-center mb-4">
                             <div className="text-xs font-bold text-zinc-400">Activity</div>
                             <div className="text-[10px] text-zinc-600 bg-black px-2 py-1 rounded">Last 7 Days</div>
                          </div>
                          <div className="flex items-end justify-between gap-2 h-full px-2">
                             {[30, 50, 40, 70, 50, 80, 60].map((h, i) => (
                                <div key={i} className="w-full bg-indigo-500/20 rounded-t hover:bg-indigo-500/40 transition-colors relative group" style={{ height: `${h}%` }}>
                                   <div className="absolute inset-x-0 bottom-0 h-1 bg-indigo-500/50"></div>
                                </div>
                             ))}
                          </div>
                       </div>

                       {/* Mock List */}
                       <div className="w-1/3 bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex flex-col gap-3">
                          <div className="text-xs font-bold text-zinc-400 mb-1">Recent</div>
                          {[
                             { name: "Google", role: "Senior Dev", status: "Interview", color: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20" },
                             { name: "Vercel", role: "Design Eng", status: "Applied", color: "text-zinc-400 bg-zinc-800 border-zinc-700" },
                             { name: "Netflix", role: "Frontend", status: "Offer", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" }
                          ].map((item, i) => (
                             <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-black/20 border border-zinc-800/50">
                                <div>
                                   <div className="text-xs font-bold text-white">{item.name}</div>
                                   <div className="text-[10px] text-zinc-500">{item.role}</div>
                                </div>
                                <div className={`text-[9px] px-1.5 py-0.5 rounded border ${item.color} font-bold uppercase`}>{item.status}</div>
                             </div>
                          ))}
                       </div>
                    </div>

                 </div>
              </div>
              
              {/* Overlay Gradient for depth */}
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent opacity-40 pointer-events-none" />
              
            </div>
          </div>
          {/* Glow Effect behind image */}
          <div className="absolute -inset-4 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl blur-3xl opacity-20 -z-10" />
        </motion.div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-zinc-950/50 border-t border-zinc-900">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Supercharge your job search</h2>
            <p className="text-zinc-400 max-w-2xl mx-auto">
              Replace your spreadsheet with an intelligent system that works for you 24/7.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Mail className="text-blue-400" />}
              title="Auto-Sync Emails"
              desc="Connect your Gmail and watch your applications appear instantly. No more manual data entry."
            />
            <FeatureCard 
              icon={<BrainCircuit className="text-purple-400" />}
              title="AI Recruiter Insights"
              desc="Get real-time feedback on your application status and probability of getting an interview."
            />
             <FeatureCard 
              icon={<Zap className="text-amber-400" />}
              title="Smart Reply Drafts"
              desc="Let AI write the perfect follow-up or thank you email in seconds based on context."
            />
          </div>
        </div>
      </section>

      {/* Social Proof / Stats */}
      <section className="py-20 border-t border-zinc-900">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <Stat number="100%" label="Private Data" />
            <Stat number="500+" label="Resumes Parsed" />
            <Stat number="24/7" label="AI Availability" />
            <Stat number="10x" label="Faster Apply" />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto bg-gradient-to-br from-indigo-900/50 to-purple-900/50 rounded-3xl p-12 text-center border border-indigo-500/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/30 rounded-full blur-[100px] -mr-32 -mt-32" />
          
          <h2 className="text-3xl md:text-4xl font-bold mb-6 relative z-10">Ready to land your next role?</h2>
          <p className="text-indigo-200 mb-8 max-w-xl mx-auto relative z-10">
            Join thousands of developers who are organizing their job search with AI.
          </p>
          
          <div className="relative z-10">
            {user ? (
               <Link href="/dashboard">
                  <Button size="lg" className="bg-white text-indigo-900 hover:bg-zinc-100 font-bold px-8 py-6 rounded-full text-lg shadow-xl transition-transform hover:scale-105">
                     Go to Dashboard
                  </Button>
               </Link>
            ) : (
               <form action={login}>
                  <Button type="submit" size="lg" className="bg-white text-indigo-900 hover:bg-zinc-100 font-bold px-8 py-6 rounded-full text-lg shadow-xl transition-transform hover:scale-105">
                     Start Tracking Now
                  </Button>
               </form>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-zinc-900 text-center text-zinc-500 text-sm">
        <p>© 2025 JobTracker AI. Built for developers.</p>
      </footer>
    </div>
  );
}

// --- SUBCOMPONENTS ---

function StepCard({ num, title, desc }: any) {
   return (
      <div className="flex flex-col gap-2 p-6 rounded-2xl bg-zinc-900/20 border border-zinc-800/50 hover:bg-zinc-900/50 transition-colors">
         <div className="text-4xl font-bold text-zinc-800 mb-2">{num}</div>
         <h3 className="text-lg font-bold text-white">{title}</h3>
         <p className="text-sm text-zinc-400 leading-relaxed">{desc}</p>
      </div>
   )
}

function FeatureCard({ icon, title, desc }: any) {
  return (
    <div className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800 hover:border-zinc-700 transition-all hover:-translate-y-1 group">
      <div className="w-12 h-12 rounded-lg bg-zinc-800 flex items-center justify-center mb-4 group-hover:bg-zinc-800/80 transition-colors">
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-zinc-400 leading-relaxed">{desc}</p>
    </div>
  );
}

function Stat({ number, label }: any) {
  return (
    <div>
      <div className="text-3xl md:text-4xl font-bold text-white mb-1">{number}</div>
      <div className="text-zinc-500 text-sm uppercase tracking-wider font-medium">{label}</div>
    </div>
  );
}