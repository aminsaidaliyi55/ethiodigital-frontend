import React, { useState } from "react";
import { ArrowLeft, Save, Map, Send } from "lucide-react";
import toast from "react-hot-toast";
import api from "../../axios";

const AddRoute = ({ onBack, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        route_name: "",
        driver_id: "",
        vehicle_type: "Motorbike",
        notes: ""
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post("/routes", form);
            toast.success("New Route Saved");
            onSuccess();
        } catch (err) {
            toast.error("Failed to save route");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 max-w-2xl mx-auto">
            <button onClick={onBack} className="flex items-center gap-2 text-slate-500 hover:text-blue-900 font-bold text-xs uppercase mb-6">
                <ArrowLeft size={16} /> Cancel
            </button>

            <form onSubmit={handleSubmit} className="bg-white rounded-[2.5rem] p-10 shadow-sm space-y-6">
                <h2 className="text-2xl font-black text-blue-900 uppercase">New Delivery Route</h2>

                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Route Name</label>
                    <input
                        required
                        className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-blue-900/10 uppercase"
                        placeholder="e.g. Bole-Cmc Express"
                        value={form.route_name}
                        onChange={e => setForm({...form, route_name: e.target.value})}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Vehicle</label>
                        <select
                            className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl font-bold text-sm outline-none uppercase"
                            value={form.vehicle_type}
                            onChange={e => setForm({...form, vehicle_type: e.target.value})}
                        >
                            <option>Motorbike</option>
                            <option>Light Truck</option>
                            <option>Van</option>
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Estimated Time</label>
                        <input
                            className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl font-bold text-sm outline-none uppercase"
                            placeholder="e.g. 1 hour"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Instructions</label>
                    <textarea
                        className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl font-bold text-sm outline-none h-32 uppercase"
                        placeholder="Driver instructions..."
                        value={form.notes}
                        onChange={e => setForm({...form, notes: e.target.value})}
                    />
                </div>

                <button
                    disabled={loading}
                    type="submit"
                    className="w-full bg-blue-900 text-white py-5 rounded-2xl font-black text-xs uppercase shadow-xl hover:bg-black transition-all flex items-center justify-center gap-3"
                >
                    {loading ? "Saving..." : <><Send size={18} /> Deploy Route</>}
                </button>
            </form>
        </div>
    );
};

export default AddRoute;