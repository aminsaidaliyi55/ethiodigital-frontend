import React, { useState, useEffect } from "react";
import {
    User, Mail, Phone, Building2, Briefcase, Shield,
    Bell, Lock, Save, Camera, Edit, CheckCircle2,
    AlertCircle, Loader2, Video, Clock, ShieldCheck,
    Globe, Info
} from "lucide-react";
import { getCurrentUser } from "../../services/authService";
import { updateUserProfile } from "../../services/profileService.js";
import toast from "react-hot-toast";

const ProfilePage = () => {
    // --- STATE MANAGEMENT ---
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "+251-9xx-xxx-xxx", // Default placeholder if not in DB
        organization: "EAII",
        department: "System Dev & Infrastructure",
        role: "",
        bio: "View and track system issues from sub city organizations",
        avatar: "",
        notifications: {
            email: true,
            videoCall: false,
            push: true,
            issueAssigned: true,
            statusUpdates: true,
            escalation: false,
            weeklyReports: true
        },
        sessionTimeout: "30 Minute"
    });

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // --- FETCH CURRENT USER DATA ---
    useEffect(() => {
        const loadUserData = async () => {
            try {
                const user = await getCurrentUser();
                setFormData(prev => ({
                    ...prev,
                    name: user.name || "",
                    email: user.email || "",
                    role: user.role || "User",
                    avatar: user.avatar || user.profile_image || ""
                }));
            } catch (err) {
                console.error("Failed to load user:", err);
                toast.error("Could not sync profile data.");
            } finally {
                setIsLoading(false);
            }
        };
        loadUserData();
    }, []);

    // --- EVENT HANDLERS ---
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleToggle = (key) => {
        setFormData(prev => ({
            ...prev,
            notifications: {
                ...prev.notifications,
                [key]: !prev.notifications[key]
            }
        }));
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const payload = {
                name: formData.name,
                email: formData.email,
                avatar: formData.avatar,
                // Add other metadata if your backend supports it
                metadata: {
                    phone: formData.phone,
                    bio: formData.bio,
                    notifications: formData.notifications,
                    sessionTimeout: formData.sessionTimeout
                }
            };
            await updateUserProfile(payload);
            toast.success("Profile & Preferences updated successfully!");
        } catch (err) {
            toast.error(err.response?.data?.error || "Failed to save changes.");
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) return (
        <div className="flex flex-col items-center justify-center h-[80vh]">
            <Loader2 className="w-10 h-10 animate-spin text-[#004A7C]" />
            <p className="mt-4 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 text-center">
                Synchronizing with Institute Servers...
            </p>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-10 font-sans animate-in fade-in duration-500 pb-24">
            <div className="max-w-6xl mx-auto space-y-8">

                {/* --- HEADER --- */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-6">
                    <div>
                        <h1 className="text-3xl font-black text-[#002D5B] tracking-tight uppercase">Profile & Settings</h1>
                        <p className="text-sm font-bold text-slate-400 mt-1">Manage institutional identity and system preferences</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">EAII / System Admin / Identity</span>
                    </div>
                </div>

                {/* --- IDENTITY CARD --- */}
                <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 p-8 relative">
                    <div className="flex flex-col md:flex-row items-center gap-8">
                        <div className="relative group">
                            <div className="w-32 h-32 rounded-[2.2rem] bg-slate-50 border-4 border-white shadow-md overflow-hidden">
                                {formData.avatar ? (
                                    <img src={formData.avatar} alt="Avatar" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full bg-[#004A7C] flex items-center justify-center text-white font-black text-3xl">
                                        {formData.name?.charAt(0)}
                                    </div>
                                )}
                            </div>
                            <button className="absolute -bottom-2 -right-2 p-2.5 bg-[#004A7C] text-white rounded-xl shadow-lg border-2 border-white hover:scale-110 transition-transform">
                                <Camera size={16} />
                            </button>
                        </div>

                        <div className="text-center md:text-left flex-1">
                            <h2 className="text-2xl font-black text-[#002D5B]">{formData.name}</h2>
                            <p className="text-sm font-bold text-slate-400">{formData.email}</p>
                            <div className="flex flex-wrap justify-center md:justify-start gap-2 mt-4">
                                <Badge text="EAII" />
                                <Badge text={formData.department.split(' ')[0]} />
                                <Badge text={formData.role} color="bg-blue-600 text-white" />
                            </div>
                        </div>

                        <div className="hidden lg:block max-w-xs text-right">
                            <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Current Status</p>
                            <div className="flex items-center justify-end gap-2 text-emerald-500 font-black text-xs uppercase">
                                <CheckCircle2 size={14} /> Verified Personnel
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* LEFT COLUMN */}
                    <div className="lg:col-span-8 space-y-8">

                        {/* PERSONAL INFO */}
                        <section className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 p-8 md:p-10 space-y-8">
                            <SectionHeader icon={User} title="Personal Information" sub="Edit your contact and institutional details" />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <InputField label="Full Name" name="name" value={formData.name} onChange={handleInputChange} />
                                <InputField label="Email Address" name="email" value={formData.email} onChange={handleInputChange} />
                                <InputField label="Phone Number" name="phone" value={formData.phone} onChange={handleInputChange} />
                                <InputField label="Organization" name="organization" value={formData.organization} onChange={handleInputChange} />
                                <InputField label="Department" name="department" value={formData.department} onChange={handleInputChange} />
                                <InputField label="Role Title" name="role" value={formData.role} onChange={handleInputChange} />
                                <div className="md:col-span-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Bio / Designation Description</label>
                                    <textarea
                                        name="bio"
                                        value={formData.bio}
                                        onChange={handleInputChange}
                                        className="w-full mt-2 p-4 bg-slate-50 border border-transparent focus:border-[#004A7C]/20 focus:bg-white rounded-2xl outline-none text-xs font-bold text-[#002D5B] transition-all"
                                        rows="3"
                                    />
                                </div>
                            </div>
                        </section>

                        {/* NOTIFICATIONS */}
                        <section className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 p-8 md:p-10">
                            <SectionHeader icon={Bell} title="Notification Preferences" sub="Manage how you receive critical system updates" />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 mt-10">
                                <div className="space-y-6">
                                    <h4 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] border-b pb-2">Channels</h4>
                                    <ToggleItem label="Email Notifications" desc="Updates to your primary inbox" active={formData.notifications.email} onClick={() => handleToggle('email')} />
                                    <ToggleItem label="Video Call" desc="Automated meeting alerts" active={formData.notifications.videoCall} onClick={() => handleToggle('videoCall')} icon={Video} />
                                    <ToggleItem label="Desktop Push" desc="Real-time browser notifications" active={formData.notifications.push} onClick={() => handleToggle('push')} />
                                </div>
                                <div className="space-y-6 mt-10 md:mt-0">
                                    <h4 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] border-b pb-2">Event Types</h4>
                                    <ToggleItem label="New Issue Assigned" desc="Immediate alert on new tasks" active={formData.notifications.issueAssigned} onClick={() => handleToggle('issueAssigned')} />
                                    <ToggleItem label="Status Updates" desc="Alerts on lifecycle changes" active={formData.notifications.statusUpdates} onClick={() => handleToggle('statusUpdates')} />
                                    <ToggleItem label="Escalation Alerts" desc="Higher-priority movements" active={formData.notifications.escalation} onClick={() => handleToggle('escalation')} />
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* RIGHT COLUMN */}
                    <div className="lg:col-span-4 space-y-8">

                        {/* PERMISSIONS MATRIX */}
                        <section className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 p-8">
                            <SectionHeader icon={ShieldCheck} title="Role & Access" color="text-emerald-600" />
                            <div className="mt-6 p-5 bg-emerald-50/50 rounded-2xl border border-emerald-100 mb-6">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-[10px] font-black text-emerald-700 uppercase">{formData.role}</span>
                                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                </div>
                                <p className="text-[10px] font-bold text-emerald-800/70 leading-relaxed">
                                    Your account has verified access to institutional maintenance protocols and QA workflows.
                                </p>
                            </div>
                            <div className="space-y-1">
                                <PermissionRow label="Create Issues" status="Granted" />
                                <PermissionRow label="Edit Issues" status="Granted" />
                                <PermissionRow label="Assign Tasks" status="Granted" />
                                <PermissionRow label="Manage Users" status="Restricted" />
                                <PermissionRow label="System Config" status="Restricted" />
                            </div>
                        </section>

                        {/* SECURITY & SESSIONS */}
                        <section className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 p-8">
                            <SectionHeader icon={Lock} title="Security" color="text-rose-500" />
                            <div className="mt-8 space-y-6">
                                <SecurityItem title="Password" sub="Changed 30 days ago" action="Update" />
                                <SecurityItem title="2-Factor Auth" sub="Additional login security" action="Enable" isToggle />

                                <div className="pt-6 border-t border-slate-50">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 block mb-3">Session Timeout</label>
                                    <select
                                        name="sessionTimeout"
                                        value={formData.sessionTimeout}
                                        onChange={handleInputChange}
                                        className="w-full p-4 bg-slate-50 border border-transparent rounded-2xl text-xs font-black text-[#004A7C] outline-none appearance-none"
                                    >
                                        <option value="15 Minute">15 Minute</option>
                                        <option value="30 Minute">30 Minute</option>
                                        <option value="60 Minute">60 Minute</option>
                                    </select>
                                </div>
                            </div>
                        </section>
                    </div>
                </div>

                {/* --- PERSISTENT SAVE BAR --- */}
                <div className="fixed bottom-0 left-0 right-0 md:left-64 bg-white/90 backdrop-blur-xl border-t border-slate-100 p-5 flex justify-end px-10 z-[100] shadow-2xl">
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="flex items-center gap-4 px-12 py-4 bg-[#002D5B] text-white rounded-[1.4rem] font-black text-[11px] uppercase tracking-[0.25em] hover:bg-[#004A7C] transition-all disabled:opacity-50 shadow-lg shadow-blue-900/20 active:scale-95"
                    >
                        {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                        {isSaving ? "Synchronizing..." : "Save Preferences"}
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- REUSABLE COMPONENTS ---

const Badge = ({ text, color = "bg-blue-50 text-[#004A7C]" }) => (
    <span className={`px-4 py-1.5 ${color} text-[9px] font-black rounded-full uppercase tracking-widest border border-current/10`}>
        {text}
    </span>
);

const SectionHeader = ({ icon: Icon, title, sub, color = "text-[#004A7C]" }) => (
    <div className="flex items-center gap-4">
        <div className={`p-3 bg-slate-50 ${color} rounded-2xl shadow-sm`}><Icon size={20} /></div>
        <div>
            <h3 className="text-sm font-black text-[#002D5B] uppercase tracking-tight">{title}</h3>
            {sub && <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{sub}</p>}
        </div>
    </div>
);

const InputField = ({ label, name, value, onChange }) => (
    <div className="space-y-1.5">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>
        <input
            type="text"
            name={name}
            value={value}
            onChange={onChange}
            className="w-full px-5 py-4 bg-slate-50 border border-transparent focus:border-[#004A7C]/20 focus:bg-white rounded-2xl outline-none text-xs font-bold text-[#002D5B] transition-all"
        />
    </div>
);

const PermissionRow = ({ label, status }) => {
    const isGranted = status === "Granted";
    return (
        <div className="flex items-center justify-between p-3.5 hover:bg-slate-50 rounded-2xl transition-colors border border-transparent">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">{label}</span>
            <span className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase ${isGranted ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-400"}`}>
                {status}
            </span>
        </div>
    );
};

const ToggleItem = ({ label, desc, active, onClick, icon: Icon }) => (
    <div className="flex items-center justify-between group cursor-pointer" onClick={onClick}>
        <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-[#004A7C]">
                {Icon ? <Icon size={14} /> : <div className="w-1.5 h-1.5 rounded-full bg-current" />}
            </div>
            <div>
                <p className="text-[11px] font-black text-[#002D5B] uppercase tracking-tight">{label}</p>
                <p className="text-[9px] font-bold text-slate-400 leading-none mt-1">{desc}</p>
            </div>
        </div>
        <button className={`w-10 h-5 rounded-full relative transition-all duration-300 ${active ? "bg-[#004A7C]" : "bg-slate-200"}`}>
            <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all duration-300 ${active ? "right-1" : "left-1 shadow-sm"}`} />
        </button>
    </div>
);

const SecurityItem = ({ title, sub, action, isToggle }) => (
    <div className="flex items-center justify-between">
        <div>
            <p className="text-[11px] font-black text-[#002D5B] uppercase tracking-tight">{title}</p>
            <p className="text-[9px] font-bold text-slate-400 mt-0.5">{sub}</p>
        </div>
        {isToggle ? (
            <div className="w-10 h-5 rounded-full bg-slate-100 border border-slate-200" />
        ) : (
            <button className="px-3 py-2 text-[9px] font-black text-[#004A7C] uppercase border border-slate-100 rounded-xl hover:bg-slate-50 transition-all">
                {action}
            </button>
        )}
    </div>
);

export default ProfilePage;