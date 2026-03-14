import React from "react";
import {
    Eye, Package, ShoppingCart, ImageIcon, ClipboardCheck, CheckCircle, Printer, Hash
} from "lucide-react";

const StatusBadge = ({ status }) => {
    const colors = {
        APPROVED: "bg-indigo-900 text-white border-indigo-900 shadow-lg",
        REJECTED: "bg-rose-50 text-rose-600 border-rose-100",
        PENDING: "bg-amber-50 text-amber-600 border-amber-100 shadow-sm",
    };

    return (
        <div className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase border inline-block tracking-tighter ${colors[status] || colors.PENDING}`}>
            {status}
        </div>
    );
};

const EmptyUI = ({ icon: Icon, title }) => (
    <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-[2.5rem]">
        <Icon size={48} className="mx-auto mb-4 text-slate-200" />
        <h3 className="font-black text-slate-400 uppercase tracking-[0.3em] text-[10px]">{title}</h3>
    </div>
);

const DataTable = ({
                       data,
                       activeTab,
                       onView,
                       onVerify,
                       onConfirm,
                       onPrint,
                       formatStatus
                   }) => {
    return (
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2.5rem] overflow-hidden shadow-sm">
            <table className="w-full text-left border-collapse">
                <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                    <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Entry Details</th>
                    <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Transaction ID</th>
                    <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Type / Method</th>
                    <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Total Value</th>
                    <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
                    <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Operations</th>
                </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {data.length === 0 ? (
                    <tr>
                        <td colSpan="6" className="p-0">
                            <EmptyUI
                                icon={activeTab === 'requests' ? Package : ShoppingCart}
                                title="No Records Matching Filters"
                            />
                        </td>
                    </tr>
                ) : (
                    data.map((item) => {
                        const currentStatus = formatStatus(item.status);
                        const isPendingAction = currentStatus === 'PENDING';
                        const isApproved = currentStatus === 'APPROVED';
                        const uniqueKey = item.id || item.order_id || `row-${Math.random()}`;

                        // Reference code logic
                        const trxCode = activeTab === 'orders'
                            ? (item.transaction_id || item.order_items?.[0]?.unique_ref || "N/A")
                            : `REQ-${item.id}`;

                        return (
                            <tr key={uniqueKey} className={`hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors group ${isPendingAction ? 'bg-amber-50/10 dark:bg-amber-900/5' : ''}`}>
                                <td className="p-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex-shrink-0 overflow-hidden border border-slate-200 dark:border-slate-700 flex items-center justify-center">
                                            {activeTab === 'requests' ? (
                                                item.image_url ? <img src={item.image_url} className="w-full h-full object-cover" alt="" /> : <ImageIcon className="text-slate-300" size={20} />
                                            ) : (
                                                <ShoppingCart className="text-indigo-900 dark:text-indigo-400" size={20} />
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-black text-slate-900 dark:text-white uppercase text-sm tracking-tight">
                                                {activeTab === 'requests' ? item.title : `Order #${item.id || item.order_id}`}
                                            </p>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                                {activeTab === 'requests' ? item.client_name : new Date(item.created_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                </td>

                                {/* NEW: Transaction ID Column */}
                                <td className="p-6">
                                    <div className="flex items-center gap-2">
                                        <div className="bg-slate-100 dark:bg-slate-800 p-2 rounded-lg group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/20 transition-colors">
                                            <Hash size={12} className="text-slate-400 group-hover:text-indigo-600" />
                                        </div>
                                        <span className="font-mono text-[11px] font-bold text-slate-600 dark:text-slate-300 group-hover:text-indigo-900 dark:group-hover:text-indigo-400 transition-colors">
                                            {trxCode}
                                        </span>
                                    </div>
                                </td>

                                <td className="p-6">
                                    <span className="text-[10px] font-black bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg text-slate-500 uppercase tracking-widest">
                                        {activeTab === 'requests' ? 'Inventory' : (item.payment_method || 'Digital Pay')}
                                    </span>
                                </td>
                                <td className="p-6">
                                    <p className="font-black text-slate-900 dark:text-white">
                                        ETB {activeTab === 'requests' ? (Number(item.budget) || 0).toLocaleString() : (Number(item.total_amount) || 0).toLocaleString()}
                                    </p>
                                </td>
                                <td className="p-6">
                                    <StatusBadge status={currentStatus} />
                                </td>
                                <td className="p-6 text-right">
                                    <div className="flex justify-end gap-2">
                                        {isApproved && (
                                            <button
                                                onClick={() => onPrint(item)}
                                                className="p-3 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-900 dark:text-indigo-400 hover:bg-indigo-900 hover:text-white rounded-xl transition-all shadow-sm"
                                                title="Print Receipt"
                                            >
                                                <Printer size={18}/>
                                            </button>
                                        )}

                                        <button
                                            onClick={() => onView(item)}
                                            className="p-3 bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-indigo-900 dark:hover:text-white rounded-xl transition-all"
                                        >
                                            <Eye size={18}/>
                                        </button>

                                        {isPendingAction && (
                                            activeTab === 'requests' ? (
                                                <button onClick={() => onVerify(item)} className="px-5 py-3 bg-indigo-900 text-white rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-black transition-all flex items-center gap-2 shadow-lg active:scale-95">
                                                    <ClipboardCheck size={14}/> Verify
                                                </button>
                                            ) : (
                                                <button onClick={() => onConfirm(item)} className="px-5 py-3 bg-indigo-900 text-white rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-black transition-all flex items-center gap-2 shadow-lg active:scale-95">
                                                    <CheckCircle size={14}/> Confirm
                                                </button>
                                            )
                                        )}
                                    </div>
                                </td>
                            </tr>
                        );
                    })
                )}
                </tbody>
            </table>
        </div>
    );
};

export default DataTable;