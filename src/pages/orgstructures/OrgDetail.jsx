import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    ArrowLeft, Loader2, Eye, UserPlus, Check,
    Edit3, X, ChevronRight, Building2, Layers, Users, Trash2, LogOut, Search, ChevronLeft
} from "lucide-react";
import api from "../../axios";
import toast from "react-hot-toast";

const TreeItem = ({ item, currentId, onNavigate }) => {
    const itemId = item.id.toString().includes('-') ? item.id.split('-')[1] : item.id;
    const isCurrent = itemId.toString() === currentId.toString();

    // Check if this folder contains the page we are currently looking at
    const hasActiveChild = useCallback((node) => {
        const nodeId = node.id.toString().includes('-') ? node.id.split('-')[1] : node.id;
        if (nodeId.toString() === currentId.toString()) return true;
        if (node.submenu) return node.submenu.some(child => hasActiveChild(child));
        return false;
    }, [currentId]);

    const [isOpen, setIsOpen] = useState(false);

    // Auto-open the folder if the current page is inside it
    useEffect(() => {
        if (isCurrent || hasActiveChild(item)) {
            setIsOpen(true);
        }
    }, [currentId, item, isCurrent, hasActiveChild]);

    return (
        <div className="ml-3 border-l border-white/10 pl-3 my-1">
            <div
                className={`group flex items-center gap-2 p-2.5 rounded-xl text-[10px] font-black uppercase transition-all duration-200 ${
                    isCurrent
                        ? 'bg-white text-indigo-900 shadow-lg scale-[1.02]'
                        : 'text-indigo-100 hover:bg-white/10'
                }`}
            >
                {/* Toggle Arrow */}
                {item.submenu?.length > 0 ? (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setIsOpen(!isOpen);
                        }}
                        className="p-1 hover:bg-white/20 rounded-lg transition-colors"
                    >
                        <ChevronRight size={12} className={`transition-transform duration-300 ${isOpen ? 'rotate-90' : ''}`} />
                    </button>
                ) : (
                    <div className="w-4 h-1 bg-white/20 rounded-full ml-1" />
                )}

                {/* Item Label - Clicking this navigates */}
                <span
                    onClick={() => onNavigate(item.type, itemId)}
                    className="truncate flex-1 tracking-wider cursor-pointer"
                >
                    {item.label}
                </span>
                <Eye size={12} className={`opacity-0 group-hover:opacity-100 ${isCurrent ? 'hidden' : ''}`} />
            </div>

            {isOpen && item.submenu && (
                <div className="mt-1 space-y-1 animate-in fade-in slide-in-from-left-2 duration-300">
                    {item.submenu.map(child => (
                        <TreeItem key={child.id} item={child} currentId={currentId} onNavigate={onNavigate} />
                    ))}
                </div>
            )}
        </div>
    );
};

