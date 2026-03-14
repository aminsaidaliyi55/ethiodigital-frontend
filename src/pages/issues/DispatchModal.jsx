import React, { useState, useEffect } from "react";
import { X, Truck, MapPin, Navigation as NavIcon, DollarSign, Clock, Hash, Search, Zap, ShieldCheck, History } from "lucide-react";
import { MapContainer, TileLayer, Marker, useMap, Polyline, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import toast from "react-hot-toast";

// Leaflet Marker Fix
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
    iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

function MapUpdater({ origin, dest }) {
    const map = useMap();
    useEffect(() => {
        if (origin?.lat && dest?.lat) {
            const bounds = L.latLngBounds([origin.lat, origin.lng], [dest.lat, dest.lng]);
            map.fitBounds(bounds, { padding: [80, 80] });
        }
    }, [origin, dest, map]);
    return null;
}

const DispatchModal = ({ isOpen, onClose, order, couriers, onDispatch }) => {
    const [manifest, setManifest] = useState({
        courier: "",
        tracking: `TRK-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        originCoords: { lat: 9.0192, lng: 38.7525, address: "Main Warehouse Hub" },
        destCoords: { lat: 8.9806, lng: 38.7578, address: "Customer Drop-off" },
        distance: 0,
        base_fee: 50.00,
        pricePerKm: 2.50,
        fuel_surcharge: 10,
        total_cost: 0,
        eta: "",
    });

    const [searchQuery, setSearchQuery] = useState({ origin: "", dest: "" });
    const [history, setHistory] = useState([]);

    // Load history from local storage on mount
    useEffect(() => {
        const saved = localStorage.getItem("logistics_search_history");
        if (saved) setHistory(JSON.parse(saved));
    }, []);

    const calculateDistance = (p1, p2) => {
        if (!p1.lat || !p2.lat) return 0;
        const R = 6371;
        const dLat = (p2.lat - p1.lat) * Math.PI / 180;
        const dLon = (p2.lng - p1.lng) * Math.PI / 180;
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(p1.lat * Math.PI / 180) * Math.cos(p2.lat * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return parseFloat((R * c).toFixed(2));
    };

    useEffect(() => {
        if (manifest.originCoords.lat && manifest.destCoords.lat) {
            const dist = calculateDistance(manifest.originCoords, manifest.destCoords);
            setManifest(prev => ({ ...prev, distance: dist }));
        }
    }, [manifest.originCoords, manifest.destCoords]);

    useEffect(() => {
        const subtotal = manifest.base_fee + (manifest.distance * manifest.pricePerKm);
        const surchargeAmount = subtotal * (manifest.fuel_surcharge / 100);
        const finalTotal = (subtotal + surchargeAmount).toFixed(2);
        setManifest(prev => ({ ...prev, total_cost: finalTotal }));
    }, [manifest.distance, manifest.pricePerKm, manifest.base_fee, manifest.fuel_surcharge]);

    const addToHistory = (location) => {
        const newHistory = [location, ...history.filter(h => h.address !== location.address)].slice(0, 5);
        setHistory(newHistory);
        localStorage.setItem("logistics_search_history", JSON.stringify(newHistory));
    };

    const handleSearch = async (type, forcedQuery = null) => {
        const query = forcedQuery || (type === 'origin' ? searchQuery.origin : searchQuery.dest);
        if (!query) return;

        const loadingToast = toast.loading(`Locating point...`);
        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`);
            const data = await res.json();
            if (data.length > 0) {
                const { lat, lon, display_name } = data[0];
                const locationData = { lat: parseFloat(lat), lng: parseFloat(lon), address: display_name };

                setManifest(prev => ({ ...prev, [`${type}Coords`]: locationData }));
                addToHistory(locationData);
                toast.success("Location Sync'd", { id: loadingToast });
            } else {
                toast.error("Not found", { id: loadingToast });
            }
        } catch (err) {
            toast.error("Search failed", { id: loadingToast });
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl">
            <div className="bg-white w-full max-w-7xl h-[94vh] rounded-[4rem] overflow-hidden shadow-2xl flex flex-col md:flex-row border border-white/10 animate-in fade-in zoom-in-95 duration-500">

                {/* Map Section */}
                <div className="w-full md:w-3/5 relative bg-slate-100">
                    <MapContainer center={[manifest.originCoords.lat, manifest.originCoords.lng]} zoom={13} className="h-full w-full grayscale-[0.2]">
                        <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />
                        <Marker position={[manifest.originCoords.lat, manifest.originCoords.lng]}>
                            <Popup><b>Pickup Point</b><br/>{manifest.originCoords.address}</Popup>
                        </Marker>
                        <Marker position={[manifest.destCoords.lat, manifest.destCoords.lng]}>
                            <Popup><b>Delivery Point</b><br/>{manifest.destCoords.address}</Popup>
                        </Marker>
                        <Polyline positions={[[manifest.originCoords.lat, manifest.originCoords.lng], [manifest.destCoords.lat, manifest.destCoords.lng]]} color="#312e81" weight={5} dashArray="1, 12" />
                        <MapUpdater origin={manifest.originCoords} dest={manifest.destCoords} />
                    </MapContainer>

                    {/* Inputs + History */}
                    <div className="absolute top-10 left-10 right-10 z-[1000] space-y-4">
                        {['origin', 'dest'].map((type) => (
                            <div key={type} className="space-y-2">
                                <div className="relative group">
                                    <input
                                        className={`w-full p-6 pl-16 rounded-[2rem] shadow-2xl border-none ring-1 ring-black/5 focus:ring-4 text-sm font-bold bg-white/95 backdrop-blur-md ${type === 'origin' ? 'focus:ring-indigo-600/30' : 'focus:ring-emerald-600/30'}`}
                                        placeholder={type === 'origin' ? "Where are we picking up?" : "Where are we delivering?"}
                                        value={searchQuery[type]}
                                        onChange={(e) => setSearchQuery({...searchQuery, [type]: e.target.value})}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSearch(type)}
                                    />
                                    {type === 'origin' ? <NavIcon className="absolute left-6 top-6 text-indigo-600" size={22} /> : <MapPin className="absolute left-6 top-6 text-emerald-600" size={22} />}
                                </div>
                                {/* History Chips */}
                                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
                                    {history.map((h, i) => (
                                        <button
                                            key={i}
                                            onClick={() => handleSearch(type, h.address)}
                                            className="whitespace-nowrap bg-white/80 hover:bg-white px-4 py-2 rounded-full text-[10px] font-bold text-slate-600 shadow-sm border border-slate-100 flex items-center gap-2 transition-all"
                                        >
                                            <History size={12} /> {h.address.split(',')[0]}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="absolute bottom-10 left-10 z-[1000] bg-indigo-950 text-white p-6 rounded-[2.5rem] shadow-2xl flex items-center gap-6 border border-white/10">
                        <div className="h-12 w-12 bg-white/10 rounded-2xl flex items-center justify-center">
                            <Zap className="text-emerald-400" size={24} fill="currentColor" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-300">Travel Distance</p>
                            <p className="text-2xl font-black italic tracking-tighter">{manifest.distance} <span className="text-sm">KM</span></p>
                        </div>
                    </div>
                </div>

                {/* Form Section */}
                <div className="w-full md:w-2/5 flex flex-col h-full bg-white relative">
                    <div className="p-12 bg-indigo-950 text-white flex justify-between items-center relative overflow-hidden">
                        <div className="relative z-10">
                            <h2 className="text-4xl font-black uppercase italic tracking-tighter leading-none mb-2">Manifest</h2>
                            <div className="flex items-center gap-2">
                                <ShieldCheck size={14} className="text-emerald-400" />
                                <p className="text-[10px] text-indigo-300 font-bold tracking-[0.3em] uppercase">Ready for Assignment</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="relative z-10 hover:bg-white/10 p-4 rounded-full transition-all active:scale-90"><X size={32} /></button>
                    </div>

                    <form onSubmit={(e) => { e.preventDefault(); onDispatch(manifest); }} className="p-12 overflow-y-auto flex-1 space-y-10 custom-scrollbar">
                        <div className="space-y-4">
                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] ml-2">Assign Driver</label>
                            <div className="relative group">
                                <Truck className="absolute left-6 top-6 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={22} />
                                <select
                                    className="w-full p-6 pl-16 bg-slate-50 rounded-[2rem] border-none ring-1 ring-slate-200 focus:ring-4 focus:ring-indigo-600/10 appearance-none font-black text-sm text-indigo-950"
                                    required
                                    value={manifest.courier}
                                    onChange={(e) => setManifest({...manifest, courier: e.target.value})}
                                >
                                    <option value="">Select a Fleet Driver...</option>
                                    {couriers.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="bg-slate-900 p-8 rounded-[3.5rem] text-white shadow-2xl relative overflow-hidden">
                            <div className="grid grid-cols-2 gap-6 relative z-10">
                                <div className="space-y-3">
                                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Fixed Handling</label>
                                    <input type="number" value={manifest.base_fee}  className="w-full bg-slate-800 p-4 rounded-2xl border-none ring-1 ring-white/10 font-black text-white text-lg" onChange={(e) => setManifest({...manifest, base_fee: parseFloat(e.target.value) || 0})} />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Rate / KM</label>
                                    <input type="number" value={manifest.pricePerKm} className="w-full bg-slate-800 p-4 rounded-2xl border-none ring-1 ring-white/10 font-black text-white text-lg" onChange={(e) => setManifest({...manifest, pricePerKm: parseFloat(e.target.value) || 0})} />
                                </div>
                            </div>
                            <div className="mt-8 pt-8 border-t border-white/5 flex justify-between items-end relative z-10">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Final Freight Quote</p>
                                <p className="text-5xl font-black italic tracking-tighter text-white">${manifest.total_cost}</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] ml-2">Delivery Schedule (ETA)</label>
                            <div className="relative">
                                <Clock className="absolute left-6 top-6 text-slate-400" size={22} />
                                <input type="datetime-local" required className="w-full p-6 pl-16 bg-slate-50 rounded-[2rem] border-none ring-1 ring-slate-200 font-bold text-indigo-950 focus:ring-4 focus:ring-indigo-600/10" onChange={(e) => setManifest({...manifest, eta: e.target.value})} />
                            </div>
                        </div>

                        <button type="submit" className="w-full py-8 bg-indigo-950 text-white rounded-[2.5rem] font-black uppercase tracking-[0.5em] text-xs hover:bg-emerald-600 transition-all flex items-center justify-center gap-4">
                            <NavIcon size={18} fill="currentColor" />
                            Confirm & Dispatch
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default DispatchModal;