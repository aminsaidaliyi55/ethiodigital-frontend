import React, { useState, useRef } from "react";
import { X, ArrowLeft, Boxes, ImageIcon, CreditCard, User, Landmark, Loader2, ShoppingBag, Check, Lock } from "lucide-react";
import { updateTransactionPayment, uploadOrderReceipt, updateRequestStatus } from "@/services/orderService.js";
import toast from "react-hot-toast";

const SERVER_URL = "http://localhost:8000";

const OrderModals = ({ viewData, setViewData, staff, loadData, formatStatus }) => {
    const [updatingPayment, setUpdatingPayment] = useState(false);
    const [uploadingReceipt, setUploadingReceipt] = useState(false);
    const [isFinishing, setIsFinishing] = useState(false);
    const fileInputRef = useRef(null);

    // If status is APPROVED, the modal is read-only
    const isReadOnly = viewData ? formatStatus(viewData.status) === 'APPROVED' : false;

    const bankAccounts = [
        { id: 1, name: "CBE", owner: "Main Store" },
        { id: 2, name: "BOA", owner: "Finance" },
        { id: 3, name: "Telebirr", owner: "Retail" }
    ];

    const handlePaymentUpdate = async (field, value) => {
        if (isReadOnly) return;
        setUpdatingPayment(true);
        try {
            await updateTransactionPayment(viewData.id, { [field]: value === "" ? null : value });
            toast.success("Updated Successfully");
            loadData();
            setViewData(prev => ({ ...prev, [field]: value }));
        } catch (error) {
            toast.error("Update Failed");
        } finally {
            setUpdatingPayment(false);
        }
    };

    const handleFileUpload = async (e) => {
        if (isReadOnly) return;
        const file = e.target.files[0];
        if (!file) return;

        setUploadingReceipt(true);
        const loadingToast = toast.loading("Uploading receipt...");
        try {
            const response = await uploadOrderReceipt(viewData.id, file);
            toast.success("Receipt Uploaded", { id: loadingToast });
            loadData();
            if (response && response.receipt_url) {
                setViewData(prev => ({ ...prev, receipt_url: response.receipt_url }));
            }
        } catch (error) {
            toast.error("Upload Failed", { id: loadingToast });
        } finally {
            setUploadingReceipt(false);
        }
    };

    const handleFinalize = async () => {
        if (isReadOnly) {
            setViewData(null); // Just close if read-only
            return;
        }
        setIsFinishing(true);
        try {
            await updateRequestStatus(viewData.id, { status: 'APPROVED' });
            toast.success("Transaction Committed");
            setViewData(null);
            loadData();
        } catch (error) {
            toast.error("Finalization Failed");
        } finally {
            setIsFinishing(false);
        }
    };

    if (!viewData) return null;

    const currentReceipt = viewData?.receipt_url ?
        (viewData.receipt_url.startsWith('http') || viewData.receipt_url.startsWith('blob') ?
            viewData.receipt_url : `${SERVER_URL}${viewData.receipt_url}`)
        : null;

    return (
        <div className="fixed inset-0 bg-indigo-950/95 backdrop-blur-xl z-[1000] p-4 flex items-center justify-center animate-in fade-in duration-200">
            <div className="bg-white dark:bg-indigo-950 w-full max-w-7xl h-[85vh] rounded-[2rem] shadow-2xl border border-white/10 flex flex-col overflow-hidden">

                {/* NAV BAR */}
                <div className="flex items-center justify-between px-6 py-6 border-b border-indigo-100/10 bg-indigo-900/50">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setViewData(null)} className="p-2 rounded-xl bg-indigo-800 text-white hover:bg-indigo-700 transition-colors shadow-sm">
                            <ArrowLeft size={16} />
                        </button>
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="text-[11px] font-black text-indigo-900 dark:text-white uppercase tracking-widest leading-none">
                                    {viewData.type === 'order' ? `SALES_LOG #${viewData.id}` : viewData.title}
                                </h2>
                                {isReadOnly && <Lock size={10} className="text-emerald-500" />}
                            </div>
                            <p className="text-[7px] font-black text-indigo-400 uppercase tracking-[0.2em] mt-1">{formatStatus(viewData.status)}</p>
                        </div>
                    </div>
                    <button onClick={() => setViewData(null)} className="p-2 text-indigo-300 hover:text-rose-500 transition-colors">
                        <X size={18} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {isReadOnly && (
                        <div className="bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-xl flex items-center gap-3">
                            <Check size={14} className="text-emerald-500" />
                            <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">This transaction is approved and locked for editing.</p>
                        </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        {/* LEFT: PAYMENT CONTROL */}
                        <div className={`lg:col-span-5 space-y-4 bg-indigo-900/10 p-5 rounded-2xl border border-indigo-500/10 ${isReadOnly ? 'opacity-70 pointer-events-none' : ''}`}>
                            <div className="flex items-center justify-between">
                                <p className="text-[8px] font-black text-indigo-400 uppercase tracking-[0.2em]">Transaction Config</p>
                                {updatingPayment && <Loader2 size={12} className="animate-spin text-indigo-500" />}
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <ControlSelect
                                    label="Method" icon={<CreditCard size={10}/>}
                                    value={viewData.payment_method}
                                    onChange={v => handlePaymentUpdate('payment_method', v)}
                                    disabled={isReadOnly}
                                >
                                    <option value="CASH">CASH</option>
                                    <option value="TRANSFER">TRANSFER</option>
                                    <option value="CREDIT">CREDIT</option>
                                </ControlSelect>

                                {viewData.payment_method === 'CASH' ? (
                                    <ControlSelect
                                        label="Cashier" icon={<User size={10}/>}
                                        value={viewData.cashier_id}
                                        onChange={v => handlePaymentUpdate('cashier_id', v)}
                                        disabled={isReadOnly}
                                    >
                                        <option value="">Select Staff...</option>
                                        {staff.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                    </ControlSelect>
                                ) : (
                                    <ControlSelect
                                        label="Bank Account" icon={<Landmark size={10}/>}
                                        value={viewData.bank_account_id}
                                        onChange={v => handlePaymentUpdate('bank_account_id', v)}
                                        disabled={isReadOnly}
                                    >
                                        <option value="">Select Bank...</option>
                                        {bankAccounts.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                                    </ControlSelect>
                                )}
                            </div>

                            {viewData.payment_method === 'TRANSFER' && (
                                <div className="mt-2 p-4 bg-indigo-900/20 rounded-xl flex items-center gap-4 border border-dashed border-indigo-400/30">
                                    <div className="relative w-16 h-16 bg-indigo-950 rounded-lg overflow-hidden flex items-center justify-center border border-indigo-400/20">
                                        {currentReceipt ? <img src={currentReceipt} className="w-full h-full object-cover" /> : <ImageIcon className="text-indigo-400/40" size={24} />}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-[7px] font-black text-indigo-400 uppercase tracking-widest mb-1">Payment Verification</p>
                                        {!isReadOnly && (
                                            <>
                                                <button onClick={() => fileInputRef.current.click()} className="text-[9px] font-black uppercase text-white bg-indigo-600 px-3 py-1.5 rounded-md">
                                                    {currentReceipt ? "Update Receipt" : "Upload Receipt"}
                                                </button>
                                                <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={handleFileUpload} />
                                            </>
                                        )}
                                        {isReadOnly && <span className="text-[9px] font-black text-indigo-300 uppercase">Receipt Verified</span>}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* RIGHT: SUMMARY STATS */}
                        <div className="lg:col-span-7 grid grid-cols-3 gap-3">
                            <MiniStat label="Total Amount" val={`ETB ${Number(viewData.total_amount).toLocaleString()}`} highlight />
                            <MiniStat label="Customer" val={viewData.customer_name || "Guest Customer"} />
                            <MiniStat label="Transaction Date" val={new Date(viewData.created_at).toLocaleDateString()} />
                        </div>
                    </div>

                    {/* PRODUCT LIST SECTION */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 px-1 border-b border-indigo-500/10 pb-2">
                            <ShoppingBag size={14} className="text-indigo-500" />
                            <p className="text-[9px] font-black text-indigo-400 uppercase tracking-[0.2em]">Itemized Inventory</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {(viewData.order_items || []).map((item, idx) => (
                                <div key={idx} className="flex items-center justify-between p-4 bg-indigo-900/5 dark:bg-white/5 border border-indigo-500/10 rounded-2xl">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-indigo-950 rounded-xl overflow-hidden flex items-center justify-center">
                                            {item.image ? <img src={`${SERVER_URL}${item.image}`} className="w-full h-full object-cover" /> : <Boxes size={18} className="text-indigo-700" />}
                                        </div>
                                        <div>
                                            <p className="text-[11px] font-black text-indigo-900 dark:text-white uppercase leading-tight">{item.name}</p>
                                            <p className="text-[8px] font-black text-indigo-400 uppercase mt-1">Quantity: {item.quantity}</p>
                                        </div>
                                    </div>
                                    <p className="text-[11px] font-black text-indigo-900 dark:text-indigo-300">ETB {Number(item.subtotal).toLocaleString()}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ACTION FOOTER */}
                <div className="px-6 py-5 bg-indigo-900/30 border-t border-indigo-500/10 flex justify-between items-center">
                    <div>
                        <span className="text-[7px] font-black text-indigo-400 uppercase tracking-widest">Final Summary</span>
                        <span className="block text-lg font-black text-white">ETB {Number(viewData.total_amount).toLocaleString()}</span>
                    </div>
                    <button
                        onClick={handleFinalize}
                        disabled={isFinishing}
                        className={`px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center gap-3 ${
                            isReadOnly
                                ? 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                                : 'bg-indigo-600 text-white shadow-xl shadow-indigo-900/40 hover:bg-indigo-500'
                        }`}
                    >
                        {isReadOnly ? (
                            <>
                                <X size={16} />
                                Close Record
                            </>
                        ) : isFinishing ? (
                            <>
                                <Loader2 size={16} className="animate-spin" />
                                Processing...
                            </>
                        ) : (
                            <>
                                <Check size={16} />
                                Commit & Close
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

const MiniStat = ({ label, val, highlight }) => (
    <div className="bg-indigo-900/5 dark:bg-white/5 p-5 rounded-2xl border border-indigo-500/10">
        <p className="text-[8px] font-black text-indigo-400 uppercase tracking-widest mb-2">{label}</p>
        <p className={`text-[12px] font-black truncate ${highlight ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-700 dark:text-white'}`}>{val}</p>
    </div>
);

const ControlSelect = ({ label, icon, value, onChange, children, disabled }) => (
    <div className="space-y-1.5">
        <label className="text-[8px] font-black text-indigo-400 uppercase flex items-center gap-1.5 ml-1">
            {icon} {label}
        </label>
        <div className="relative">
            <select
                value={value || ""}
                onChange={e => onChange(e.target.value)}
                disabled={disabled}
                className="w-full bg-white dark:bg-indigo-950 text-[10px] font-black p-3 rounded-xl border-none ring-1 ring-indigo-500/20 dark:ring-indigo-400/20 outline-none uppercase appearance-none focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-indigo-900 dark:text-white"
            >
                {children}
            </select>
        </div>
    </div>
);

export default OrderModals;