const OrgDetail = () => {
    const { type, id } = useParams();
    const navigate = useNavigate();

    const [data, setData] = useState(null);
    const [subUnits, setSubUnits] = useState([]);
    const [fullStructure, setFullStructure] = useState([]);
    const [personnel, setPersonnel] = useState([]);
    const [availableUsers, setAvailableUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    const [isEditing, setIsEditing] = useState(false);
    const [editName, setEditName] = useState("");
    const [showForm, setShowForm] = useState(false);
    const [showAssignForm, setShowAssignForm] = useState(false);
    const [formData, setFormData] = useState({ name: "" });
    const [assignData, setAssignData] = useState({ user_id: "", role: "" });

    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6;

    const fetchDetails = useCallback(async () => {
        try {
            setLoading(true);
            const [detailRes, structureRes, personnelRes, usersRes] = await Promise.all([
                api.get(`/org/details/${id}?type=${type}`),
                api.get(`/org/structure`),
                api.get(`/org/personnel/${id}?type=${type}`),
                api.get('/users')
            ]);
            setData(detailRes.data);
            setEditName(detailRes.data.name);
            setFullStructure(structureRes.data);
            setPersonnel(personnelRes.data || []);
            setAvailableUsers(usersRes.data || []);

            let children = [];
            const findChildren = (nodes) => {
                for (let node of nodes) {
                    const nodeId = node.id.toString().includes('-') ? node.id.split('-')[1] : node.id;
                    if (nodeId.toString() === id.toString() && node.type === type) {
                        children = node.submenu || [];
                        return;
                    }
                    if (node.submenu) findChildren(node.submenu);
                }
            };
            findChildren(structureRes.data);
            setSubUnits(children);
        } catch (err) {
            toast.error("Could not load data");
        } finally {
            setLoading(false);
        }
    }, [id, type]);

    useEffect(() => { fetchDetails(); }, [fetchDetails]);

    const filteredPersonnel = useMemo(() => {
        return personnel.filter(p =>
            p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.role?.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [personnel, searchQuery]);

    const paginatedPersonnel = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredPersonnel.slice(start, start + itemsPerPage);
    }, [filteredPersonnel, currentPage]);

    const totalPages = Math.ceil(filteredPersonnel.length / itemsPerPage);

    const handleRename = async () => {
        if (!editName.trim() || editName === data.name) return setIsEditing(false);
        try {
            await api.put(`/org/${id}`, { name: editName, type: type });
            toast.success("Name updated");
            setIsEditing(false);
            fetchDetails();
        } catch (err) { toast.error("Failed to update"); }
    };

    const handleDelete = async () => {
        if (!window.confirm(`Are you sure you want to delete this ${type.toLowerCase()}?`)) return;
        try {
            await api.delete(`/org/${id}?type=${type}`);
            toast.success("Deleted");
            navigate('/dashboard');
        } catch (err) { toast.error("Delete failed"); }
    };

    const handleAddSubUnit = async (e) => {
        e.preventDefault();
        const nextMap = { ORGANIZATION: 'WING', WING: 'DIVISION', DIVISION: 'UNIT' };
        try {
            await api.post("/org/register", { name: formData.name, type: nextMap[type], parent_id: id });
            toast.success("Added successfully");
            setShowForm(false);
            setFormData({ name: "" });
            fetchDetails();
        } catch (err) { toast.error("Error adding branch"); }
    };

    const handleAssignLeadership = async (e) => {
        e.preventDefault();
        const roleMapping = {
            'Wing Director': 1, 'Deputy Wing Director': 4, 'Wing Staff': 7,
            'Division Director': 2, 'Divisional Supervisor': 5,
            'Team Leader': 3, 'Staff Member': 8
        };
        try {
            await api.post('/org/assign-leadership', {
                user_id: assignData.user_id,
                unit_id: id,
                type: type,
                role_id: roleMapping[assignData.role]
            });
            toast.success("Person assigned");
            setShowAssignForm(false);
            setAssignData({ user_id: "", role: "" });
            fetchDetails();
        } catch (err) { toast.error("Assignment failed"); }
    };

    const handleUnassign = async (userId) => {
        if (!window.confirm("Remove this person from the list?")) return;
        try {
            await api.post('/org/unassign-personnel', { user_id: userId, type });
            fetchDetails();
        } catch (err) { toast.error("Failed to remove"); }
    };

    const getRoleOptions = () => {
        if (type === 'WING') return ['Wing Director', 'Deputy Wing Director', 'Wing Staff'];
        if (type === 'DIVISION') return ['Division Director', 'Divisional Supervisor'];
        if (type === 'UNIT') return ['Team Leader', 'Staff Member'];
        return ['Manager', 'Employee'];
    };

    if (loading) return (
        <div className="h-screen flex flex-col items-center justify-center bg-white gap-4">
            <Loader2 className="animate-spin text-indigo-900" size={40} />
            <p className="text-[10px] font-black uppercase text-indigo-900 tracking-widest">Loading...</p>
        </div>
    );

    return (
        <div className="p-8 max-w-7xl mx-auto min-h-screen bg-white text-slate-900">
            {/* Top Bar */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-12 gap-6">
                <div className="flex items-center gap-6">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-4 bg-indigo-900 text-white rounded-2xl shadow-lg hover:bg-indigo-800 transition-all active:scale-95"
                    >
                        <ArrowLeft size={20}/>
                    </button>
                    {isEditing ? (
                        <div className="flex items-center gap-2 bg-white border-2 border-indigo-900 p-2 rounded-xl shadow-xl">
                            <input autoFocus className="bg-transparent px-4 py-1 text-2xl font-black uppercase outline-none text-indigo-900 w-full" value={editName} onChange={(e) => setEditName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleRename()}/>
                            <button onClick={handleRename} className="p-2 bg-indigo-900 text-white rounded-lg"><Check size={18}/></button>
                            <button onClick={() => setIsEditing(false)} className="p-2 text-rose-600"><X size={18}/></button>
                        </div>
                    ) : (
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-1">{type} Area</span>
                            <div className="flex items-center gap-4 group">
                                <h1 className="text-4xl font-black uppercase tracking-tighter text-indigo-900">{data?.name}</h1>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                                    <button onClick={() => setIsEditing(true)} className="p-2 text-slate-300 hover:text-indigo-900 transition-colors"><Edit3 size={18}/></button>
                                    <button onClick={handleDelete} className="p-2 text-slate-300 hover:text-rose-600 transition-colors"><Trash2 size={18}/></button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex gap-3 w-full lg:w-auto">
                    <button onClick={() => setShowAssignForm(!showAssignForm)} className={`flex-1 lg:flex-none px-6 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all border-2 ${showAssignForm ? 'border-rose-600 text-rose-600' : 'border-indigo-900 text-indigo-900 hover:bg-indigo-50'}`}>
                        {showAssignForm ? "Cancel" : "Add Person"}
                    </button>
                    {type !== 'UNIT' && (
                        <button onClick={() => setShowForm(!showForm)} className="flex-1 lg:flex-none bg-indigo-900 text-white px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-lg hover:bg-indigo-800 transition-all">
                            {showForm ? "Cancel" : "Add New Sub-Area"}
                        </button>
                    )}
                </div>
            </div>

            {/* Forms */}
            <div className="space-y-4 mb-10">
                {showForm && (
                    <form onSubmit={handleAddSubUnit} className="p-6 bg-white border-2 border-indigo-900 rounded-[2rem] flex gap-4 shadow-xl">
                        <input autoFocus className="flex-1 p-5 bg-slate-50 border border-slate-100 rounded-2xl outline-none text-indigo-900 uppercase text-sm font-black" placeholder="Enter name here..." value={formData.name} onChange={(e) => setFormData({name: e.target.value})} required />
                        <button type="submit" className="bg-indigo-900 text-white px-10 rounded-2xl font-black uppercase text-[10px] hover:bg-indigo-800">Create</button>
                    </form>
                )}
                {showAssignForm && (
                    <form onSubmit={handleAssignLeadership} className="p-8 bg-white border-2 border-indigo-900 rounded-[2.5rem] grid grid-cols-1 md:grid-cols-3 gap-6 shadow-xl">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-indigo-900 ml-2">Choose Person</label>
                            <select className="w-full p-4 bg-slate-50 border border-slate-100 text-indigo-900 rounded-xl outline-none font-black" value={assignData.user_id} onChange={(e) => setAssignData({...assignData, user_id: e.target.value})} required>
                                <option value="">Select from list...</option>
                                {availableUsers.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-indigo-900 ml-2">Choose Role</label>
                            <select className="w-full p-4 bg-slate-50 border border-slate-100 text-indigo-900 rounded-xl outline-none font-black" value={assignData.role} onChange={(e) => setAssignData({...assignData, role: e.target.value})} required>
                                <option value="">Select role...</option>
                                {getRoleOptions().map(r => <option key={r} value={r}>{r}</option>)}
                            </select>
                        </div>
                        <div className="flex items-end">
                            <button type="submit" className="w-full bg-indigo-900 text-white p-4 rounded-xl font-black uppercase text-[10px] hover:bg-indigo-800 shadow-md">Confirm</button>
                        </div>
                    </form>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-2 space-y-10">
                    {/* Staff List */}
                    <section className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm relative">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                            <div>
                                <h3 className="font-black text-[10px] uppercase text-indigo-600 tracking-[0.3em] flex items-center gap-2 mb-4"><Users size={16} /> Staff Members</h3>
                                <div className="relative">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={14} />
                                    <input
                                        type="text"
                                        placeholder="Search by name..."
                                        className="pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-[10px] font-black uppercase outline-none w-64 text-indigo-900 focus:bg-white transition-all"
                                        value={searchQuery}
                                        onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {paginatedPersonnel.length > 0 ? paginatedPersonnel.map(p => (
                                <div key={p.id} className="relative p-5 border border-slate-100 rounded-2xl flex items-center gap-4 bg-white hover:shadow-md transition-all group border-l-4 border-l-indigo-900">
                                    <div className="w-12 h-12 rounded-xl bg-indigo-900 text-white flex items-center justify-center font-black text-lg shadow-sm">
                                        {p.name?.[0]}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-black text-sm uppercase truncate text-indigo-900">{p.name}</p>
                                        <p className="text-[10px] text-emerald-600 font-black uppercase tracking-widest">{p.role}</p>
                                    </div>
                                    <button onClick={() => handleUnassign(p.id)} className="absolute top-2 right-2 p-2 opacity-0 group-hover:opacity-100 text-slate-300 hover:text-rose-600 transition-all"><LogOut size={14} /></button>
                                </div>
                            )) : <p className="col-span-2 text-center py-10 text-slate-300 font-black uppercase text-[10px] tracking-widest">No results found</p>}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-center gap-4 mt-8 pt-6 border-t border-slate-50">
                                <button disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)} className="p-2 text-indigo-900 disabled:opacity-20 transition-all"><ChevronLeft size={20}/></button>
                                <span className="text-[10px] font-black uppercase text-slate-400">Page {currentPage} / {totalPages}</span>
                                <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(prev => prev + 1)} className="p-2 text-indigo-900 disabled:opacity-20 transition-all"><ChevronRight size={20}/></button>
                            </div>
                        )}
                    </section>

                    {/* Sub-Areas */}
                    {type !== 'UNIT' && (
                        <section className="bg-white p-10 rounded-[3rem] border border-slate-100">
                            <h3 className="font-black text-[10px] uppercase text-indigo-600 tracking-[0.3em] mb-8 flex items-center gap-2"><Layers size={16} /> Sub-Areas</h3>
                            <div className="grid gap-3">
                                {subUnits.map(unit => {
                                    const subUnitId = unit.id.toString().includes('-') ? unit.id.split('-')[1] : unit.id;
                                    return (
                                        <div key={unit.id} className="p-5 bg-white rounded-2xl flex justify-between items-center border border-slate-100 hover:border-indigo-900 hover:shadow-xl transition-all group">
                                            <div className="flex items-center gap-4">
                                                <div className="w-1.5 h-8 rounded-full bg-slate-100 group-hover:bg-indigo-900 transition-colors"/>
                                                <div>
                                                    <p className="font-black text-xs uppercase text-indigo-900">{unit.label}</p>
                                                    <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">{unit.type}</p>
                                                </div>
                                            </div>
                                            <button onClick={() => navigate(`/orgstructures/${unit.type}/${subUnitId}`)} className="bg-indigo-900 text-white px-6 py-2.5 rounded-xl text-[10px] font-black uppercase hover:bg-indigo-800 transition-all">Open Area</button>
                                        </div>
                                    );
                                })}
                            </div>
                        </section>
                    )}
                </div>

                {/* Sidebar Menu */}
                <aside className="bg-indigo-900 text-white p-8 rounded-[3rem] h-fit sticky top-8 shadow-2xl overflow-hidden">
                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-8 border-b border-white/10 pb-4">
                            <p className="text-[10px] font-black text-indigo-200 uppercase tracking-[0.2em]">Full Map</p>
                            <Building2 size={16} className="text-white opacity-40" />
                        </div>
                        <div className="space-y-4">
                            {fullStructure.map(org => {
                                const orgId = org.id.toString().includes('-') ? org.id.split('-')[1] : org.id;
                                const isOrgActive = type === 'ORGANIZATION' && id.toString() === orgId.toString();
                                return (
                                    <div key={org.id} className="space-y-2">
                                        <div
                                            className={`p-3 rounded-xl text-[10px] font-black uppercase flex items-center justify-between transition-all ${
                                                isOrgActive ? 'bg-white text-indigo-900 shadow-xl' : 'hover:bg-white/10 text-indigo-100'
                                            }`}
                                        >
                                            <div
                                                onClick={() => navigate(`/orgstructures/ORGANIZATION/${orgId}`)}
                                                className="flex items-center gap-3 cursor-pointer flex-1"
                                            >
                                                <Building2 size={16} />{org.label}
                                            </div>
                                            <ChevronRight size={14} className={isOrgActive ? 'rotate-90' : 'opacity-20'} />
                                        </div>
                                        {org.submenu?.map(wing => (
                                            <TreeItem key={wing.id} item={wing} currentId={id} onNavigate={(t, i) => navigate(`/orgstructures/${t}/${i}`)} />
                                        ))}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
};

export default OrgDetail;