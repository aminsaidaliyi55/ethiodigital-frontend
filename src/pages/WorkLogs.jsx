import React, { useState, useEffect, useMemo } from "react";
import {
    Play,
    Square,
    Clock,
    Loader2,
    AlertCircle,
    Briefcase,
    Calculator,
    CheckCircle2
} from "lucide-react";
import { getMyLogs, clockIn, clockOut } from "@/services/workLogService";
import { getProjects } from "@/services/projectService";
import toast from "react-hot-toast";

const WorkLogs = () => {
    const [logs, setLogs] = useState([]);
    const [projects, setProjects] = useState([]);
    const [activeLog, setActiveLog] = useState(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [selectedProject, setSelectedProject] = useState("");

    // Calculate Daily Total accumulated for current date
    const dailyTotal = useMemo(() => {
        const today = new Date().toISOString().split('T')[0];
        return logs
            .filter(log => {
                const logDate = new Date(log.check_in || log.date).toISOString().split('T')[0];
                return logDate === today;
            })
            .reduce((sum, log) => sum + parseFloat(log.hours_worked || 0), 0)
            .toFixed(2);
    }, [logs]);

    // Initial data synchronization
    useEffect(() => {
        const initializeData = async () => {
            try {
                const [logsData, projectsData] = await Promise.all([
                    getMyLogs(),
                    getProjects()
                ]);

                const logsArray = Array.isArray(logsData) ? logsData : [];
                setLogs(logsArray);

                // Identify active shift from database status
                const active = logsArray.find(l => l.status === 'active');
                setActiveLog(active);

                setProjects(Array.isArray(projectsData) ? projectsData : []);
            } catch (e) {
                console.error("Systems Sync Failure:", e);
                toast.error("Systems Sync Failure");
            } finally {
                setLoading(false);
            }
        };

        initializeData();
    }, []);

    const refreshLogs = async () => {
        try {
            const data = await getMyLogs();
            const logsArray = Array.isArray(data) ? data : [];
            setLogs(logsArray);
            setActiveLog(logsArray.find(l => l.status === 'active'));
        } catch (e) {
            toast.error("Database Refresh Failed");
        }
    };

    const handleClockIn = async () => {
        setActionLoading(true);
        try {
            await clockIn({
                project_id: selectedProject || null,
                notes: "Standard Mission Shift"
            });
            toast.success("Shift successfully initialized");
            await refreshLogs();
            setSelectedProject("");
        } catch (e) {
            toast.error(e.response?.data?.error || "Protocol initiation failed");
        } finally {
            setActionLoading(false);
        }
    };

    const handleClockOut = async () => {
        if (!activeLog) return;
        setActionLoading(true);
        try {
            await clockOut(activeLog.id);
            toast.success("Shift records finalized");
            await refreshLogs();
        } catch (e) {
            toast.error("Protocol termination failed");
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <Loader2 className="animate-spin text-indigo-600 mb-4" size={40} />
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Retrieving Work History...</p>
        </div>
    );

    return (
        <div className="p-8 max-w-[1600px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header Section */}
            <header className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <h1 className="text-4xl font-black uppercase tracking-tighter text-slate-900 leading-none">
                        Mission <span className="text-indigo-600">Logs</span>
                    </h1>
                    <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-[0.4em]">
                        Personnel activity tracking and hours verification
                    </p>
                </div>

                <div className="flex items-center gap-4 bg-indigo-50 px-6 py-4 rounded-3xl border border-indigo-100/50 shadow-sm">
                    <div className="bg-indigo-900 p-2 rounded-xl text-white">
                        <Calculator size={20} />
                    </div>
                    <div>
                        <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest leading-none">Today's Accumulation</p>
                        <p className="text-2xl font-black text-indigo-900 leading-none mt-1">{dailyTotal} <span className="text-xs">HRS</span></p>
                    </div>
                </div>
            </header>

            {/* Shift Control Card */}
            <div className="bg-white p-10 rounded-[3rem] shadow-2xl shadow-slate-200/60 border border-slate-100 mb-12 flex flex-col lg:flex-row items-center justify-between gap-10">
                <div className="flex items-center gap-8 w-full lg:w-auto">
                    <div className={`p-7 rounded-[2rem] transition-all duration-500 ${
                        activeLog
                            ? 'bg-indigo-900 text-white shadow-xl shadow-indigo-200 animate-pulse'
                            : 'bg-slate-100 text-slate-400'
                    }`}>
                        <Clock size={40} />
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">
                            {activeLog ? "Active Session" : "System Standby"}
                        </h2>
                        <div className="flex items-center gap-2 mt-1">
                            <span className={`w-2 h-2 rounded-full ${activeLog ? 'bg-green-500 animate-ping' : 'bg-slate-300'}`} />
                            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                                {activeLog
                                    ? `Deployed since: ${new Date(activeLog.check_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                                    : "Ready for deployment"}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-6 w-full lg:w-auto">
                    {!activeLog && (
                        <div className="relative w-full sm:w-80">
                            <Briefcase className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <select
                                value={selectedProject}
                                onChange={(e) => setSelectedProject(e.target.value)}
                                className="w-full pl-14 pr-6 py-5 bg-slate-50 border-2 border-slate-100 focus:border-indigo-500 rounded-2xl outline-none text-xs font-bold text-slate-700 appearance-none transition-all cursor-pointer shadow-sm"
                            >
                                <option value="">General Assignment</option>
                                {projects.map(p => (
                                    <option key={p.id} value={p.id}>{p.title}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    <button
                        onClick={activeLog ? handleClockOut : handleClockIn}
                        disabled={actionLoading}
                        className={`w-full sm:w-auto px-12 py-5 rounded-2xl font-black uppercase text-[11px] tracking-[0.2em] flex items-center justify-center gap-3 transition-all active:scale-95 disabled:opacity-50 shadow-2xl ${
                            activeLog
                                ? 'bg-red-500 text-white hover:bg-red-600 shadow-red-200'
                                : 'bg-slate-900 text-white hover:bg-indigo-900 shadow-indigo-100'
                        }`}
                    >
                        {actionLoading ? <Loader2 size={18} className="animate-spin" /> : (activeLog ? <Square size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />)}
                        {activeLog ? "Terminate Shift" : "Initiate Shift"}
                    </button>
                </div>
            </div>

            {/* Archives Section */}
            <div className="px-2">
                <div className="flex items-center gap-4 mb-8">
                    <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400">Verified Archives</h3>
                    <div className="h-[1px] flex-1 bg-slate-100" />
                </div>

                {logs.filter(l => l.status !== 'active').length === 0 ? (
                    <div className="p-24 bg-slate-50/50 border-4 border-dashed border-slate-100 rounded-[4rem] flex flex-col items-center justify-center text-center">
                        <AlertCircle className="text-slate-200 mb-4" size={48} />
                        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">No verified shift history found</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {logs.filter(l => l.status !== 'active').map(log => (
                            <div key={log.id} className="bg-white p-6 rounded-3xl border border-slate-100 flex items-center justify-between group hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-50/50 transition-all duration-300">
                                <div className="flex items-center gap-5">
                                    <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                                        <CheckCircle2 size={24} />
                                    </div>
                                    <div>
                                        <p className="font-black text-slate-800 uppercase text-xs tracking-tight">
                                            {new Date(log.date || log.check_in).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </p>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5 truncate max-w-[150px]">
                                            {log.project_name || "General Activity"}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-lg font-black text-indigo-600 leading-none">
                                        {log.hours_worked ? `${log.hours_worked}` : "0.00"}
                                        <span className="text-[10px] ml-1 opacity-60">HRS</span>
                                    </p>
                                    <p className="text-[8px] text-green-500 font-black uppercase mt-1 bg-green-50 px-2 py-0.5 rounded-md">Verified</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default WorkLogs;