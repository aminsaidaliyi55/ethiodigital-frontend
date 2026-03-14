import React, { useState, useEffect } from "react";
import {
    getAllRequests,
    updateRequestStatus,
    deleteRequest,
    updateRequest
} from "@/services/requestService";
import { getUsers } from "@/services/userService";
import {
    Check,
    X,
    User,
    Loader2,
    Boxes,
    Calendar,
    Edit,
    Trash2,
    Eye,
    Package,
    ChevronRight,
    Search
} from "lucide-react";
import toast from "react-hot-toast";

const RequestInbox = () => {
    const [requests, setRequests] = useState([]);
    const [staff, setStaff] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    // Modals State
    const [viewData, setViewData] = useState(null);
    const [editData, setEditData] = useState(null);
    const [showAllocModal, setShowAllocModal] = useState(false);
    const [selectedReq, setSelectedReq] = useState(null);

    // Stock Assignment State
    const [assignment, setAssignment] = useState({
        manager_id: "",
        technical_manager_id: "",
        budget: "",
        end_date: ""
    });

    const loadData = async () => {
        setLoading(true);
        try {
            const [reqData, userData] = await Promise.all([
                getAllRequests(),
                getUsers()
            ]);
            setRequests(Array.isArray(reqData) ? reqData : []);
            setStaff(userData.filter(u => u.role !== 'CLIENT'));
        } catch (err) {
            toast.error("Network synchronization failed");
        } finally {
            setLoading(false);
        }
    };

    const formatStatus = (status) => {
        if (!status) return "PENDING";
        if (typeof status === 'string' && status.startsWith('{')) {
            try {
                const parsed = JSON.parse(status);
                return (parsed.status || parsed.STATUS || "APPROVED").toUpperCase();
            } catch (e) { return "APPROVED"; }
        }
        return status.toUpperCase();
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Permanently remove this stock record?")) return;
        try {
            await deleteRequest(id);
            toast.success("Record removed from ledger");
            loadData();
        } catch (err) { toast.error("Action failed"); }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            await updateRequest(editData.id, {
                title: editData.title,
                description: editData.description
            });
            toast.success("Stock details updated");
            setEditData(null);
            loadData();
        } catch (err) { toast.error("Update failed"); }
    };

    const handleFinalizeApproval = async () => {
        if (!assignment.manager_id || !assignment.technical_manager_id) {
            return toast.error("Please assign logistics personnel");
        }
        try {
            await updateRequestStatus(selectedReq.id, {
                status: 'APPROVED',
                ...assignment
            });
            toast.success("Stock verified and allocated");
            setShowAllocModal(false);
            setAssignment({ manager_id: "", technical_manager_id: "", budget: "", end_date: "" });
            loadData();
        } catch (err) { toast.error("Processing failed"); }
    };

    useEffect(() => { loadData(); }, []);

    const filteredRequests = requests.filter(req =>
        req.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.client_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return (
        <div className="flex h-screen items-center justify-center bg-white">
            <div className="flex flex-col items-center gap-4">
                <Loader2 className="animate-spin text-[#004A7C]" size={48} />
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Syncing Ledger...</p>
            </div>
        </div>
    );

    return (
        <div className="p-8 max-w-7xl mx-auto bg-white min-h-screen">
            {/* HEADER SECTION */}
            <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <div className="flex items-center gap-4 mb-2">
                        <div className="p-3 bg-slate-900 text-white rounded-2xl shadow-xl">
                            <Boxes size={28} />
                        </div>
                        <div>
                            <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tighter leading-none">Inventory</h1>
                            <p className="text-[11px] text-[#004A7C] font-black uppercase tracking-[0.3em] mt-1">Global Logistics Inbox</p>
                        </div>
                    </div>
                </div>

                <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#004A7C] transition-colors" size={18} />
                    <input
                        type="text"
                        placeholder="SEARCH RECORDS..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-12 pr-6 py-4 bg-slate-50 border-none rounded-2xl text-[10px] font-black uppercase tracking-widest w-full md:w-80 focus:ring-2 focus:ring-[#004A7C]/20 transition-all outline-none"
                    />
                </div>
            </header>

            {/* LIST SECTION */}
            <div className="space-y-4">
                {filteredRequests.length === 0 ? (
                    <div className="text-center py-32 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
                        <Package size={64} className="mx-auto mb-6 text-slate-200" />
                        <p className="font-black uppercase text-[12px] tracking-[0.4em] text-slate-400">No matching stock entries</p>
                    </div>
                ) : (
                    filteredRequests.map((req) => {
                        const status = formatStatus(req.status);
                        return (
                            <div key={req.id} className="bg-white border border-slate-100 p-8 rounded-[2.5rem] flex flex-wrap md:flex-nowrap justify-between items-center shadow-2xl shadow-slate-200/50 hover:border-[#004A7C]/40 transition-all group relative overflow-hidden">
                                <div className="flex-1 min-w-[300px]">
                                    <div className="flex items-center gap-3 mb-3">
                                        <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight group-hover:text-[#004A7C] transition-colors">{req.title}</h2>
                                        <span className="text-[9px] font-black uppercase px-3 py-1 bg-slate-100 text-slate-500 rounded-lg">ID: {req.id}</span>
                                    </div>
                                    <p className="text-slate-500 text-sm mb-6 line-clamp-1 font-medium pr-10">
                                        {req.description}
                                    </p>
                                    <div className="flex gap-8 items-center">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                                                <User size={14} />
                                            </div>
                                            <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{req.client_name}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-slate-400">
                                            <Calendar size={14} />
                                            <span className="text-[10px] font-black uppercase tracking-widest">{new Date(req.created_at).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 mt-6 md:mt-0">
                                    <div className={`px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase border tracking-tighter ${
                                        status === 'APPROVED' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                            status === 'REJECTED' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                                                'bg-amber-50 text-amber-600 border-amber-100 shadow-sm shadow-amber-100/50'
                                    }`}>
                                        {status === 'PENDING' ? 'Awaiting Review' : status}
                                    </div>

                                    <div className="flex items-center gap-1 bg-slate-50 p-2 rounded-2xl border border-slate-100">
                                        <button onClick={() => setViewData(req)} className="p-2.5 text-slate-400 hover:text-[#004A7C] hover:bg-white rounded-xl transition-all" title="Inspect"><Eye size={20}/></button>
                                        <button onClick={() => setEditData(req)} className="p-2.5 text-slate-400 hover:text-amber-600 hover:bg-white rounded-xl transition-all" title="Modify"><Edit size={20}/></button>
                                        <button onClick={() => handleDelete(req.id)} className="p-2.5 text-slate-400 hover:text-rose-600 hover:bg-white rounded-xl transition-all" title="Remove"><Trash2 size={20}/></button>
                                    </div>

                                    {status === 'PENDING' && (
                                        <button onClick={() => { setSelectedReq(req); setShowAllocModal(true); }} className="bg-[#004A7C] text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-black transition-all shadow-xl shadow-blue-100 active:scale-95 flex items-center gap-2">
                                            Allocate <ChevronRight size={14} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* VIEW MODAL */}
            {viewData && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[100] p-4">
                    <div className="bg-white rounded-[3rem] w-full max-w-xl p-12 relative shadow-2xl border border-slate-100 animate-in fade-in zoom-in duration-300">
                        <button onClick={() => setViewData(null)} className="absolute top-10 right-10 text-slate-300 hover:text-slate-900 transition-colors p-2 hover:bg-slate-50 rounded-full"><X size={28}/></button>
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-16 h-16 bg-[#004A7C]/5 rounded-[1.5rem] flex items-center justify-center text-[#004A7C]">
                                <Package size={32}/>
                            </div>
                            <div>
                                <h3 className="text-3xl font-black text-slate-900 uppercase tracking-tighter leading-none">{viewData.title}</h3>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">Document Reference: #{viewData.id}</p>
                            </div>
                        </div>
                        <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100 mb-8">
                            <p className="text-slate-600 font-medium leading-relaxed text-lg italic">
                                "{viewData.description}"
                            </p>
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                            <div className="p-6 rounded-2xl bg-white border border-slate-100 shadow-sm">
                                <p className="text-[9px] font-black text-slate-400 uppercase mb-2 tracking-widest">Authorized By</p>
                                <p className="font-bold text-slate-800 flex items-center gap-2"><User size={14} className="text-[#004A7C]"/> {viewData.client_name}</p>
                            </div>
                            <div className="p-6 rounded-2xl bg-white border border-slate-100 shadow-sm">
                                <p className="text-[9px] font-black text-slate-400 uppercase mb-2 tracking-widest">Entry Date</p>
                                <p className="font-bold text-slate-800 flex items-center gap-2"><Calendar size={14} className="text-[#004A7C]"/> {new Date(viewData.created_at).toLocaleDateString()}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* EDIT MODAL */}
            {editData && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[100] p-4">
                    <form onSubmit={handleUpdate} className="bg-white rounded-[3rem] w-full max-w-lg p-12 shadow-2xl border border-slate-100 animate-in fade-in zoom-in duration-300">
                        <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter mb-8">Edit Record</h3>
                        <div className="space-y-6">
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1 tracking-widest">Title</label>
                                <input
                                    className="w-full p-5 bg-slate-50 border border-slate-100 rounded-[1.5rem] font-bold text-sm focus:ring-4 focus:ring-[#004A7C]/5 outline-none transition-all"
                                    value={editData.title}
                                    onChange={(e) => setEditData({...editData, title: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1 tracking-widest">Description</label>
                                <textarea
                                    rows="4"
                                    className="w-full p-5 bg-slate-50 border border-slate-100 rounded-[1.5rem] font-bold text-sm focus:ring-4 focus:ring-[#004A7C]/5 outline-none transition-all resize-none"
                                    value={editData.description}
                                    onChange={(e) => setEditData({...editData, description: e.target.value})}
                                />
                            </div>
                        </div>
                        <div className="flex gap-4 mt-10">
                            <button type="button" onClick={() => setEditData(null)} className="flex-1 py-5 font-black text-[10px] uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors">Abort</button>
                            <button type="submit" className="flex-2 px-10 py-5 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:bg-black transition-all">Save Changes</button>
                        </div>
                    </form>
                </div>
            )}

            {/* ALLOCATION MODAL */}
            {showAllocModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[100] p-4">
                    <div className="bg-white rounded-[3rem] w-full max-w-md shadow-2xl overflow-hidden border border-slate-100 animate-in slide-in-from-bottom duration-500">
                        <div className="p-10 border-b bg-slate-50/50 flex items-center justify-between">
                            <div>
                                <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight leading-none">Allocation</h3>
                                <p className="text-[10px] text-[#004A7C] font-black uppercase tracking-widest mt-2">{selectedReq?.title}</p>
                            </div>
                            <div className="p-4 bg-white rounded-2xl shadow-sm border border-slate-100">
                                <Package className="text-[#004A7C]" size={28} />
                            </div>
                        </div>
                        <div className="p-10 space-y-6">
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase mb-3 ml-1 tracking-widest">Logistics Manager</label>
                                <select
                                    className="w-full p-5 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-sm focus:ring-4 focus:ring-blue-50 outline-none transition-all appearance-none"
                                    value={assignment.manager_id}
                                    onChange={(e) => setAssignment({...assignment, manager_id: e.target.value})}
                                >
                                    <option value="">Select Personnel</option>
                                    {staff.map(s => <option key={s.id} value={s.id}>{s.name} — {s.role}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase mb-3 ml-1 tracking-widest">Technical Lead</label>
                                <select
                                    className="w-full p-5 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-sm focus:ring-4 focus:ring-blue-50 outline-none transition-all appearance-none"
                                    value={assignment.technical_manager_id}
                                    onChange={(e) => setAssignment({...assignment, technical_manager_id: e.target.value})}
                                >
                                    <option value="">Select Personnel</option>
                                    {staff.map(s => <option key={s.id} value={s.id}>{s.name} — {s.role}</option>)}
                                </select>
                            </div>
                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-3 ml-1 tracking-widest">Budget (ETB)</label>
                                    <input
                                        type="number"
                                        className="w-full p-5 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-sm outline-none"
                                        placeholder="0.00"
                                        onChange={(e) => setAssignment({...assignment, budget: e.target.value})}
                                    />
                                </div>
                                <div className="flex-1">
                                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-3 ml-1 tracking-widest">Due Date</label>
                                    <input
                                        type="date"
                                        className="w-full p-5 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-sm outline-none"
                                        onChange={(e) => setAssignment({...assignment, end_date: e.target.value})}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="p-10 bg-slate-50/50 border-t flex gap-4">
                            <button onClick={() => setShowAllocModal(false)} className="flex-1 py-5 font-black text-[10px] uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors">Abort</button>
                            <button onClick={handleFinalizeApproval} className="flex-2 px-10 py-5 bg-[#004A7C] text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-2xl shadow-blue-200/50 hover:bg-black transition-all">Verify & Approve</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RequestInbox;