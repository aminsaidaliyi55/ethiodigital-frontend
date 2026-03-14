import React, { useState, useEffect } from "react";
import { X, Navigation, Car, Map as MapIcon, Loader2, Clock, MapPin, ChevronRight, LocateFixed } from "lucide-react";
import { ShopMap } from "./ShopMap";

const ShopViewModal = ({ client, onClose }) => {
    const [userLocation, setUserLocation] = useState(null);
    const [status, setStatus] = useState("locating");

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
            <div className="bg-white dark:bg-slate-900 w-full max-w-6xl rounded-[3rem] shadow-2xl overflow-hidden flex flex-col md:flex-row h-[85vh]">

                {/* Map Section */}
                <div className="w-full md:w-1/2 h-full relative bg-slate-100 dark:bg-slate-800">
                    <ShopMap center={[client.latitude, client.longitude]} userLocation={userLocation} />

                    {/* Floating User ID Tag */}
                    <div className="absolute top-6 left-6 z-[1001] bg-white dark:bg-slate-900 p-3 rounded-2xl shadow-xl flex items-center gap-3">
                        <div className="w-3 h-3 bg-blue-500 rounded-full animate-ping" />
                        <span className="text-[10px] font-black uppercase tracking-widest dark:text-white">You Are Here</span>
                    </div>

                    {status === "locating" && (
                        <div className="absolute inset-0 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm z-[1002] flex items-center justify-center">
                            <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-xl flex items-center gap-4">
                                <Loader2 className="animate-spin text-indigo-600" />
                                <p className="text-[10px] font-black uppercase tracking-widest">Syncing GPS...</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Navigation Details */}
                <div className="w-full md:w-1/2 p-10 flex flex-col bg-white dark:bg-slate-900">
                    <div className="flex justify-between items-start mb-8">
                        <div>
                            <h2 className="text-2xl font-black text-[#004A7C] dark:text-white uppercase tracking-tighter">{client.name}</h2>
                        </div>
                        <button onClick={onClose} className="p-4 bg-slate-50 dark:bg-slate-800 hover:bg-rose-500 hover:text-white rounded-2xl transition-all">
                            <X size={20} />
                        </button>
                    </div>

                    <div className="space-y-6">
                        {/* Route Status Card */}
                        <div className="p-8 bg-indigo-900 dark:bg-indigo-950 rounded-[2.5rem] text-white shadow-2xl">
                            <div className="flex justify-between items-center mb-6">
                                <div className="flex items-center gap-2">
                                    <LocateFixed size={14} className="text-blue-400" />
                                    <p className="text-[9px] font-black uppercase tracking-widest">Live Tracking Active</p>
                                </div>
                                <span className="bg-blue-500 px-3 py-1 rounded-full text-[8px] font-black uppercase">Fastest</span>
                            </div>

                            <div className="flex items-end gap-2">
                                <h3 className="text-2xl font-black italic tracking-tighter">14</h3>
                                <div className="mb-2">
                                    <p className="text-sm font-black uppercase leading-none">Min</p>
                                    <p className="text-[10px] font-bold opacity-40 uppercase">Duration</p>
                                </div>
                                <div className="ml-auto text-right">
                                    <p className="text-2xl font-black">5.8<span className="text-xs opacity-50 ml-1">KM</span></p>
                                    <p className="text-[9px] font-black opacity-40 uppercase tracking-widest">Distance</p>
                                </div>
                            </div>
                        </div>

                        {/* Directions Preview (Simplified) */}
                        <div className="p-8 bg-slate-50 dark:bg-slate-800/50 rounded-[2rem] space-y-6">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Navigation Steps</p>

                            <div className="flex items-start gap-4">
                                <div className="flex flex-col items-center gap-1">
                                    <div className="p-2 bg-blue-500 rounded-lg text-white"><MapPin size={14}/></div>
                                    <div className="w-[2px] h-8 bg-slate-200 dark:bg-slate-700" />
                                </div>
                                <div>
                                    <p className="text-[11px] font-black uppercase text-[#004A7C] dark:text-blue-400">Current Position</p>
                                    <p className="text-[10px] font-bold text-slate-400">Initialize tracking from your terminal</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="p-2 bg-indigo-900 rounded-lg text-white"><Navigation size={14}/></div>
                                <div>
                                    <p className="text-[11px] font-black uppercase text-[#004A7C] dark:text-white">{client.name}</p>
                                    <p className="text-[10px] font-bold text-slate-400">Arrival at destination node</p>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <StatBox icon={<Car size={18} />} label="Traffic" value="Moderate" />
                            <StatBox icon={<Clock size={18} />} label="ETA" value="11:45 AM" />
                        </div>
                    </div>

                    <div className="mt-auto">
                        <button className="w-full py-5 bg-[#004A7C] text-white rounded-[2rem] font-black text-[10px] uppercase tracking-[0.3em] shadow-xl hover:bg-black transition-all">
                            Initialize Live Navigation
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Simplified StatBox without Borders
const StatBox = ({ icon, label, value }) => (
    <div className="p-5 bg-slate-50 dark:bg-slate-800/30 rounded-[1.5rem] flex items-center gap-4">
        <div className="text-indigo-600 dark:text-blue-400">{icon}</div>
        <div>
            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
            <p className="text-xs font-black text-slate-700 dark:text-slate-200 uppercase">{value}</p>
        </div>
    </div>
);

export default ShopViewModal;