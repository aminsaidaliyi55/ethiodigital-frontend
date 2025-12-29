"use client";

import { Eye, Edit, Trash2 } from "lucide-react";

/**
 * Returns the column definitions for the inventory table.
 *
 * @param {Array<{id: number, name: string}>} categories   List of product categories.
 * @param {(v: any) => void} setModal                     Function that opens the modal.
 * @param {(id: number) => void} handleDelete             Function that deletes a product.
 * @returns {Array<Object>}                              Column configuration for DataTable.
 */
export const getInventoryColumns = (
    categories,
    setModal,
    handleDelete
) => [
    {
        header: "Product Detail",
        render: (_, row) => (
            <div className="flex flex-col text-left">
                <span className="font-bold text-slate-900 text-sm">{row.name}</span>
                <span className="text-[10px] text-slate-400 uppercase font-black">
          SKU: {row.sku} |{" "}
                    {categories.find((c) => c.id === row.category_id)?.name ||
                        "Uncategorized"}
        </span>
            </div>
        ),
    },

    {
        header: "Inventory",
        render: (_, row) => (
            <div className="flex flex-col items-start">
        <span
            className={`font-black ${
                row.stock_quantity <= 5 ? "text-red-600" : "text-[#004A7C]"
            }`}
        >
          {row.stock_quantity}
        </span>
                <span className="text-[8px] uppercase font-bold text-slate-400">
          On Hand
        </span>
            </div>
        ),
    },

    {
        header: "Valuation",
        render: (_, row) => (
            <div className="flex flex-col text-left">
        <span className="text-emerald-600 font-bold text-xs">
          Sale: ${Number(row.selling_price).toFixed(2)}
        </span>
                <span className="text-[9px] text-slate-400 uppercase font-bold">
          Base: ${Number(row.price).toFixed(2)}
        </span>
            </div>
        ),
    },

    {
        header: "Control",
        render: (_, row) => (
            <div className="flex justify-end gap-2">
                <button
                    onClick={() =>
                        setModal({ isOpen: true, type: "view", data: row })
                    }
                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                >
                    <Eye size={16} />
                </button>

                <button
                    onClick={() =>
                        setModal({ isOpen: true, type: "edit", data: row })
                    }
                    className="p-1.5 text-amber-600 hover:bg-amber-50 rounded"
                >
                    <Edit size={16} />
                </button>

                <button
                    onClick={() => {
                        if (window.confirm(`Permanently delete ${row.name}?`)) {
                            handleDelete(row.id);
                        }
                    }}
                    className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                >
                    <Trash2 size={16} />
                </button>
            </div>
        ),
    },
];