import React, { useState, useEffect, useMemo } from "react";
import { getOrders, updateOrderStatus, updateOrderManifest } from "@/services/orderService";
import { getUsers } from "@/services/userService";
import {
    Activity, LayoutGrid, Boxes, Zap,
    TrendingUp, Globe, ShieldCheck, Filter,
    Truck, Map as MapIcon // Added Truck and MapIcon here
} from "lucide-react";
import toast from "react-hot-toast";
import DispatchModal from "./DispatchModal";
import TransitViewModal from "./TransitViewModal";
import BatchAction from "./BatchAction";
import BatchList from "./BatchList";
import GlobalHeatmap from "./GlobalHeatmap"; // Assuming this is the filename

const LogisticsManagement = () => {
    const [orders, setOrders] = useState([]);
    const [couriers, setCouriers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState("ALL");
    const [showMap, setShowMap] = useState(false); // Toggle for the Heatmap

    // Modal & Selection States
    const [isDispatchModalOpen, setIsDispatchModalOpen] = useState(false);
    const [isTransitModalOpen, setIsTransitModalOpen] = useState(false);
    const [viewingBatch, setViewingBatch] = useState(null);
    const [selectedOrder, setSelectedOrder] = useState(null);

    const [companyName, setCompanyName] = useState("Global Logistics");

    const loadDashboard = async () => {
        setLoading(true);
        try {
            const [orderData, userData] = await Promise.all([getOrders(), getUsers()]);
            setOrders(orderData || []);
            setCouriers(userData || []);
        } catch (err) {
            toast.error("System sync failed");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadDashboard(); }, []);

    // Statistics Calculation
    const stats = useMemo(() => {
        const total = orders.length;
        const transit = orders.filter(o => o.status === "IN_TRANSIT").length;
        const delivered = orders.filter(o => o.status === "DELIVERED").length;
        return { total, transit, delivered };
    }, [orders]);

    const handleBatchSelection = (batch) => {
        setSelectedOrder(batch);
        if (batch.status === 'PENDING') setIsDispatchModalOpen(true);
        else if (batch.status === 'IN_TRANSIT') setViewingBatch(batch);
        else setIsTransitModalOpen(true);
    };

    const handleDispatch = async (manifestData) => {
        const loadingToast = toast.loading("Syncing Manifest...");
        try {
            await updateOrderManifest(selectedOrder.id, {
                status: 'IN_TRANSIT',
                delivery_provider: companyName,
                tracking_id: manifestData.tracking,
                courier_name: manifestData.courier,
                origin_lat: Number(manifestData.originCoords.lat),
                origin_lng: Number(manifestData.originCoords.lng),
                dest_lat: Number(manifestData.destCoords.lat),
                dest_lng: Number(manifestData.destCoords.lng),
                distance: Number(manifestData.distance),
                total_cost: Number(manifestData.total_cost),
                signature_data: manifestData.signature,
                eta: manifestData.eta
            });

            toast.success("Shipment is LIVE", { id: loadingToast });
            setIsDispatchModalOpen(false);
            await loadDashboard();
            setSelectedOrder(null);
        } catch (err) {
            toast.error("Dispatch Failed", { id: loadingToast });
        }
    };

    if (loading) return (
        <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
            <div className="text-center">
                <div className="relative">
                    <Activity className="animate-spin text-indigo-900 mb-4" size={48} />
                    <div className="absolute inset-0 bg-indigo-500/20 blur-xl rounded-full" />
                </div>
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-900/60">Establishing Secure Link</p>
            </div>
        </div>
    );

    if (viewingBatch) {
        return (
            <div className="p-6 max-w-7xl mx-auto min-h-screen animate-in fade-in slide-in-from-bottom-4 duration-500">
                <BatchAction
                    batch={viewingBatch}
                    onBack={() => { setViewingBatch(null); loadDashboard(); }}
                />
            </div>
        );
    }

    return (
        <div className="p-8 max-w-[1600px] mx-auto min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white transition-colors">
            {/* Header Section */}
            <header className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-12 gap-8">
                <div className="flex items-center gap-6">
                    <div className="relative">
                        <div className="bg-indigo-950 p-5 rounded-[2rem] text-white shadow-2xl shadow-indigo-900/40 relative z-10">
                            <Boxes size={32} />
                        </div>
                        <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-emerald-500 rounded-full border-4 border-slate-50 dark:border-slate-950 z-20 flex items-center justify-center">
                            <Zap size={12} fill="white" className="text-white" />
                        </div>
                    </div>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-5xl font-black italic uppercase tracking-tighter">Terminal 01</h1>
                            <span className="px-3 py-1 bg-emerald-500/10 text-emerald-600 text-[10px] font-black rounded-full uppercase tracking-widest border border-emerald-500/20">System Online</span>
                        </div>
                        <p className="text-[10px] font-bold text-slate-400 tracking-[0.4em] uppercase mt-1">Operator: {companyName}</p>
                    </div>
                </div>

                {/* Real-time Analytics Strip */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 w-full xl:w-auto">
                    {[
                        { label: "Active Fleet", value: stats.transit, icon: Truck, color: "text-indigo-600" },
                        { label: "Completion", value: stats.delivered, icon: ShieldCheck, color: "text-emerald-500" },
                        { label: "Total Load", value: stats.total, icon: Globe, color: "text-blue-500" }
                    ].map((stat, i) => (
                        <div key={i} className="bg-white dark:bg-slate-900 p-4 px-8 rounded-[1.5rem] border border-slate-200/60 dark:border-slate-800 shadow-sm flex items-center gap-6">
                            <stat.icon className={`${stat.color}`} size={20} />
                            <div>
                                <p className="text-2xl font-black tracking-tighter italic leading-none">{stat.value}</p>
                                <p className="text-[8px] font-black uppercase text-slate-400 tracking-widest mt-1">{stat.label}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </header>

            {/* Main Manifest Interface */}
            <main className="bg-white dark:bg-slate-900/40 rounded-[3.5rem] p-10 shadow-xl border border-white dark:border-slate-800/50 backdrop-blur-sm overflow-hidden">
                <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setShowMap(!showMap)}
                            className={`p-2 rounded-xl transition-all ${showMap ? 'bg-indigo-600 text-white' : 'bg-indigo-50 text-indigo-600'}`}
                        >
                            {showMap ? <LayoutGrid size={20} /> : <MapIcon size={20} />}
                        </button>
                        <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-400">
                            {showMap ? "Global Logistics Heatmap" : "Live Manifest Feed"}
                        </h3>
                    </div>

                    {/* Visual Filter Toggles */}
                    {!showMap && (
                        <div className="flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl gap-1">
                            {["ALL", "PENDING", "IN_TRANSIT", "DELIVERED"].map((f) => (
                                <button
                                    key={f}
                                    onClick={() => setActiveFilter(f)}
                                    className={`px-5 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
                                        activeFilter === f ? "bg-white dark:bg-slate-700 text-indigo-600 shadow-sm" : "text-slate-400 hover:text-slate-600"
                                    }`}
                                >
                                    {f.replace("_", " ")}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Conditional Rendering: Map vs List */}
                {showMap ? (
                    <div className="h-[600px] rounded-[2rem] overflow-hidden border border-slate-200 dark:border-slate-800">
                        <GlobalHeatmap orders={orders} />
                    </div>
                ) : (
                    <BatchList
                        data={activeFilter === "ALL" ? orders : orders.filter(o => o.status === activeFilter)}
                        onViewDetails={handleBatchSelection}
                        onAddNewBatch={() => toast.info("Create batch via Order Manager")}
                    />
                )}
            </main>

            {/* Modals */}
            <DispatchModal
                isOpen={isDispatchModalOpen}
                onClose={() => { setIsDispatchModalOpen(false); setSelectedOrder(null); }}
                order={selectedOrder}
                couriers={couriers}
                onDispatch={handleDispatch}
            />

            <TransitViewModal
                isOpen={isTransitModalOpen}
                onClose={() => { setIsTransitModalOpen(false); setSelectedOrder(null); }}
                order={selectedOrder}
            />
        </div>
    );
};

export default LogisticsManagement;