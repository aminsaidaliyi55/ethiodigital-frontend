import React, { useState, useEffect } from "react";
import { X, Building2, UserCheck, Info, Phone, Hash, ChevronRight, Check, FileText, MapPin, Navigation, Search, Loader2 } from "lucide-react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";
import toast from "react-hot-toast";

import "leaflet/dist/leaflet.css";

const customIcon = new L.Icon({
    iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
    iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});

const MapUpdater = ({ center }) => {
    const map = useMap();
    useEffect(() => {
        if (center) map.setView(center, 16);
    }, [center, map]);
    return null;
};

const ShopFormModal = ({ selected, onSave, onClose, availableDirectors = [], categories = [] }) => {
    const [activeTab, setActiveTab] = useState("profile");
    const [submitting, setSubmitting] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [isSearching, setIsSearching] = useState(false);

    const [form, setForm] = useState({
        name: "", industry: "", owner_id: "", phone: "",
        total_capital: "", opening_hours: "", category_id: "",
        tin_number: "", website: "", latitude: 9.03, longitude: 38.74,
        status: "active"
    });

    const [userForm, setUserForm] = useState({
        name: "", email: "", role: "SHOPOWNER", password: "ChangeMe123!"
    });

    useEffect(() => {
        if (selected) {
            setForm({
                ...selected,
                owner_id: selected.owner_id || "",
                category_id: selected.category_id || "",
                latitude: parseFloat(selected.latitude) || 9.03,
                longitude: parseFloat(selected.longitude) || 38.74
            });
        }
    }, [selected]);

    const handleLocationChange = (lat, lng) => {
        setForm(prev => ({ ...prev, latitude: parseFloat(lat), longitude: parseFloat(lng) }));
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;
        setIsSearching(true);
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`);
            const data = await response.json();
            if (data && data.length > 0) {
                const { lat, lon } = data[0];
                handleLocationChange(lat, lon);
                toast.success(`Located: ${data[0].display_name.split(',')[0]}`);
            } else {
                toast.error("Location not found");
            }
        } catch (error) {
            toast.error("Search error");
        } finally {
            setIsSearching(false);
        }
    };

    const getCurrentLocation = () => {
        if (!navigator.geolocation) return toast.error("GPS not supported");
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                handleLocationChange(pos.coords.latitude.toFixed(6), pos.coords.longitude.toFixed(6));
                toast.success("GPS Synced");
            },
            () => toast.error("GPS Denied")
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const payload = selected ? form : { shopForm: form, userForm: userForm };
            await onSave(payload);
        } catch (err) {
            toast.error("Action failed");
        } finally {
            setSubmitting(false);
        }
    };

    const MapEvents = () => {
        useMapEvents({
            click(e) {
                handleLocationChange(e.latlng.lat.toFixed(6), e.latlng.lng.toFixed(6));
            },
        });
        return null;
    };

    return (
        <div className="fixed inset-0 z-[1000] bg-indigo-950/95 backdrop-blur-xl flex items-center justify-center p-6">
            <div className="bg-white dark:bg-slate-950 w-full max-w-4xl rounded-[2.5rem] shadow-2xl max-h-[90vh] overflow-hidden flex flex-col border border-white/10">

                {/* Header */}
                <div className="bg-indigo-900 p-8 text-white flex justify-between items-center">
                    <div>
                        <h2 className="font-black text-xl uppercase tracking-tighter">{selected ? "Update Terminal" : "New Deployment"}</h2>
                        <p className="text-[8px] font-black text-indigo-300 uppercase tracking-[0.3em]">Environment Setup Protocol</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-all"><X size={20}/></button>
                </div>

                {/* Tab Navigation */}
                <div className="flex px-8 bg-slate-50 dark:bg-indigo-900/5">
                    {["profile", "location", ...(!selected ? ["staff"] : [])].map((tab, idx) => (
                        <button
                            key={tab}
                            type="button"
                            onClick={() => setActiveTab(tab)}
                            className={`px-6 py-4 text-[9px] font-black uppercase tracking-widest transition-all ${
                                activeTab === tab ? "text-indigo-900 dark:text-indigo-400 border-b-2 border-indigo-900 dark:border-indigo-400" : "text-slate-400"
                            }`}
                        >
                            {idx + 1}. {tab}
                        </button>
                    ))}
                </div>

                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
                    <div className="p-8 space-y-6">
                        {activeTab === "profile" && (
                            <div className="grid grid-cols-2 gap-4">
                                <FormInput label="Name" icon={<Building2 size={12}/>} value={form.name} onChange={v => setForm({...form, name: v})} span="col-span-2" />
                                <FormSelect label="Owner" icon={<UserCheck size={12}/>} value={form.owner_id} options={availableDirectors} onChange={v => setForm({...form, owner_id: v})} />
                                <FormSelect label="Category" icon={<Info size={12}/>} value={form.category_id} options={categories} onChange={v => setForm({...form, category_id: v})} />
                                <FormInput label="Contact" icon={<Phone size={12}/>} value={form.phone} onChange={v => setForm({...form, phone: v})} />
                                <FormInput label="TIN" icon={<Hash size={12}/>} value={form.tin_number} onChange={v => setForm({...form, tin_number: v})} />
                            </div>
                        )}

                        {activeTab === "location" && (
                            <div className="space-y-4">
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="SEARCH LOCATION..."
                                        className="w-full pl-6 pr-24 py-4 bg-slate-100 dark:bg-indigo-900/10 dark:text-white rounded-xl border-none outline-none text-[10px] font-black uppercase tracking-widest"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSearch(e)}
                                    />
                                    <button type="button" onClick={handleSearch} className="absolute right-2 top-2 bottom-2 px-4 bg-indigo-900 text-white rounded-lg text-[8px] font-black uppercase">
                                        {isSearching ? "..." : "Find"}
                                    </button>
                                </div>

                                <div className="h-[300px] w-full rounded-2xl overflow-hidden grayscale contrast-125 brightness-90">
                                    <MapContainer center={[form.latitude, form.longitude]} zoom={13} style={{ height: "100%", width: "100%" }}>
                                        <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
                                        <MapUpdater center={[form.latitude, form.longitude]} />
                                        <MapEvents />
                                        <Marker position={[form.latitude, form.longitude]} icon={customIcon} />
                                    </MapContainer>
                                </div>

                                <button type="button" onClick={getCurrentLocation} className="w-full py-3 bg-slate-100 dark:bg-indigo-900/10 text-[8px] font-black uppercase tracking-widest dark:text-white rounded-xl">
                                    Sync Live GPS
                                </button>
                            </div>
                        )}

                        {activeTab === "staff" && (
                            <div className="max-w-xs mx-auto space-y-4 py-10 text-center">
                                <FileText className="mx-auto text-indigo-900/20 mb-4" size={40} />
                                <FormInput label="Admin Name" value={userForm.name} onChange={v => setUserForm({...userForm, name: v})} />
                                <FormInput label="Admin Email" type="email" value={userForm.email} onChange={v => setUserForm({...userForm, email: v})} />
                            </div>
                        )}
                    </div>

                    <div className="p-8 bg-slate-50 dark:bg-indigo-900/5 flex justify-end gap-3">
                        {activeTab !== (selected ? "location" : "staff") ? (
                            <button type="button" onClick={() => setActiveTab(activeTab === "profile" ? "location" : "staff")} className="px-6 py-3 bg-indigo-900 text-white rounded-xl font-black text-[9px] uppercase tracking-widest flex items-center gap-2">
                                Next Step <ChevronRight size={14}/>
                            </button>
                        ) : (
                            <button type="submit" disabled={submitting} className="px-6 py-3 bg-indigo-900 text-white rounded-xl font-black text-[9px] uppercase tracking-widest flex items-center gap-2">
                                {submitting ? "Processing..." : "Commit Setup"} <Check size={14}/>
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
};

const FormInput = ({ label, icon, value, onChange, type="text", span="" }) => (
    <div className={`space-y-1 ${span}`}>
        <label className="text-[8px] font-black uppercase text-indigo-900/40 dark:text-slate-500 ml-1 flex items-center gap-2">{icon} {label}</label>
        <input type={type} required className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-indigo-900/10 dark:text-white border-none outline-none text-[10px] font-bold focus:ring-1 focus:ring-indigo-900 transition-all" value={value || ""} onChange={e => onChange(e.target.value)} />
    </div>
);

const FormSelect = ({ label, icon, value, options, onChange }) => {
    const safeOptions = Array.isArray(options) ? options : (options?.data || []);
    return (
        <div className="space-y-1">
            <label className="text-[8px] font-black uppercase text-indigo-900/40 dark:text-slate-500 ml-1 flex items-center gap-2">{icon} {label}</label>
            <select required className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-indigo-900/10 dark:text-white border-none outline-none text-[10px] font-bold appearance-none cursor-pointer" value={value || ""} onChange={e => onChange(e.target.value)}>
                <option value="">Choose...</option>
                {safeOptions.map(opt => <option key={opt.id} value={opt.id}>{opt.name || opt.username || opt.title}</option>)}
            </select>
        </div>
    );
};

export default ShopFormModal;