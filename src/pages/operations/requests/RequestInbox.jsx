import React, { useState, useEffect } from "react";
import { getAllRequests, updateRequestStatus, deleteRequest, updateRequest } from "@/services/requestService";
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
    TrendingUp,
    AlertTriangle,
    Package
} from "lucide-react";
import toast from "react-hot-toast";

const RequestInbox = () => {
    const [requests, setRequests] = useState([]);
    const [staff, setStaff] = useState([]);
    const [loading, setLoading] = useState(true);

    // Modals State
    const [showModal, setShowModal] = useState(false);
    const [viewData, setViewData] = useState(null);
    const [editData, setEditData] = useState(null);
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
            setRequests(reqData);
            setStaff(userData.filter(u => u.role !== 'CLIENT'));
        } catch (err) {
            toast.error("Network synchronization failed");
        } finally {
            setLoading(false);
        }
    };

    const formatStatus = (status) => {
        if (typeof status === 'string' && status.startsWith('{')) {
            try {
                const parsed = JSON.parse(status);
                return parsed.status || parsed.STATUS || "CONFIRMED";
            } catch (e) { return "CONFIRMED"; }
        }
        return status;
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
            setShowModal(false);
            setAssignment({ manager_id: "", technical_manager_id: "", budget: "", end_date: "" });
            loadData();
        } catch (err) { toast.error("Processing failed"); }
    };

    useEffect(() => { loadData(); }, []);

    if (loading) return (
        <div className="flex h-screen items-center justify-center bg-white">
            <div className="flex flex-col items-center gap-4">
                <Loader2 className="animate-spin text-[#004A7C]" size={48} />
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Loading Inventory...</p>
            </div>
        </div>
    );

    return (
        <div className="p-8 max-w-7xl mx-auto bg-white min-h-screen transition-colors duration-300">
            {/* HEADER SECTION */}
            <header className="mb-10 flex justify-between items-end">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2.5 bg-slate-900 text-white rounded-xl shadow-lg shadow-slate-200">
                            <Boxes size={24} />
                        </div>
                        <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">Current Stock</h1>
                    </div>
                    <p className="text-[11px] text-slate-400 font-black uppercase tracking-widest">Global Warehouse Ledger</p>
                </div>

                <div className="flex gap-4">
                    <div className="bg-emerald-50 border border-emerald-100 px-4 py-2 rounded-xl">
                        <p className="text-[9px] font-black text-emerald-600 uppercase">System Status</p>
                        <p className="text-sm font-bold text-emerald-700">Healthy</p>
                    </div>
                </div>
            </header>

            {/* LIST SECTION */}
            <div className="space-y-4">
                {requests.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-[2rem] border-2 border-dashed border-slate-100 text-slate-300">
                        <Package size={48} className="mx-auto mb-4 opacity-20" />
                        <p className="font-black uppercase text-[10px] tracking-widest">No stock records found</p>
                    </div>
                ) : (
                    requests.map((req) => {
                        const cleanStatus = formatStatus(req.status);
                        return (
                            <div key={req.id} className="bg-white border border-slate-100 p-6 rounded-[2rem] flex justify-between items-center shadow-xl shadow-slate-200/40 hover:border-[#004A7C]/30 transition-all group">
                                <div className="flex-1 pr-8">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight group-hover:text-[#004A7C] transition-colors">{req.title}</h2>
                                        <span className="text-[9px] font-black uppercase px-2 py-0.5 bg-slate-100 text-slate-500 rounded-md">REF: {req.id}</span>
                                    </div>
                                    <p className="text-sm text-slate-500 mb-4 line-clamp-1 font-medium italic">"{req.description}"</p>
                                    <div className="flex gap-6 text-[10px] font-black uppercase tracking-wider text-slate-400">
                                        <span className="flex items-center gap-1.5"><User size={14} className="text-slate-300"/> {req.client_name}</span>
                                        <span className="flex items-center gap-1.5"><Calendar size={14} className="text-slate-300"/> {new Date(req.created_at).toLocaleDateString()}</span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-6">
                                    <div className={`px-5 py-2 rounded-full text-[10px] font-black uppercase border ${
                                        cleanStatus === 'APPROVED' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                            cleanStatus === 'REJECTED' ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-amber-50 text-amber-600 border-amber-100'
                                    }`}>
                                        {cleanStatus === 'PENDING' ? 'Pending Review' : cleanStatus}
                                    </div>

                                    <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
                                        <button onClick={() => setViewData(req)} className="p-2 text-slate-400 hover:text-[#004A7C] hover:bg-white rounded-xl transition-all" title="View"><Eye size={18}/></button>
                                        <button onClick={() => setEditData(req)} className="p-2 text-slate-400 hover:text-amber-600 hover:bg-white rounded-xl transition-all" title="Edit"><Edit size={18}/></button>
                                        <button onClick={() => handleDelete(req.id)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-white rounded-xl transition-all" title="Delete"><Trash2 size={18}/></button>
                                    </div>

                                    {cleanStatus === 'PENDING' && (
                                        <button onClick={() => { setSelectedReq(req); setShowModal(true); }} className="bg-[#004A7C] text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-black transition-all shadow-lg shadow-blue-100 active:scale-95">
                                            Verify Stock
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
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-[2.5rem] w-full max-w-lg p-10 relative shadow-2xl border border-slate-100">
                        <button onClick={() => setViewData(null)} className="absolute top-8 right-8 text-slate-300 hover:text-slate-900 transition-colors"><X size={24}/></button>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-[#004A7C]">
                                <Package size={24}/>
                            </div>
                            <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">{viewData.title}</h3>
                        </div>
                        <p className="text-slate-500 font-medium leading-relaxed mb-8 text-lg">
                            {viewData.description}
                        </p>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Originator</p>
                                <p className="font-bold text-slate-800">{viewData.client_name}</p>
                            </div>
                            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Status</p>
                                <p className="font-bold text-[#004A7C] uppercase">{formatStatus(viewData.status)}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ASSIGNMENT MODAL (INITIALIZE) */}
            {showModal && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-[2.5rem] w-full max-w-md shadow-2xl overflow-hidden border border-slate-100">
                        <div className="p-8 border-b bg-slate-50 flex items-center justify-between">
                            <div>
                                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Stock Allocation</h3>
                                <p className="text-[10px] text-[#004A7C] font-black uppercase tracking-widest">{selectedReq?.title}</p>
                            </div>
                            <Package className="text-slate-300" size={32} />
                        </div>
                        <div className="p-8 space-y-5">
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1">Logistics Manager</label>
                                <select
                                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-sm focus:ring-4 focus:ring-blue-50 outline-none transition-all"
                                    value={assignment.manager_id}
                                    onChange={(e) => setAssignment({...assignment, manager_id: e.target.value})}
                                >
                                    <option value="">Choose Personnel</option>
                                    {staff.map(s => <option key={s.id} value={s.id}>{s.name} ({s.role})</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1">Inventory Lead</label>
                                <select
                                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-sm focus:ring-4 focus:ring-blue-50 outline-none transition-all"
                                    value={assignment.technical_manager_id}
                                    onChange={(e) => setAssignment({...assignment, technical_manager_id: e.target.value})}
                                >
                                    <option value="">Choose Personnel</option>
                                    {staff.map(s => <option key={s.id} value={s.id}>{s.name} ({s.role})</option>)}
                                </select>
                            </div>
                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1">Valuation ($)</label>
                                    <input
                                        type="number"
                                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-sm focus:ring-4 focus:ring-blue-50 outline-none transition-all"
                                        value={assignment.budget}
                                        placeholder="0.00"
                                        onChange={(e) => setAssignment({...assignment, budget: e.target.value})}
                                    />
                                </div>
                                <div className="flex-1">
                                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1">Expiry/Review</label>
                                    <input
                                        type="date"
                                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-sm focus:ring-4 focus:ring-blue-50 outline-none transition-all"
                                        value={assignment.end_date}
                                        onChange={(e) => setAssignment({...assignment, end_date: e.target.value})}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="p-8 bg-slate-50 border-t flex gap-4">
                            <button onClick={() => setShowModal(false)} className="flex-1 py-4 font-black text-[10px] uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors">Abort</button>
                            <button onClick={handleFinalizeApproval} className="flex-2 px-8 py-4 bg-[#004A7C] text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-blue-100 hover:bg-black transition-all active:scale-95">Complete Allocation</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RequestInbox;