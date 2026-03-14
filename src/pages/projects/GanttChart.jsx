import React, { useEffect, useState } from "react";
import { Clock, AlertCircle, User, Calendar } from "lucide-react";
import { getProjects } from "../../services/projectService";
import { getUsers } from "../../services/userService";
import toast from "react-hot-toast";

const GanttChart = () => {
    const [projects, setProjects] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
    // Current System Time: December 25, 2025
    const today = new Date("2025-12-25");

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [p, u] = await Promise.all([getProjects(), getUsers()]);
                setProjects(Array.isArray(p) ? p : (p?.data || []));
                setUsers(Array.isArray(u) ? u : (u?.data || []));
            } catch (e) {
                toast.error("Timeline synchronization failed");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const getTodayPosition = () => {
        const monthProgress = today.getMonth();
        const dayProgress = today.getDate() / 31;
        return ((monthProgress + dayProgress) / 12) * 100;
    };

    const getBarStyles = (start, end) => {
        if (!start || !end) return { display: "none" };
        const s = new Date(start);
        const e = new Date(end);
        const startMonth = s.getMonth();
        // Calculate span across months
        const duration = Math.max(1, (e.getMonth() - startMonth) + 1);

        return {
            gridColumnStart: startMonth + 1,
            gridColumnEnd: `span ${duration}`
        };
    };

    if (loading) return (
        <div className="h-screen flex items-center justify-center bg-slate-50">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
    );

    return (
        <div className="p-8 bg-slate-50 min-h-screen font-sans text-slate-900">
            <div className="max-w-7xl mx-auto">
                <header className="mb-10">
                    <h1 className="text-4xl font-black uppercase tracking-tighter text-slate-900">Enterprise Roadmap</h1>
                    <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-[0.4em]">Global Project Timelines • 2025</p>
                </header>

                <div className="bg-white rounded-[3.5rem] shadow-2xl shadow-slate-200/60 border border-slate-100 overflow-hidden relative">

                    {/* TIMELINE HEADERS */}
                    <div className="grid grid-cols-12 bg-slate-50/50 border-b border-slate-100 backdrop-blur-md">
                        {months.map(m => (
                            <div key={m} className="py-6 text-center text-[10px] font-black text-slate-400 tracking-widest border-r border-slate-100/50 last:border-0">
                                {m}
                            </div>
                        ))}
                    </div>

                    {/* CHART CONTENT AREA */}
                    <div className="relative p-10 space-y-14 min-h-[600px]">

                        {/* VERTICAL GRID OVERLAY */}
                        <div className="absolute inset-0 grid grid-cols-12 pointer-events-none px-10">
                            {[...Array(12)].map((_, i) => (
                                <div key={i} className="border-r border-slate-100/80 h-full last:border-0" />
                            ))}
                        </div>

                        {/* RED "TODAY" INDICATOR LINE */}
                        <div
                            className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-30 shadow-[0_0_15px_rgba(239,68,68,0.6)]"
                            style={{ left: `calc(${getTodayPosition()}% + 2.5rem)` }}
                        >
                            <div className="bg-red-500 text-white text-[8px] font-black px-2 py-0.5 rounded-full absolute -top-3 -left-5 uppercase shadow-md">
                                Today
                            </div>
                        </div>

                        {projects.map((proj) => {
                            const owner = users.find(u => u.id === proj.owner_id);
                            const isOverdue = new Date(proj.end_date) < today && proj.status !== 'completed';

                            // For UI simulation matching your red circle marks:
                            // Using 45% as a base progress for 'active' projects
                            const progress = proj.status === 'completed' ? 100 : 'completed';

                            return (
                                <div key={proj.id} className="relative z-10 group">
                                    {/* Project Metadata Row */}
                                    <div className="flex justify-between items-end mb-4 px-2">
                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-center gap-2">
                                                <h3 className="text-[12px] font-black uppercase text-slate-800 tracking-tight leading-none">
                                                    {proj.title}
                                                </h3>
                                                {isOverdue && (
                                                    <div className="flex items-center gap-1 bg-red-50 px-2 py-0.5 rounded-md border border-red-100 animate-pulse">
                                                        <AlertCircle size={10} className="text-red-500" />
                                                        <span className="text-[8px] font-black text-red-600 uppercase">Overdue</span>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2 text-[9px] font-bold text-slate-400">
                                                <Calendar size={10} />
                                                <span>{new Date(proj.start_date).toLocaleDateString()} — {new Date(proj.end_date).toLocaleDateString()}</span>
                                            </div>
                                        </div>

                                        {/* Project Lead Badge */}
                                        <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-2xl border border-slate-100">
                                            <div className="w-5 h-5 rounded-full bg-indigo-900 flex items-center justify-center text-[9px] text-white font-black">
                                                {owner ? owner.name.charAt(0) : "U"}
                                            </div>
                                            <span className="text-[9px] font-black text-slate-600 uppercase tracking-tighter">
                                                {owner ? owner.name : "System Manager"}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Timeline Bar Container */}
                                    <div className="grid grid-cols-12 h-12 w-full relative bg-slate-50/20 rounded-2xl border border-dashed border-slate-200">
                                        <div
                                            style={getBarStyles(proj.start_date, proj.end_date)}
                                            className={`h-full rounded-2xl shadow-xl transition-all duration-500 flex items-center relative overflow-hidden group-hover:scale-[1.01] ${
                                                proj.status === 'completed'
                                                    ? 'bg-emerald-500 shadow-emerald-200/50'
                                                    : 'bg-indigo-900 shadow-indigo-300/50'
                                            }`}
                                        >
                                            {/* Dynamic Progress Fill (Matches your red circles #2 & #3) */}
                                            <div
                                                className="absolute inset-y-0 left-0 bg-white/20 backdrop-blur-[2px] transition-all duration-1000"
                                                style={{ width: `${progress}%` }}
                                            />

                                            <div className="flex justify-between w-full items-center px-5 z-10">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                                                    <span className="text-[9px] text-white font-black uppercase tracking-[0.2em]">
                                                        {proj.status}
                                                    </span>
                                                </div>
                                                <span className="text-[10px] text-white/80 font-mono font-black bg-black/10 px-2 py-0.5 rounded-md">
                                                    {progress}%
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GanttChart;