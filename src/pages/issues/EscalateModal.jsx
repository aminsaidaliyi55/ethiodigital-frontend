import React, { useState } from "react";
import { Upload, Loader2, X } from "lucide-react";
import issueService from "../../services/issueService";
import toast from "react-hot-toast";

const EscalateModal = ({ issueId, onClose, onSuccess }) => {
    const [reason, setReason] = useState("");
    const [selectedFile, setSelectedFile] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleEscalate = async () => {
        if (!reason.trim()) {
            return toast.error("Please provide a reason for escalation");
        }

        setLoading(true);
        try {
            const escalationData = {
                reason: reason,
                file: selectedFile
            };

            await issueService.escalateIssue(issueId, escalationData);
            toast.success(`Issue ${issueId} has been escalated to EAII`);
            onSuccess(); // Close modal and refresh list
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to escalate issue");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm">
            <div className="bg-white w-[750px] rounded-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
                {/* Modal Header */}
                <div className="bg-[#004A7C] p-5 text-white flex justify-between items-center">
                    <h2 className="font-black text-lg uppercase tracking-wide">Escalate Issue</h2>
                    <button onClick={onClose} className="hover:bg-white/10 p-1 rounded-full transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-8">
                    <div className="mb-8">
                        <p className="text-[#004A7C] font-black text-[15px] italic flex items-center gap-2">
                            <span className="w-2 h-2 bg-rose-500 rounded-full animate-pulse" />
                            The fix does not resolve the issue. Send back to developers for advanced debugging.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-8">
                        {/* Reason Input */}
                        <div className="space-y-3">
                            <p className="text-[#008DFF] text-[12px] font-black uppercase tracking-wider">
                                Reason for Escalate Issue <span className="text-rose-500">*</span>
                            </p>
                            <textarea
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                className="w-full h-44 border-2 border-slate-100 rounded-xl p-4 text-sm focus:outline-none focus:border-[#004A7C] focus:ring-4 focus:ring-blue-50 transition-all resize-none"
                                placeholder="Enter the reason for escalation including steps already taken..."
                            ></textarea>
                        </div>

                        {/* File Upload */}
                        <div className="space-y-3">
                            <p className="text-[#008DFF] text-[12px] font-black uppercase tracking-wider">
                                Supporting Document
                            </p>
                            <label className="border-2 border-dashed border-slate-200 rounded-xl h-44 flex flex-col items-center justify-center bg-slate-50 p-6 cursor-pointer hover:bg-blue-50/50 hover:border-blue-300 transition-all group">
                                <Upload className="text-[#008DFF] group-hover:-translate-y-1 transition-transform mb-3" size={36} />
                                <p className="text-sm font-bold text-slate-600 text-center">
                                    {selectedFile ? selectedFile.name : "Drag your file(s) or browse"}
                                </p>
                                <p className="text-[10px] text-slate-400 mt-2 uppercase font-bold tracking-tighter">
                                    PDF, PNG, JPG (MAX. 10MB)
                                </p>
                                <input
                                    type="file"
                                    className="hidden"
                                    onChange={(e) => setSelectedFile(e.target.files[0])}
                                />
                            </label>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-start gap-4 mt-10">
                        <button
                            disabled={loading}
                            onClick={onClose}
                            className="px-12 py-3 border-2 border-slate-100 rounded-xl text-[#004A7C] font-black uppercase text-xs hover:bg-slate-50 transition-all active:scale-95"
                        >
                            Cancel
                        </button>
                        <button
                            disabled={loading}
                            onClick={handleEscalate}
                            className="px-12 py-3 bg-[#004A7C] text-white rounded-xl font-black uppercase text-xs shadow-lg shadow-blue-900/30 hover:bg-[#00365c] transition-all active:scale-95 flex items-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <Loader2 size={16} className="animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                "Confirm Escalation"
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EscalateModal;