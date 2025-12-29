import React, { useEffect, useState, useMemo, useRef } from "react";
import { useReactToPrint } from "react-to-print";
import { getWeeklyReport } from "../../services/reportService";
import { Calendar, Activity, TrendingUp, BarChart3, Download, Printer, Loader2 } from "lucide-react";

export default function WeeklyReport() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const reportRef = useRef(null);

    useEffect(() => {
        getWeeklyReport()
            .then(res => setData(Array.isArray(res) ? res : []))
            .catch(err => console.error("Error loading weekly data:", err))
            .finally(() => setLoading(false));
    }, []);

    const handlePrint = useReactToPrint({
        contentRef: reportRef,
        documentTitle: `Weekly_Summary_${new Date().toISOString().split('T')[0]}`,
    });

    const exportToCSV = () => {
        const headers = "Day, Tasks Completed\n";
        const rows = data.map(item => `${item.day_name}, ${item.activity_count}`).join("\n");
        const blob = new Blob([headers + rows], { type: "text/csv" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `Weekly_Report_${new Date().toLocaleDateString()}.csv`;
        a.click();
    };

    const stats = useMemo(() => {
        if (!data.length) return { total: 0, peak: "N/A" };
        const total = data.reduce((acc, curr) => acc + Number(curr.activity_count || 0), 0);
        const peakDay = [...data].sort((a, b) => b.activity_count - a.activity_count)[0];
        return { total, peak: peakDay?.day_name || "N/A" };
    }, [data]);

    if (loading) return (
        <div className="h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 transition-colors">
            <Loader2 className="w-8 h-8 text-indigo-900 dark:text-indigo-400 animate-spin mb-4" />
            <p className="text-slate-400 font-black uppercase tracking-widest text-[9px]">Building weekly summary...</p>
        </div>
    );

    return (
        <div className="p-4 bg-[#F8FAFC] dark:bg-slate-950 min-h-screen font-sans transition-colors duration-300">
            {/* --- HEADER --- */}
            <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4 print:hidden">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-indigo-900 dark:bg-indigo-900 rounded-xl text-white shadow-lg">
                        <Calendar size={24} />
                    </div>
                    <div>
                        <h1 className="text-xl font-black text-indigo-900 dark:text-white uppercase tracking-tight leading-none">Weekly Summary</h1>
                        <p className="text-slate-400 dark:text-slate-500 text-[8px] font-black uppercase tracking-[0.2em] mt-1">Daily Progress & Busy Periods</p>
                    </div>
                </div>

                <div className="flex gap-2 w-full md:w-auto">
                    <button onClick={exportToCSV} className="flex-1 md:flex-none bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-4 py-2.5 rounded-lg font-black text-[9px] uppercase text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all flex items-center justify-center gap-2 shadow-sm">
                        <Download size={14}/> Download CSV
                    </button>
                    <button onClick={() => handlePrint()} className="flex-1 md:flex-none bg-indigo-900 dark:bg-indigo-900 px-4 py-2.5 rounded-lg font-black text-[9px] uppercase text-white hover:bg-slate-800 dark:hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 shadow-sm">
                        <Printer size={14}/> Print PDF
                    </button>
                </div>
            </div>

            {/* --- PRINTABLE CONTENT --- */}
            <div ref={reportRef} className="print:p-12">
                {/* PDF Only Header */}
                <div className="hidden print:flex justify-between items-end mb-10 border-b-2 border-indigo-900 pb-6">
                    <div>
                        <h1 className="text-2xl font-black uppercase text-indigo-900">Weekly Progress Report</h1>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Team Activity & Task History</p>
                    </div>
                    <div className="text-right text-[9px] font-bold text-slate-500 uppercase">
                        Date: {new Date().toLocaleString()}
                    </div>
                </div>

                {/* --- KPI CARDS --- */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
                    <StatCard icon={<Activity />} label="Total Tasks Finished" value={stats.total} />
                    <StatCard icon={<TrendingUp />} label="Busiest Day" value={stats.peak} />
                    <StatCard icon={<BarChart3 />} label="Daily Avg. Tasks" value={(stats.total / 7).toFixed(1)} />
                </div>

                {/* --- DATA TABLE --- */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden print:border-none print:shadow-none transition-colors">
                    <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 print:hidden">
                        <h3 className="font-black text-indigo-900 dark:text-indigo-400 uppercase text-[9px] tracking-widest">Activity Breakdown</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                            <tr className="bg-indigo-900 dark:bg-slate-800 text-white print:bg-slate-100 print:text-indigo-900">
                                <th className="px-8 py-4 text-[8px] font-black uppercase tracking-widest border-r border-indigo-800 dark:border-slate-700">Day of Week</th>
                                <th className="px-8 py-4 text-[8px] font-black uppercase tracking-widest text-center border-r border-indigo-800 dark:border-slate-700">Tasks Completed</th>
                                <th className="px-8 py-4 text-[8px] font-black uppercase tracking-widest text-right print:hidden">Share of Work</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {data.map((item, idx) => (
                                <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all group">
                                    <td className="px-8 py-5 font-bold text-slate-800 dark:text-slate-200 uppercase text-xs tracking-tight group-hover:text-indigo-900 dark:group-hover:text-indigo-400">
                                        {item.day_name}
                                    </td>
                                    <td className="px-8 py-5 text-center font-black text-indigo-900 dark:text-indigo-400 text-sm">
                                        {item.activity_count}
                                    </td>
                                    <td className="px-8 py-5 print:hidden">
                                        <div className="flex items-center justify-end gap-3">
                                            <div className="w-32 h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden border dark:border-slate-700">
                                                <div
                                                    className="h-full bg-indigo-900 dark:bg-indigo-500 transition-all duration-1000"
                                                    style={{ width: `${(item.activity_count / (Math.max(stats.total, 1))) * 100}%` }}
                                                />
                                            </div>
                                            <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 min-w-[40px] text-right">
                                                    {((item.activity_count / (Math.max(stats.total, 1))) * 100).toFixed(1)}%
                                                </span>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}

const StatCard = ({ icon, label, value }) => (
    <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4 transition-colors">
        <div className="p-3 bg-slate-50 dark:bg-slate-800 text-indigo-900 dark:text-indigo-400 rounded-lg border border-slate-100 dark:border-slate-700">
            {React.cloneElement(icon, { size: 18 })}
        </div>
        <div>
            <p className="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-0.5">{label}</p>
            <p className="text-xl font-black text-indigo-900 dark:text-white leading-none">{value}</p>
        </div>
    </div>
);