import React from "react";
import { Loader2, AlertCircle, Eye, Edit, Trash2, Shield } from "lucide-react";

export const RegistryTable = ({ columns, data, loading, onView, onEdit, onDelete }) => {
    if (loading) return (
        <div className="p-32 flex flex-col items-center justify-center gap-4 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800">
            <Loader2 className="animate-spin text-indigo-600" size={48} />
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] animate-pulse">Syncing Registry...</span>
        </div>
    );

    if (data.length === 0) return (
        <div className="p-32 flex flex-col items-center justify-center gap-4 text-center bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800">
            <div className="p-5 bg-slate-50 dark:bg-slate-800 rounded-2xl text-slate-200 dark:text-slate-700">
                <AlertCircle size={40} />
            </div>
            <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Null Set: No Records Available</span>
        </div>
    );

    return (
        <div className="w-full overflow-hidden">
            <table className="w-full border-separate border-spacing-y-4">
                <thead>
                <tr className="bg-indigo-900 dark:bg-indigo-900 text-white">
                    {columns.map((col, idx) => (
                        <th key={idx} className={`py-5 px-8 text-[10px] font-black uppercase tracking-widest ${idx === 0 ? 'rounded-l-2xl' : idx === columns.length - 1 ? 'rounded-r-2xl' : ''} ${col.align === 'right' ? 'text-right' : 'text-left'}`}>
                            {col.label}
                        </th>
                    ))}
                </tr>
                </thead>
                <tbody>
                {data.map((item, idx) => (
                    <tr key={item.id} className="bg-white dark:bg-slate-800/40 hover:bg-indigo-50/50 dark:hover:bg-indigo-500/5 transition-all group">
                        <td className="py-5 px-8 rounded-l-2xl border-y border-l border-slate-50 dark:border-slate-800 text-slate-300 font-black text-xs">
                            #{String(idx + 1).padStart(2, '0')}
                        </td>
                        <td className="py-5 px-8 border-y border-slate-50 dark:border-slate-800">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-indigo-50 dark:bg-indigo-500/10 rounded-lg text-indigo-600">
                                    <Shield size={14} />
                                </div>
                                <span className="font-black text-indigo-900 dark:text-slate-200 capitalize">{item.name}</span>
                            </div>
                        </td>
                        <td className="py-5 px-8 border-y border-slate-50 dark:border-slate-800 text-slate-500 font-medium text-xs italic">
                            {item.description || "No description"}
                        </td>
                        <td className="py-5 px-8 border-y border-slate-50 dark:border-slate-800 text-slate-400 font-bold text-[10px]">
                            {new Date(item.created_at || Date.now()).toLocaleDateString()}
                        </td>
                        <td className="py-5 px-8 border-y border-slate-50 dark:border-slate-800 text-center">
                                <span className="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border border-emerald-100 dark:border-emerald-500/20">
                                    Active
                                </span>
                        </td>
                        <td className="py-5 px-8 rounded-r-2xl border-y border-r border-slate-50 dark:border-slate-800 text-right">
                            <div className="flex justify-end gap-1">
                                <button onClick={() => onView(item)} className="p-2 text-slate-400 hover:text-indigo-600 transition-all"><Eye size={16} /></button>
                                <button onClick={() => onEdit(item)} className="p-2 text-slate-400 hover:text-indigo-600 transition-all"><Edit size={16} /></button>
                                <button onClick={() => onDelete(item)} className="p-2 text-slate-400 hover:text-red-500 transition-all"><Trash2 size={16} /></button>
                            </div>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
};