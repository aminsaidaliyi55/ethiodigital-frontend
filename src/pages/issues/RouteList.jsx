import React, { useState, useEffect } from "react";
import { Search, Plus, Map, Navigation, ChevronRight, Clock } from "lucide-react";
import api from "../../axios";

const RouteList = ({ onAddNew, onViewDetails }) => {
    const [routes, setRoutes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    useEffect(() => {
        const fetchRoutes = async () => {
            try {
                const res = await api.get("/routes");
                setRoutes(Array.isArray(res.data) ? res.data : []);
            } catch (err) {
                console.error("Error loading routes");
            } finally {
                setLoading(false);
            }
        };
        fetchRoutes();
    }, []);

    const filtered = routes.filter(r =>
        r.route_name?.toLowerCase().includes(search.toLowerCase()) ||
        r.driver_name?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-xl font-black text-slate-800 uppercase">Delivery Routes</h1>
                    <p className="text-xs text-slate-500 font-bold uppercase">Manage active paths</p>
                </div>
                <button
                    onClick={onAddNew}
                    className="bg-blue-900 text-white px-5 py-3 rounded-xl font-bold text-[10px] uppercase flex items-center gap-2 hover:bg-black transition-all"
                >
                    <Plus size={16} /> Create New Route
                </button>
            </div>

            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                    className="w-full pl-12 pr-4 py-3 bg-white border-none rounded-2xl shadow-sm text-xs font-bold uppercase outline-none focus:ring-2 focus:ring-blue-900/10"
                    placeholder="Search routes or drivers..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            <div className="grid gap-4">
                {filtered.map((route) => (
                    <div
                        key={route.id}
                        onClick={() => onViewDetails(route)}
                        className="bg-white p-5 rounded-3xl shadow-sm flex items-center justify-between hover:shadow-md transition-all cursor-pointer group border-2 border-transparent hover:border-blue-900/10"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-900">
                                <Navigation size={20} />
                            </div>
                            <div>
                                <h3 className="font-black text-slate-800 text-sm uppercase">{route.route_name}</h3>
                                <div className="flex gap-3 mt-1">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                                        <Clock size={12} /> {route.estimated_time || "45 mins"}
                                    </span>
                                    <span className="text-[10px] font-bold text-blue-600 uppercase">
                                        {route.stops_count || 0} Stops
                                    </span>
                                </div>
                            </div>
                        </div>
                        <ChevronRight className="text-slate-300 group-hover:text-blue-900 transition-colors" />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default RouteList;