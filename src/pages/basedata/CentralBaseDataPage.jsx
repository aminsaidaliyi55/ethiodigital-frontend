import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    ChevronLeft,
    ChevronRight,
    X,
    MapPin,
    ShieldCheck,
    Zap,
    Users,
    Briefcase,
    Layers,
    FileText,
    Loader2,
    AlertCircle,
} from "lucide-react";

import {
    getBaseDataModules,
    updateBaseDataModule
} from "../../services/baseDataService";

const CentralBaseDataPage = () => {
    const navigate = useNavigate();
    const [modules, setModules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(5); // Set to match screenshot pagination

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedSystem, setSelectedSystem] = useState(null);
    const [editFormData, setEditFormData] = useState({
        name: "",
        organization: "",
        category: "",
        description: ""
    });

    useEffect(() => {
        fetchBaseData();
    }, [currentPage]);

    const fetchBaseData = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await getBaseDataModules(currentPage);
            if (response && response.success) {
                setModules(response.data);
                setTotalPages(response.totalPages || 5);
            } else {
                // Mock data strictly following the visual layout of the image
                setModules([
                    { id: 1, title: "Organization Management", description: "This is the place to Manage Organizations" },
                    { id: 2, title: "System Management", description: "Manage software systems and applications" },
                    { id: 3, title: "Issue Category Management", description: "Define issue types and assign to developer specializations" },
                    { id: 4, title: "Role Management", description: "Define and manage Roles Manage Roles" },
                    { id: 5, title: "Priority Management", description: "Define priority levels and response times" },
                    { id: 6, title: "User Type", description: "Define user Types" },
                    { id: 7, title: "Sub-Role Management", description: "Define and manage Sub role Roles Manage Roles" },
                    { id: 8, title: "Role Sub Role Management", description: "Define and manage Role sub role management" },
                    { id: 9, title: "User Type", description: "Define user Types" }
                ]);
            }
        } catch (err) {
            console.error("Fetch Error:", err);
            setError("System Sync Error: Unable to retrieve base data.");
        } finally {
            setLoading(false);
        }
    };

    const handleViewClick = (item) => {
        const title = item.title.toLowerCase();
        if (title.includes("organization")) {
            navigate("/base-data/organizations");
        } else if (title.includes("system")) {
            navigate("/base-data/systems");
        } else {
            handleOpenEdit(item);
        }
    };

    const handleOpenEdit = (module) => {
        setSelectedSystem(module);
        setEditFormData({
            name: module.title || "",
            organization: module.organization || "",
            category: module.category || "",
            description: module.description || ""
        });
        setIsEditModalOpen(true);
    };

    const handleUpdateSubmit = async (e) => {
        e.preventDefault();
        try {
            await updateBaseDataModule(selectedSystem.id || selectedSystem._id, editFormData);
            setIsEditModalOpen(false);
            fetchBaseData();
        } catch (err) {
            setError("Failed to update system data.");
        }
    };

    return (
        <div className="flex-1 bg-white min-h-screen font-sans p-12 max-w-[1600px] mx-auto text-left">
            {/* Breadcrumb/Title Area */}
            <div className="mb-10 border-b border-blue-100 pb-4">
                <h1 className="text-2xl font-semibold text-[#004A7C] mb-1">Base Data</h1>
                <p className="text-sm text-slate-400">
                    This is the Base Data of the <span className="font-medium">Central Admin</span>
                </p>
            </div>

            {error && (
                <div className="mb-10 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-4 text-red-600">
                    <AlertCircle size={20} className="shrink-0" />
                    <span className="text-sm font-medium">{error}</span>
                </div>
            )}

            {loading ? (
                <div className="flex flex-col items-center justify-center h-64">
                    <Loader2 className="animate-spin text-[#004A7C] mb-4" size={40} />
                    <p className="text-sm text-[#004A7C]">Fetching Live Data...</p>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {modules.map((item) => (
                            <div
                                key={item.id || item._id}
                                className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-all border border-slate-100 flex items-start gap-4"
                            >
                                <div className="p-3 bg-blue-50 text-[#004A7C] rounded-xl shrink-0">
                                    {getModuleIcon(item.title)}
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-[#004A7C] font-bold text-[15px] mb-1 tracking-tight">
                                        {item.title}
                                    </h3>
                                    <p className="text-[12px] text-slate-400 leading-snug mb-6 h-8 line-clamp-2">
                                        {item.description}
                                    </p>
                                    <div className="flex justify-end">
                                        <button
                                            onClick={() => handleViewClick(item)}
                                            className="bg-[#004A7C] text-white px-8 py-2 rounded-lg text-sm font-semibold hover:bg-[#002D5B] transition-all active:scale-95"
                                        >
                                            View
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Pagination - Matching Figma positioning */}
                    <div className="mt-16 flex justify-end items-center gap-2">
                        <button className="p-2 text-slate-400 hover:text-[#004A7C] transition-colors border border-slate-200 rounded-md">
                            <ChevronLeft size={18} />
                            <span className="sr-only">Back</span>
                        </button>
                        {[1, 2, 3, 4, 5].map((page) => (
                            <button
                                key={page}
                                onClick={() => setCurrentPage(page)}
                                className={`w-10 h-10 rounded-md text-sm font-bold transition-all ${
                                    currentPage === page
                                        ? "bg-[#004A7C] text-white"
                                        : "bg-white text-slate-400 border border-slate-200 hover:border-[#004A7C]"
                                }`}
                            >
                                {page}
                            </button>
                        ))}
                        <button className="p-2 text-slate-400 hover:text-[#004A7C] transition-colors border border-slate-200 rounded-md flex items-center gap-1 text-sm font-medium">
                            Next <ChevronRight size={18} />
                        </button>
                    </div>
                </>
            )}

            {/* Edit/View Modal */}
            {isEditModalOpen && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#001D3D]/60 backdrop-blur-md p-4 overflow-y-auto">
                    <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl relative animate-in fade-in zoom-in duration-300 my-auto">
                        <button
                            onClick={() => setIsEditModalOpen(false)}
                            className="absolute right-8 top-8 text-slate-400 hover:text-red-500 transition-colors p-1"
                        >
                            <X size={24} />
                        </button>

                        <form onSubmit={handleUpdateSubmit} className="p-10">
                            <div className="mb-10 text-left">
                                <h2 className="text-[#004A7C] font-bold text-2xl tracking-tight">Edit Module Details</h2>
                                <div className="h-1 w-12 bg-[#004A7C] mt-2 rounded-full" />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12 text-left">
                                <div className="space-y-3">
                                    <label className="text-[#004A7C] text-[12px] font-semibold ml-1">Module Name</label>
                                    <input
                                        type="text"
                                        value={editFormData.name}
                                        onChange={(e) => setEditFormData({...editFormData, name: e.target.value})}
                                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-[13px] focus:ring-4 focus:ring-[#004A7C]/5 focus:border-[#004A7C]/20 outline-none transition-all"
                                    />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[#004A7C] text-[12px] font-semibold ml-1">Category</label>
                                    <input
                                        type="text"
                                        value={editFormData.category}
                                        onChange={(e) => setEditFormData({...editFormData, category: e.target.value})}
                                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-[13px] focus:ring-4 focus:ring-[#004A7C]/5 focus:border-[#004A7C]/20 outline-none transition-all"
                                    />
                                </div>
                                <div className="md:col-span-2 space-y-3">
                                    <label className="text-[#004A7C] text-[12px] font-semibold ml-1">Description</label>
                                    <textarea
                                        rows={4}
                                        value={editFormData.description}
                                        onChange={(e) => setEditFormData({...editFormData, description: e.target.value})}
                                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-[13px] focus:ring-4 focus:ring-[#004A7C]/5 focus:border-[#004A7C]/20 outline-none resize-none transition-all"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-8 border-t border-slate-50">
                                <button
                                    type="button"
                                    onClick={() => setIsEditModalOpen(false)}
                                    className="px-12 py-3.5 border-2 border-slate-100 text-[#004A7C] text-[13px] font-semibold rounded-xl hover:bg-slate-50 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-12 py-3.5 bg-[#004A7C] text-white text-[13px] font-semibold rounded-xl hover:bg-[#002D5B] transition-all shadow-xl shadow-[#004A7C]/20"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

const getModuleIcon = (title = "") => {
    const t = title.toLowerCase();
    // Using MapPin to match the specific "Location/Pin" icon used in the Figma screenshot
    return <MapPin size={22} />;
};

export default CentralBaseDataPage;