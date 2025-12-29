import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
    ChevronLeft, ChevronRight, Search, Plus, Pencil, Trash2,
    Eye, ChevronDown, X, Calendar, ArrowRight, Building2, Loader2
} from "lucide-react";
import { institutionService } from "../../services/institutionService";

const InstitutionStructure = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    // Data State
    const [institution, setInstitution] = useState(null);
    const [subStructures, setSubStructures] = useState([]);
    const [lookups, setLookups] = useState({ users: [], roles: [] });
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    // Modal Visibility State
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    // Form States
    const [assignForm, setAssignForm] = useState({ userId: "", roleId: "" });
    const [structureForm, setStructureForm] = useState({
        name: "",
        parentInstitute: "",
        project: "",
        description: ""
    });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchInitialData();
    }, [id]);

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchSubStructures();
        }, 500);
        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm]);

    const fetchInitialData = async () => {
        try {
            setLoading(true);
            const [instData, lookupData] = await Promise.all([
                institutionService.getInstitutionById(id),
                institutionService.getAssignmentLookups()
            ]);
            setInstitution(instData.data);
            setLookups(lookupData.data);
            await fetchSubStructures();
        } catch (error) {
            console.error("Error loading page:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchSubStructures = async () => {
        try {
            const data = await institutionService.getSubStructures(id, searchTerm);
            setSubStructures(data.data);
        } catch (error) {
            console.error("Error loading table:", error);
        }
    };

    // Handle User Assignment
    const handleAssign = async (e) => {
        e.preventDefault();
        try {
            setSubmitting(true);
            await institutionService.assignUser({ ...assignForm, institutionId: id });
            setIsAssignModalOpen(false);
            setAssignForm({ userId: "", roleId: "" });
        } catch (error) {
            console.error("Assignment failed:", error);
        } finally {
            setSubmitting(false);
        }
    };

    // Handle Sub-Structure Creation
    const handleCreateStructure = async (e) => {
        e.preventDefault();
        try {
            setSubmitting(true);
            await institutionService.createSubStructure({ ...structureForm, institutionId: id });
            setIsAddModalOpen(false);
            setStructureForm({ name: "", parentInstitute: "", project: "", description: "" });
            fetchSubStructures(); // Refresh table
        } catch (error) {
            console.error("Creation failed:", error);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-[#F0F7FF]">
                <Loader2 className="animate-spin text-[#004A7C]" size={48} />
            </div>
        );
    }

    return (
        <div className="p-8 bg-[#F0F7FF] min-h-screen font-sans text-left">
            {/* Header / Breadcrumbs */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-[12px] font-medium text-slate-400">
                    <Link to="/institutions" className="hover:text-[#004A7C]">Institution</Link>
                    <ChevronRight size={14} />
                    <span className="text-[#004A7C]">Institution Structure</span>
                </div>
            </div>

            <button onClick={() => navigate(-1)} className="flex items-center gap-2 px-4 py-1.5 bg-white border border-slate-200 rounded-lg text-[12px] font-bold text-[#004A7C] mb-6 shadow-sm hover:bg-slate-50 transition-all">
                <ChevronLeft size={16} strokeWidth={3} /> Back
            </button>

            {/* Institution Card */}
            <div className="bg-white rounded-3xl p-8 mb-8 shadow-sm border border-slate-50">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h1 className="text-2xl font-extrabold text-[#004A7C] mb-2 tracking-tight">{institution?.name}</h1>
                        <div className="flex items-center gap-3">
                            <div className="bg-[#004A7C] p-2 rounded-lg text-white"><Building2 size={20} /></div>
                            <span className="text-slate-400 font-bold text-sm uppercase">{institution?.projectCode || "IFTMS"}</span>
                        </div>
                    </div>
                    <button onClick={() => setIsAssignModalOpen(true)} className="bg-[#004A7C] text-white px-6 py-2 rounded-xl text-[13px] font-bold shadow-md hover:bg-[#002D5B]">Assign User</button>
                </div>

                <div className="grid grid-cols-4 gap-4 p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
                    <div className="flex items-center gap-3 border-r border-slate-200">
                        <Building2 size={18} className="text-[#004A7C]" />
                        <span className="text-[13px] text-[#004A7C] font-semibold italic">Institute: <span className="not-italic text-slate-500 ml-1">{institution?.shortName}</span></span>
                    </div>
                    <div className="flex items-center gap-3 border-r border-slate-200">
                        <Calendar size={18} className="text-[#004A7C]" />
                        <span className="text-[13px] text-[#004A7C] font-semibold italic">Created: <span className="not-italic text-slate-500 ml-1">{institution?.createdAt}</span></span>
                    </div>
                    <div className="flex items-center justify-center border-r border-slate-200">
                        <span className="text-[13px] text-slate-500 font-semibold italic">Head Office</span>
                    </div>
                    <div className="flex items-center justify-center">
                        <span className="text-[13px] text-[#004A7C] font-bold flex items-center gap-2 italic">Maintenance Date: <ArrowRight size={16} /></span>
                    </div>
                </div>
            </div>

            {/* Table Section */}
            <div className="bg-white rounded-[2rem] shadow-sm border border-slate-50 p-6 overflow-hidden">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                    <h2 className="text-lg font-extrabold text-[#004A7C]">Project Sub..Structure</h2>
                    <div className="flex items-center gap-4">
                        <div className="relative w-64">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                            <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search Organization" className="w-full pl-12 pr-4 py-2.5 bg-[#F8FAFC] border border-slate-100 rounded-xl text-[13px] focus:outline-none" />
                        </div>
                        <button onClick={() => setIsAddModalOpen(true)} className="flex items-center gap-2 bg-[#004A7C] text-white px-6 py-2.5 rounded-xl text-[13px] font-bold shadow-md">
                            <Plus size={18} className="border-2 border-white rounded-full p-0.5" strokeWidth={3} /> Add Sub-Structure
                        </button>
                    </div>
                </div>

                <table className="w-full text-left border-separate border-spacing-y-4">
                    <thead>
                    <tr className="bg-[#004A7C] text-white">
                        <th className="py-4 px-8 text-[13px] font-semibold first:rounded-l-xl">Structure Name</th>
                        <th className="py-4 px-6 text-[13px] font-semibold">Parent Institute</th>
                        <th className="py-4 px-6 text-[13px] font-semibold">Project</th>
                        <th className="py-4 px-6 text-[13px] font-semibold">Description</th>
                        <th className="py-4 px-6 text-[13px] font-semibold">Status</th>
                        <th className="py-4 px-8 text-[13px] font-semibold text-right last:rounded-r-xl">Action</th>
                    </tr>
                    </thead>
                    <tbody>
                    {subStructures.map((item) => (
                        <tr key={item.id} className="bg-slate-50/30 hover:bg-slate-50 transition-colors">
                            <td className="py-5 px-8 first:rounded-l-xl text-[#004A7C] font-bold text-[13px]">{item.name}</td>
                            <td className="py-5 px-6 text-[#004A7C] text-[13px] font-medium">{item.parentName}</td>
                            <td className="py-5 px-6 text-[#004A7C] text-[13px] font-medium">{item.projectName}</td>
                            <td className="py-5 px-6 text-slate-400 text-[11px] leading-tight max-w-[200px]">{item.description}</td>
                            <td className="py-5 px-6"><span className="bg-[#41B34A] text-white px-5 py-1 rounded-full text-[11px] font-bold">{item.status}</span></td>
                            <td className="py-5 px-8 text-right last:rounded-r-xl">
                                <div className="flex justify-end gap-4 text-[#004A7C]">
                                    <Link to={`/orgstructures/sub-structure/${item.id}`}>
                                        <Eye size={18} className="cursor-pointer hover:scale-110" />
                                    </Link>
                                    <Pencil size={18} className="cursor-pointer hover:scale-110" />
                                    <Trash2 size={18} className="text-red-500 cursor-pointer hover:scale-110" />
                                </div>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>

            {/* --- ADD SUB-STRUCTURE MODAL --- */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-[#001D3D]/40 backdrop-blur-sm p-4">
                    <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between px-10 pt-10 pb-6 border-b border-slate-50">
                            <h2 className="text-[#004A7C] font-extrabold text-lg tracking-tight">Create New Sub-Structure</h2>
                            <button onClick={() => setIsAddModalOpen(false)} className="text-[#004A7C] border-2 border-[#004A7C] rounded-full p-1 hover:text-red-500"><X size={20} strokeWidth={3} /></button>
                        </div>
                        <form onSubmit={handleCreateStructure} className="p-10">
                            <div className="grid grid-cols-2 gap-8 mb-8">
                                <div className="space-y-3">
                                    <label className="text-[#004A7C] text-[13px] font-extrabold ml-1">Structure Name</label>
                                    <input
                                        type="text"
                                        placeholder="Enter name"
                                        value={structureForm.name}
                                        onChange={(e) => setStructureForm({...structureForm, name: e.target.value})}
                                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-[13px] text-[#004A7C] font-medium focus:outline-none"
                                        required
                                    />
                                </div>

                                <div className="col-span-2 space-y-3">
                                    <label className="text-[#004A7C] text-[13px] font-extrabold ml-1">Description</label>
                                    <textarea
                                        rows="3"
                                        placeholder="Enter description"
                                        value={structureForm.description}
                                        onChange={(e) => setStructureForm({...structureForm, description: e.target.value})}
                                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-[13px] text-[#004A7C] font-medium focus:outline-none resize-none"
                                    />
                                </div>
                            </div>
                            <div className="flex items-center justify-between border-t border-slate-50 pt-8">
                                <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-14 py-3.5 border border-slate-200 text-[#004A7C] text-[14px] font-extrabold rounded-2xl hover:bg-slate-50 uppercase tracking-wider">Cancel</button>
                                <button type="submit" disabled={submitting} className="px-14 py-3.5 bg-[#004A7C] text-white text-[14px] font-extrabold rounded-2xl hover:bg-[#002D5B] shadow-lg">
                                    {submitting ? <Loader2 className="animate-spin" size={18} /> : "Create"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* --- ASSIGN USER MODAL --- */}
            {isAssignModalOpen && (
                <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-[#001D3D]/40 backdrop-blur-sm p-4">
                    <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between px-10 pt-10 pb-6 border-b border-slate-50">
                            <h2 className="text-[#004A7C] font-extrabold text-lg tracking-tight">Assign User to Head Office</h2>
                            <button onClick={() => setIsAssignModalOpen(false)} className="text-[#004A7C] border-2 border-[#004A7C] rounded-full p-1 hover:text-red-500"><X size={20} strokeWidth={3} /></button>
                        </div>
                        <form onSubmit={handleAssign} className="p-10">
                            <div className="grid grid-cols-2 gap-8 mb-12">
                                <div className="space-y-3">
                                    <label className="text-[#004A7C] text-[13px] font-extrabold ml-1">Select User</label>
                                    <div className="relative">
                                        <select value={assignForm.userId} onChange={(e) => setAssignForm({...assignForm, userId: e.target.value})} className="w-full appearance-none px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-[13px] text-[#004A7C] font-medium focus:outline-none" required>
                                            <option value="">Select User</option>
                                            {lookups.users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                                        </select>
                                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[#004A7C] text-[13px] font-extrabold ml-1">Select Role</label>
                                    <div className="relative">
                                        <select value={assignForm.roleId} onChange={(e) => setAssignForm({...assignForm, roleId: e.target.value})} className="w-full appearance-none px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-[13px] text-[#004A7C] font-medium focus:outline-none" required>
                                            <option value="">Select Role</option>
                                            {lookups.roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                                        </select>
                                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center justify-between border-t border-slate-50 pt-8">
                                <button type="button" onClick={() => setIsAssignModalOpen(false)} className="px-14 py-3.5 border border-slate-200 text-[#004A7C] text-[14px] font-extrabold rounded-2xl hover:bg-slate-50 uppercase tracking-wider">Cancel</button>
                                <button type="submit" disabled={submitting} className="px-14 py-3.5 bg-[#004A7C] text-white text-[14px] font-extrabold rounded-2xl hover:bg-[#002D5B] shadow-lg flex items-center gap-2">
                                    {submitting ? <Loader2 className="animate-spin" size={18} /> : "Assign"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InstitutionStructure;