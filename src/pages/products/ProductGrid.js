import React from "react";
import { Edit3, Eye, Trash2, Box, ShieldCheck, Zap, Maximize, Palette } from "lucide-react";

export default function ProductGrid({ data, openModal, emptyMessage }) {
    if (!data || data.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 bg-slate-50 dark:bg-slate-900/50 rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-slate-800">
                <Box size={48} className="text-slate-300 mb-4" />
                <p className="text-slate-500 font-bold uppercase text-xs tracking-widest">{emptyMessage}</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10 perspective-1000">
            {data.map((row) => (
                <div
                    key={row.id}
                    className="group relative flex flex-col bg-white dark:bg-slate-900 rounded-[4rem] p-6 border border-slate-100 dark:border-slate-800 shadow-xl transition-all duration-700 hover:-translate-y-4 hover:rotate-x-2 hover:shadow-[0_40px_80px_-15px_rgba(0,0,0,0.3)] dark:hover:shadow-[0_40px_80px_-15px_rgba(0,0,0,0.6)]"
                    style={{ transformStyle: 'preserve-3d' }}
                >
                    {/* 6D IMAGE ENGINE */}
                    <div className="relative w-full h-80 rounded-[3.5rem] overflow-hidden bg-slate-100 dark:bg-slate-950 border-4 border-white dark:border-slate-800 shadow-inner perspective-800">

                        {/* DYNAMIC COLOR GLOW BACKGROUND */}
                        <div
                            className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-1000"
                            style={{ backgroundColor: row.color || '#004A7C' }}
                        />

                        {/* THE 6D PARALLAX IMAGE */}
                        {row.image ? (
                            <img
                                src={row.image.startsWith('http') ? row.image : `http://localhost:8000${row.image}`}
                                className="w-full h-full object-cover transition-all duration-[1.5s] ease-out
                                           group-hover:scale-125 group-hover:rotate-3 group-hover:brightness-110
                                           filter saturate-[1.2] contrast-[1.1]"
                                alt={row.name}
                            />
                        ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-slate-200 dark:from-slate-900 dark:to-black">
                                <Box size={60} className="text-slate-300 dark:text-slate-800 mb-2 animate-pulse" />
                            </div>
                        )}

                        {/* GLOSS OVERLAY EFFECT */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent -translate-x-[100%] group-hover:translate-x-[100%] transition-transform duration-[1.2s] pointer-events-none" />

                        {/* PRICE OVERLAY */}
                        <div className="absolute top-6 left-6 transition-transform duration-500 group-hover:translate-z-10 group-hover:translate-x-2">
                            <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl px-5 py-2.5 rounded-2xl border border-white/40 shadow-2xl flex items-center gap-2">
                                <Zap size={14} className="text-amber-500 fill-amber-500 animate-bounce" />
                                <span className="text-xl font-black text-slate-900 dark:text-white tracking-tighter">
                                    {Number(row.selling_price || 0).toLocaleString()}
                                </span>
                                <span className="text-[#004A7C] font-black text-[9px] uppercase tracking-widest">ETB</span>
                            </div>
                        </div>

                        {/* QTY BADGE */}
                        <div className="absolute bottom-6 right-6 group-hover:scale-110 transition-transform duration-500">
                            <div className="bg-black/60 backdrop-blur-xl px-4 py-2 rounded-2xl border border-white/20 flex items-center gap-2 shadow-lg">
                                <span className="text-white font-black text-base">{row.stock_quantity}</span>
                                <span className="text-[7px] font-black uppercase text-white/70 tracking-tighter">In Stock</span>
                            </div>
                        </div>
                    </div>

                    {/* CONTENT AREA */}
                    <div className="mt-8 px-4 flex-1 transition-transform duration-500 group-hover:translate-y-[-5px]">
                        <div className="flex items-center gap-3 mb-3">
                            <span className="text-[#004A7C] dark:text-blue-400 text-[9px] font-black uppercase tracking-[0.4em] drop-shadow-sm">
                                {row.category_name || "Sovereign Collection"}
                            </span>
                            <div className="h-[2px] flex-1 bg-gradient-to-r from-[#004A7C]/20 to-transparent dark:from-blue-500/20"></div>
                        </div>

                        {/* ENHANCED: VISUAL SIZE & COLOR CONTROLS */}
                        <div className="flex gap-3 mb-4">
                            {row.size && (
                                <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-transparent group-hover:border-slate-200 dark:group-hover:border-slate-700 transition-all">
                                    <div className="w-5 h-5 flex items-center justify-center bg-white dark:bg-slate-900 rounded-md shadow-sm">
                                        <span className="text-[9px] font-black text-[#004A7C]">{row.size.charAt(0).toUpperCase()}</span>
                                    </div>
                                    <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">{row.size}</span>
                                </div>
                            )}
                            {row.color && (
                                <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-transparent group-hover:border-slate-200 dark:group-hover:border-slate-700 transition-all">
                                    <div
                                        className="w-4 h-4 rounded-full shadow-inner border border-white/20"
                                        style={{ backgroundColor: row.color.toLowerCase() }}
                                    />
                                    <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">{row.color}</span>
                                </div>
                            )}
                        </div>

                        <h3 className="font-black text-slate-900 dark:text-white text-4xl leading-none tracking-tighter mb-6 line-clamp-1
                                       group-hover:text-[#004A7C] dark:group-hover:text-blue-400 transition-colors duration-500">
                            {row.name}
                        </h3>

                        <div className="flex items-center justify-between mt-auto pt-6 border-t border-slate-100 dark:border-slate-800/50">
                            <div className="flex flex-col">
                                <span className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Serial Ref</span>
                                <span className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 px-2 py-1 rounded-md">
                                    {row.sku || '---'}
                                </span>
                            </div>

                            {/* NEON ACTION BUTTONS */}
                            <div className="flex gap-2">
                                <button
                                    onClick={() => openModal("edit", row)}
                                    className="p-3.5 bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded-2xl transition-all duration-300"
                                >
                                    <Edit3 size={18} />
                                </button>
                                <button
                                    onClick={() => openModal("delete", row)}
                                    className="p-3.5 bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-2xl transition-all duration-300"
                                >
                                    <Trash2 size={18} />
                                </button>
                                <button
                                    onClick={() => openModal("view", row)}
                                    className="p-3.5 bg-[#004A7C] text-white rounded-2xl hover:bg-blue-600 hover:scale-110 active:scale-95 shadow-lg shadow-blue-900/20 transition-all duration-300"
                                >
                                    <Eye size={18} />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* FLOATING STATUS BADGE */}
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 group-hover:-top-6 transition-all duration-500 pointer-events-none">
                        <div className="bg-emerald-500 text-white px-5 py-1.5 rounded-full flex items-center gap-2 shadow-[0_10px_20px_rgba(16,185,129,0.4)]">
                            <ShieldCheck size={14} className="animate-pulse" />
                            <span className="text-[9px] font-black uppercase tracking-widest whitespace-nowrap">Verified Asset</span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}