import React, { useEffect, useState, useCallback } from "react";
import {
    Search, Plus, Edit, Trash2, X, Loader2,
    Building2, LayoutGrid, ChevronRight, ChevronLeft, Eye, Phone, Mail, User
} from "lucide-react";
import api from "../../axios";
import toast from "react-hot-toast";

/* =========================================================
   1. ORGANIZATION FORM COMPONENT
   ========================================================= */
const OrganizationForm = ({ form, setForm, errors }) => {
    const inputLabel = "text-[10px] font-black text-slate-400 capitalize tracking-widest ml-1";
    const baseInput = "w-full px-5 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-[#004A7C] outline-none font-bold text-sm transition-all";

    return (
        <div className="space-y-5">
            <div className="space-y-1">
                <label className={inputLabel}>Organization Name</label>
                <input
                    value={form.name}
                    onChange={(e) => setForm({...form, name: e.target.value})}
                    className={baseInput}
                    placeholder="e.g. MoFA"
                />
                {errors.name && <p className="text-rose-500 text-[9px] font-bold ml-1">{errors.name}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                    <label className={inputLabel}>Contact Person</label>
                    <input
                        value={form.contact_person}
                        onChange={(e) => setForm({...form, contact_person: e.target.value})}
                        className={baseInput}
                        placeholder="Full Name"
                    />
                </div>
                <div className="space-y-1">
                    <label className={inputLabel}>Phone Number</label>
                    <input
                        value={form.phone}
                        onChange={(e) => setForm({...form, phone: e.target.value})}
                        className={baseInput}
                        placeholder="+251-xx-xxx-xxxx"
                    />
                </div>
            </div>

            <div className="space-y-1">
                <label className={inputLabel}>Email Address</label>
                <input
                    value={form.email}
                    onChange={(e) => setForm({...form, email: e.target.value})}
                    className={baseInput}
                    placeholder="org@example.com"
                />
            </div>

            <div className="space-y-1">
                <label className={inputLabel}>Assigned Systems (Comma Separated)</label>
                <textarea
                    value={form.systems}
                    onChange={(e) => setForm({...form, systems: e.target.value})}
                    className={`${baseInput} min-h-[80px] resize-none`}
                    placeholder="e.g. Document Management, Smart Attendance"
                />
            </div>
        </div>
    );
};

/* =========================================================
   2. MAIN COMPONENT (Organizations)
   ========================================================= */
function Organizations() {
    const [orgs, setOrgs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [selectedId, setSelectedId] = useState(null);

    const [form, setForm] = useState({
        name: "",
        contact_person: "",
        email: "",
        phone: "",
        systems: "",
        status: "Active"
    });
    const [errors, setErrors] = useState({});

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get("/organizations");
            setOrgs(res.data || []);
        } catch (err) {
            toast.error("Failed to sync data");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleAction = async (e) => {
        e.preventDefault();
        if (!validate()) return;
        const loadToast = toast.loading("Processing...");

        try {
            if (isEdit) {
                await api.put(`/organizations/${selectedId}`, form);
                toast.success("Organization Updated", { id: loadToast });
            } else {
                await api.post("/organizations", form);
                toast.success("Organization Created", { id: loadToast });
            }
            closeModal();
            fetchData();
        } catch (err) {
            toast.error("Action failed", { id: loadToast });
        }
    };

    const validate = () => {
        let tempErrors = {};
        if (!form.name.trim()) tempErrors.name = "Name is required";
        setErrors(tempErrors);
        return Object.keys(tempErrors).length === 0;
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this organization?")) return;
        try {
            await api.delete(`/organizations/${id}`);
            toast.success("Removed successfully");
            fetchData();
        } catch (err) {
            toast.error("Delete failed");
        }
    };

    const closeModal = () => {
        setShowModal(false);
        setIsEdit(false);
        setSelectedId(null);
        setErrors({});
        setForm({ name: "", contact_person: "", email: "", phone: "", systems: "", status: "Active" });
    };

    const filteredData = orgs.filter(o => o.name?.toLowerCase().includes(search.toLowerCase()));

    return (
        <div className="p-8 space-y-6 bg-slate-50/50 dark:bg-slate-950 min-h-screen">
            {/* Header */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                <div>
                    <h1 className="text-xl font-black text-[#002D5B] dark:text-white tracking-tight">
                        Base Data Management
                    </h1>
                    <p className="text-[11px] font-bold text-slate-400">Manage global organizations and system access</p>
                </div>

                <div className="flex items-center gap-4 w-full lg:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5" />
                        <input
                            placeholder="Search for Organization"
                            className="pl-10 pr-4 py-2 bg-white border border-slate-200 dark:bg-slate-900 rounded-lg w-full outline-none text-[11px] font-bold"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    <button
                        onClick={() => setShowModal(true)}
                        className="bg-[#002D5B] text-white px-5 py-2 rounded-lg font-black text-[11px] uppercase flex items-center gap-2 shadow-sm hover:bg-[#004A7C] transition-all"
                    >
                        <Plus size={14} strokeWidth={3} /> Add Organization
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-[#004A7C] text-[10px] uppercase font-black text-white">
                        <tr>
                            <th className="px-6 py-4">Organization Name</th>
                            <th className="px-6 py-4">Contact Person</th>
                            <th className="px-6 py-4">Email</th>
                            <th className="px-6 py-4">Phone</th>
                            <th className="px-6 py-4">Systems</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4 text-center">Action</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                        {loading ? (
                            <tr><td colSpan={7} className="py-20 text-center"><Loader2 className="animate-spin mx-auto text-[#004A7C]" size={24} /></td></tr>
                        ) : (
                            filteredData.map((org) => (
                                <tr key={org.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <p className="font-black text-[#002D5B] text-[11px] uppercase">{org.name}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 text-[11px] font-bold text-slate-600 uppercase">
                                            <User size={12} className="text-slate-400"/> {org.contact_person}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-[11px] font-bold text-slate-500 lowercase">{org.email}</td>
                                    <td className="px-6 py-4 text-[11px] font-bold text-[#004A7C]">{org.phone}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col gap-1">
                                            {(org.systems || "").split(',').map((sys, i) => (
                                                <span key={i} className="text-[9px] font-black text-slate-400 uppercase tracking-tight">• {sys.trim()}</span>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                            <span className="bg-[#E8F5E9] text-[#2E7D32] px-4 py-1 rounded-full text-[9px] font-black uppercase">
                                                {org.status || 'Active'}
                                            </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex justify-center items-center gap-3">
                                            <button className="text-[#002D5B] hover:scale-110 transition-transform"><Eye size={16} /></button>
                                            <button
                                                onClick={() => {
                                                    setIsEdit(true);
                                                    setSelectedId(org.id);
                                                    setForm(org);
                                                    setShowModal(true);
                                                }}
                                                className="text-[#002D5B] hover:scale-110 transition-transform"
                                            >
                                                <Edit size={16} />
                                            </button>
                                            <button onClick={() => handleDelete(org.id)} className="text-rose-500 hover:scale-110 transition-transform">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="px-6 py-4 bg-white dark:bg-slate-900 border-t border-slate-100 flex justify-end items-center gap-1.5">
                    <button className="flex items-center gap-1 text-[10px] font-bold text-slate-400 px-2 py-1">
                        <ChevronLeft size={12}/> Back
                    </button>
                    {[1, 2, 3, 4, 5].map((p) => (
                        <button key={p} className={`w-6 h-6 rounded flex items-center justify-center text-[10px] font-bold ${p === 1 ? 'bg-[#002D5B] text-white' : 'text-slate-500'}`}>
                            {p}
                        </button>
                    ))}
                    <button className="flex items-center gap-1 text-[10px] font-bold text-slate-400 px-2 py-1">
                        Next <ChevronRight size={12}/>
                    </button>
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-[100] bg-slate-900/40 flex items-center justify-center backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="flex items-center justify-between px-8 py-5 border-b dark:border-slate-800 bg-[#002D5B] text-white">
                            <h2 className="font-black text-[11px] uppercase tracking-widest">
                                {isEdit ? "Update Organization" : "Register New Organization"}
                            </h2>
                            <button onClick={closeModal} className="p-1.5 hover:bg-white/10 rounded-full transition-all"><X size={18}/></button>
                        </div>

                        <form onSubmit={handleAction} className="p-8 space-y-6">
                            <OrganizationForm form={form} setForm={setForm} errors={errors} />
                            <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
                                <button type="button" onClick={closeModal} className="px-6 py-2.5 font-black text-[10px] uppercase text-slate-400">Cancel</button>
                                <button type="submit" className="px-8 py-2.5 bg-[#002D5B] text-white rounded-xl font-black text-[10px] uppercase shadow-lg hover:bg-[#004A7C]">
                                    {isEdit ? 'Update Record' : 'Confirm Registration'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Organizations;