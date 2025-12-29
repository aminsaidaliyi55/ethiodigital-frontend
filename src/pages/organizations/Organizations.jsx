import React, { useState, useEffect } from "react";
import {
    Landmark,
    ShieldCheck,
    Users,
    Building2,
    MapPin,
    Search,
    Filter,
    Plus,
    ExternalLink,
    MoreVertical,
    TrendingUp,
    FileText,
    ArrowUpRight,
    X,
    RefreshCw,
    Briefcase,
    Mail,
    Phone,
    Globe,
    AlertCircle,
    CheckCircle2
} from "lucide-react";
import toast, { Toaster } from 'react-hot-toast';

const FederalHierarchy = () => {
    // --- STATE MANAGEMENT ---
    const [searchQuery, setSearchQuery] = useState("");
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [selectedOffice, setSelectedOffice] = useState(null);
    const [isSyncing, setIsSyncing] = useState(false);
    const [syncProgress, setSyncProgress] = useState(0);

    const [federalOffices, setFederalOffices] = useState([
        {
            id: "FED-01",
            name: "Ministry of Trade & Regional Integration",
            acronym: "MOTRI",
            head: "Kassahun Gofe",
            role: "Primary Oversight",
            regions: 12,
            staff: 450,
            status: "Active",
            budget: "98%",
            email: "contact@motri.gov.et",
            phone: "+251 11 551 8025",
            website: "www.motri.gov.et",
            lastAudit: "2025-12-20",
            description: "Responsible for the regulation of domestic and foreign trade, ensuring market competition, and overseeing regional integration initiatives."
        },
        {
            id: "FED-02",
            name: "Ethiopian Customs Commission",
            acronym: "ECC",
            head: "Debele Kabeta",
            role: "Border & Revenue",
            regions: 8,
            staff: 1200,
            status: "Active",
            budget: "85%",
            email: "info@ecc.gov.et",
            phone: "+251 11 662 9800",
            website: "www.ecc.gov.et",
            lastAudit: "2026-01-05",
            description: "Manages national customs controls, trade facilitation, and revenue collection at all ports of entry and exit."
        },
        {
            id: "FED-03",
            name: "Ministry of Industry",
            acronym: "MOI",
            head: "Melaku Alebel",
            role: "Industrial Policy",
            regions: 10,
            staff: 320,
            status: "Active",
            budget: "92%",
            email: "office@moi.gov.et",
            phone: "+251 11 440 2210",
            website: "www.moi.gov.et",
            lastAudit: "2025-11-15",
            description: "Drives industrial development through policy formulation, investment attraction, and manufacturing sector support."
        }
    ]);

    const stats = [
        { label: "Connected Regions", value: "12", icon: MapPin, color: "text-indigo-600", bg: "bg-indigo-600/10" },
        { label: "Federal Officers", value: "2,480", icon: Users, color: "text-indigo-600", bg: "bg-indigo-600/10" },
        { label: "Active Institutions", value: "15", icon: Building2, color: "text-indigo-600", bg: "bg-indigo-900/10" },
        { label: "Compliance Rate", value: "94.2%", icon: ShieldCheck, color: "text-indigo-600", bg: "bg-indigo-600/10" },
    ];

    // --- LOGIC HANDLERS ---
    const handleSync = () => {
        setIsSyncing(true);
        setSyncProgress(0);

        const interval = setInterval(() => {
            setSyncProgress(prev => {
                if (prev >= 100) {
                    clearInterval(interval);
                    setIsSyncing(false);
                    toast.success("National Registry Synchronized Successfully", {
                        style: { borderRadius: '12px', background: '#1e1b4b', color: '#fff', border: '1px solid #312e81' }
                    });
                    return 100;
                }
                return prev + 10;
            });
        }, 300);
    };

    const handleOpenDetails = (office) => {
        setSelectedOffice(office);
        setIsDetailsOpen(true);
    };

    const handleAddOffice = (e) => {
        e.preventDefault();
        setIsAddModalOpen(false);
        toast.promise(
            new Promise((resolve) => setTimeout(resolve, 1500)),
            {
                loading: 'Registering Federal Body...',
                success: 'Institution added to National Hierarchy!',
                error: 'Authorization failed.',
            },
            { style: { borderRadius: '12px', background: '#1e1b4b', color: '#fff' } }
        );
    };

    const filteredOffices = federalOffices.filter(o =>
        o.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.acronym.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="p-6 md:p-10 bg-indigo-50 dark:bg-indigo-950 min-h-screen transition-colors duration-500 relative font-sans selection:bg-indigo-900 selection:text-white">
            <Toaster position="bottom-right" />

            {/* --- HEADER --- */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
                <div className="flex items-center gap-6">
                    <div className="relative group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-indigo-900 to-indigo-700 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
                        <div className="relative w-16 h-16 bg-white dark:bg-indigo-900 border border-indigo-200 dark:border-indigo-800 rounded-2xl flex items-center justify-center text-indigo-900 dark:text-indigo-400 shadow-xl dark:shadow-2xl">
                            <Landmark size={32} />
                        </div>
                    </div>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="px-2 py-0.5 rounded text-[10px] font-black bg-indigo-900 text-white uppercase tracking-widest">Tier 1</span>
                            <span className="text-indigo-900/40 dark:text-indigo-400/40 text-[10px] font-bold uppercase tracking-[0.3em] italic">National Layer</span>
                        </div>
                        <h1 className="text-3xl font-black text-indigo-900 dark:text-white italic tracking-tighter">Federal Administration</h1>
                        <p className="text-indigo-900/60 dark:text-indigo-400/60 text-xs font-bold uppercase tracking-widest mt-1">Institutional Governance Hierarchy</p>
                    </div>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="flex items-center gap-2 px-8 py-4 bg-indigo-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-indigo-900/30 w-full md:w-auto"
                    >
                        <Plus size={18} />
                        Register Institution
                    </button>
                </div>
            </div>

            {/* --- STATS GRID --- */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                {stats.map((stat, i) => (
                    <div key={i} className="bg-white dark:bg-indigo-900 p-6 rounded-[2.5rem] border border-indigo-100 dark:border-indigo-800 shadow-sm flex items-center gap-5 group hover:border-indigo-400 transition-all cursor-default">
                        <div className={`w-14 h-14 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-500`}>
                            <stat.icon size={28} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">{stat.label}</p>
                            <p className="text-2xl font-black text-indigo-900 dark:text-white mt-0.5 tracking-tighter italic">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* --- CONTENT AREA --- */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

                {/* LEFT: Office List */}
                <div className="xl:col-span-2 space-y-5">
                    <div className="flex items-center justify-between mb-4 px-2">
                        <div className="flex items-center gap-3">
                            <h3 className="font-black text-[10px] uppercase tracking-[0.2em] text-indigo-400">Institutional Registry</h3>
                            <div className="h-0.5 w-12 bg-indigo-200 dark:bg-indigo-800 rounded-full"></div>
                        </div>
                        <div className="relative">
                            <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-400" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search by acronym..."
                                className="pl-10 pr-4 py-3 bg-white dark:bg-indigo-900 border-2 border-indigo-100 dark:border-indigo-800 rounded-2xl text-[11px] font-bold w-64 focus:border-indigo-900 outline-none transition-all shadow-sm text-indigo-900 dark:text-white"
                            />
                        </div>
                    </div>

                    {filteredOffices.length > 0 ? filteredOffices.map((office) => (
                        <div key={office.id} className="bg-white dark:bg-indigo-900 border border-indigo-100 dark:border-indigo-800 rounded-[2.5rem] p-7 hover:shadow-2xl transition-all group relative overflow-hidden">
                            <div className="absolute -right-6 -bottom-6 opacity-[0.03] dark:opacity-[0.06] group-hover:scale-125 transition-transform duration-1000 text-indigo-900 dark:text-white pointer-events-none">
                                <Landmark size={180} />
                            </div>

                            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
                                <div className="flex items-start gap-6">
                                    <div className="w-20 h-20 bg-indigo-50 dark:bg-white/5 text-indigo-900 dark:text-indigo-400 rounded-[2rem] flex items-center justify-center font-black text-2xl border border-indigo-100 dark:border-white/5 shadow-inner">
                                        {office.acronym[0]}
                                    </div>
                                    <div className="pt-1">
                                        <div className="flex items-center gap-3">
                                            <h4 className="text-xl font-black text-indigo-900 dark:text-white tracking-tighter leading-tight">{office.name}</h4>
                                            <span className="px-2.5 py-1 bg-indigo-900 text-white text-[9px] font-black rounded-lg border border-indigo-900 uppercase tracking-widest">{office.status}</span>
                                        </div>
                                        <p className="text-xs text-indigo-400 mt-2 font-bold flex flex-wrap items-center gap-y-2 gap-x-5">
                                            <span className="flex items-center gap-1.5 uppercase tracking-widest"><Briefcase size={13} className="text-indigo-300" /> {office.head}</span>
                                            <span className="flex items-center gap-1.5 font-black text-indigo-900 dark:text-indigo-200"><Building2 size={13} /> {office.acronym}</span>
                                            <span className="flex items-center gap-1.5"><AlertCircle size={13} className="text-indigo-300" /> Audit: {office.lastAudit}</span>
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-6 border-t lg:border-t-0 lg:border-l border-indigo-50 dark:border-white/5 pt-5 lg:pt-0 lg:pl-10">
                                    <div className="text-center min-w-[70px]">
                                        <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-1">Regions</p>
                                        <p className="text-lg font-black text-indigo-900 dark:text-white italic">{office.regions}</p>
                                    </div>
                                    <div className="text-center min-w-[120px]">
                                        <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-2">Budget Sync</p>
                                        <div className="flex items-center gap-2">
                                            <div className="flex-1 h-2 bg-indigo-50 dark:bg-white/10 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-indigo-900 transition-all duration-1000"
                                                    style={{ width: office.budget }}
                                                ></div>
                                            </div>
                                            <span className="text-[10px] font-black text-indigo-900 dark:text-white">{office.budget}</span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleOpenDetails(office)}
                                        className="p-5 bg-indigo-50 dark:bg-white/5 rounded-[1.5rem] hover:bg-indigo-900 hover:text-white transition-all transform hover:rotate-6 active:scale-90 text-indigo-900 dark:text-indigo-400"
                                    >
                                        <ArrowUpRight size={22} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )) : (
                        <div className="bg-white dark:bg-indigo-900 rounded-[2.5rem] p-20 text-center border-2 border-dashed border-indigo-100 dark:border-indigo-800">
                            <Search className="mx-auto text-indigo-200 mb-4" size={48} />
                            <h3 className="text-lg font-black text-indigo-900 dark:text-white uppercase tracking-tighter italic">No Institution Found</h3>
                            <p className="text-xs text-indigo-400 mt-1 font-bold">Registry query returned zero results.</p>
                        </div>
                    )}
                </div>

                {/* RIGHT: Monitoring & Action */}
                <div className="space-y-6">
                    {/* Sync Panel */}
                    <div className={`rounded-[2.5rem] p-8 text-white shadow-2xl transition-all duration-500 relative overflow-hidden ${isSyncing ? 'bg-indigo-900' : 'bg-indigo-900 shadow-indigo-900/30'}`}>
                        <Globe className="absolute -right-10 -bottom-10 text-white/10 rotate-12" size={200} />
                        <div className="relative z-10">
                            <div className="flex justify-between items-start mb-4">
                                <h4 className="text-xl font-black italic tracking-tighter leading-tight">National Registry Integrity</h4>
                                {isSyncing ? <RefreshCw className="animate-spin" size={20} /> : <CheckCircle2 size={20} className="text-indigo-400" />}
                            </div>
                            <p className="text-indigo-100 text-xs font-medium leading-relaxed mb-6">
                                {isSyncing ? `Synchronizing Tier 1 nodes... ${syncProgress}%` : "System-wide data synchronization is at 99.8%. No critical failures reported."}
                            </p>

                            {isSyncing && (
                                <div className="w-full h-1.5 bg-white/20 rounded-full mb-6 overflow-hidden">
                                    <div className="h-full bg-white transition-all duration-300" style={{ width: `${syncProgress}%` }}></div>
                                </div>
                            )}

                            <button
                                onClick={handleSync}
                                disabled={isSyncing}
                                className="w-full py-4 bg-white text-indigo-900 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-indigo-50 transition-all disabled:opacity-50 shadow-lg"
                            >
                                {isSyncing ? "Sync in Progress" : "Run Global Sync"}
                            </button>
                        </div>
                    </div>

                    {/* Audit Logs */}
                    <div className="bg-white dark:bg-indigo-900 border border-indigo-100 dark:border-indigo-800 rounded-[2.5rem] p-8">
                        <div className="flex items-center justify-between mb-8">
                            <h4 className="font-black text-[10px] uppercase tracking-[0.2em] text-indigo-900 dark:text-white">Federal Log Stream</h4>
                            <div className="p-2 bg-indigo-50 dark:bg-white/5 rounded-lg text-indigo-400"><FileText size={16} /></div>
                        </div>
                        <div className="space-y-7 relative before:absolute before:left-1 before:top-2 before:bottom-2 before:w-[1px] before:bg-indigo-100 dark:before:bg-indigo-800">
                            {[
                                { user: "Admin", action: "MOTRI Hierarchy Update", time: "12m ago", color: "bg-indigo-900" },
                                { user: "Customs", action: "ECC Regional Sync", time: "1h ago", color: "bg-indigo-500" },
                                { user: "System", action: "Budget Audit Auto-Run", time: "3h ago", color: "bg-indigo-300" }
                            ].map((log, i) => (
                                <div key={i} className="flex gap-4 relative">
                                    <div className={`w-2 h-2 ${log.color} rounded-full mt-1.5 shrink-0 z-10 ring-4 ring-white dark:ring-indigo-900`}></div>
                                    <div>
                                        <p className="text-[11px] font-black text-indigo-900 dark:text-white italic tracking-tight">{log.action}</p>
                                        <p className="text-[9px] text-indigo-400 mt-1 uppercase font-black tracking-widest">{log.user} • {log.time}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button className="w-full mt-8 py-4 border-2 border-indigo-100 dark:border-indigo-800 rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] text-indigo-400 hover:bg-indigo-50 dark:hover:bg-white/5 transition-all">
                            View Full Audit Trail
                        </button>
                    </div>
                </div>
            </div>

            {/* --- ADD Institution MODAL --- */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-indigo-900/60 backdrop-blur-md" onClick={() => setIsAddModalOpen(false)} />
                    <div className="relative w-full max-w-2xl bg-white dark:bg-indigo-900 rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 border border-indigo-100 dark:border-indigo-800">
                        <form onSubmit={handleAddOffice}>
                            <div className="p-8 border-b border-indigo-50 dark:border-white/5 flex justify-between items-center bg-indigo-50 dark:bg-white/5">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 bg-indigo-900 text-white rounded-2xl flex items-center justify-center shadow-lg">
                                        <Building2 size={28} />
                                    </div>
                                    <div>
                                        <h3 className="font-black text-2xl text-indigo-900 dark:text-white italic tracking-tighter leading-tight">New Federal Body</h3>
                                        <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest mt-1">Registry Protocol 4.1-A</p>
                                    </div>
                                </div>
                                <button type="button" onClick={() => setIsAddModalOpen(false)} className="p-3 hover:bg-indigo-200 dark:hover:bg-white/10 rounded-full text-indigo-400 transition-all">
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest ml-1">Official Name</label>
                                        <input required type="text" placeholder="Ministry of..." className="w-full bg-indigo-50 dark:bg-indigo-950 border-2 border-indigo-100 dark:border-indigo-800 rounded-2xl px-5 py-4 text-xs font-bold text-indigo-900 dark:text-white focus:border-indigo-900 outline-none transition-all" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest ml-1">Acronym / Code</label>
                                        <input required type="text" placeholder="E.g. MOTRI" className="w-full bg-indigo-50 dark:bg-indigo-950 border-2 border-indigo-100 dark:border-indigo-800 rounded-2xl px-5 py-4 text-xs font-bold text-indigo-900 dark:text-white focus:border-indigo-900 outline-none transition-all" />
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest ml-1">Head of Institution</label>
                                        <input required type="text" placeholder="Enter full name" className="w-full bg-indigo-50 dark:bg-indigo-950 border-2 border-indigo-100 dark:border-indigo-800 rounded-2xl px-5 py-4 text-xs font-bold text-indigo-900 dark:text-white focus:border-indigo-900 outline-none transition-all" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest ml-1">Initial Status</label>
                                        <select className="w-full bg-indigo-50 dark:bg-indigo-950 border-2 border-indigo-100 dark:border-indigo-800 rounded-2xl px-5 py-4 text-xs font-bold text-indigo-900 dark:text-white focus:border-indigo-900 outline-none transition-all appearance-none">
                                            <option>Active</option>
                                            <option>Under Review</option>
                                            <option>Inactive</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="p-8 bg-indigo-50 dark:bg-white/5 flex items-center justify-between border-t border-indigo-100 dark:border-white/5">
                                <div className="flex items-center gap-2 text-indigo-400 font-black text-[9px] uppercase tracking-widest">
                                    <ShieldCheck size={16} /> Digital Seal Authority Required
                                </div>
                                <button type="submit" className="px-10 py-5 bg-indigo-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-black transition-all shadow-xl shadow-indigo-900/30">
                                    Authorize Registration
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* --- DETAILS MODAL --- */}
            {isDetailsOpen && selectedOffice && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-indigo-900/80 backdrop-blur-md" onClick={() => setIsDetailsOpen(false)} />
                    <div className="relative w-full max-w-3xl bg-white dark:bg-indigo-900 rounded-[3rem] shadow-2xl overflow-hidden border border-indigo-100 dark:border-indigo-800">
                        <div className="h-32 bg-indigo-900 relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent"></div>
                            <button onClick={() => setIsDetailsOpen(false)} className="absolute right-6 top-6 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="px-10 -mt-12 pb-10">
                            <div className="flex flex-col md:flex-row md:items-end gap-6 mb-8">
                                <div className="w-28 h-28 bg-white dark:bg-indigo-900 rounded-[2.5rem] p-2 shadow-xl">
                                    <div className="w-full h-full bg-indigo-50 dark:bg-white/5 rounded-[2rem] flex items-center justify-center font-black text-4xl text-indigo-900 dark:text-indigo-400 border border-indigo-100 dark:border-white/5 shadow-inner">
                                        {selectedOffice.acronym[0]}
                                    </div>
                                </div>
                                <div className="flex-1 pb-2">
                                    <div className="flex items-center gap-3">
                                        <h2 className="text-3xl font-black text-indigo-900 dark:text-white tracking-tighter italic">{selectedOffice.name}</h2>
                                        <span className="px-3 py-1 bg-indigo-900 text-white text-[9px] font-black rounded-lg uppercase tracking-widest">Live</span>
                                    </div>
                                    <p className="text-indigo-400 font-black uppercase tracking-[0.3em] text-[10px] mt-1">{selectedOffice.role} • {selectedOffice.acronym}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                <div className="md:col-span-2 space-y-6">
                                    <div className="bg-indigo-50/50 dark:bg-black/20 p-6 rounded-[2rem] border border-indigo-100 dark:border-white/5">
                                        <h5 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-3">Institutional Mandate</h5>
                                        <p className="text-sm text-indigo-900 dark:text-indigo-200 leading-relaxed font-bold italic">
                                            "{selectedOffice.description}"
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-indigo-50/30 dark:bg-white/5 p-5 rounded-2xl border border-indigo-50 dark:border-white/5">
                                            <Mail size={16} className="text-indigo-900 dark:text-indigo-400 mb-2" />
                                            <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">Official Email</p>
                                            <p className="text-[11px] font-black text-indigo-900 dark:text-white mt-1">{selectedOffice.email}</p>
                                        </div>
                                        <div className="bg-indigo-50/30 dark:bg-white/5 p-5 rounded-2xl border border-indigo-50 dark:border-white/5">
                                            <Phone size={16} className="text-indigo-900 dark:text-indigo-400 mb-2" />
                                            <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">Direct Hotline</p>
                                            <p className="text-[11px] font-black text-indigo-900 dark:text-white mt-1">{selectedOffice.phone}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className="bg-indigo-900 text-white rounded-[2rem] p-6 shadow-xl relative overflow-hidden">
                                        <Landmark className="absolute -right-4 -bottom-4 text-white/10" size={100} />
                                        <h5 className="text-[10px] font-black uppercase tracking-[0.2em] mb-4 text-indigo-200">Leadership</h5>
                                        <div className="flex items-center gap-4 relative z-10">
                                            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center font-black backdrop-blur-md">
                                                {selectedOffice.head.split(' ').map(n => n[0]).join('')}
                                            </div>
                                            <div>
                                                <p className="text-xs font-black leading-tight italic">{selectedOffice.head}</p>
                                                <p className="text-[9px] text-indigo-200 font-bold uppercase mt-1 tracking-tighter">Chief Administrator</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <button className="w-full py-4 bg-indigo-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-black transition-all">
                                            <Globe size={14} /> Open Portal
                                        </button>
                                        <button className="w-full py-4 border-2 border-indigo-100 dark:border-indigo-800 text-indigo-900 dark:text-indigo-400 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-indigo-50 transition-all">
                                            <FileText size={14} /> Organization Chart
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FederalHierarchy;