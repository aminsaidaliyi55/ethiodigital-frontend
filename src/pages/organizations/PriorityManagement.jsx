import React, { useState, useEffect } from "react";
import {
    Search,
    Plus,
    Pencil,
    Trash2,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    Loader2,
    X
} from "lucide-react";
import {
    getPriorities,
    createPriority,
    updatePriority,
    deletePriority
} from "../../services/baseDataService";

const PriorityManagement = () => {
    const [priorities, setPriorities] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [currentPriority, setCurrentPriority] = useState({
        priorityName: "",
        responseTime: "",
        description: ""
    });

    useEffect(() => {
        fetchData();
    }, [searchTerm]);

    const fetchData = async () => {
        try {
            setIsLoading(true);
            const response = await getPriorities(searchTerm);
            if (response.success) setPriorities(response.data);
        } catch (error) {
            console.error("Error", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpenAddModal = () => {
        setIsEditMode(false);
        setCurrentPriority({ priorityName: "", responseTime: "", description: "" });
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isEditMode) await updatePriority(currentPriority.id, currentPriority);
            else await createPriority(currentPriority);
            setIsModalOpen(false);
            fetchData();
        } catch (error) {
            console.error("Failed", error);
        }
    };

    return (
        <div className="p-10 bg-[#F0F7FF] min-h-screen font-sans text-left">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
                <div>
                    <h1 className="text-xl font-bold text-[#004A7C] tracking-tight mb-1">Priority Management</h1>
                    <p className="text-sm text-blue-300 font-medium tracking-tight">Define priority levels and response times</p>
                </div>
                <div className="flex flex-wrap items-center gap-4">
                    <div className="relative w-64">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                        <input type="text" placeholder="Search for Organization" className="w-full pl-12 pr-4 py-2.5 bg-white border border-slate-100 rounded-xl text-[13px] focus:outline-none shadow-sm" />
                    </div>
                    <div className="relative">
                        <select className="appearance-none bg-white border border-slate-100 rounded-xl px-6 py-2.5 pr-12 text-[13px] text-slate-500 font-medium focus:outline-none shadow-sm cursor-pointer">
                            <option>User Name</option>
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                    </div>
                    <button onClick={handleOpenAddModal} className="flex items-center gap-2 bg-[#004A7C] text-white px-6 py-2.5 rounded-xl text-[13px] font-bold shadow-md hover:bg-[#00355E] transition-all">
                        <Plus size={18} className="border-2 border-white rounded-full p-0.5" strokeWidth={3} />
                        Add Priority
                    </button>
                </div>
            </div>

            {/* Table Section */}
            <div className="bg-white rounded-[2rem] shadow-sm border border-slate-50 overflow-hidden p-6">
                <table className="w-full text-left border-separate border-spacing-y-4">
                    <thead>
                    <tr className="bg-[#004A7C] text-white">
                        <th className="py-4 px-8 text-[13px] font-semibold first:rounded-l-2xl">Priority Id</th>
                        <th className="py-4 px-6 text-[13px] font-semibold">Priority Name</th>
                        <th className="py-4 px-6 text-[13px] font-semibold">Created at</th>
                        <th className="py-4 px-6 text-[13px] font-semibold">Status</th>
                        <th className="py-4 px-8 text-[13px] font-semibold text-right last:rounded-r-2xl">Action</th>
                    </tr>
                    </thead>
                    <tbody>
                    {isLoading ? (
                        <tr><td colSpan="5" className="py-20 text-center"><Loader2 className="animate-spin mx-auto text-[#004A7C]" /></td></tr>
                    ) : (
                        priorities.map((item) => (
                            <tr key={item.id} className="bg-slate-50/30 hover:bg-slate-50 transition-colors group">
                                <td className="py-5 px-8 first:rounded-l-2xl text-[#004A7C] font-bold text-[13px]">{item.priorityId || "PR_001"}</td>
                                <td className="py-5 px-6 text-[#004A7C] text-[13px] font-medium">{item.priorityName || "High"}</td>
                                <td className="py-5 px-6 text-[#004A7C] text-[13px] font-medium">{item.createdAt || "10/05/2025"}</td>
                                <td className="py-5 px-6"><span className="bg-[#41B34A] text-white px-5 py-1 rounded-full text-[11px] font-bold">Active</span></td>
                                <td className="py-5 px-8 text-right last:rounded-r-2xl">
                                    <div className="flex justify-end gap-4 text-[#004A7C]">
                                        <Pencil size={18} className="cursor-pointer hover:scale-110 transition-transform" onClick={() => { setIsEditMode(true); setCurrentPriority(item); setIsModalOpen(true); }} />
                                        <Trash2 size={18} className="text-red-500 cursor-pointer hover:scale-110 transition-transform" onClick={() => deletePriority(item.id)} />
                                    </div>
                                </td>
                            </tr>
                        ))
                    )}
                    </tbody>
                </table>
            </div>

            {/* --- EXACT MODAL IMPLEMENTATION --- */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#001D3D]/60 backdrop-blur-md p-4 overflow-y-auto">
                    <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl relative animate-in fade-in zoom-in duration-300 my-auto">

                        {/* Circular Close Button (from image_3d5ba5/3dc0a4) */}
                        <button
                            onClick={() => setIsModalOpen(false)}
                            className="absolute right-8 top-8 text-[#004A7C] border-2 border-[#004A7C] rounded-full p-0.5 hover:text-red-500 hover:border-red-500 transition-colors"
                        >
                            <X size={20} strokeWidth={3} />
                        </button>

                        <form onSubmit={handleSubmit} className="p-10 text-left">
                            {/* Modal Header */}
                            <div className="mb-10">
                                <h2 className="text-[#004A7C] font-bold text-xl tracking-tight">
                                    {isEditMode ? "Edit Priority" : "Add New priority level"}
                                </h2>
                                {/* Subtitle - Exactly as shown in Edit modal image */}
                                {isEditMode && (
                                    <p className="text-[13px] text-blue-300 font-medium mt-1">
                                        Update priority details
                                    </p>
                                )}
                            </div>

                            {/* Form Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                                {/* Priority Name Input */}
                                <div className="space-y-3">
                                    <label className="text-[#004A7C] text-[13px] font-bold ml-1">Priority Name</label>
                                    <input
                                        type="text"
                                        placeholder={isEditMode ? "High" : "Enter Priority name"}
                                        value={currentPriority.priorityName}
                                        onChange={(e) => setCurrentPriority({...currentPriority, priorityName: e.target.value})}
                                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-[13px] text-[#004A7C] focus:ring-4 focus:ring-[#004A7C]/5 outline-none transition-all placeholder:text-slate-300"
                                        required
                                    />
                                </div>

                                {/* Response Time Input */}
                                <div className="space-y-3">
                                    <label className="text-[#004A7C] text-[13px] font-bold ml-1">Response Time</label>
                                    <input
                                        type="text"
                                        placeholder={isEditMode ? "5 Days" : "days in number"}
                                        value={currentPriority.responseTime}
                                        onChange={(e) => setCurrentPriority({...currentPriority, responseTime: e.target.value})}
                                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-[13px] text-[#004A7C] focus:ring-4 focus:ring-[#004A7C]/5 outline-none transition-all placeholder:text-slate-300"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Description Textarea */}
                            <div className="space-y-3 mb-12">
                                <label className="text-[#004A7C] text-[13px] font-bold ml-1">Description</label>
                                <textarea
                                    rows={4}
                                    placeholder="if any description..."
                                    value={currentPriority.description}
                                    onChange={(e) => setCurrentPriority({...currentPriority, description: e.target.value})}
                                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-[13px] text-[#004A7C] focus:ring-4 focus:ring-[#004A7C]/5 outline-none resize-none transition-all placeholder:text-slate-300"
                                />
                            </div>

                            {/* Modal Actions */}
                            <div className="flex items-center justify-between pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-12 py-3.5 border-2 border-slate-100 text-[#004A7C] text-[14px] font-bold rounded-xl hover:bg-slate-50 transition-all active:scale-95"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-12 py-3.5 bg-[#004A7C] text-white text-[14px] font-bold rounded-xl hover:bg-[#002D5B] transition-all shadow-xl shadow-[#004A7C]/20 active:scale-95"
                                >
                                    {isEditMode ? "Save Changes" : "Create"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PriorityManagement;