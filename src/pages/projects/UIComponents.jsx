import React from "react";
import { Search, ChevronDown, Calendar, Database, Activity } from "lucide-react";

/**
 * --- SUMMARY KPI CARD ---
 * High-contrast layout for architecture metrics.
 */
export const SummaryCard = ({ title, value, icon, color = "indigo" }) => (
    <div className="bg-white p-6 rounded-[2rem] border border-slate-200 flex items-center justify-between shadow-sm transition-all hover:shadow-md">
        <div>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">{title}</p>
            <p className="text-3xl font-black text-indigo-900 tracking-tighter leading-none">{value}</p>
        </div>
        <div className={`p-4 rounded-2xl ${color === 'indigo' ? 'bg-indigo-900 text-white' : `bg-${color}-50 text-${color}-600`} shadow-lg shadow-indigo-900/10`}>
            {icon}
        </div>
    </div>
);

/**
 * --- ENGINE PROGRESS BAR ---
 * Uses the primary Indigo-900 and Slate-100 base.
 */
export const ProgressBar = ({ progress, color = "indigo", height = "h-2" }) => {
    // Mapping to indigo-900 for consistent branding
    const barColor = color === "indigo" ? "bg-indigo-900" : `bg-${color}-500`;

    return (
        <div className={`w-full bg-slate-100 rounded-full ${height} overflow-hidden shadow-inner`}>
            <div
                className={`h-full transition-all duration-1000 ease-out ${barColor}`}
                style={{ width: `${Math.min(Math.max(progress, 0), 100)}%` }}
            />
        </div>
    );
};

/**
 * --- STATUS BADGE ---
 * Technical mapping for project node states.
 */
export const StatusBadge = ({ status }) => {
    const s = status?.toLowerCase();
    const styles = {
        completed: "bg-emerald-50 text-emerald-600 border-emerald-100",
        pending: "bg-indigo-50 text-indigo-900 border-indigo-100",
        overdue: "bg-rose-50 text-rose-600 border-rose-100"
    };

    const label = s === 'pending' ? 'Operational' : status;

    return (
        <span className={`px-2.5 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest border ${styles[s] || styles.pending}`}>
            {label}
        </span>
    );
};

/**
 * --- PROJECT SELECTOR ---
 * Refined dropdown with indigo focus and blueprint-style typography.
 */
export const ProjectSelector = ({
                                    projects,
                                    selectedProjectId,
                                    setSelectedProjectId,
                                    isSearchOpen,
                                    setIsSearchOpen,
                                    searchTerm,
                                    setSearchTerm,
                                    searchRef
                                }) => {
    const selectedProject = projects.find(p => String(p.id) === String(selectedProjectId));

    return (
        <div className="relative w-80 no-print" ref={searchRef}>
            <button
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="w-full bg-white border border-slate-200 rounded-2xl px-6 py-4 text-sm font-bold text-slate-900 flex items-center justify-between shadow-sm hover:border-indigo-900 transition-all active:scale-[0.98]"
            >
                <div className="text-left truncate">
                    <div className="flex items-center gap-2 mb-0.5">
                        <Database size={12} className="text-indigo-900" />
                        <p className="truncate w-48 font-black text-indigo-900 uppercase tracking-tight text-[11px]">
                            {selectedProject?.title || selectedProject?.name || "Load Project..."}
                        </p>
                    </div>
                    {selectedProject && (
                        <div className="flex items-center gap-2 text-[8px] text-slate-400 font-black uppercase tracking-widest">
                            <Calendar size={10} className="text-slate-300"/>
                            {selectedProject.start_date} <span className="text-slate-200">/</span> {selectedProject.end_date}
                        </div>
                    )}
                </div>
                <ChevronDown size={18} className={`text-indigo-900/30 transition-transform duration-300 ${isSearchOpen ? 'rotate-180 text-indigo-900' : ''}`} />
            </button>

            {isSearchOpen && (
                <div className="absolute top-full left-0 mt-3 w-full bg-white border border-slate-200 rounded-[1.5rem] shadow-2xl z-[300] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="p-4 bg-slate-50 border-b border-slate-100">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                            <input
                                className="w-full pl-10 pr-4 py-3 text-[10px] font-black uppercase tracking-widest bg-white rounded-xl border border-slate-200 outline-none focus:border-indigo-900 transition-all shadow-inner"
                                placeholder="Filter projects..."
                                autoFocus
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="max-h-72 overflow-y-auto p-2 custom-scrollbar">
                        {projects.length === 0 ? (
                            <div className="p-8 text-center text-[9px] font-black text-slate-400 uppercase tracking-widest italic">
                                No databases found.
                            </div>
                        ) : (
                            projects
                                .filter(p => (p.title || p.name || "").toLowerCase().includes(searchTerm.toLowerCase()))
                                .map(p => (
                                    <button
                                        key={p.id}
                                        onClick={() => {
                                            setSelectedProjectId(p.id);
                                            setIsSearchOpen(false);
                                            setSearchTerm("");
                                        }}
                                        className="w-full text-left px-4 py-3 rounded-xl hover:bg-indigo-50 group flex items-start gap-3 transition-colors"
                                    >
                                        <div className="mt-1 p-1.5 bg-slate-100 rounded-md group-hover:bg-indigo-900 group-hover:text-white transition-colors">
                                            <Activity size={10} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-700 group-hover:text-indigo-900 uppercase tracking-tight">{p.title || p.name}</p>
                                            <p className="text-[8px] text-slate-400 font-black uppercase tracking-widest mt-0.5">
                                                Code: {p.id.toString().substring(0, 8)}
                                            </p>
                                        </div>
                                    </button>
                                ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};