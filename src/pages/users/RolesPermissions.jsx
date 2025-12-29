import React, {useEffect, useState, useCallback, useMemo} from "react";
import {
    Search, Plus, X, ShieldCheck, Edit, Trash2, Eye, Clock, Hash, Lock, AlertTriangle, ChevronLeft, ChevronRight
} from "lucide-react";
import {getRoles, createRole, updateRole, deleteRole} from "@/services/roleService";
import DataTable from "@/components/roles/DataTable";
import {RoleForm} from "@/components/roles/RoleForm";
import toast from "react-hot-toast";

export default function RolesPermissions() {
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    const [modal, setModal] = useState({open: false, mode: 'create'});
    const [form, setForm] = useState({name: "", description: "", permissions: []});

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const rolesRes = await getRoles();
            setRoles(Array.isArray(rolesRes) ? rolesRes : rolesRes?.data || []);
        } catch (err) {
            toast.error("Failed to sync access registry");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const filteredData = useMemo(() =>
            roles.filter(r =>
                r.name.toLowerCase().includes(search.toLowerCase()) ||
                (r.description && r.description.toLowerCase().includes(search.toLowerCase()))
            ),
        [roles, search]);

    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const paginatedData = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredData.slice(start, start + itemsPerPage);
    }, [filteredData, currentPage]);

    useEffect(() => {
        setCurrentPage(1);
    }, [search]);

    const handleSave = async () => {
        if (modal.mode === 'view') {
            setModal({...modal, open: false});
            return;
        }

        if (!form.name.trim()) return toast.error("Authority Identity is required");
        if (!form.permissions?.length) return toast.error("Grant Matrix cannot be empty");

        const payload = {
            ...form,
            permissions: form.permissions.map(p => typeof p === 'string' ? p : p.name)
        };

        const loadingToast = toast.loading(modal.mode === 'create' ? "Establishing Authority..." : "Syncing Matrix...");
        try {
            if (modal.mode === 'create') {
                await createRole(payload);
                toast.success("Role Established", {id: loadingToast});
            } else {
                await updateRole(form.id, payload);
                toast.success("Matrix Synchronized", {id: loadingToast});
            }
            setModal({...modal, open: false});
            fetchData();
        } catch (e) {
            toast.error(e.response?.data?.message || "Sync Failed", {id: loadingToast});
        }
    };

    const handleDelete = (role) => {
        // Ensure we have a valid ID before even showing the toast
        const roleId = role.id;

        if (!roleId) {
            return toast.error("Critical Error: Role ID missing from registry");
        }

        toast((t) => (
            <div className="flex flex-col gap-3 min-w-[250px] bg-white dark:bg-slate-900 p-1">
                <div className="flex items-center gap-2 text-amber-600">
                    <AlertTriangle size={18}/>
                    <span className="font-black text-[10px] capitalize tracking-widest">Security Warning</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 font-bold">
                    Revoke <span className="text-[#004A7C] dark:text-blue-400">"{role.name}"</span> authority?
                </p>
                <div className="flex justify-end gap-2">
                    <button onClick={() => toast.dismiss(t.id)} className="px-3 py-1.5 text-[9px] font-black capitalize text-slate-400 hover:text-slate-600">Cancel</button>
                    <button
                        onClick={async () => {
                            toast.dismiss(t.id);
                            const delId = toast.loading("Revoking Authority...");
                            try {
                                // Call the service with the explicit roleId
                                await deleteRole(roleId);
                                toast.success("Registry Updated", {id: delId});
                                // Refresh the list
                                fetchData();
                            } catch (err) {
                                const errorMsg = err.response?.data?.message || "Revocation Failed";
                                toast.error(errorMsg, {id: delId});
                            }
                        }}
                        className="px-4 py-1.5 bg-red-600 text-white rounded-lg text-[9px] font-black capitalize shadow-md active:scale-95"
                    >Confirm
                    </button>
                </div>
            </div>
        ), {duration: 6000, position: 'top-center'});
    };
    const columns = [
        {
            header: "Index",
            render: (row, index) => (
                <div className="flex items-center gap-2 text-slate-300 dark:text-slate-600 font-black">
                    <Hash size={12}/> {String(((currentPage - 1) * itemsPerPage) + (index + 1)).padStart(2, '0')}
                </div>
            )
        },
        {
            header: "Role Identity",
            accessor: "name",
            render: (name) => (
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <ShieldCheck size={16} className="text-[#004A7C] dark:text-blue-400"/>
                    </div>
                    <span className="font-bold text-[#004A7C] dark:text-slate-200 capitalize tracking-tight text-xs">{name}</span>
                </div>
            )
        },
        {
            header: "Scope / Description",
            accessor: "description",
            render: (desc) => (
                <span className="text-slate-500 dark:text-slate-400 font-medium text-[10px] capitalize tracking-wider">
                    {desc || "Global Authority Access"}
                </span>
            )
        },
        {
            header: "Established",
            accessor: "created_at",
            render: (date) => (
                <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500 font-bold text-[10px] capitalize">
                    <Clock size={12}/> {date ? new Date(date).toLocaleDateString() : "Internal"}
                </div>
            )
        },
        {
            header: "Actions",
            align: "right",
            render: (row) => (
                <div className="flex justify-end gap-2">
                    <button onClick={() => {setForm(row); setModal({open: true, mode: 'view'});}} className="p-1.5 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded transition-colors"><Eye size={16}/></button>
                    <button onClick={() => {setForm(row); setModal({open: true, mode: 'edit'});}} className="p-1.5 hover:bg-amber-50 dark:hover:bg-amber-900/20 text-amber-600 dark:text-amber-400 rounded transition-colors"><Edit size={16}/></button>
                    <button onClick={() => handleDelete(row)} className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 rounded transition-colors"><Trash2 size={16}/></button>
                </div>
            )
        }
    ];

    const modalStyles = {
        view: {
            headerBg: "bg-slate-700 dark:bg-slate-800",
            button: "bg-slate-700 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white",
            title: "View Authority Profile"
        },
        edit: {
            headerBg: "bg-[#004A7C] dark:bg-blue-900",
            button: "bg-[#004A7C] dark:bg-blue-900 hover:bg-[#003a61] text-white",
            title: "Modify Authority"
        },
        create: {
            headerBg: "bg-[#004A7C] dark:bg-blue-900",
            button: "bg-[#004A7C] dark:bg-blue-900 hover:bg-[#003a61] text-white",
            title: "Define New Role"
        }
    };

    const currentStyle = modalStyles[modal.mode] || modalStyles.create;

    return (
        <div className="p-8 bg-[#F8FAFC] dark:bg-[#070D18] min-h-screen transition-colors duration-300">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between mb-8 items-start md:items-end gap-4">
                <div>
                    <h1 className="text-[#004A7C] dark:text-white text-2xl font-black capitalize tracking-tight">Authority Matrix</h1>
                    <p className="text-slate-400 dark:text-slate-500 text-xs">Total Defined Roles: {filteredData.length}</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                    <div className="relative flex-1 sm:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={16} />
                        <input
                            type="text"
                            placeholder="Search roles..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg pl-10 pr-4 py-2.5 text-[11px] text-slate-600 dark:text-slate-300 focus:outline-none focus:border-[#004A7C] focus:ring-1 focus:ring-[#004A7C] transition-all"
                        />
                    </div>

                    <button
                        onClick={() => {setForm({name: "", description: "", permissions: []}); setModal({open: true, mode: 'create'});}}
                        className="bg-[#004A7C] dark:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-xs font-bold shadow-lg shadow-blue-900/20 hover:scale-[1.02] transition-transform flex items-center justify-center gap-2"
                    >
                        <Plus size={16}/> Register New Role
                    </button>
                </div>
            </div>

            {/* Table Container */}
            <div className="bg-white dark:bg-slate-900/50 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden transition-colors">
                <DataTable columns={columns} data={paginatedData} loading={loading} emptyMessage="No authority levels defined in registry"/>

                {totalPages > 1 && (
                    <div className="flex items-center justify-between px-6 py-6 border-t border-slate-50 dark:border-slate-800 mt-4">
                        <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 capitalize tracking-widest">
                            Showing <span className="text-[#004A7C] dark:text-blue-400">{paginatedData.length}</span> of {filteredData.length} Entries
                        </p>
                        <div className="flex items-center gap-2">
                            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-2 rounded-xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 disabled:opacity-30 transition-all"><ChevronLeft size={18}/></button>
                            <div className="flex items-center gap-1">
                                {[...Array(totalPages)].map((_, i) => (
                                    <button key={i + 1} onClick={() => setCurrentPage(i + 1)} className={`w-8 h-8 rounded-xl text-[10px] font-black transition-all ${currentPage === i + 1 ? 'bg-[#004A7C] dark:bg-blue-600 text-white shadow-md' : 'text-slate-400 dark:text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>{i + 1}</button>
                                ))}
                            </div>
                            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-2 rounded-xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 disabled:opacity-30 transition-all"><ChevronRight size={18}/></button>
                        </div>
                    </div>
                )}
            </div>

            {/* Modal */}
            {modal.open && (
                <div className="fixed inset-0 z-[120] bg-slate-900/60 dark:bg-black/70 backdrop-blur-sm flex items-center justify-center p-6">
                    <div className="bg-white dark:bg-slate-900 w-full max-w-6xl rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border dark:border-slate-800">
                        <div className={`p-6 flex justify-between items-center text-white ${currentStyle.headerBg}`}>
                            <div>
                                <h2 className="font-bold text-lg capitalize">{currentStyle.title}</h2>
                                <p className="text-[10px] opacity-80 capitalize tracking-widest">Sovereign Registry Control</p>
                            </div>
                            <button onClick={() => setModal({...modal, open: false})} className="hover:rotate-90 transition-transform bg-white/10 p-1 rounded-full">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-8 max-h-[70vh] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800">
                            <RoleForm form={form} setForm={setForm} mode={modal.mode}/>
                        </div>

                        <div className="p-6 bg-slate-50 dark:bg-slate-800/50 border-t dark:border-slate-800 flex justify-end gap-3">
                            {modal.mode !== 'view' && (
                                <button onClick={() => setModal({...modal, open: false})} className="px-6 py-2 text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-red-500 transition-colors">Discard</button>
                            )}
                            <button onClick={handleSave} className={`px-8 py-2 rounded-lg text-xs font-bold hover:shadow-lg transition-all transform active:scale-95 ${currentStyle.button}`}>
                                {modal.mode === 'view' ? "Close Entry" : modal.mode === 'create' ? "Confirm Creation" : "Save Changes"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}