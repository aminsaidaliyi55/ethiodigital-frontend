import React, { useEffect, useState, useMemo, useRef } from "react";
import { useReactToPrint } from "react-to-print";
import { getMonthlyReport } from "../../services/reportService";
import {
    BarChart3, Loader2, Download, Printer, Search, ChevronLeft, ChevronRight, AlertCircle, TrendingUp, Briefcase
} from "lucide-react";

export default function MonthlyReport() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;
    const tableRef = useRef(null);

    // --- AUTH CONTEXT ---
    const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
    const userRole = currentUser.role;
    const currentUserName = currentUser.name;

    useEffect(() => {
        getMonthlyReport()
            .then(res => {
                let reportData = Array.isArray(res) ? res : [];

                if (userRole === "PROJECT_MANAGER") {
                    reportData = reportData.filter(project =>
                        project.manager_name === currentUserName ||
                        String(project.manager_id) === String(currentUser.id)
                    );
                }

                setData(reportData);
                setError(null);
            })
            .catch(err => setError(err.response?.data?.error || "Unable to load reports. Please check your connection."))
            .finally(() => setLoading(false));
    }, [userRole, currentUserName, currentUser.id]);

    const filteredData = useMemo(() => {
        return data.filter(p =>
            p.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.owner_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.manager_name?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [data, searchTerm]);

    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const paginatedData = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredData.slice(start, start + itemsPerPage);
    }, [filteredData, currentPage]);

    useEffect(() => setCurrentPage(1), [searchTerm]);

    const handlePrint = useReactToPrint({
        contentRef: tableRef,
        documentTitle: `Monthly_Report_${new Date().toISOString().split('T')[0]}`,
    });

    const exportToCSV = () => {
        const headers = "Project Name,Owner,Manager,Total Spent,Tasks Completed\n";
        const rows = filteredData.map(p =>
            `"${p.title}","${p.owner_name || 'N/A'}","${p.manager_name || 'N/A'}",${p.total_spent || 0},${p.tasks_done || 0}`
        ).join("\n");
        const blob = new Blob([headers + rows], { type: "text/csv" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `Monthly_Report_${new Date().toLocaleDateString()}.csv`;
        a.click();
    };

    const totals = useMemo(() => {
        const spent = filteredData.reduce((acc, curr) => acc + Number(curr.total_spent || 0), 0);
        const tasks = filteredData.reduce((acc, curr) => acc + Number(curr.tasks_done || 0), 0);
        return { spent: spent.toLocaleString(), tasks };
    }, [filteredData]);

    if (loading) return (
        <div className="h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 transition-colors">
            <Loader2 className="w-8 h-8 text-indigo-900 dark:text-indigo-400 animate-spin mb-4" />
            <p className="text-slate-400 font-black uppercase tracking-widest text-[9px]">Gathering report data...</p>
        </div>
    );

    return (
        <div className="p-4 bg-[#F8FAFC] dark:bg-slate-950 min-h-screen font-sans transition-colors duration-300">
            {/* --- HEADER --- */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 no-print">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-indigo-900 dark:bg-indigo-900 rounded-xl text-white shadow-lg">
                        <BarChart3 size={24} />
                    </div>
                    <div>
                        <h1 className="text-xl font-black text-indigo-900 dark:text-white uppercase tracking-tight leading-none">
                            {userRole === "ADMIN" ? "Company Summary" : "My Project Report"}
                        </h1>
                        <p className="text-slate-400 dark:text-slate-500 text-[8px] font-black uppercase tracking-[0.2em] mt-1">
                            {userRole === "ADMIN" ? "Overview of all active projects" : `Viewing projects managed by ${currentUserName}`}
                        </p>
                    </div>
                </div>

                <div className="flex gap-2 w-full md:w-auto">
                    <button onClick={exportToCSV} className="flex-1 md:flex-none bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-4 py-2.5 rounded-lg font-black text-[9px] uppercase text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all flex items-center justify-center gap-2 shadow-sm">
                        <Download size={14}/> Download CSV
                    </button>
                    <button onClick={() => handlePrint()} className="flex-1 md:flex-none bg-indigo-900 dark:bg-indigo-900 px-4 py-2.5 rounded-lg font-black text-[9px] uppercase text-white hover:bg-indigo-800 dark:hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 shadow-sm">
                        <Printer size={14}/> Print Report
                    </button>
                </div>
            </header>

            {/* --- SEARCH & QUICK KPI --- */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-8 no-print">
                <div className="lg:col-span-2 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={16} />
                    <input
                        type="text"
                        placeholder="Search projects, owners, or managers..."
                        className="w-full bg-white dark:bg-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 rounded-xl py-3 pl-11 pr-4 text-xs font-bold shadow-sm focus:ring-2 ring-indigo-900/5 outline-none transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="bg-white dark:bg-slate-900 px-5 py-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-center transition-colors">
                    <div className="flex items-center gap-2 mb-1">
                        <TrendingUp size={12} className="text-indigo-900 dark:text-indigo-400"/>
                        <p className="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Total Expenses</p>
                    </div>
                    <p className="text-lg font-black text-indigo-900 dark:text-indigo-400 leading-none">{totals.spent} <span className="text-[10px]">ETB</span></p>
                </div>
                <div className="bg-white dark:bg-slate-900 px-5 py-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-center transition-colors">
                    <div className="flex items-center gap-2 mb-1">
                        <Briefcase size={12} className="text-indigo-900 dark:text-indigo-400"/>
                        <p className="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Total Tasks Done</p>
                    </div>
                    <p className="text-lg font-black text-slate-900 dark:text-white leading-none">{totals.tasks} <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase">Tasks</span></p>
                </div>
            </div>

            {error ? (
                <div className="bg-red-50 dark:bg-red-950/20 p-6 rounded-xl text-red-700 dark:text-red-400 border border-red-100 dark:border-red-900 flex items-center gap-3">
                    <AlertCircle size={20} />
                    <p className="font-bold text-[10px] uppercase tracking-widest">{error}</p>
                </div>
            ) : (
                <div className="flex flex-col gap-5">
                    {/* --- TABLE CONTAINER --- */}
                    <div ref={tableRef} className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden print:border-none print:shadow-none transition-colors">

                        {/* Print Only Header */}
                        <div className="hidden print:block p-8 border-b border-slate-100 bg-slate-50">
                            <h2 className="text-xl font-black uppercase text-indigo-900">Monthly Project Performance Report</h2>
                            <p className="text-[9px] font-bold text-slate-400 uppercase">Generated By: {currentUserName} | Date: {new Date().toLocaleString()}</p>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-indigo-900 dark:bg-slate-800 text-white">
                                <tr>
                                    <th className="px-8 py-4 text-[8px] font-black uppercase tracking-widest border-r border-indigo-800 dark:border-slate-700">Project Name</th>
                                    <th className="px-6 py-4 text-[8px] font-black uppercase tracking-widest border-r border-indigo-800 dark:border-slate-700">Owner</th>
                                    <th className="px-6 py-4 text-[8px] font-black uppercase tracking-widest border-r border-indigo-800 dark:border-slate-700">Manager</th>
                                    <th className="px-6 py-4 text-[8px] font-black uppercase tracking-widest border-r border-indigo-800 dark:border-slate-700 text-center">Cost to Date</th>
                                    <th className="px-8 py-4 text-[8px] font-black uppercase tracking-widest text-right">Progress</th>
                                </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {paginatedData.map((p, i) => (
                                    <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                                        <td className="px-8 py-5 font-bold text-slate-800 dark:text-slate-200 uppercase text-xs tracking-tight group-hover:text-indigo-900 dark:group-hover:text-indigo-400 transition-colors">{p.title}</td>
                                        <td className="px-6 py-5 font-bold text-slate-600 dark:text-slate-400 text-[11px] uppercase">{p.owner_name || "---"}</td>
                                        <td className="px-6 py-5 font-bold text-slate-500 dark:text-slate-500 text-[11px]">{p.manager_name || "---"}</td>
                                        <td className="px-6 py-5 text-center">
                                                <span className="font-mono font-black text-indigo-900 dark:text-indigo-400 text-xs transition-colors">
                                                    {Number(p.total_spent).toLocaleString()} <span className="text-[9px] opacity-60">ETB</span>
                                                </span>
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                                <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-3 py-1.5 rounded-md font-black text-[9px] uppercase group-hover:bg-indigo-900 dark:group-hover:bg-indigo-900 group-hover:text-white transition-all">
                                                    {p.tasks_done} Tasks Finished
                                                </span>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>

                        {filteredData.length === 0 && (
                            <div className="p-16 text-center">
                                <p className="text-slate-300 dark:text-slate-700 font-black uppercase text-[10px] tracking-widest">No project records found for this period.</p>
                            </div>
                        )}
                    </div>

                    {/* --- PAGINATION --- */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between px-6 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm no-print transition-colors">
                            <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                                Page {currentPage} of {totalPages}
                            </p>
                            <div className="flex gap-2">
                                <button
                                    disabled={currentPage === 1}
                                    onClick={() => setCurrentPage(prev => prev - 1)}
                                    className="p-2 border border-slate-200 dark:border-slate-800 rounded-lg disabled:opacity-20 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all text-indigo-900 dark:text-indigo-400"
                                >
                                    <ChevronLeft size={16} />
                                </button>
                                <button
                                    disabled={currentPage === totalPages}
                                    onClick={() => setCurrentPage(prev => prev + 1)}
                                    className="p-2 border border-slate-200 dark:border-slate-800 rounded-lg disabled:opacity-20 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all text-indigo-900 dark:text-indigo-400"
                                >
                                    <ChevronRight size={16} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}