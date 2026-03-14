import React, { useState, useEffect } from "react";
import {
    Loader2, AlertTriangle, Package, Landmark, Truck,
    ShieldCheck, Sun, Moon, Store, FileWarning,
    Receipt, CheckCircle2, Users, Map, Activity
} from "lucide-react";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    AreaChart, Area, Cell, PieChart, Pie
} from 'recharts';

/**
 * Updated Dashboard to handle roles from Image 3:
 * SUPERADMIN, FEDERALADMIN, REGIONALADMIN, ZONEADMIN, KEBELEADMIN, AUDITOR, SHOPOWNER
 */
export default function Dashboard() {
    const [loading, setLoading] = useState(true);
    const [isDark, setIsDark] = useState(false);

    // Get role from localStorage (matching your App.jsx logic)
    const storedData = JSON.parse(localStorage.getItem("user") || "{}");
    const userRole = String(storedData.user?.role || storedData.role || "SHOPOWNER").toUpperCase();

    useEffect(() => {
        const savedTheme = localStorage.getItem("theme");
        if (savedTheme === "dark") {
            document.documentElement.classList.add("dark");
            setIsDark(true);
        }
        const timer = setTimeout(() => setLoading(false), 800);
        return () => clearTimeout(timer);
    }, []);

    const toggleTheme = () => {
        const newDark = !isDark;
        setIsDark(newDark);
        document.documentElement.classList.toggle("dark");
        localStorage.setItem("theme", newDark ? "dark" : "light");
    };

    // --- DATA MAPPING FOR ROLES ---

    // 1. HIGH LEVEL ADMINS (Super, Federal, Regional)
    const adminKPIs = [
        { label: "Total Active Shops", val: "12,842", trend: "+124", icon: Store, color: "text-blue-500" },
        { label: "National Revenue", val: "4.2B ETB", trend: "+8.2%", icon: Landmark, color: "text-emerald-500" },
        { label: "Active Violations", val: "248", trend: "High Alert", icon: AlertTriangle, color: "text-red-500" },
        { label: "System Nodes", val: "942", trend: "Online", icon: ShieldCheck, color: "text-slate-400" }
    ];

    // 2. FIELD / AUDIT LEVEL (Auditor, Kebele, Zone)
    const auditorKPIs = [
        { label: "Assigned Inspections", val: "12", trend: "Today", icon: Activity, color: "text-blue-500" },
        { label: "Closed Cases", val: "84", trend: "This Month", icon: CheckCircle2, color: "text-emerald-500" },
        { label: "Flagged Shops", val: "5", trend: "Critical", icon: FileWarning, color: "text-red-500" },
        { label: "Area Coverage", val: "92%", trend: "Optimal", icon: Map, color: "text-amber-500" }
    ];

    // 3. BUSINESS LEVEL (Shop Owner)
    const ownerKPIs = [
        { label: "Today's Sales", val: "42,500 ETB", trend: "+12%", icon: Receipt, color: "text-blue-500" },
        { label: "Stock Level", val: "68%", trend: "Reorder", icon: Package, color: "text-amber-500" },
        { label: "Staff Present", val: "4/5", trend: "Stable", icon: Users, color: "text-emerald-500" },
        { label: "Next Audit", val: "Mar 02", trend: "Scheduled", icon: ShieldCheck, color: "text-slate-400" }
    ];

    const getKPIsByRole = () => {
        if (["SUPERADMIN", "FEDERALADMIN", "REGIONALADMIN"].includes(userRole)) return adminKPIs;
        if (["ZONEADMIN", "KEBELEADMIN", "AUDITOR"].includes(userRole)) return auditorKPIs;
        return ownerKPIs;
    };

    if (loading) return <LoadingState isDark={isDark} />;

    return (
        <div className="w-full min-h-screen space-y-6 px-6 md:px-10 pt-6 pb-10 bg-[#F8FAFC] dark:bg-[#070D18] font-sans transition-colors duration-500">

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
                <div>
                    <h2 className="text-2xl font-black text-[#004A7C] dark:text-white tracking-tight">
                        {userRole.includes("ADMIN") ? "Management Portal" : userRole === "AUDITOR" ? "Auditor Workspace" : "Business Dashboard"}
                    </h2>
                    <p className="text-slate-400 text-xs font-medium mt-1 uppercase">
                        Current Role: <span className="text-[#004A7C] dark:text-[#FCE300] font-bold">{userRole}</span>
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="hidden md:flex flex-col items-end mr-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">System Status</span>
                        <span className="text-[10px] font-black text-emerald-500">ENCRYPTED NODE</span>
                    </div>
                    <button onClick={toggleTheme} className="p-2.5 rounded-xl bg-white dark:bg-[#0F172A] border border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                        {isDark ? <Sun size={18} /> : <Moon size={18} />}
                    </button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {getKPIsByRole().map((kpi, i) => (
                    <div key={i} className="bg-white dark:bg-[#0F172A] p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm transition-all hover:border-[#004A7C]">
                        <div className="flex justify-between items-center mb-3">
                            <kpi.icon size={18} className={kpi.color} />
                            <span className="text-[10px] font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">{kpi.trend}</span>
                        </div>
                        <p className="text-slate-400 text-xs font-medium uppercase">{kpi.label}</p>
                        <h3 className="text-2xl font-bold text-[#004A7C] dark:text-white mt-1">{kpi.val}</h3>
                    </div>
                ))}
            </div>

            {/* Main Charts & Activity Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* 1. Primary Insight (Dynamic based on role) */}
                <MatrixCard
                    title={userRole.includes("ADMIN") ? "Revenue Growth" : "Stock Levels"}
                    subtitle="Regional Performance Tracking"
                    isDark={isDark}
                >
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -30, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#004A7C" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#004A7C" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid vertical={false} stroke={isDark ? "#1E293B" : "#F1F5F9"} />
                            <XAxis dataKey="name" hide />
                            <Tooltip />
                            <Area type="monotone" dataKey="val" stroke="#004A7C" strokeWidth={3} fillOpacity={1} fill="url(#colorVal)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </MatrixCard>

                {/* 2. Secondary Insight (Dynamic) */}
                <MatrixCard title="Regional Risk Analysis" subtitle="Violation density heatmap" isDark={isDark}>
                    <div className="space-y-4 mt-2">
                        {[
                            { name: 'Addis Ababa', risk: 'High', color: 'bg-red-500' },
                            { name: 'Oromia', risk: 'Medium', color: 'bg-amber-500' },
                            { name: 'Amhara', risk: 'Low', color: 'bg-emerald-500' },
                            { name: 'Dire Dawa', risk: 'Low', color: 'bg-emerald-500' }
                        ].map((item, i) => (
                            <div key={i} className="flex flex-col gap-1">
                                <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider">
                                    <span className="text-slate-400">{item.name}</span>
                                    <span className={item.risk === 'High' ? 'text-red-500' : 'text-slate-400'}>{item.risk} Risk</span>
                                </div>
                                <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                    <div className={`h-full ${item.color}`} style={{ width: item.risk === 'High' ? '80%' : item.risk === 'Medium' ? '50%' : '25%' }}></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </MatrixCard>

                {/* 3. Global Activity Log */}
                <MatrixCard title="Live Network Log" subtitle="Real-time system actions" isDark={isDark}>
                    <div className="space-y-4">
                        {[
                            { role: 'AUDITOR', msg: 'Started inspection at Node-78', time: '2m' },
                            { role: 'SYSTEM', msg: 'Price index synchronized', time: '14m' },
                            { role: 'KEBELE', msg: 'License #9920 verified', time: '1h' },
                            { role: 'ZONE', msg: 'Stock overflow reported', time: '3h' }
                        ].map((item, i) => (
                            <div key={i} className="flex gap-3 items-start text-[11px] border-b border-slate-50 dark:border-slate-800/50 pb-3 last:border-0">
                                <div className="mt-1 w-2 h-2 rounded-full bg-[#FCE300] shadow-[0_0_8px_rgba(252,227,0,0.5)]" />
                                <div className="flex-grow">
                                    <p className="text-slate-600 dark:text-slate-300 font-medium">
                                        <span className="font-black text-[#004A7C] dark:text-[#FCE300] mr-1">[{item.role}]</span> {item.msg}
                                    </p>
                                    <span className="text-[10px] text-slate-400">{item.time} ago</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </MatrixCard>

            </div>
        </div>
    );
}

const chartData = [
    { name: 'P1', val: 400 }, { name: 'P2', val: 300 },
    { name: 'P3', val: 600 }, { name: 'P4', val: 800 },
    { name: 'P5', val: 500 }, { name: 'P6', val: 900 }
];

const MatrixCard = ({ title, subtitle, children, isDark }) => (
    <div className="bg-white dark:bg-[#0F172A] p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col h-[400px] transition-all hover:shadow-lg">
        <div className="mb-6">
            <h4 className="font-black text-[#004A7C] dark:text-white text-sm uppercase tracking-tight">{title}</h4>
            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1">{subtitle}</p>
        </div>
        <div className="flex-grow flex flex-col overflow-hidden">
            {children}
        </div>
    </div>
);

const LoadingState = ({ isDark }) => (
    <div className={`h-screen w-full flex flex-col items-center justify-center ${isDark ? 'bg-[#0A1221]' : 'bg-[#F8FAFC]'}`}>
        <Loader2 className={`animate-spin ${isDark ? 'text-[#FCE300]' : 'text-[#004A7C]'}`} size={48}/>
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 mt-6">Initializing Secure Core...</p>
    </div>
);