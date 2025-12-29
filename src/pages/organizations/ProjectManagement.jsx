import React, { useState, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";
import {
    Search,
    Plus,
    Eye,
    Pencil,
    Trash2,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    Loader2,
    X
} from "lucide-react";
import {
    getProjects,
    createProject,
    updateProject,
    deleteProject,
    getProjectCategories,
    getInstitutions
} from "../../services/projectService";

const ProjectManagement = () => {
    const location = useLocation();
    const passedOrg = location.state?.organization;

    // --- State Management ---
    const [projects, setProjects] = useState([]);
    const [categories, setCategories] = useState([]);
    const [institutions, setInstitutions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentProjectId, setCurrentProjectId] = useState(null);

    const [formData, setFormData] = useState({
        name: "",
        category_id: "",
        institution_id: "",
        description: "",
        organization_id: passedOrg?.id || ""
    });

    const fetchDropdownData = useCallback(async () => {
        try {
            const [catRes, instRes] = await Promise.all([
                getProjectCategories(),
                getInstitutions()
            ]);

            if (catRes && catRes.data) setCategories(catRes.data);
            if (instRes && instRes.data) setInstitutions(instRes.data);
        } catch (error) {
            console.error("Error fetching lookup data:", error);
        }
    }, []);

    const fetchData = useCallback(async () => {
        try {
            setIsLoading(true);
            const response = await getProjects({
                page: currentPage,
                search: searchTerm,
                organization_id: passedOrg?.id
            });

            if (response && response.data) {
                setProjects(response.data);
                setTotalPages(response.meta?.last_page || 1);
            }
        } catch (error) {
            console.error("Fetch Error:", error);
        } finally {
            setIsLoading(false);
        }
    }, [currentPage, searchTerm, passedOrg?.id]);

    useEffect(() => {
        fetchData();
        fetchDropdownData();
    }, [fetchData, fetchDropdownData]);

    const handleOpenModal = (project = null) => {
        if (project) {
            setIsEditing(true);
            setCurrentProjectId(project.id);
            setFormData({
                name: project.name || "",
                category_id: project.category_id || "",
                institution_id: project.institution_id || "",
                description: project.description || "",
                organization_id: project.organization_id || passedOrg?.id || ""
            });
        } else {
            setIsEditing(false);
            setFormData({
                name: "",
                category_id: "",
                institution_id: "",
                description: "",
                organization_id: passedOrg?.id || ""
            });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isEditing) {
                await updateProject(currentProjectId, formData);
            } else {
                await createProject(formData);
            }
            setIsModalOpen(false);
            fetchData();
        } catch (error) {
            alert(error.message);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this project?")) {
            try {
                await deleteProject(id);
                fetchData();
            } catch (error) {
                alert(error.message);
            }
        }
    };

    return (
        <div className="min-h-screen bg-[#F0F7FF] p-8 font-sans text-left">
            {/* --- Header --- */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 text-left">
                <h1 className="text-[#004A7C] text-2xl font-semibold tracking-tight">Project Management</h1>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                        <input
                            type="text"
                            placeholder="Search Projects..."
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-[13px] w-64 focus:outline-none placeholder:text-slate-300"
                        />
                    </div>
                    <button
                        onClick={() => handleOpenModal()}
                        className="flex items-center gap-2 bg-[#004A7C] text-white px-5 py-2 rounded-lg text-sm hover:bg-[#00365a] transition-all shadow-md active:scale-95"
                    >
                        <Plus size={18} />
                        Add System
                    </button>
                </div>
            </div>

            {/* --- Table --- */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                <table className="w-full text-left border-separate border-spacing-y-2 px-4">
                    <thead>
                    <tr className="bg-[#004A7C] text-white">
                        <th className="py-4 px-6 text-[12px] font-medium first:rounded-l-lg text-left tracking-wide">Project Name</th>
                        <th className="py-4 px-6 text-[12px] font-medium text-center tracking-wide">Institution</th>
                        <th className="py-4 px-6 text-[12px] font-medium text-center tracking-wide">Structure</th>
                        <th className="py-4 px-6 text-[12px] font-medium text-left tracking-wide">Description</th>
                        <th className="py-4 px-6 text-[12px] font-medium text-center tracking-wide">Status</th>
                        <th className="py-4 px-6 text-[12px] font-medium text-right last:rounded-r-lg tracking-wide">Action</th>
                    </tr>
                    </thead>
                    <tbody className="before:block before:h-2">
                    {isLoading ? (
                        <tr>
                            <td colSpan="6" className="py-20 text-center">
                                <Loader2 className="animate-spin text-[#004A7C] mx-auto" />
                            </td>
                        </tr>
                    ) : projects.map((project) => (
                        <tr key={project.id} className="bg-white border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] group hover:bg-slate-50 transition-colors">
                            <td className="py-5 px-6 rounded-l-xl border-y border-l border-slate-50 text-left">
                                <div className="text-[#004A7C] font-semibold text-sm leading-tight">{project.name}</div>
                                <div className="text-[11px] text-slate-400 mt-1">{project.category?.name || "Uncategorized"}</div>
                            </td>
                            <td className="py-5 px-6 border-y border-slate-50 text-center text-[#004A7C] text-[12px]">
                                {project.institution?.name || project.institution || "N/A"}
                            </td>
                            <td className="py-5 px-6 border-y border-slate-50 text-center text-[#004A7C] text-[12px]">
                                {project.structure || "N/A"}
                            </td>
                            <td className="py-5 px-6 border-y border-slate-50 text-left">
                                <p className="text-slate-500 text-[11px] line-clamp-2 max-w-[240px] leading-relaxed">{project.description}</p>
                            </td>
                            <td className="py-5 px-6 border-y border-slate-50 text-center">
                                    <span className="bg-[#4CAF50] text-white text-[10px] px-4 py-1.5 rounded-full uppercase tracking-wider font-medium">
                                        {project.status || "Active"}
                                    </span>
                            </td>
                            <td className="py-5 px-6 rounded-r-xl border-y border-r border-slate-50 text-right">
                                <div className="flex items-center justify-end gap-3 text-[#004A7C]">
                                    <button className="hover:scale-110 transition-transform"><Eye size={18} /></button>
                                    <button onClick={() => handleOpenModal(project)} className="hover:scale-110 transition-transform"><Pencil size={18} /></button>
                                    <button onClick={() => handleDelete(project.id)} className="text-red-500 hover:scale-110 transition-transform"><Trash2 size={18} /></button>
                                </div>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>

                {/* --- Pagination --- */}
                <div className="p-8 flex items-center justify-end gap-2 bg-white">
                    <button
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(prev => prev - 1)}
                        className="flex items-center gap-1 px-4 py-1.5 border border-slate-200 rounded-md text-[12px] text-slate-500 hover:bg-slate-50 disabled:opacity-30 transition-all"
                    >
                        <ChevronLeft size={14} /> Back
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
                        <button
                            key={num}
                            onClick={() => setCurrentPage(num)}
                            className={`w-8 h-8 flex items-center justify-center rounded-md text-[12px] transition-all ${
                                num === currentPage ? "bg-[#002D5B] text-white shadow-md font-semibold" : "text-slate-400 hover:bg-slate-50"
                            }`}
                        >
                            {num}
                        </button>
                    ))}
                    <button
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage(prev => prev + 1)}
                        className="flex items-center gap-1 px-4 py-1.5 border border-slate-200 rounded-md text-[12px] text-slate-500 hover:bg-slate-50 disabled:opacity-30 transition-all"
                    >
                        Next <ChevronRight size={14} />
                    </button>
                </div>
            </div>

            {/* --- FULL SCREEN MODAL --- */}
            {isModalOpen && (
                <div className="fixed inset-0 w-screen h-screen z-[9999] flex items-center justify-center bg-[#001D3D]/60 backdrop-blur-md p-4 overflow-y-auto">
                    <div className="bg-white w-full max-w-4xl p-12 relative shadow-2xl rounded-[2.5rem] border border-slate-100 animate-in fade-in zoom-in duration-300 my-auto">
                        <button
                            onClick={() => setIsModalOpen(false)}
                            className="absolute top-10 right-10 text-[#004A7C] hover:text-red-500 transition-all"
                        >
                            <X size={28} strokeWidth={2.5} className="border-2 border-[#004A7C] rounded-full p-1" />
                        </button>

                        <h2 className="text-[#004A7C] font-bold text-2xl mb-12 text-left tracking-tight">
                            {isEditing ? "Update System Details" : "Register New System / Project"}
                        </h2>

                        <form onSubmit={handleSubmit}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                                {/* Left Column */}
                                <div className="space-y-8">
                                    <div className="space-y-3 text-left">
                                        <label className="text-[12px] font-semibold text-[#004A7C] ml-1">Project Name</label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="Enter Project Name"
                                            value={formData.name}
                                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                                            className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-[14px] focus:ring-4 focus:ring-[#004A7C]/5 focus:border-[#004A7C]/30 outline-none transition-all placeholder:text-slate-300"
                                        />
                                    </div>

                                    <div className="space-y-3 text-left">
                                        <label className="text-[12px] font-semibold text-[#004A7C] ml-1">Institution</label>
                                        <div className="relative">
                                            <select
                                                required
                                                value={formData.institution_id}
                                                onChange={(e) => setFormData({...formData, institution_id: e.target.value})}
                                                className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-[14px] text-slate-600 appearance-none outline-none focus:border-[#004A7C]/30 transition-all cursor-pointer"
                                            >
                                                <option value="" disabled>Select Institution</option>
                                                {institutions.map((inst) => (
                                                    <option key={inst.id} value={inst.id}>{inst.name}</option>
                                                ))}
                                            </select>
                                            <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-[#004A7C] pointer-events-none" size={18} strokeWidth={3} />
                                        </div>
                                    </div>
                                </div>

                                {/* Right Column */}
                                <div className="space-y-8">
                                    <div className="space-y-3 text-left">
                                        <label className="text-[12px] font-semibold text-[#004A7C] ml-1">Project Category</label>
                                        <div className="relative">
                                            <select
                                                required
                                                value={formData.category_id}
                                                onChange={(e) => setFormData({...formData, category_id: e.target.value})}
                                                className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-[14px] text-slate-600 appearance-none outline-none focus:border-[#004A7C]/30 transition-all cursor-pointer"
                                            >
                                                <option value="" disabled>Select Project Category</option>
                                                {categories.map((cat) => (
                                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                                ))}
                                            </select>
                                            <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-[#004A7C] pointer-events-none" size={18} strokeWidth={3} />
                                        </div>
                                    </div>

                                    <div className="space-y-3 text-left">
                                        <label className="text-[12px] font-semibold text-[#004A7C] ml-1">Description</label>
                                        <textarea
                                            rows={5}
                                            placeholder="Write a brief description..."
                                            value={formData.description}
                                            onChange={(e) => setFormData({...formData, description: e.target.value})}
                                            className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-[14px] outline-none resize-none focus:border-[#004A7C]/30 transition-all placeholder:text-slate-300"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Buttons */}
                            <div className="flex justify-between items-center mt-16 pt-10 border-t border-slate-50">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-16 py-4 border-2 border-slate-100 rounded-2xl text-[#004A7C] text-[13px] font-medium hover:bg-slate-50 transition-all active:scale-95"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-16 py-4 bg-[#004A7C] text-white text-[13px] font-medium rounded-2xl shadow-xl shadow-[#004A7C]/20 hover:bg-[#00365a] transition-all active:scale-95"
                                >
                                    {isEditing ? "Save Changes" : "Create System"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProjectManagement;