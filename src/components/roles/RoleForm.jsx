import React from 'react';
import { Check, ShieldCheck, Lock, Unlock, CheckSquare, Square } from "lucide-react";

const ACTIONS = [
    'CREATE', 'UPDATE', 'VIEW', 'DELETE', 'APPROVE', 'ASSIGN', 'ENABLE/DISABLE', 'PRINT/EXPORT'
];

const CATEGORIES = [
    { label: 'Analytics Dashboard', id: 'DASHBOARD' },
    { label: 'Digital Archive', id: 'DOCUMENTS' },
    { label: 'Federal Level', id: 'HIERARCHY_FEDERAL' },
    { label: 'Regional States', id: 'HIERARCHY_REGIONS' },
    { label: 'Zones & Cities', id: 'HIERARCHY_ZONES' },
    { label: 'Woredas', id: 'HIERARCHY_WOREDAS' },
    { label: 'Kebeles', id: 'HIERARCHY_KEBELES' },
    { label: 'Staff Accounts', id: 'USERS' },
    { label: 'Access Control', id: 'ROLES' },
    { label: 'Departmental Map', id: 'ORG_STRUCTURE' },
    { label: 'Active Shop List', id: 'SHOPS' },
    { label: 'Trade Licenses', id: 'LICENSING' },
    { label: 'Strategic Stock', id: 'STOCK' },
    { label: 'Price Monitoring', id: 'PRICES' },
    { label: 'Site Inspections', id: 'AUDIT' },
    { label: 'Violation Records', id: 'VIOLATIONS' }
];

export function RoleForm({ form, setForm, mode }) {
    const isViewOnly = mode === 'view';

    const getPermString = (catId, action) => {
        const sanitizedAction = action.toUpperCase().replace(/[\/\s-]/g, '_');
        return `${catId}_${sanitizedAction}`;
    };

    const hasPermission = (catId, action) => {
        const permString = getPermString(catId, action);
        return form.permissions.some(p => (typeof p === 'string' ? p : p.name) === permString);
    };

    const togglePermission = (catId, action) => {
        if (isViewOnly) return;
        const permString = getPermString(catId, action);
        const currentPerms = [...form.permissions];
        const normalized = currentPerms.map(p => typeof p === 'string' ? p : p.name);

        const index = normalized.indexOf(permString);
        if (index > -1) {
            currentPerms.splice(index, 1);
        } else {
            currentPerms.push(permString);
        }
        setForm({ ...form, permissions: currentPerms });
    };

    const toggleRow = (catId) => {
        if (isViewOnly) return;
        const rowPerms = ACTIONS.map(action => getPermString(catId, action));
        const currentPerms = form.permissions.map(p => typeof p === 'string' ? p : p.name);
        const allSelected = rowPerms.every(p => currentPerms.includes(p));

        const newPerms = allSelected
            ? currentPerms.filter(p => !rowPerms.includes(p))
            : Array.from(new Set([...currentPerms, ...rowPerms]));

        setForm({ ...form, permissions: newPerms });
    };

    const toggleAll = (selectAll) => {
        if (isViewOnly) return;
        if (selectAll) {
            const allPerms = [];
            CATEGORIES.forEach(cat => {
                ACTIONS.forEach(action => {
                    allPerms.push(getPermString(cat.id, action));
                });
            });
            setForm({ ...form, permissions: allPerms });
        } else {
            setForm({ ...form, permissions: [] });
        }
    };

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                        {isViewOnly ? <Lock size={12} /> : <Unlock size={12} className="text-indigo-900" />}
                        Authority Identity
                    </label>
                    <input
                        disabled={isViewOnly}
                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-5 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-900 transition-all dark:text-white"
                        placeholder="e.g. Regional Administrator"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Grant Summary</label>
                    <div className="flex items-center justify-between bg-indigo-50/50 dark:bg-indigo-900/5 border border-indigo-100 dark:border-indigo-900/20 rounded-xl px-5 py-3">
                        <div className="flex items-center gap-3">
                            <ShieldCheck className="text-indigo-900" size={18} />
                            <p className="text-[11px] font-black text-indigo-900 dark:text-white uppercase">
                                {form.permissions.length} Active Grants
                            </p>
                        </div>

                        {!isViewOnly && (
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => toggleAll(true)}
                                    className="text-[8px] font-black uppercase px-2 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded hover:bg-indigo-900 hover:text-white transition-all flex items-center gap-1"
                                >
                                    <CheckSquare size={10} /> Select All
                                </button>
                                <button
                                    type="button"
                                    onClick={() => toggleAll(false)}
                                    className="text-[8px] font-black uppercase px-2 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded hover:bg-red-600 hover:text-white transition-all flex items-center gap-1"
                                >
                                    <Square size={10} /> Deselect All
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-950">
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                        <tr className="bg-indigo-900">
                            <th className="p-4 text-left border-r border-white/10 min-w-[250px]">
                                <span className="text-[9px] font-black uppercase tracking-widest text-white">Functional System Category</span>
                            </th>
                            {ACTIONS.map(action => (
                                <th key={action} className="p-3 text-center text-[8px] font-black uppercase tracking-tight text-white border-r border-white/5 last:border-0">
                                    {action}
                                </th>
                            ))}
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-900">
                        {CATEGORIES.map((cat) => (
                            <tr key={cat.id} className="group hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                                <td className="p-4 border-r border-slate-100 dark:border-slate-800 bg-slate-50/30">
                                    <div className="flex items-center justify-between gap-4">
                                            <span className="text-[10px] font-black text-slate-700 dark:text-slate-300 uppercase">
                                                {cat.label}
                                            </span>
                                        {!isViewOnly && (
                                            <button
                                                type="button"
                                                onClick={() => toggleRow(cat.id)}
                                                className="text-[7px] font-black uppercase bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-400 px-2 py-1 rounded shadow-sm hover:bg-indigo-900 hover:text-white transition-all"
                                            >
                                                Row Toggle
                                            </button>
                                        )}
                                    </div>
                                </td>
                                {ACTIONS.map((action) => {
                                    const active = hasPermission(cat.id, action);
                                    return (
                                        <td key={action} className="p-3 text-center border-r border-slate-50 dark:border-slate-800 last:border-0">
                                            <div className="flex justify-center items-center">
                                                {isViewOnly ? (
                                                    active ? <Check className="text-emerald-500" size={16} strokeWidth={4} /> : <span className="text-slate-200 dark:text-slate-800 font-light text-xs">/</span>
                                                ) : (
                                                    <button
                                                        type="button"
                                                        onClick={() => togglePermission(cat.id, action)}
                                                        className={`w-5 h-5 rounded border-2 transition-all flex items-center justify-center ${active ? 'bg-emerald-500 border-emerald-500 text-white shadow-sm' : 'border-slate-200 dark:border-slate-800 hover:border-indigo-900'}`}
                                                    >
                                                        {active && <Check size={12} strokeWidth={4} />}
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}