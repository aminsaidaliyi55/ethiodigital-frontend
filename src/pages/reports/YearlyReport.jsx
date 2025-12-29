import React, { useEffect, useState, useRef } from "react";
import { useReactToPrint } from "react-to-print";
import { getYearlyReport } from "../../services/reportService";
import {
    ShieldCheck,
    Target,
    ArrowUpRight,
    DownloadCloud,
    Printer,
    Loader2,
    Activity,
    Globe
} from "lucide-react";

export default function YearlyReport() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const contentRef = useRef(null);

    useEffect(() => {
        getYearlyReport()
            .then(res => setData(Array.isArray(res) ? res : []))
            .catch(err => console.error("Yearly Data Error:", err))
            .finally(() => setLoading(false));
    }, []);

    const handlePrint = useReactToPrint({
        contentRef,
        documentTitle: `Annual_Performance_Audit_${new Date().getFullYear()}`,
    });

    const exportToCSV = () => {
        const headers = "Month, Projects Launched\n";
        const rows = data.map(item => `${item.month}, ${item.projects_launched}`).join("\n");
        const blob = new Blob([headers + rows], { type: "text/csv" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `Annual_Initiation_Data_${new Date().getFullYear()}.csv`;
        a.click();
    };

    if (loading) return (
        <div className="h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 transition-colors">
            <Loader2 className="w-10 h-10 text-indigo-900 dark:text-indigo-400 animate-spin mb-4" />
            <p className="text-slate-400 dark:text-slate-500 font-black uppercase tracking-widest text-[9px]">Analyzing Fiscal Lifecycle...</p>
        </div>
    );

    return (
        <div className="p-4 bg-[#F8FAFC] dark:bg-slate-950 min-h-screen font-sans transition-colors duration-300">
            {/* --- HEADER / HERO SECTION --- */}
            <div className="bg-indigo-900 dark:bg-indigo-950 rounded-[2rem] p-10 text-white mb-10 relative overflow-hidden shadow-xl shadow-indigo-100/50 dark:shadow-none print:hidden border dark:border-indigo-900/30">
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <span className="bg-indigo-800 dark:bg-indigo-900 text-indigo-300 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border border-indigo-700 dark:border-indigo-800">
                                Fiscal Year {new Date().getFullYear()}
                            </span>
                        </div>
                        <h1 className="text-2xl font-black uppercase tracking-tighter mb-2">Annual Audit</h1>
                        <p className="text-indigo-300 dark:text-indigo-400 max-w-sm font-bold text-[10px] uppercase tracking-widest leading-relaxed">
                            Full-scale project initiation velocity & strategic growth metrics across the current lifecycle.
                        </p>
                    </div>

                    <div className="flex gap-2 w-full md:w-auto">
                        <button
                            onClick={exportToCSV}
                            className="flex-1 md:flex-none bg-indigo-800 dark:bg-slate-900 border border-indigo-700 dark:border-slate-800 px-6 py-3 rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-indigo-700 dark:hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
                        >
                            <DownloadCloud size={14}/> CSV Export
                        </button>
                        <button
                            onClick={() => handlePrint()}
                            className="flex-1 md:flex-none bg-white dark:bg-indigo-900 text-indigo-900 dark:text-white px-6 py-3 rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-indigo-500 transition-all flex items-center justify-center gap-2 shadow-lg"
                        >
                            <Printer size={14}/> Print Audit
                        </button>
                    </div>
                </div>
                <Globe size={300} className="absolute -right-20 -bottom-20 text-white/5 rotate-12" />
            </div>

            {/* --- PRINTABLE CONTENT --- */}
            <div ref={contentRef} className="print:p-12">
                {/* PDF BRANDING (Visible only when printing) */}
                <div className="hidden print:flex justify-between items-end mb-10 border-b-2 border-indigo-900 pb-6">
                    <div>
                        <h1 className="text-2xl font-black uppercase text-indigo-900">Annual Performance Audit</h1>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Internal Strategic Documentation | FY {new Date().getFullYear()}</p>
                    </div>
                    <ShieldCheck size={40} className="text-indigo-900" />
                </div>

                {/* MONTHLY METRIC GRID */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {data.map((item, idx) => (
                        <div
                            key={idx}
                            className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-all duration-300 group hover:border-indigo-900 dark:hover:border-indigo-500 break-inside-avoid"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <span className="p-2.5 bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 rounded-lg group-hover:bg-indigo-900 dark:group-hover:bg-indigo-900 group-hover:text-white transition-all">
                                    <Activity size={16}/>
                                </span>
                                <div className="text-right">
                                    <p className="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none mb-1">Status</p>
                                    <ArrowUpRight size={14} className="text-indigo-900 dark:text-indigo-400 ml-auto" />
                                </div>
                            </div>
                            <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">{item.month}</p>
                            <h3 className="text-3xl font-black text-indigo-900 dark:text-white tracking-tighter">
                                {item.projects_launched}
                                <span className="text-[10px] text-slate-300 dark:text-slate-600 uppercase font-bold ml-2">Initiations</span>
                            </h3>
                        </div>
                    ))}
                </div>

                {data.length === 0 && (
                    <div className="p-16 text-center bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                        <p className="text-slate-300 dark:text-slate-700 font-black uppercase text-[10px] tracking-widest">No yearly initiation records found</p>
                    </div>
                )}
            </div>
        </div>
    );
}