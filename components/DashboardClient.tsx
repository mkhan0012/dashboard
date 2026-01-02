"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { deleteApplication, updateStatus, saveNote } from "@/app/actions";
import { useRouter } from "next/navigation";
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { 
  Loader2, Trash2, ExternalLink, X, Save, Search, Sparkles, Filter, 
  BrainCircuit, CheckCircle2, Home, Mail, PenTool, Copy, Check, Bell, 
  LayoutGrid, FileText, UploadCloud, AlertTriangle, TrendingUp, File as FileIcon,
  Mic, Send, DollarSign, Paperclip
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button"; 

// DnD Kit Imports
import { DndContext, DragOverlay, useDraggable, useDroppable, closestCorners } from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';

export default function DashboardClient({ initialApps }: { initialApps: any[] }) {
  // --- STATE ---
  const [activeView, setActiveView] = useState<'overview' | 'applications' | 'board'>('overview');
  const [filter, setFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [isSyncing, setIsSyncing] = useState(false);
  const [selectedApp, setSelectedApp] = useState<any>(null);
  const [noteInput, setNoteInput] = useState("");
  
  // App AI State
  const [activeTab, setActiveTab] = useState<'insight' | 'draft'>('insight');
  const [aiData, setAiData] = useState<any>(null);
  const [draftData, setDraftData] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isDrafting, setIsDrafting] = useState(false);
  const [copied, setCopied] = useState(false);

  // Resume & Interview State
  const [showResumeModal, setShowResumeModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [resumeData, setResumeData] = useState<any>(null);
  const [isResumeAnalyzing, setIsResumeAnalyzing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Resume Versioning State (Per App)
  const [attachedResumes, setAttachedResumes] = useState<Record<string, string>>({}); // Maps AppID -> Filename

  // Mock Interview / Salary Coach State
  const [showInterviewModal, setShowInterviewModal] = useState(false);
  const [interviewType, setInterviewType] = useState<'interview' | 'salary'>('interview');
  const [interviewMessages, setInterviewMessages] = useState<any[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  const router = useRouter();

  // --- AUTO SYNC (12 Hours) ---
  useEffect(() => {
    const checkForAutoSync = () => {
      const lastSyncTime = localStorage.getItem("jobTrackerLastSync");
      const twelveHours = 12 * 60 * 60 * 1000;
      const now = Date.now();
      if (!lastSyncTime || now - parseInt(lastSyncTime) > twelveHours) {
        handleSync();
      }
    };
    checkForAutoSync();
    const interval = setInterval(checkForAutoSync, 60 * 60 * 1000); 
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [interviewMessages]);

  // --- LOGIC ---
  const filteredApps = initialApps.filter((app) => {
    const matchesSearch = app.company.toLowerCase().includes(search.toLowerCase()) || 
                          app.role.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === "ALL" ? true : app.status === filter;
    return matchesSearch && matchesFilter;
  });

  const recentApps = [...initialApps].sort((a, b) => new Date(b.emailDate).getTime() - new Date(a.emailDate).getTime()).slice(0, 5);

  const chartData = initialApps.reduce((acc: any[], app) => {
    const month = new Date(app.emailDate).toLocaleString('en-US', { month: 'short' });
    const existing = acc.find(item => item.name === month);
    if (existing) existing.count++;
    else acc.push({ name: month, count: 1 });
    return acc;
  }, []).reverse();

  // --- HANDLERS ---

  const handleSync = async () => {
    if (isSyncing) return; 
    setIsSyncing(true);
    try {
      await fetch("/api/sync", { method: "POST" });
      localStorage.setItem("jobTrackerLastSync", Date.now().toString());
      router.refresh(); 
    } catch (error) { console.error("Sync failed:", error); }
    setIsSyncing(false);
  };

  const openDetails = (app: any) => {
    setSelectedApp(app);
    setNoteInput(app.notes || "");
    setAiData(null); 
    setDraftData(null);
    setActiveTab('insight');
  };

  const handleSaveNote = async () => {
    if(!selectedApp) return;
    await saveNote(selectedApp._id, noteInput);
    setSelectedApp({ ...selectedApp, notes: noteInput });
  };

  const handleAnalyze = async () => {
    if (!selectedApp) return;
    setIsAnalyzing(true);
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ snippet: selectedApp.snippet, subject: selectedApp.role, company: selectedApp.company, mode: 'analyze' }),
      });
      const data = await res.json();
      setAiData(data);
    } catch (e) { console.error(e); }
    setIsAnalyzing(false);
  };

  const handleDraft = async () => {
    if (!selectedApp) return;
    setIsDrafting(true);
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ snippet: selectedApp.snippet, company: selectedApp.company, context: aiData?.summary || "Draft a professional follow-up", mode: 'draft' }),
      });
      const data = await res.json();
      setDraftData(data);
    } catch (e) { console.error(e); }
    setIsDrafting(false);
  };

  // Resume Coach (General)
  const handleResumeAnalyze = async () => {
    if (!selectedFile) return;
    setIsResumeAnalyzing(true);
    const formData = new FormData();
    formData.append("file", selectedFile);
    try {
      const res = await fetch('/api/analyze', { method: 'POST', body: formData });
      const data = await res.json();
      setResumeData(data);
    } catch (e) { console.error(e); }
    setIsResumeAnalyzing(false);
  };

  // Resume Versioning (Per App)
  const handleAttachResume = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && selectedApp) {
      const file = e.target.files[0];
      // In a real app, upload to S3/Blob storage here
      setAttachedResumes(prev => ({ ...prev, [selectedApp._id]: file.name }));
    }
  };

  // Chat Logic (Interview or Salary)
  const startChat = async (type: 'interview' | 'salary') => {
    if(!selectedApp) return;
    setInterviewType(type);
    setShowInterviewModal(true);
    setInterviewMessages([]);
    setIsChatLoading(true);
    
    // Hidden trigger to start the conversation
    const triggerText = type === 'salary' 
      ? "I have received an offer. Please act as a salary negotiation coach. Ask me about the offer details." 
      : "I am ready for the interview. Please introduce yourself and ask the first question.";

    const hiddenTrigger = { role: "user", content: triggerText };

    try {
      const res = await fetch('/api/interview', {
        method: 'POST',
        body: JSON.stringify({ 
            messages: [hiddenTrigger], 
            company: selectedApp.company, 
            role: selectedApp.role,
            type: type // ✅ Sending the type to API
        })
      });
      
      const data = await res.json();
      if(data.content) {
         setInterviewMessages([data]);
      } else {
         setInterviewMessages([{ role: "assistant", content: "Connection successful, waiting for AI..."}]);
      }
    } catch(e) { console.error(e); }
    setIsChatLoading(false);
  };

  const sendChatMessage = async () => {
    if(!chatInput.trim()) return;
    const newHistory = [...interviewMessages, { role: "user", content: chatInput }];
    setInterviewMessages(newHistory);
    setChatInput("");
    setIsChatLoading(true);
    
    try {
      const res = await fetch('/api/interview', {
        method: 'POST',
        body: JSON.stringify({ 
            messages: newHistory, 
            company: selectedApp.company, 
            role: selectedApp.role,
            type: interviewType
        })
      });
      const data = await res.json();
      setInterviewMessages([...newHistory, data]);
    } catch(e) { console.error(e); }
    setIsChatLoading(false);
  };

  const handleDragEnd = async (event: any) => {
    const { active, over } = event;
    if (!over) return;
    const appId = active.id;
    const newStatus = over.id;
    if (["APPLIED", "INTERVIEW", "OFFER", "REJECTED"].includes(newStatus)) {
       await updateStatus(appId, newStatus);
       router.refresh(); 
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) setSelectedFile(e.target.files[0]);
  };

  const copyDraft = () => {
    if (draftData?.body) {
      navigator.clipboard.writeText(draftData.body);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans selection:bg-indigo-500/30 overflow-hidden flex flex-col">
      
      {/* HEADER */}
      <header className="h-16 border-b border-zinc-800 flex items-center justify-between px-6 bg-zinc-900/50 backdrop-blur-xl shrink-0 z-20">
         <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2 font-bold text-lg tracking-tight">
               <div className="bg-gradient-to-tr from-indigo-500 to-purple-500 p-1.5 rounded-lg">
                  <Sparkles size={16} className="text-white" />
               </div>
               <span className="hidden md:block bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-400">
                  JobTracker
               </span>
            </Link>
           
         </div>

         <div className="flex items-center gap-4">
            <div className="relative group hidden sm:block">
               <Search className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500 group-focus-within:text-indigo-400 transition-colors" />
               <input type="text" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-64 pl-10 pr-4 py-2 bg-black/40 border border-zinc-800 rounded-full text-sm text-zinc-300 focus:outline-none focus:border-indigo-500/50 transition-all"/>
            </div>
            <button onClick={handleSync} disabled={isSyncing} className={`p-2 rounded-full border transition-all ${isSyncing ? 'border-indigo-500/50 bg-indigo-500/10 text-indigo-400' : 'border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white'}`}>
               {isSyncing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
            </button>
            <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 shadow-lg shadow-indigo-500/20"></div>
         </div>
      </header>

      {/* BODY */}
      <div className="flex-1 flex overflow-hidden">
         <aside className="w-64 border-r border-zinc-800 bg-zinc-900/30 hidden md:flex flex-col gap-2 p-4">
            <div className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2 px-2">Workspace</div>
            <button onClick={() => setActiveView("overview")} className={`px-3 py-2.5 rounded-xl text-sm font-medium flex items-center gap-3 transition-all ${activeView === 'overview' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 'text-zinc-400 hover:bg-white/5 hover:text-white'}`}>
               <LayoutGrid size={18} /> Overview
            </button>
            <button onClick={() => setActiveView("applications")} className={`px-3 py-2.5 rounded-xl text-sm font-medium flex items-center gap-3 transition-all ${activeView === 'applications' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 'text-zinc-400 hover:bg-white/5 hover:text-white'}`}>
               <Mail size={18} /> Applications
            </button>
            <button onClick={() => setActiveView("board")} className={`px-3 py-2.5 rounded-xl text-sm font-medium flex items-center gap-3 transition-all ${activeView === 'board' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 'text-zinc-400 hover:bg-white/5 hover:text-white'}`}>
               <div className="rotate-90"><LayoutGrid size={18} /></div> Kanban Board
            </button>
            <button onClick={() => setShowResumeModal(true)} className={`px-3 py-2.5 rounded-xl text-sm font-medium flex items-center gap-3 transition-all text-zinc-400 hover:bg-white/5 hover:text-white`}>
               <FileText size={18} /> Resume Coach
            </button>
         </aside>

         <main className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth">
            {activeView === 'overview' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <KpiCard title="Total Applied" value={initialApps.length} icon={<Mail size={80}/>} color="text-white" bgColor="bg-zinc-900"/>
                    <KpiCard title="Interviews" value={initialApps.filter(a => a.status === 'INTERVIEW').length} icon={<BrainCircuit size={80}/>} color="text-indigo-400" bgColor="bg-zinc-900"/>
                    <KpiCard title="Offers" value={initialApps.filter(a => a.status === 'OFFER').length} icon={<CheckCircle2 size={80}/>} color="text-emerald-400" bgColor="bg-zinc-900"/>
                </div>
                <div className="flex flex-col lg:flex-row gap-6 h-[500px]">
                   <div className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl p-6 flex flex-col shadow-xl">
                      <div className="flex justify-between items-center mb-6">
                         <h3 className="text-zinc-200 font-bold">Activity</h3>
                         <div className="text-[10px] text-zinc-400 bg-black/40 border border-zinc-800 px-3 py-1 rounded-full">Last 6 Months</div>
                      </div>
                      <div className="flex-1 min-h-0">
                         <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData}>
                               <XAxis dataKey="name" stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} />
                               <Tooltip cursor={{fill: 'rgba(255,255,255,0.02)'}} contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '12px' }} itemStyle={{ color: '#fff' }}/>
                               <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                                  {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill="url(#colorGradient)" />)}
                               </Bar>
                               <defs><linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#6366f1" stopOpacity={0.8}/><stop offset="100%" stopColor="#a855f7" stopOpacity={0.2}/></linearGradient></defs>
                            </BarChart>
                         </ResponsiveContainer>
                      </div>
                   </div>
                   <div className="lg:w-1/3 bg-zinc-900 border border-zinc-800 rounded-xl p-6 flex flex-col shadow-xl overflow-hidden">
                      <div className="flex justify-between items-center mb-4 shrink-0">
                         <h3 className="text-zinc-200 font-bold">Recent</h3>
                         <button onClick={() => setActiveView('applications')} className="text-xs text-indigo-400 hover:text-indigo-300">View All</button>
                      </div>
                      <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                         {recentApps.map((app, i) => (
                            <div key={app._id} onClick={() => openDetails(app)} className="group flex items-center justify-between p-3 rounded-lg bg-black/20 border border-zinc-800/50 hover:bg-zinc-800/50 hover:border-zinc-700 transition-all cursor-pointer">
                               <div className="min-w-0">
                                  <div className="text-sm font-bold text-zinc-200 truncate group-hover:text-white">{app.company}</div>
                                  <div className="text-[11px] text-zinc-500 truncate">{app.role}</div>
                               </div>
                               <StatusBadge status={app.status} />
                            </div>
                         ))}
                      </div>
                   </div>
                </div>
              </motion.div>
            )}

            {/* VIEW: ALL APPS & KANBAN (Merged Logic for Brevity - Keeping your previous layout) */}
            {activeView === 'applications' && (
               <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-zinc-900/40 rounded-2xl border border-zinc-800 overflow-hidden min-h-[600px]">
                  <div className="p-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/50">
                     <h2 className="font-bold text-lg text-white">All Applications</h2>
                     <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Filter..." className="bg-black/30 border border-zinc-700 rounded-lg px-3 py-1 text-sm text-white focus:outline-none" />
                  </div>
                  <table className="w-full text-left text-sm">
                    <thead className="bg-zinc-900/80 border-b border-zinc-800 text-zinc-500 uppercase text-[10px] tracking-wider font-semibold">
                      <tr><th className="p-5 pl-8">Company</th><th className="p-5">Role</th><th className="p-5">Status</th><th className="p-5 text-right pr-8">Date</th></tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/50">
                      {filteredApps.map((app) => (
                        <tr key={app._id} onClick={() => openDetails(app)} className="group hover:bg-zinc-800/40 transition-colors cursor-pointer">
                          <td className="p-5 pl-8 font-medium text-zinc-200 group-hover:text-white">{app.company}</td>
                          <td className="p-5 text-zinc-400">{app.role}</td>
                          <td className="p-5"><StatusBadge status={app.status} /></td>
                          <td className="p-5 text-right pr-8 text-zinc-500 font-mono text-xs">{new Date(app.emailDate).toLocaleDateString('en-US')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
               </motion.div>
            )}

            {activeView === 'board' && (
               <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full overflow-x-auto">
                  <DndContext onDragEnd={handleDragEnd}>
                     <div className="flex gap-4 h-full min-w-[1000px]">
                        {["APPLIED", "INTERVIEW", "OFFER", "REJECTED"].map(status => (
                           <KanbanColumn key={status} id={status} title={status} apps={initialApps.filter(a => a.status === status)} openDetails={openDetails} />
                        ))}
                     </div>
                  </DndContext>
               </motion.div>
            )}
         </main>
      </div>

      {/* === RESUME ANALYZER MODAL (Global) === */}
      {/* (Kept your existing modal code here, just ensuring it triggers correctly) */}
      <AnimatePresence>
        {showResumeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowResumeModal(false)}/>
             <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative bg-zinc-900 border border-zinc-800 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[85vh]">
                <div className="bg-zinc-900 border-b border-zinc-800 p-6 flex justify-between items-center">
                  <h2 className="text-xl font-bold flex items-center gap-2 text-white"><FileText className="text-indigo-400" /> Resume Coach</h2>
                  <button onClick={() => setShowResumeModal(false)}><X className="text-zinc-400 hover:text-white" size={20}/></button>
                </div>
                <div className="p-6 overflow-y-auto flex-1">
                  {!resumeData ? (
                    <div className="space-y-6">
                       <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed border-zinc-700 rounded-xl p-10 flex flex-col items-center justify-center cursor-pointer hover:bg-zinc-800/50 hover:border-indigo-500/50 transition-all group">
                         <div className="p-4 bg-zinc-800 rounded-full mb-4 group-hover:bg-indigo-500/10 group-hover:text-indigo-400 transition-colors">
                            {selectedFile ? <FileIcon size={32} /> : <UploadCloud size={32} />}
                         </div>
                         <p className="text-zinc-300 font-medium">{selectedFile ? selectedFile.name : "Click to upload your PDF Resume"}</p>
                         <input type="file" ref={fileInputRef} onChange={handleFileSelect} accept=".pdf" className="hidden" />
                       </div>
                       <Button onClick={handleResumeAnalyze} disabled={isResumeAnalyzing || !selectedFile} className="w-full bg-indigo-600 hover:bg-indigo-500 h-12">
                         {isResumeAnalyzing ? <span className="flex items-center gap-2"><Loader2 className="animate-spin" /> Analyzing...</span> : "Analyze Resume"}
                       </Button>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between bg-black/30 p-4 rounded-xl border border-zinc-800">
                        <div>
                          <p className="text-xs text-zinc-500 uppercase font-bold">ATS Score</p>
                          <p className={`text-4xl font-bold ${resumeData.score >= 80 ? 'text-green-400' : resumeData.score >= 60 ? 'text-amber-400' : 'text-red-400'}`}>{resumeData.score}/100</p>
                        </div>
                        <div className="text-right max-w-xs"><p className="text-sm text-zinc-300 italic">"{resumeData.headline}"</p></div>
                      </div>
                      <Button onClick={() => { setResumeData(null); setSelectedFile(null); }} variant="outline" className="w-full border-zinc-700 text-zinc-400 hover:bg-zinc-800">Analyze Another</Button>
                    </div>
                  )}
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* === CHAT MODAL (Interview & Salary) === */}
      <AnimatePresence>
        {showInterviewModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowInterviewModal(false)}/>
             <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative bg-zinc-900 border border-zinc-800 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden z-10 flex flex-col h-[600px]">
                <div className="bg-zinc-900 border-b border-zinc-800 p-4 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                     <div className={`p-2 rounded-lg ${interviewType === 'salary' ? 'bg-emerald-600/20 text-emerald-400' : 'bg-indigo-600/20 text-indigo-400'}`}>
                        {interviewType === 'salary' ? <DollarSign size={20}/> : <Mic size={20}/>}
                     </div>
                     <div>
                        <h2 className="font-bold text-white">{interviewType === 'salary' ? 'Salary Negotiation Coach' : 'Mock Interview'}</h2>
                        <p className="text-xs text-zinc-400">{selectedApp?.company} • {selectedApp?.role}</p>
                     </div>
                  </div>
                  <button onClick={() => setShowInterviewModal(false)}><X className="text-zinc-400 hover:text-white" size={20}/></button>
                </div>
                <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar" ref={chatScrollRef}>
                   {interviewMessages.map((msg, i) => (
                      <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                         <div className={`max-w-[80%] p-4 rounded-xl text-sm leading-relaxed ${msg.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-zinc-800 text-zinc-200 border border-zinc-700'}`}>
                            {msg.role !== 'user' && <div className="flex items-center gap-2 mb-2 text-xs font-bold uppercase opacity-50"><BrainCircuit size={12}/> AI</div>}
                            {msg.content}
                         </div>
                      </div>
                   ))}
                   {isChatLoading && (
                      <div className="flex justify-start"><div className="bg-zinc-800 border border-zinc-700 p-4 rounded-xl flex gap-1"><div className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce"/><div className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce delay-75"/><div className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce delay-150"/></div></div>
                   )}
                </div>
                <div className="p-4 border-t border-zinc-800 bg-zinc-900/50">
                   <div className="flex gap-2">
                      <input value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && sendChatMessage()} placeholder="Type your answer..." className="flex-1 bg-black/40 border border-zinc-700 rounded-full px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500"/>
                      <button onClick={sendChatMessage} className="p-3 bg-indigo-600 rounded-full text-white hover:bg-indigo-500 transition-colors"><Send size={18} /></button>
                   </div>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* === DETAIL SLIDEOVER === */}
      <AnimatePresence>
        {selectedApp && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedApp(null)} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"/>
            <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 300 }} className="fixed right-0 top-0 bottom-0 w-full max-w-lg bg-zinc-950 border-l border-zinc-800 z-50 p-8 shadow-2xl flex flex-col">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <motion.h2 layoutId={`title-${selectedApp._id}`} className="text-2xl font-bold text-white mb-1">{selectedApp.company}</motion.h2>
                  <p className="text-zinc-400 text-sm font-medium">{selectedApp.role}</p>
                </div>
                <div className="flex gap-2">
                   {/* Salary Coach Button (Only for OFFER) */}
                   {selectedApp.status === 'OFFER' && (
                      <button onClick={() => startChat('salary')} className="p-2 bg-emerald-600 hover:bg-emerald-500 rounded-full transition-colors text-white shadow-lg group relative">
                         <DollarSign size={18} />
                         <span className="absolute -bottom-8 right-0 bg-black px-2 py-1 text-[10px] text-white rounded opacity-0 group-hover:opacity-100 whitespace-nowrap">Negotiate</span>
                      </button>
                   )}
                   {/* Mock Interview Button */}
                   <button onClick={() => startChat('interview')} className="p-2 bg-indigo-600 hover:bg-indigo-500 rounded-full transition-colors text-white shadow-lg group relative">
                      <Mic size={18} />
                      <span className="absolute -bottom-8 right-0 bg-black px-2 py-1 text-[10px] text-white rounded opacity-0 group-hover:opacity-100 whitespace-nowrap">Practice</span>
                   </button>
                   <button onClick={() => setSelectedApp(null)} className="p-2 hover:bg-zinc-800 rounded-full transition-colors"><X className="w-5 h-5 text-zinc-400" /></button>
                </div>
              </div>

              {/* Status Switcher */}
              <div className="mb-8 p-1 bg-zinc-900 rounded-lg flex overflow-hidden">
                 {["APPLIED", "INTERVIEW", "OFFER", "REJECTED"].map(status => (
                    <button key={status} onClick={async () => { await updateStatus(selectedApp._id, status); setSelectedApp({ ...selectedApp, status }); }} className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-wider transition-all ${selectedApp.status === status ? "bg-zinc-800 text-white shadow-sm" : "text-zinc-600 hover:text-zinc-400"}`}>
                      {status}
                    </button>
                  ))}
              </div>

              {/* NEW: Attached Resume Section (Feature #4) */}
              <div className="mb-6 p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl flex justify-between items-center">
                 <div className="flex items-center gap-3">
                    <div className="p-2 bg-zinc-800 rounded-lg text-zinc-400"><Paperclip size={16}/></div>
                    <div>
                       <p className="text-xs font-bold text-zinc-300 uppercase">Attached Resume</p>
                       <p className="text-xs text-zinc-500 truncate max-w-[150px]">
                          {attachedResumes[selectedApp._id] || "No specific resume attached"}
                       </p>
                    </div>
                 </div>
                 <label className="text-xs bg-zinc-800 hover:bg-zinc-700 text-white px-3 py-1.5 rounded cursor-pointer transition-colors">
                    Upload
                    <input type="file" accept=".pdf" className="hidden" onChange={handleAttachResume} />
                 </label>
              </div>

              {/* TABS */}
              <div className="flex border-b border-zinc-800 mb-6">
                 <button onClick={() => setActiveTab('insight')} className={`pb-3 px-4 text-sm font-medium transition-colors border-b-2 ${activeTab === 'insight' ? 'border-indigo-500 text-white' : 'border-transparent text-zinc-500 hover:text-zinc-300'}`}>AI Insight</button>
                 <button onClick={() => setActiveTab('draft')} className={`pb-3 px-4 text-sm font-medium transition-colors border-b-2 ${activeTab === 'draft' ? 'border-indigo-500 text-white' : 'border-transparent text-zinc-500 hover:text-zinc-300'}`}>Draft Reply</button>
              </div>

              <div className="space-y-6 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                {activeTab === 'insight' && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-300">
                     <div className="flex items-center justify-between">
                        <label className="text-xs text-zinc-500 uppercase font-bold tracking-wider flex items-center gap-2"><BrainCircuit className="w-3 h-3 text-indigo-400"/> Analysis</label>
                        {!aiData && <button onClick={handleAnalyze} disabled={isAnalyzing} className="text-xs text-indigo-400 hover:text-indigo-300 font-bold">{isAnalyzing ? "Analyzing..." : "Run Analysis"}</button>}
                     </div>
                     {isAnalyzing && <div className="p-8 border border-zinc-800 rounded-xl bg-zinc-900/50 flex flex-col items-center justify-center text-zinc-500 gap-2"><Loader2 className="w-6 h-6 animate-spin text-indigo-500" /><span className="text-xs">Reading email context...</span></div>}
                     {aiData && (
                        <div className="p-5 bg-indigo-500/10 border border-indigo-500/20 rounded-xl space-y-4">
                           <div className="flex items-end justify-between">
                              <div><p className="text-xs text-indigo-300 mb-1">Success Probability</p><p className="text-3xl font-bold text-white">{aiData.probability}%</p></div>
                              <span className="px-2 py-1 rounded bg-indigo-500/20 text-indigo-300 text-xs font-bold border border-indigo-500/30">{aiData.tone}</span>
                           </div>
                           <p className="text-sm text-zinc-300 leading-relaxed border-t border-indigo-500/20 pt-4">{aiData.summary}</p>
                           <div className="flex gap-3 bg-black/20 p-3 rounded-lg"><CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" /><p className="text-xs text-zinc-400">{aiData.tips}</p></div>
                        </div>
                     )}
                     <div>
                        <label className="text-xs text-zinc-500 uppercase font-bold tracking-wider mb-2 block">Private Notes</label>
                        <div className="relative">
                          <textarea value={noteInput} onChange={(e) => setNoteInput(e.target.value)} placeholder="Interview dates, contact names..." className="w-full h-32 bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-sm text-zinc-200 focus:outline-none focus:border-indigo-500/50 resize-none"/>
                          <button onClick={handleSaveNote} className="absolute bottom-3 right-3 p-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 shadow-lg"><Save className="w-3 h-3" /></button>
                        </div>
                     </div>
                  </div>
                )}
                {/* Draft Tab Logic (Same as before) */}
                {activeTab === 'draft' && (
                   <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                      {!draftData ? (
                         <div className="text-center py-10">
                            <PenTool className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
                            <p className="text-zinc-500 text-sm mb-4">Generate a professional follow-up email based on the current context.</p>
                            <Button onClick={handleDraft} disabled={isDrafting} className="bg-white text-black hover:bg-zinc-200">{isDrafting ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : <Sparkles className="w-4 h-4 mr-2" />}{isDrafting ? "Writing..." : "Draft Email"}</Button>
                         </div>
                      ) : (
                         <div className="space-y-4">
                            <div className="space-y-2"><label className="text-xs text-zinc-500 font-bold uppercase">Subject</label><input readOnly value={draftData.subject} className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-sm text-white" /></div>
                            <div className="space-y-2">
                               <div className="flex justify-between items-center"><label className="text-xs text-zinc-500 font-bold uppercase">Body</label><button onClick={copyDraft} className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300">{copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}{copied ? "Copied" : "Copy"}</button></div>
                               <textarea readOnly value={draftData.body} className="w-full h-64 bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-sm text-zinc-300 leading-relaxed resize-none focus:outline-none" />
                            </div>
                            <Button className="w-full bg-indigo-600 hover:bg-indigo-500" onClick={() => window.open(`mailto:?subject=${encodeURIComponent(draftData.subject)}&body=${encodeURIComponent(draftData.body)}`)}><Mail className="w-4 h-4 mr-2" /> Open in Mail App</Button>
                            <button onClick={() => setDraftData(null)} className="w-full text-xs text-zinc-500 hover:text-white mt-2">Discard & Try Again</button>
                         </div>
                      )}
                   </div>
                )}
              </div>

              <div className="mt-6 pt-6 border-t border-zinc-800 flex justify-between items-center">
                <Link href={`https://mail.google.com/mail/u/0/#inbox/${selectedApp.threadId}`} target="_blank" className="flex items-center gap-2 text-sm font-medium text-zinc-400 hover:text-white transition-colors"><ExternalLink className="w-4 h-4" /> Open Gmail</Link>
                <button onClick={async () => { if(confirm("Permanently delete?")) { await deleteApplication(selectedApp._id); setSelectedApp(null); window.location.reload(); }}} className="flex items-center gap-2 text-sm font-medium text-zinc-500 hover:text-red-400 transition-colors"><Trash2 className="w-4 h-4" /> Delete</button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// --- SUB COMPONENTS ---

function KanbanColumn({ id, title, apps, openDetails }: any) {
  const { setNodeRef } = useDroppable({ id });
  return (
    <div ref={setNodeRef} className="w-80 flex-shrink-0 flex flex-col gap-4">
       <div className="flex items-center justify-between px-2">
          <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">{title}</h3>
          <span className="bg-zinc-800 text-zinc-500 text-[10px] px-2 py-0.5 rounded-full">{apps.length}</span>
       </div>
       <div className="flex-1 bg-zinc-900/30 border border-zinc-800/50 rounded-xl p-2 flex flex-col gap-2 min-h-[200px]">
          {apps.map((app: any) => (
             <KanbanCard key={app._id} app={app} openDetails={openDetails} />
          ))}
       </div>
    </div>
  )
}

function KanbanCard({ app, openDetails }: any) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: app._id });
  const style = transform ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` } : undefined;

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes} onClick={() => openDetails(app)} className={`p-3 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-indigo-500/50 cursor-grab active:cursor-grabbing shadow-sm group relative ${isDragging ? 'z-50 opacity-80' : ''}`}>
       <div className="flex justify-between items-start mb-2">
          <div className="font-bold text-sm text-zinc-200">{app.company}</div>
       </div>
       <div className="text-xs text-zinc-500 truncate mb-2">{app.role}</div>
       <div className="text-[10px] text-zinc-600 text-right">{new Date(app.emailDate).toLocaleDateString()}</div>
    </div>
  )
}

function KpiCard({ title, value, color, icon, bgColor }: any) {
  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className={`p-5 rounded-xl border border-zinc-800 ${bgColor} relative overflow-hidden group hover:border-zinc-700 transition-all`}>
      <div className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-1">{title}</div>
      <div className={`text-3xl font-bold ${color} relative z-10`}>{value}</div>
      <div className={`absolute right-[-10px] bottom-[-10px] opacity-5 group-hover:opacity-10 transition-opacity ${color}`}>{icon}</div>
    </motion.div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    REJECTED: "text-red-400 bg-red-500/10 border-red-500/20",
    INTERVIEW: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20",
    OFFER: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    APPLIED: "text-zinc-400 bg-zinc-800 border-zinc-700",
  };
  return <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${styles[status] || styles.APPLIED}`}>{status}</span>;
}