import React, { useState, useEffect } from "react";
import {
    Search,
    Plus,
    Navigation,
    X,
    Save,
    Trash2,
    Activity,
    Map,
    Users,
    ShieldCheck,
    Globe,
    SearchX,
    Eye,
    Edit3
} from "lucide-react";
import toast, { Toaster } from 'react-hot-toast';

const LocalZoneHierarchy = () => {
    // --- STATE MANAGEMENT ---
    const [zones, setZones] = useState([
        {
            id: "ZONE-01",
            name: "Addis Ababa Central",
            code: "AA-01",
            federalName: "Ethiopian Federal Govt",
            federalId: "FED-ETH",
            regionName: "Addis Ababa",
            regionId: "REG-AA",
            adminName: "Kassahun Tekle",
            adminId: "USR-001",
            status: "Active"
        }
    ]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [editingId, setEditingId] = useState(null);

    // Form State
    const [formData, setFormData] = useState({
        federalId: "",
        regionId: "",
        assignedAdminId: "",
        zoneName: "",
        zoneCode: "",
    });

    // Mock Data Store
    const [backendResources, setBackendResources] = useState({
        federalEntities: [
            { id: "FED-ETH", name: "Ethiopian Federal Govt" },
            { id: "FED-KNY", name: "Kenya Central Authority" }
        ],
        regions: [],
        availableAdmins: [
            { id: "USR-001", name: "Kassahun Tekle", role: "Supervisor" },
            { id: "USR-009", name: "Mulugeta Belete", role: "Auditor" },
            { id: "USR-042", name: "Sara Jemal", role: "Admin" }
        ]
    });

    // --- SEARCH LOGIC ---
    const filteredZones = zones.filter(zone =>
        zone.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        zone.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        zone.adminName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // --- HANDLERS ---
    const handleFederalChange = (fedId) => {
        setFormData({ ...formData, federalId: fedId, regionId: "" });
        const mockRegions = fedId === "FED-ETH"
            ? [{ id: "REG-AA", name: "Addis Ababa" }, { id: "REG-OR", name: "Oromia" }]
            : [{ id: "REG-NRB", name: "Nairobi County" }];
        setBackendResources(prev => ({ ...prev, regions: mockRegions }));
    };

    const handleOpenCreate = () => {
        setEditingId(null);
        setFormData({ federalId: "", regionId: "", assignedAdminId: "", zoneName: "", zoneCode: "" });
        setIsModalOpen(true);
    };

    const handleEdit = (zone) => {
        setEditingId(zone.id);
        handleFederalChange(zone.federalId);
        setFormData({
            federalId: zone.federalId,
            regionId: zone.regionId,
            assignedAdminId: zone.adminId,
            zoneName: zone.name,
            zoneCode: zone.code
        });
        setIsModalOpen(true);
    };

    const handleView = (zone) => {
        toast(`Viewing ${zone.name} (${zone.code})\nLocation: ${zone.regionName}, ${zone.federalName}`, {
            icon: '📍',
            style: { borderRadius: '15px', background: '#312e81', color: '#fff', fontSize: '12px' }
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const fed = backendResources.federalEntities.find(f => f.id === formData.federalId);
        const reg = backendResources.regions.find(r => r.id === formData.regionId);
        const adm = backendResources.availableAdmins.find(a => a.id === formData.assignedAdminId);

        const zoneData = {
            id: editingId || `ZONE-${Math.floor(Math.random() * 10000)}`,
            name: formData.zoneName,
            code: formData.zoneCode,
            federalName: fed?.name || "N/A",
            federalId: formData.federalId,
            regionName: reg?.name || "N/A",
            regionId: formData.regionId,
            adminName: adm?.name || "Unassigned",
            adminId: formData.assignedAdminId,
            status: "Active"
        };

        if (editingId) {
            setZones(zones.map(z => z.id === editingId ? zoneData : z));
            toast.success("Zone updated successfully", { style: { background: '#312e81', color: '#fff' } });
        } else {
            setZones([zoneData, ...zones]);
            toast.success("New zone created", { style: { background: '#312e81', color: '#fff' } });
        }

        setIsModalOpen(false);
    };

    const handleDelete = (id) => {
        if(window.confirm("Are you sure you want to remove this zone?")) {
            setZones(zones.filter(z => z.id !== id));
            toast.error("Zone deleted");
        }
    };

    return (
        <div className="p-6 md:p-10 bg-slate-50 dark:bg-indigo-950 min-h-screen font-sans selection:bg-indigo-200">
            <Toaster position="top-center" />

            {/* --- MODAL --- */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-md bg-indigo-950/40">
                    <form onSubmit={handleSubmit} className="bg-white dark:bg-indigo-900 w-full max-w-2xl rounded-[2.5rem] p-8 shadow-2xl border border-indigo-100 dark:border-indigo-800 animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-2xl font-bold text-indigo-950 dark:text-white">{editingId ? "Edit Zone" : "Create New Zone"}</h2>
                            <button type="button" onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-indigo-50 dark:hover:bg-indigo-800 text-indigo-900 dark:text-indigo-200 rounded-full transition-colors"><X size={20}/></button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <label className="block text-[11px] font-bold text-indigo-900 dark:text-indigo-400 uppercase tracking-wider">Location Hierarchy</label>
                                <select required className="w-full p-4 bg-indigo-50 dark:bg-indigo-950 rounded-xl border-2 border-transparent focus:border-indigo-900 outline-none text-sm font-medium" value={formData.federalId} onChange={(e) => handleFederalChange(e.target.value)}>
                                    <option value="">Select Federal Body</option>
                                    {backendResources.federalEntities.map(fed => <option key={fed.id} value={fed.id}>{fed.name}</option>)}
                                </select>
                                <select required disabled={!formData.federalId} className="w-full p-4 bg-indigo-50 dark:bg-indigo-950 rounded-xl border-2 border-transparent focus:border-indigo-900 outline-none text-sm font-medium disabled:opacity-50" value={formData.regionId} onChange={(e) => setFormData({...formData, regionId: e.target.value})}>
                                    <option value="">Select Region</option>
                                    {backendResources.regions.map(reg => <option key={reg.id} value={reg.id}>{reg.name}</option>)}
                                </select>
                            </div>

                            <div className="space-y-4">
                                <label className="block text-[11px] font-bold text-indigo-900 dark:text-indigo-400 uppercase tracking-wider">Zone Details</label>
                                <select required className="w-full p-4 bg-indigo-50 dark:bg-indigo-950 rounded-xl border-2 border-transparent focus:border-indigo-900 outline-none text-sm font-medium" value={formData.assignedAdminId} onChange={(e) => setFormData({...formData, assignedAdminId: e.target.value})}>
                                    <option value="">Assign Zone Lead</option>
                                    {backendResources.availableAdmins.map(user => <option key={user.id} value={user.id}>{user.name}</option>)}
                                </select>
                                <div className="grid grid-cols-2 gap-3">
                                    <input type="text" required placeholder="Zone Name" className="w-full p-4 bg-indigo-50 dark:bg-indigo-950 rounded-xl border-2 border-transparent focus:border-indigo-900 outline-none text-sm font-medium" value={formData.zoneName} onChange={(e) => setFormData({...formData, zoneName: e.target.value})} />
                                    <input type="text" required placeholder="Code" className="w-full p-4 bg-indigo-50 dark:bg-indigo-950 rounded-xl border-2 border-transparent focus:border-indigo-900 outline-none text-sm font-medium" value={formData.zoneCode} onChange={(e) => setFormData({...formData, zoneCode: e.target.value})} />
                                </div>
                            </div>
                        </div>

                        <button type="submit" className="w-full mt-8 py-4 bg-indigo-900 hover:bg-black text-white rounded-xl font-bold transition-all shadow-lg flex items-center justify-center gap-2">
                            <Save size={18}/> {editingId ? "Update Zone" : "Save Zone"}
                        </button>
                    </form>
                </div>
            )}

            {/* --- HEADER --- */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
                <div className="flex items-center gap-4">
                    <div className="p-4 bg-indigo-900 rounded-2xl text-white shadow-xl"><Map size={28} /></div>
                    <div>
                        <h1 className="text-3xl font-bold text-indigo-950 dark:text-white leading-none tracking-tight">Zones</h1>
                        <p className="text-xs text-indigo-900/60 dark:text-indigo-400 mt-1 font-bold">Manage regional and zonal territories</p>
                    </div>
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-900/40" />
                        <input type="text" placeholder="Search zones..." className="w-full pl-11 pr-4 py-3 bg-white dark:bg-indigo-900 rounded-xl text-sm border-2 border-transparent focus:border-indigo-900 outline-none shadow-sm transition-all font-medium" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                    </div>
                    <button onClick={handleOpenCreate} className="px-6 py-3 bg-indigo-900 hover:bg-black text-white rounded-xl text-sm font-bold flex items-center gap-2 transition-all shadow-lg shrink-0">
                        <Plus size={18}/> Create Zone
                    </button>
                </div>
            </div>

            {/* --- TABLE --- */}
            <div className="bg-white dark:bg-indigo-900 rounded-[2rem] shadow-xl border border-indigo-50 dark:border-indigo-800 overflow-hidden">
                {filteredZones.length > 0 ? (
                    <table className="w-full text-left">
                        <thead>
                        <tr className="bg-indigo-50 dark:bg-white/5 text-[11px] font-bold uppercase text-indigo-900/60 dark:text-indigo-400 tracking-wider">
                            <th className="px-8 py-5">Zone Info</th>
                            <th className="px-6 py-5">Region / Federal</th>
                            <th className="px-6 py-5">Zone Lead</th>
                            <th className="px-8 py-5 text-right">Actions</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-indigo-50 dark:divide-white/5">
                        {filteredZones.map((zone) => (
                            <tr key={zone.id} className="group hover:bg-indigo-50/30 dark:hover:bg-white/[0.02] transition-colors">
                                <td className="px-8 py-5">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-lg bg-indigo-100 dark:bg-indigo-800 flex items-center justify-center text-indigo-900 dark:text-indigo-300"><Navigation size={16} /></div>
                                        <div>
                                            <p className="text-sm font-bold text-indigo-950 dark:text-white">{zone.name}</p>
                                            <p className="text-[11px] text-indigo-900/50 dark:text-indigo-400 font-bold">CODE: {zone.code}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-5">
                                    <p className="text-sm text-indigo-950 dark:text-indigo-100 font-bold">{zone.regionName}</p>
                                    <p className="text-[10px] text-indigo-900/50 dark:text-indigo-400 font-bold uppercase tracking-tighter">{zone.federalName}</p>
                                </td>
                                <td className="px-6 py-5">
                                    <div className="flex items-center gap-2">
                                        <div className="w-7 h-7 rounded-full bg-indigo-900/10 dark:bg-indigo-800 text-indigo-900 dark:text-indigo-200 flex items-center justify-center text-[10px] font-black">{zone.adminName[0]}</div>
                                        <span className="text-sm text-indigo-950 dark:text-indigo-200 font-bold">{zone.adminName}</span>
                                    </div>
                                </td>
                                <td className="px-8 py-5 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <button onClick={() => handleView(zone)} className="p-2 text-indigo-900/40 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-white hover:bg-indigo-100 dark:hover:bg-indigo-800 rounded-lg transition-all" title="View"><Eye size={18} /></button>
                                        <button onClick={() => handleEdit(zone)} className="p-2 text-indigo-900/40 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-white hover:bg-indigo-100 dark:hover:bg-indigo-800 rounded-lg transition-all" title="Edit"><Edit3 size={18} /></button>
                                        <button onClick={() => handleDelete(zone.id)} className="p-2 text-indigo-900/40 dark:text-indigo-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all" title="Delete"><Trash2 size={18} /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                ) : (
                    <div className="p-24 text-center">
                        <SearchX size={44} className="mx-auto text-indigo-100 mb-6" />
                        <h3 className="text-xl font-bold text-indigo-950 dark:text-white">No search matches</h3>
                        <p className="text-sm text-indigo-900/50 dark:text-indigo-400 mt-2 font-medium">We couldn't find any zones matching your query.</p>
                        <button onClick={() => setSearchQuery("")} className="mt-6 text-xs font-black uppercase text-indigo-900 dark:text-indigo-300 underline tracking-widest">Clear Search</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LocalZoneHierarchy;