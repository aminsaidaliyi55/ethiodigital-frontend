import React, { useState, useMemo } from "react";
import {
    Plus, Package, Search, Edit3, Eye, Trash2, Box,
    ShoppingCart, CheckCircle2, Layers, Send, XCircle,
    ChevronUp, ChevronDown, Filter, Store, Tag, Maximize, Palette
} from "lucide-react";
import { useInventory } from "./useInventory";
import InventoryModal from "./InventoryModal";

export default function ProductInventory() {
    const {
        data, categories, shops, loading, submitting,
        modal, setModal, formValues, setFormValues,
        handleAction, openModal
    } = useInventory();

    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [selectedShop, setSelectedShop] = useState("all");
    const [selectedItems, setSelectedItems] = useState([]);
    const [orderQuantities, setOrderQuantities] = useState({});

    const updateOrderQty = (id, delta, maxStock) => {
        setOrderQuantities(prev => {
            const currentQty = prev[id] || 1;
            const newQty = currentQty + delta;
            if (newQty < 1 || newQty > maxStock) return prev;
            return { ...prev, [id]: newQty };
        });
    };

    const toggleSelection = (id) => {
        setSelectedItems(prev =>
            prev.includes(id) ? prev.filter(itemId => itemId !== id) : [...prev, id]
        );
    };

    const toggleSelectAll = () => {
        if (selectedItems.length === filteredData.length) {
            setSelectedItems([]);
        } else {
            setSelectedItems(filteredData.map(item => item.id));
        }
    };

    const filteredData = useMemo(() => {
        return data.filter((item) => {
            const query = searchQuery.toLowerCase();
            const matchesSearch =
                item.name?.toLowerCase().includes(query) ||
                item.size?.toLowerCase().includes(query) ||
                item.color?.toLowerCase().includes(query) ||
                item.sku?.toLowerCase().includes(query);

            const matchesCategory = selectedCategory === "all" || String(item.category_id) === String(selectedCategory);
            const matchesShop = selectedShop === "all" || String(item.shop_id) === String(selectedShop);
            return matchesSearch && matchesCategory && matchesShop;
        });
    }, [data, searchQuery, selectedCategory, selectedShop]);

    const batchTotal = useMemo(() => {
        return selectedItems.reduce((sum, id) => {
            const item = data.find(p => p.id === id);
            const qty = orderQuantities[id] || 1;
            return sum + (qty * Number(item?.selling_price || 0));
        }, 0);
    }, [selectedItems, orderQuantities, data]);

    const handleQuickOrder = (product, liveTotal) => {
        const qty = orderQuantities[product.id] || 1;
        if (product.stock_quantity <= 0) return alert("Out of stock!");

        // Match the shape expected by the updated InventoryModal and Backend
        openModal("order", {
            ...product,
            order_qty: qty,
            is_batch: false,
            selling_price: product.selling_price,
            shop_id: product.shop_id
        });
    };

    const handleBatchOrder = () => {
        if (selectedItems.length === 0) return;

        // Map selected items into the 'items' array format required by your createOrder backend
        const batchItems = selectedItems.map(id => {
            const product = data.find(p => p.id === id);
            const qty = orderQuantities[id] || 1;
            return {
                id: product.id,
                shop_id: product.shop_id,
                order_qty: qty,
                selling_price: product.selling_price,
                name: product.name // For UI display in modal
            };
        });

        openModal("order", {
            is_batch: true,
            items: batchItems,
            // Use the first item's shop_id as a fallback for the transaction table
            shop_id: batchItems[0]?.shop_id || 1,
            order_qty: 1, // Placeholder for batch context
            selling_price: batchTotal // The modal uses this for grand total display
        });
    };

    return (
        <div className="p-8 bg-[#f8fafc] dark:bg-slate-950 min-h-screen pb-40 font-sans">
            {/* Header & Main Actions */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
                <div>
                    <h1 className="text-4xl font-black flex items-center gap-3 text-slate-800 dark:text-white tracking-tighter">
                        <div className="bg-[#004A7C] p-2 rounded-2xl shadow-[0_10px_20px_rgba(0,74,124,0.3)]">
                            <Package className="text-white" size={32} />
                        </div>
                        Inventory <span className="text-[#004A7C]">Pro</span>
                    </h1>
                    <button onClick={toggleSelectAll} className="text-xs font-bold text-[#004A7C] mt-4 flex items-center gap-2 hover:opacity-70 transition-opacity uppercase tracking-widest">
                        <Layers size={14} />
                        {selectedItems.length === filteredData.length ? "Deselect All" : "Select Viewable Items"}
                    </button>
                </div>

                <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
                    <div className="relative flex-1 min-w-[300px] group">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#004A7C] transition-colors" size={20} />
                        <input
                            type="text"
                            placeholder="Search by name, size, color or SKU..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-14 pr-6 py-5 bg-white dark:bg-slate-900 border-none rounded-[2rem] text-sm font-bold shadow-xl outline-none focus:ring-4 ring-[#004A7C]/10 transition-all"
                        />
                    </div>
                    <button onClick={() => openModal("create")} className="bg-[#004A7C] text-white px-10 py-5 rounded-[2rem] font-black text-sm shadow-[0_20px_40px_-10px_rgba(0,74,124,0.4)] hover:scale-105 active:scale-95 transition-all flex items-center gap-2">
                        <Plus size={20} strokeWidth={3} /> NEW PRODUCT
                    </button>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-wrap gap-4 mb-12 p-2 bg-slate-100/50 dark:bg-slate-900/50 rounded-[2.5rem] backdrop-blur-sm">
                <div className="flex items-center gap-3 bg-white dark:bg-slate-800 px-6 py-3 rounded-full shadow-sm">
                    <Store size={18} className="text-[#004A7C]" />
                    <select
                        value={selectedShop}
                        onChange={(e) => setSelectedShop(e.target.value)}
                        className="bg-transparent border-none text-xs font-black uppercase tracking-wider outline-none text-slate-700 dark:text-slate-200"
                    >
                        <option value="all">All Shops</option>
                        {shops.map(shop => <option key={shop.id} value={shop.id}>{shop.name}</option>)}
                    </select>
                </div>

                <div className="flex items-center gap-3 bg-white dark:bg-slate-800 px-6 py-3 rounded-full shadow-sm">
                    <Tag size={18} className="text-[#004A7C]" />
                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="bg-transparent border-none text-xs font-black uppercase tracking-wider outline-none text-slate-700 dark:text-slate-200"
                    >
                        <option value="all">All Categories</option>
                        {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                    </select>
                </div>

                {(selectedCategory !== "all" || selectedShop !== "all" || searchQuery) && (
                    <button
                        onClick={() => {setSelectedCategory("all"); setSelectedShop("all"); setSearchQuery("");}}
                        className="text-[10px] font-black text-red-500 hover:text-red-600 transition-colors px-4 uppercase tracking-tighter"
                    >
                        Reset Filters
                    </button>
                )}
            </div>

            {/* Product Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-12">
                {filteredData.map((row) => {
                    const isSelected = selectedItems.includes(row.id);
                    const qty = orderQuantities[row.id] || 1;
                    const liveTotal = qty * Number(row.selling_price);
                    const isOutOfStock = row.stock_quantity <= 0;
                    const productThemeColor = row.color_name ? row.color_name.toLowerCase() : "#004A7C";

                    return (
                        <div
                            key={row.id}
                            className={`group relative flex flex-col bg-white dark:bg-slate-900 rounded-[3.5rem] p-4 border-[6px] transition-all duration-500
                            ${isSelected
                                ? 'border-[#004A7C] shadow-[0_40px_80px_-20px_rgba(0,74,124,0.25)] -translate-y-4'
                                : 'border-white dark:border-slate-800 shadow-lg hover:-translate-y-3 hover:scale-[1.03] hover:shadow-2xl'
                            }`}
                        >
                            <div className="relative w-full h-72 rounded-[3rem] overflow-hidden bg-slate-100 dark:bg-slate-950 shadow-inner transition-all duration-500 group-hover:shadow-[inset_0_0_50px_rgba(0,0,0,0.1)]">
                                {!isOutOfStock && (
                                    <button
                                        onClick={() => toggleSelection(row.id)}
                                        className={`absolute top-6 left-6 z-30 p-3 rounded-2xl backdrop-blur-md transition-all ${isSelected ? 'bg-[#004A7C] text-white scale-110 shadow-lg' : 'bg-white/60 text-slate-400 hover:bg-white hover:text-[#004A7C]'}`}
                                    >
                                        <CheckCircle2 size={24} strokeWidth={isSelected ? 3 : 2} />
                                    </button>
                                )}

                                {row.image ? (
                                    <img
                                        src={row.image.startsWith('http') ? row.image : `http://localhost:8000${row.image}`}
                                        className={`w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-1000 ${isOutOfStock ? 'grayscale opacity-40' : ''}`}
                                        alt={row.name}
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-300"><Box size={60} strokeWidth={1} /></div>
                                )}

                                <div className={`absolute bottom-6 right-6 px-4 py-2 rounded-xl text-[10px] font-black tracking-widest uppercase backdrop-blur-md border ${isOutOfStock ? 'bg-red-500/20 border-red-500/50 text-red-600' : 'bg-white/80 border-white text-slate-900'}`}>
                                    {isOutOfStock ? 'Out of Stock' : `${row.stock_quantity} In Stock`}
                                </div>
                            </div>

                            <div className="mt-8 px-4 flex-1 flex flex-col">
                                <div className="flex justify-between items-center mb-3">
                                    <div className="flex gap-2">
                                        <span className="bg-blue-50 dark:bg-blue-900/20 text-[#004A7C] px-3 py-1 rounded-full text-[9px] font-black uppercase transition-colors">
                                            {row.category_name}
                                        </span>
                                        <span className="bg-slate-100 dark:bg-slate-800 text-slate-500 px-3 py-1 rounded-full text-[9px] font-black uppercase">{row.shop_name}</span>
                                    </div>
                                </div>

                                <h3 className="font-black text-slate-900 dark:text-white text-2xl leading-tight h-14 line-clamp-2">
                                    {row.name}
                                </h3>

                                <div className="flex gap-3 mb-6">
                                    {row.size && (
                                        <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-100 dark:border-slate-700">
                                            <Maximize size={12} className="text-slate-400"/>
                                            <span className="text-[10px] font-black text-slate-600 dark:text-slate-300 uppercase tracking-tighter">{row.size}</span>
                                        </div>
                                    )}
                                    {row.color_name && (
                                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
                                            <div className="w-3 h-3 rounded-full border border-white/40" style={{ backgroundColor: productThemeColor }} />
                                            <span className="text-[10px] font-black uppercase tracking-tighter text-slate-600 dark:text-slate-300">{row.color_name}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="bg-slate-50 dark:bg-slate-800/80 p-6 rounded-[2.5rem] flex items-center justify-between mb-6 border border-white dark:border-slate-700 shadow-inner group/6d">
                                    <div className="flex items-center gap-4">
                                        <div className="flex flex-col gap-1">
                                            <button
                                                disabled={isOutOfStock}
                                                onClick={() => updateOrderQty(row.id, 1, row.stock_quantity)}
                                                className="p-1.5 bg-white dark:bg-slate-700 rounded-lg hover:bg-[#004A7C] hover:text-white transition-all shadow-sm active:scale-90 disabled:opacity-0"
                                            >
                                                <ChevronUp size={20} strokeWidth={3}/>
                                            </button>
                                            <button
                                                disabled={isOutOfStock}
                                                onClick={() => updateOrderQty(row.id, -1, row.stock_quantity)}
                                                className="p-1.5 bg-white dark:bg-slate-700 rounded-lg hover:bg-[#004A7C] hover:text-white transition-all shadow-sm active:scale-90 disabled:opacity-0"
                                            >
                                                <ChevronDown size={20} strokeWidth={3}/>
                                            </button>
                                        </div>
                                        <div className="text-4xl font-black text-slate-800 dark:text-white min-w-[2rem] text-center tracking-tighter">
                                            {isOutOfStock ? 0 : qty}
                                        </div>
                                    </div>

                                    <div className="flex-1 text-right border-l-2 border-slate-200 dark:border-slate-700 ml-5 pl-5">
                                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Live Subtotal</p>
                                        <p className="text-2xl font-black text-emerald-600 tracking-tighter">
                                            ETB {liveTotal.toLocaleString()}
                                        </p>
                                        <p className="text-[9px] font-bold text-slate-400">@ {Number(row.selling_price).toLocaleString()} / unit</p>
                                    </div>

                                    <button
                                        onClick={() => handleQuickOrder(row, liveTotal)}
                                        disabled={isOutOfStock}
                                        className="ml-5 bg-[#004A7C] text-white p-5 rounded-2xl shadow-lg hover:translate-y-1 active:scale-90 transition-all disabled:bg-slate-300"
                                    >
                                        <ShoppingCart size={24} strokeWidth={2.5} />
                                    </button>
                                </div>

                                <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800 mt-auto">
                                    <div className="flex gap-2">
                                        <button onClick={() => openModal("edit", row)} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-slate-500 hover:text-emerald-500 hover:bg-emerald-50 transition-all"><Edit3 size={18} /></button>
                                        <button onClick={() => openModal("view", row)} className="p-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl hover:opacity-80 transition-all"><Eye size={18} /></button>
                                    </div>
                                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">#{row.sku || 'N/A'}</span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Floating Batch Bar */}
            {selectedItems.length > 0 && (
                <div className="fixed bottom-12 left-1/2 -translate-x-1/2 z-[100] w-full max-w-3xl px-6 animate-in fade-in slide-in-from-bottom-20 duration-500">
                    <div className="bg-slate-900/95 dark:bg-slate-800/95 backdrop-blur-xl text-white rounded-[3rem] p-5 pl-10 shadow-2xl flex items-center justify-between border border-white/10">
                        <div className="flex items-center gap-10">
                            <div className="flex flex-col">
                                <span className="text-[10px] text-[#004A7C] font-black uppercase tracking-[0.2em]">Batch Processing</span>
                                <h4 className="font-black text-2xl leading-none">{selectedItems.length} <span className="text-slate-500 text-sm italic">Items</span></h4>
                            </div>
                            <div className="h-12 w-[1px] bg-white/10 hidden sm:block"></div>
                            <div className="flex flex-col">
                                <p className="text-[10px] text-emerald-400 font-black uppercase tracking-[0.2em]">Total Commitment</p>
                                <p className="text-2xl font-black text-white tracking-tighter">ETB {batchTotal.toLocaleString()}</p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <button onClick={() => setSelectedItems([])} className="p-4 text-slate-400 hover:text-white transition-all"><XCircle size={28} /></button>
                            <button onClick={handleBatchOrder} className="bg-white text-slate-900 px-10 py-4 rounded-[2rem] font-black text-sm flex items-center gap-3 hover:bg-[#004A7C] hover:text-white transition-all shadow-xl group">
                                <Send size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" /> PROCESS BATCH
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <InventoryModal
                modal={modal} setModal={setModal} formValues={formValues}
                setFormValues={setFormValues} handleAction={handleAction}
                submitting={submitting} shops={shops} categories={categories}
            />
        </div>
    );
}