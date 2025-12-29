import React, { useState, useMemo, useEffect } from "react";
import {
    Network, List, Map as MapIcon, Globe,
    Navigation, Gauge, Zap, X, Sun, Moon, Maximize
} from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup, useMap, ZoomControl } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine';
import toast, { Toaster } from "react-hot-toast";
import { officeService } from "@/services/officeService";

// --- Leaflet Assets ---
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({ iconUrl: markerIcon, shadowUrl: markerShadow, iconSize: [25, 41], iconAnchor: [12, 41] });
L.Marker.prototype.options.icon = DefaultIcon;

const ETHIOPIA_CENTER = [9.0128, 38.7500];
const RANKINGS = { "Federal": 1, "Regional": 2, "Zone": 3, "Woreda": 4, "Kebele": 5 };

/**
 * Advanced Map Controller: Handles auto-zoom and smooth "Fly-To"
 */
const MapController = ({ bounds, targetPos }) => {
    const map = useMap();
    useEffect(() => {
        if (bounds && bounds.length > 0) {
            map.fitBounds(bounds, { padding: [50, 50], maxZoom: 12 });
        }
    }, [bounds, map]);

    useEffect(() => {
        if (targetPos) {
            map.flyTo(targetPos, 14, { duration: 2 });
        }
    }, [targetPos, map]);

    return null;
};

const RoutingEngine = ({ source, destination, onMetricsUpdate, onPathFound }) => {
    const map = useMap();
    useEffect(() => {
        if (!map || !source || !destination) return;
        const control = L.Routing.control({
            waypoints: [L.latLng(source.lat, source.lng), L.latLng(destination.lat, destination.lng)],
            lineOptions: {
                styles: [{ color: '#6366f1', weight: 6, opacity: 0.6 }]
            },
            createMarker: () => null,
            addWaypoints: false,
            show: false
        }).addTo(map);

        control.on('routesfound', (e) => {
            const routes = e.routes[0];
            onMetricsUpdate({
                distance: (routes.summary.totalDistance / 1000).toFixed(2) + " km",
                duration: Math.round(routes.summary.totalTime / 60) + " min"
            });
            onPathFound(routes.coordinates);
        });
        return () => map.removeControl(control);
    }, [map, source, destination]);
    return null;
};

