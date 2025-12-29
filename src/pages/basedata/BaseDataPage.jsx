import React, { useState, useEffect } from "react";
import {
    ChevronLeft,
    ChevronRight,
    Loader2,
    AlertCircle,
    DatabaseZap,
    Eye,
    Pencil,
    Trash2,
    Plus,
    Search,
    X,
    Briefcase,
    Settings2
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

/**
 * ✅ Base Data Management Hub
 * Features: Backend integration, Add/Edit Organization Modals, Add Project Modal, and Edit Project Modal.
 */
export default function BaseDataPage() {
    const navigate = useNavigate();
    const [modules, setModules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [searchQuery, setSearchQuery] = useState("");

    // Modal States
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
    const [isEditProjectModalOpen, setIsEditProjectModalOpen] = useState(false);

    const [selectedModule, setSelectedModule] = useState(null);
    const [formData, setFormData] = useState({ name: "", description: "" });
    const [projectFormData, setProjectFormData] = useState({ projectName: "", projectCode: "" });
    const [editProjectData, setEditProjectData] = useState({
        name: "",
        organization: "",
        category: "",
        description: ""
    });

    const API_URL = "http://your-backend-api.com/api/base-data-modules";

    useEffect(() => {
        const fetchBaseData = async () => {
            setLoading(true);
            setError(null);
            try {
                const storedData = JSON.parse(localStorage.getItem("user") || "{}");
                const token = storedData.token;

                const response = await axios.get(API_URL, {
                    params: {
                        page: currentPage,
                        limit: 10,
                        search: searchQuery
                    },
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                if (response.data) {
                    setModules(response.data.data || []);
                    setTotalPages(response.data.totalPages || 1);
                }
            } catch (err) {
                console.error("Backend fetch error:", err);
                setError("Failed to sync with server. Check your connection or login status.");
                setModules([]);
            } finally {
                setLoading(false);
            }
        };

        fetchBaseData();
    }, [currentPage, searchQuery]);

    const handleEditClick = (module) => {
        setSelectedModule(module);
        // If it's a "System/Project" edit (based on your screenshot)
        setEditProjectData({
            name: module.title || "",
            organization: module.organization || "",
            category: module.category || "",
            description: module.desc || ""
        });
        setIsEditProjectModalOpen(true);
    };

    const handleAddProjectClick = (module) => {
        setSelectedModule(module);
        setProjectFormData({ projectName: "", projectCode: "" });
        setIsProjectModalOpen(true);
    };

    const handleActionSubmit = async (e, type) => {
        e.preventDefault();
        let submissionData;
        if (type === 'Project') submissionData = projectFormData;
        else if (type === 'EditProject') submissionData = editProjectData;
        else submissionData = formData;

        console.log(`${type} submitting:`, submissionData);

        setIsAddModalOpen(false);
        setIsEditModalOpen(false);
        setIsProjectModalOpen(false);
        setIsEditProjectModalOpen(false);
        setFormData({ name: "", description: "" });
    };

    if (loading) return <LoadingState />;

    return (
        <div className="flex-1 bg-[#F8FAFC] min-h-screen p-8 font-sans relative">
            <div className="max-w-7xl mx-auto">
                {/* --- HEADER --- */}
                <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-black text-[#002D5B] mb-1">Base Data</h1>
                        <p className="text-[11px] font-bold text-slate-400 capitalize tracking-tight">
                            This is the base data of the <span className="text-[#004A7C]">Super professional</span>
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                            <input
                                type="text"
                                placeholder="Search for system"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 pr-4 py-2 bg-white border border-slate-100 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-50 w-64 shadow-sm"
                            />
                        </div>

                        <button
                            onClick={() => setIsAddModalOpen(true)}
                            className="flex items-center gap-2 bg-[#004A7C] text-white px-4 py-2 rounded-lg text-xs font-bold capitalize hover:bg-[#002D5B] transition-all shadow-md active:scale-95"
                        >
                            <Plus size={16} />
                            Add system
                        </button>
                    </div>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-600 animate-in fade-in slide-in-from-top-2">
                        <AlertCircle size={18} className="shrink-0" />
                        <span className="text-[10px] font-black capitalize tracking-wider">{error}</span>
                    </div>
                )}

                {/* --- DATA TABLE --- */}
                <div className="bg-white rounded-[1.5rem] shadow-sm border border-slate-50 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                            <tr className="bg-[#004A7C] text-white">
                                <th className="px-6 py-4 text-[11px] font-black capitalize tracking-wider">System ID</th>
                                <th className="px-6 py-4 text-[11px] font-black capitalize tracking-wider">System name</th>
                                <th className="px-6 py-4 text-[11px] font-black capitalize tracking-wider">Organization</th>
                                <th className="px-6 py-4 text-[11px] font-black capitalize tracking-wider">Contact phone</th>
                                <th className="px-6 py-4 text-[11px] font-black capitalize tracking-wider text-center">Status</th>
                                <th className="px-6 py-4 text-[11px] font-black capitalize tracking-wider text-center">Action</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                            {modules.length > 0 ? (
                                modules.map((module, idx) => (
                                    <tr key={idx} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-6 py-5 text-[11px] font-bold text-slate-500 italic">
                                            {module.id || `MoFA - 000${idx + 1}`}
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="text-[11px] font-black text-[#004A7C] capitalize">
                                                {module.title}
                                            </div>
                                            <div className="text-[9px] text-slate-400 font-bold">Web App</div>
                                        </td>
                                        <td className="px-6 py-5 text-[11px] font-bold text-[#004A7C] capitalize">
                                            {module.organization || "Ministry of foreign affairs"}
                                        </td>
                                        <td className="px-6 py-5 text-[11px] font-bold text-slate-500">
                                            +251-xx-xxx-xxxx
                                        </td>
                                        <td className="px-6 py-5 text-center">
                                                <span className="bg-green-500 text-white px-4 py-1 rounded-full text-[9px] font-black capitalize shadow-sm">
                                                    Active
                                                </span>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    onClick={() => handleAddProjectClick(module)}
                                                    title="Add Project"
                                                    className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors"
                                                >
                                                    <Plus size={16} />
                                                </button>
                                                <button onClick={() => navigate(module.link)} className="p-1.5 text-[#004A7C] hover:bg-blue-50 rounded-md transition-colors">
                                                    <Eye size={16} />
                                                </button>
                                                <button onClick={() => handleEditClick(module)} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-md transition-colors">
                                                    <Pencil size={16} />
                                                </button>
                                                <button className="p-1.5 text-red-500 hover:bg-red-50 rounded-md transition-colors">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="py-20 text-center">
                                        {!error && <EmptyState />}
                                    </td>
                                </tr>
                            )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* --- PAGINATION --- */}
                {modules.length > 0 && (
                    <div className="flex justify-end items-center gap-2 mt-6 pb-10">
                        <button
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(prev => prev - 1)}
                            className="p-2 text-slate-300 hover:text-[#004A7C] disabled:opacity-20 flex items-center gap-1 text-[10px] font-bold capitalize"
                        >
                            <ChevronLeft size={14} /> Back
                        </button>

                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
                            <button
                                key={num}
                                onClick={() => setCurrentPage(num)}
                                className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold transition-all ${
                                    num === currentPage
                                        ? "bg-[#002D5B] text-white shadow-md"
                                        : "bg-white text-slate-400 border border-slate-100"
                                }`}
                            >
                                {num}
                            </button>
                        ))}

                        <button
                            disabled={currentPage === totalPages}
                            onClick={() => setCurrentPage(prev => prev + 1)}
                            className="p-2 text-slate-300 hover:text-[#004A7C] disabled:opacity-20 flex items-center gap-1 text-[10px] font-bold capitalize"
                        >
                            Next <ChevronRight size={14} />
                        </button>
                    </div>
                )}
            </div>

            {/* --- ADD/EDIT ORGANIZATION MODAL --- */}
            {(isAddModalOpen || isEditModalOpen) && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/20 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-2xl rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="px-8 pt-8 pb-4 flex items-center justify-between">
                            <h2 className="text-[#004A7C] font-black text-lg tracking-tight capitalize">
                                {isEditModalOpen ? "Edit organization info" : "Add new organization/institution"}
                            </h2>
                            <button
                                onClick={() => { setIsAddModalOpen(false); setIsEditModalOpen(false); }}
                                className="p-2 bg-blue-50 text-[#004A7C] rounded-full hover:bg-blue-100 transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={(e) => handleActionSubmit(e, isEditModalOpen ? "Edit" : "Create")} className="px-8 pb-10">
                            <div className="flex flex-col md:flex-row gap-6 mb-10">
                                <div className="flex-1">
                                    <label className="block text-[#004A7C] text-[11px] font-black capitalize mb-2 tracking-wide">
                                        Organization/institution name
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Enter organization name"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                                        className="w-full px-4 py-3 bg-[#F8FAFC] border border-slate-100 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all placeholder:text-slate-300 capitalize"
                                    />
                                </div>

                                <div className="flex-1">
                                    <label className="block text-[#004A7C] text-[11px] font-black capitalize mb-2 tracking-wide">
                                        Description
                                    </label>
                                    <textarea
                                        placeholder="any description..."
                                        rows={4}
                                        value={formData.description}
                                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                                        className="w-full px-4 py-3 bg-[#F8FAFC] border border-slate-100 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all placeholder:text-slate-300 resize-none capitalize"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-center gap-4">
                                <button
                                    type="button"
                                    onClick={() => { setIsAddModalOpen(false); setIsEditModalOpen(false); }}
                                    className="px-10 py-2.5 border-2 border-slate-100 text-[#004A7C] text-[11px] font-black capitalize rounded-xl hover:bg-slate-50 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-10 py-2.5 bg-[#004A7C] text-white text-[11px] font-black capitalize rounded-xl hover:bg-[#002D5B] transition-all shadow-lg shadow-blue-900/20"
                                >
                                    {isEditModalOpen ? "Update organization" : "Create organization"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* --- ADD PROJECT MODAL --- */}
            {isProjectModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/20 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-xl rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="px-8 pt-8 pb-4 flex items-center justify-between border-b border-slate-50">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                                    <Briefcase size={20} />
                                </div>
                                <div>
                                    <h2 className="text-[#004A7C] font-black text-lg tracking-tight capitalize leading-none mb-1">
                                        Add new project
                                    </h2>
                                    <p className="text-[10px] font-bold text-slate-400 capitalize">
                                        Assigning to: <span className="text-[#004A7C]">{selectedModule?.title}</span>
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsProjectModalOpen(false)}
                                className="p-2 bg-slate-50 text-slate-400 rounded-full hover:bg-slate-100 transition-colors"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={(e) => handleActionSubmit(e, "Project")} className="p-8">
                            <div className="space-y-5 mb-8">
                                <div>
                                    <label className="block text-[#004A7C] text-[11px] font-black capitalize mb-2 tracking-wide">
                                        Project name
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Enter project name"
                                        required
                                        value={projectFormData.projectName}
                                        onChange={(e) => setProjectFormData({...projectFormData, projectName: e.target.value})}
                                        className="w-full px-4 py-3 bg-[#F8FAFC] border border-slate-100 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all capitalize"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[#004A7C] text-[11px] font-black capitalize mb-2 tracking-wide">
                                        Project code/ID
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="e.g. PRJ-2026-01"
                                        required
                                        value={projectFormData.projectCode}
                                        onChange={(e) => setProjectFormData({...projectFormData, projectCode: e.target.value})}
                                        className="w-full px-4 py-3 bg-[#F8FAFC] border border-slate-100 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all uppercase"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsProjectModalOpen(false)}
                                    className="px-6 py-2.5 text-slate-400 text-[11px] font-black capitalize hover:text-[#004A7C] transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-8 py-2.5 bg-emerald-600 text-white text-[11px] font-black capitalize rounded-xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-900/10"
                                >
                                    Assign project
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* --- EDIT SYSTEM/PROJECT MODAL (MATCHING SCREENSHOT) --- */}
            {isEditProjectModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/20 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-2xl rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="px-8 pt-8 pb-4 flex items-center justify-between border-b border-slate-50">
                            <h2 className="text-[#004A7C] font-black text-lg tracking-tight capitalize">
                                Edit system/project
                            </h2>
                            <button
                                onClick={() => setIsEditProjectModalOpen(false)}
                                className="p-2 bg-slate-50 text-[#004A7C] rounded-full hover:bg-blue-50 transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={(e) => handleActionSubmit(e, "EditProject")} className="p-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                <div>
                                    <label className="block text-[#004A7C] text-[11px] font-black capitalize mb-2">System/project name</label>
                                    <input
                                        type="text"
                                        placeholder="system name"
                                        value={editProjectData.name}
                                        onChange={(e) => setEditProjectData({...editProjectData, name: e.target.value})}
                                        className="w-full px-4 py-3 bg-[#F8FAFC] border border-slate-100 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-100 capitalize"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[#004A7C] text-[11px] font-black capitalize mb-2">Select organization</label>
                                    <select
                                        value={editProjectData.organization}
                                        onChange={(e) => setEditProjectData({...editProjectData, organization: e.target.value})}
                                        className="w-full px-4 py-3 bg-[#F8FAFC] border border-slate-100 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-100 capitalize text-slate-500"
                                    >
                                        <option value="">select client/organization</option>
                                        <option value="MoFA">Ministry of foreign affairs</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[#004A7C] text-[11px] font-black capitalize mb-2">Select issue category</label>
                                    <select
                                        value={editProjectData.category}
                                        onChange={(e) => setEditProjectData({...editProjectData, category: e.target.value})}
                                        className="w-full px-4 py-3 bg-[#F8FAFC] border border-slate-100 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-100 capitalize text-slate-500"
                                    >
                                        <option value="">select system category</option>
                                        <option value="Web App">Web app</option>
                                        <option value="Mobile App">Mobile app</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[#004A7C] text-[11px] font-black capitalize mb-2">Description</label>
                                    <textarea
                                        placeholder="any description..."
                                        rows={3}
                                        value={editProjectData.description}
                                        onChange={(e) => setEditProjectData({...editProjectData, description: e.target.value})}
                                        className="w-full px-4 py-3 bg-[#F8FAFC] border border-slate-100 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-100 resize-none capitalize"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-center gap-4">
                                <button
                                    type="button"
                                    onClick={() => setIsEditProjectModalOpen(false)}
                                    className="px-12 py-2.5 border-2 border-slate-100 text-[#004A7C] text-[11px] font-black capitalize rounded-xl hover:bg-slate-50 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-12 py-2.5 bg-[#004A7C] text-white text-[11px] font-black capitalize rounded-xl hover:bg-[#002D5B] transition-all shadow-lg"
                                >
                                    Save changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

const LoadingState = () => (
    <div className="h-[60vh] flex flex-col items-center justify-center w-full">
        <Loader2 className="animate-spin text-[#004A7C] mb-4" size={40} />
        <p className="text-[#004A7C] font-black capitalize tracking-[0.2em] text-[10px]">Synchronizing base data...</p>
    </div>
);

const EmptyState = () => (
    <div className="flex flex-col items-center justify-center text-center">
        <DatabaseZap size={40} className="text-slate-200 mb-4" />
        <h3 className="text-[#002D5B] font-black capitalize text-sm mb-1">No data available</h3>
        <p className="text-slate-400 text-[10px] font-bold capitalize tracking-tight">Backend returned an empty result.</p>
    </div>
);