import React from "react";
import { X, Printer, FileText, CheckCircle2 } from "lucide-react";

const PrintCertificate = ({ data, activeTab, onClose }) => {
    if (!data) return null;

    return (
        <div id="print-portal" className="fixed inset-0 bg-white z-[99999] overflow-y-auto print:static">
            {/* UI Toolbar - Hidden during print */}
            <div className="no-print p-6 border-b bg-slate-50 flex justify-between items-center sticky top-0 shadow-sm">
                <div className="flex items-center gap-3">
                    <FileText className="text-indigo-900" />
                    <span className="text-[10px] font-black uppercase tracking-tighter">Document Engine</span>
                </div>
                <div className="flex gap-3">
                    <button onClick={onClose} className="px-6 py-2 rounded-xl text-[10px] font-black uppercase text-slate-400 hover:bg-slate-200">Close Preview</button>
                    <button onClick={() => window.print()} className="bg-indigo-900 text-white px-8 py-3 rounded-xl text-[10px] font-black uppercase flex items-center gap-2 shadow-xl hover:scale-105 transition-transform">
                        <Printer size={16}/> Confirm & Print
                    </button>
                </div>
            </div>

            {/* Official Document Layout */}
            <div className="p-16 print:p-0 bg-white">
                <div className="max-w-4xl mx-auto">
                    <table className="w-full">
                        <thead>
                        <tr>
                            <td>
                                <div className="border-b-4 border-indigo-900 pb-8 mb-10 flex justify-between items-start">
                                    <div>
                                        <h1 className="text-4xl font-black tracking-tighter text-indigo-900 uppercase">LEDGER HUB</h1>
                                        <p className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.3em] mt-3">Enterprise Asset Management</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] font-black uppercase text-slate-400 mb-1">Ref ID</p>
                                        <p className="text-lg font-black uppercase">#{data.id || data.order_id}</p>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase mt-2">{new Date().toLocaleDateString()}</p>
                                    </div>
                                </div>
                            </td>
                        </tr>
                        </thead>
                        <tbody>
                        <tr>
                            <td>
                                <h2 className="text-2xl font-black uppercase mb-12 border-l-8 border-indigo-900 pl-6 text-indigo-900">Official Record</h2>
                                <div className="grid grid-cols-2 gap-x-12 gap-y-10 mb-16">
                                    <DetailBlock label="Primary Entity" value={data.client_name || 'Internal'} />
                                    <DetailBlock label="Total Valuation" value={`ETB ${Number(data.budget || data.total_amount || 0).toLocaleString()}`} highlight />
                                    <DetailBlock label="Category" value={activeTab} uppercase />
                                    <DetailBlock label="Subject" value={data.title || 'General Movement'} />
                                </div>
                                <div className="mt-40 pt-12 border-t-2 border-slate-100 flex justify-between items-end">
                                    <div className="space-y-6">
                                        <div className="w-72 border-b-2 border-slate-900"></div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Authorized System Signature</p>
                                    </div>
                                    <div className="text-right text-emerald-600 font-black">
                                        <CheckCircle2 size={28} className="ml-auto mb-2" />
                                        <span className="text-[11px] uppercase tracking-tighter">Verified Record</span>
                                    </div>
                                </div>
                            </td>
                        </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

const DetailBlock = ({ label, value, highlight, uppercase }) => (
    <div className="page-break-avoid border-b border-slate-100 pb-6">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{label}</p>
        <p className={`font-bold text-xl ${highlight ? 'text-indigo-900 text-2xl' : 'text-slate-800'} ${uppercase ? 'uppercase' : ''}`}>
            {value}
        </p>
    </div>
);

export default PrintCertificate;