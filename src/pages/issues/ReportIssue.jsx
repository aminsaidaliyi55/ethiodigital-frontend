import React, { useState } from "react";
import { Upload, X, Video, ChevronDown, Calendar, Loader2, CheckSquare } from "lucide-react";
import issueService from "../../services/issueService";
import toast from "react-hot-toast";
import VideoCallModal from "./VideoCallModal";

const ReportIssue = ({ onBack, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [isVideoCallActive, setIsVideoCallActive] = useState(false);

    const [formData, setFormData] = useState({
        category: "",
        priority: "",
        occurrenceDate: "",
        url: "",
        actionsTaken: "",
        description: "",
        documents: null
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.category || !formData.description) {
            return toast.error("Please fill required fields (Category and Description)");
        }

        setLoading(true);
        try {
            await issueService.createIssue(formData);
            toast.success("Issue reported successfully!");
            onSuccess();
        } catch (error) {
            toast.error(error.response?.data?.message || "Submission failed");
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData({ ...formData, documents: file });
        }
    };

    return (
        <div className="p-8 bg-[#F8FAFC] min-h-screen relative font-sans">
            {/* Header */}
            <div className="flex justify-between items-start mb-8">
                <div>
                    <h1 className="text-[#004A7C] text-2xl font-black tracking-tight">Report New Issue</h1>
                    <p className="text-slate-400 text-sm font-medium">Submit a detailed report of the issue affecting your system</p>
                </div>
                <button
                    onClick={onBack}
                    className="p-2 bg-white rounded-full text-slate-400 hover:text-rose-500 shadow-sm border border-slate-100 transition-all"
                >
                    <X size={20} />
                </button>
            </div>

            <div className="flex gap-8">
                {/* Form Section */}
                <div className="flex-[2.5] bg-white p-10 rounded-3xl shadow-sm border border-slate-100">
                    <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-x-8 gap-y-6">

                        {/* Issue Category */}
                        <div className="space-y-2">
                            <label className="text-[#004A7C] font-black text-[11px] uppercase tracking-wider">Issue Category *</label>
                            <div className="relative">
                                <select
                                    className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs appearance-none outline-none focus:ring-2 focus:ring-blue-400/20 transition-all"
                                    value={formData.category}
                                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                                >
                                    <option value="">select the issue category</option>
                                    <option value="Security">Security</option>
                                    <option value="Database">Database</option>
                                    <option value="UI/UX">UI/UX</option>
                                    <option value="Network">Network</option>
                                </select>
                                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            </div>
                        </div>

                        {/* Select Priority */}
                        <div className="space-y-2">
                            <label className="text-[#004A7C] font-black text-[11px] uppercase tracking-wider">Select Priority</label>
                            <div className="relative">
                                <select
                                    className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs appearance-none outline-none focus:ring-2 focus:ring-blue-400/20 transition-all"
                                    value={formData.priority}
                                    onChange={(e) => setFormData({...formData, priority: e.target.value})}
                                >
                                    <option value="">enter the affected system name</option>
                                    <option value="Critical">Critical</option>
                                    <option value="High">High</option>
                                    <option value="Medium">Medium</option>
                                    <option value="Low">Low</option>
                                </select>
                                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            </div>
                        </div>

                        {/* Occurrence Date */}
                        <div className="space-y-2">
                            <label className="text-[#004A7C] font-black text-[11px] uppercase tracking-wider">When did issue occur?</label>
                            <div className="relative">
                                <input
                                    type="datetime-local"
                                    className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-400/20 transition-all"
                                    onChange={(e) => setFormData({...formData, occurrenceDate: e.target.value})}
                                />
                                <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" size={16} />
                            </div>
                        </div>

                        {/* URL */}
                        <div className="space-y-2">
                            <label className="text-[#004A7C] font-black text-[11px] uppercase tracking-wider">Add URL</label>
                            <input
                                type="text"
                                placeholder="Enter the Action Taken by your Team"
                                className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-400/20 transition-all"
                                onChange={(e) => setFormData({...formData, url: e.target.value})}
                            />
                        </div>

                        {/* Actions Taken */}
                        <div className="space-y-2">
                            <label className="text-[#004A7C] font-black text-[11px] uppercase tracking-wider">Actions Taken</label>
                            <textarea
                                placeholder="if any action taken to resolve issue"
                                className="w-full h-24 p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-400/20 transition-all resize-none"
                                onChange={(e) => setFormData({...formData, actionsTaken: e.target.value})}
                            />
                        </div>

                        {/* File Upload Area */}
                        <div className="space-y-2">
                            <label className="text-[#004A7C] font-black text-[11px] uppercase tracking-wider">Documents Attached</label>
                            <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-blue-200 rounded-xl bg-slate-50 hover:bg-blue-50/50 cursor-pointer transition-all group">
                                <div className="flex flex-col items-center justify-center pt-2">
                                    <Upload size={20} className="text-slate-400 group-hover:text-[#004A7C] mb-2" />
                                    <p className="text-[10px] text-slate-400 font-bold">
                                        {formData.documents ? formData.documents.name : "Document Attachment (PDF, JPG, PNG)"}
                                    </p>
                                </div>
                                <input type="file" className="hidden" onChange={handleFileChange} />
                            </label>
                        </div>

                        {/* Issue Description */}
                        <div className="col-span-1 space-y-2">
                            <label className="text-[#004A7C] font-black text-[11px] uppercase tracking-wider">Issue Description</label>
                            <textarea
                                placeholder="Short description of the main problem"
                                className="w-full h-24 p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-400/20 transition-all resize-none"
                                onChange={(e) => setFormData({...formData, description: e.target.value})}
                            />
                        </div>

                        {/* Form Actions */}
                        <div className="col-span-2 flex items-center justify-center gap-4 mt-8">
                            <button
                                type="submit"
                                disabled={loading}
                                className="bg-[#004A7C] text-white px-10 py-3.5 rounded-xl font-black text-xs uppercase shadow-lg shadow-blue-900/20 hover:bg-[#00365c] active:scale-95 transition-all flex items-center gap-2"
                            >
                                {loading ? <Loader2 className="animate-spin" size={16} /> : "Submit Issue"}
                            </button>
                            <button
                                type="button"
                                className="px-10 py-3.5 border border-slate-300 rounded-xl text-slate-500 font-black text-xs uppercase hover:bg-slate-50 transition-all"
                            >
                                Save Draft
                            </button>
                            <button
                                type="button"
                                onClick={() => setFormData({category: "", priority: "", occurrenceDate: "", url: "", actionsTaken: "", description: "", documents: null})}
                                className="px-10 py-3.5 border border-slate-300 rounded-xl text-slate-500 font-black text-xs uppercase hover:bg-slate-50 transition-all"
                            >
                                Reset Form
                            </button>
                        </div>
                    </form>
                </div>

                {/* Sidebar Section */}
                <div className="flex-1 space-y-6">
                    {/* Guidelines Card */}
                    <div className="bg-[#EBF5FF]/50 p-8 rounded-3xl border border-blue-100/50">
                        <h3 className="text-[#004A7C] font-black text-sm mb-2">Issue Reporting Guidelines</h3>
                        <p className="text-[10px] text-blue-800/60 mb-8 font-bold leading-relaxed">Please follow these guidelines to ensure your issue is addressed quickly and effectively</p>

                        <div className="space-y-6">
                            <GuidelineItem
                                title="Be Specific:"
                                desc="Clearly describe what went wrong, when it happened, and what you were trying to do."
                            />
                            <GuidelineItem
                                title="Include Details:"
                                desc="Provide error messages, browser/device information, and steps to reproduce the issue."
                            />
                            <GuidelineItem
                                title="Attach Evidence:"
                                desc="Screenshots, screen recordings, or log files help our team understand the problem faster."
                            />
                            <GuidelineItem
                                title="Set Correct Severity:"
                                desc="Critical – system down, High – major functionality broken, Medium – partial functionality affected, Low – minor inconvenience"
                            />
                        </div>
                    </div>

                    {/* Quick Action Card */}
                    <div className="bg-[#004A7C] p-6 rounded-2xl shadow-xl shadow-blue-900/10">
                        <h4 className="text-white text-xs font-black mb-4 uppercase tracking-widest">Quick Actions</h4>
                        <button
                            type="button"
                            onClick={() => setIsVideoCallActive(true)}
                            className="w-full bg-white text-[#004A7C] py-4 rounded-xl font-black text-[11px] uppercase tracking-widest flex items-center justify-center gap-3 shadow-lg hover:bg-blue-50 transition-all active:scale-95 border border-white"
                        >
                            <Video size={18} className="text-[#004A7C]" /> Start Video Call
                        </button>
                    </div>
                </div>
            </div>

            {/* Video Call Modal */}
            {isVideoCallActive && (
                <VideoCallModal
                    onClose={() => setIsVideoCallActive(false)}
                    issueId="PENDING-NEW"
                />
            )}
        </div>
    );
};

const GuidelineItem = ({ title, desc }) => (
    <div className="flex gap-4 group">
        <div className="mt-0.5">
            <CheckSquare size={16} className="text-[#004A7C]" />
        </div>
        <div>
            <p className="text-[#004A7C] font-black text-[11px] mb-1">{title}</p>
            <p className="text-slate-500 text-[10px] font-bold leading-normal">{desc}</p>
        </div>
    </div>
);

export default ReportIssue;