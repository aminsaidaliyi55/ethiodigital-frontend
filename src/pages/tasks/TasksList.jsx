import React, { useState, useEffect } from 'react';
import { Eye, Filter, Loader2, Search, X, Video, FileText, Clock, ChevronDown } from 'lucide-react';
import issueService from '@/services/issueService';
import toast from 'react-hot-toast';

const TasksList = () => {
    const [tasks, setTasks] = useState([]);
    const [developers, setDevelopers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('list'); // 'list' or 'details'
    const [selectedTask, setSelectedTask] = useState(null);

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            setLoading(true);
            const [issuesRes, usersRes] = await Promise.all([
                issueService.getIssues(),
                issueService.getUsers()
            ]);
            setTasks(Array.isArray(issuesRes) ? issuesRes : (issuesRes?.data || []));
            setDevelopers(Array.isArray(usersRes) ? usersRes : (usersRes?.data || []));
        } catch (error) {
            toast.error("Failed to synchronize with server");
        } finally {
            setLoading(false);
        }
    };

    const getStatusStyle = (status) => {
        switch (status?.toLowerCase()) {
            case 'new': return 'bg-[#004A7C] text-white';
            case 'fixed': return 'bg-[#4CAF50] text-white';
            case 'pending': return 'bg-[#FFB020] text-white';
            case 'resolved': return 'bg-[#76BC21] text-white';
            default: return 'bg-slate-400 text-white';
        }
    };

    // --- VIEW 1: TASK LIST TABLE ---
    if (viewMode === 'list') {
        return (
            <div className="w-full">
                {/* Internal Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div className="space-y-1">
                        <h1 className="text-[20px] font-bold text-[#004A7C] tracking-tight">
                            EAII Maintenance and request Management System
                        </h1>
                        <p className="text-slate-400 text-xs font-medium">
                            This is the issue management of the EAII QA Team
                        </p>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="relative group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={14} />
                            <input
                                type="text"
                                placeholder="Search for Organization..."
                                className="pl-9 pr-4 py-2 bg-white border border-slate-100 rounded-lg text-xs w-64 outline-none focus:ring-1 focus:ring-blue-100 transition-all placeholder:text-slate-300 shadow-sm"
                            />
                        </div>
                        <button className="flex items-center gap-2 px-5 py-2 bg-[#004A7C] text-white rounded-lg text-xs font-bold shadow-md hover:bg-[#003d66] transition-colors">
                            <Filter size={14} /> Filter
                        </button>
                    </div>
                </div>

                {/* Table Section */}
                <div className="overflow-x-auto">
                    <table className="w-full border-separate border-spacing-y-3">
                        <thead>
                        <tr className="bg-[#004A7C] text-white text-[11px] font-bold uppercase tracking-wider">
                            <th className="p-4 rounded-l-xl text-left pl-6">Issue ID</th>
                            <th className="p-4 text-left">System Name</th>
                            <th className="p-4 text-left">Category</th>
                            <th className="p-4 text-left">Priority</th>
                            <th className="p-4 text-left">Status</th>
                            <th className="p-4 rounded-r-xl text-center pr-6">Action</th>
                        </tr>
                        </thead>
                        <tbody>
                        {loading ? (
                            <tr><td colSpan="6" className="text-center py-20"><Loader2 className="animate-spin mx-auto text-[#004A7C]" size={30} /></td></tr>
                        ) : tasks.map((task) => (
                            <tr key={task._id} className="bg-white shadow-sm hover:shadow-md transition-shadow">
                                <td className="p-4 pl-6 font-bold text-[#004A7C] text-xs rounded-l-xl border-y border-l border-slate-50">
                                    {task.issueId}
                                </td>
                                <td className="p-4 border-y border-slate-50">
                                    <p className="font-bold text-slate-700 text-xs">{task.systemName}</p>
                                    <p className="text-[10px] text-slate-400">Web App</p>
                                </td>
                                <td className="p-4 border-y border-slate-50 text-slate-600 text-xs">
                                    {task.category}
                                </td>
                                <td className={`p-4 border-y border-slate-50 font-bold text-xs ${task.priority === 'Critical' ? 'text-red-500' : 'text-orange-400'}`}>
                                    {task.priority}
                                </td>
                                <td className="p-4 border-y border-slate-50">
                                        <span className={`px-4 py-1 rounded-full text-[9px] font-black inline-block min-w-[80px] text-center ${getStatusStyle(task.status)}`}>
                                            {task.status}
                                        </span>
                                </td>
                                <td className="p-4 pr-6 border-y border-r border-slate-50 rounded-r-xl text-center">
                                    <button
                                        onClick={() => { setSelectedTask(task); setViewMode('details'); }}
                                        className="text-[#004A7C] hover:scale-110 transition-transform inline-block"
                                    >
                                        <Eye size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Placeholder (As seen in Figma) */}
                <div className="flex justify-end mt-6 gap-2 text-[10px] font-bold text-slate-400">
                    <span>Back</span>
                    <span className="bg-[#004A7C] text-white px-2 rounded">1</span>
                    <span>2</span>
                    <span>3</span>
                    <span>Next</span>
                </div>
            </div>
        );
    }

    // --- VIEW 2: TASK DETAILS (SPLIT VIEW) ---
    return (
        <div className="w-full animate-in fade-in duration-300">
            <div className="flex flex-col lg:flex-row gap-6">

                {/* Left Column: Main Ticket Content */}
                <div className="flex-[2.5]">
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                        {/* Ticket Header */}
                        <div className="bg-[#004A7C] text-white p-4 flex justify-between items-center">
                            <span className="font-bold text-sm">{selectedTask?.issueId}</span>
                            <button onClick={() => setViewMode('list')} className="hover:bg-white/10 p-1 rounded transition-colors"><X size={18} /></button>
                        </div>

                        <div className="p-6">
                            {/* Stats Grid */}
                            <div className="grid grid-cols-4 gap-8 mb-10">
                                <div>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Category</p>
                                    <p className="text-xs font-bold text-[#004A7C] mt-1">{selectedTask?.category}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Reported By</p>
                                    <p className="text-xs font-bold text-[#004A7C] mt-1">{selectedTask?.reportedBy || 'Amele Worku'}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Reported Date</p>
                                    <p className="text-xs font-bold text-[#004A7C] mt-1">20/04/2024</p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Status</p>
                                    <p className="text-xs font-bold text-[#004A7C] mt-1">{selectedTask?.status}</p>
                                </div>
                            </div>

                            {/* Assignments */}
                            <div className="flex gap-4 mb-10">
                                <div className="flex-1 bg-slate-50 p-4 rounded-lg flex justify-between items-center border-l-4 border-blue-200">
                                    <span className="text-[11px] font-bold text-[#004A7C]">Assigned QA Officer:</span>
                                    <span className="text-[11px] text-slate-500 font-medium">Mena Wolke</span>
                                </div>
                                <div className="flex-1 bg-green-50 p-4 rounded-lg flex justify-between items-center border-l-4 border-green-200">
                                    <span className="text-[11px] font-bold text-[#004A7C]">Assigned Developer:</span>
                                    <span className="text-[11px] text-slate-500 font-medium">Abebe Kebede</span>
                                </div>
                            </div>

                            {/* Documents Section */}
                            <div className="mb-12">
                                <h3 className="text-[11px] font-bold text-[#004A7C] mb-4">Attached Documents</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {[1, 2].map((_, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-3 border border-slate-100 rounded-xl bg-white hover:bg-slate-50 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <FileText size={20} className="text-slate-300" />
                                                <div>
                                                    <p className="text-[11px] font-bold text-[#004A7C]">crashing-log.pdf</p>
                                                    <p className="text-[9px] text-slate-400">pdf - 11/12/2023, 11:00 PM</p>
                                                </div>
                                            </div>
                                            <button className="text-[10px] border border-slate-200 px-4 py-1 rounded-lg text-slate-500 font-bold hover:bg-white shadow-sm">View</button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex justify-between items-center pt-8 border-t border-slate-50">
                                <button onClick={() => setViewMode('list')} className="px-10 py-2 border border-slate-200 rounded-lg text-xs font-bold text-slate-500 hover:bg-slate-50">Cancel</button>
                                <button className="px-10 py-2 bg-[#004A7C] text-white rounded-lg text-xs font-bold shadow-lg shadow-blue-900/10 hover:bg-[#003d66]">Approve</button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Quick Actions & Side Cards */}
                <div className="flex-1 space-y-6">
                    {/* Quick Actions Card */}
                    <div className="bg-[#004A7C] rounded-xl overflow-hidden shadow-sm">
                        <div className="px-4 py-3 text-white text-[11px] font-bold">Quick Actions</div>
                        <div className="p-4 bg-white">
                            <button className="w-full py-2.5 border-2 border-[#004A7C] text-[#004A7C] rounded-lg flex items-center justify-center gap-2 text-[11px] font-bold hover:bg-blue-50 transition-all">
                                <Video size={16} /> Start Video Call
                            </button>
                        </div>
                    </div>

                    {/* Developer Fix Report (Second Image Discrepancy Fix) */}
                    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                        <div className="px-4 py-3 border-b border-slate-50 flex justify-between items-center bg-white">
                            <span className="text-[10px] font-black text-[#004A7C] uppercase">Developer Fix Report</span>
                            <div className="p-1 border rounded-md"><ChevronDown size={12} className="text-slate-400" /></div>
                        </div>
                        <div className="p-5 text-[10px] text-slate-500 space-y-4">
                            <div className="space-y-1">
                                <p className="text-slate-400">Organization Name:</p>
                                <p className="text-slate-700 font-bold">Addis Ababa City Administration</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-slate-400">System Name:</p>
                                <p className="text-slate-700 font-bold">EAII AI Bugzilla</p>
                            </div>
                            <div className="pt-2 border-t border-slate-50">
                                <p className="font-bold text-[#004A7C] mb-2">Fix Description:</p>
                                <p className="leading-relaxed italic">The issue was identified in the auth module. Updated the logic to handle missing credentials and secured the token exchange mechanism.</p>
                            </div>
                        </div>
                    </div>

                    {/* History Section (Third Image) */}
                    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                        <div className="bg-[#004A7C] px-4 py-3 text-white text-[11px] font-bold">History</div>
                        <div className="p-5 space-y-5">
                            {[
                                { title: 'Issue Created', desc: 'Initial report submitted by Amele Worku', time: '11/12/2023, 11:00 PM' },
                                { title: 'Escalated to QA', desc: 'Beyond local capacity by Tigist Mulukan', time: '11/12/2023, 12:00 PM' }
                            ].map((log, idx) => (
                                <div key={idx} className="flex gap-3 relative">
                                    <div className="mt-1 bg-blue-50 p-1.5 rounded-full"><Clock size={12} className="text-[#004A7C]"/></div>
                                    <div className="flex-1 pb-2 border-b border-slate-50 last:border-0">
                                        <p className="text-[10px] font-bold text-slate-700">{log.title}</p>
                                        <p className="text-[9px] text-slate-400 mt-0.5">{log.desc}</p>
                                        <p className="text-[8px] text-slate-300 mt-1">{log.time}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default TasksList;