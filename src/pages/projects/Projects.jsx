import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
    Plus, Search, X, Loader2, Edit, Trash2, Eye, Clock,
    CheckCircle2, AlertTriangle, BarChart3, Briefcase,
    ChevronLeft, ChevronRight, Layers, Calendar, User, Wallet,
    Settings, ShieldCheck, ExternalLink, LayoutDashboard
} from "lucide-react";
import { getProjects, createProject, updateProject, deleteProject } from "../../services/projectService";
import { getUsers } from "../../services/userService";
import toast from "react-hot-toast";

function Projects() {
    const navigate = useNavigate();

    const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
    const currentUserId = String(currentUser.id);
    const userRole = currentUser.role;

    // --- PERMISSION CHECKS ---
    // Added DEPUTY DIRECTOR and ADMIN to allow project registration
    const canRegisterNew = userRole === "PROJECT_MANAGER" || userRole === "ADMIN" || userRole === "DEPUTY DIRECTOR";

    const canUserModifyProject = (project) => {
        // Admins and Deputy Directors can modify any project (oversight)
        if (userRole === "ADMIN" || userRole === "DEPUTY DIRECTOR") return true;
        // Project Managers can only modify projects they are assigned to
        if (userRole === "PROJECT_MANAGER" && String(project.manager_id) === currentUserId) return true;
        return false;
    };

    // --- STATE ---
    const [projects, setProjects] = useState([]);
    const [users, setUsers] = useState([]);
    const [search, setSearch] = useState("");
    const [activeFilter, setActiveFilter] = useState("All");
    const [loading, setLoading] = useState(true);
    const [showFormModal, setShowFormModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedProject, setSelectedProject] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    const [form, setForm] = useState({
        title: "", description: "", status: "active",
        start_date: "", end_date: "", budget: "",
        owner_id: "", manager_id: "", technical_manager_id: ""
    });

    // --- FETCH DATA ---
    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const [projRes, userRes] = await Promise.all([getProjects(), getUsers()]);
            setProjects(Array.isArray(projRes) ? projRes : (projRes?.data || []));
            setUsers(Array.isArray(userRes) ? userRes : (userRes?.data || []));
        } catch (err) {
            toast.error("Unable to load project data.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    // --- USER ELIGIBILITY (Including Deputy Director) ---
    const eligiblePMs = useMemo(() =>
            users.filter(u => u.role === "PROJECT_MANAGER" || u.role === "DEPUTY DIRECTOR"),
        [users]);

    const eligibleTMs = useMemo(() =>
            users.filter(u => u.role === "TECHNICAL MANAGER"),
        [users]);

    const eligibleOwners = useMemo(() =>
            users.filter(u => u.role === "OWNER" || u.role === "ADMIN" || u.role === "DEPUTY DIRECTOR"),
        [users]);

    const getUserName = (id) => users.find(u => String(u.id) === String(id))?.name || "Not Assigned";

    const getProjectStatus = (project) => {
        const today = new Date(); today.setHours(0,0,0,0);
        const end = project.end_date ? new Date(project.end_date) : null;

        if (project.status?.toLowerCase() === 'completed')
            return { label: "Completed", color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-900/20", icon: CheckCircle2 };
        if (end && end < today)
            return { label: "Overdue", color: "text-rose-600 dark:text-rose-400", bg: "bg-rose-50 dark:bg-rose-900/20", icon: AlertTriangle };

        return { label: "Active", color: "text-indigo-600 dark:text-indigo-400", bg: "bg-indigo-50 dark:bg-indigo-900/20", icon: BarChart3 };
    };

    const filteredProjects = useMemo(() => {
        return projects.filter(proj => {
            const matchesSearch = proj.title.toLowerCase().includes(search.toLowerCase());
            const status = getProjectStatus(proj);
            const matchesFilter = activeFilter === "All" || status.label === activeFilter;
            return matchesSearch && matchesFilter;
        });
    }, [projects, search, activeFilter]);

    const totalPages = Math.ceil(filteredProjects.length / itemsPerPage);
    const paginatedProjects = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredProjects.slice(start, start + itemsPerPage);
    }, [filteredProjects, currentPage]);

    const openEdit = (project) => {
        setIsEditing(true);
        setSelectedProject(project);
        setForm({
            ...project,
            start_date: project.start_date?.split('T')[0] || "",
            end_date: project.end_date?.split('T')[0] || "",
            owner_id: project.owner_id || "",
            technical_manager_id: project.technical_manager_id || "",
            manager_id: project.manager_id || ""
        });
        setShowFormModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isEditing) await updateProject(selectedProject.id, form);
            else await createProject(form);
            toast.success(isEditing ? "Project updated." : "Project created.");
            setShowFormModal(false);
            fetchData();
        } catch (err) {
            toast.error("Error saving project.");
        }
    };

    const handleDelete = async (project) => {
        if (window.confirm("Are you sure you want to delete this project?")) {
            try {
                await deleteProject(project.id);
                toast.success("Project deleted.");
                fetchData();
            } catch {
                toast.error("Delete failed.");
            }
        }
    };

    return (
        <div className="p-6 space-y-8 bg-slate-50 dark:bg-slate-950 min-h-screen font-sans transition-colors duration-300">

            {/* --- HEADER --- */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-black text-indigo-900 dark:text-indigo-400 flex items-center gap-2 uppercase tracking-tight">
                        <Briefcase size={28} /> Projects
                    </h1>
                    <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Manage your workspace</p>
                </div>

                <div className="flex gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search projects..."
                            className="pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl w-full text-sm focus:ring-2 focus:ring-indigo-900 dark:focus:ring-indigo-500 outline-none transition-all shadow-sm dark:text-slate-200"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    {canRegisterNew && (
                        <button onClick={() => {
                            setIsEditing(false);
                            setForm({
                                title: "", description: "", status: "active",
                                start_date: "", end_date: "", budget: "",
                                owner_id: "", manager_id: "", technical_manager_id: ""
                            });
                            setShowFormModal(true);
                        }} className="bg-indigo-900 dark:bg-indigo-900 hover:bg-indigo-800 dark:hover:bg-indigo-500 text-white px-6 py-2 rounded-xl flex items-center gap-2 text-xs font-black uppercase tracking-widest transition-all shadow-lg">
                            <Plus size={18} strokeWidth={3} /> Create Project
                        </button>
                    )}
                </div>
            </div>

            {/* --- SUMMARY CARDS --- */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: "All Projects", count: projects.length, icon: Layers },
                    { label: "Ongoing", count: projects.filter(p => getProjectStatus(p).label === "Active").length, icon: BarChart3 },
                    { label: "Finished", count: projects.filter(p => getProjectStatus(p).label === "Completed").length, icon: CheckCircle2 },
                    { label: "Delayed", count: projects.filter(p => getProjectStatus(p).label === "Overdue").length, icon: AlertTriangle },
                ].map((stat) => {
                    const filterKey = stat.label === "All Projects" ? "All" :
                        stat.label === "Ongoing" ? "Active" :
                            stat.label === "Finished" ? "Completed" : "Overdue";

                    return (
                        <button
                            key={stat.label}
                            onClick={() => { setActiveFilter(filterKey); setCurrentPage(1); }}
                            className={`p-5 rounded-2xl border-2 transition-all text-left ${
                                activeFilter === filterKey
                                    ? 'bg-indigo-900 dark:bg-indigo-900 border-indigo-900 dark:border-indigo-600 text-white shadow-xl shadow-indigo-900/20'
                                    : 'bg-white dark:bg-slate-900 border-transparent text-slate-500 dark:text-slate-400 hover:border-indigo-900 dark:hover:border-indigo-500'
                            }`}
                        >
                            <div className="flex justify-between items-center">
                                <stat.icon size={22} strokeWidth={2.5} className={activeFilter === filterKey ? 'text-indigo-200' : 'text-indigo-900 dark:text-indigo-400'} />
                                <span className="text-2xl font-black">{stat.count}</span>
                            </div>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] mt-3">{stat.label}</p>
                        </button>
                    );
                })}
            </div>

            {/* --- TABLE --- */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                <table className="w-full text-left">
                    <thead className="bg-indigo-900 dark:bg-indigo-950 text-[10px] font-black text-indigo-100 uppercase tracking-[0.2em]">
                    <tr>
                        <th className="px-8 py-5">Title</th>
                        <th className="px-8 py-5 text-center">Status</th>
                        <th className="px-8 py-5 text-right">Actions</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {loading ? (
                        <tr><td colSpan={3} className="py-20 text-center"><Loader2 className="animate-spin mx-auto text-indigo-900 dark:text-indigo-400" size={32} /></td></tr>
                    ) : paginatedProjects.length === 0 ? (
                        <tr><td colSpan={3} className="py-20 text-center text-slate-400 dark:text-slate-600 font-bold uppercase text-xs">No projects found</td></tr>
                    ) : (
                        paginatedProjects.map(project => {
                            const status = getProjectStatus(project);
                            return (
                                <tr key={project.id} className="hover:bg-indigo-50/30 dark:hover:bg-indigo-900/10 transition-colors group">
                                    <td className="px-8 py-5">
                                        <button
                                            onClick={() => navigate(`/projects/${project.id}`)}
                                            className="font-black text-indigo-900 dark:text-indigo-300 text-sm uppercase tracking-tight hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors text-left flex items-center gap-2 group/title"
                                        >
                                            {project.title}
                                            <ExternalLink size={12} className="opacity-0 group-hover/title:opacity-100 transition-opacity" />
                                        </button>
                                    </td>
                                    <td className="px-8 py-5 text-center">
                                            <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${status.color} ${status.bg} border border-current/10`}>
                                                {status.label}
                                            </span>
                                    </td>
                                    <td className="px-8 py-5 text-right">
                                        <div className="flex justify-end gap-2">

                                            <button onClick={() => { setSelectedProject(project); setShowDetailModal(true); }} className="p-2 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors" title="Quick View"><Eye size={18} strokeWidth={2.5}/></button>
                                            {canUserModifyProject(project) && (
                                                <>
                                                    <button onClick={() => openEdit(project)} className="p-2 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors" title="Edit"><Edit size={18} strokeWidth={2.5}/></button>
                                                    <button onClick={() => handleDelete(project)} className="p-2 text-slate-400 hover:text-rose-600 transition-colors" title="Delete"><Trash2 size={18} strokeWidth={2.5}/></button>
                                                </>
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

            {/* --- DETAIL VIEW MODAL --- */}
            {showDetailModal && selectedProject && (
                <div className="fixed inset-0 bg-indigo-950/40 dark:bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-[2.5rem] shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
                        <div className="p-8">
                            <div className="flex justify-between items-start mb-8">
                                <div className="space-y-1">
                                    <span className="px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-[10px] font-black uppercase tracking-widest rounded-full">Detailed View</span>
                                    <h2 className="text-3xl font-black text-indigo-900 dark:text-indigo-300 uppercase tracking-tighter">{selectedProject.title}</h2>
                                </div>
                                <button onClick={() => setShowDetailModal(false)} className="p-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl text-slate-400 transition-colors"><X size={24}/></button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-6">
                                    {[
                                        { icon: ShieldCheck, label: "Project Owner", value: getUserName(selectedProject.owner_id) },
                                        { icon: User, label: "Project Manager", value: getUserName(selectedProject.manager_id) },
                                        { icon: Settings, label: "Technical Manager", value: getUserName(selectedProject.technical_manager_id) }
                                    ].map((item, idx) => (
                                        <div key={idx} className="flex items-start gap-4">
                                            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl text-indigo-900 dark:text-indigo-400"><item.icon size={20}/></div>
                                            <div>
                                                <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{item.label}</p>
                                                <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{item.value}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="space-y-6">
                                    <div className="flex items-start gap-4">
                                        <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl text-indigo-900 dark:text-indigo-400"><Wallet size={20}/></div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Budget</p>
                                            <p className="text-xl font-black text-indigo-600 dark:text-indigo-400">ETB {new Intl.NumberFormat().format(selectedProject.budget || 0)}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-4">
                                        <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl text-indigo-900 dark:text-indigo-400"><Calendar size={20}/></div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Timeline</p>
                                            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{selectedProject.start_date?.split('T')[0]} — {selectedProject.end_date?.split('T')[0]}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-800">
                                <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">Description</p>
                                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed font-medium bg-slate-50 dark:bg-slate-800/50 p-6 rounded-[1.5rem]">
                                    {selectedProject.description || "No project description available."}
                                </p>
                            </div>

                            <div className="mt-10 flex justify-end gap-3">
                                <button onClick={() => setShowDetailModal(false)} className="px-10 py-4 bg-indigo-900 dark:bg-indigo-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-800 dark:hover:bg-indigo-500 transition-all shadow-xl">
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* --- PAGINATION --- */}
            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-4">
                    <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="p-2 bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-xl disabled:opacity-30 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 text-indigo-900 dark:text-indigo-400 shadow-sm transition-all"><ChevronLeft size={20}/></button>
                    <span className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest">Page {currentPage} of {totalPages}</span>
                    <button disabled={currentPage >= totalPages} onClick={() => setCurrentPage(p => p + 1)} className="p-2 bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-xl disabled:opacity-30 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 text-indigo-900 dark:text-indigo-400 shadow-sm transition-all"><ChevronRight size={20}/></button>
                </div>
            )}

            {/* --- CREATE / EDIT FORM --- */}
            {showFormModal && (
                <div className="fixed inset-0 bg-indigo-900/20 dark:bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden border dark:border-slate-800">
                        <div className="px-8 py-6 border-b dark:border-slate-800 flex justify-between items-center bg-indigo-900 dark:bg-indigo-950 text-white">
                            <h2 className="font-black uppercase tracking-widest text-sm">{isEditing ? "Edit Project" : "New Project"}</h2>
                            <button onClick={() => setShowFormModal(false)}><X size={24}/></button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-8 space-y-4 max-h-[75vh] overflow-y-auto custom-scrollbar">
                            <FormField field={{ label: "Title", key: "title", type: "text", required: true }} form={form} setForm={setForm} />

                            <div className="grid grid-cols-2 gap-4">
                                <FormField field={{ label: "Start Date", key: "start_date", type: "date", required: true }} form={form} setForm={setForm} />
                                <FormField field={{ label: "End Date", key: "end_date", type: "date", required: true }} form={form} setForm={setForm} />
                            </div>

                            <FormField field={{ label: "Budget (ETB)", key: "budget", type: "number", required: true }} form={form} setForm={setForm} />

                            <FormField field={{ label: "Project Owner", key: "owner_id", type: "select", options: eligibleOwners }} form={form} setForm={setForm} />
                            <FormField field={{ label: "Project Manager", key: "manager_id", type: "select", options: eligiblePMs }} form={form} setForm={setForm} />
                            <FormField field={{ label: "Technical Manager", key: "technical_manager_id", type: "select", options: eligibleTMs }} form={form} setForm={setForm} />

                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Description</label>
                                <textarea
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-2 border-transparent rounded-xl outline-none focus:border-indigo-900 dark:focus:border-indigo-500 font-bold text-sm transition-all dark:text-slate-200 min-h-[100px]"
                                    value={form.description}
                                    onChange={(e) => setForm({...form, description: e.target.value})}
                                    placeholder="Enter project details..."
                                />
                            </div>

                            <div className="flex justify-end gap-3 mt-8">
                                <button type="button" onClick={() => setShowFormModal(false)} className="px-6 py-3 text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all">Cancel</button>
                                <button type="submit" className="px-8 py-3 bg-indigo-900 dark:bg-indigo-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-indigo-800 dark:hover:bg-indigo-500 transition-all shadow-lg">Save Project</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

const FormField = ({ field, form, setForm }) => (
    <div className="space-y-1">
        <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">{field.label}</label>
        {field.type === "select" ? (
            <select
                required={field.required}
                value={form[field.key]}
                onChange={(e) => setForm({...form, [field.key]: e.target.value})}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-2 border-transparent rounded-xl outline-none focus:border-indigo-900 dark:focus:border-indigo-500 font-bold text-sm transition-all dark:text-slate-200"
            >
                <option value="">Select {field.label}...</option>
                {field.options?.map(u => <option key={u.id} value={u.id}>{u.name} ({u.role})</option>)}
            </select>
        ) : (
            <input
                type={field.type}
                required={field.required}
                value={form[field.key]}
                onChange={(e) => setForm({...form, [field.key]: e.target.value})}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-2 border-transparent rounded-xl outline-none focus:border-indigo-900 dark:focus:border-indigo-500 font-bold text-sm transition-all dark:text-slate-200"
            />
        )}
    </div>
);

export default Projects;