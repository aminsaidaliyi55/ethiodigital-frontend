import React, { useState } from "react";
import { X, Target, Upload, Loader2 } from "lucide-react";
import issueService from "../../services/issueService";
import EscalateModal from "./EscalateModal";
import toast from "react-hot-toast";

const AdminAction = ({ issue, onBack }) => {
    const [action, setAction] = useState("inprogress");
    const [loading, setLoading] = useState(false);
    const [resolutionDetail, setResolutionDetail] = useState("");
    const [selectedFile, setSelectedFile] = useState(null);
    const [showEscalate, setShowEscalate] = useState(false);

    const handleSubmit = async () => {
        setLoading(true);
        try {
            if (action === "inprogress") {
                await issueService.markInProgress(issue.id);
                toast.success("Issue marked as In Progress");
            } else if (action === "resolve") {
                if (!resolutionDetail) return toast.error("Please provide resolution details");
                await issueService.resolveIssue(issue.id, { detail: resolutionDetail, file: selectedFile });
                toast.success("Issue resolved successfully");
            } else if (action === "escalate") {
                // Logic change: Escalation now routes through the "New Issue" logic flow
                setShowEscalate(true);
                setLoading(false);
                return;
            }
            onBack();
        } catch (error) {
            toast.error(error.response?.data?.message || "Action failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-8 w-full bg-white min-h-screen relative">
            <button onClick={onBack} className="absolute right-8 top-8 text-slate-400 hover:text-rose-500 transition-colors">
                <X size={24} />
            </button>

            <h1 className="text-[#004A7C] text-2xl font-bold mb-2 capitalize">
                EAII Issue Management Action
            </h1>
            <p className="text-slate-400 text-sm mb-10">
                Reviewing Issue: <span className="text-[#004A7C] font-black">{issue.id}</span>
            </p>

            {/* Issue Info Grid */}
            <div className="grid grid-cols-4 gap-4 mb-6">
                <InfoCard label="System" value={issue.system || "N/A"} />
                <InfoCard label="Category" value={issue.category} />
                <InfoCard label="Reported By" value={issue.reportedBy || "IT Dept"} />
                <InfoCard label="Reported On" value={issue.reportedOn} />
            </div>

            <div className="bg-[#F8FAFC] p-4 rounded-lg border border-slate-100 mb-10">
                <p className="text-[#008DFF] text-[10px] font-bold uppercase mb-1">Description</p>
                <p className="text-[#004A7C] font-bold text-sm leading-relaxed">
                    {issue.description || "No description provided."}
                </p>
            </div>

            <div className="flex gap-10">
                <div className="flex-1">
                    <h3 className="text-[#004A7C] font-bold flex items-center gap-2 mb-6">
                        <Target size={18} className="text-rose-500" /> Select Action
                    </h3>

                    <div className="grid grid-cols-3 gap-4 mb-10">
                        <ActionCard
                            title="Mark as In-Progress"
                            desc="Start working on this issue. Status will update to 'In Progress'."
                            active={action === "inprogress"}
                            onClick={() => setAction("inprogress")}
                        />
                        <ActionCard
                            title="Resolve Issue"
                            desc="Issue is fixed. Provide resolution details to close the request."
                            active={action === "resolve"}
                            onClick={() => setAction("resolve")}
                        />
                        {/* Updated Escalated Logic to align with "New Issue" flow */}
                        <ActionCard
                            title="Escalate (New Issue)"
                            desc="Mark as a new technical requirement for EAII developers."
                            active={action === "escalate"}
                            onClick={() => setAction("escalate")}
                        />
                    </div>

                    <div className="flex justify-end gap-4">
                        <button
                            onClick={onBack}
                            className="px-10 py-2 border border-slate-200 rounded-md text-[#004A7C] font-bold uppercase text-xs hover:bg-slate-50 transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            disabled={loading}
                            onClick={handleSubmit}
                            className={`px-10 py-2 rounded-md font-bold uppercase text-xs flex items-center gap-2 transition-all shadow-md active:scale-95 ${
                                action === "escalate" ? "bg-[#004A7C] text-white" : "bg-[#004A7C] text-white"
                            }`}
                        >
                            {loading && <Loader2 size={14} className="animate-spin" />}
                            {action === "inprogress" ? "Start Working" : action === "resolve" ? "Submit Resolution" : "Next Step"}
                        </button>
                    </div>
                </div>

                {/* Sidebar - Resolution Inputs */}
                <div className="w-80 space-y-6">
                    <div className={`border border-slate-100 rounded-lg p-4 bg-white shadow-sm transition-all duration-300 ${action !== 'resolve' ? 'opacity-30 pointer-events-none grayscale' : 'opacity-100'}`}>
                        <p className="text-[#004A7C] font-bold text-sm mb-3">Resolution Detail</p>
                        <textarea
                            value={resolutionDetail}
                            onChange={(e) => setResolutionDetail(e.target.value)}
                            placeholder="Describe how the issue was fixed..."
                            className="w-full h-32 p-3 bg-slate-50 text-sm border border-slate-100 rounded focus:outline-none focus:ring-2 focus:ring-[#004A7C]/10"
                        ></textarea>
                    </div>

                    <div className={`border border-slate-100 rounded-lg p-4 bg-white shadow-sm transition-all duration-300 ${action !== 'resolve' ? 'opacity-30 pointer-events-none grayscale' : 'opacity-100'}`}>
                        <p className="text-[#004A7C] font-bold text-sm mb-3">Attachment</p>
                        <label className="border-2 border-dashed border-slate-200 rounded-lg p-6 flex flex-col items-center justify-center bg-slate-50 cursor-pointer hover:bg-slate-100 transition-colors">
                            <Upload className="text-[#008DFF] mb-2" size={24} />
                            <p className="text-xs text-slate-500 text-center font-medium">
                                {selectedFile ? selectedFile.name : "Click to upload proof of fix"}
                            </p>
                            <input
                                type="file"
                                className="hidden"
                                onChange={(e) => setSelectedFile(e.target.files[0])}
                            />
                        </label>
                    </div>
                </div>
            </div>

            {showEscalate && (
                <EscalateModal
                    issueId={issue.id}
                    onClose={() => setShowEscalate(false)}
                    onSuccess={() => {
                        setShowEscalate(false);
                        onBack();
                        toast.success("Issue successfully escalated to developers");
                    }}
                />
            )}
        </div>
    );
};

const InfoCard = ({ label, value }) => (
    <div className="bg-[#F8FAFC] p-4 rounded-lg border border-slate-100">
        <p className="text-[#008DFF] text-[10px] font-bold uppercase mb-1">{label}</p>
        <p className="text-[#004A7C] font-bold text-sm truncate" title={value}>{value}</p>
    </div>
);

const ActionCard = ({ title, desc, active, onClick }) => (
    <div
        onClick={onClick}
        className={`p-6 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
            active
                ? "border-[#004A7C] bg-blue-50/30 ring-4 ring-[#004A7C]/5"
                : "border-slate-50 bg-[#F8FAFC] hover:border-slate-200"
        }`}
    >
        <div className="flex items-center gap-3 mb-4">
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                active ? "border-[#004A7C]" : "border-slate-300"
            }`}>
                {active && <div className="w-2.5 h-2.5 bg-[#004A7C] rounded-full" />}
            </div>
            <h4 className={`font-black text-[14px] transition-colors ${
                active ? "text-[#004A7C]" : "text-slate-600"
            }`}>
                {title}
            </h4>
        </div>
        <p className={`text-[11px] leading-relaxed font-bold transition-colors ${
            active ? "text-[#004A7C]/70" : "text-slate-400"
        }`}>
            {desc}
        </p>
    </div>
);

export default AdminAction;