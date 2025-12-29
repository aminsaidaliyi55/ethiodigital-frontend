import React, { useEffect, useState } from "react";
import { Check, Shield } from "lucide-react";
import {
    fetchFederals, fetchRegions, fetchZones, fetchWoredas, fetchKebeles
} from "@/services/userService";

/* =========================================================
   SUB-COMPONENT: CustomCheckbox
   ========================================================= */
const CustomCheckbox = ({ checked, onChange, label, disabled = false }) => (
    <div
        className={`flex items-center gap-3 transition-all ${disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer group'}`}
        onClick={disabled ? null : onChange}
    >
        <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
            checked ? 'bg-[#004A7C] border-[#004A7C]' : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 group-hover:border-[#004A7C]'
        }`}>
            {checked && <Check size={12} className="text-white" strokeWidth={3} />}
        </div>
        {label && <span className="text-[11px] font-bold text-[#004A7C] dark:text-blue-400">{label}</span>}
    </div>
);

/* =========================================================
   MAIN EXPORT: UserForm
   ========================================================= */
const UserForm = ({ form, setForm, roles, readOnly = false, isCreate = false }) => {
    const [locations, setLocations] = useState({ federals: [], regions: [], zones: [], woredas: [], kebeles: [] });

    const labelClass = "text-[#004A7C] dark:text-blue-400 text-[11px] font-bold mb-1.5 block uppercase tracking-wider";
    const inputBase = "w-full bg-[#FDFDFD] dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md px-3 py-2 text-[11px] text-slate-500 dark:text-slate-300 focus:outline-none focus:border-[#004A7C] transition-all disabled:bg-slate-100 dark:disabled:bg-slate-800 disabled:cursor-not-allowed";

    // Location Fetching Logic
    useEffect(() => {
        fetchFederals().then(data => setLocations(prev => ({ ...prev, federals: data || [] })));
    }, []);

    useEffect(() => {
        if (form.federal_id) fetchRegions(form.federal_id).then(data => setLocations(prev => ({ ...prev, regions: data || [] })));
    }, [form.federal_id]);

    useEffect(() => {
        if (form.region_id) fetchZones(form.region_id).then(data => setLocations(prev => ({ ...prev, zones: data || [] })));
    }, [form.region_id]);

    useEffect(() => {
        if (form.zone_id) fetchWoredas(form.zone_id).then(data => setLocations(prev => ({ ...prev, woredas: data || [] })));
    }, [form.zone_id]);

    useEffect(() => {
        if (form.woreda_id) fetchKebeles(form.woreda_id).then(data => setLocations(prev => ({ ...prev, kebeles: data || [] })));
    }, [form.woreda_id]);

    const handleLocationChange = (field, value) => {
        if (readOnly) return;
        const resets = {
            federal_id: { region_id: "", zone_id: "", woreda_id: "", kebele_id: "" },
            region_id: { zone_id: "", woreda_id: "", kebele_id: "" },
            zone_id: { woreda_id: "", kebele_id: "" },
            woreda_id: { kebele_id: "" },
        };
        setForm({ ...form, [field]: value, ...(resets[field] || {}) });
    };

    return (
        <div className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 border-b border-dashed border-slate-200 dark:border-slate-800 pb-6">
                <div>
                    <label className={labelClass}>Full Name</label>
                    <input
                        disabled={readOnly}
                        className={inputBase}
                        placeholder="John Doe"
                        value={form.name || ""}
                        onChange={e => setForm({...form, name: e.target.value})}
                    />
                </div>

                {/* EMAIL FIELD ADDED HERE */}
                <div>
                    <label className={labelClass}>Email Address</label>
                    <input
                        type="email"
                        disabled={readOnly}
                        className={inputBase}
                        placeholder="example@mail.com"
                        value={form.email || ""}
                        onChange={e => setForm({...form, email: e.target.value})}
                    />
                </div>

                <div>
                    <label className={labelClass}>Phone Number</label>
                    <input
                        disabled={readOnly}
                        className={inputBase}
                        placeholder="+251..."
                        value={form.phone_number || ""}
                        onChange={e => setForm({...form, phone_number: e.target.value})}
                    />
                </div>

                {isCreate && !readOnly && (
                    <div>
                        <label className={labelClass}>Password</label>
                        <input
                            type="password"
                            className={inputBase}
                            placeholder="••••••••"
                            value={form.password || ""}
                            onChange={e => setForm({...form, password: e.target.value})}
                        />
                    </div>
                )}
            </div>

            {/* Hierarchy Selects */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {['federal', 'region', 'zone', 'woreda', 'kebele'].map((loc) => (
                    <div key={loc}>
                        <label className={`${labelClass} capitalize`}>{loc}</label>
                        <select
                            disabled={readOnly}
                            className={inputBase}
                            value={form[`${loc}_id`] || ""}
                            onChange={e => handleLocationChange(`${loc}_id`, e.target.value)}
                        >
                            <option value="">Select {loc}</option>
                            {(locations[`${loc}s`] || []).map(item => (
                                <option key={item.id} value={item.id}>{item.name}</option>
                            ))}
                        </select>
                    </div>
                ))}
            </div>

            {/* Role and Status */}
            <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                <div className="flex-1 w-full bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                    <h3 className="text-[#004A7C] dark:text-blue-400 text-xs font-black uppercase tracking-widest flex items-center gap-2 mb-4">
                        <Shield size={16} /> Role Configuration
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {roles.map(r => (
                            <CustomCheckbox
                                key={r.id}
                                disabled={readOnly}
                                checked={form.roles?.includes(r.id)}
                                label={r.name}
                                onChange={() => setForm({...form, roles: [r.id]})}
                            />
                        ))}
                    </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                    <label className={labelClass}>Account Status</label>
                    <button
                        type="button"
                        onClick={() => !readOnly && setForm({...form, is_active: !form.is_active})}
                        className={`px-6 py-2 rounded-lg border text-[11px] font-black transition-all ${
                            form.is_active
                                ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-900/30'
                                : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-900/30'
                        }`}
                    >
                        {form.is_active ? "ACTIVE" : "INACTIVE"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UserForm;