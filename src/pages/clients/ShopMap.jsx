import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet-routing-machine";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
import { Store, Navigation } from "lucide-react";
import { renderToStaticMarkup } from "react-dom/server";

const shopIcon = L.divIcon({
    html: renderToStaticMarkup(
        <div className="p-2 bg-[#004A7C] dark:bg-blue-600 border-2 border-white dark:border-slate-900 rounded-xl shadow-lg text-white">
            <Store size={18} />
        </div>
    ),
    className: '', iconSize: [36, 36], iconAnchor: [18, 36],
});

const userIcon = L.divIcon({
    html: renderToStaticMarkup(
        <div className="p-2 bg-blue-500 dark:bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full shadow-lg text-white animate-pulse">
            <Navigation size={14} />
        </div>
    ),
    className: '', iconSize: [30, 30], iconAnchor: [15, 15],
});

const RoutingEngine = ({ userLoc, shopLoc, isDark }) => {
    const map = useMap();

    useEffect(() => {
        if (!map || !userLoc || !shopLoc) return;

        const control = L.Routing.control({
            waypoints: [L.latLng(userLoc[0], userLoc[1]), L.latLng(shopLoc[0], shopLoc[1])],
            lineOptions: {
                styles: [{
                    color: isDark ? "#60a5fa" : "#6366f1", // Lighter blue for dark mode
                    weight: 6,
                    opacity: 0.9
                }]
            },
            show: false,
            addWaypoints: false,
            routeWhileDragging: false,
            fitSelectedRoutes: true,
            createMarker: () => null,
        }).addTo(map);

        return () => map.removeControl(control);
    }, [map, userLoc, shopLoc, isDark]);

    return null;
};

export const ShopMap = ({ center, userLocation }) => {
    const [isDark, setIsDark] = useState(document.documentElement.classList.contains('dark'));

    useEffect(() => {
        // Observer to detect theme changes in real-time
        const observer = new MutationObserver(() => {
            setIsDark(document.documentElement.classList.contains('dark'));
        });
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
        return () => observer.disconnect();
    }, []);

    // Selection of Tile URL based on theme
    const tileUrl = isDark
        ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        : "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png";

    return (
        <MapContainer center={center} zoom={13} className="h-full w-full grayscale-[0.2] dark:grayscale-0">
            <TileLayer
                url={tileUrl}
                attribution='&copy; <a href="https://carto.com/">CARTO</a>'
            />
            <Marker position={center} icon={shopIcon} />
            {userLocation && (
                <>
                    <Marker position={userLocation} icon={userIcon} />
                    <RoutingEngine userLoc={userLocation} shopLoc={center} isDark={isDark} />
                </>
            )}
        </MapContainer>
    );
};