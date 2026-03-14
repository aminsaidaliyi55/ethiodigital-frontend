import React from "react";
import { X, MapPin, Package, Truck, Calendar, CreditCard, Activity, Navigation as NavIcon } from "lucide-react";

const TransitViewModal = ({ isOpen, onClose, order }) => {
    if (!isOpen || !order) return null;

    const isDelivered = order.status === 'DELIVERED';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-slate-50 w-full max-w-xl rounded-[2.5rem] overflow-hidden shadow-2xl border border-white/20">
                {/* Status Header */}
                <div className={`p-8 ${isDelivered ? 'bg-emerald-600' : 'bg-indigo-900'} text-white relative`}>
                    <button onClick={onClose} className="absolute right-6 top-6 p-2 hover:bg-white/10 rounded-full transition-colors">
                        <X size={20} className="text-white" />
                    </button>
                    <span className="px-3 py-1 bg-white/20 rounded-full text-[10px] font-black uppercase tracking-widest">
                        {order.status}
                    </span>
                    <h2 className="text-3xl font-black italic mt-2 uppercase tracking-tighter text-white">
                        {order.tracking_id || "PENDING_ID"}
                    </h2>
                </div>

                <div className="p-8 space-y-8">
                    {/* Route Visualization */}
                    <div className="relative flex justify-between items-center px-4">
                        <div className="z-10 bg-white p-3 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center">
                            <Package className="text-indigo-900 mb-1" size={20} />
                            <span className="text-[8px] font-bold text-slate-400 uppercase">Origin</span>
                        </div>

                        <div className="absolute left-0 right-0 h-1 bg-slate-200 mx-16">
                            <div
                                className={`h-full transition-all duration-1000 ${isDelivered ? 'w-full bg-emerald-500' : 'w-1/2 bg-indigo-500 animate-pulse'}`}
                            />
                        </div>

                        <Truck
                            className={`z-10 ${isDelivered ? 'text-emerald-500' : 'text-indigo-600'}`}
                            size={24}
                        />

                        <div className="z-10 bg-white p-3 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center">
                            <MapPin className="text-slate-300 mb-1" size={20} />
                            <span className="text-[8px] font-bold text-slate-400 uppercase">Destination</span>
                        </div>
                    </div>

                    {/* Detailed Intel Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white p-4 rounded-2xl border border-slate-100">
                            <p className="text-[10px] font-black text-slate-400 uppercase mb-1 flex items-center gap-1">
                                <Activity size={12} /> Courier
                            </p>
                            <p className="font-bold text-indigo-950 text-sm truncate">{order.courier_name || "Assigning..."}</p>
                        </div>
                        <div className="bg-white p-4 rounded-2xl border border-slate-100">
                            <p className="text-[10px] font-black text-slate-400 uppercase mb-1 flex items-center gap-1">
                                <Calendar size={12} /> ETA
                            </p>
                            <p className="font-bold text-indigo-950 text-sm">
                                {order.eta ? new Date(order.eta).toLocaleDateString() : "Calculating..."}
                            </p>
                        </div>
                        <div className="bg-white p-4 rounded-2xl border border-slate-100">
                            <p className="text-[10px] font-black text-slate-400 uppercase mb-1 flex items-center gap-1">
                                <CreditCard size={12} /> Freight Cost
                            </p>
                            <p className="font-bold text-indigo-950 text-sm">${Number(order.total_cost || 0).toFixed(2)}</p>
                        </div>
                        <div className="bg-white p-4 rounded-2xl border border-slate-100">
                            <p className="text-[10px] font-black text-slate-400 uppercase mb-1 flex items-center gap-1">
                                <NavIcon size={12} /> Distance
                            </p>
                            <p className="font-bold text-indigo-950 text-sm">{order.distance || "0"} KM</p>
                        </div>
                    </div>

                    {/* Footer Address */}
                    <div className="bg-indigo-50 p-6 rounded-[2rem] border border-indigo-100">
                        <h4 className="text-[10px] font-black text-indigo-900 uppercase mb-2">Delivery Endpoint</h4>
                        <p className="text-sm font-medium text-indigo-950 leading-relaxed">
                            {order.delivery_address || "Address not specified"}
                        </p>
                        {order.signature_data && (
                            <div className="mt-4 pt-4 border-t border-indigo-200 flex justify-between items-center">
                                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Digital Auth</span>
                                <span className="font-mono text-[10px] text-indigo-900 font-bold bg-white px-2 py-1 rounded">
                                    {order.signature_data}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TransitViewModal;