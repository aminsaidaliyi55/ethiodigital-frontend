import React, { useMemo, useState } from "react";
import { X, Plus, Trash2, AlertTriangle, Layers, ShieldCheck, Info } from "lucide-react";
import * as api from "../../services/activityService";
import toast from "react-hot-toast";

export default function ArchitectureModal({
                                              isOpen,
                                              onClose,
                                              pendingActivities,
                                              setPendingActivities,
                                              projectId,
                                              projectTitle,
                                              onSaveSuccess,
                                              availableUsers = [],
                                          }) {
    const [activitiesToDelete, setActivitiesToDelete] = useState([]);
    const [tasksToDelete, setTasksToDelete] = useState([]);

    const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
    const userRole = currentUser.role?.toUpperCase();

    // Permission Logic
    const isPM = userRole === "PROJECT_MANAGER" || userRole === "ADMIN" || userRole === "DEPUTY DIRECTOR";
    const isTM = userRole === "TECHNICAL MANAGER" || userRole === "PMO";

    const clamp = (val) => Math.min(100, Math.max(0, Number(val)));

    const projectStats = useMemo(() => {
        let totalGlobalWeight = 0;
        let anyMilestoneInvalid = false;

        const processedActivities = (pendingActivities || []).map(act => {
            const actWeight = Number(act.weight || 0);
            totalGlobalWeight += actWeight;

            const tasks = act.tasks || [];
            const taskWeightSum = tasks.reduce((sum, t) => sum + Number(t.weight || 0), 0);
            const isTaskSumCorrect = Math.abs(taskWeightSum - actWeight) < 0.01;

            if (!isTaskSumCorrect && (tasks.length > 0 || isTM)) {
                anyMilestoneInvalid = true;
            }

            return { ...act, weight: actWeight, taskWeightSum, isTaskSumCorrect };
        });

        const isGlobalSumValid = Math.abs(totalGlobalWeight - 100) < 0.01;

        let canDeploy = false;
        if (isPM) {
            canDeploy = isGlobalSumValid && processedActivities.length > 0;
        } else if (isTM) {
            canDeploy = !anyMilestoneInvalid && processedActivities.length > 0;
        }

        return {
            processedActivities,
            totalWeight: Number(totalGlobalWeight.toFixed(2)),
            isGlobalValid: isGlobalSumValid,
            areAllPartitionsValid: !anyMilestoneInvalid,
            isAtGlobalLimit: totalGlobalWeight >= 99.99,
            isSaveable: canDeploy
        };
    }, [pendingActivities, isPM, isTM]);

    if (!isOpen) return null;

    const addActivity = () => {
        if (!isPM || projectStats.isAtGlobalLimit) return;
        const remaining = Math.max(0, 100 - projectStats.totalWeight);
        const newAct = {
            tempId: `new-act-${Date.now()}`,
            description: "",
            weight: remaining,
            tasks: []
        };
        setPendingActivities([...pendingActivities, newAct]);
    };

    const removeActivity = (act) => {
        if (!isPM) return;
        if (act.id && !String(act.id).includes('temp')) {
            setActivitiesToDelete(prev => [...prev, act.id]);
        }
        setPendingActivities(prev => prev.filter(a => a.tempId !== act.tempId));
    };

    const updateActivity = (tempId, field, value) => {
        if (!isPM) return;
        setPendingActivities(prev => prev.map(act => {
            if (act.tempId === tempId) {
                let finalValue = value;
                if (field === 'weight') {
                    const otherSum = prev
                        .filter(a => a.tempId !== tempId)
                        .reduce((s, a) => s + Number(a.weight || 0), 0);
                    const maxAllowed = Math.max(0, 100 - otherSum);
                    finalValue = Math.min(clamp(value), maxAllowed);
                }
                return { ...act, [field]: finalValue };
            }
            return act;
        }));
    };

    const updateTask = (phaseTempId, taskTempId, field, value) => {
        if (!isTM) return;
        setPendingActivities(prev => prev.map(a => {
            if (a.tempId === phaseTempId) {
                const updatedTasks = (a.tasks || []).map(t => {
                    if (t.tempId === taskTempId) {
                        let finalVal = value;
                        if (field === 'weight') {
                            const others = (a.tasks || [])
                                .filter(tk => tk.tempId !== taskTempId)
                                .reduce((s, tk) => s + Number(tk.weight || 0), 0);
                            finalVal = Math.min(clamp(value), a.weight - others);
                        } else if (field === 'progress') {
                            finalVal = clamp(value);
                        }
                        return { ...t, [field]: finalVal };
                    }
                    return t;
                });
                return { ...a, tasks: updatedTasks };
            }
            return a;
        }));
    };

    const removeTask = (phaseTempId, task) => {
        if (!isTM) return;
        if (task.id && !String(task.id).includes('temp')) {
            setTasksToDelete(prev => [...prev, task.id]);
        }
        setPendingActivities(prev => prev.map(p =>
            p.tempId === phaseTempId
                ? { ...p, tasks: (p.tasks || []).filter(t => t.tempId !== task.tempId) }
                : p
        ));
    };

    const handleSave = async () => {
        if (!projectStats.isSaveable) return;
        const loadToast = toast.loading(isPM ? "Updating Roadmap..." : "Saving Task Data...");
        try {
            if (activitiesToDelete.length > 0) await Promise.all(activitiesToDelete.map(id => api.deleteActivity(id)));
            if (tasksToDelete.length > 0) await Promise.all(tasksToDelete.map(id => api.deleteActivityTask(id)));

            for (const act of projectStats.processedActivities) {
                const actData = { description: act.description, weight: act.weight, project_id: projectId };
                let currentActId = act.id;

                if (isPM) {
                    if (act.id && !String(act.id).includes('temp')) {
                        await api.updateActivity(act.id, actData);
                    } else {
                        const newAct = await api.createProjectActivity(projectId, actData);
                        currentActId = newAct.id;
                    }
                }

                if (isTM && act.tasks) {
                    await Promise.all(act.tasks.map(t => {
                        const tData = { ...t, activity_id: currentActId, project_id: projectId };
                        return (t.id && !String(t.id).includes('temp'))
                            ? api.updateActivityTask(t.id, tData)
                            : api.createActivityTask(currentActId, tData);
                    }));
                }
            }
            toast.success("Project structure updated", { id: loadToast });
            onSaveSuccess();
            onClose();
        } catch (err) {
            toast.error("Update failed.", { id: loadToast });
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-[200] flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-6xl rounded-[3rem] shadow-2xl max-h-[95vh] overflow-hidden flex flex-col border border-white/20">

                {/* Header */}
                <div className="px-12 py-10 border-b bg-indigo-50/50 flex justify-between items-center">
                    <div className="flex items-center gap-6">
                        <div className="p-4 bg-indigo-900 rounded-3xl text-white shadow-2xl rotate-3">
                            <Layers size={32}/>
                        </div>
                        <div>
                            <h2 className="text-3xl font-black uppercase tracking-tighter text-indigo-950">Project Roadmap</h2>
                            <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-[0.2em]">{projectTitle}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-4 bg-white shadow-sm border rounded-2xl hover:bg-rose-50 hover:text-rose-500 transition-all">
                        <X size={24}/>
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-12 space-y-10 custom-scrollbar">
                    <div className="flex gap-4 p-6 bg-blue-50 border border-blue-100 rounded-3xl items-center">
                        <Info className="text-blue-500" size={24} />
                        <p className="text-xs font-medium text-blue-900 leading-relaxed">
                            {isPM ? "PLANNING MODE (Admin/PM/Deputy): Milestone weights must total exactly 100%." : "UPDATE MODE: Task weights must match the milestone's total weight."}
                        </p>
                    </div>

                    {projectStats.processedActivities.map((act) => (
                        <div key={act.tempId} className="relative group">
                            {isPM && (
                                <button onClick={() => removeActivity(act)} className="absolute -right-4 -top-4 p-3 bg-white shadow-xl rounded-full text-rose-500 opacity-0 group-hover:opacity-100 transition-all border border-rose-100 z-10">
                                    <Trash2 size={18}/>
                                </button>
                            )}

                            <div className={`bg-slate-50 rounded-[2.5rem] p-1 border-2 transition-all ${!act.isTaskSumCorrect ? 'border-rose-200 shadow-lg shadow-rose-50' : 'border-transparent'}`}>
                                <div className="p-8 space-y-8">
                                    <div className="flex flex-col md:flex-row gap-6">
                                        <div className="flex-1">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Milestone Title</label>
                                            <input
                                                disabled={!isPM}
                                                placeholder="e.g., Phase 1: Planning & Design"
                                                className="w-full text-xl font-black uppercase bg-transparent border-b-2 border-slate-200 outline-none pb-2 transition-all disabled:text-indigo-900/60"
                                                value={act.description}
                                                onChange={(e) => updateActivity(act.tempId, 'description', e.target.value)}
                                            />
                                        </div>
                                        <div className="w-full md:w-32">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block text-center">Weight %</label>
                                            <input
                                                type="number"
                                                disabled={!isPM}
                                                className="w-full text-2xl font-black text-center text-indigo-900 bg-indigo-50 border-2 border-transparent rounded-2xl p-4 outline-none focus:border-indigo-500 disabled:opacity-50"
                                                value={act.weight}
                                                onChange={(e) => updateActivity(act.tempId, 'weight', e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <div className="bg-white rounded-[2rem] border border-slate-100 overflow-hidden shadow-inner">
                                        <div className="px-6 py-4 bg-slate-50/50 border-b flex justify-between items-center">
                                            <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">Task Breakdown</span>
                                            <span className={`text-[10px] font-black px-3 py-1 rounded-full ${act.isTaskSumCorrect ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                                                Allocated: {act.taskWeightSum}% / Goal: {act.weight}%
                                            </span>
                                        </div>

                                        <div className="p-4 space-y-3">
                                            {act.tasks?.map((task) => (
                                                <div key={task.tempId} className="flex flex-wrap md:flex-nowrap gap-3 items-center bg-slate-50/50 p-3 rounded-2xl border border-slate-100">
                                                    <input
                                                        disabled={!isTM}
                                                        placeholder="Describe task..."
                                                        className="flex-1 p-3 bg-white border rounded-xl text-xs font-bold disabled:bg-slate-50"
                                                        value={task.title}
                                                        onChange={(e) => updateTask(act.tempId, task.tempId, 'title', e.target.value)}
                                                    />
                                                    <select
                                                        disabled={!isTM}
                                                        className="w-full md:w-48 p-3 bg-white border rounded-xl text-[10px] font-black uppercase"
                                                        value={task.assigned_to || ""}
                                                        onChange={(e) => updateTask(act.tempId, task.tempId, 'assigned_to', e.target.value)}
                                                    >
                                                        <option value="">Select Assignee</option>
                                                        {availableUsers.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                                                    </select>
                                                    <div className="flex gap-2 items-center">
                                                        <div className="relative">
                                                            <input type="number" disabled={!isTM} className="w-20 p-3 bg-white border rounded-xl text-center text-xs font-black text-indigo-600 disabled:bg-slate-50" value={task.weight || 0} onChange={(e) => updateTask(act.tempId, task.tempId, 'weight', e.target.value)} />
                                                            <span className="absolute -top-2 left-2 bg-indigo-900 text-white text-[7px] px-1 rounded uppercase">Weight</span>
                                                        </div>
                                                        <div className="relative">
                                                            <input type="number" disabled={!isTM} className="w-20 p-3 bg-white border rounded-xl text-center text-xs font-black text-emerald-600 disabled:bg-slate-50" value={task.progress || 0} onChange={(e) => updateTask(act.tempId, task.tempId, 'progress', e.target.value)} />
                                                            <span className="absolute -top-2 left-2 bg-emerald-600 text-white text-[7px] px-1 rounded uppercase">Progress</span>
                                                        </div>
                                                    </div>
                                                    {isTM && <button onClick={() => removeTask(act.tempId, task)} className="p-2 text-slate-300 hover:text-rose-500 transition-colors"><X size={16}/></button>}
                                                </div>
                                            ))}

                                            {isTM && (
                                                <button
                                                    onClick={() => setPendingActivities(prev => prev.map(p => p.tempId === act.tempId ? {...p, tasks: [...(p.tasks || []), { tempId: Date.now(), title: "", weight: 0, progress: 0 }]} : p))}
                                                    className="w-full py-4 bg-white border-2 border-dashed border-slate-200 rounded-2xl flex items-center justify-center gap-3 text-[10px] font-black text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 transition-all uppercase"
                                                >
                                                    <Plus size={14} /> Add New Task
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}

                    {isPM && !projectStats.isAtGlobalLimit && (
                        <button
                            onClick={addActivity}
                            className="w-full py-10 border-4 border-dashed border-slate-100 rounded-[3rem] flex flex-col items-center justify-center gap-4 text-slate-300 hover:border-indigo-200 hover:text-indigo-400 transition-all"
                        >
                            <div className="p-4 bg-white shadow-lg rounded-full"><Plus size={32}/></div>
                            <span className="font-black uppercase tracking-[0.3em] text-xs">Add New Milestone</span>
                        </button>
                    )}
                </div>

                {/* Footer */}
                <div className="px-12 py-10 bg-slate-50 border-t flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="space-y-2">
                        <div className="flex items-center gap-4">
                            <div className={`h-4 w-4 rounded-full ${projectStats.isSaveable ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.4)]' : 'bg-rose-500 animate-pulse'}`} />
                            <span className="text-[11px] font-black uppercase tracking-widest text-slate-700">
                                {isPM ? `Roadmap Total: ${projectStats.totalWeight}% / 100%` : `Task Status: ${projectStats.areAllPartitionsValid ? 'Balanced' : 'Adjustment Needed'}`}
                            </span>
                        </div>
                        {(!projectStats.areAllPartitionsValid) && (
                            <div className="flex items-center gap-2 text-rose-500">
                                <AlertTriangle size={14}/>
                                <span className="text-[9px] font-black uppercase tracking-widest italic">Tasks must sum to match the milestone weight</span>
                            </div>
                        )}
                    </div>

                    <div className="flex gap-4 w-full md:w-auto">
                        <button onClick={onClose} className="flex-1 px-10 py-5 text-[10px] font-black uppercase text-slate-400 hover:text-slate-600 transition-colors">Cancel</button>
                        <button
                            disabled={!projectStats.isSaveable}
                            onClick={handleSave}
                            className={`flex-1 px-16 py-5 rounded-[1.5rem] font-black uppercase text-[10px] transition-all flex items-center justify-center gap-3 ${
                                projectStats.isSaveable
                                    ? 'bg-indigo-900 text-white shadow-2xl shadow-indigo-200 hover:-translate-y-1'
                                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                            }`}
                        >
                            <ShieldCheck size={18}/> {isPM ? 'Publish Roadmap' : 'Save Task Changes'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}