import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { getUsers } from "../../services/userService";
import { createProject } from "../../services/projectService";
import toast from "react-hot-toast";

function CreateProject() {
    const navigate = useNavigate();
    const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);

    const [form, setForm] = useState({
        title: "",
        description: "",
        status: "active",
        start_date: "",
        end_date: "",
        budget: "",
        owner_id: "",
        manager_id: "",
        technical_manager_id: ""
    });

    /* ---------------- FETCH & GROUP USERS ---------------- */
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const { data } = await getUsers();
                setUsers(data?.data ?? data);
            } catch (err) {
                toast.error("Failed to load user directory");
            }
        };
        fetchUsers();
    }, []);

    // Helper to group users by role for the dropdowns
    const groupedUsers = useMemo(() => {
        return users.reduce((acc, user) => {
            const role = user.role || "USER";
            if (!acc[role]) acc[role] = [];
            acc[role].push(user);
            return acc;
        }, {});
    }, [users]);

    /* ---------------- HANDLERS ---------------- */
    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const tid = toast.loading("Registering project...");

        try {
            // Ensure numeric budget
            const payload = { ...form, budget: Number(form.budget) || 0 };
            await createProject(payload);
            toast.success("Project successfully registered", { id: tid });
            navigate("/projects");
        } catch (err) {
            toast.error(err.response?.data?.message || "Unauthorized action", { id: tid });
        } finally {
            setLoading(false);
        }
    };

    // Reusable component for grouped select options
    const RoleGroupedOptions = () => (
        <>
            <option value="">Select personnel...</option>
            {Object.entries(groupedUsers).map(([role, userList]) => (
                <optgroup key={role} label={role.replace("_", " ")}>
                    {userList.map((u) => (
                        <option key={u.id} value={u.id}>
                            {u.name} ({u.email})
                        </option>
                    ))}
                </optgroup>
            ))}
        </>
    );

    return (
        <div className="p-6 max-w-4xl mx-auto bg-slate-50 dark:bg-slate-950 min-h-screen">
            <h1 className="text-2xl font-black uppercase tracking-tight mb-8 text-indigo-900 dark:text-white">
                New Project Registration
            </h1>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white dark:bg-slate-900 p-8 rounded-[2rem] shadow-xl border border-slate-100 dark:border-slate-800">

                <div className="md:col-span-2">
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">Project Title</label>
                    <input type="text" name="title" value={form.title} onChange={handleChange} required className="w-full px-5 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-900 outline-none transition-all font-bold" placeholder="High-level project name" />
                </div>

                <div className="md:col-span-2">
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">Description</label>
                    <textarea name="description" value={form.description} onChange={handleChange} rows={3} className="w-full px-5 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-900 outline-none transition-all font-bold" placeholder="Scope and objectives..." />
                </div>

                {/* --- ASSIGNMENTS WITH ROLE LABELS --- */}
                <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">Assign Owner</label>
                    <select name="owner_id" value={form.owner_id} onChange={handleChange} required className="w-full px-5 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-900 outline-none transition-all font-bold text-sm">
                        <RoleGroupedOptions />
                    </select>
                </div>

                <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">Project Manager</label>
                    <select name="manager_id" value={form.manager_id} onChange={handleChange} required className="w-full px-5 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-900 outline-none transition-all font-bold text-sm">
                        <RoleGroupedOptions />
                    </select>
                </div>

                <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">Technical Manager</label>
                    <select name="technical_manager_id" value={form.technical_manager_id} onChange={handleChange} className="w-full px-5 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-900 outline-none transition-all font-bold text-sm">
                        <RoleGroupedOptions />
                    </select>
                </div>

                <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">Budget (ETB)</label>
                    <input type="number" name="budget" value={form.budget} onChange={handleChange} className="w-full px-5 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-900 outline-none transition-all font-bold" />
                </div>

                <div className="flex gap-4 md:col-span-2 justify-end mt-4">
                    <button type="button" onClick={() => navigate("/projects")} className="px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest text-slate-400 hover:bg-slate-100 transition-all">Cancel</button>
                    <button type="submit" disabled={loading} className="px-10 py-4 rounded-2xl bg-indigo-900 text-white font-black text-xs uppercase tracking-widest hover:bg-indigo-950 disabled:opacity-50 transition-all shadow-lg shadow-indigo-900/20">
                        {loading ? "Syncing..." : "Finalize Registration"}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default CreateProject;