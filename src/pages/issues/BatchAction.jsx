import React, { useState } from "react";
import {
    ArrowLeft, Truck, User, CheckCircle, Package, MapPin,
    Navigation, RotateCcw, AlertTriangle, FileSignature,
    UploadCloud, Printer, ShieldCheck
} from "lucide-react";
import toast from "react-hot-toast";
import { updateOrderStatus } from "@/services/orderService";

const BatchAction = ({ batch, onBack }) => {
    const [loading, setLoading] = useState(false);
    const [showRevertConfirm, setShowRevertConfirm] = useState(false);
    const [isCapturingSignature, setIsCapturingSignature] = useState(false);
    const [signatureData, setSignatureData] = useState("");

    const handleUpdate = async (newStatus) => {
        setLoading(true);
        const updateToast = toast.loading(`Syncing status to ${newStatus}...`);

        try {
            const token = localStorage.getItem("token");
            const payload = {
                status: newStatus,
                signature_data: newStatus === "DELIVERED" ? signatureData : null
            };

            await updateOrderStatus(batch.id, payload, token);
            toast.success(`System Updated: ${newStatus}`, { id: updateToast });
            setIsCapturingSignature(false);
            onBack();
        } catch (err) {
            console.error("Update Error:", err);
            toast.error("Cloud Sync Failed", { id: updateToast });
        } finally {
            setLoading(false);
        }
    };

    const handlePrintWaybill = () => {
        window.print();
    };

    const getStepStatus = (step) => {
        const statuses = ["PENDING", "IN_TRANSIT", "DELIVERED"];
        const currentIndex = statuses.indexOf(batch.status);
        const stepIndex = statuses.indexOf(step);
        if (currentIndex >= stepIndex) return "text-indigo-600 dark:text-indigo-400 border-indigo-600";
        return "text-slate-300 dark:text-slate-700 border-slate-100 dark:border-slate-800";
    };

    return (
        <div className="bg-white dark:bg-slate-950 rounded-[3rem] p-10 shadow-2xl border border-slate-100 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-500">

            {/* INVISIBLE PRINT TEMPLATE */}
            <div className="hidden print:block p-10 bg-white text-black font-sans">
                <div className="flex justify-between border-b-4 border-black pb-6 mb-8">
                    <div>
                        <h1 className="text-4xl font-black italic uppercase tracking-tighter">Waybill Manifest</h1>
                        <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Logistics Authority - Terminal Alpha</p>
                    </div>
                    <div className="text-right">
                        <p className="text-lg font-black uppercase">{batch.transaction_id}</p>
                        <p className="text-[10px] font-bold">DATE: {new Date().toLocaleDateString()}</p>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-12 mb-10">
                    <div className="space-y-4">
                        <p className="text-[10px] font-black uppercase bg-black text-white px-2 py-1 inline-block">Shipping Address</p>
                        <p className="text-xl font-bold leading-tight">{batch.delivery_address}</p>
                    </div>
                    <div className="space-y-4">
                        <p className="text-[10px] font-black uppercase bg-black text-white px-2 py-1 inline-block">Logistics Personnel</p>
                        <p className="text-xl font-bold">{batch.staff_name || "Internal Fleet"}</p>
                        <p className="text-sm font-bold">Tracking: {batch.tracking_id || "PENDING"}</p>
                    </div>
                </div>
                <div className="border-2 border-black p-6 rounded-xl flex justify-between items-center">
                    <div>
                        <p className="text-[10px] font-black uppercase">Freight Value</p>
                        <p className="text-3xl font-black italic">${batch.total_cost || "0.00"}</p>
                    </div>
                    <div className="w-32 h-32 border border-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-300 uppercase italic text-center p-4">
                        Official Stamp Required
                    </div>
                </div>
                <p className="mt-10 text-[9px] font-bold uppercase text-slate-400 text-center">Electronically Generated Waybill - No Signature Required for Loading</p>
            </div>

            {/* SCREEN UI HEADER */}
            <div className="flex justify-between items-center mb-12 print:hidden">
                <button onClick={onBack} className="flex items-center gap-3 text-slate-400 hover:text-indigo-900 transition-all group">
                    <div className="p-2 rounded-full group-hover:bg-slate-100 transition-colors">
                        <ArrowLeft size={18} />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">Exit Terminal</span>
                </button>

                <div className="flex gap-2">
                    <button
                        onClick={handlePrintWaybill}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-100 dark:border-slate-800 hover:bg-white transition-all shadow-sm"
                    >
                        <Printer size={14} />
                        <span className="text-[10px] font-black uppercase tracking-widest">Print Waybill</span>
                    </button>
                    {batch.status !== "PENDING" && !isCapturingSignature && (
                        <button
                            onClick={() => setShowRevertConfirm(!showRevertConfirm)}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-900/50 hover:bg-amber-100 transition-all"
                        >
                            <RotateCcw size={14} />
                        </button>
                    )}
                </div>
            </div>

            {/* REVERT WARNING */}
            {showRevertConfirm && (
                <div className="mb-8 p-6 bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/50 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-4 animate-in slide-in-from-top-4 print:hidden">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-rose-500 text-white rounded-2xl shadow-lg">
                            <AlertTriangle size={20} />
                        </div>
                        <p className="text-[10px] text-rose-700 dark:text-rose-500/70 font-black uppercase">Force reset to pending status?</p>
                    </div>
                    <button
                        onClick={() => handleUpdate("PENDING")}
                        className="px-6 py-3 bg-rose-600 text-white rounded-xl text-[10px] font-black uppercase hover:bg-rose-700"
                    >
                        Confirm Reset
                    </button>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 print:hidden">
                <div className="lg:col-span-7">
                    <div className="mb-10">
                        <h2 className="text-5xl font-black text-indigo-950 dark:text-white tracking-tighter italic uppercase mb-2">
                            {batch.transaction_id}
                        </h2>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-2">
                            <MapPin size={12} className="text-indigo-500" /> {batch.delivery_address}
                        </p>
                    </div>

                    {/* Timeline */}
                    <div className="relative flex justify-between items-start mb-12 px-2">
                        <div className="absolute top-5 left-0 right-0 h-[2px] bg-slate-100 dark:bg-slate-800 -z-10" />
                        {[
                            { id: "PENDING", icon: Package, label: "Manifested" },
                            { id: "IN_TRANSIT", icon: Truck, label: "Shipping" },
                            { id: "DELIVERED", icon: CheckCircle, label: "Delivered" }
                        ].map((step) => (
                            <div key={step.id} className="flex flex-col items-center gap-3">
                                <div className={`p-3 rounded-2xl bg-white dark:bg-slate-900 border-2 ${getStepStatus(step.id)} shadow-sm transition-colors duration-500`}>
                                    <step.icon size={20} />
                                </div>
                                <span className="text-[8px] font-black uppercase text-slate-400">{step.label}</span>
                            </div>
                        ))}
                    </div>

                    {/* POD Capture Mode */}
                    {isCapturingSignature ? (
                        <div className="p-8 bg-indigo-50 dark:bg-indigo-950/40 rounded-[2.5rem] border-2 border-indigo-200 dark:border-indigo-900 border-dashed animate-in zoom-in-95">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="p-3 bg-indigo-600 text-white rounded-2xl"><FileSignature size={24} /></div>
                                <div>
                                    <h3 className="text-lg font-black text-indigo-950 dark:text-white uppercase italic">Verification</h3>
                                    <p className="text-[10px] text-indigo-500 font-bold uppercase tracking-widest">Sign-off Required</p>
                                </div>
                            </div>

                            <input
                                type="text"
                                placeholder="Recipient Full Name..."
                                value={signatureData}
                                onChange={(e) => setSignatureData(e.target.value)}
                                className="w-full p-5 bg-white dark:bg-slate-900 rounded-2xl mb-4 border-none ring-1 ring-indigo-200 text-sm font-bold uppercase tracking-widest"
                            />

                            <div className="flex gap-3">
                                <button onClick={() => setIsCapturingSignature(false)} className="flex-1 py-4 bg-slate-200 text-slate-600 rounded-xl text-[10px] font-black uppercase">Cancel</button>
                                <button disabled={!signatureData} onClick={() => handleUpdate("DELIVERED")} className="flex-[2] py-4 bg-emerald-500 text-white rounded-xl text-[10px] font-black uppercase shadow-lg disabled:opacity-50">Sync Delivery</button>
                            </div>
                        </div>
                    ) : (
                        <div className="p-8 bg-slate-50 dark:bg-slate-900/50 rounded-[2rem] border border-slate-100 dark:border-slate-800">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-indigo-950 flex items-center justify-center text-white"><User size={20} /></div>
                                    <div>
                                        <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase">{batch.staff_name || "Internal"}</h4>
                                        <p className="text-[9px] text-slate-400 font-bold uppercase">Logistics Unit</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-xl font-black italic text-indigo-950 dark:text-white">${batch.total_cost || "0.00"}</p>
                                    <p className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">Freight Value</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* ACTION STACK */}
                {!isCapturingSignature && (
                    <div className="lg:col-span-5 flex flex-col gap-4">
                        <button
                            disabled={loading || batch.status !== "PENDING"}
                            onClick={() => handleUpdate("IN_TRANSIT")}
                            className="group w-full py-6 bg-indigo-950 text-white rounded-3xl font-black uppercase tracking-[0.2em] flex items-center justify-center gap-4 hover:bg-black transition-all shadow-xl disabled:opacity-20"
                        >
                            <Navigation size={20} /> Deploy to Transit
                        </button>

                        <button
                            disabled={loading || batch.status !== "IN_TRANSIT"}
                            onClick={() => setIsCapturingSignature(true)}
                            className="w-full py-6 bg-emerald-500 text-white rounded-3xl font-black uppercase tracking-[0.2em] flex items-center justify-center gap-4 hover:bg-emerald-600 transition-all shadow-lg disabled:opacity-20"
                        >
                            <ShieldCheck size={20} /> Confirm Delivery
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BatchAction;