import React, { useState } from "react";
import {
    Home,
    Search,
    Plus,
    X,
    Save,
    Trash2,
    MapPin,
    ArrowRight,
    Users,
    ShieldCheck,
    Store,
    LayoutGrid,
    List,
    SearchX,
    Eye,
    Edit3,
    CheckCircle
} from "lucide-react";
import toast, { Toaster } from 'react-hot-toast';

const KebeleHierarchy = () => {
    // --- STATE MANAGEMENT ---
    const [kebeles, setKebeles] = useState([
        {
            id: "K-01",
            name: "Kebele 01 (Central)",
            code: "KB-01",
            woreda: "Woreda 01",
            households: 1200,
            businesses: 84,
            compliance: 98,
            officer: "Amsale Tassew",
            status: "Verified"
        }
    ]);
    const [selectedWoreda, setSelectedWoreda] = useState("Woreda 01");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [editingId, setEditingId] = useState(null);
    const [viewMode, setViewMode] = useState("grid");

    // Form State
    const [formData, setFormData] = useState({
        woreda: "Woreda 01",
        kebeleName: "",
        kebeleCode: "",
        officerName: "",
        businessCount: 0,
        householdCount: 0
    });

    const woredas = ["Woreda 01", "Woreda 02", "Woreda 03", "Woreda 04", "Woreda 05"];

    // --- SEARCH LOGIC ---
    const filteredKebeles = kebeles.filter(k =>
        (k.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            k.code.toLowerCase().includes(searchQuery.toLowerCase())) &&
        k.woreda === selectedWoreda
    );

    // --- HANDLERS ---
    const handleOpenCreate = () => {
        setEditingId(null);
        setFormData({
            woreda: selectedWoreda,
            kebeleName: "",
            kebeleCode: "",
            officerName: "",
            businessCount: 0,
            householdCount: 0
        });
        setIsModalOpen(true);
    };

    const handleEdit = (kebele) => {
        setEditingId(kebele.id);
        setFormData({
            woreda: kebele.woreda,
            kebeleName: kebele.name,
            kebeleCode: kebele.code,
            officerName: kebele.officer,
            businessCount: kebele.businesses,
            householdCount: kebele.households
        });
        setIsModalOpen(true);
    };

    const handleView = (kebele) => {
        toast(`Kebele: ${kebele.name}\nBusinesses: ${kebele.businesses}\nHouseholds: ${kebele.households}`, {
            icon: '🏠',
            style: { borderRadius: '15px', background: '#312e81', color: '#fff', fontSize: '12px' }
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const kebeleData = {
            id: editingId || `K-${Math.floor(Math.random() * 1000)}`,
            name: formData.kebeleName,
            code: formData.kebeleCode,
            woreda: formData.woreda,
            officer: formData.officerName,
            businesses: parseInt(formData.businessCount) || 0,
            households: parseInt(formData.householdCount) || 0,
            compliance: editingId ? kebeles.find(k => k.id === editingId).compliance : 100,
            status: "Verified"
        };

        if (editingId) {
            setKebeles(kebeles.map(k => k.id === editingId ? kebeleData : k));
            toast.success("Unit updated successfully", { style: { background: '#312e81', color: '#fff' } });
        } else {
            setKebeles([kebeleData, ...kebeles]);
            toast.success("New node added to hierarchy", { style: { background: '#312e81', color: '#fff' } });
        }

        setIsModalOpen(false);
    };

    const handleDelete = (id) => {
        if (window.confirm("Are you sure you want to remove this local unit?")) {
            setKebeles(kebeles.filter(k => k.id !== id));
            toast.error("Kebele removed from registry");
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
                            <h2 className="text-2xl font-bold text-indigo-950 dark:text-white">{editingId ? "Edit Kebele" : "Map New Kebele"}</h2>
                            <button type="button" onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-indigo-50 dark:hover:bg-indigo-800 text-indigo-900 dark:text-indigo-200 rounded-full transition-colors"><X size={20}/></button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <label className="block text-[11px] font-bold text-indigo-900 dark:text-indigo-400 uppercase tracking-wider">Parent Woreda</label>
                                <select required className="w-full p-4 bg-indigo-50 dark:bg-indigo-950 rounded-xl border-2 border-transparent focus:border-indigo-900 outline-none text-sm font-medium" value={formData.woreda} onChange={(e) => setFormData({...formData, woreda: e.target.value})}>
                                    {woredas.map(w => <option key={w} value={w}>{w}</option>)}
                                </select>
                                <div className="grid grid-cols-2 gap-3">
                                    <input type="number" placeholder="Households" className="w-full p-4 bg-indigo-50 dark:bg-indigo-950 rounded-xl border-2 border-transparent focus:border-indigo-900 outline-none text-sm font-medium" value={formData.householdCount} onChange={(e) => setFormData({...formData, householdCount: e.target.value})} />
                                    <input type="number" placeholder="Businesses" className="w-full p-4 bg-indigo-50 dark:bg-indigo-950 rounded-xl border-2 border-transparent focus:border-indigo-900 outline-none text-sm font-medium" value={formData.businessCount} onChange={(e) => setFormData({...formData, businessCount: e.target.value})} />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="block text-[11px] font-bold text-indigo-900 dark:text-indigo-400 uppercase tracking-wider">Unit Identity</label>
                                <input type="text" required placeholder="Kebele Name" className="w-full p-4 bg-indigo-50 dark:bg-indigo-950 rounded-xl border-2 border-transparent focus:border-indigo-900 outline-none text-sm font-medium" value={formData.kebeleName} onChange={(e) => setFormData({...formData, kebeleName: e.target.value})} />
                                <div className="grid grid-cols-2 gap-3">
                                    <input type="text" required placeholder="Code" className="w-full p-4 bg-indigo-50 dark:bg-indigo-950 rounded-xl border-2 border-transparent focus:border-indigo-900 outline-none text-sm font-medium" value={formData.kebeleCode} onChange={(e) => setFormData({...formData, kebeleCode: e.target.value})} />
                                    <input type="text" required placeholder="Agent Name" className="w-full p-4 bg-indigo-50 dark:bg-indigo-950 rounded-xl border-2 border-transparent focus:border-indigo-900 outline-none text-sm font-medium" value={formData.officerName} onChange={(e) => setFormData({...formData, officerName: e.target.value})} />
                                </div>
                            </div>
                        </div>

                        <button type="submit" className="w-full mt-8 py-4 bg-indigo-900 hover:bg-black text-white rounded-xl font-bold transition-all shadow-lg flex items-center justify-center gap-2">
                            <Save size={18}/> {editingId ? "Update Node" : "Register Unit"}
                        </button>
                    </form>
                </div>
            )}

            {/* --- HEADER --- */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
                <div className="flex items-center gap-4">
                    <div className="p-4 bg-indigo-900 rounded-2xl text-white shadow-xl"><Home size={28} /></div>
                    <div>
                        <h1 className="text-3xl font-bold text-indigo-950 dark:text-white leading-none tracking-tight italic">Kebeles</h1>
                        <p className="text-xs text-indigo-900/60 dark:text-indigo-400 mt-1 font-bold uppercase tracking-widest">Tier 5 Neighborhood Units</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex bg-white dark:bg-indigo-900 p-1 rounded-xl border border-indigo-100 dark:border-indigo-800">
                        <button onClick={() => setViewMode("grid")} className={`p-2 rounded-lg transition-all ${viewMode === "grid" ? "bg-indigo-900 text-white" : "text-indigo-300"}`}><LayoutGrid size={18}/></button>
                        <button onClick={() => setViewMode("list")} className={`p-2 rounded-lg transition-all ${viewMode === "list" ? "bg-indigo-900 text-white" : "text-indigo-300"}`}><List size={18}/></button>
                    </div>
                    <button onClick={handleOpenCreate} className="px-6 py-3 bg-indigo-900 hover:bg-black text-white rounded-xl text-sm font-bold flex items-center gap-2 transition-all shadow-lg">
                        <Plus size={18}/> New Kebele
                    </button>
                </div>
            </div>

            {/* --- WOREDA TABS --- */}
            <div className="flex items-center gap-2 overflow-x-auto pb-6 scrollbar-hide mb-8 border-b border-indigo-100 dark:border-indigo-800">
                {woredas.map((w) => (
                    <button
                        key={w}
                        onClick={() => setSelectedWoreda(w)}
                        className={`px-6 py-2.5 rounded-xl text-[10px] font-black capitalize tracking-widest whitespace-nowrap transition-all border-2
                        ${selectedWoreda === w
                            ? "bg-indigo-900 text-white border-indigo-900 shadow-md italic"
                            : "text-indigo-400 border-transparent hover:bg-white dark:hover:bg-indigo-900/50"}`}
                    >
                        {w}
                    </button>
                ))}
            </div>

            {/* --- SEARCH BAR --- */}
            <div className="relative mb-8 max-w-2xl">
                <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-indigo-900/40" />
                <input
                    type="text"
                    placeholder={`Query local units in ${selectedWoreda}...`}
                    className="w-full pl-14 pr-6 py-4 bg-white dark:bg-indigo-900 rounded-2xl text-sm border-2 border-transparent focus:border-indigo-900 outline-none shadow-sm transition-all font-medium"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            {/* --- CONTENT AREA --- */}
            {filteredKebeles.length > 0 ? (
                viewMode === "grid" ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredKebeles.map((kebele) => (
                            <div key={kebele.id} className="bg-white dark:bg-indigo-900 border border-indigo-100 dark:border-indigo-800 rounded-[2.5rem] p-6 group hover:shadow-2xl transition-all relative overflow-hidden">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-800 rounded-xl flex items-center justify-center text-indigo-900 dark:text-indigo-300"><Home size={24} /></div>
                                    <div className="flex gap-1">
                                        <button onClick={() => handleEdit(kebele)} className="p-2 text-indigo-300 hover:text-indigo-900 dark:hover:text-white transition-colors"><Edit3 size={16}/></button>
                                        <button onClick={() => handleDelete(kebele.id)} className="p-2 text-indigo-300 hover:text-rose-600 transition-colors"><Trash2 size={16}/></button>
                                    </div>
                                </div>
                                <h3 className="text-lg font-bold text-indigo-950 dark:text-white italic">{kebele.name}</h3>
                                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mt-1">{kebele.code}</p>

                                <div className="grid grid-cols-2 gap-2 mt-6">
                                    <div className="bg-indigo-50/50 dark:bg-white/5 p-3 rounded-xl border border-indigo-50">
                                        <p className="text-xs font-bold text-indigo-900 dark:text-white">{kebele.businesses}</p>
                                        <p className="text-[8px] text-indigo-400 font-black uppercase">Shops</p>
                                    </div>
                                    <div className="bg-indigo-50/50 dark:bg-white/5 p-3 rounded-xl border border-indigo-50">
                                        <p className="text-xs font-bold text-indigo-900 dark:text-white">{kebele.compliance}%</p>
                                        <p className="text-[8px] text-indigo-400 font-black uppercase">Health</p>
                                    </div>
                                </div>

                                <button onClick={() => handleView(kebele)} className="w-full mt-6 py-3 bg-indigo-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-black transition-all">
                                    View Details <ArrowRight size={14}/>
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white dark:bg-indigo-900 rounded-[2rem] shadow-xl border border-indigo-50 dark:border-indigo-800 overflow-hidden">
                        <table className="w-full text-left">
                            <thead>
                            <tr className="bg-indigo-50 dark:bg-white/5 text-[11px] font-bold uppercase text-indigo-900/60 dark:text-indigo-400 tracking-wider">
                                <th className="px-8 py-5">Kebele Info</th>
                                <th className="px-6 py-5 text-center">Census Data</th>
                                <th className="px-6 py-5">Agent</th>
                                <th className="px-8 py-5 text-right">Actions</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-indigo-50 dark:divide-white/5">
                            {filteredKebeles.map((kebele) => (
                                <tr key={kebele.id} className="group hover:bg-indigo-50/30 dark:hover:bg-white/[0.02] transition-colors">
                                    <td className="px-8 py-5">
                                        <p className="text-sm font-bold text-indigo-950 dark:text-white italic">{kebele.name}</p>
                                        <p className="text-[10px] text-indigo-400 font-black uppercase">{kebele.code}</p>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex items-center justify-center gap-4">
                                            <div className="text-center">
                                                <p className="text-xs font-black text-indigo-900 dark:text-white">{kebele.households}</p>
                                                <p className="text-[8px] text-indigo-400 uppercase font-black">Homes</p>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-xs font-black text-indigo-900 dark:text-white">{kebele.businesses}</p>
                                                <p className="text-[8px] text-indigo-400 uppercase font-black">Shops</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <span className="text-sm text-indigo-950 dark:text-indigo-200 font-bold italic">{kebele.officer}</span>
                                    </td>
                                    <td className="px-8 py-5 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button onClick={() => handleView(kebele)} className="p-2 text-indigo-300 hover:text-indigo-900 dark:hover:text-white transition-all"><Eye size={18} /></button>
                                            <button onClick={() => handleEdit(kebele)} className="p-2 text-indigo-300 hover:text-indigo-900 dark:hover:text-white transition-all"><Edit3 size={18} /></button>
                                            <button onClick={() => handleDelete(kebele.id)} className="p-2 text-indigo-300 hover:text-rose-600 transition-all"><Trash2 size={18} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                )
            ) : (
                <div className="p-24 text-center">
                    <SearchX size={44} className="mx-auto text-indigo-100 mb-6" />
                    <h3 className="text-xl font-bold text-indigo-950 dark:text-white">No nodes found</h3>
                    <p className="text-sm text-indigo-900/50 dark:text-indigo-400 mt-2 font-medium">No neighborhoods are registered under {selectedWoreda}.</p>
                </div>
            )}
        </div>
    );
};

export default KebeleHierarchy;