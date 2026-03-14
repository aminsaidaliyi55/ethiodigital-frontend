import React, { useState } from "react";
import { ArrowLeft, Save, Hash, RefreshCcw, MapPin } from "lucide-react";
import toast from "react-hot-toast";

const CreateBatch = ({ onBack, onSuccess }) => {
    const generateID = () => `TRX-${Math.floor(100000 + Math.random() * 900000)}`;

    const [batchData, setBatchData] = useState({
        transaction_id: generateID(),
        destination: "",
        notes: ""
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        const tid = toast.loading("Saving Batch...");
        try {
            // Integrate with your backend API here
            toast.success("Batch successfully initialized", { id: tid });
            onSuccess();
        } catch (err) {
            toast.error(err.response?.data?.message || "Unique ID conflict", { id: tid });
        }
    };

    return (
        <div className="max-w-2xl mx-auto bg-white dark:bg-slate-950 rounded-[2.5rem] p-10 border border-slate-100 dark:border-slate-800 shadow-2xl">
            <header className="flex justify-between items-center mb-10">
                <button onClick={onBack} className="p-3 bg-slate-50 dark:bg-slate-900 rounded-2xl hover:bg-indigo-900 hover:text-white transition-all">
                    <ArrowLeft size={20} />
                </button>
                <h3 className="text-xl font-black text-indigo-900 dark:text-white uppercase tracking-tighter">New Shipment</h3>
                <div className="w-10"></div>
            </header>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="p-6 bg-indigo-50/50 dark:bg-indigo-900/10 rounded-3xl border border-indigo-100/50 dark:border-indigo-900/30 relative">
                    <label className="text-[10px] font-black text-indigo-900 dark:text-indigo-400 uppercase tracking-widest mb-2 block">Reference Code</label>
                    <div className="flex items-center gap-3">
                        <Hash size={18} className="text-indigo-400" />
                        <span className="text-2xl font-black text-indigo-900 dark:text-white tracking-tighter">{batchData.transaction_id}</span>
                        <button
                            type="button"
                            onClick={() => setBatchData({...batchData, transaction_id: generateID()})}
                            className="ml-auto p-2 bg-white dark:bg-slate-800 rounded-xl shadow-sm hover:scale-110 transition-transform"
                        >
                            <RefreshCcw size={16} className="text-indigo-900 dark:text-indigo-400" />
                        </button>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Delivery Destination</label>
                    <div className="relative">
                        <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            required
                            className="w-full pl-14 pr-6 py-5 bg-slate-50 dark:bg-slate-900 rounded-2xl border-none focus:ring-2 focus:ring-indigo-900 font-bold dark:text-white"
                            placeholder="Addis Ababa Center..."
                            value={batchData.destination}
                            onChange={(e) => setBatchData({...batchData, destination: e.target.value})}
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    className="w-full py-6 bg-indigo-900 text-white rounded-3xl font-black uppercase tracking-widest hover:bg-black transition-all shadow-xl flex items-center justify-center gap-3 mt-8 active:scale-95"
                >
                    <Save size={20} /> Initialize Shipment
                </button>
            </form>
        </div>
    );
};

export default CreateBatch;