import React, { useState, useEffect, useMemo } from "react";
import {
    getAllRequests,
    updateRequestStatus,
    getOrders,
    updateOrderStatus
} from "@/services/requestService";
import { getUsers } from "@/services/userService";
import {
    X, Loader2, Boxes, Eye, TrendingUp, Package, ShieldCheck,
    ShoppingCart, Receipt, ImageIcon, Search, Activity, Clock,
    CheckCircle2, XCircle, RotateCcw
} from "lucide-react";
import toast from "react-hot-toast";
import DataTable from "./DataTable.jsx";

const StockInventory = () => {
    const [requests, setRequests] = useState([]);
    const [orders, setOrders] = useState([]);
    const [staff, setStaff] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("requests");
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [viewData, setViewData] = useState(null);
    const [showAllocModal, setShowAllocModal] = useState(false);
    const [selectedReq, setSelectedReq] = useState(null);
    const [assignment, setAssignment] = useState({
        manager_id: "",
        technical_manager_id: "",
        budget: "",
        end_date: ""
    });

    const loadData = async () => {
        setLoading(true);
        try {
            const [reqData, userData, orderData] = await Promise.all([
                getAllRequests(),
                getUsers(),
                getOrders()
            ]);
            setRequests(reqData || []);
            setOrders(orderData || []);
            setStaff(userData.filter(u => u.role !== 'CLIENT'));
        } catch (err) {
            toast.error("Database connection error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const formatStatus = (status) => {
        if (!status) return "PENDING";
        if (typeof status === 'string' && status.startsWith('{')) {
            try {
                const parsed = JSON.parse(status);
                return (parsed.status || parsed.STATUS || "APPROVED").toUpperCase();
            } catch (e) {
                return "APPROVED";
            }
        }
        const s = status.toString().toUpperCase();
        return s === 'COMPLETED' ? 'APPROVED' : s;
    };

    const handleQuickFilter = (tab, status) => {
        setActiveTab(tab);
        setStatusFilter(status);
        setSearchTerm("");
    };

    const filteredData = useMemo(() => {
        const source = activeTab === "requests" ? requests : orders;
        return source.filter(item => {
            const matchesSearch = (item.title || item.id?.toString() || "")?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (item.client_name || "")?.toLowerCase().includes(searchTerm.toLowerCase());

            const currentStatus = formatStatus(item.status);
            const matchesStatus = statusFilter === "ALL" || currentStatus === statusFilter;

            return matchesSearch && matchesStatus;
        });
    }, [requests, orders, activeTab, searchTerm, statusFilter]);

    const stats = useMemo(() => {
        const totalSales = orders.reduce((acc, curr) => acc + Number(curr.total_amount || 0), 0);
        const reqPending = requests.filter(r => formatStatus(r.status) === 'PENDING').length;
        const reqApproved = requests.filter(r => formatStatus(r.status) === 'APPROVED').length;
        const ordPending = orders.filter(o => formatStatus(o.status) === 'PENDING').length;
        const ordCompleted = orders.filter(o => formatStatus(o.status) === 'APPROVED').length;

        return {
            totalSales,
            pending: reqPending + ordPending,
            approved: reqApproved + ordCompleted,
            rejected: requests.filter(r => formatStatus(r.status) === 'REJECTED').length,
            total: requests.length + orders.length
        };
    }, [orders, requests]);

    const handleApproveOrder = async (item) => {
        const id = item.id || item.order_id;
        const loadingToast = toast.loading("Processing...");
        try {
            await updateOrderStatus(id, { status: 'COMPLETED' });
            toast.success("Order Approved", { id: loadingToast });
            loadData();
        } catch (err) {
            toast.error("Failed to update", { id: loadingToast });
        }
    };

    const handleFinalizeApproval = async () => {
        try {
            await updateRequestStatus(selectedReq.id, { status: 'APPROVED', ...assignment });
            toast.success("Verification Finalized");
            setShowAllocModal(false);
            loadData();
        } catch (err) {
            toast.error("Processing failed");
        }
    };

    if (loading) return (
        <div className="flex h-screen items-center justify-center bg-white dark:bg-slate-950">
            <Loader2 className="animate-spin text-indigo-900" size={48} />
        </div>
    );

    return (
        <div className="p-8 max-w-[1600px] mx-auto bg-white dark:bg-slate-950 min-h-screen">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
                <button onClick={() => handleQuickFilter("orders", "ALL")}
                        className={`p-8 rounded-[3rem] text-left transition-all relative overflow-hidden group shadow-2xl ${activeTab === "orders" && statusFilter === "ALL" ? 'bg-indigo-900 ring-4 ring-indigo-500/20' : 'bg-[#0F172A]'} text-white`}>
                    <TrendingUp className="absolute right-[-10px] bottom-[-10px] size-32 opacity-10 group-hover:scale-110 transition-transform" />
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-50 mb-2">Revenue Volume</p>
                    <h4 className="text-3xl font-black tracking-tighter">ETB {stats.totalSales.toLocaleString()}</h4>
                    <div className="mt-4 flex items-center gap-2 text-[9px] font-bold uppercase opacity-60"><Activity size={12} /> {orders.length} Entries</div>
                </button>

                <button onClick={() => handleQuickFilter("requests", "PENDING")}
                        className={`p-8 rounded-[3rem] text-left border transition-all hover:scale-[1.02] ${statusFilter === "PENDING" ? 'bg-indigo-900 border-indigo-800 text-white shadow-xl' : 'bg-slate-50 dark:bg-slate-900/50 border-slate-100 dark:border-slate-800'}`}>
                    <div className={`p-3 rounded-2xl w-fit mb-4 ${statusFilter === "PENDING" ? 'bg-white/10' : 'bg-amber-500/10 text-amber-600'}`}><Clock size={24} /></div>
                    <p className={`text-[10px] font-black uppercase tracking-[0.2em] mb-1 ${statusFilter === "PENDING" ? 'text-indigo-200' : 'text-slate-400'}`}>Pending Action</p>
                    <h4 className="text-4xl font-black tracking-tighter">{stats.pending}</h4>
                </button>

                <button onClick={() => handleQuickFilter("orders", "APPROVED")}
                        className={`p-8 rounded-[3rem] text-left border transition-all hover:scale-[1.02] ${statusFilter === "APPROVED" ? 'bg-indigo-900 border-indigo-800 text-white shadow-xl' : 'bg-slate-50 dark:bg-slate-900/50 border-slate-100 dark:border-slate-800'}`}>
                    <div className={`p-3 rounded-2xl w-fit mb-4 ${statusFilter === "APPROVED" ? 'bg-white/10' : 'bg-emerald-500/10 text-emerald-600'}`}><CheckCircle2 size={24} /></div>
                    <p className={`text-[10px] font-black uppercase tracking-[0.2em] mb-1 ${statusFilter === "APPROVED" ? 'text-indigo-200' : 'text-slate-400'}`}>Approved/Paid</p>
                    <h4 className="text-4xl font-black tracking-tighter">{stats.approved}</h4>
                </button>

                <button onClick={() => handleQuickFilter("requests", "REJECTED")}
                        className={`p-8 rounded-[3rem] text-left border transition-all hover:scale-[1.02] ${statusFilter === "REJECTED" ? 'bg-indigo-900 border-indigo-800 text-white shadow-xl' : 'bg-slate-50 dark:bg-slate-900/50 border-slate-100 dark:border-slate-800'}`}>
                    <div className={`p-3 rounded-2xl w-fit mb-4 ${statusFilter === "REJECTED" ? 'bg-white/10' : 'bg-rose-500/10 text-rose-600'}`}><XCircle size={24} /></div>
                    <p className={`text-[10px] font-black uppercase tracking-[0.2em] mb-1 ${statusFilter === "REJECTED" ? 'text-indigo-200' : 'text-slate-400'}`}>Denied Requests</p>
                    <h4 className="text-4xl font-black tracking-tighter">{stats.rejected}</h4>
                </button>
            </div>

            <header className="mb-6 flex flex-col xl:flex-row justify-between items-center gap-8">
                <div className="flex items-center gap-8 w-full xl:w-auto">
                    <div className="flex items-center gap-4">
                        <div className="p-4 bg-indigo-900 text-white rounded-[1.5rem] shadow-xl"><Boxes size={28} /></div>
                        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">Ledger Hub</h1>
                    </div>
                    <div className="flex bg-slate-100 dark:bg-slate-900 p-1.5 rounded-2xl">
                        <button onClick={() => handleQuickFilter("requests", "ALL")}
                                className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === "requests" ? "bg-white dark:bg-slate-800 text-indigo-900 dark:text-white shadow-sm" : "text-slate-400"}`}>Requests</button>
                        <button onClick={() => handleQuickFilter("orders", "ALL")}
                                className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === "orders" ? "bg-white dark:bg-slate-800 text-indigo-900 dark:text-white shadow-sm" : "text-slate-400"}`}>Sales</button>
                    </div>
                </div>
                <div className="flex items-center gap-4 w-full xl:w-auto">
                    {statusFilter !== "ALL" && (
                        <button onClick={() => setStatusFilter("ALL")} className="flex items-center gap-2 px-4 py-5 bg-rose-50 text-rose-600 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-rose-100 transition-all">
                            <RotateCcw size={16} /> Clear
                        </button>
                    )}
                    <div className="relative flex-1 xl:w-96">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                        <input type="text" placeholder="Search entries..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                               className="w-full pl-14 pr-6 py-5 bg-slate-50 dark:bg-slate-900 rounded-[1.5rem] border-none focus:ring-2 focus:ring-indigo-900 font-bold text-sm" />
                    </div>
                </div>
            </header>

            <DataTable
                data={filteredData}
                activeTab={activeTab}
                onView={(item) => setViewData({ ...item, type: activeTab === 'requests' ? 'request' : 'order' })}
                onVerify={(item) => { setSelectedReq(item); setShowAllocModal(true); }}
                onConfirm={handleApproveOrder}
                formatStatus={formatStatus}
            />

            {showAllocModal && (
                <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-[100] p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-[3rem] w-full max-w-md shadow-2xl border border-white/10 overflow-hidden">
                        <div className="p-8 bg-indigo-900 text-white flex justify-between items-center">
                            <div><h2 className="text-xl font-black uppercase tracking-tight">Stock Allocation</h2><p className="text-[10px] font-black opacity-60 uppercase">{selectedReq?.title}</p></div>
                            <ShieldCheck size={32} className="opacity-40" />
                        </div>
                        <div className="p-8 space-y-6">
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase mb-2 ml-1 block">Logistics Manager</label>
                                <select className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl font-bold border-none"
                                        value={assignment.manager_id} onChange={e => setAssignment({ ...assignment, manager_id: e.target.value })}>
                                    <option value="">Select Staff</option>
                                    {staff.map(s => <option key={s.id} value={s.id}>{s.name} ({s.role})</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase mb-2 ml-1 block">Inventory Lead</label>
                                <select className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl font-bold border-none"
                                        value={assignment.technical_manager_id} onChange={e => setAssignment({ ...assignment, technical_manager_id: e.target.value })}>
                                    <option value="">Select Staff</option>
                                    {staff.map(s => <option key={s.id} value={s.id}>{s.name} ({s.role})</option>)}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase mb-2 ml-1 block">Budget (ETB)</label>
                                    <input type="number" className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl font-bold border-none"
                                           value={assignment.budget} onChange={e => setAssignment({ ...assignment, budget: e.target.value })} />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase mb-2 ml-1 block">Release Date</label>
                                    <input type="date" className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl font-bold border-none"
                                           value={assignment.end_date} onChange={e => setAssignment({ ...assignment, end_date: e.target.value })} />
                                </div>
                            </div>
                        </div>
                        <div className="p-8 bg-slate-50 dark:bg-slate-800/50 flex gap-4">
                            <button onClick={() => setShowAllocModal(false)} className="flex-1 font-black text-[10px] uppercase text-slate-400">Cancel</button>
                            <button onClick={handleFinalizeApproval} className="flex-2 bg-indigo-900 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase shadow-lg hover:bg-black transition-all">Finalize</button>
                        </div>
                    </div>
                </div>
            )}

            {viewData && (
                <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-xl flex items-center justify-center z-[100] p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-[3.5rem] w-full max-w-2xl p-12 relative shadow-2xl border border-white/10">
                        <button onClick={() => setViewData(null)} className="absolute top-10 right-10 text-slate-300 hover:text-black"><X size={24} /></button>
                        <div className="flex items-center gap-4 mb-10">
                            <div className={`p-4 rounded-2xl text-white ${viewData.type === 'order' ? 'bg-emerald-500' : 'bg-indigo-900'}`}>{viewData.type === 'order' ? <Receipt size={32} /> : <Package size={32} />}</div>
                            <div>
                                <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">{viewData.type === 'order' ? `Order Record #${viewData.id}` : viewData.title}</h2>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Detailed Record Review</p>
                            </div>
                        </div>
                        {viewData.type === 'order' ? (
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-3xl"><p className="text-[9px] font-black text-slate-400 uppercase mb-2">Grand Total</p><p className="text-3xl font-black text-emerald-500">ETB {Number(viewData.total_amount || 0).toLocaleString()}</p></div>
                                <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-3xl"><p className="text-[9px] font-black text-slate-400 uppercase mb-2">Payment</p><p className="text-3xl font-black text-slate-900 dark:text-white">{viewData.payment_method || "N/A"}</p></div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                <div className="aspect-square bg-slate-50 dark:bg-slate-800 rounded-[2.5rem] overflow-hidden border border-slate-100 dark:border-slate-700">
                                    {viewData.image_url ? <img src={viewData.image_url} className="w-full h-full object-cover" /> : <ImageIcon size={48} className="m-auto mt-20 text-slate-200" />}
                                </div>
                                <div className="space-y-6">
                                    <p className="text-slate-600 dark:text-slate-300 font-medium italic">"{viewData.description}"</p>
                                    <div className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase border inline-block bg-indigo-900 text-white`}>{formatStatus(viewData.status)}</div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default StockInventory;