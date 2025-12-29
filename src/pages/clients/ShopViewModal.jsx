import React, { useState, useEffect } from "react";
import { X, Navigation, Car, Map as MapIcon, Loader2, Clock, Info } from "lucide-react";
import { ShopMap } from "./ShopMap";

const ShopViewModal = ({ client, onClose }) => {
    const [userLocation, setUserLocation] = useState(null);
    const [status, setStatus] = useState("locating"); // locating, ready, error

    useEffect(() => {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    setUserLocation([pos.coords.latitude, pos.coords.longitude]);
                    setStatus("ready");
                },
                (err) => {
                    console.error(err);
                    setStatus("error");
                }
            );
        }
    }, []);

    return (
        <div className="fixed inset-0 z-[110] bg-indigo-950/90 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 w-full max-w-6xl rounded-[3rem] shadow-2xl overflow-hidden flex flex-col md:flex-row h-[85vh] transition-colors duration-300">

                {/* Map Section */}
                <div className="w-full md:w-1/2 h-full relative bg-slate-100 dark:bg-slate-800">
                    <ShopMap center={[client.latitude, client.longitude]} userLocation={userLocation} />

                    {/* Floating Status Overlay */}
                    {status === "locating" && (
                        <div className="absolute inset-0 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm z-[1001] flex items-center justify-center">
                            <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-xl flex items-center gap-4">
                                <Loader2 className="animate-spin text-indigo-600 dark:text-blue-400" />
                                <p className="text-xs font-black uppercase tracking-widest text-indigo-900 dark:text-white">Calculating Live Route...</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Navigation Details Section */}
                <div className="w-full md:w-1/2 p-10 flex flex-col transition-colors duration-300">
                    <div className="flex justify-between items-start mb-8">
                        <div>
                            <h2 className="text-3xl font-black text-indigo-900 dark:text-white uppercase tracking-tighter">{client.name}</h2>
                            <p className="text-indigo-600 dark:text-blue-400 text-[10px] font-black uppercase tracking-widest">{client.category_name}</p>
                        </div>
                        <button onClick={onClose} className="p-3 bg-slate-50 dark:bg-slate-800 hover:bg-rose-500 hover:text-white dark:text-slate-400 rounded-2xl transition-all shadow-sm">
                            <X size={20} />
                        </button>
                    </div>

                    <div className="space-y-6">
                        {/* Primary Nav Card */}
                        <div className="p-8 bg-indigo-900 dark:bg-blue-600 rounded-[2.5rem] text-white shadow-2xl shadow-indigo-200 dark:shadow-blue-900/20">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                                <p className="text-[10px] font-black uppercase tracking-widest text-indigo-300 dark:text-blue-100">Live Traffic & Route</p>
                            </div>

                            <div className="flex items-center gap-6">
                                <div>
                                    <p className="text-[9px] font-black uppercase text-indigo-400 dark:text-blue-200 mb-1">Travel Time</p>
                                    <h3 className="text-5xl font-black italic flex items-baseline gap-1">
                                        14 <span className="text-sm not-italic font-bold opacity-60 uppercase">min</span>
                                    </h3>
                                </div>
                                <div className="h-12 w-[1px] bg-indigo-800 dark:bg-blue-500" />
                                <div>
                                    <p className="text-[9px] font-black uppercase text-indigo-400 dark:text-blue-200 mb-1">Distance</p>
                                    <h3 className="text-2xl font-black uppercase">5.8 <span className="text-xs opacity-60">km</span></h3>
                                </div>
                            </div>
                        </div>

                        {/* Secondary Stats */}
                        <div className="grid grid-cols-2 gap-4">
                            <StatBox
                                icon={<Car size={20} />}
                                color="text-emerald-600 dark:text-emerald-400"
                                bg="bg-emerald-100 dark:bg-emerald-500/10"
                                label="Traffic Status"
                                value="Fastest Route"
                            />
                            <StatBox
                                icon={<Clock size={20} />}
                                color="text-blue-600 dark:text-blue-400"
                                bg="bg-blue-100 dark:bg-blue-500/10"
                                label="Operating"
                                value={client.opening_hours || "Open Now"}
                            />
                        </div>

                        {/* Directions Preview */}
                        <div className="p-6 border-2 border-slate-50 dark:border-slate-800 rounded-3xl bg-slate-50/50 dark:bg-white/5">
                            <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase mb-4">Route Summary</p>
                            <div className="space-y-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                                    <p className="text-xs font-bold text-slate-600 dark:text-slate-300 italic">Start from your current location</p>
                                </div>
                                <div className="w-[2px] h-4 bg-slate-100 dark:bg-slate-700 ml-1" />
                                <div className="flex items-center gap-4">
                                    <div className="w-2 h-2 rounded-full bg-indigo-900 dark:bg-blue-400" />
                                    <p className="text-xs font-bold text-indigo-900 dark:text-white">Arrive at {client.name}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-auto">
                        <button className="w-full py-5 bg-[#004A7C] dark:bg-white dark:text-slate-900 text-white rounded-3xl font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:shadow-indigo-200 dark:hover:shadow-blue-500/20 transition-all flex items-center justify-center gap-3">
                            Tracking Navigation Active
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const StatBox = ({ icon, color, bg, label, value }) => (
    <div className="p-6 bg-slate-50 dark:bg-white/5 rounded-3xl border border-slate-100 dark:border-slate-800 flex items-center gap-4">
        <div className={`p-3 ${bg} ${color} rounded-2xl`}>
            {icon}
        </div>
        <div>
            <p className="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase">{label}</p>
            <p className="text-sm font-black text-slate-700 dark:text-slate-200">{value}</p>
        </div>
    </div>
);

export default ShopViewModal;