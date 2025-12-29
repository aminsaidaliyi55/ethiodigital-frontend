import React, { useEffect, useState, useMemo } from "react";
import { getTeamProductivityReport } from "../../services/reportService";
import {
    Users, Target, Loader2, Crown, Medal, TrendingUp
} from "lucide-react";

export default function TeamProductivity() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getTeamProductivityReport()
            .then(res => setData(Array.isArray(res) ? res : []))
            .catch(err => console.error("Error loading team data:", err))
            .finally(() => setLoading(false));
    }, []);

    const { rankedData, topThree } = useMemo(() => {
        const sorted = [...data].sort((a, b) => (Number(b.avg_progress) || 0) - (Number(a.avg_progress) || 0));
        return {
            rankedData: sorted,
            topThree: sorted.slice(0, 3)
        };
    }, [data]);

    const teamStats = useMemo(() => {
        if (!data.length) return { totalTasks: 0, avgTeamProgress: 0 };
        const totalTasks = data.reduce((acc, curr) => acc + Number(curr.total_tasks || 0), 0);
        const avgProgress = data.reduce((acc, curr) => acc + Number(curr.avg_progress || 0), 0) / data.length;
        return { totalTasks, avgTeamProgress: avgProgress.toFixed(1) };
    }, [data]);

    if (loading) return (
        <div className="h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950">
            <Loader2 className="animate-spin text-indigo-900 mb-4" size={40} />
            <p className="text-slate-400 font-black uppercase tracking-[0.3em] text-[10px]">Loading Team Stats...</p>
        </div>
    );

    return (
        <div className="p-8 bg-slate-50 dark:bg-slate-950 min-h-screen font-sans">
            {/* --- HEADER --- */}
            <div className="flex justify-between items-end mb-10">
                <div className="space-y-1">
                    <h1 className="text-2xl font-black text-indigo-900 dark:text-indigo-400 uppercase tracking-tighter flex items-center gap-3">
                        <Users size={28} strokeWidth={3} /> Team Productivity
                    </h1>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Top Performers & Progress Tracking</p>
                </div>
                <div className="hidden md:flex gap-6 border-l-2 pl-8 border-indigo-900/10">
                    <div className="text-right">
                        <p className="text-[10px] font-black text-slate-400 uppercase mb-1 tracking-widest">Team Average</p>
                        <p className="text-2xl font-black text-indigo-900 dark:text-indigo-400 leading-none">{teamStats.avgTeamProgress}%</p>
                    </div>
                </div>
            </div>

            {/* --- TOP 3 PODIUM SECTION --- */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                {topThree.map((user, idx) => (
                    <div
                        key={user.id || idx}
                        className={`relative p-8 rounded-[2.5rem] border-2 transition-all duration-300
                            ${idx === 0
                            ? 'bg-indigo-900 border-indigo-950 text-white shadow-2xl shadow-indigo-900/30'
                            : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-900'}`}
                    >
                        <div className="flex justify-between items-center mb-6">
                            <div className={`p-3 rounded-2xl ${idx === 0 ? 'bg-white/10 text-white' : 'bg-indigo-50 text-indigo-900'}`}>
                                {idx === 0 ? <Crown size={22} /> : <Medal size={22} />}
                            </div>
                            <span className={`text-[10px] font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-full border ${
                                idx === 0 ? 'bg-indigo-800 border-indigo-700 text-indigo-200' : 'bg-slate-50 border-slate-100 dark:border-slate-800 dark:text-slate-400 text-slate-400'
                            }`}>
                                #{idx + 1} Best
                            </span>
                        </div>

                        <div className="space-y-1">
                            <h3 className={`text-lg font-black uppercase tracking-tight truncate ${idx === 0 ? 'text-white' : 'text-indigo-900 dark:text-white'}`}>
                                {user.name}
                            </h3>
                            <div className="flex items-center gap-2">
                                <TrendingUp size={14} className={idx === 0 ? 'text-indigo-400' : 'text-indigo-900'} />
                                <span className={`text-[10px] font-bold uppercase tracking-widest ${idx === 0 ? 'text-indigo-300' : 'text-slate-400'}`}>
                                    Contribution Score
                                </span>
                            </div>
                        </div>

                        <div className="mt-6 flex items-baseline gap-2">
                            <span className={`text-5xl font-black leading-none ${idx === 0 ? 'text-white' : 'text-indigo-900 dark:text-indigo-400'}`}>
                                {Number(user.avg_progress || 0).toFixed(0)}%
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {/* --- FULL TEAM TABLE --- */}
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800 overflow-hidden">
                <div className="px-10 py-6 border-b border-slate-50 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/30">
                    <h3 className="font-black text-indigo-900 dark:text-indigo-400 uppercase text-[10px] tracking-[0.2em]">Team Performance Overview</h3>
                    <div className="flex items-center gap-3 bg-white dark:bg-slate-800 px-4 py-2 rounded-xl border border-slate-100 dark:border-slate-700">
                        <Target size={14} className="text-indigo-900 dark:text-indigo-400" />
                        <span className="text-slate-500 dark:text-slate-400 font-black text-[10px] uppercase">Workload: {teamStats.totalTasks} Tasks</span>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                        <tr className="bg-indigo-900 text-[9px] font-black text-indigo-100 uppercase tracking-[0.2em]">
                            <th className="px-10 py-5">Rank</th>
                            <th className="px-10 py-5">Team Member</th>
                            <th className="px-10 py-5 text-center">Tasks Assigned</th>
                            <th className="px-10 py-5">Completion Rate</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                        {rankedData.map((user, idx) => (
                            <tr
                                key={user.id || idx}
                                className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-all"
                            >
                                <td className="px-10 py-6">
                                        <span className={`text-[10px] font-black w-8 h-8 flex items-center justify-center rounded-xl 
                                            ${idx < 3 ? 'bg-indigo-900 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                                            {idx + 1}
                                        </span>
                                </td>
                                <td className="px-10 py-6">
                                        <span className="font-black text-slate-800 dark:text-white text-sm uppercase tracking-tight">
                                            {user.name}
                                        </span>
                                </td>
                                <td className="px-10 py-6 text-center">
                                        <span className="text-[11px] font-black text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-lg">
                                            {user.total_tasks}
                                        </span>
                                </td>
                                <td className="px-10 py-6">
                                    <div className="flex items-center gap-4">
                                        <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden max-w-[150px]">
                                            <div
                                                className="h-full bg-indigo-900 dark:bg-indigo-500 transition-all duration-1000 ease-out"
                                                style={{ width: `${user.avg_progress || 0}%` }}
                                            />
                                        </div>
                                        <span className="font-black text-indigo-900 dark:text-indigo-400 text-[11px] tracking-tighter">
                                                {Number(user.avg_progress || 0).toFixed(1)}%
                                            </span>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
                {data.length === 0 && (
                    <div className="p-20 text-center">
                        <p className="text-slate-400 font-black uppercase text-[10px] tracking-[0.3em] italic">No team data available yet.</p>
                    </div>
                )}
            </div>
        </div>
    );
}