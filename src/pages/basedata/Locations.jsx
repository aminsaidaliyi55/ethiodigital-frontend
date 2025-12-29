import React, { useEffect, useState, useCallback } from "react";
import {
    Search, Plus, Edit, Trash2, X, Loader2,
    MapPin, Globe, ChevronRight, ChevronLeft, Building
} from "lucide-react";
import api from "../../axios";
import toast from "react-hot-toast";

/* =========================================================
   1. LOCATION FORM COMPONENT
   ========================================================= */
const LocationForm = ({ form, setForm, errors }) => {
    const inputLabel = "text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1";
    const baseInput = "w-full px-5 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-[#004A7C] outline-none font-bold text-sm transition-all";
    const selectClass = "w-full px-4 py-2 rounded-lg bg-white dark:bg-slate-900 font-bold text-xs shadow-sm outline-none border-2 border-transparent focus:border-[#004A7C] transition-all";

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                    <label className={inputLabel}>Location Name</label>
                    <input
                        value={form.name}
                        onChange={(e) => setForm({...form, name: e.target.value})}
                        className={baseInput}
                        placeholder="e.g. Addis Ababa HQ"
                    />
                    {errors.name && <p className="text-rose-500 text-[9px] font-bold ml-1">{errors.name}</p>}
                </div>
                <div className="space-y-1">
                    <label className={inputLabel}>Location Type</label>
                    <select
                        value={form.type}
                        onChange={(e) => setForm({...form, type: e.target.value})}
                        className={baseInput}
                    >
                        <option value="Head Office">Head Office</option>
                        <option value="Branch">Branch</option>
                        <option value="Regional Office">Regional Office</option>
                        <option value="Project Site">Project Site</option>
                    </select>
                </div>
            </div>

            <div className="p-6 bg-blue-50/30 dark:bg-slate-800/50 rounded-3xl border border-blue-100 dark:border-slate-800 space-y-4">
                <div className="flex items-center gap-2 text-[10px] font-black text-[#002D5B] dark:text-blue-400 uppercase tracking-widest">
                    <MapPin size={14}/> Address Details
                </div>

                <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-1">
                        <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Physical Address</label>
                        <input
                            value={form.address}
                            onChange={(e) => setForm({...form, address: e.target.value})}
                            className={selectClass}
                            placeholder="Street, City, Building No."
                        />
                    </div>
                </div>
            </div>

            <div className="space-y-1">
                <label className={inputLabel}>Coordinates / Map Link (Optional)</label>
                <input
                    value={form.map_link}
                    onChange={(e) => setForm({...form, map_link: e.target.value})}
                    className={baseInput}
                    placeholder="Google Maps URL"
                />
            </div>
        </div>
    );
};

/* =========================================================
   2. MAIN COMPONENT (Locations)
   ========================================================= */
