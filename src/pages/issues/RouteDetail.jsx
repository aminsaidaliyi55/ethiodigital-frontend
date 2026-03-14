import React from "react";
import { ArrowLeft, MapPin, User, Truck, Calendar, CheckCircle } from "lucide-react";

const RouteDetail = ({ route, onBack }) => {
    if (!route) return null;

    return (
        <div className="p-6 max-w-4xl mx-auto space-y-6">
            <button onClick={onBack} className="flex items-center gap-2 text-slate-500 hover:text-blue-900 font-bold text-xs uppercase transition-all">
                <ArrowLeft size={16} /> Back to List
            </button>

            <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100">
                <div className="flex justify-between items-start mb-8">
                    <div>
                        <span className="bg-blue-50 text-blue-900 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">Route Details</span>
                        <h1 className="text-3xl font-black text-slate-900 mt-2 uppercase">{route.route_name}</h1>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Current Status</p>
                        <p className="text-green-600 font-black uppercase text-sm">Active</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-slate-50 rounded-2xl text-slate-400"><User size={20} /></div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase">Assigned Driver</p>
                                <p className="font-bold text-slate-800 uppercase">{route.driver_name || "Unassigned"}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-slate-50 rounded-2xl text-slate-400"><Truck size={20} /></div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase">Vehicle Type</p>
                                <p className="font-bold text-slate-800 uppercase">{route.vehicle_type || "Motorbike"}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-slate-50 rounded-3xl p-6">
                        <h4 className="font-black text-[10px] uppercase text-slate-400 mb-4">Route Stops</h4>
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-blue-900"></div>
                                <p className="text-xs font-bold text-slate-700 uppercase">Main Warehouse (Start)</p>
                            </div>
                            <div className="w-0.5 h-4 bg-slate-200 ml-[3px]"></div>
                            <div className="flex items-center gap-3">
                                <MapPin size={14} className="text-blue-400" />
                                <p className="text-xs font-bold text-slate-700 uppercase">Delivery Point A</p>
                            </div>
                            <div className="w-0.5 h-4 bg-slate-200 ml-[3px]"></div>
                            <div className="flex items-center gap-3">
                                <CheckCircle size={14} className="text-green-500" />
                                <p className="text-xs font-bold text-slate-700 uppercase">Final Destination</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RouteDetail;