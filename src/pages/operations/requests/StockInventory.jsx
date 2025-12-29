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
    Package,
    ShieldCheck
} from "lucide-react";
import toast from "react-hot-toast";

const StockInventory = () => {
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
        <div className="flex h-screen items-center justify-center bg-white dark:bg-slate-950 transition-colors">
            <div className="flex flex-col items-center gap-4">
                <Loader2 className="animate-spin text-indigo-900 dark:text-indigo-400" size={48} />
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Loading Inventory...</p>
            </div>
        </div>
    );

    return (
        <div className="p-8 max-w-17xl mx-auto bg-white dark:bg-slate-950 min-h-screen transition-colors duration-300">
            {/* HEADER SECTION */}
            <header className="mb-10 flex justify-between items-end">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2.5 bg-indigo-900 text-white rounded-xl shadow-lg shadow-indigo-200 dark:shadow-none">
                            <Boxes size={24} />
                        </div>
                        <h1 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Current Stock</h1>
                    </div>
                    <p className="text-[11px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-widest">Global Warehouse Ledger</p>
                </div>

                <div className="flex gap-4">
                    <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 px-4 py-2 rounded-xl flex items-center gap-2">
                        <div className="w-2 h-2 bg-indigo-900 dark:bg-indigo-400 rounded-full animate-pulse" />
                        <p className="text-[9px] font-black text-indigo-900 dark:text-indigo-400 uppercase">Vault Active</p>
                    </div>
                </div>
            </header>

            {/* LIST SECTION */}
            <div className="space-y-4">
                {requests.length === 0 ? (
                    <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-[2rem] border-2 border-dashed border-slate-100 dark:border-slate-800 text-slate-300 dark:text-slate-700">
                        <Package size={48} className="mx-auto mb-4 opacity-20" />
                        <p className="font-black uppercase text-[10px] tracking-widest">No stock records found</p>
                    </div>
                ) : (
                    requests.map((req) => {
                        const cleanStatus = formatStatus(req.status);
                        return (
                            <div key={req.id} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-[2rem] flex justify-between items-center shadow-xl shadow-slate-200/40 dark:shadow-none hover:border-indigo-900/30 dark:hover:border-indigo-500/30 transition-all group">
                                <div className="flex-1 pr-8">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h2 className="text-lg font-black text-slate-800 dark:text-slate-100 uppercase tracking-tight group-hover:text-indigo-900 dark:group-hover:text-indigo-400 transition-colors">{req.title}</h2>
                                        <span className="text-[9px] font-black uppercase px-2 py-0.5 bg-indigo-900 dark:bg-indigo-500 text-white rounded-md">REF: {req.id}</span>
                                    </div>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 line-clamp-1 font-medium italic">"{req.description}"</p>
                                    <div className="flex gap-6 text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                                        <span className="flex items-center gap-1.5"><User size={14} className="text-indigo-900/40 dark:text-indigo-400/40"/> {req.client_name}</span>
                                        <span className="flex items-center gap-1.5"><Calendar size={14} className="text-indigo-900/40 dark:text-indigo-400/40"/> {new Date(req.created_at).toLocaleDateString()}</span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-6">
                                    <div className={`px-5 py-2 rounded-full text-[10px] font-black uppercase border ${
                                        cleanStatus === 'APPROVED' ? 'bg-indigo-900 dark:bg-indigo-600 text-white border-indigo-900 dark:border-indigo-600' :
                                            cleanStatus === 'REJECTED' ? 'bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 border-rose-100 dark:border-rose-900/30' :
                                                'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-900/30'
                                    }`}>
                                        {cleanStatus === 'PENDING' ? 'Pending Review' : cleanStatus}
                                    </div>

                                    <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 p-1.5 rounded-2xl border border-slate-100 dark:border-slate-700">
                                        <button onClick={() => setViewData(req)} className="p-2 text-slate-400 dark:text-slate-500 hover:text-indigo-900 dark:hover:text-indigo-400 hover:bg-white dark:hover:bg-slate-700 rounded-xl transition-all"><Eye size={18}/></button>
                                        <button onClick={() => setEditData(req)} className="p-2 text-slate-400 dark:text-slate-500 hover:text-indigo-900 dark:hover:text-indigo-400 hover:bg-white dark:hover:bg-slate-700 rounded-xl transition-all"><Edit size={18}/></button>
                                        <button onClick={() => handleDelete(req.id)} className="p-2 text-slate-400 dark:text-slate-500 hover:text-rose-600 hover:bg-white dark:hover:bg-slate-700 rounded-xl transition-all"><Trash2 size={18}/></button>
                                    </div>

                                    {cleanStatus === 'PENDING' && (
                                        <button onClick={() => { setSelectedReq(req); setShowModal(true); }} className="bg-indigo-900 dark:bg-indigo-600 text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-black dark:hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-100 dark:shadow-none active:scale-95">
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
                <div className="fixed inset-0 bg-indigo-950/40 dark:bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] w-full max-w-lg p-10 relative shadow-2xl border border-indigo-50 dark:border-slate-800">
                        <button onClick={() => setViewData(null)} className="absolute top-8 right-8 text-slate-300 dark:text-slate-600 hover:text-indigo-900 dark:hover:text-white transition-colors"><X size={24}/></button>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-12 h-12 bg-indigo-900 dark:bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
                                <Package size={24}/>
                            </div>
                            <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">{viewData.title}</h3>
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed mb-8 text-lg">
                            {viewData.description}
                        </p>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700">
                                <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase mb-1">Originator</p>
                                <p className="font-bold text-slate-800 dark:text-slate-200">{viewData.client_name}</p>
                            </div>
                            <div className="bg-indigo-900 dark:bg-indigo-600 p-4 rounded-2xl shadow-lg shadow-indigo-100 dark:shadow-none">
                                <p className="text-[9px] font-black text-indigo-100 dark:text-indigo-200 uppercase mb-1">Status</p>
                                <p className="font-bold text-white uppercase tracking-widest">{formatStatus(viewData.status)}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ASSIGNMENT MODAL */}
            {showModal && (
                <div className="fixed inset-0 bg-indigo-950/40 dark:bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] w-full max-w-md shadow-2xl overflow-hidden border border-indigo-50 dark:border-slate-800">
                        <div className="p-8 border-b dark:border-slate-800 bg-indigo-900 flex items-center justify-between text-white">
                            <div>
                                <h3 className="text-xl font-black uppercase tracking-tight">Stock Allocation</h3>
                                <p className="text-[10px] text-indigo-200 font-black uppercase tracking-widest">{selectedReq?.title}</p>
                            </div>
                            <ShieldCheck className="text-white/30" size={32} />
                        </div>
                        <div className="p-8 space-y-5">
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase mb-2 ml-1">Logistics Manager</label>
                                <select
                                    className="w-full p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl font-bold text-sm text-slate-800 dark:text-slate-200 focus:ring-4 focus:ring-indigo-50 dark:focus:ring-indigo-900/20 focus:border-indigo-900 outline-none transition-all"
                                    value={assignment.manager_id}
                                    onChange={(e) => setAssignment({...assignment, manager_id: e.target.value})}
                                >
                                    <option value="">Choose Personnel</option>
                                    {staff.map(s => <option key={s.id} value={s.id}>{s.name} ({s.role})</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase mb-2 ml-1">Inventory Lead</label>
                                <select
                                    className="w-full p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl font-bold text-sm text-slate-800 dark:text-slate-200 focus:ring-4 focus:ring-indigo-50 dark:focus:ring-indigo-900/20 focus:border-indigo-900 outline-none transition-all"
                                    value={assignment.technical_manager_id}
                                    onChange={(e) => setAssignment({...assignment, technical_manager_id: e.target.value})}
                                >
                                    <option value="">Choose Personnel</option>
                                    {staff.map(s => <option key={s.id} value={s.id}>{s.name} ({s.role})</option>)}
                                </select>
                            </div>
                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase mb-2 ml-1">Valuation ($)</label>
                                    <input
                                        type="number"
                                        className="w-full p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl font-bold text-sm text-slate-800 dark:text-slate-200 focus:ring-4 focus:ring-indigo-50 dark:focus:ring-indigo-900/20 focus:border-indigo-900 outline-none transition-all"
                                        value={assignment.budget}
                                        placeholder="0.00"
                                        onChange={(e) => setAssignment({...assignment, budget: e.target.value})}
                                    />
                                </div>
                                <div className="flex-1">
                                    <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase mb-2 ml-1">Expiry/Review</label>
                                    <input
                                        type="date"
                                        className="w-full p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl font-bold text-sm text-slate-800 dark:text-slate-200 focus:ring-4 focus:ring-indigo-50 dark:focus:ring-indigo-900/20 focus:border-indigo-900 outline-none transition-all"
                                        value={assignment.end_date}
                                        onChange={(e) => setAssignment({...assignment, end_date: e.target.value})}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="p-8 bg-slate-50 dark:bg-slate-800/50 border-t dark:border-slate-800 flex gap-4">
                            <button onClick={() => setShowModal(false)} className="flex-1 py-4 font-black text-[10px] uppercase tracking-widest text-slate-400 dark:text-slate-500 hover:text-indigo-900 dark:hover:text-white transition-colors">Abort</button>
                            <button onClick={handleFinalizeApproval} className="flex-2 px-8 py-4 bg-indigo-900 dark:bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-indigo-200 dark:shadow-none hover:bg-black dark:hover:bg-indigo-500 transition-all active:scale-95">Complete Allocation</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StockInventory;