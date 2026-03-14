import React, { useState, useMemo, useEffect } from "react";
import { Search, Plus, Loader2, Trash2, Eye, Edit, Truck, MapPin } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import api from "../../axios";
import { clientService } from "@/services/clientService";
import DataTable from "@/components/DataTable";
import ShopViewModal from "./ShopViewModal";
import ShopFormModal from "./ShopFormModal";

const ClientDirectory = ({ filter = "all" }) => {
    const [clients, setClients] = useState([]);
    const [availableUsers, setAvailableUsers] = useState([]); // Familiar word: Users
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showView, setShowView] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null); // Familiar word: Selected Item
    const [searchQuery, setSearchQuery] = useState(""); // Simplified state

    // Set labels based on the page type
    const isCarrierMode = filter === "carriers";
    const pageTitle = isCarrierMode ? "Delivery Drivers" : "Store List";
    const itemLabel = isCarrierMode ? "Driver" : "Store";
    const addButtonLabel = isCarrierMode ? "Add New Driver" : "Add New Store";

    const fetchData = async () => {
        try {
            setLoading(true);
            const [clientsRes, usersRes, catRes] = await Promise.all([
                clientService.getAll(),
                api.get("/users"),
                api.get("/categories")
            ]);

            const clientsData = Array.isArray(clientsRes) ? clientsRes : (clientsRes?.data || []);
            const usersData = Array.isArray(usersRes.data) ? usersRes.data : (usersRes.data?.data || []);
            const categoriesData = Array.isArray(catRes.data) ? catRes.data : (catRes.data?.data || []);

            setClients(clientsData);
            setAvailableUsers(usersData);
            setCategories(categoriesData);
        } catch (err) {
            console.error("Error:", err);
            toast.error("Could not load data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, [filter]);

    const handleSave = async (formData) => {
        try {
            // Auto-assign category if adding a driver
            const finalData = isCarrierMode
                ? { ...formData, category_id: categories.find(c => c.name.toLowerCase().includes('logistics'))?.id || formData.category_id }
                : formData;

            if (selectedItem) {
                await clientService.update(selectedItem.id, finalData);
                toast.success("Updated successfully");
            } else {
                await clientService.fullShopSetup(finalData);
                toast.success("Added successfully");
            }
            setShowForm(false);
            fetchData();
        } catch (err) {
            toast.error("Something went wrong");
        }
    };

    const handleDelete = async (id) => {
        if(window.confirm(`Are you sure you want to delete this ${itemLabel.toLowerCase()}?`)) {
            try {
                await clientService.delete(id);
                toast.success("Deleted");
                fetchData();
            } catch (err) {
                toast.error("Delete failed");
            }
        }
    };

    const columns = [
        {
            header: `${itemLabel} Name`,
            render: (row) => (
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-slate-800 flex items-center justify-center font-black text-blue-900 dark:text-blue-400 uppercase">
                        {isCarrierMode ? <Truck size={18} /> : (row.name ? row.name[0] : "?")}
                    </div>
                    <div>
                        <p className="font-bold text-slate-800 dark:text-slate-100 text-[11px] uppercase">{row.name}</p>
                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">
                            {row.category_name || "General"}
                        </p>
                    </div>
                </div>
            )
        },
        {
            header: isCarrierMode ? "Driver Name" : "Owner Name",
            render: (row) => <span className="text-slate-600 dark:text-slate-400 text-[10px] font-bold uppercase">{row.owner_name}</span>
        },
        {
            header: "Status",
            render: (row) => (
                <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase ${
                    row.status === 'active'
                        ? 'bg-green-50 text-green-600'
                        : 'bg-red-50 text-red-600'
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
                    <button onClick={() => { setSelectedItem(row); setShowView(true); }} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><Eye size={16} /></button>
                    <button onClick={() => { setSelectedItem(row); setShowForm(true); }} className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg"><Edit size={16} /></button>
                    <button onClick={() => handleDelete(row.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={16} /></button>
                </div>
            )
        }
    ];

    const filteredList = useMemo(() => {
        return clients.filter(item => {
            const matchesSearch = item.name?.toLowerCase().includes(searchQuery.toLowerCase());

            if (isCarrierMode) {
                // Only show Logistics/Carrier categories
                const isCarrier = item.category_name?.toLowerCase().includes("logistics") ||
                    item.category_name?.toLowerCase().includes("carrier");
                return matchesSearch && isCarrier;
            }

            return matchesSearch;
        });
    }, [clients, searchQuery, isCarrierMode]);

    if (loading) return (
        <div className="h-screen flex flex-col items-center justify-center gap-4">
            <Loader2 className="animate-spin text-blue-900" size={32} />
            <p className="text-xs font-bold uppercase text-blue-900">Please wait...</p>
        </div>
    );

    return (
        <div className="p-8 bg-slate-50 dark:bg-slate-950 min-h-screen">
            <Toaster />

            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-black text-blue-900 dark:text-white uppercase">{pageTitle}</h1>
                    <p className="text-slate-400 text-xs font-bold uppercase">Total: {filteredList.length}</p>
                </div>
                <button
                    onClick={() => { setSelectedItem(null); setShowForm(true); }}
                    className="bg-blue-900 text-white px-6 py-3 rounded-xl font-bold text-[10px] uppercase shadow-lg hover:bg-black transition-all flex items-center gap-2"
                >
                    <Plus size={18}/> {addButtonLabel}
                </button>
            </div>

            <div className="relative mb-6">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                    className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-900 rounded-2xl shadow-sm outline-none font-bold text-xs uppercase"
                    placeholder={`Search ${itemLabel.toLowerCase()}s...`}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-sm">
                <DataTable columns={columns} data={filteredList} itemsPerPage={10} />
            </div>

            {showView && <ShopViewModal client={selectedItem} onClose={() => setShowView(false)} onEdit={() => { setShowView(false); setShowForm(true); }} />}

            {showForm && (
                <ShopFormModal
                    selected={selectedItem}
                    availableDirectors={availableUsers}
                    categories={categories}
                    onClose={() => setShowForm(false)}
                    onSave={handleSave}
                />
            )}
        </div>
    );
};

export default ClientDirectory;