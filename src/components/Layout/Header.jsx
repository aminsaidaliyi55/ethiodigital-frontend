import React, { useState, useEffect, useRef } from "react";
import {
    Bell,
    User,
    Settings,
    LogOut,
    Globe,
    Moon,
    Sun,
    Palette
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const CustomMenuIcon = () => (
    <div className="flex flex-col gap-[5px] items-start justify-center group px-1">
        <span className="w-6 h-[2px] bg-slate-900 dark:bg-slate-100 rounded-full"></span>
        <span className="w-4 h-[2px] bg-[#068D46] rounded-full transition-all duration-300 group-hover:w-6"></span>
        <span className="w-6 h-[2px] bg-slate-900 dark:bg-slate-100 rounded-full"></span>
    </div>
);

function Header({ onMenuToggle }) {
    const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isNotifOpen, setIsNotifOpen] = useState(false);
    const [userData] = useState({ name: "Admin User", role: "FEDERAL_ADMIN" });
    const profileRef = useRef(null);
    const navigate = useNavigate();

    // Effect to apply theme class to the document
    useEffect(() => {
        const root = window.document.documentElement;
        if (theme === "dark") {
            root.classList.add("dark");
        } else {
            root.classList.remove("dark");
        }
        localStorage.setItem("theme", theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prev => (prev === "light" ? "dark" : "light"));
    };

    return (
        <header className="h-20 bg-white/80 dark:bg-[#0A1221]/80 backdrop-blur-md px-6 md:px-10 flex items-center justify-between sticky top-0 z-[100] border-b border-slate-100 dark:border-slate-800 transition-colors duration-300">

            {/* Left Side: Navigation Controls */}
            <div className="flex items-center gap-4">
                <button
                    onClick={onMenuToggle}
                    className="p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all active:scale-95 border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
                >
                    <CustomMenuIcon />
                </button>
                <div className="hidden md:block">
                    <h2 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">National Portal</h2>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">Addis Ababa Node</p>
                </div>
            </div>

            {/* Right Side: Actions & Profile */}
            <div className="flex items-center gap-2 md:gap-4">

                {/* Theme Toggle Button */}
                <button
                    onClick={toggleTheme}
                    className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-all active:rotate-45"
                    title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
                >
                    {theme === "dark" ? <Sun size={20} className="text-[#FCE300]" /> : <Moon size={20} />}
                </button>

                {/* Language Switch */}
                <button className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors">
                    <Globe size={20} />
                </button>

                {/* Notifications */}
                <div className="relative">
                    <button
                        onClick={() => setIsNotifOpen(!isNotifOpen)}
                        className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors relative"
                    >
                        <Bell size={20} />
                        <span className="absolute top-2 right-2 w-2 h-2 bg-[#E52521] rounded-full border-2 border-white dark:border-[#0A1221]"></span>
                    </button>
                </div>

                <div className="h-6 w-[1px] bg-slate-200 dark:bg-slate-700 mx-1"></div>

                {/* User Profile */}
                <div className="flex items-center gap-3 relative" ref={profileRef}>
                    <div className="text-right hidden sm:block">
                        <p className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight">{userData.name}</p>
                        <p className="text-[9px] font-bold text-[#068D46] dark:text-[#FCE300] uppercase tracking-widest italic">Official Access</p>
                    </div>

                    <button
                        onClick={() => setIsProfileOpen(!isProfileOpen)}
                        className="w-11 h-11 rounded-2xl bg-[#0F172A] dark:bg-[#068D46] text-white flex items-center justify-center shadow-lg shadow-slate-200 dark:shadow-none hover:scale-105 transition-all border-2 border-transparent hover:border-[#FCE300]"
                    >
                        <User size={20} />
                    </button>

                    {isProfileOpen && (
                        <div className="absolute right-0 top-full mt-4 w-56 bg-white dark:bg-[#0F172A] rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] py-2 border border-slate-100 dark:border-slate-800 animate-in fade-in slide-in-from-top-2 origin-top-right overflow-hidden">
                            <div className="px-5 py-3 border-b border-slate-50 dark:border-slate-800 md:hidden">
                                <p className="text-[10px] font-black text-slate-400 uppercase">Signed in as</p>
                                <p className="text-xs font-bold text-slate-900 dark:text-white">{userData.name}</p>
                            </div>

                            <button className="w-full flex items-center gap-3 px-5 py-3 text-[11px] font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors uppercase">
                                <Settings size={14} className="text-[#068D46]" /> Settings
                            </button>

                            <button className="w-full flex items-center gap-3 px-5 py-3 text-[11px] font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors uppercase">
                                <Palette size={14} className="text-[#FCE300]" /> UI Preferences
                            </button>

                            <div className="h-[1px] bg-slate-50 dark:bg-slate-800 my-1"></div>

                            <button
                                onClick={() => navigate("/login")}
                                className="w-full flex items-center gap-3 px-5 py-3 text-[11px] font-bold text-[#E52521] hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors uppercase"
                            >
                                <LogOut size={14}/> Sign Out
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}

export default Header;