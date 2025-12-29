import React, { useEffect, useState, useMemo } from "react";
import { getPerformanceReport } from "../../services/reportService";
import {
    BarChart3,
    TrendingUp,
    Layers,
    CheckCircle2,
    Clock,
    ShieldCheck
} from "lucide-react";

export default function ProjectPerformance() {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getPerformanceReport()
            .then(data => setReports(Array.isArray(data) ? data : []))
            .catch(err => console.error("Could not sync reports:", err))
            .finally(() => setLoading(false));
    }, []);

    const stats = useMemo(() => {
        if (!reports.length) return { avgReadiness: 0, total: 0, completed: 0, pending: 0 };

        const total = reports.length;
        const sumReadiness = reports.reduce((acc, curr) => acc + Number(curr.average_readiness || 0), 0);
        const completedCount = reports.filter(r => r.status === 'completed').length;

        return {
            avgReadiness: (sumReadiness / total).toFixed(1),
            total,
            completed: completedCount,
            pending: total - completedCount
        };
    }, [reports]);

    if (loading) return (
        <div className="h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 transition-colors">
            <div className="w-10 h-10 border-4 border-indigo-900 dark:border-indigo-400 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-slate-400 dark:text-slate-500 font-black uppercase tracking-widest text-[9px]">Gathering performance data...</p>
        </div>
    );

    return (
        <div className="p-4 bg-[#F8FAFC] dark:bg-slate-950 min-h-screen font-sans transition-colors duration-300">
            {/* --- HEADER --- */}
            <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="p-3 bg-indigo-900 dark:bg-indigo-900 rounded-xl text-white shadow-lg">
                        <BarChart3 size={24} />
                    </div>
                    <div>
                        <h1 className="text-xl font-black text-indigo-900 dark:text-white uppercase tracking-tight leading-none">Performance Overview</h1>
                        <p className="text-slate-400 dark:text-slate-500 text-[8px] font-black uppercase tracking-[0.2em] mt-1">Project Progress Tracker</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm w-full md:w-auto justify-center">
                    <ShieldCheck size={14} className="text-indigo-900 dark:text-indigo-400" />
                    <span className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Data Verified</span>
                </div>
            </div>

            {/* --- SUMMARY STATS --- */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5 mb-10">
                <StatCard icon={<Layers />} label="All Projects" value={stats.total} />
                <StatCard icon={<TrendingUp />} label="Avg. Completion" value={`${stats.avgReadiness}%`} />
                <StatCard icon={<CheckCircle2 />} label="Completed" value={stats.completed} />
                <StatCard icon={<Clock />} label="In Progress" value={stats.pending} />
            </div>

            {/* --- PERFORMANCE MATRIX TABLE --- */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden transition-colors">
                <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                    <h3 className="font-black text-indigo-900 dark:text-white uppercase text-[9px] tracking-widest text-center md:text-left">Project Completion Status</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                        <tr className="border-b border-slate-100 dark:border-slate-800">
                            <th className="px-8 py-4 text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Project Name</th>
                            <th className="px-8 py-4 text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest text-center">Completion %</th>
                            <th className="px-8 py-4 text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest text-center">Total Phases</th>
                            <th className="px-8 py-4 text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest text-right">Current Status</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                        {reports.map((report) => (
                            <tr key={report.id} className="group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all cursor-pointer">
                                <td className="px-8 py-5 font-bold text-slate-800 dark:text-slate-200 text-xs uppercase tracking-tight group-hover:text-indigo-900 dark:group-hover:text-indigo-400 transition-colors">
                                    {report.title}
                                </td>
                                <td className="px-8 py-5">
                                    <div className="flex items-center justify-center gap-3">
                                        <div className="w-32 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700">
                                            <div
                                                className="h-full bg-indigo-900 dark:bg-indigo-500 transition-all duration-1000 ease-out"
                                                style={{ width: `${report.average_readiness}%` }}
                                            />
                                        </div>
                                        <span className="font-black text-indigo-900 dark:text-indigo-400 text-[10px] w-10 text-right">
                                                {Number(report.average_readiness).toFixed(0)}%
                                            </span>
                                    </div>
                                </td>
                                <td className="px-8 py-5 text-center">
                                        <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-md">
                                            {report.activity_count} Items
                                        </span>
                                </td>
                                <td className="px-8 py-5 text-right">
                                        <span className={`px-3 py-1.5 rounded-md text-[8px] font-black uppercase tracking-widest border transition-all ${
                                            report.status === 'completed'
                                                ? 'bg-indigo-900 dark:bg-indigo-900 text-white border-indigo-950 dark:border-indigo-500'
                                                : 'bg-white dark:bg-slate-800 text-indigo-900 dark:text-indigo-400 border-slate-200 dark:border-slate-700'
                                        }`}>
                                            {report.status}
                                        </span>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
                {reports.length === 0 && (
                    <div className="p-16 text-center text-slate-300 dark:text-slate-700 font-bold uppercase text-[10px] tracking-widest">
                        No projects found in this view
                    </div>
                )}
            </div>
        </div>
    );
}

const StatCard = ({ icon, label, value }) => (
    <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4 transition-all hover:translate-y-[-2px] hover:border-indigo-100 dark:hover:border-indigo-900/50">
        <div className="p-3 bg-slate-50 dark:bg-slate-800 text-indigo-900 dark:text-indigo-400 rounded-xl border border-slate-100 dark:border-slate-700">
            {React.cloneElement(icon, { size: 18 })}
        </div>
        <div>
            <p className="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-0.5">{label}</p>
            <p className="text-xl font-black text-indigo-900 dark:text-white leading-none">{value}</p>
        </div>
    </div>
);