import React, { useEffect, useState, useMemo } from "react";
import { getOrders } from "@/services/orderService.js";
import {
    ShieldAlert,
    History,
    User,
    Calendar,
    Activity,
    CheckCircle,
    Clock,
    Search,
    RefreshCw,
    FileCheck2,
    TrendingUp,
    ArrowUpRight
} from "lucide-react";

export default function AuditLogs({ filter }) {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Matches your Orders.jsx logic for consistent status display
    const formatStatus = (status) => {
        if (!status) return "PENDING";
        let s = status;
        if (typeof status === 'string' && status.startsWith('{')) {
            try {
                const parsed = JSON.parse(status);
                s = parsed.status || parsed.STATUS || "APPROVED";
            } catch (e) {
                s = "APPROVED";
            }
        }
        const upperStatus = s.toString().toUpperCase();
        if (upperStatus === 'COMPLETED' || upperStatus === 'VERIFIED') return 'APPROVED';
        return upperStatus;
    };

    const fetchApprovedOrders = async () => {
        setIsRefreshing(true);
        try {
            const data = await getOrders();
            const rawOrders = Array.isArray(data) ? data : [];

            // Filter only approved/completed orders for the reports
            const approved = rawOrders.filter(order => {
                const status = formatStatus(order.status);
                return status === "APPROVED" || status === "COMPLETED";
            });

            setOrders(approved);
        } catch (err) {
            console.error("Order Fetch Error:", err);
        } finally {
            setLoading(false);
            setIsRefreshing(false);
        }
    };

    useEffect(() => {
        fetchApprovedOrders();
    }, [filter]);

    // Apply Time Filtering (Daily, Monthly, Yearly)
    const processedData = useMemo(() => {
        const now = new Date();

        return orders.filter(order => {
            const orderDate = new Date(order.updated_at || order.createdAt);

            // 1. Time Period Filter
            let isInPeriod = true;
            if (filter === "daily") {
                isInPeriod = orderDate.toDateString() === now.toDateString();
            } else if (filter === "monthly") {
                isInPeriod = orderDate.getMonth() === now.getMonth() &&
                    orderDate.getFullYear() === now.getFullYear();
            } else if (filter === "yearly") {
                isInPeriod = orderDate.getFullYear() === now.getFullYear();
            }

            // 2. Search Term Filter
            const searchLower = searchTerm.toLowerCase();
            const matchesSearch =
                (order.order_number || order.id?.toString() || "").toLowerCase().includes(searchLower) ||
                (order.customer_name || order.client_name || "").toLowerCase().includes(searchLower);

            return isInPeriod && matchesSearch;
        });
    }, [orders, filter, searchTerm]);

    // Calculate total revenue for the current view
    const totalRevenue = processedData.reduce((acc, curr) => acc + Number(curr.total_amount || 0), 0);

    if (loading) return (
        <div className="h-screen flex flex-col items-center justify-center bg-white dark:bg-slate-950 transition-colors">
            <div className="w-8 h-8 border-4 border-emerald-600 dark:border-emerald-400 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-slate-400 dark:text-slate-500 font-black uppercase tracking-widest text-[9px]">Compiling {filter || 'Audit'} Ledger...</p>
        </div>
    );

    return (
        <div className="p-8 bg-[#F8FAFC] dark:bg-slate-950 min-h-screen font-sans transition-colors duration-300">
            {/* --- TOP NAVIGATION BAR --- */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                <div className="flex items-center gap-4">
                    <div className="p-4 bg-emerald-600 dark:bg-emerald-700 rounded-3xl text-white shadow-2xl shadow-emerald-900/20">
                        <FileCheck2 size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-none">
                            {filter ? `${filter} Analytics` : "System Audit"}
                        </h1>
                        <p className="text-slate-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] mt-2 flex items-center gap-2">
                            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                            Verified Transactional Data
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={18} />
                        <input
                            type="text"
                            placeholder="Search Ledger ID or Client..."
                            className="w-full md:w-80 bg-white dark:bg-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 rounded-2xl py-4 pl-12 pr-6 text-xs font-bold outline-none focus:ring-4 ring-emerald-500/10 transition-all shadow-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button
                        onClick={fetchApprovedOrders}
                        className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-500 hover:text-emerald-600 transition-all hover:shadow-lg active:scale-95 shadow-sm"
                    >
                        <RefreshCw size={20} className={isRefreshing ? "animate-spin" : ""} />
                    </button>
                </div>
            </div>

            {/* --- REVENUE SUMMARY CARD --- */}
            <div className="mb-8 p-8 bg-indigo-900 rounded-[2.5rem] text-white relative overflow-hidden shadow-2xl">
                <TrendingUp className="absolute right-[-20px] bottom-[-20px] size-48 opacity-10" />
                <div className="relative z-10">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 mb-2">Total Period Revenue</p>
                    <div className="flex items-baseline gap-4">
                        <h2 className="text-5xl font-black tracking-tighter">ETB {totalRevenue.toLocaleString()}</h2>
                        <div className="flex items-center gap-1 text-emerald-400 text-xs font-black uppercase">
                            <ArrowUpRight size={16} />
                            Live Sync
                        </div>
                    </div>
                </div>
            </div>

            {/* --- MAIN DATA CONTAINER --- */}
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-200 dark:border-slate-800 overflow-hidden">
                {/* TABLE HEADER */}
                <div className="bg-slate-50/50 dark:bg-slate-800/50 px-10 py-6 flex justify-between items-center border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                        <div className="w-1.5 h-5 bg-emerald-600 rounded-full"></div>
                        <span className="text-[11px] font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest">Transaction Sequence</span>
                    </div>
                    <span className="text-[10px] font-black text-white bg-emerald-600 px-5 py-2 rounded-full shadow-lg shadow-emerald-900/20">
                        {processedData.length} Records Found
                    </span>
                </div>

                {/* LOG ENTRIES LIST */}
                <div className="overflow-y-auto max-h-[60vh] custom-scrollbar">
                    {processedData.length > 0 ? (
                        processedData.map((order, i) => (
                            <div key={order.id || i} className="group px-10 py-8 hover:bg-emerald-50/30 dark:hover:bg-emerald-900/5 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-50 dark:border-slate-800 last:border-0">
                                <div className="flex items-center gap-6">
                                    <div className="p-4 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-2xl group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300 shadow-sm">
                                        <Activity size={24} />
                                    </div>

                                    <div>
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="font-black text-slate-900 dark:text-white text-sm uppercase tracking-tight">
                                                Order #{order.order_number || order.id}
                                            </h3>
                                            <span className="text-[9px] font-black text-white bg-emerald-500 px-2.5 py-1 rounded-lg uppercase tracking-wider">
                                                {formatStatus(order.status)}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-6">
                                            <div className="flex items-center gap-2">
                                                <User size={12} className="text-slate-400" />
                                                <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase">
                                                    {order.customer_name || order.client_name || "Direct Sale"}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Clock size={12} className="text-slate-400" />
                                                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-500 italic">
                                                    {order.payment_method || "CASH"}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between md:flex-col md:items-end gap-4">
                                    <div className="text-right">
                                        <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Total Value</p>
                                        <p className="text-xl font-black text-emerald-600 dark:text-emerald-500 tabular-nums">
                                            ETB {Number(order.total_amount || 0).toLocaleString()}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2 px-4 py-1.5 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 rounded-xl">
                                        <Calendar size={12} className="text-emerald-500" />
                                        <span className="text-[10px] font-black text-emerald-700 dark:text-emerald-500">
                                            {new Date(order.updated_at || order.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="py-40 flex flex-col items-center justify-center">
                            <div className="p-8 bg-slate-50 dark:bg-slate-800 rounded-full mb-6 border border-slate-100 dark:border-slate-700">
                                <History size={64} className="text-slate-200" />
                            </div>
                            <h4 className="text-lg font-black text-slate-300 uppercase tracking-[0.2em]">No Records Found</h4>
                            <p className="text-[10px] text-slate-400 font-bold mt-2 uppercase">No approved orders match this time period.</p>
                        </div>
                    )}
                </div>
            </div>

            <p className="mt-10 text-center text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-[0.4em]">
                EDT MCS Central Ledger &bull; Secure Protocol ALPHA-01
            </p>
        </div>
    );
}