"use client";

import { X, Loader2 } from "lucide-react";

/**
 * Inventory modal – plain JSX version.
 *
 * Props:
 *  - modal:        { isOpen: boolean, type: string | null, data?: object }
 *  - formValues:   object containing the fields of the product
 *  - setFormValues: fn to update formValues
 *  - handleAction: fn to submit the form
 *  - submitting:   boolean – shows the spinner while saving
 *  - shops:        array of shop objects ({ id, Id, name, Name })
 *  - categories:   array of category objects ({ id, Id, name, Name })
 *  - setModal:     fn to open/close the modal
 */
const InventoryModal = ({
                            modal,
                            formValues,
                            setFormValues,
                            handleAction,
                            submitting,
                            shops,
                            categories,
                            setModal,
                        }) => {
    if (!modal.isOpen) return null;

    const isView = modal.type === "view";

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[120]">
            <div className="bg-white dark:bg-slate-900 w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden border dark:border-slate-800">
                {/* ────── Header ────── */}
                <div
                    className={`p-6 flex justify-between items-center text-white ${
                        isView ? "bg-slate-700" : "bg-[#004A7C]"
                    }`}
                >
                    <div>
                        <h2 className="font-black text-lg uppercase tracking-tight">
                            {modal.type} Product Entry
                        </h2>
                        <p className="text-[10px] opacity-80 font-bold uppercase tracking-widest">
                            Reference: {modal.data?.Id ?? modal.data?.id ?? "NEW_RECORD"}
                        </p>
                    </div>
                    <button
                        onClick={() => setModal({ isOpen: false, type: null, data: null })}
                        className="hover:rotate-90 transition-transform"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* ────── Form ────── */}
                <div className="p-8 max-h-[70vh] overflow-y-auto">
                    <form
                        id="inventoryForm"
                        onSubmit={handleAction}
                        className="grid grid-cols-1 md:grid-cols-2 gap-6"
                    >
                        {/* Shop */}
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                                Assigned Shop
                            </label>
                            <select
                                disabled={isView}
                                value={formValues.shop_id}
                                onChange={(e) =>
                                    setFormValues({ ...formValues, shop_id: e.target.value })
                                }
                                required
                                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3.5 rounded-xl text-xs font-bold focus:ring-2 ring-[#004A7C] transition-all"
                            >
                                <option value="">Select Shop</option>
                                {shops.map((s) => (
                                    <option key={s.id ?? s.Id} value={s.id ?? s.Id}>
                                        {s.name ?? s.Name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Category */}
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                                Classification
                            </label>
                            <select
                                disabled={isView}
                                value={formValues.category_id}
                                onChange={(e) =>
                                    setFormValues({ ...formValues, category_id: e.target.value })
                                }
                                required
                                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3.5 rounded-xl text-xs font-bold focus:ring-2 ring-[#004A7C] transition-all"
                            >
                                <option value="">Select Category</option>
                                {categories.map((c) => (
                                    <option key={c.id ?? c.Id} value={c.id ?? c.Id}>
                                        {c.name ?? c.Name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Product Name */}
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                                Product Name
                            </label>
                            <input
                                type="text"
                                disabled={isView}
                                value={formValues.name}
                                onChange={(e) =>
                                    setFormValues({ ...formValues, name: e.target.value })
                                }
                                required
                                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3.5 rounded-xl text-xs font-bold focus:ring-2 ring-[#004A7C] transition-all"
                            />
                        </div>

                        {/* SKU */}
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                                SKU
                            </label>
                            <input
                                type="text"
                                disabled={isView}
                                value={formValues.sku}
                                onChange={(e) =>
                                    setFormValues({ ...formValues, sku: e.target.value })
                                }
                                required
                                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3.5 rounded-xl text-xs font-bold focus:ring-2 ring-[#004A7C] transition-all"
                            />
                        </div>

                        {/* Purchase Price */}
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                                Purchase Price
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                disabled={isView}
                                value={formValues.price}
                                onChange={(e) =>
                                    setFormValues({ ...formValues, price: e.target.value })
                                }
                                required
                                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3.5 rounded-xl text-xs font-bold focus:ring-2 ring-[#004A7C] transition-all"
                            />
                        </div>

                        {/* Selling Price */}
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                                Selling Price
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                disabled={isView}
                                value={formValues.selling_price}
                                onChange={(e) =>
                                    setFormValues({ ...formValues, selling_price: e.target.value })
                                }
                                required
                                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3.5 rounded-xl text-xs font-bold focus:ring-2 ring-[#004A7C] transition-all"
                            />
                        </div>

                        {/* Stock Quantity */}
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                                Stock Quantity
                            </label>
                            <input
                                type="number"
                                disabled={isView}
                                value={formValues.stock_quantity}
                                onChange={(e) =>
                                    setFormValues({ ...formValues, stock_quantity: e.target.value })
                                }
                                required
                                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3.5 rounded-xl text-xs font-bold focus:ring-2 ring-[#004A7C] transition-all"
                            />
                        </div>

                        {/* Submit / Close Buttons */}
                        <div className="col-span-1 md:col-span-2 flex justify-end gap-4 pt-4">
                            <button
                                type="button"
                                onClick={() => setModal({ isOpen: false, type: null, data: null })}
                                className="px-6 py-2.5 rounded-xl bg-gray-200 text-gray-800 hover:bg-gray-300 transition"
                                disabled={submitting}
                            >
                                Cancel
                            </button>

                            {!isView && (
                                <button
                                    type="submit"
                                    className="px-6 py-2.5 rounded-xl bg-[#004A7C] text-white hover:bg-[#003a61] transition flex items-center gap-2"
                                    disabled={submitting}
                                >
                                    {submitting && <Loader2 className="animate-spin" size={16} />}
                                    Save
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default InventoryModal;