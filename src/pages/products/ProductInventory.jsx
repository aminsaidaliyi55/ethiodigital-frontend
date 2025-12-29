"use client";

import { useMemo } from "react";
import {
    Loader2,
    Plus,
    Search,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";

import DataTable from "@/components/DataTable";
import InventoryModal from "./InventoryModal";
import { useInventory } from "./useInventory";
import { getInventoryColumns } from "./columns";
import { deleteProduct } from "@/services/inventoryService";

/* --------------------------------------------------------------
 * ProductInventory – plain JSX version
 * -------------------------------------------------------------- */
export default function ProductInventory({ filter }) {
    const {
        products,
        totalCount,
        loading,
        submitting,
        search,
        setSearch,
        currentPage,
        setCurrentPage,
        totalPages,
        modal,
        setModal,
        formValues,
        setFormValues,
        handleAction,
        loadData,
        shops,
        categories,
        initialFormState,
    } = useInventory();

    /* --------------------------------------------------------------
     * Columns – memoised so they are recreated only when the
     * categories list or the modal‑handlers change.
     * -------------------------------------------------------------- */
    const columns = useMemo(
        () => getInventoryColumns(categories, setModal, deleteProduct, loadData),
        [categories, setModal, loadData]
    );

    return (
        <div className="p-8 bg-[#F8FAFC] min-h-screen space-y-8">
            {/* ────── Header ────── */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                    <h1 className="text-2xl font-black text-[#004A7C] uppercase tracking-tighter">
                        Inventory <span className="text-indigo-500">Ledger</span>
                    </h1>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Portal Mode:{" "}
                        <span className="text-indigo-600">{filter ?? "Global"}</span>
                    </p>
                </div>

                <div className="flex gap-3 w-full md:w-auto">
                    {/* Search */}
                    <div className="relative flex-1 md:w-64">
                        <Search
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                            size={16}
                        />
                        <input
                            type="text"
                            placeholder="Search Registry..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-white border rounded-xl text-xs font-bold uppercase focus:ring-2 ring-indigo-500 outline-none"
                        />
                    </div>

                    {/* New entry button */}
                    <button
                        onClick={() => {
                            setFormValues(initialFormState);
                            setModal({ isOpen: true, type: "create", data: null });
                        }}
                        className="bg-[#004A7C] text-white px-6 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest shadow-lg flex items-center gap-2 hover:bg-[#003a61] transition-all"
                    >
                        <Plus size={16} /> New Entry
                    </button>
                </div>
            </header>

            {/* ────── Table / Loader ────── */}
            <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden min-h-[400px]">
                {loading ? (
                    <div className="p-40 flex flex-col items-center justify-center gap-4">
                        <Loader2 className="animate-spin text-[#004A7C]" size={40} />
                        <p className="text-slate-400 text-xs font-black uppercase animate-pulse">
                            Syncing Matrix...
                        </p>
                    </div>
                ) : (
                    <>
                        <DataTable columns={columns} data={products} rowKey="id" />
                        <div className="p-6 bg-slate-50 flex justify-between items-center border-t">
              <span className="text-[10px] font-black text-slate-400 uppercase">
                Records: {totalCount}
              </span>

                            {/* Pagination */}
                            <div className="flex items-center gap-4">
                                <button
                                    disabled={currentPage === 1}
                                    onClick={() => setCurrentPage((p) => p - 1)}
                                    className="p-2 border rounded-xl disabled:opacity-20 hover:bg-white transition-colors"
                                >
                                    <ChevronLeft size={18} />
                                </button>

                                <span className="text-xs font-black uppercase tracking-tighter">
                  Page {currentPage} / {totalPages || 1}
                </span>

                                <button
                                    disabled={currentPage === totalPages || totalPages === 0}
                                    onClick={() => setCurrentPage((p) => p + 1)}
                                    className="p-2 border rounded-xl disabled:opacity-20 hover:bg-white transition-colors"
                                >
                                    <ChevronRight size={18} />
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* ────── Modal ────── */}
            <InventoryModal
                modal={modal}
                formValues={formValues}
                setFormValues={setFormValues}
                handleAction={handleAction}
                submitting={submitting}
                shops={shops}
                categories={categories}
                setModal={setModal}
            />
        </div>
    );
}