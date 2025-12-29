import React, { useState } from "react";
import {
    Search,
    Plus,
    Navigation,
    X,
    Save,
    Trash2,
    Map,
    Users,
    SearchX,
    Eye,
    Edit3,
    Store,
    Activity,
    ChevronRight
} from "lucide-react";
import toast, { Toaster } from 'react-hot-toast';

const WoredaHierarchy = () => {
    // --- STATE MANAGEMENT ---
    const [woredas, setWoredas] = useState([
        {
            id: "W-01",
            name: "Woreda 01",
            code: "BO-01",
            subCity: "Bole Sub-City",
            lead: "Zewdu Girma",
            shops: 245,
            compliance: 94,
            status: "Active"
        }
    ]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [editingId, setEditingId] = useState(null);

    // Form State
    const [formData, setFormData] = useState({
        subCity: "Bole Sub-City",
        woredaName: "",
        woredaCode: "",
        leadName: "",
        shopCount: 0
    });

    const subCities = ["Bole Sub-City", "Kirkos Sub-City", "Arada Sub-City", "Yeka Sub-City", "Nifas Silk"];

    // --- SEARCH LOGIC ---
    const filteredWoredas = woredas.filter(w =>
        w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        w.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        w.lead.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // --- HANDLERS ---
    const handleOpenCreate = () => {
        setEditingId(null);
        setFormData({ subCity: "Bole Sub-City", woredaName: "", woredaCode: "", leadName: "", shopCount: 0 });
        setIsModalOpen(true);
    };

    const handleEdit = (woreda) => {
        setEditingId(woreda.id);
        setFormData({
            subCity: woreda.subCity,
            woredaName: woreda.name,
            woredaCode: woreda.code,
            leadName: woreda.lead,
            shopCount: woreda.shops
        });
        setIsModalOpen(true);
    };

    const handleView = (woreda) => {
        toast(`Woreda: ${woreda.name}\nCompliance: ${woreda.compliance}%\nShops: ${woreda.shops}`, {
            icon: '📊',
            style: { borderRadius: '15px', background: '#312e81', color: '#fff', fontSize: '12px' }
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const woredaData = {
            id: editingId || `W-${Math.floor(Math.random() * 1000)}`,
            name: formData.woredaName,
            code: formData.woredaCode,
            subCity: formData.subCity,
            lead: formData.leadName,
            shops: parseInt(formData.shopCount) || 0,
            compliance: editingId ? woredas.find(w => w.id === editingId).compliance : 100,
            status: "Active"
        };

        if (editingId) {
            setWoredas(woredas.map(w => w.id === editingId ? woredaData : w));
            toast.success("Woreda updated successfully", { style: { background: '#312e81', color: '#fff' } });
        } else {
            setWoredas([woredaData, ...woredas]);
            toast.success("New Woreda registered", { style: { background: '#312e81', color: '#fff' } });
        }

        setIsModalOpen(false);
    };

    const handleDelete = (id) => {
        if (window.confirm("Are you sure you want to remove this Woreda?")) {
            setWoredas(woredas.filter(w => w.id !== id));
            toast.error("Woreda removed from registry");
        }
    };

    return (
        <div className="p-6 md:p-10 bg-slate-50 dark:bg-indigo-950 min-h-screen font-sans selection:bg-indigo-200">
            <Toaster position="bottom-right" />

            {/* --- MODAL --- */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-md bg-indigo-950/40">
                    <form onSubmit={handleSubmit} className="bg-white dark:bg-indigo-900 w-full max-w-2xl rounded-[2.5rem] p-8 shadow-2xl border border-indigo-100 dark:border-indigo-800 animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-2xl font-bold text-indigo-950 dark:text-white">{editingId ? "Edit Woreda" : "Register Woreda"}</h2>
                            <button type="button" onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-indigo-50 dark:hover:bg-indigo-800 text-indigo-900 dark:text-indigo-200 rounded-full transition-colors"><X size={20}/></button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <label className="block text-[11px] font-bold text-indigo-900 dark:text-indigo-400 uppercase tracking-wider">Jurisdiction</label>
                                <select required className="w-full p-4 bg-indigo-50 dark:bg-indigo-950 rounded-xl border-2 border-transparent focus:border-indigo-900 outline-none text-sm font-medium" value={formData.subCity} onChange={(e) => setFormData({...formData, subCity: e.target.value})}>
                                    {subCities.map(sc => <option key={sc} value={sc}>{sc}</option>)}
                                </select>
                                <input type="number" placeholder="Est. Shop Count" className="w-full p-4 bg-indigo-50 dark:bg-indigo-950 rounded-xl border-2 border-transparent focus:border-indigo-900 outline-none text-sm font-medium" value={formData.shopCount} onChange={(e) => setFormData({...formData, shopCount: e.target.value})} />
                            </div>

                            <div className="space-y-4">
                                <label className="block text-[11px] font-bold text-indigo-900 dark:text-indigo-400 uppercase tracking-wider">Identity</label>
                                <input type="text" required placeholder="Woreda Name" className="w-full p-4 bg-indigo-50 dark:bg-indigo-950 rounded-xl border-2 border-transparent focus:border-indigo-900 outline-none text-sm font-medium" value={formData.woredaName} onChange={(e) => setFormData({...formData, woredaName: e.target.value})} />
                                <div className="grid grid-cols-2 gap-3">
                                    <input type="text" required placeholder="Code" className="w-full p-4 bg-indigo-50 dark:bg-indigo-950 rounded-xl border-2 border-transparent focus:border-indigo-900 outline-none text-sm font-medium" value={formData.woredaCode} onChange={(e) => setFormData({...formData, woredaCode: e.target.value})} />
                                    <input type="text" required placeholder="Lead Name" className="w-full p-4 bg-indigo-50 dark:bg-indigo-950 rounded-xl border-2 border-transparent focus:border-indigo-900 outline-none text-sm font-medium" value={formData.leadName} onChange={(e) => setFormData({...formData, leadName: e.target.value})} />
                                </div>
                            </div>
                        </div>

                        <button type="submit" className="w-full mt-8 py-4 bg-indigo-900 hover:bg-black text-white rounded-xl font-bold transition-all shadow-lg flex items-center justify-center gap-2">
                            <Save size={18}/> {editingId ? "Update Registry" : "Save Woreda"}
                        </button>
                    </form>
                </div>
            )}

            {/* --- HEADER --- */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
                <div className="flex items-center gap-4">
                    <div className="p-4 bg-indigo-900 rounded-2xl text-white shadow-xl"><Navigation size={28} /></div>
                    <div>
                        <h1 className="text-3xl font-bold text-indigo-950 dark:text-white leading-none tracking-tight italic">Woredas</h1>
                        <p className="text-xs text-indigo-900/60 dark:text-indigo-400 mt-1 font-bold uppercase tracking-widest">Level 4 District Management</p>
                    </div>
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-900/40" />
                        <input type="text" placeholder="Search districts..." className="w-full pl-11 pr-4 py-3 bg-white dark:bg-indigo-900 rounded-xl text-sm border-2 border-transparent focus:border-indigo-900 outline-none shadow-sm transition-all font-medium" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                    </div>
                    <button onClick={handleOpenCreate} className="px-6 py-3 bg-indigo-900 hover:bg-black text-white rounded-xl text-sm font-bold flex items-center gap-2 transition-all shadow-lg shrink-0">
                        <Plus size={18}/> Add Woreda
                    </button>
                </div>
            </div>

            {/* --- TABLE --- */}
            <div className="bg-white dark:bg-indigo-900 rounded-[2rem] shadow-xl border border-indigo-50 dark:border-indigo-800 overflow-hidden">
                {filteredWoredas.length > 0 ? (
                    <table className="w-full text-left">
                        <thead>
                        <tr className="bg-indigo-50 dark:bg-white/5 text-[11px] font-bold uppercase text-indigo-900/60 dark:text-indigo-400 tracking-wider">
                            <th className="px-8 py-5">District Info</th>
                            <th className="px-6 py-5">Sub-City</th>
                            <th className="px-6 py-5 text-center">Stats</th>
                            <th className="px-6 py-5">District Lead</th>
                            <th className="px-8 py-5 text-right">Actions</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-indigo-50 dark:divide-white/5">
                        {filteredWoredas.map((woreda) => (
                            <tr key={woreda.id} className="group hover:bg-indigo-50/30 dark:hover:bg-white/[0.02] transition-colors">
                                <td className="px-8 py-5">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-lg bg-indigo-100 dark:bg-indigo-800 flex items-center justify-center text-indigo-900 dark:text-indigo-300 font-bold text-xs">{woreda.code.split('-')[1] || "W"}</div>
                                        <div>
                                            <p className="text-sm font-bold text-indigo-950 dark:text-white italic">{woreda.name}</p>
                                            <p className="text-[10px] text-indigo-900/50 dark:text-indigo-400 font-black">ID: {woreda.id}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-5">
                                    <p className="text-sm text-indigo-950 dark:text-indigo-100 font-bold">{woreda.subCity}</p>
                                    <span className="text-[9px] bg-indigo-900 text-white px-2 py-0.5 rounded font-black tracking-tighter">LEVEL 4</span>
                                </td>
                                <td className="px-6 py-5">
                                    <div className="flex items-center justify-center gap-4">
                                        <div className="text-center">
                                            <p className="text-xs font-black text-indigo-900 dark:text-white">{woreda.shops}</p>
                                            <p className="text-[8px] text-indigo-400 uppercase font-black">Shops</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-xs font-black text-indigo-900 dark:text-white">{woreda.compliance}%</p>
                                            <p className="text-[8px] text-indigo-400 uppercase font-black">Health</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-5">
                                    <div className="flex items-center gap-2">
                                        <div className="w-7 h-7 rounded-full bg-indigo-900/10 dark:bg-indigo-800 text-indigo-900 dark:text-indigo-200 flex items-center justify-center text-[10px] font-black">{woreda.lead[0]}</div>
                                        <span className="text-sm text-indigo-950 dark:text-indigo-200 font-bold italic">{woreda.lead}</span>
                                    </div>
                                </td>
                                <td className="px-8 py-5 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <button onClick={() => handleView(woreda)} className="p-2 text-indigo-900/40 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-white hover:bg-indigo-100 dark:hover:bg-indigo-800 rounded-lg transition-all"><Eye size={18} /></button>
                                        <button onClick={() => handleEdit(woreda)} className="p-2 text-indigo-900/40 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-white hover:bg-indigo-100 dark:hover:bg-indigo-800 rounded-lg transition-all"><Edit3 size={18} /></button>
                                        <button onClick={() => handleDelete(woreda.id)} className="p-2 text-indigo-900/40 dark:text-indigo-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"><Trash2 size={18} /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                ) : (
                    <div className="p-24 text-center">
                        <SearchX size={44} className="mx-auto text-indigo-100 mb-6" />
                        <h3 className="text-xl font-bold text-indigo-950 dark:text-white">No district records</h3>
                        <p className="text-sm text-indigo-900/50 dark:text-indigo-400 mt-2 font-medium">No woredas match your current filter criteria.</p>
                        <button onClick={() => setSearchQuery("")} className="mt-6 text-xs font-black uppercase text-indigo-900 dark:text-indigo-300 underline tracking-widest">Reset View</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default WoredaHierarchy;