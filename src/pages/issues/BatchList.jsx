import React, { useState, useMemo } from "react";
import { Search, Package, Truck, MapPin, ChevronRight } from "lucide-react";

const BatchList = ({ filter, onViewDetails, onAddNewBatch, data = [] }) => {
    const [searchTerm, setSearchTerm] = useState("");

    const filteredBatches = useMemo(() => {
        return data.filter(item => {
            const query = searchTerm.toLowerCase();
            return (
                (item.transaction_id || "").toLowerCase().includes(query) ||
                (item.customer_name || "").toLowerCase().includes(query) ||
                (item.status || "").toLowerCase().includes(query)
            );
        });
    }, [data, searchTerm]);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div className="relative w-96">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search Batch ID (TRX...)"
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-900 rounded-2xl border-none focus:ring-2 focus:ring-indigo-900 font-bold"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <button
                    onClick={onAddNewBatch}
                    className="px-6 py-3 bg-indigo-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all shadow-lg active:scale-95"
                >
                    + Create New Batch
                </button>
            </div>

            <div className="grid gap-4">
                {filteredBatches.length === 0 ? (
                    <div className="py-20 text-center bg-slate-50 dark:bg-slate-900 rounded-[2rem] border border-dashed border-slate-200 dark:border-slate-800">
                        <Truck size={48} className="mx-auto mb-4 text-slate-200" />
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">No Batches Found</p>
                    </div>
                ) : (
                    filteredBatches.map((batch) => (
                        <div
                            key={batch.id}
                            onClick={() => onViewDetails(batch)}
                            className="p-5 bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-[2rem] hover:shadow-xl transition-all cursor-pointer flex items-center justify-between group"
                        >
                            <div className="flex items-center gap-6">
                                <div className="w-14 h-14 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-900 dark:text-indigo-400 rounded-2xl flex items-center justify-center">
                                    <Package size={24} />
                                </div>
                                <div>
                                    <h4 className="font-black text-slate-900 dark:text-white uppercase tracking-tight">{batch.transaction_id}</h4>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                        <MapPin size={10} /> {batch.destination || "Warehouse Storage"}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-8">
                                <div className="text-right">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Status</p>
                                    <span className="px-4 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-full text-[9px] font-black uppercase tracking-tighter">
                                        {batch.status}
                                    </span>
                                </div>
                                <ChevronRight className="text-slate-200 group-hover:text-indigo-900 transition-colors" />
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default BatchList;