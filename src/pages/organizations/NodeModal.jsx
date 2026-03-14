import React, { useState, useEffect } from 'react';
import { X, Layers, AlertCircle, BarChart3, Target, Loader2, Search, MapPin, Shield } from "lucide-react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap, GeoJSON } from "react-leaflet";
import L from "leaflet";
import toast from "react-hot-toast";
import institutionService from '@/services/institutionService';

const customIcon = new L.Icon({
    iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
    iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
    iconSize: [20, 32],
    iconAnchor: [10, 32],
});

const MapController = ({ geoData, center }) => {
    const map = useMap();
    useEffect(() => {
        if (geoData) {
            const layer = L.geoJSON(geoData);
            map.fitBounds(layer.getBounds(), { padding: [40, 40], animate: true });
        } else if (center) {
            map.flyTo(center, 12, { animate: true });
        }
    }, [geoData, center, map]);
    return null;
};

const NodeModal = ({ mode, form, onClose, onSuccess, levels, initialFormState, readOnly }) => {
    // Logic: Initialize with form prop or fallback to initial state
    const [formData, setFormData] = useState(form || initialFormState);
    const [parentOptions, setParentOptions] = useState([]);
    const [submitting, setSubmitting] = useState(false);
    const [mapSearchQuery, setMapSearchQuery] = useState('');
    const [mapSearching, setMapSearching] = useState(false);
    const [geoJsonData, setGeoJsonData] = useState(null);

    // Logic: Sync internal state when the form prop changes (important for edit mode)
    useEffect(() => {
        setFormData(form || initialFormState);
    }, [form, initialFormState]);

    useEffect(() => {
        const fetchParents = async () => {
            // Logic: Safety check for level existence
            if (!formData?.level || formData.level === 'Region') {
                setParentOptions([]);
                return;
            }
            const parentLevelIndex = levels.indexOf(formData.level) - 1;
            const parentLevel = levels[parentLevelIndex];
            try {
                const parents = await institutionService.getRegionalHierarchy('', parentLevel);
                setParentOptions(parents || []);
            } catch (err) {
                console.error("Hierarchy sync error");
            }
        };
        if (mode !== 'delete') fetchParents();
    }, [formData?.level, mode, levels]);

    const handleLocationChange = (lat, lng, bbox) => {
        if (readOnly) return;
        const coords = bbox ? {
            north_lat: bbox[1], south_lat: bbox[0],
            west_lng: bbox[2], east_lng: bbox[3]
        } : {
            north_lat: (parseFloat(lat) + 0.01).toFixed(6),
            south_lat: (parseFloat(lat) - 0.01).toFixed(6),
            east_lng: (parseFloat(lng) + 0.01).toFixed(6),
            west_lng: (parseFloat(lng) - 0.01).toFixed(6)
        };
        setFormData(prev => ({ ...prev, ...coords }));
    };

    const handleMapSearch = async (e) => {
        if (e) e.preventDefault();
        if (!mapSearchQuery || readOnly) return;
        setMapSearching(true);
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&polygon_geojson=1&q=${encodeURIComponent(mapSearchQuery)}`);
            const data = await response.json();
            if (data && data.length > 0) {
                const result = data[0];
                setGeoJsonData(result.geojson);
                handleLocationChange(result.lat, result.lon, result.boundingbox);
                toast.success(`Territory identified`);
            } else {
                toast.error("Location not found");
            }
        } catch (err) {
            toast.error("Network error");
        } finally {
            setMapSearching(false);
        }
    };

    const handleSave = async (e) => {
        if (e) e.preventDefault();
        setSubmitting(true);
        try {
            if (mode === 'create') {
                await institutionService.createSubStructure(formData);
                toast.success("Node registered");
            } else if (mode === 'edit') {
                await institutionService.updateSubStructure(form.id, formData);
                toast.success("Registry updated");
            } else if (mode === 'delete') {
                await institutionService.deleteNode(form.id);
                toast.success("Node removed");
            }
            onSuccess();
            onClose();
        } catch (err) {
            toast.error("Operation failed");
        } finally {
            setSubmitting(false);
        }
    };

    const MapEvents = () => {
        useMapEvents({
            click(e) {
                if (readOnly) return;
                setGeoJsonData(null);
                handleLocationChange(e.latlng.lat, e.latlng.lng);
            }
        });
        return null;
    };

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white/70 dark:bg-slate-950/80 backdrop-blur-3xl p-4 md:p-8 animate-in fade-in duration-500">
            <div className={`bg-white dark:bg-slate-900 w-full ${mode === 'delete' ? 'max-w-md' : 'max-w-7xl'} rounded-[3rem] shadow-[0_32px_128px_-15px_rgba(0,0,0,0.3)] dark:shadow-none overflow-hidden flex flex-col max-h-[90vh] border border-white dark:border-slate-800 transition-all duration-500 scale-100`}>

                {/* Header */}
                <div className="px-10 py-8 border-b border-slate-50 dark:border-slate-800/50 flex justify-between items-center bg-white/50 dark:bg-slate-900/50 backdrop-blur-md sticky top-0 z-10">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-indigo-900 dark:bg-indigo-600 rounded-[1.2rem] text-white shadow-xl shadow-indigo-500/20">
                            <Shield size={20} />
                        </div>
                        <div>
                            <h2 className="text-[12px] font-black uppercase tracking-[0.25em] text-indigo-900 dark:text-indigo-400">Areas Configuration</h2>
                            <p className="text-[8px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-0.5">Instance: {formData?.level || 'Region'}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-3 bg-slate-50 dark:bg-slate-800/50 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-2xl text-slate-400 hover:text-rose-500 transition-all">
                        <X size={24}/>
                    </button>
                </div>

                <div className="p-10 overflow-y-auto custom-scrollbar">
                    {mode === 'delete' ? (
                        <div className="text-center py-6 space-y-8">
                            <div className="w-20 h-20 bg-rose-50 dark:bg-rose-950/30 rounded-full flex items-center justify-center mx-auto text-rose-500">
                                <AlertCircle size={40} />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Decommission Node</h3>
                                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-8">Confirm total removal of {form?.name} from the national registry?</p>
                            </div>
                            <div className="flex gap-4">
                                <button onClick={onClose} className="flex-1 py-5 rounded-2xl font-black uppercase text-[9px] tracking-widest bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">Abort</button>
                                <button onClick={handleSave} className="flex-1 py-5 rounded-2xl font-black uppercase text-[9px] tracking-widest bg-rose-600 text-white shadow-xl shadow-rose-500/20">Confirm</button>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                            {/* Control Panel */}
                            <form onSubmit={handleSave} className="lg:col-span-5 space-y-6">
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-black uppercase text-indigo-900/40 dark:text-indigo-400/40 ml-1 tracking-[0.1em]">Administrative Hierarchy</label>
                                    <div className="grid grid-cols-2 gap-4">
                                        <select disabled={readOnly} value={formData?.level || 'Region'} onChange={(e) => setFormData({...formData, level: e.target.value, parent_id: ''})} className="w-full bg-slate-50 dark:bg-slate-800 rounded-2xl py-4 px-5 font-bold text-[10px] uppercase border border-slate-100 dark:border-slate-700 dark:text-white outline-none focus:ring-4 focus:ring-indigo-500/5 transition-all">
                                            {levels.map(l => <option key={l} value={l}>{l}</option>)}
                                        </select>
                                        <select disabled={formData?.level === 'Region' || readOnly} value={formData?.parent_id || ''} onChange={(e) => setFormData({...formData, parent_id: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 rounded-2xl py-4 px-5 font-bold text-[10px] uppercase border border-slate-100 dark:border-slate-700 dark:text-white disabled:opacity-20 outline-none transition-all">
                                            <option value="">Select Parent</option>
                                            {parentOptions.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-black uppercase text-indigo-900/40 dark:text-indigo-400/40 ml-1 tracking-[0.1em]">Node Identity</label>
                                    <div className="flex gap-2">
                                        <input readOnly={readOnly} required placeholder="REGISTRY NAME" value={formData?.name || ''} onChange={(e)=>setFormData({...formData, name: e.target.value})} className="flex-[2] bg-slate-50 dark:bg-slate-800 rounded-2xl py-4 px-5 font-bold text-[10px] uppercase border border-slate-100 dark:border-slate-700 dark:text-white outline-none focus:ring-4 focus:ring-indigo-500/5 transition-all" />
                                        <input readOnly={readOnly} placeholder="ID CODE" value={formData?.admin_code || ''} onChange={(e)=>setFormData({...formData, admin_code: e.target.value})} className="flex-1 bg-slate-50 dark:bg-slate-800 rounded-2xl py-4 px-5 font-mono text-[10px] uppercase border border-slate-100 dark:border-slate-700 dark:text-white outline-none focus:ring-4 focus:ring-indigo-500/5 transition-all" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[9px] font-black uppercase text-indigo-900/40 dark:text-indigo-400/40 ml-1 tracking-[0.1em]">Population</label>
                                        <div className="relative">
                                            <BarChart3 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-600" size={14} />
                                            <input readOnly={readOnly} type="number" placeholder="0" value={formData?.population ?? ''} onChange={(e)=>setFormData({...formData, population: e.target.value})} className="w-full pl-11 bg-slate-50 dark:bg-slate-800 rounded-2xl py-4 px-5 font-bold text-[10px] border border-slate-100 dark:border-slate-700 dark:text-white outline-none focus:ring-4 focus:ring-indigo-500/5 transition-all" />
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[9px] font-black uppercase text-indigo-900/40 dark:text-indigo-400/40 ml-1 tracking-[0.1em]">Hectares (km²)</label>
                                        <input readOnly={readOnly} type="number" placeholder="0.00" value={formData?.area_km2 ?? ''} onChange={(e)=>setFormData({...formData, area_km2: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 rounded-2xl py-4 px-5 font-bold text-[10px] border border-slate-100 dark:border-slate-700 dark:text-white outline-none focus:ring-4 focus:ring-indigo-500/5 transition-all" />
                                    </div>
                                </div>

                                <div className="p-6 bg-indigo-950 dark:bg-black rounded-[2rem] shadow-2xl border border-indigo-900/50 dark:border-slate-800">
                                    <label className="text-[7px] font-black uppercase text-indigo-400 mb-4 block tracking-[0.3em] text-center opacity-70">Spatial Coordinate Grid</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <CoordinateInput label="North Index" color="text-indigo-400" value={formData?.north_lat ?? ''} onChange={(v)=> !readOnly && setFormData({...formData, north_lat: v})} />
                                        <CoordinateInput label="South Index" color="text-indigo-400" value={formData?.south_lat ?? ''} onChange={(v)=> !readOnly && setFormData({...formData, south_lat: v})} />
                                        <CoordinateInput label="East Index" color="text-indigo-400" value={formData?.east_lng ?? ''} onChange={(v)=> !readOnly && setFormData({...formData, east_lng: v})} />
                                        <CoordinateInput label="West Index" color="text-indigo-400" value={formData?.west_lng ?? ''} onChange={(v)=> !readOnly && setFormData({...formData, west_lng: v})} />
                                    </div>
                                </div>

                                {!readOnly && (
                                    <button type="submit" disabled={submitting} className="w-full bg-indigo-900 dark:bg-indigo-600 text-white py-5 rounded-2xl font-black uppercase tracking-widest text-[9px] shadow-2xl shadow-indigo-500/20 hover:bg-black dark:hover:bg-indigo-500 transition-all flex items-center justify-center gap-3">
                                        {submitting ? <Loader2 className="animate-spin" size={16} /> : 'Save'}
                                    </button>
                                )}
                            </form>

                            {/* Map Side */}
                            <div className="lg:col-span-7 space-y-4 flex flex-col">
                                {!readOnly && (
                                    <form onSubmit={handleMapSearch} className="flex gap-2">
                                        <div className="relative flex-1">
                                            <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 text-indigo-600 dark:text-indigo-400" size={16} />
                                            <input
                                                type="text"
                                                placeholder="Find territory..."
                                                className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl py-4 pl-12 pr-4 font-bold text-[10px] uppercase dark:text-white shadow-sm outline-none transition-all"
                                                value={mapSearchQuery}
                                                onChange={(e) => setMapSearchQuery(e.target.value)}
                                            />
                                        </div>
                                        <button type="submit" disabled={mapSearching} className="bg-indigo-900 dark:bg-indigo-600 text-white px-8 rounded-2xl font-black uppercase text-[9px] tracking-widest hover:bg-black transition-all flex items-center gap-2">
                                            {mapSearching ? <Loader2 className="animate-spin" size={14} /> : <Target size={14} />}
                                            Locate
                                        </button>
                                    </form>
                                )}

                                <div className="flex-1 min-h-[450px] w-full rounded-[2.5rem] border-4 border-white dark:border-slate-800 overflow-hidden relative shadow-inner">
                                    <MapContainer center={[9.0192, 38.7525]} zoom={12} style={{ height: "100%", width: "100%" }} zoomControl={false}>
                                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                        <MapController geoData={geoJsonData} />
                                        <MapEvents />
                                        {geoJsonData && <GeoJSON data={geoJsonData} style={{ color: '#6366f1', weight: 2, fillOpacity: 0.1, fillColor: '#6366f1' }} />}
                                        {formData?.north_lat && <Marker position={[parseFloat(formData.north_lat), parseFloat(formData.east_lng)]} icon={customIcon} />}
                                    </MapContainer>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const CoordinateInput = ({ label, color, value, onChange }) => (
    <div className="space-y-1.5">
        <label className={`text-[7px] font-black uppercase ${color} ml-1 opacity-70`}>{label}</label>
        <input
            type="number"
            step="any"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className="w-full bg-white/5 dark:bg-slate-900/50 border border-white/10 dark:border-slate-800 rounded-xl py-2.5 px-4 font-mono text-[10px] font-bold text-white outline-none focus:bg-white/10 transition-all placeholder:text-indigo-400/30"
            placeholder="0.000000"
        />
    </div>
);

export default NodeModal;