const OrganizationStructure = () => {
    const [data, setData] = useState([]);
    const [viewMode, setViewMode] = useState("map");
    const [theme, setTheme] = useState("light"); // 'light' | 'dark'
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Routing & Analytics State
    const [source, setSource] = useState(null);
    const [destination, setDestination] = useState(null);
    const [metrics, setMetrics] = useState({ distance: "0 km", duration: "--" });
    const [pathCoords, setPathCoords] = useState([]);
    const [trackingPos, setTrackingPos] = useState(null);
    const [targetPos, setTargetPos] = useState(null);

    const [formData, setFormData] = useState({
        name: "", type: "Regional", manager: "", staff_count: 0,
        lat: 9.0128, lng: 38.7500
    });

    useEffect(() => { loadData(); }, []);

    const loadData = async () => {
        setIsLoading(true);
        try {
            const tree = await officeService.getAll();
            setData(Array.isArray(tree) ? tree : []);
        } catch (error) { toast.error("Database connection failed"); }
        finally { setIsLoading(false); }
    };

    const flattenedData = useMemo(() => {
        const flat = [];
        const recurse = (nodes) => {
            nodes.forEach(node => {
                flat.push({
                    ...node,
                    lat: parseFloat(node.lat) || 9.0 + (Math.random() * 0.5),
                    lng: parseFloat(node.lng) || 38.7 + (Math.random() * 0.5)
                });
                if (node.children) recurse(node.children);
            });
        };
        recurse(data);
        return flat;
    }, [data]);

    const mapBounds = useMemo(() => flattenedData.map(d => [d.lat, d.lng]), [flattenedData]);

    const runLiveTracking = () => {
        if (pathCoords.length === 0) return toast.error("Select route first.");
        let index = 0;
        const interval = setInterval(() => {
            if (index >= pathCoords.length) {
                clearInterval(interval);
                toast.success("Destination reached");
            } else {
                setTrackingPos([pathCoords[index].lat, pathCoords[index].lng]);
                index += 4;
            }
        }, 50);
    };

    const mapTileUrl = theme === 'light'
        ? "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        : "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";

    return (
        <div className={`min-h-screen transition-colors duration-500 lg:ml-72 p-4 md:p-10 ${theme === 'dark' ? 'bg-[#0f172a] text-white' : 'bg-white text-slate-900'}`}>
            <Toaster position="top-right" />

            <div className="w-full max-w-[100%] mx-auto space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-black flex items-center gap-3 tracking-tighter">
                            Geo-Matrix <Globe className="text-indigo-600 animate-spin-slow" size={28}/>
                        </h1>
                        <p className={`${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'} text-[10px] font-bold uppercase tracking-[0.3em] mt-1`}>
                            {theme === 'dark' ? 'Stealth Intelligence Node' : 'Pure White Intelligence Interface'}
                        </p>
                    </div>

                    <div className={`flex items-center gap-2 p-2 rounded-2xl border ${theme === 'dark' ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200'} shadow-inner`}>
                        <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} className="p-2 hover:bg-white rounded-xl transition-all text-indigo-600">
                            {theme === 'light' ? <Moon size={18}/> : <Sun size={18}/>}
                        </button>
                        <div className="w-[1px] h-4 bg-slate-300 mx-1" />
                        {[{ id: "table", icon: List, label: "LIST" }, { id: "map", icon: MapIcon, label: "MAP" }].map((btn) => (
                            <button
                                key={btn.id}
                                onClick={() => setViewMode(btn.id)}
                                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black transition-all ${viewMode === btn.id ? "bg-white text-indigo-600 shadow-md scale-105" : "text-slate-400 hover:bg-white"}`}
                            >
                                <btn.icon size={16}/> {btn.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Tracking Toolbelt */}
                {viewMode === "map" && (
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                        <div className={`lg:col-span-3 border p-5 rounded-[2rem] flex flex-wrap items-center gap-6 shadow-xl transition-all ${theme === 'dark' ? 'bg-slate-800 border-slate-700 shadow-none' : 'bg-white border-slate-200 shadow-slate-200/50'}`}>
                            <div className="flex flex-col flex-1 min-w-[150px]">
                                <label className="text-[9px] font-black text-indigo-400 uppercase mb-1 ml-1">Origin</label>
                                <select
                                    onChange={(e) => {
                                        const node = flattenedData.find(d => d.id == e.target.value);
                                        setSource(node);
                                        if(node) setTargetPos([node.lat, node.lng]);
                                    }}
                                    className={`p-3 rounded-xl outline-none text-xs font-bold border-none ${theme === 'dark' ? 'bg-slate-700 text-white' : 'bg-slate-50 text-slate-700'}`}
                                >
                                    <option value="">Select Origin...</option>
                                    {flattenedData.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                                </select>
                            </div>
                            <Navigation className="text-slate-300 rotate-90" size={20} />
                            <div className="flex flex-col flex-1 min-w-[150px]">
                                <label className="text-[9px] font-black text-indigo-400 uppercase mb-1 ml-1">Destination</label>
                                <select
                                    onChange={(e) => {
                                        const node = flattenedData.find(d => d.id == e.target.value);
                                        setDestination(node);
                                        if(node) setTargetPos([node.lat, node.lng]);
                                    }}
                                    className={`p-3 rounded-xl outline-none text-xs font-bold border-none ${theme === 'dark' ? 'bg-slate-700 text-white' : 'bg-slate-50 text-slate-700'}`}
                                >
                                    <option value="">Select Target...</option>
                                    {flattenedData.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                                </select>
                            </div>
                            <div className="flex gap-4 items-center pl-4 border-l border-slate-700">
                                <div className="text-right">
                                    <p className="text-[8px] font-black text-slate-400 uppercase">Distance</p>
                                    <p className="text-sm font-black text-indigo-600">{metrics.distance}</p>
                                </div>
                                <button onClick={runLiveTracking} className="bg-indigo-900 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-black text-[10px] uppercase transition-all shadow-lg shadow-indigo-500/20">
                                    <Zap size={14} className="inline mr-2"/> Track
                                </button>
                            </div>
                        </div>
                        <div className={`p-5 rounded-[2rem] flex flex-col justify-center transition-all ${theme === 'dark' ? 'bg-indigo-600' : 'bg-slate-900'} text-white`}>
                            <p className="text-[9px] font-black uppercase opacity-60 tracking-widest flex items-center gap-2"><Gauge size={12}/> EST. TIME</p>
                            <h2 className="text-2xl font-black">{metrics.duration}</h2>
                        </div>
                    </div>
                )}

                {/* Map Container */}
                <div className={`relative min-h-[700px] rounded-[3rem] overflow-hidden border-[12px] shadow-2xl z-0 transition-all ${theme === 'dark' ? 'border-slate-800' : 'border-slate-50'}`}>
                    {isLoading ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center z-50 bg-white/80 backdrop-blur-sm">
                            <div className="w-10 h-10 border-4 border-slate-100 border-t-indigo-600 rounded-full animate-spin" />
                        </div>
                    ) : (
                        <>
                            {viewMode === "map" && (
                                <MapContainer
                                    center={ETHIOPIA_CENTER}
                                    zoom={6}
                                    zoomControl={false}
                                    style={{ height: '700px', width: '100%', background: theme === 'dark' ? '#0f172a' : '#fff' }}
                                >
                                    <TileLayer url={mapTileUrl} attribution='&copy; CARTO' />
                                    <ZoomControl position="bottomright" />

                                    <MapController bounds={mapBounds} targetPos={targetPos} />

                                    <MarkerClusterGroup chunkedLoading>
                                        {flattenedData.map((node) => (
                                            <Marker
                                                key={node.id}
                                                position={[node.lat, node.lng]}
                                                eventHandlers={{ click: () => setTargetPos([node.lat, node.lng]) }}
                                            >
                                                <Popup>
                                                    <div className="p-2 font-sans text-slate-900">
                                                        <span className="text-[9px] font-bold text-indigo-600 uppercase">{node.type}</span>
                                                        <h3 className="font-bold text-lg leading-tight">{node.name}</h3>
                                                        <p className="text-[10px] text-slate-500 mt-1">Staff: {node.staff_count}</p>
                                                    </div>
                                                </Popup>
                                            </Marker>
                                        ))}
                                    </MarkerClusterGroup>

                                    {source && destination && (
                                        <RoutingEngine
                                            source={source}
                                            destination={destination}
                                            onMetricsUpdate={setMetrics}
                                            onPathFound={setPathCoords}
                                        />
                                    )}

                                    {trackingPos && (
                                        <Marker position={trackingPos} icon={L.divIcon({
                                            className: 'tracking-marker',
                                            html: `<div class="tracker-pin"></div>`
                                        })} />
                                    )}
                                </MapContainer>
                            )}

                            {viewMode === "table" && (
                                <div className={`h-full p-8 overflow-auto ${theme === 'dark' ? 'bg-slate-900' : 'bg-white'}`}>
                                    <table className="w-full text-left">
                                        <thead>
                                        <tr className={`border-b ${theme === 'dark' ? 'border-slate-800' : 'border-slate-100'}`}>
                                            <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase">Office Entity</th>
                                            <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase">Tier</th>
                                            <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase text-right">Actions</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {flattenedData.map(item => (
                                            <tr key={item.id} className={`border-b transition-colors ${theme === 'dark' ? 'border-slate-800 hover:bg-slate-800/50' : 'border-slate-50 hover:bg-slate-50'}`}>
                                                <td className="px-6 py-5 font-bold">{item.name}</td>
                                                <td className="px-6 py-5">
                                                    <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[9px] font-black uppercase">{item.type}</span>
                                                </td>
                                                <td className="px-6 py-5 text-right">
                                                    <button
                                                        onClick={() => { setTargetPos([item.lat, item.lng]); setViewMode("map"); }}
                                                        className="text-indigo-500 hover:underline font-bold text-xs"
                                                    >
                                                        View on Map
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            <style jsx global>{`
                .animate-spin-slow { animation: spin 8s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                
                .tracker-pin {
                    background: #4f46e5;
                    width: 18px;
                    height: 18px;
                    border-radius: 50%;
                    border: 3px solid white;
                    box-shadow: 0 0 15px rgba(79, 70, 229, 0.6);
                    animation: pulseMarker 1.5s infinite;
                }

                @keyframes pulseMarker {
                    0% { transform: scale(1); opacity: 1; }
                    50% { transform: scale(1.4); opacity: 0.5; }
                    100% { transform: scale(1); opacity: 1; }
                }

                .leaflet-popup-content-wrapper {
                    border-radius: 1.5rem !important;
                    padding: 4px !important;
                }
                
                .leaflet-container {
                    font-family: inherit;
                }
            `}</style>
        </div>
    );
};

export default OrganizationStructure;