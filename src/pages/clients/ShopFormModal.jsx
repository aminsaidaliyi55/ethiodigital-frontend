import React, { useState } from "react";
import { X, Building2, UserCheck, Info, Phone, Hash, DollarSign, Clock, ChevronRight, Check, MapPin, FileText } from "lucide-react";
import { ShopMap } from "./ShopMap";

const ShopFormModal = ({ selected, onSave, onClose, availableDirectors, categories }) => {
    const [activeTab, setActiveTab] = useState("profile");
    const [submitting, setSubmitting] = useState(false);

    const [form, setForm] = useState(selected || {
        name: "", industry: "", owner_id: "", phone: "",
        total_capital: "", opening_hours: "", category_id: "",
        tin_number: "", website: "", latitude: 9.145, longitude: 40.489, status: "active"
    });

    const [userForm, setUserForm] = useState({
        name: "", email: "", role: "SHOPOWNER", password: "ChangeMe123!"
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const payload = selected ? form : { shopForm: form, userForm };
            await onSave(payload);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] bg-indigo-950/80 backdrop-blur-sm flex items-center justify-center p-4 transition-colors duration-300">
            <div className="bg-white dark:bg-slate-900 w-full max-w-5xl rounded-[3rem] shadow-2xl max-h-[90vh] overflow-hidden flex flex-col border border-transparent dark:border-slate-800">

                {/* Header */}
                <div className="bg-[#004A7C] dark:bg-indigo-900 p-8 text-white flex justify-between items-center transition-colors">
                    <div>
                        <h2 className="font-black text-2xl uppercase tracking-tighter">
                            {selected ? "Update Profile" : "New Deployment"}
                        </h2>
                        <p className="text-[10px] font-black text-blue-200 dark:text-indigo-100 uppercase tracking-widest">
                            {selected ? `Editing: ${selected.name}` : "Environment Setup"}
                        </p>
                    </div>
                    <button onClick={onClose} className="p-3 bg-white/10 hover:bg-white/20 rounded-2xl transition-all">
                        <X size={24}/>
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-slate-100 dark:border-slate-800 px-8 bg-slate-50/50 dark:bg-slate-900/50">
                    {["profile", "location", ...(!selected ? ["staff"] : [])].map((tab, idx) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-6 py-4 text-[10px] font-black uppercase tracking-widest transition-all ${
                                activeTab === tab
                                    ? "text-[#004A7C] dark:text-indigo-400 border-b-4 border-[#004A7C] dark:border-indigo-400"
                                    : "text-slate-400 dark:text-slate-600"
                            }`}
                        >
                            {idx + 1}. {tab}
                        </button>
                    ))}
                </div>

                <form onSubmit={handleSubmit} className="p-10 overflow-y-auto">
                    {activeTab === "profile" && (
                        <div className="grid grid-cols-2 gap-6">
                            <FormInput label="Shop Name" icon={<Building2 size={14}/>} value={form.name} onChange={v => setForm({...form, name: v})} span="col-span-2" />
                            <FormSelect label="Owner" icon={<UserCheck size={14}/>} value={form.owner_id} options={availableDirectors} onChange={v => setForm({...form, owner_id: v})} />
                            <FormSelect label="Category" icon={<Info size={14}/>} value={form.category_id} options={categories} onChange={v => setForm({...form, category_id: v})} />
                            <FormInput label="Phone" icon={<Phone size={14}/>} value={form.phone} onChange={v => setForm({...form, phone: v})} />
                            <FormInput label="TIN" icon={<Hash size={14}/>} value={form.tin_number} onChange={v => setForm({...form, tin_number: v})} />
                            <FormInput label="Capital (ETB)" icon={<DollarSign size={14}/>} type="number" value={form.total_capital} onChange={v => setForm({...form, total_capital: v})} />
                            <FormInput label="Hours" icon={<Clock size={14}/>} value={form.opening_hours} onChange={v => setForm({...form, opening_hours: v})} />
                        </div>
                    )}

                    {activeTab === "location" && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl transition-colors">
                                <div>
                                    <p className="text-[8px] font-black text-slate-400 uppercase">Latitude</p>
                                    <p className="text-sm font-bold text-indigo-900 dark:text-indigo-300">{form.latitude}</p>
                                </div>
                                <div>
                                    <p className="text-[8px] font-black text-slate-400 uppercase">Longitude</p>
                                    <p className="text-sm font-bold text-indigo-900 dark:text-indigo-300">{form.longitude}</p>
                                </div>
                            </div>
                            <div className="h-[350px] rounded-[2rem] overflow-hidden border-4 border-slate-50 dark:border-slate-800 shadow-inner">
                                <ShopMap
                                    center={[form.latitude, form.longitude]}
                                    isPicker={true}
                                    onLocationSelect={(lat, lng) => setForm({...form, latitude: lat, longitude: lng})}
                                />
                            </div>
                        </div>
                    )}

                    {activeTab === "staff" && (
                        <div className="max-w-md mx-auto py-6 space-y-4">
                            <div className="text-center mb-6">
                                <FileText className="mx-auto text-indigo-200 dark:text-slate-700" size={48} />
                                <p className="text-[10px] font-black uppercase text-slate-400 mt-2">Admin Credentials</p>
                            </div>
                            <FormInput label="Full Name" value={userForm.name} onChange={v => setUserForm({...userForm, name: v})} />
                            <FormInput label="Email" type="email" value={userForm.email} onChange={v => setUserForm({...userForm, email: v})} />
                        </div>
                    )}

                    <div className="mt-8 flex justify-end gap-4">
                        {activeTab !== (selected ? "location" : "staff") ? (
                            <button
                                type="button"
                                onClick={() => setActiveTab(activeTab === "profile" ? "location" : "staff")}
                                className="px-8 py-4 bg-indigo-900 dark:bg-indigo-900 text-white rounded-2xl font-black text-[10px] uppercase flex items-center gap-2 hover:opacity-90 transition-all"
                            >
                                Next <ChevronRight size={16}/>
                            </button>
                        ) : (
                            <button
                                type="submit"
                                disabled={submitting}
                                className="px-8 py-4 bg-emerald-600 dark:bg-emerald-500 text-white rounded-2xl font-black text-[10px] uppercase flex items-center gap-2 hover:opacity-90 transition-all"
                            >
                                {submitting ? "Deploying..." : "Finish"} <Check size={16}/>
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
};

const FormInput = ({ label, icon, value, onChange, type="text", span="" }) => (
    <div className={`space-y-1.5 ${span}`}>
        {label && (
            <label className="text-[10px] font-black uppercase text-indigo-900 dark:text-slate-400 flex items-center gap-2">
                {icon} {label}
            </label>
        )}
        <input
            type={type}
            required
            className="w-full px-5 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 dark:text-white border-2 border-transparent focus:border-indigo-900 dark:focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-800 outline-none text-sm font-bold transition-all shadow-sm"
            value={value}
            onChange={e => onChange(e.target.value)}
        />
    </div>
);

const FormSelect = ({ label, icon, value, options, onChange }) => (
    <div className="space-y-1.5">
        <label className="text-[10px] font-black uppercase text-indigo-900 dark:text-slate-400 flex items-center gap-2">
            {icon} {label}
        </label>
        <select
            className="w-full px-5 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 dark:text-white border-2 border-transparent focus:border-indigo-900 dark:focus:border-indigo-500 outline-none text-sm font-bold transition-all shadow-sm"
            value={value}
            onChange={e => onChange(e.target.value)}
        >
            <option value="" className="dark:bg-slate-800">Select...</option>
            {options.map(opt => (
                <option key={opt.id} value={opt.id} className="dark:bg-slate-800">
                    {opt.name}
                </option>
            ))}
        </select>
    </div>
);

export default ShopFormModal;