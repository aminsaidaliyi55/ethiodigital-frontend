import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { Plus, Loader2, Layers, Printer, BarChart3, Target, Briefcase, CheckSquare } from "lucide-react";
import * as api from "../../services/activityService";
import * as projectApi from "../../services/projectService";
import * as userApi from "../../services/userService";

import ActivityTable from "./ActivityTable";
import ArchitectureModal from "./ArchitectureModal";
import { ProgressBar, ProjectSelector } from "./UIComponents";
import toast from "react-hot-toast";

export default function ProjectActivitiesPage() {
    const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
    const userRole = currentUser.role?.toUpperCase();
    const userRoles = (currentUser.roles || []).map(r => r.toUpperCase());

    // --- PERMISSION SEPARATION ---
    const canManageActivities =
        userRole === "PROJECT_MANAGER" ||
        userRoles.includes("PROJECT_MANAGER");

    const canManageTasks =
        userRole === "TECHNICAL MANAGER" ||
        userRoles.includes("TECHNICAL MANAGER");

    const isRestricted = !canManageActivities && !canManageTasks;

    // --- STATE ---
    const [activities, setActivities] = useState([]);
    const [projects, setProjects] = useState([]);
    const [availableUsers, setAvailableUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [pendingActivities, setPendingActivities] = useState([]);
    const [selectedProjectId, setSelectedProjectId] = useState("");
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const searchRef = useRef(null);

    const loadActivities = useCallback(async (projectId) => {
        if (!projectId) return;
        try {
            const data = await api.getProjectActivities(projectId);
            setActivities(Array.isArray(data.activities) ? data.activities : []);
        } catch (err) {
            console.error("Failed to load activities", err);
            setActivities([]);
        }
    }, []);

    const handleDeleteActivity = async (activityId) => {
        if (!canManageActivities) return toast.error("Only Project Managers can remove Activities.");
        if (!window.confirm("Are you sure you want to delete this activity? This will remove all nested tasks.")) return;

        const tid = toast.loading("Deleting activity...");
        try {
            await api.deleteActivity(activityId);
            setActivities(prev => prev.filter(a => a.id !== activityId));
            toast.success("Activity deleted", { id: tid });
        } catch (err) {
            toast.error("Failed to delete activity.", { id: tid });
        }
    };

    const handleDeleteTask = async (taskId) => {
        if (!canManageTasks) return toast.error("Only Technical Managers can remove Tasks.");

        const tid = toast.loading("Deleting task...");
        try {
            await api.deleteTask(taskId);
            toast.success("Task deleted", { id: tid });
            if (selectedProjectId) loadActivities(selectedProjectId);
        } catch (err) {
            toast.error("Error deleting task.", { id: tid });
        }
    };

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                setLoading(true);
                const [projData, userData] = await Promise.all([
                    projectApi.getProjects(),
                    userApi.getUsers()
                ]);
                setProjects(projData || []);
                setAvailableUsers(userData || []);
                if (projData?.length > 0) {
                    setSelectedProjectId(projData[0].id);
                    loadActivities(projData[0].id);
                }
            } catch (err) {
                toast.error("Failed to load project data.");
            } finally {
                setLoading(false);
            }
        };
        fetchInitialData();
    }, [loadActivities]);

    useEffect(() => {
        if (selectedProjectId) loadActivities(selectedProjectId);
    }, [selectedProjectId, loadActivities]);

    const stats = useMemo(() => {
        let totalWeightedProgress = 0;
        let totalGlobalWeight = 0;

        activities.forEach(act => {
            totalGlobalWeight += Number(act.weight || 0);
            act.tasks?.forEach(t => {
                totalWeightedProgress += (Number(t.progress) * (Number(t.weight) / 100));
            });
        });

        const overall = activities.length > 0 ? totalWeightedProgress / activities.length : 0;

        return {
            overallProgress: Math.min(overall, 100),
            activityCount: activities.length,
            taskCount: activities.reduce((acc, act) => acc + (act.tasks?.length || 0), 0),
            // Check if weights have reached 100%
            isPlanFull: totalGlobalWeight >= 99.99
        };
    }, [activities]);

    const selectedProject = projects.find(p => String(p.id) === String(selectedProjectId));

    if (loading) return (
        <div className="flex h-screen flex-col items-center justify-center bg-slate-50 dark:bg-slate-950">
            <Loader2 className="animate-spin text-indigo-900 dark:text-indigo-400 mb-4" size={32} />
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Synchronizing Workspace...</p>
        </div>
    );

    return (
        <div className="p-4 bg-slate-50 dark:bg-slate-950 min-h-screen font-sans w-full">

            {/* --- HEADER --- */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 no-print gap-6">
                <div className="space-y-4 w-full md:w-auto">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-indigo-900 dark:bg-indigo-900 rounded-xl text-white shadow-lg">
                            <CheckSquare size={24} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black tracking-tighter text-indigo-900 dark:text-white uppercase">Project Work Plan</h1>
                            <p className="text-slate-400 dark:text-slate-500 text-[8px] font-black uppercase tracking-[0.2em] mt-1">Activities & Task Management</p>
                        </div>
                    </div>
                    <ProjectSelector
                        projects={projects}
                        selectedProjectId={selectedProjectId}
                        setSelectedProjectId={setSelectedProjectId}
                        isSearchOpen={isSearchOpen}
                        setIsSearchOpen={setIsSearchOpen}
                        searchTerm={searchTerm}
                        setSearchTerm={setSearchTerm}
                        searchRef={searchRef}
                    />
                </div>

                <div className="flex gap-2 w-full md:w-auto">
                    <button onClick={() => window.print()} className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-400 hover:text-indigo-900 transition-all shadow-sm">
                        <Printer size={20} />
                    </button>

                    {/* Button only shows if user is PM AND the weight plan is NOT yet 100% */}
                    {canManageActivities && !stats.isPlanFull && (
                        <button
                            onClick={() => {
                                setIsEditing(false);
                                setPendingActivities([{ tempId: Date.now(), description: "", weight: 0, tasks: [] }]);
                                setShowModal(true);
                            }}
                            className="bg-indigo-900 dark:bg-indigo-900 text-white px-8 py-3.5 rounded-xl font-black text-[9px] uppercase tracking-widest shadow-xl hover:bg-indigo-800 transition-all flex items-center gap-2"
                        >
                            <Plus size={16}/> Add Activity
                        </button>
                    )}

                    {/* Optional: Show a "Plan Finalized" badge if weight is 100% */}
                    {stats.isPlanFull && canManageActivities && (
                        <div className="px-6 py-3.5 border-2 border-dashed border-emerald-500/30 rounded-xl flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Plan 100% Allocated</span>
                        </div>
                    )}
                </div>
            </header>

            {/* --- SUMMARY --- */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 no-print">
                <StatCard icon={BarChart3} label="Overall Progress" value={`${stats.overallProgress.toFixed(1)}%`} subtext="Completion Status">
                    <ProgressBar progress={stats.overallProgress} color="indigo" />
                </StatCard>
                <StatCard icon={Target} label="Key Activities" value={stats.activityCount} subtext="Assigned by PM" />
                <StatCard icon={Briefcase} label="Task Breakdowns" value={stats.taskCount} subtext="Handled by Technical Lead" />
            </div>

            {/* --- TABLE --- */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden mb-12">
                <div className="px-8 py-5 bg-indigo-900 dark:bg-slate-800 flex justify-between items-center">
                    <h3 className="font-black text-white uppercase text-[9px] tracking-widest flex items-center gap-2">
                        <Layers size={14}/> Project Schedule
                    </h3>
                </div>
                <div className="dark:text-slate-300">
                    <ActivityTable
                        activities={activities}
                        availableUsers={availableUsers}
                        isRestricted={isRestricted}
                        onEdit={(activity) => {
                            setIsEditing(true);
                            setPendingActivities([{
                                ...activity,
                                tempId: activity.id,
                                tasks: activity.tasks.map(t => ({ ...t, tempId: t.id }))
                            }]);
                            setShowModal(true);
                        }}
                        onDelete={handleDeleteActivity}
                        onDeleteTask={handleDeleteTask}
                    />
                </div>
            </div>

            {showModal && (
                <ArchitectureModal
                    isOpen={showModal}
                    isEditing={isEditing}
                    pendingActivities={pendingActivities}
                    setPendingActivities={setPendingActivities}
                    availableUsers={availableUsers}
                    projectId={selectedProjectId}
                    projectTitle={selectedProject?.title}
                    onClose={() => setShowModal(false)}
                    onSaveSuccess={() => loadActivities(selectedProjectId)}
                    canManageActivities={canManageActivities}
                    canManageTasks={canManageTasks}
                />
            )}
        </div>
    );
}

const StatCard = ({ icon: Icon, label, value, subtext, children }) => (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
            <Icon size={14} className="text-indigo-900 dark:text-indigo-400" />
            <p className="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{label}</p>
        </div>
        <p className="text-2xl font-black text-indigo-900 dark:text-white mb-1">{value}</p>
        {children}
        <p className="text-[7px] font-bold text-slate-400 uppercase mt-2 tracking-wide">{subtext}</p>
    </div>
);