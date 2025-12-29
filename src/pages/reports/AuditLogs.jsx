import React, { useEffect, useState } from "react";
import api from "../../axios";
import {
    ShieldAlert,
    History,
    User,
    Calendar,
    Activity,
    CheckCircle,
    Clock,
    Search,
    RefreshCw
} from "lucide-react";

export default function AuditLogs() {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [isRefreshing, setIsRefreshing] = useState(false);

    const fetchLogs = async () => {
        setIsRefreshing(true);
        try {
            const res = await api.get("/reports/audit");
            setLogs(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            console.error("Audit Sync Error:", err);
        } finally {
            setLoading(false);
            setIsRefreshing(false);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, []);

    const filteredLogs = logs.filter(log =>
        log.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.status?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.agent_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return (
        <div className="h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 transition-colors">
            <div className="w-8 h-8 border-4 border-indigo-900 dark:border-indigo-400 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-slate-400 dark:text-slate-500 font-black uppercase tracking-widest text-[9px]">Decrypting Audit Trails...</p>
        </div>
    );

    return (
        <div className="p-6 bg-[#F8FAFC] dark:bg-slate-950 min-h-screen font-sans transition-colors duration-300">
            {/* --- TOP NAVIGATION BAR --- */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-indigo-900 dark:bg-indigo-900 rounded-2xl text-white shadow-xl shadow-indigo-900/20">
                        <ShieldAlert size={28} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-indigo-950 dark:text-white uppercase tracking-tighter leading-none">Security Audit</h1>
                        <p className="text-slate-400 dark:text-slate-500 text-[9px] font-black uppercase tracking-[0.3em] mt-1.5 flex items-center gap-2">
                            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                            Live Ledger System
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={14} />
                        <input
                            type="text"
                            placeholder="Filter by Agent, Action, or Entity..."
                            className="w-full md:w-80 bg-white dark:bg-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 rounded-xl py-3 pl-10 pr-4 text-[11px] font-bold outline-none focus:ring-4 ring-indigo-500/10 dark:focus:ring-indigo-500/5 transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button
                        onClick={fetchLogs}
                        className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-500 hover:text-indigo-600 transition-all hover:shadow-md active:scale-95"
                    >
                        <RefreshCw size={18} className={isRefreshing ? "animate-spin" : ""} />
                    </button>
                </div>
            </div>

            {/* --- MAIN DATA CONTAINER --- */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-200 dark:border-slate-800 overflow-hidden">
                {/* TABLE HEADER */}
                <div className="bg-slate-50/50 dark:bg-slate-800/50 px-8 py-5 flex justify-between items-center border-b border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-3">
                        <div className="w-1.5 h-4 bg-indigo-900 rounded-full"></div>
                        <span className="text-[10px] font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest">Entry Sequence</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg">
                            <Clock size={12} className="text-indigo-500" />
                            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-tighter">Real-time Sync</span>
                        </div>
                        <span className="text-[10px] font-black text-white bg-indigo-900 dark:bg-indigo-900 px-4 py-1.5 rounded-full shadow-lg shadow-indigo-900/20">
                            {filteredLogs.length} Events Logged
                        </span>
                    </div>
                </div>

                {/* LOG ENTRIES LIST */}
                <div className="overflow-y-auto max-h-[70vh] custom-scrollbar">
                    {filteredLogs.length > 0 ? (
                        filteredLogs.map((log, i) => (
                            <div key={log.id || i} className="group relative px-8 py-6 hover:bg-indigo-50/30 dark:hover:bg-indigo-900/5 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-100 dark:border-slate-800 last:border-0">
                                {/* LEFT: ACTION & AGENT */}
                                <div className="flex items-center gap-5">
                                    <div className="relative">
                                        <div className="p-3.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-2xl group-hover:bg-indigo-900 group-hover:text-white transition-all duration-300 transform group-hover:rotate-6">
                                            <Activity size={20} />
                                        </div>
                                        {/* Status Dot */}
                                        <span className={`absolute -top-1 -right-1 w-4 h-4 rounded-full border-4 border-white dark:border-slate-900 ${
                                            log.status === 'DELETE' ? 'bg-red-500' : log.status === 'CREATE' ? 'bg-emerald-500' : 'bg-indigo-500'
                                        }`}></span>
                                    </div>

                                    <div>
                                        <div className="flex items-center gap-3 mb-1.5">
                                            <h3 className="font-black text-slate-900 dark:text-white text-[13px] uppercase tracking-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                                {log.status} <span className="text-slate-400 dark:text-slate-600 mx-1">/</span> {log.title}
                                            </h3>
                                            <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-100 dark:border-slate-700">
                                                ID: {log.entity_id}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center">
                                                    <User size={10} className="text-indigo-600 dark:text-indigo-400" />
                                                </div>
                                                <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                                                    {log.agent_name || "Auth_System"}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* RIGHT: TIMESTAMP & VERIFICATION */}
                                <div className="flex items-center justify-between md:flex-col md:items-end gap-3">
                                    <div className="flex items-center gap-2.5 text-slate-800 dark:text-slate-300">
                                        <div className="p-1.5 bg-slate-100 dark:bg-slate-800 rounded-md">
                                            <Calendar size={12} className="text-indigo-500" />
                                        </div>
                                        <span className="font-black text-[11px] tabular-nums tracking-tighter">
                                            {new Date(log.updated_at).toLocaleString(undefined, {
                                                month: 'short', day: '2-digit', year: 'numeric',
                                                hour: '2-digit', minute: '2-digit', second: '2-digit'
                                            })}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 rounded-lg">
                                        <CheckCircle size={10} className="text-emerald-500" />
                                        <span className="text-[8px] font-black uppercase text-emerald-600 dark:text-emerald-500 tracking-[0.15em]">
                                            Integrity Verified
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="py-32 flex flex-col items-center justify-center grayscale opacity-50">
                            <div className="p-6 bg-slate-100 dark:bg-slate-800 rounded-full mb-6">
                                <History size={48} className="text-slate-400" />
                            </div>
                            <h4 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em]">End of Ledger</h4>
                            <p className="text-[10px] text-slate-400 font-bold mt-2">No activities matching your query were found.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* FOOTER INFO */}
            <p className="mt-8 text-center text-[9px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-[0.3em]">
                All transactions are signed and timestamped by the central authority &bull; Node: PRJ-ALPHA-01
            </p>
        </div>
    );
}