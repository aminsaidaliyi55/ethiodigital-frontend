import React from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import { HeatmapLayer } from 'react-leaflet-heatmap-layer-v3';
import 'leaflet/dist/leaflet.css';

const GlobalHeatmap = ({ orders = [] }) => {
    // Transform live order data into Heatmap points [lat, lng, intensity]
    // Filter for orders that have valid coordinates
    const heatPoints = orders
        .filter(order => order.dest_lat && order.dest_lng)
        .map(order => [
            Number(order.dest_lat),
            Number(order.dest_lng),
            order.status === 'IN_TRANSIT' ? 1.0 : 0.5 // Active shipments glow brighter
        ]);

    return (
        <div className="w-full h-full bg-slate-900">
            <MapContainer
                center={[9.0192, 38.7525]} // Centered on Ethiopia/Addis (Adjust as needed)
                zoom={6}
                className="h-full w-full"
                scrollWheelZoom={true}
            >
                {/* High-Contrast Dark Map for Logistics feel */}
                <TileLayer
                    attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                />

                {heatPoints.length > 0 && (
                    <HeatmapLayer
                        points={heatPoints}
                        longitudeExtractor={(m) => m[1]}
                        latitudeExtractor={(m) => m[0]}
                        intensityExtractor={(m) => m[2]}
                        radius={30}
                        blur={20}
                        max={1.0}
                    />
                )}
            </MapContainer>

            {/* Floating Map Legend */}
            <div className="absolute bottom-6 left-6 z-[1000] bg-slate-900/90 border border-white/10 p-4 rounded-2xl backdrop-blur-md">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Network Density</p>
                <div className="flex items-center gap-3">
                    <div className="h-2 w-24 bg-gradient-to-r from-blue-500 via-emerald-500 to-red-500 rounded-full" />
                    <span className="text-[9px] font-bold text-white uppercase">High Traffic</span>
                </div>
            </div>
        </div>
    );
};

export default GlobalHeatmap;