function Locations() {
    const [locations, setLocations] = useState([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [selectedId, setSelectedId] = useState(null);

    const [form, setForm] = useState({
        name: "",
        type: "Branch",
        address: "",
        map_link: ""
    });
    const [errors, setErrors] = useState({});

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get("/locations");
            setLocations(res.data || []);
        } catch (err) {
            toast.error("Failed to load locations");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleAction = async (e) => {
        e.preventDefault();
        if (!validate()) return;
        const loadToast = toast.loading("Saving location...");

        try {
            if (isEdit) {
                await api.put(`/locations/${selectedId}`, form);
                toast.success("Location Updated", { id: loadToast });
            } else {
                await api.post("/locations", form);
                toast.success("Location Created", { id: loadToast });
            }
            closeModal();
            fetchData();
        } catch (err) {
            toast.error("Process error", { id: loadToast });
        }
    };

    const validate = () => {
        let tempErrors = {};
        if (!form.name.trim()) tempErrors.name = "Name is required";
        setErrors(tempErrors);
        return Object.keys(tempErrors).length === 0;
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this location? This cannot be undone.")) return;
        try {
            await api.delete(`/locations/${id}`);
            toast.success("Location removed");
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
        setForm({ name: "", type: "Branch", address: "", map_link: "" });
    };

    const filtered = locations.filter(l =>
        l.name?.toLowerCase().includes(search.toLowerCase()) ||
        l.address?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="p-10 space-y-8 bg-[#F8FAFC] dark:bg-slate-950 min-h-screen">
            {/* Header */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                <div>
                    <h1 className="text-2xl font-black text-[#002D5B] dark:text-white flex items-center gap-3 tracking-tight uppercase">
                        <Globe size={28} className="text-[#004A7C]"/> Physical Locations
                    </h1>
                    <p className="text-xs font-bold text-slate-400 mt-1">Manage office branches and project site data</p>
                </div>

                <div className="flex items-center gap-4 w-full lg:w-auto">
                    <div className="relative flex-1 md:w-80">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <input
                            placeholder="Search by name or address..."
                            className="pl-12 pr-4 py-3 bg-white border border-slate-100 dark:bg-slate-900 rounded-xl w-full outline-none shadow-sm font-bold text-xs"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    <button
                        onClick={() => setShowModal(true)}
                        className="bg-[#002D5B] text-white px-6 py-3 rounded-xl font-black text-xs uppercase flex items-center gap-2 shadow-lg hover:bg-[#004A7C] transition-all"
                    >
                        <Plus size={18} strokeWidth={3} /> Add Location
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-50 dark:border-slate-800 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-[#004A7C] text-[11px] uppercase font-black text-white">
                        <tr>
                            <th className="px-8 py-5 w-20"># No</th>
                            <th className="px-8 py-5">Location Name</th>
                            <th className="px-8 py-5">Type</th>
                            <th className="px-8 py-5">Address</th>
                            <th className="px-8 py-5 text-right">Action</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                        {loading ? (
                            <tr><td colSpan={5} className="py-24 text-center"><Loader2 className="animate-spin mx-auto text-[#004A7C]" size={32} /></td></tr>
                        ) : (
                            filtered.map((loc, idx) => (
                                <tr key={loc.id} className="hover:bg-blue-50/20 transition-colors">
                                    <td className="px-8 py-6 text-xs font-black text-[#002D5B]">{idx + 1}</td>
                                    <td className="px-8 py-6">
                                        <p className="font-black text-[#002D5B] text-xs uppercase">{loc.name}</p>
                                    </td>
                                    <td className="px-8 py-6">
                                            <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-tighter ${
                                                loc.type === 'Head Office' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'
                                            }`}>
                                                {loc.type}
                                            </span>
                                    </td>
                                    <td className="px-8 py-6 text-xs font-bold text-slate-400">
                                        {loc.address || "N/A"}
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex justify-end gap-3">
                                            <button
                                                onClick={() => {
                                                    setIsEdit(true);
                                                    setSelectedId(loc.id);
                                                    setForm(loc);
                                                    setShowModal(true);
                                                }}
                                                className="p-1.5 text-[#002D5B] hover:bg-slate-100 rounded-md transition-colors"
                                            >
                                                <Edit size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(loc.id)}
                                                className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-md transition-colors"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                        </tbody>
                    </table>
                </div>

                <div className="px-8 py-6 bg-white dark:bg-slate-900 border-t border-slate-50 flex justify-end items-center gap-2">
                    <button className="p-2 text-slate-400 hover:text-[#002D5B] flex items-center gap-1 text-[10px] font-black uppercase">
                        <ChevronLeft size={14}/> Back
                    </button>
                    <button className="w-8 h-8 rounded-lg text-xs font-black bg-[#002D5B] text-white shadow-md">1</button>
                    <button className="p-2 text-slate-400 hover:text-[#002D5B] flex items-center gap-1 text-[10px] font-black uppercase">
                        Next <ChevronRight size={14}/>
                    </button>
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-[100] bg-slate-900/40 flex items-center justify-center backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="flex items-center justify-between px-10 py-6 border-b dark:border-slate-800 bg-[#002D5B] text-white">
                            <h2 className="font-black text-xs uppercase tracking-[0.2em]">
                                {isEdit ? "Update Location" : "New Location Entry"}
                            </h2>
                            <button onClick={closeModal} className="p-2 hover:bg-white/10 rounded-full transition-all"><X size={20}/></button>
                        </div>

                        <form onSubmit={handleAction} className="p-10 space-y-8">
                            <LocationForm form={form} setForm={setForm} errors={errors} />

                            <div className="flex justify-end gap-4 pt-8 border-t">
                                <button type="button" onClick={closeModal} className="px-8 py-4 font-black text-[10px] uppercase text-slate-400">Cancel</button>
                                <button type="submit" className="px-12 py-4 bg-[#002D5B] text-white rounded-2xl font-black text-[10px] uppercase shadow-xl hover:bg-[#004A7C] transition-all">
                                    {isEdit ? 'Save Changes' : 'Confirm Entry'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Locations;