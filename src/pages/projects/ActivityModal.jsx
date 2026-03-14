import React, { useMemo } from "react";
import { X, Plus, Trash2, AlertTriangle, Layers, ShieldCheck, Cpu } from "lucide-react";
import * as api from "../../services/activityService";

export default function ArchitectureModal({
                                              isOpen,
                                              onClose,
                                              pendingActivities,
                                              setPendingActivities,
                                              projectId,
                                              projectTitle,
                                              onSaveSuccess,
                                              isEditing
                                          }) {
    if (!isOpen) return null;

    // --- 1. ARCHITECTURE MATH ENGINE ---
    const projectStats = useMemo(() => {
        let totalProjectWeight = 0;
        let weightedGlobalProgress = 0;

        const processedActivities = (pendingActivities || []).map(act => {
            const activityWeight = act.tasks.reduce((sum, t) => sum + Number(t.weight || 0), 0);
            const rawProgress = activityWeight > 0
                ? act.tasks.reduce((sum, t) => sum + (Number(t.progress || 0) * (Number(t.weight || 0) / activityWeight)), 0)
                : 0;

            const activityProgress = Math.min(rawProgress, 100);
            totalProjectWeight += activityWeight;
            weightedGlobalProgress += (activityProgress * (activityWeight / 100));

            return { ...act, calculatedWeight: activityWeight, calculatedProgress: activityProgress };
        });

        return {
            processedActivities,
            totalWeight: totalProjectWeight,
            globalProgress: Math.min(weightedGlobalProgress, 100),
            isValid: Math.abs(totalProjectWeight - 100) < 0.01
        };
    }, [pendingActivities]);

    // --- 2. LOGIC HANDLERS ---
    const updateTask = (phaseTempId, taskTempId, field, value) => {
        let finalValue = value;
        if (field === 'weight' || field === 'progress') {
            finalValue = Math.max(0, Math.min(100, Number(value)));
        }

        setPendingActivities(prev => prev.map(a => {
            if (a.tempId === phaseTempId) {
                const updatedTasks = a.tasks.map(t => t.tempId === taskTempId ? { ...t, [field]: finalValue } : t);
                return { ...a, tasks: updatedTasks };
            }
            return a;
        }));
    };

    const addTask = (phaseTempId) => {
        setPendingActivities(prev => prev.map(a => {
            if (a.tempId === phaseTempId) {
                return {
                    ...a,
                    tasks: [...a.tasks, { tempId: Date.now(), title: "", weight: 0, progress: 0, end_date: "" }]
                };
            }
            return a;
        }));
    };

    const handleSave = async () => {
        if (!projectStats.isValid) return;
        try {
            const user = JSON.parse(localStorage.getItem("user") || "{}");
            for (const act of projectStats.processedActivities) {
                const actData = {
                    description: act.description,
                    weight: act.calculatedWeight,
                    user_id: user.id,
                    project_id: projectId
                };

                const actRes = act.id && !String(act.id).includes('temp')
                    ? await api.updateActivity(act.id, actData)
                    : await api.createProjectActivity(projectId, actData);

                const actId = act.id && !String(act.id).includes('temp') ? act.id : actRes.id;
                await Promise.all(act.tasks.map(t => api.createActivityTask(actId, t)));
            }
            onSaveSuccess();
            onClose();
        } catch (err) {
            console.error("Save Error:", err);
        }
    };

    return (
        <div className="fixed inset-0 bg-indigo-950/80 backdrop-blur-sm z-[200] flex items-center justify-center p-6">
            <div className="bg-white w-full max-w-6xl rounded-[2.5rem] shadow-[0_35px_60px_-15px_rgba(30,27,75,0.3)] max-h-[90vh] overflow-hidden flex flex-col border border-indigo-900/10">

                {/* --- CONSOLE HEADER --- */}
                <div className="px-10 py-8 border-b bg-slate-50 flex justify-between items-center">
                    <div className="flex items-center gap-6">
                        <div className="p-4 bg-indigo-900 rounded-2xl text-white shadow-xl shadow-indigo-900/20">
                            <Cpu size={28}/>
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-indigo-900 uppercase tracking-[0.2em] mb-1 opacity-60">System Configuration</p>
                            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight leading-none">{projectTitle || "Project Engine"}</h2>
                            <div className="flex items-center gap-4 mt-3">
                                <span className={`text-[8px] font-black px-3 py-1 rounded-md uppercase tracking-widest border ${projectStats.isValid ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100 animate-pulse'}`}>
                                    {projectStats.isValid ? 'Structure Validated' : 'Weight Imbalance'}
                                </span>
                                <div className="h-3 w-[1px] bg-slate-300" />
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                    Readiness: <span className="text-indigo-900 ml-1">{projectStats.globalProgress.toFixed(1)}%</span>
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className={`px-8 py-4 rounded-2xl border-2 flex flex-col items-center min-w-[180px] transition-all ${projectStats.isValid ? 'border-indigo-900 bg-indigo-50' : 'border-rose-200 bg-white'}`}>
                            <span className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Architecture Load</span>
                            <span className={`text-2xl font-black ${projectStats.isValid ? 'text-indigo-900' : 'text-rose-600'}`}>
                                {projectStats.totalWeight}% <span className="text-xs text-slate-400">/ 100</span>
                            </span>
                        </div>
                        <button onClick={onClose} className="p-3 bg-slate-100 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all">
                            <X size={20}/>
                        </button>
                    </div>
                </div>

                {/* --- MAIN ARCHITECTURE BUILDER --- */}
                <div className="flex-1 overflow-y-auto p-10 space-y-8 bg-white">
                    {projectStats.processedActivities.map((act) => (
                        <div key={act.tempId} className="bg-slate-50/50 rounded-[2rem] p-8 border border-slate-200 relative group transition-all hover:border-indigo-200">
                            <div className="flex justify-between items-start mb-10">
                                <div className="flex-1 mr-10">
                                    <label className="text-[9px] font-black text-indigo-900/40 uppercase mb-2 block ml-1 tracking-widest">Primary Node Identity</label>
                                    <input
                                        className="w-full p-5 bg-white border border-slate-200 rounded-2xl font-black text-lg uppercase tracking-tight text-indigo-900 outline-none focus:ring-4 ring-indigo-900/5 focus:border-indigo-900 transition-all shadow-sm"
                                        placeholder="E.G. DATA_CENTER_INFRASTRUCTURE"
                                        value={act.description}
                                        onChange={(e) => setPendingActivities(prev => prev.map(p => p.tempId === act.tempId ? {...p, description: e.target.value} : p))}
                                    />
                                </div>
                                <div className="text-right">
                                    <p className="text-[9px] font-black text-slate-400 uppercase mb-2 tracking-widest">Node Impact</p>
                                    <div className="bg-indigo-900 text-white px-8 py-5 rounded-2xl font-black text-xl shadow-lg shadow-indigo-900/20">
                                        {act.calculatedWeight}<span className="text-indigo-300 text-sm ml-1">%</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 mb-5 px-2">
                                <ShieldCheck size={16} className="text-indigo-900" />
                                <span className="text-[10px] font-black text-indigo-900 uppercase tracking-widest">Sub-Component Dependencies</span>
                            </div>

                            {/* --- COMPONENT GRID --- */}
                            <div className="space-y-3 bg-white p-5 rounded-[1.5rem] border border-slate-200 shadow-inner">
                                {act.tasks.map((task) => (
                                    <div key={task.tempId} className="grid grid-cols-12 gap-4 items-center bg-slate-50 p-3 rounded-xl hover:bg-indigo-50/50 transition-colors border border-transparent hover:border-indigo-100">
                                        <div className="col-span-5">
                                            <input
                                                className="w-full bg-white p-3 rounded-lg border border-slate-200 text-[11px] font-bold uppercase text-slate-700 outline-none focus:border-indigo-900"
                                                placeholder="Component identifier..."
                                                value={task.title}
                                                onChange={(e) => updateTask(act.tempId, task.tempId, 'title', e.target.value)}
                                            />
                                        </div>
                                        <div className="col-span-2 relative">
                                            <label className="absolute -top-7 left-0 text-[7px] font-black text-slate-400 uppercase tracking-widest">Weight (%)</label>
                                            <input
                                                type="number"
                                                className="w-full bg-white p-3 rounded-lg text-center font-black text-indigo-900 border border-slate-200 outline-none"
                                                value={task.weight}
                                                onChange={(e) => updateTask(act.tempId, task.tempId, 'weight', e.target.value)}
                                            />
                                        </div>
                                        <div className="col-span-2 relative">
                                            <label className="absolute -top-7 left-0 text-[7px] font-black text-slate-400 uppercase tracking-widest">Status (%)</label>
                                            <input
                                                type="number"
                                                className="w-full bg-white p-3 rounded-lg text-center font-black text-emerald-600 border border-slate-200 outline-none"
                                                value={task.progress}
                                                onChange={(e) => updateTask(act.tempId, task.tempId, 'progress', e.target.value)}
                                            />
                                        </div>
                                        <div className="col-span-2">
                                            <input
                                                type="date"
                                                className="w-full bg-white p-3 rounded-lg border border-slate-200 text-[9px] font-black uppercase text-slate-600"
                                                value={task.end_date}
                                                onChange={(e) => updateTask(act.tempId, task.tempId, 'end_date', e.target.value)}
                                            />
                                        </div>
                                        <div className="col-span-1 flex justify-center">
                                            <button
                                                onClick={() => setPendingActivities(prev => prev.map(p => p.tempId === act.tempId ? {...p, tasks: p.tasks.filter(t => t.tempId !== task.tempId)} : p))}
                                                className="p-2 text-slate-300 hover:text-rose-600 hover:bg-white rounded-lg transition-all shadow-sm"
                                            >
                                                <Trash2 size={16}/>
                                            </button>
                                        </div>
                                    </div>
                                ))}

                                <button
                                    onClick={() => addTask(act.tempId)}
                                    className="w-full py-4 border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center gap-3 text-[10px] font-black text-slate-400 hover:bg-indigo-50 hover:border-indigo-900/30 hover:text-indigo-900 transition-all uppercase tracking-[0.2em]"
                                >
                                    <Plus size={14} /> Add New Sub-Component
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* --- SYSTEM CONTROL FOOTER --- */}
                <div className="px-10 py-8 bg-slate-50 border-t border-slate-200 flex justify-between items-center">
                    <div className="flex items-center gap-5">
                        <div className={`p-4 rounded-2xl shadow-sm ${projectStats.isValid ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                            <AlertTriangle size={24}/>
                        </div>
                        <div>
                            <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${projectStats.isValid ? 'text-emerald-700' : 'text-rose-700'}`}>
                                {projectStats.isValid ? "Structural Integrity: Optimal" : "Structural Integrity: Critical Error"}
                            </p>
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">
                                {projectStats.isValid
                                    ? "Global load distribution verified at 100%."
                                    : `Architecture load imbalance. Correction required: ${Math.abs(100 - projectStats.totalWeight).toFixed(1)}%`}
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-6 items-center">
                        <button onClick={onClose} className="text-[10px] font-black text-slate-400 hover:text-indigo-900 uppercase tracking-[0.2em] transition-colors">Discard Engine State</button>
                        <button
                            disabled={!projectStats.isValid}
                            onClick={handleSave}
                            className={`px-12 py-5 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] transition-all shadow-2xl ${
                                projectStats.isValid
                                    ? 'bg-indigo-900 text-white shadow-indigo-900/30 hover:bg-slate-800 hover:-translate-y-1'
                                    : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                            }`}
                        >
                            Sync Architecture Engine
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}