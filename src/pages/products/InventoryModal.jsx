import React, { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet-routing-machine";
import "leaflet/dist/leaflet.css";
import {
    X, Loader2, Camera, Store, Navigation, Clock,
    Compass, Package, Tag, Hash, Printer, CheckCircle2,
    DollarSign, Banknote, Layers, Palette, Maximize, TrendingUp, MapPin, Truck, ShoppingBag
} from "lucide-react";

// Fix Leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const SERVER_URL = "http://localhost:8000";

const MapClickHandler = ({ onLocationSelect, active }) => {
    useMapEvents({
        click(e) {
            if (active) onLocationSelect([e.latlng.lat, e.latlng.lng]);
        },
    });
    return null;
};

const RoutingMachine = ({ userCoords, shopCoords, onRouteFound }) => {
    const map = useMap();
    useEffect(() => {
        if (!map || !userCoords || !shopCoords) return;
        const routingControl = L.Routing.control({
            waypoints: [L.latLng(userCoords[0], userCoords[1]), L.latLng(shopCoords[0], shopCoords[1])],
            lineOptions: { styles: [{ color: "#4f46e5", weight: 6, opacity: 0.8 }] },
            show: false,
            addWaypoints: false,
            routeWhileDragging: false,
            fitSelectedRoutes: true,
            createMarker: () => null
        }).on('routesfound', (e) => {
            const summary = e.routes[0].summary;
            onRouteFound({
                distance: (summary.totalDistance / 1000).toFixed(1),
                time: Math.round(summary.totalTime / 60)
            });
        }).addTo(map);
        return () => map.removeControl(routingControl);
    }, [map, userCoords, shopCoords]);
    return null;
};

const InventoryModal = ({ modal, formValues, setFormValues, handleAction, submitting, shops = [], categories = [], setModal }) => {
    const [userLocation, setUserLocation] = useState(null);
    const [routeInfo, setRouteInfo] = useState({ distance: "0.0", time: 0 });
    const [imagePreview, setImagePreview] = useState(null);
    const [isResolving, setIsResolving] = useState(false);
    const [needsDelivery, setNeedsDelivery] = useState(false);
    const [orderSuccess, setOrderSuccess] = useState(false);
    const [generatedOrderId, setGeneratedOrderId] = useState("");
    const fileInputRef = useRef(null);

    const isView = modal.type === "view";
    const isOrder = modal.type === "order";

    const shopLat = 9.0249;
    const shopLon = 38.7469;

    const DELIVERY_RATE = 30;
    const deliveryFee = needsDelivery ? (parseFloat(routeInfo.distance) * DELIVERY_RATE) : 0;
    const productTotal = Number(formValues.selling_price || 0) * (Number(formValues.order_qty) || 1);
    const finalTotal = productTotal + deliveryFee;

    useEffect(() => {
        if ((isView || (isOrder && needsDelivery)) && navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => setUserLocation([pos.coords.latitude, pos.coords.longitude]),
                null, { enableHighAccuracy: true }
            );
        }
    }, [isView, isOrder, needsDelivery]);

    useEffect(() => {
        if (modal.isOpen) {
            const img = formValues?.image;
            if (img instanceof File) {
                const url = URL.createObjectURL(img);
                setImagePreview(url);
                return () => URL.revokeObjectURL(url);
            } else if (typeof img === 'string') {
                setImagePreview(img.startsWith('http') ? img : `${SERVER_URL}${img}`);
            } else {
                setImagePreview(null);
            }
        }
    }, [formValues.image, modal.isOpen]);

    const generateOrderId = () => {
        const datePart = new Date().toISOString().slice(2, 10).replace(/-/g, "");
        const randomPart = Math.floor(1000 + Math.random() * 9000);
        return `TRX-${datePart}-${randomPart}`;
    };

    const handleLocationSelect = async (coords) => {
        if (!isOrder || !needsDelivery) return;
        setUserLocation(coords);
        setIsResolving(true);
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${coords[0]}&lon=${coords[1]}`);
            const data = await response.json();
            setFormValues(prev => ({
                ...prev,
                delivery_area: data.display_name,
                delivery_lat: coords[0],
                delivery_lng: coords[1]
            }));
        } catch (error) {
            console.error("Address lookup failed", error);
        } finally {
            setIsResolving(false);
        }
    };

    const onOrderSubmit = async () => {
        const newId = generateOrderId();
        setGeneratedOrderId(newId);

        const orderPayload = {
            items: [{
                id: formValues.id,
                shop_id: formValues.shop_id || 1,
                order_qty: formValues.order_qty || 1,
                selling_price: formValues.selling_price
            }],
            payment_method: "CASH",
            transaction_id: newId,
            delivery_lat: needsDelivery ? userLocation?.[0] : null,
            delivery_lng: needsDelivery ? userLocation?.[1] : null,
            delivery_area: needsDelivery ? formValues.delivery_area : "Store Pickup",
            delivery_cost: deliveryFee,
            total_amount: finalTotal
        };

        const result = await handleAction(orderPayload);
        if (result !== false) {
            setOrderSuccess(true);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    if (!modal.isOpen) return null;

    if (orderSuccess) {
        return (
            <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 z-[2000]">
                <style>
                    {`
                        @media print {
                            body * { visibility: hidden; }
                            #printable-receipt, #printable-receipt * { visibility: visible; }
                            #printable-receipt { 
                                position: absolute; 
                                left: 50%; 
                                top: 0; 
                                transform: translateX(-50%);
                                width: 100%;
                                max-width: 400px;
                                padding: 0;
                                border: none !important;
                                box-shadow: none !important;
                                color: black !important;
                            }
                            .print-hide { display: none !important; }
                        }
                    `}
                </style>
                <div id="printable-receipt" className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[3rem] p-10 text-center shadow-2xl border border-white/10">
                    <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 print-hide">
                        <CheckCircle2 size={40} />
                    </div>

                    <div className="mb-6">
                        <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase mb-1">Receipt</h2>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Transaction Confirmed</p>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-700 mb-8 text-left">
                        <div className="mb-4 text-center">
                            <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Order Reference</p>
                            <p className="text-lg font-mono font-black text-indigo-600 tracking-tighter">{generatedOrderId}</p>
                        </div>

                        <div className="space-y-3 border-t border-slate-200 dark:border-slate-700 pt-4">
                            <div className="flex justify-between text-[11px] font-bold uppercase">
                                <span className="text-slate-500">Date</span>
                                <span className="text-slate-900 dark:text-white">{new Date().toLocaleDateString()}</span>
                            </div>
                            <div className="flex justify-between text-[11px] font-bold uppercase">
                                <span className="text-slate-500">Product</span>
                                <span className="text-slate-900 dark:text-white text-right ml-4">{formValues.name}</span>
                            </div>
                            <div className="flex justify-between text-[11px] font-bold uppercase">
                                <span className="text-slate-500">Unit Price</span>
                                <span className="text-slate-900 dark:text-white">ETB {Number(formValues.selling_price).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-[11px] font-bold uppercase">
                                <span className="text-slate-500">Quantity</span>
                                <span className="text-slate-900 dark:text-white">{formValues.order_qty || 1}</span>
                            </div>
                            <div className="flex justify-between text-[11px] font-bold uppercase">
                                <span className="text-slate-500">Service</span>
                                <span className="text-slate-900 dark:text-white">{needsDelivery ? "Delivery" : "Store Pickup"}</span>
                            </div>
                            {needsDelivery && (
                                <div className="flex justify-between text-[11px] font-bold uppercase">
                                    <span className="text-slate-500">Delivery Fee</span>
                                    <span className="text-slate-900 dark:text-white">ETB {deliveryFee.toLocaleString()}</span>
                                </div>
                            )}
                            <div className="flex justify-between pt-4 border-t-2 border-slate-900 dark:border-white text-lg font-black uppercase text-indigo-600">
                                <span>Total</span>
                                <span>ETB {finalTotal.toLocaleString()}</span>
                            </div>
                        </div>

                        {needsDelivery && formValues.delivery_area && (
                            <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
                                <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Destination</p>
                                <p className="text-[10px] font-bold text-slate-600 dark:text-slate-300 leading-tight">{formValues.delivery_area}</p>
                            </div>
                        )}
                    </div>

                    <p className="text-[9px] font-bold text-slate-400 uppercase italic mb-8">Thank you for your business!</p>

                    <div className="flex gap-3 print-hide">
                        <button onClick={handlePrint} className="flex-1 bg-slate-900 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2">
                            <Printer size={16} /> Print Receipt
                        </button>
                        <button onClick={() => { setOrderSuccess(false); setModal({ ...modal, isOpen: false }); }} className="flex-1 bg-slate-100 text-slate-600 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest">
                            Done
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const grandTotalValue = (Number(formValues.stock_quantity || 0) * Number(formValues.selling_price || 0)).toLocaleString();

    return (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 z-[1000] animate-in fade-in zoom-in-95 duration-300">
            <div className={`relative bg-[#F8FAFC] dark:bg-slate-900 rounded-[3.5rem] overflow-hidden shadow-2xl flex flex-col border border-white/10 transition-all duration-500 ${(isView || isOrder) ? 'w-full max-w-7xl h-[85vh]' : 'w-full max-w-4xl max-h-[90vh]'}`}>

                <button onClick={() => setModal({ ...modal, isOpen: false })} className="absolute top-8 right-8 z-[1100] p-3 text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 rounded-full transition-all">
                    <X size={20} />
                </button>

                <div className={`w-full flex flex-col overflow-y-auto custom-scrollbar ${(isView || isOrder) ? 'h-full md:flex-row' : 'p-8 md:p-12'}`}>
                    {(isView || isOrder) ? (
                        <>
                            <div className="w-full md:w-1/3 p-10 flex flex-col space-y-6 bg-slate-50 dark:bg-slate-900/50">
                                <header className="flex items-center gap-5">
                                    <div className="w-14 h-14 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-lg">
                                        {isOrder ? <ShoppingBag size={28} /> : <Compass size={28} />}
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-black text-[#1E1B4B] dark:text-white uppercase">{isOrder ? 'Order' : 'Live Route'}</h2>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{isOrder ? 'Checkout Terminal' : 'Shop Terminal'}</p>
                                    </div>
                                </header>

                                {isOrder && (
                                    <div className="space-y-4">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Choose Service Type</p>
                                        <div className="grid grid-cols-2 gap-3">
                                            <button
                                                onClick={() => setNeedsDelivery(false)}
                                                className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${!needsDelivery ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-500/10' : 'border-transparent bg-white dark:bg-slate-800'}`}
                                            >
                                                <ShoppingBag className={!needsDelivery ? 'text-indigo-600' : 'text-slate-400'} size={20}/>
                                                <span className={`text-[10px] font-black uppercase ${!needsDelivery ? 'text-indigo-600' : 'text-slate-400'}`}>Standard</span>
                                            </button>
                                            <button
                                                onClick={() => setNeedsDelivery(true)}
                                                className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${needsDelivery ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-500/10' : 'border-transparent bg-white dark:bg-slate-800'}`}
                                            >
                                                <Truck className={needsDelivery ? 'text-indigo-600' : 'text-slate-400'} size={20}/>
                                                <span className={`text-[10px] font-black uppercase ${needsDelivery ? 'text-indigo-600' : 'text-slate-400'}`}>Delivery</span>
                                            </button>
                                        </div>
                                    </div>
                                )}

                                <div className={`transition-all duration-500 space-y-6 ${(!isView && !needsDelivery) ? 'opacity-30 grayscale pointer-events-none' : 'opacity-100'}`}>
                                    <div className="grid grid-cols-2 gap-4">
                                        <NavCard icon={<Navigation className="text-blue-500" size={16} />} label="Distance" value={`${routeInfo.distance} km`} />
                                        <NavCard icon={<Clock className="text-orange-500" size={16} />} label="Traffic ETA" value={`${routeInfo.time} min`} />
                                    </div>

                                    <div className="p-6 bg-white dark:bg-slate-800 rounded-[2rem] border border-slate-100 dark:border-slate-700 shadow-sm space-y-3">
                                        <p className="text-[9px] font-black text-slate-400 uppercase flex items-center gap-2">
                                            {isResolving ? <Loader2 size={12} className="animate-spin" /> : <MapPin size={12} />}
                                            {needsDelivery ? 'Delivery Address' : 'Warehouse Location'}
                                        </p>
                                        <p className="text-xs font-bold text-slate-800 dark:text-white leading-relaxed">
                                            {needsDelivery ? (formValues.delivery_area || "Tap map to set delivery point") : "Addis Ababa Distribution Center"}
                                        </p>
                                        {needsDelivery && (
                                            <div className="pt-2 border-t dark:border-slate-700 flex justify-between">
                                                <span className="text-[10px] font-bold text-slate-400 uppercase">Shipping Fee</span>
                                                <span className="text-xs font-black text-indigo-600">ETB {deliveryFee.toLocaleString()}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="mt-auto bg-slate-900 p-6 rounded-[2.5rem] text-white">
                                    <p className="text-[9px] font-black uppercase tracking-widest text-indigo-400 mb-2">
                                        {isOrder ? 'Order Finalization' : 'Inventory Link'}
                                    </p>
                                    {isOrder ? (
                                        <div className="flex justify-between items-end">
                                            <div>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase">Grand Total</p>
                                                <h3 className="text-2xl font-black italic">ETB {finalTotal.toLocaleString()}</h3>
                                            </div>
                                            <button
                                                onClick={onOrderSubmit}
                                                disabled={submitting || (needsDelivery && !userLocation)}
                                                className="bg-indigo-600 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-500 transition-all active:scale-95 disabled:opacity-50"
                                            >
                                                {submitting ? <Loader2 className="animate-spin" size={14}/> : 'Order Now'}
                                            </button>
                                        </div>
                                    ) : (
                                        <p className="text-xs text-slate-300">Tracking route to facility for product: <span className="text-white font-bold">{formValues.name}</span></p>
                                    )}
                                </div>
                            </div>

                            <div className="w-full md:w-2/3 h-[400px] md:h-full relative">
                                <div className={`absolute inset-0 z-[600] bg-slate-950/40 backdrop-blur-[2px] transition-opacity flex items-center justify-center ${isOrder && !needsDelivery ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>
                                    <div className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] text-center shadow-2xl max-w-xs border border-white/10">
                                        <ShoppingBag size={48} className="mx-auto text-indigo-600 mb-4" />
                                        <h4 className="font-black uppercase text-slate-800 dark:text-white mb-2">Standard Pickup</h4>
                                        <p className="text-xs text-slate-500 font-bold leading-relaxed">Map interactions disabled for non-delivery orders.</p>
                                    </div>
                                </div>
                                <MapContainer center={[shopLat, shopLon]} zoom={15} className="w-full h-full" zoomControl={false}>
                                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                    <MapClickHandler onLocationSelect={handleLocationSelect} active={needsDelivery} />
                                    <Marker position={[shopLat, shopLon]}><Popup>Shop Location</Popup></Marker>
                                    {(userLocation && (isView || needsDelivery)) && (
                                        <>
                                            <Marker position={userLocation}><Popup>{needsDelivery ? "Delivery Point" : "Your Location"}</Popup></Marker>
                                            <RoutingMachine userCoords={userLocation} shopCoords={[shopLat, shopLon]} onRouteFound={setRouteInfo} />
                                        </>
                                    )}
                                </MapContainer>
                                {isOrder && needsDelivery && (
                                    <div className="absolute top-6 left-1/2 -translate-x-1/2 z-[1000] bg-white dark:bg-slate-900 px-6 py-3 rounded-full shadow-2xl border border-indigo-500/20 text-[10px] font-black text-indigo-600 uppercase tracking-widest animate-bounce">
                                        Select Destination on Map
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="w-full space-y-8">
                            <header className="text-center mb-8">
                                <h2 className="text-3xl font-black text-[#1E1B4B] dark:text-white uppercase tracking-tight">Product Registry</h2>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Update Warehouse Database</p>
                            </header>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                <div className="flex flex-col items-center space-y-4">
                                    <div
                                        className="relative w-full aspect-square max-w-[240px] rounded-[3rem] overflow-hidden shadow-2xl border-4 border-white dark:border-slate-800 group cursor-pointer"
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        {imagePreview ? (
                                            <img src={imagePreview} className="w-full h-full object-cover transition-transform group-hover:scale-110" alt="Product" />
                                        ) : (
                                            <div className="w-full h-full bg-slate-200 dark:bg-slate-800 flex flex-col items-center justify-center text-slate-400">
                                                <Camera size={32} />
                                                <span className="text-[10px] font-bold uppercase mt-2">Upload Image</span>
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-indigo-600/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                                            <Camera size={32} />
                                        </div>
                                    </div>
                                    <input type="file" ref={fileInputRef} className="hidden" onChange={(e) => setFormValues({...formValues, image: e.target.files[0]})} accept="image/*" />
                                </div>

                                <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <InputGroup icon={<Package size={16}/>} label="Product Name" value={formValues.name} onChange={(v) => setFormValues({...formValues, name: v})} placeholder="e.g. Samsung A55" />
                                    <InputGroup icon={<Hash size={16}/>} label="SKU / Slug" value={formValues.slug} onChange={(v) => setFormValues({...formValues, slug: v})} placeholder="a55" />

                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-slate-400 ml-4 uppercase flex items-center gap-2"><Layers size={12}/> Category</label>
                                        <select
                                            value={formValues.category_id || ""}
                                            onChange={(e) => setFormValues({...formValues, category_id: e.target.value})}
                                            className="w-full bg-white dark:bg-slate-800 px-6 py-4 rounded-2xl font-bold border-none shadow-sm focus:ring-2 focus:ring-indigo-500 transition-all appearance-none text-slate-800 dark:text-white"
                                        >
                                            <option value="">Select Category</option>
                                            {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                                        </select>
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-slate-400 ml-4 uppercase flex items-center gap-2"><Store size={12}/> Assigned Shop</label>
                                        <select
                                            value={formValues.shop_id || ""}
                                            onChange={(e) => setFormValues({...formValues, shop_id: e.target.value})}
                                            className="w-full bg-white dark:bg-slate-800 px-6 py-4 rounded-2xl font-bold border-none shadow-sm focus:ring-2 focus:ring-indigo-500 transition-all appearance-none text-slate-800 dark:text-white"
                                        >
                                            <option value="">Select Shop</option>
                                            {shops.map(shop => <option key={shop.id} value={shop.id}>{shop.name}</option>)}
                                        </select>
                                    </div>

                                    <InputGroup icon={<Maximize size={16}/>} label="Size" value={formValues.size} onChange={(v) => setFormValues({...formValues, size: v})} placeholder="e.g. XL" />
                                    <InputGroup icon={<Palette size={16}/>} label="Color" value={formValues.color_name} onChange={(v) => setFormValues({...formValues, color_name: v})} placeholder="e.g. Blue" />
                                    <InputGroup icon={<Tag size={16}/>} type="number" label="Stock Quantity" value={formValues.stock_quantity} onChange={(v) => setFormValues({...formValues, stock_quantity: v})} />
                                    <InputGroup icon={<Banknote size={16}/>} type="number" label="Buying Price (ETB)" value={formValues.buying_price} onChange={(v) => setFormValues({...formValues, buying_price: v})} />

                                    <div className="md:col-span-2">
                                        <InputGroup icon={<DollarSign size={16}/>} type="number" label="Selling Price (ETB)" value={formValues.selling_price} onChange={(v) => setFormValues({...formValues, selling_price: v})} />
                                    </div>

                                    <div className="md:col-span-2 space-y-1">
                                        <label className="text-[10px] font-black text-slate-400 ml-4 uppercase">Description</label>
                                        <textarea
                                            value={formValues.description || ""}
                                            onChange={(e) => setFormValues({...formValues, description: e.target.value})}
                                            className="w-full bg-white dark:bg-slate-800 px-6 py-4 rounded-3xl font-bold border-none shadow-sm focus:ring-2 focus:ring-indigo-500 min-h-[100px] text-slate-800 dark:text-white"
                                            placeholder="Product details..."
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="p-8 rounded-[3rem] bg-indigo-600 text-white flex justify-between items-center shadow-2xl shadow-indigo-500/40 mt-6 group overflow-hidden relative">
                                <TrendingUp className="absolute right-[-10px] bottom-[-10px] size-32 opacity-10 group-hover:rotate-12 transition-transform" />
                                <div className="relative z-10">
                                    <p className="text-[10px] font-black uppercase tracking-widest opacity-70">Total Stock Value</p>
                                    <h3 className="text-3xl font-black italic uppercase tracking-tighter">ETB {grandTotalValue}</h3>
                                </div>
                                <button onClick={() => handleAction(formValues)} disabled={submitting} className="relative z-10 bg-white text-indigo-600 px-10 py-5 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] hover:scale-105 active:scale-95 transition-all flex items-center gap-3 shadow-xl disabled:opacity-50">
                                    {submitting ? <Loader2 className="animate-spin" size={16}/> : 'Submit Registry'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const InputGroup = ({ label, value, onChange, placeholder, type = "text", icon }) => (
    <div className="space-y-1">
        <label className="text-[10px] font-black text-slate-400 ml-4 uppercase flex items-center gap-2">
            {icon} {label}
        </label>
        <input
            type={type}
            placeholder={placeholder}
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            className="w-full bg-white dark:bg-slate-800 px-6 py-4 rounded-2xl font-bold text-slate-800 dark:text-white border-none shadow-sm focus:ring-2 focus:ring-indigo-500 transition-all"
        />
    </div>
);

const NavCard = ({ icon, label, value }) => (
    <div className="p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm flex items-center gap-4">
        <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl">{icon}</div>
        <div>
            <p className="text-[9px] font-black text-slate-400 uppercase">{label}</p>
            <p className="text-sm font-black text-slate-800 dark:text-white">{value}</p>
        </div>
    </div>
);

export default InventoryModal;