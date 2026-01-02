"use client";

import { useState } from "react";
import Link from "next/link";
import { deleteApplication, updateStatus, saveNote } from "@/app/actions";
import { useRouter } from "next/navigation";
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Loader2, Trash2, ExternalLink, X, Save, Search, Sparkles, Filter } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Dashboard({ initialApps }: { initialApps: any[] }) {
  const [filter, setFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [isSyncing, setIsSyncing] = useState(false);
  const [selectedApp, setSelectedApp] = useState<any>(null);
  const [noteInput, setNoteInput] = useState("");
  const router = useRouter();

  // --- Logic ---
  const filteredApps = initialApps.filter((app) => {
    const matchesSearch = app.company.toLowerCase().includes(search.toLowerCase()) || 
                          app.role.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === "ALL" ? true : app.status === filter;
    return matchesSearch && matchesFilter;
  });

  const chartData = initialApps.reduce((acc: any[], app) => {
    const month = new Date(app.emailDate).toLocaleString('default', { month: 'short' });
    const existing = acc.find(item => item.name === month);
    if (existing) existing.count++;
    else acc.push({ name: month, count: 1 });
    return acc;
  }, []).reverse();

  const handleSync = () => {
    setIsSyncing(true);
    router.push("/api/sync"); 
  };

  const openDetails = (app: any) => {
    setSelectedApp(app);
    setNoteInput(app.notes || "");
  };

  const handleSaveNote = async () => {
    if(!selectedApp) return;
    await saveNote(selectedApp._id, noteInput);
    setSelectedApp({ ...selectedApp, notes: noteInput });
  };

  // --- Animation Variants ---
  const containerVars = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };
  
  const itemVars = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen relative font-sans selection:bg-purple-500/30">
      <div className="glow-bg" />

      <main className="max-w-7xl mx-auto p-6 md:p-10 space-y-8">
        
        {/* HEADER */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6"
        >
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-5 h-5 text-purple-400" />
              <span className="text-xs font-bold tracking-[0.2em] text-purple-400 uppercase">Personal Workspace</span>
            </div>
            <h1 className="text-5xl font-extrabold tracking-tight text-white">
              Job <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">Tracker</span>
            </h1>
          </div>
          
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSync}
            disabled={isSyncing}
            className={`glass px-6 py-3 rounded-xl text-sm font-bold tracking-wide flex items-center gap-2 transition-all border-white/10
              ${isSyncing ? "opacity-50 cursor-not-allowed" : "hover:border-purple-500/50 hover:shadow-[0_0_20px_rgba(139,92,246,0.3)]"}`}
          >
            {isSyncing ? <Loader2 className="animate-spin w-4 h-4" /> : "Sync Emails"}
          </motion.button>
        </motion.div>

        {/* ANALYTICS SECTION */}
        <motion.div 
          variants={containerVars}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        >
          {/* Chart */}
          <motion.div variants={itemVars} className="glass col-span-2 rounded-2xl p-6 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-cyan-500 opacity-50" />
            <h3 className="text-zinc-400 text-xs font-bold uppercase tracking-wider mb-6">Application Activity</h3>
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <XAxis dataKey="name" stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    cursor={{fill: 'rgba(255,255,255,0.05)'}}
                    contentStyle={{ backgroundColor: '#09090b', border: '1px solid #27272a', borderRadius: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill="url(#colorGradient)" />
                    ))}
                  </Bar>
                  <defs>
                    <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                      <stop offset="100%" stopColor="#06b6d4" stopOpacity={0.4}/>
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
             <KpiCard title="Interviews" value={initialApps.filter(a => a.status === 'INTERVIEW').length} color="text-cyan-400" border="group-hover:border-cyan-500/50" delay={0.1} />
             <KpiCard title="Rejected" value={initialApps.filter(a => a.status === 'REJECTED').length} color="text-pink-500" border="group-hover:border-pink-500/50" delay={0.2} />
             <KpiCard title="Waiting" value={initialApps.filter(a => a.status === 'APPLIED').length} color="text-zinc-400" border="group-hover:border-zinc-500/50" delay={0.3} />
             <KpiCard title="Offers" value={initialApps.filter(a => a.status === 'OFFER').length} color="text-green-400" border="group-hover:border-green-500/50" delay={0.4} />
          </div>
        </motion.div>

        {/* CONTROLS */}
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-zinc-900/40 p-2 rounded-2xl border border-white/5 backdrop-blur-sm"
        >
          <div className="flex gap-1 p-1">
            {["ALL", "INTERVIEW", "APPLIED", "REJECTED"].map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  filter === tab 
                    ? "bg-zinc-800 text-white shadow-lg shadow-black/50 scale-105" 
                    : "text-zinc-500 hover:text-zinc-300 hover:bg-white/5"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              placeholder="Search companies..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-black/50 border border-zinc-800 rounded-xl text-sm text-white focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all placeholder:text-zinc-600"
            />
          </div>
        </motion.div>

        {/* LIST */}
        <motion.div 
          layout
          className="glass rounded-2xl overflow-hidden min-h-[400px]"
        >
          <table className="w-full text-left text-sm">
            <thead className="bg-white/5 text-zinc-400 uppercase text-[10px] tracking-wider font-semibold">
              <tr>
                <th className="p-5 pl-8">Company</th>
                <th className="p-5">Role</th>
                <th className="p-5">Status</th>
                <th className="p-5 text-right pr-8">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              <AnimatePresence mode="popLayout">
                {filteredApps.map((app) => (
                  <motion.tr 
                    key={app._id}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    onClick={() => openDetails(app)}
                    className="group hover:bg-white/[0.03] transition-colors cursor-pointer"
                  >
                    <td className="p-5 pl-8 font-medium text-white group-hover:text-purple-300 transition-colors">{app.company}</td>
                    <td className="p-5 text-zinc-400">{app.role}</td>
                    <td className="p-5">
                      <StatusBadge status={app.status} />
                    </td>
                    <td className="p-5 text-right pr-8 text-zinc-600 font-mono text-xs group-hover:text-zinc-400">
                        {/* Handle string or date object safely */}
                        {new Date(app.emailDate).toLocaleDateString()}
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
          {filteredApps.length === 0 && (
            <div className="p-20 flex flex-col items-center justify-center text-zinc-600 gap-4">
              <Filter className="w-10 h-10 opacity-20" />
              <p>No applications found.</p>
            </div>
          )}
        </motion.div>
      </main>

      {/* DETAIL SIDEBAR (SLIDE OVER) */}
      <AnimatePresence>
        {selectedApp && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSelectedApp(null)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40"
            />
            <motion.div 
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-lg bg-[#0e0e11] border-l border-white/10 z-50 p-8 shadow-2xl flex flex-col"
            >
              <div className="flex justify-between items-start mb-8">
                <div>
                  <motion.h2 layoutId={`title-${selectedApp._id}`} className="text-3xl font-bold text-white mb-1">{selectedApp.company}</motion.h2>
                  <p className="text-purple-400 text-sm font-medium">{selectedApp.role}</p>
                </div>
                <button onClick={() => setSelectedApp(null)} className="p-2 bg-white/5 rounded-full hover:bg-white/10 transition-colors">
                  <X className="w-5 h-5 text-zinc-400" />
                </button>
              </div>

              <div className="space-y-8 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                
                {/* Status Switcher */}
                <div className="p-5 bg-white/5 rounded-2xl border border-white/5">
                  <label className="text-xs text-zinc-500 uppercase font-bold tracking-wider mb-4 block">Status</label>
                  <div className="flex flex-wrap gap-2">
                    {["APPLIED", "INTERVIEW", "OFFER", "REJECTED"].map(status => (
                      <button
                        key={status}
                        onClick={async () => {
                           await updateStatus(selectedApp._id, status);
                           setSelectedApp({ ...selectedApp, status });
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                          selectedApp.status === status 
                          ? "bg-purple-500 text-white border-purple-500 shadow-lg shadow-purple-900/50" 
                          : "border-zinc-700 text-zinc-500 hover:border-zinc-500"
                        }`}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="text-xs text-zinc-500 uppercase font-bold tracking-wider mb-3 block">Private Notes</label>
                  <div className="relative">
                    <textarea 
                      value={noteInput}
                      onChange={(e) => setNoteInput(e.target.value)}
                      placeholder="Add specific details, interview links, or follow-up reminders..."
                      className="w-full h-48 bg-black/30 border border-zinc-800 rounded-2xl p-4 text-sm text-zinc-200 focus:outline-none focus:border-purple-500/50 resize-none leading-relaxed"
                    />
                    <motion.button 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleSaveNote}
                      className="absolute bottom-4 right-4 p-2 bg-purple-600 text-white rounded-lg shadow-lg hover:bg-purple-500"
                    >
                      <Save className="w-4 h-4" />
                    </motion.button>
                  </div>
                </div>

                {/* Info Snippet */}
                <div className="p-4 rounded-xl bg-blue-900/10 border border-blue-900/20">
                  <p className="text-xs text-blue-200/70 italic leading-relaxed">"{selectedApp.snippet}"</p>
                </div>

              </div>

              {/* Footer Actions */}
              <div className="mt-6 pt-6 border-t border-white/10 flex justify-between items-center">
                <Link 
                  href={`https://mail.google.com/mail/u/0/#inbox/${selectedApp.threadId}`} 
                  target="_blank"
                  className="flex items-center gap-2 text-sm font-medium text-zinc-400 hover:text-white transition-colors"
                >
                  <ExternalLink className="w-4 h-4" /> Open in Gmail
                </Link>

                <button 
                  onClick={async () => {
                    if(confirm("Permanently delete?")) {
                      await deleteApplication(selectedApp._id);
                      setSelectedApp(null);
                      // Force refresh or update local state logic here if needed
                      window.location.reload(); 
                    }
                  }}
                  className="flex items-center gap-2 text-sm font-medium text-red-500/70 hover:text-red-400 px-4 py-2 hover:bg-red-950/30 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" /> Delete Entry
                </button>
              </div>

            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// --- SUB COMPONENTS ---

function KpiCard({ title, value, color, border, delay }: any) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay }}
      className={`glass group p-5 rounded-2xl border border-white/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl ${border}`}
    >
      <div className={`text-3xl font-black mb-1 ${color} drop-shadow-sm`}>{value}</div>
      <div className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">{title}</div>
    </motion.div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    REJECTED: "bg-red-500/10 text-red-400 border-red-500/20",
    INTERVIEW: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20 shadow-[0_0_10px_rgba(6,182,212,0.1)]",
    OFFER: "bg-green-500/10 text-green-400 border-green-500/20",
    APPLIED: "bg-zinc-800 text-zinc-400 border-zinc-700",
  };
  return (
    <span className={`px-3 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wide ${styles[status] || styles.APPLIED}`}>
      {status}
    </span>
  );
}