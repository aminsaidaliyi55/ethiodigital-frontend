import React from "react";
import { Edit3, Eye, Trash2, Box, ShieldCheck, Zap } from "lucide-react";

export const getInventoryColumns = (openModal) => [
    {
        header: "Product Experience",
        width: "91%",
        render: (row) => (
            <div className="flex items-center gap-20 py-12 group cursor-pointer perspective-2000">
                {/* 6D MEGA SCALE IMAGE ENGINE */}
                <div className="relative flex-shrink-0 transition-transform duration-700 group-hover:rotate-y-12 group-hover:rotate-x-2">

                    {/* VOLUMETRIC LIGHTING GLOW */}
                    <div className="absolute -inset-20 bg-gradient-to-tr from-[#004A7C] via-cyan-400/20 to-transparent opacity-0 group-hover:opacity-40 blur-[120px] rounded-full transition-all duration-[1.5s] animate-pulse"></div>

                    <div className="relative w-[500px] h-80 rounded-[4.5rem] bg-white dark:bg-slate-900 overflow-hidden border-[10px] border-white dark:border-slate-800 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.2)] transition-all duration-1000 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:shadow-[0_80px_150px_-30px_rgba(0,74,124,0.5)] group-hover:-translate-y-6 group-hover:scale-[1.02]">

                        {/* THE 6D IMAGE WITH CHROMATIC SHIFT */}
                        {row.image ? (
                            <div className="relative w-full h-full overflow-hidden">
                                <img
                                    src={row.image.startsWith('http') ? row.image : `http://localhost:8000${row.image}`}
                                    className="w-full h-full object-cover transition-all duration-[4s] group-hover:scale-125 group-hover:rotate-2 group-hover:brightness-110 filter group-hover:saturate-150"
                                    alt={row.name}
                                />
                                {/* LENS FLARE OVERLAY */}
                                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/30 to-transparent opacity-0 group-hover:opacity-100 -translate-x-full group-hover:translate-x-full transition-all duration-[2s] pointer-events-none" />
                            </div>
                        ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950">
                                <Box size={80} className="text-slate-100 dark:text-slate-800 mb-4" />
                            </div>
                        )}

                        {/* 6D FLOATING OVERLAYS (Z-INDEX LAYERING) */}
                        <div className="absolute top-8 left-8 transform transition-transform duration-700 group-hover:translate-z-20 group-hover:translate-x-4">
                            <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-3xl px-6 py-3 rounded-[2rem] border border-white/40 shadow-2xl flex items-center gap-3">
                                <Zap size={16} className="text-amber-500 fill-amber-500 animate-bounce" />
                                <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter">
                                    {Number(row.selling_price || 0).toLocaleString()}
                                </span>
                                <span className="text-[#004A7C] font-black text-[10px] uppercase tracking-widest">ETB</span>
                            </div>
                        </div>

                        <div className="absolute bottom-8 right-8 group-hover:scale-110 group-hover:-translate-x-4 transition-all duration-700">
                            <div className="bg-black/40 backdrop-blur-xl px-5 py-2.5 rounded-2xl border border-white/10 flex flex-col items-end">
                                <span className="text-white font-black text-2xl leading-none">{row.stock_quantity}</span>
                                <span className="text-[9px] font-black uppercase text-white/80 tracking-tighter">Available Assets</span>
                            </div>
                        </div>

                        {/* PULSING AUTHENTICITY BAR */}
                        <div className="absolute bottom-8 left-8 transition-transform duration-1000 group-hover:translate-y-[-10px]">
                            <div className="bg-emerald-500/90 backdrop-blur-md px-6 py-3 rounded-full flex items-center gap-3 shadow-[0_20px_40px_rgba(16,185,129,0.4)]">
                                <div className="w-2 h-2 bg-white rounded-full animate-ping"></div>
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white">Live Registry</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Typography Stack with Parallax Shift */}
                <div className="flex flex-col pr-10 transition-transform duration-700 group-hover:translate-x-6">
                    <div className="flex items-center gap-4 mb-6 overflow-hidden">
                        <span className="text-[#004A7C] dark:text-blue-400 text-xs font-black uppercase tracking-[0.6em] transition-transform duration-700 group-hover:translate-x-2">
                            {row.category_name || "Sovereign Collection"}
                        </span>
                        <div className="h-[2px] w-32 bg-gradient-to-r from-[#004A7C] to-transparent"></div>
                    </div>

                    <h3 className="font-black text-slate-900 dark:text-white text-8xl leading-[0.8] tracking-tighter mb-10 group-hover:text-[#004A7C] dark:group-hover:text-blue-400 transition-all duration-500 group-hover:drop-shadow-2xl">
                        {row.name}
                    </h3>

                    <div className="flex items-center gap-8">
                        <div className="flex flex-col bg-slate-50 dark:bg-slate-800/50 p-4 rounded-3xl border border-slate-100 dark:border-slate-800">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Unique Asset ID</span>
                            <span className="text-2xl font-mono font-black text-slate-700 dark:text-slate-300">
                                {row.sku || '---'}
                            </span>
                        </div>

                        <div className="group/shield relative flex items-center gap-4 bg-[#004A7C] px-8 py-4 rounded-[2rem] shadow-xl hover:shadow-[#004a7c]/40 transition-all cursor-help">
                            <ShieldCheck size={24} className="text-white animate-pulse" />
                            <span className="text-[11px] font-black uppercase tracking-widest text-white">Verified Registry</span>
                            {/* 6D Tooltip */}
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 px-4 py-2 bg-black text-white text-[8px] font-bold uppercase rounded-lg opacity-0 group-hover/shield:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                                Blockchain Validated
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    },
    {
        header: "",
        align: "right",
        width: "9%",
        render: (row) => (
            <div className="flex flex-col gap-4 items-end pr-10">
                {/* ACTION BUTTON WITH GRADIENT ANIMATION */}
                <button
                    onClick={() => openModal("view", row)}
                    className="group/btn relative w-24 h-24 overflow-hidden bg-slate-900 text-white rounded-[2.5rem] transition-all duration-500 hover:scale-110 hover:-rotate-6 shadow-2xl active:scale-95"
                >
                    <Eye size={32} className="relative z-10 mx-auto" />
                    <div className="absolute inset-0 bg-gradient-to-tr from-[#004A7C] via-cyan-500 to-blue-600 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-500 animate-spin-slow"></div>
                </button>

                <div className="flex gap-3">
                    <button
                        onClick={() => openModal("edit", row)}
                        className="p-5 bg-white dark:bg-slate-800 text-slate-400 hover:text-emerald-500 hover:shadow-lg hover:shadow-emerald-500/20 rounded-[1.8rem] border border-slate-100 dark:border-slate-700 transition-all"
                    >
                        <Edit3 size={20} />
                    </button>
                    <button
                        onClick={() => openModal("delete", row)}
                        className="p-5 bg-white dark:bg-slate-800 text-slate-400 hover:text-red-500 hover:shadow-lg hover:shadow-red-500/20 rounded-[1.8rem] border border-slate-100 dark:border-slate-700 transition-all"
                    >
                        <Trash2 size={20} />
                    </button>
                </div>
            </div>
        )
    }
];

export default getInventoryColumns;