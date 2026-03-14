import React, {useState, useEffect, useMemo} from "react";
import {getAllRequests, updateRequestStatus, getOrders, updateOrderStatus} from "@/services/orderService.js";
import {getUsers} from "@/services/userService";
import {Loader2, Boxes, TrendingUp, Search, Activity, Clock, CheckCircle2, XCircle, RotateCcw} from "lucide-react";
import toast from "react-hot-toast";
import DataTable from "./DataTable.jsx";
import OrderModals from "./OrderModals.jsx";
import {handlePrint} from "./printUtil.js";

const Orders = () => {
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

    const loadData = async () => {
        setLoading(true);
        try {
            const [req, user, ord] = await Promise.all([getAllRequests(), getUsers(), getOrders()]);
            setRequests(req || []);
            setOrders(ord || []);
            setStaff(user.filter(u => u.role !== 'CLIENT'));
        } catch (err) {
            toast.error("Could not connect to database");
        }
        setLoading(false);
    };

    useEffect(() => {
        loadData();
    }, []);

    const formatStatus = (status) => {
        if (!status) return "PENDING";
        let s = status;
        if (typeof status === 'string' && status.startsWith('{')) {
            try {
                s = JSON.parse(status).status || "APPROVED";
            } catch {
                s = "APPROVED";
            }
        }
        const upper = s.toString().toUpperCase();
        return (upper === 'COMPLETED' || upper === 'VERIFIED') ? 'APPROVED' : upper;
    };

    const handleStatClick = (filter) => {
        setStatusFilter(filter);
        if (filter !== "ALL") {
            const hasReq = requests.some(r => formatStatus(r.status) === filter);
            const hasOrd = orders.some(o => formatStatus(o.status) === filter);
            if (!hasReq && hasOrd) setActiveTab("orders");
            else if (hasReq) setActiveTab("requests");
        }
    };

    // SEARCH BY ALL LOGIC
    const filteredData = useMemo(() => {
        const source = activeTab === "requests" ? requests : orders;
        const query = searchTerm.toLowerCase();

        return source.filter(item => {
            // 1. Basic match (ID, Title, Client/Customer Name)
            const basicMatch =
                (item.title || "").toLowerCase().includes(query) ||
                (item.id?.toString() || "").toLowerCase().includes(query) ||
                (item.client_name || "").toLowerCase().includes(query) ||
                (item.customer_name || "").toLowerCase().includes(query);

            // 2. Metadata match (Payment Method, Cashier Name, Transaction IDs)
            const metaMatch =
                (item.payment_method || "").toLowerCase().includes(query) ||
                (item.cashier_name || "").toLowerCase().includes(query) ||
                (item.transaction_id || "").toLowerCase().includes(query);

            // 3. Deep match (Items inside the order/request)
            const itemsMatch = item.order_items?.some(prod =>
                (prod.name || "").toLowerCase().includes(query) ||
                (prod.sku || "").toLowerCase().includes(query)
            );

            const match = basicMatch || metaMatch || itemsMatch;
            return match && (statusFilter === "ALL" || formatStatus(item.status) === statusFilter);
        });
    }, [requests, orders, activeTab, searchTerm, statusFilter]);

    const stats = useMemo(() => ({
        sales: orders
            .filter(o => formatStatus(o.status) === 'APPROVED')
            .reduce((acc, curr) => acc + Number(curr.total_amount || 0), 0),
        pending: requests.filter(r => formatStatus(r.status) === 'PENDING').length + orders.filter(o => formatStatus(o.status) === 'PENDING').length,
        approved: requests.filter(r => formatStatus(r.status) === 'APPROVED').length + orders.filter(o => formatStatus(o.status) === 'APPROVED').length,
        rejected: requests.filter(r => formatStatus(r.status) === 'REJECTED').length
    }), [orders, requests]);

    const handleApproveOrder = async (item) => {
        const tid = toast.loading("Updating...");
        try {
            await updateOrderStatus(item.id || item.order_id, {status: 'COMPLETED'});
            toast.success("Success", {id: tid});
            loadData();
        } catch {
            toast.error("Failed", {id: tid});
        }
    };

    if (loading) return <div className="flex h-screen items-center justify-center dark:bg-slate-950"><Loader2 className="animate-spin text-indigo-900" size={48}/></div>;

    return (
        <div className="p-8 max-w-[1600px] mx-auto bg-white dark:bg-slate-950 min-h-screen">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <button
                    onClick={() => { setActiveTab("orders"); setStatusFilter("ALL"); }}
                    className={`p-6 rounded-[2rem] text-left transition-all relative overflow-hidden group shadow-xl ${activeTab === "orders" && statusFilter === "ALL" ? 'bg-indigo-900 ring-2 ring-indigo-500/20' : 'bg-slate-950'} text-white`}
                >
                    <TrendingUp className="absolute right-[-5px] bottom-[-5px] size-24 opacity-10"/>
                    <p className="text-[8px] font-black uppercase tracking-[0.2em] text-indigo-300 mb-1">Total Sales (Approved)</p>
                    <h4 className="text-2xl font-black tracking-tighter">ETB {stats.sales.toLocaleString()}</h4>
                    <div className="mt-3 flex items-center gap-2 text-[8px] font-bold opacity-50 uppercase tracking-widest">
                        <Activity size={10}/> {orders.filter(o => formatStatus(o.status) === 'APPROVED').length} Finalized
                    </div>
                </button>

                <StatCard click={() => handleStatClick("PENDING")} active={statusFilter === "PENDING"}
                          icon={<Clock size={20}/>} label="Awaiting Action" val={stats.pending} color="amber"/>
                <StatCard click={() => handleStatClick("APPROVED")} active={statusFilter === "APPROVED"}
                          icon={<CheckCircle2 size={20}/>} label="Total Approved" val={stats.approved}
                          color="emerald"/>
                <StatCard click={() => handleStatClick("REJECTED")} active={statusFilter === "REJECTED"}
                          icon={<XCircle size={20}/>} label="Rejected Items" val={stats.rejected} color="rose"/>
            </div>

            <header className="mb-6 flex flex-col xl:flex-row justify-between items-center gap-8">
                <div className="flex items-center gap-8">
                    <div className="p-4 bg-indigo-900 text-white rounded-[1.5rem] shadow-xl"><Boxes size={28}/></div>
                    <div className="flex bg-slate-100 dark:bg-slate-900 p-1.5 rounded-2xl">
                        {['requests', 'orders'].map(t => (
                            <button key={t} onClick={() => setActiveTab(t)}
                                    className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === t ? "bg-white dark:bg-slate-800 text-indigo-900 dark:text-white shadow-sm" : "text-slate-400"}`}>{t.replace('s', ' s')}</button>
                        ))}
                    </div>
                </div>
                <div className="flex items-center gap-4 w-full xl:w-auto">
                    {statusFilter !== "ALL" && <button onClick={() => {
                        setStatusFilter("ALL");
                        setSearchTerm("");
                    }}
                                                       className="flex items-center gap-2 px-4 py-5 bg-rose-50 text-rose-600 rounded-2xl font-black text-[10px] uppercase hover:bg-rose-100 transition-all">
                        <RotateCcw size={16}/> Reset</button>}
                    <div className="relative flex-1 xl:w-96">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={20}/>
                        <input type="text" placeholder="Search by name, ID, item, or method..." value={searchTerm}
                               onChange={e => setSearchTerm(e.target.value)}
                               className="w-full pl-14 pr-6 py-5 bg-slate-50 dark:bg-slate-900 rounded-[1.5rem] border-none focus:ring-2 focus:ring-indigo-900 font-bold text-sm shadow-inner"/>
                    </div>
                </div>
            </header>

            <DataTable data={filteredData} activeTab={activeTab} formatStatus={formatStatus}
                       onView={i => {
                           const isApproved = formatStatus(i.status) === 'APPROVED';
                           setViewData({
                               ...i,
                               type: activeTab === 'requests' ? 'request' : 'order',
                               readOnly: isApproved
                           });
                       }}
                       onVerify={i => {
                           if (formatStatus(i.status) === 'APPROVED') {
                               toast.error("Already approved and locked.");
                               return;
                           }
                           setSelectedReq(i);
                           setShowAllocModal(true);
                       }}
                       onConfirm={handleApproveOrder}
                       onPrint={i => handlePrint(i, activeTab)}/>

            <OrderModals
                viewData={viewData} setViewData={setViewData}
                showAlloc={showAllocModal} setShowAlloc={setShowAllocModal}
                selectedReq={selectedReq} staff={staff}
                loadData={loadData} formatStatus={formatStatus}
            />
        </div>
    );
};

const StatCard = ({click, active, icon, label, val, color}) => (
    <button
        onClick={click}
        className={`p-4 rounded-[1.5rem] text-left transition-all hover:translate-y-[-2px] active:scale-95 flex items-center gap-4 ${
            active
                ? 'bg-indigo-900 text-white shadow-lg'
                : 'bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm'
        }`}
    >
        <div className={`p-2 rounded-lg ${
            active ? 'bg-white/10 text-white' : `bg-${color}-500/10 text-${color}-600`
        }`}>
            {React.cloneElement(icon, {size: 16})}
        </div>
        <div>
            <p className={`text-[7px] font-black uppercase tracking-[0.2em] mb-0.5 ${
                active ? 'text-indigo-300' : 'text-slate-400'
            }`}>
                {label}
            </p>
            <h4 className="text-lg font-black tracking-tighter leading-none">
                {val}
            </h4>
        </div>
    </button>
);

export default Orders;