import React from "react";
import { Eye, Package, ShoppingCart, ImageIcon } from "lucide-react";

const StatusBadge = ({ status }) => {
    const colors = {
        APPROVED: "bg-indigo-900 text-white",
        REJECTED: "bg-rose-50 text-rose-600 border-rose-100",
        PENDING: "bg-amber-50 text-amber-600 border-amber-100",
        COMPLETED: "bg-emerald-100 text-emerald-700 border-emerald-200"
    };
    const displayStatus = status === 'COMPLETED' ? 'APPROVED' : status;
    return (
        <div className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase border inline-block ${colors[status] || colors.PENDING}`}>
            {displayStatus}
        </div>
    );
};

const EmptyUI = ({ icon: Icon, title }) => (
    <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-[2.5rem]">
        <Icon size={48} className="mx-auto mb-4 text-slate-200" />
        <h3 className="font-black text-slate-400 uppercase tracking-[0.3em] text-[10px]">{title}</h3>
    </div>
);

const DataTable = ({ data, activeTab, onView, onVerify, onConfirm, formatStatus }) => {
    return (
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2.5rem] overflow-hidden shadow-sm">
            <table className="w-full text-left border-collapse">
                <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                    <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Entry Details</th>
                    <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Category/Method</th>
                    <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Value/Budget</th>
                    <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
                    <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Actions</th>
                </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {data.length === 0 ? (
                    <tr>
                        <td colSpan="5" className="p-0">
                            <EmptyUI icon={activeTab === 'requests' ? Package : ShoppingCart} title="No Records Matching Criteria" />
                        </td>
                    </tr>
                ) : (
                    data.map((item) => {
                        const currentStatus = activeTab === 'requests' ? formatStatus(item.status) : (item.status || 'PENDING');
                        return (
                            <tr key={item.id || item.order_id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors group">
                                <td className="p-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex-shrink-0 overflow-hidden border border-slate-200 dark:border-slate-700 flex items-center justify-center">
                                            {activeTab === 'requests' ? (
                                                item.image_url ? <img src={item.image_url} className="w-full h-full object-cover" alt="" /> : <ImageIcon className="text-slate-300" size={20} />
                                            ) : <ShoppingCart className="text-indigo-900" size={20} />}
                                        </div>
                                        <div>
                                            <p className="font-black text-slate-900 dark:text-white uppercase text-sm tracking-tight">{activeTab === 'requests' ? item.title : `Order #${item.id || item.order_id}`}</p>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{activeTab === 'requests' ? item.client_name : new Date(item.created_at).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-6">
                                        <span className="text-[10px] font-black bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg text-slate-500 uppercase tracking-widest">
                                            {activeTab === 'requests' ? 'Inventory Req' : (item.payment_method || 'Digital Pay')}
                                        </span>
                                </td>
                                <td className="p-6">
                                    <p className="font-black text-slate-900 dark:text-white">ETB {activeTab === 'requests' ? (Number(item.budget) || 0).toLocaleString() : (Number(item.total_amount) || 0).toLocaleString()}</p>
                                </td>
                                <td className="p-6"><StatusBadge status={currentStatus} /></td>
                                <td className="p-6 text-right">
                                    <div className="flex justify-end gap-2">
                                        <button onClick={() => onView(item)} className="p-3 bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-indigo-900 rounded-xl transition-all"><Eye size={18}/></button>
                                        {activeTab === 'requests' && currentStatus === 'PENDING' && (
                                            <button onClick={() => onVerify(item)} className="px-4 py-2 bg-indigo-900 text-white rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-black transition-all">Verify</button>
                                        )}
                                        {activeTab === 'orders' && currentStatus === 'PENDING' && (
                                            <button onClick={() => onConfirm(item)} className="px-4 py-2 bg-emerald-600 text-white rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-black transition-all">Confirm</button>
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