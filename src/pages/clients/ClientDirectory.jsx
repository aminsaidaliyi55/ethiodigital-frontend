import React, { useState, useMemo, useEffect } from "react";
import { Search, Plus, Loader2, Trash2, Eye, Edit3 } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import api from "../../axios";
import { clientService } from "@/services/clientService";
import DataTable from "@/components/DataTable";
import ShopViewModal from "./ShopViewModal";
import ShopFormModal from "./ShopFormModal";

const ClientDirectory = () => {
    const [clients, setClients] = useState([]);
    const [availableDirectors, setAvailableDirectors] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showView, setShowView] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [selected, setSelected] = useState(null);
    const [filters, setFilters] = useState({ search: "" });

    const fetchData = async () => {
        try {
            setLoading(true);
            const [clientsRes, usersRes, catRes] = await Promise.all([
                clientService.getAll(),
                api.get("/users"),
                api.get("/categories")
            ]);
            setClients(clientsRes);
            setAvailableDirectors(usersRes.data || []);
            setCategories(catRes.data || []);
        } catch (err) {
            toast.error("Database sync failed");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const handleSave = async (payload) => {
        const isEdit = !!selected;
        try {
            if (isEdit) {
                await clientService.update(selected.id, payload);
                toast.success("Shop Profile Updated");
            } else {
                await clientService.fullShopSetup(payload);
                toast.success("Deployment Successful");
            }
            setShowForm(false);
            fetchData();
        } catch (err) {
            toast.error(err.response?.data?.message || "Operation failed");
        }
    };

    const columns = [
        {
            header: "Shop Detail",
            render: (row) => (
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-black text-[#004A7C] dark:text-blue-400 uppercase">
                        {row.name[0]}
                    </div>
                    <div>
                        <p className="font-black text-slate-800 dark:text-slate-100 uppercase tracking-tight">{row.name}</p>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase">{row.category_name || "General"}</p>
                    </div>
                </div>
            )
        },
        { header: "Owner", accessor: "owner_name" },
        {
            header: "Status",
            render: (row) => (
                <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${
                    row.status === 'active'
                        ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400'
                        : 'bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400'
                }`}>
                    {row.status}
                </span>
            )
        },
        {
            header: "Actions",
            align: "right",
            render: (row) => (
                <div className="flex justify-end gap-2">
                    <ActionButton icon={<Eye size={16}/>} color="hover:text-blue-600 dark:hover:text-blue-400" onClick={() => { setSelected(row); setShowView(true); }} />
                    <ActionButton icon={<Edit3 size={16}/>} color="hover:text-amber-600 dark:hover:text-amber-400" onClick={() => { setSelected(row); setShowForm(true); }} />
                    <ActionButton icon={<Trash2 size={16}/>} color="hover:text-rose-600 dark:hover:text-rose-400" onClick={() => handleDelete(row.id)} />
                </div>
            )
        }
    ];

    const handleDelete = async (id) => {
        if(window.confirm("Confirm decommissioning?")) {
            await clientService.delete(id);
            fetchData();
        }
    };

    const filtered = useMemo(() => clients.filter(c => c.name.toLowerCase().includes(filters.search.toLowerCase())), [clients, filters]);

    if (loading) return (
        <div className="h-screen flex flex-col items-center justify-center bg-white dark:bg-slate-950 gap-4">
            <Loader2 className="animate-spin text-[#004A7C] dark:text-blue-500" size={40} />
            <p className="text-[10px] font-black uppercase tracking-widest text-[#004A7C] dark:text-blue-500">Syncing Network...</p>
        </div>
    );

    return (
        <div className="p-8 space-y-8 bg-white dark:bg-slate-950 min-h-screen transition-colors duration-300">
            <Toaster />

            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-4xl font-black text-[#004A7C] dark:text-white uppercase tracking-tighter">Shop Network</h1>
                    <p className="text-slate-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-widest">Total Nodes: {clients.length}</p>
                </div>
                <div className="flex items-center gap-4">
                    <button onClick={() => { setSelected(null); setShowForm(true); }} className="bg-[#004A7C] dark:bg-blue-600 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-black dark:hover:bg-blue-500 transition-all shadow-lg flex items-center gap-2">
                        <Plus size={18}/> New Deployment
                    </button>
                </div>
            </div>

            {/* SEARCH AREA - Using soft borders and light shadow to separate from white background */}
            <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#004A7C] dark:group-focus-within:text-blue-400 transition-colors" size={18} />
                <input
                    className="w-full pl-12 pr-4 py-4 bg-white dark:bg-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm outline-none font-bold text-sm focus:ring-2 focus:ring-[#004A7C]/20 dark:focus:ring-blue-500/20 transition-all"
                    placeholder="Filter environments..."
                    onChange={(e) => setFilters({...filters, search: e.target.value})}
                />
            </div>

            {/* DATA TABLE CONTAINER - Added more defined shadow for white-on-white separation */}
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] overflow-hidden shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800">
                <DataTable columns={columns} data={filtered} />
            </div>

            {showView && <ShopViewModal client={selected} onClose={() => setShowView(false)} onEdit={() => { setShowView(false); setShowForm(true); }} />}

            {showForm && (
                <ShopFormModal
                    selected={selected}
                    availableDirectors={availableDirectors}
                    categories={categories}
                    onClose={() => setShowForm(false)}
                    onSave={handleSave}
                />
            )}
        </div>
    );
};

const ActionButton = ({ icon, color, onClick }) => (
    <button
        onClick={onClick}
        className={`p-2.5 bg-white dark:bg-slate-800 text-slate-400 dark:text-slate-500 ${color} rounded-xl transition-all shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-md`}
    >
        {icon}
    </button>
);

export default ClientDirectory;