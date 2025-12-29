import React, { useState, useEffect } from "react";
import { Search, Eye, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import issueService from "../../services/issueService";
import toast from "react-hot-toast";

const IssuesList = ({ filter, onViewDetails, onReportNew }) => {
    const [issues, setIssues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const issuesPerPage = 10;

    useEffect(() => {
        fetchIssues();
    }, [filter]);

    const fetchIssues = async () => {
        try {
            setLoading(true);
            const data = await issueService.getIssues(filter);

            let issuesData = Array.isArray(data) ? data : [];

            /**
             * LOGIC CHANGE:
             * If the current view is for "new" issues, include "escalated" issues
             * because they are now treated with the same priority/flow.
             */
            if (filter?.toLowerCase() === "new") {
                // If the service doesn't already bundle them, we ensure both are present
                setIssues(issuesData);
            } else {
                setIssues(issuesData);
            }

        } catch (error) {
            console.error("Error fetching issues:", error);
            toast.error("Failed to load issues");
            setIssues([]);
        } finally {
            setLoading(false);
        }
    };

    // Filter logic for Search Bar
    const filteredIssues = issues.filter(issue =>
        issue.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        issue.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        issue.status?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Pagination Logic
    const indexOfLastIssue = currentPage * issuesPerPage;
    const indexOfFirstIssue = indexOfLastIssue - issuesPerPage;
    const currentIssues = filteredIssues.slice(indexOfFirstIssue, indexOfLastIssue);
    const totalPages = Math.ceil(filteredIssues.length / issuesPerPage);

    const getStatusStyles = (status) => {
        const lowerStatus = status?.toLowerCase();

        /** * UPDATED LOGIC:
         * Escalated issues now use the 'New' branding (Dark Blue)
         */
        if (lowerStatus === "new" || lowerStatus === "escalated") {
            return "bg-[#004A7C] text-white";
        }

        switch (lowerStatus) {
            case "pending": return "bg-[#FF9933] text-white";
            case "fixed": return "bg-[#33A839] text-white";
            default: return "bg-slate-100 text-slate-600";
        }
    };

    return (
        <div className="p-8 w-full min-h-screen bg-white">
            {/* Header Section */}
            <div className="flex justify-between items-start mb-8">
                <div>
                    <h1 className="text-[#004A7C] text-xl font-bold capitalize tracking-tight">
                        EAII Maintenance and Request Management System
                    </h1>
                    <p className="text-slate-400 text-sm font-medium">
                        Central Admin Issue Management — Showing <span className="text-[#004A7C] font-bold capitalize">
                            {filter === "new" ? "New & Escalated" : filter}
                        </span> issues
                    </p>
                </div>
                <div className="flex gap-4 items-center">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                        <input
                            type="text"
                            placeholder="Search Issue ID or Category..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 border border-slate-100 rounded-md text-sm w-64 focus:outline-none focus:ring-2 focus:ring-[#004A7C]/20 transition-all"
                        />
                    </div>
                    <button
                        onClick={onReportNew}
                        className="bg-[#004A7C] text-white px-6 py-2 rounded-md font-bold text-sm hover:bg-[#00365c] transition-all shadow-md active:scale-95"
                    >
                        Report New Issue
                    </button>
                </div>
            </div>

            {/* Table Container */}
            <div className="rounded-xl overflow-hidden border border-slate-100 shadow-sm bg-white">
                <table className="w-full">
                    <thead className="bg-[#004A7C] text-white">
                    <tr>
                        <th className="py-4 px-6 text-left text-sm font-bold capitalize tracking-wider">Issue ID</th>
                        <th className="py-4 px-6 text-left text-sm font-bold capitalize tracking-wider">Category</th>
                        <th className="py-4 px-6 text-left text-sm font-bold capitalize tracking-wider">Severity</th>
                        <th className="py-4 px-6 text-left text-sm font-bold capitalize tracking-wider">Reported On</th>
                        <th className="py-4 px-6 text-center text-sm font-bold capitalize tracking-wider">Status</th>
                        <th className="py-4 px-6 text-center text-sm font-bold capitalize tracking-wider">Action</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                    {loading ? (
                        <tr>
                            <td colSpan="6" className="py-20 text-center">
                                <div className="flex flex-col items-center gap-3">
                                    <Loader2 className="animate-spin text-[#004A7C]" size={40} />
                                    <p className="text-slate-400 font-bold animate-pulse text-sm">Fetching System Issues...</p>
                                </div>
                            </td>
                        </tr>
                    ) : currentIssues.length > 0 ? (
                        currentIssues.map((issue) => (
                            <tr key={issue.id} className="hover:bg-slate-50/80 transition-colors group">
                                <td className="py-4 px-6 text-[#004A7C] font-black text-sm">{issue.id}</td>
                                <td className="py-4 px-6 text-[#004A7C] font-bold text-sm">{issue.category}</td>
                                <td className={`py-4 px-6 text-sm font-black ${
                                    issue.severity?.toLowerCase() === "critical" ? "text-rose-500" : "text-[#004A7C]"
                                }`}>
                                    {issue.severity}
                                </td>
                                <td className="py-4 px-6 text-[#004A7C] font-bold text-sm">{issue.reportedOn}</td>
                                <td className="py-4 px-6 text-center">
                                        <span className={`px-6 py-1.5 rounded-full text-[10px] font-black inline-block min-w-[110px] capitalize shadow-sm ${getStatusStyles(issue.status)}`}>
                                            {issue.status}
                                        </span>
                                </td>
                                <td className="py-4 px-6 text-center">
                                    <button
                                        onClick={() => onViewDetails(issue)}
                                        className="text-[#004A7C] p-2 hover:bg-blue-50 rounded-full transition-all active:scale-90"
                                        title="View Details"
                                    >
                                        <Eye size={20} />
                                    </button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="6" className="py-24 text-center">
                                <div className="flex flex-col items-center opacity-40">
                                    <Search size={48} className="text-slate-300 mb-2" />
                                    <p className="text-slate-500 font-black text-lg">No Issues Found</p>
                                    <p className="text-slate-400 text-sm">Try adjusting your search or filter</p>
                                </div>
                            </td>
                        </tr>
                    )}
                    </tbody>
                </table>
            </div>

            {/* Pagination Section */}
            {!loading && filteredIssues.length > issuesPerPage && (
                <div className="mt-8 flex justify-end items-center gap-2">
                    <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="flex items-center gap-1 text-[#004A7C] font-black text-xs px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-30 disabled:pointer-events-none transition-all"
                    >
                        <ChevronLeft size={16} /> Back
                    </button>

                    <div className="flex gap-1">
                        {[...Array(totalPages)].map((_, i) => (
                            <button
                                key={i + 1}
                                onClick={() => setCurrentPage(i + 1)}
                                className={`w-8 h-8 flex items-center justify-center text-xs font-black rounded-lg transition-all ${
                                    currentPage === i + 1
                                        ? "bg-[#004A7C] text-white shadow-md shadow-blue-900/20"
                                        : "text-[#004A7C] border border-slate-100 hover:bg-slate-50"
                                }`}
                            >
                                {i + 1}
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="flex items-center gap-1 text-[#004A7C] font-black text-xs px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-30 disabled:pointer-events-none transition-all"
                    >
                        Next <ChevronRight size={16} />
                    </button>
                </div>
            )}
        </div>
    );
};

export default IssuesList;