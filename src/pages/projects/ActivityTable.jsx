import React, { useMemo, useState, useEffect } from "react";
import { Edit3, ChevronRight, Search, ChevronLeft, ChevronRight as ChevronRightIcon, User, Trash2, X, Layers, ChevronDown } from "lucide-react";
import { ProgressBar, StatusBadge } from "./UIComponents";

export default function ActivityTable({
                                          activities,
                                          activeFilter,
                                          onEdit,
                                          onDelete,
                                          onDeleteTask,
                                          availableUsers = [],
                                          canManageActivities = true,
                                          canManageTasks = true
                                      }) {
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    // State to track which activities are expanded
    const [expandedIds, setExpandedIds] = useState(new Set());
    const itemsPerPage = 5;

    const today = new Date().setHours(0, 0, 0, 0);

    const toggleExpand = (id) => {
        const next = new Set(expandedIds);
        if (next.has(id)) {
            next.delete(id);
        } else {
            next.add(id);
        }
        setExpandedIds(next);
    };

    const getDynamicColor = (progress) => {
        const isFinished = Number(progress) >= 99.9;
        return isFinished ? 'emerald' : 'indigo';
    };

    const getStatus = (act) => {
        const progress = act.tasks?.reduce((sum, t) => sum + (Number(t.progress) * (Number(t.weight) / 100)), 0) || 0;
        if (progress >= 99.9) return "completed";
        if (act.end_date && new Date(act.end_date) < today) return "overdue";
        return "pending";
    };

    const filteredActivities = useMemo(() => {
        let result = activities;
        if (activeFilter && activeFilter !== "All") {
            result = result.filter(act => getStatus(act) === activeFilter.toLowerCase());
        }

        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            result = result.filter(act =>
                act.description.toLowerCase().includes(q) ||
                act.tasks?.some(t => t.title.toLowerCase().includes(q))
            );
        }
        return result;
    }, [activities, activeFilter, searchQuery]);

    useEffect(() => { setCurrentPage(1); }, [activeFilter, searchQuery]);

    const totalPages = Math.ceil(filteredActivities.length / itemsPerPage) || 1;
    const paginated = filteredActivities.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const handleDeleteClick = (act) => {
        if (window.confirm(`Are you sure you want to delete "${act.description}" and all its tasks?`)) {
            onDelete(act.id);
        }
    };

    return (
        <div className="flex flex-col gap-6">
            {/* --- SEARCH --- */}
            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={16} />
                    <input
                        type="text"
                        placeholder="Search activities or tasks..."
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-3 pl-12 pr-4 text-[10px] font-black uppercase tracking-widest text-indigo-900 dark:text-indigo-400 outline-none focus:ring-4 ring-indigo-900/5 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* --- ACTIVITY TABLE --- */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                        <tr className="bg-indigo-900 dark:bg-indigo-950 text-white text-[8px] font-black uppercase tracking-[0.2em]">
                            <th className="px-10 py-5">Activity Details</th>
                            <th className="px-6 py-5 text-center">Weight</th>
                            <th className="px-6 py-5">Overall Progress</th>
                            <th className="px-10 py-5 text-right">Actions</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {paginated.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="py-24 text-center text-[10px] font-black uppercase text-slate-300 dark:text-slate-700 tracking-[0.3em] italic">
                                    No Activities Found.
                                </td>
                            </tr>
                        ) : (
                            paginated.map(act => {
                                const status = getStatus(act);
                                const progress = act.tasks?.reduce((s, t) => s + (Number(t.progress) * (Number(t.weight) / 100)), 0) || 0;
                                const mainColor = getDynamicColor(progress);
                                const isExpanded = expandedIds.has(act.id);

                                return (
                                    <React.Fragment key={act.id}>
                                        {/* Parent Activity Row */}
                                        <tr
                                            onClick={() => toggleExpand(act.id)}
                                            className="hover:bg-indigo-50/30 dark:hover:bg-indigo-900/10 group bg-slate-50/30 dark:bg-slate-800/20 transition-colors cursor-pointer"
                                        >
                                            <td className="px-10 py-6">
                                                <div className="flex items-center gap-2 mb-1">
                                                    {isExpanded ? <ChevronDown size={14} className="text-indigo-900" /> : <ChevronRightIcon size={14} className="text-indigo-900" />}
                                                    <Layers size={14} className="text-indigo-900 dark:text-indigo-400" />
                                                    <div className="font-black text-indigo-900 dark:text-indigo-300 text-[11px] uppercase tracking-tight">{act.description}</div>
                                                </div>
                                                <StatusBadge status={status} />
                                            </td>
                                            <td className="px-6 py-6 text-center font-black text-indigo-900 dark:text-indigo-400 text-[11px]">
                                                {act.weight}%
                                            </td>
                                            <td className="px-6 py-6">
                                                <div className="flex items-center gap-3">
                                                    <ProgressBar progress={progress} color={mainColor} />
                                                    <span className="text-[10px] font-black text-indigo-900 dark:text-indigo-400">{Math.round(progress)}%</span>
                                                </div>
                                            </td>
                                            <td className="px-10 py-6 text-right">
                                                <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                                                    {(canManageActivities || canManageTasks) && (
                                                        <button onClick={() => onEdit(act)} className="p-2 text-slate-400 hover:text-indigo-900 dark:hover:text-indigo-400 transition-colors" title="Edit Activity">
                                                            <Edit3 size={16} />
                                                        </button>
                                                    )}
                                                    {canManageActivities && (
                                                        <button onClick={() => handleDeleteClick(act)} className="p-2 text-slate-400 hover:text-rose-600 transition-colors" title="Delete Activity">
                                                            <Trash2 size={16} />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>

                                        {/* Task Rows (Conditional rendering) */}
                                        {isExpanded && act.tasks?.map(task => {
                                            const assignedUser = availableUsers.find(u => u.id?.toString() === task.assigned_to?.toString());

                                            return (
                                                <tr key={task.id} className="group/task animate-in slide-in-from-top-1 duration-200 bg-white dark:bg-slate-900 border-l-4 border-indigo-900/10 dark:border-indigo-500/10 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                                                    <td className="pl-16 py-3">
                                                        <div className="flex items-center gap-3">
                                                            <ChevronRight size={12} className="text-indigo-300 dark:text-indigo-700" />
                                                            <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-tight">{task.title}</span>
                                                        </div>
                                                        <div className="flex items-center gap-1.5 mt-1 ml-6">
                                                            <User size={10} className="text-slate-300 dark:text-slate-600" />
                                                            <span className="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest italic">
                                                                {assignedUser ? assignedUser.name : "No user assigned"}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-3 text-center text-indigo-400 dark:text-indigo-600 font-black text-[9px]">{task.weight}%</td>
                                                    <td className="px-6 py-3">
                                                        <div className="flex items-center gap-3">
                                                            <ProgressBar progress={task.progress} color={getDynamicColor(task.progress)} height="h-1" />
                                                            <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500">{Math.round(task.progress)}%</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-10 text-right">
                                                        {canManageTasks && (
                                                            <button
                                                                onClick={() => { if(window.confirm("Delete this task?")) onDeleteTask(task.id); }}
                                                                className="opacity-0 group-hover/task:opacity-100 p-2 text-slate-300 dark:text-slate-600 hover:text-rose-500 transition-all"
                                                                title="Delete Task"
                                                            >
                                                                <X size={12} />
                                                            </button>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </React.Fragment>
                                );
                            })
                        )}
                        </tbody>
                    </table>
                </div>

                {/* --- PAGINATION --- */}
                <div className="px-10 py-5 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between transition-colors">
                    <p className="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                        Page {currentPage} of {totalPages}
                    </p>
                    <div className="flex gap-1">
                        <button
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(c => c - 1)}
                            className="p-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg disabled:opacity-30 hover:border-indigo-900 dark:hover:border-indigo-500 transition-all shadow-sm"
                        >
                            <ChevronLeft size={16} className="text-slate-600 dark:text-slate-400" />
                        </button>
                        <button
                            disabled={currentPage >= totalPages}
                            onClick={() => setCurrentPage(c => c + 1)}
                            className="p-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg disabled:opacity-30 hover:border-indigo-900 dark:hover:border-indigo-500 transition-all shadow-sm"
                        >
                            <ChevronRightIcon size={16} className="text-slate-600 dark:text-slate-400" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}