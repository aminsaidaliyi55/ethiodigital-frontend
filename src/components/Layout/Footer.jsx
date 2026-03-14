import React from "react";

function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="w-full bg-white/80 dark:bg-[#0A1221]/80 backdrop-blur-md border-t border-slate-100 dark:border-slate-800 px-6 md:px-10 py-6 transition-colors duration-300">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-4">
                    <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">
                        &copy; {currentYear} <span className="text-slate-900 dark:text-white">EDT MCS</span>
                    </p>
                    <div className="h-3 w-[1px] bg-slate-200 dark:bg-slate-800 hidden md:block"></div>
                    <p className="hidden md:block text-[10px] font-bold text-emerald-600 dark:text-emerald-500 uppercase tracking-widest">
                        Federal Digital Trade Authority
                    </p>
                </div>

                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-emerald-500 dark:bg-emerald-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.4)]"></div>
                        <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">System Online</span>
                    </div>
                    <div className="flex items-center gap-3 opacity-40 dark:opacity-30 grayscale pointer-events-none">
                        <span className="text-[10px] font-black italic text-slate-900 dark:text-white">ኢትዮጵያ</span>
                        <div className="w-1 h-1 bg-slate-400 dark:bg-slate-600 rounded-full"></div>
                        <span className="text-[10px] font-black italic text-slate-900 dark:text-white">ETHIOPIA</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}

export default Footer;