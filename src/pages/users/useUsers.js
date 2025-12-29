import { useState, useEffect, useCallback, useMemo } from "react";
import { getUsers, createUser, updateUser, getRoles, deleteUser } from "@/services/userService";
import toast from "react-hot-toast";

export const useUsers = () => {
    const [users, setUsers] = useState([]);
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [modalState, setModalState] = useState(null);
    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);

    const initialFormState = { id: "", name: "", email: "", phone_number: "", password: "", roles: [], is_active: true };
    const [form, setForm] = useState(initialFormState);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [u, r] = await Promise.all([getUsers(), getRoles()]);
            setUsers(u?.data || u || []);
            setRoles(r?.data || r || []);
        } catch (err) { toast.error("Failed to fetch registry data"); }
        finally { setLoading(false); }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    const filteredUsers = useMemo(() => users.filter(user =>
        user.name?.toLowerCase().includes(search.toLowerCase()) ||
        user.email?.toLowerCase().includes(search.toLowerCase()) ||
        user.phone_number?.includes(search)
    ), [users, search]);

    const handleSave = async () => {
        if (!form.name.trim() || !form.email.includes('@')) return toast.error("Valid Name and Email required");
        if (modalState === 'create' && (!form.password || form.password.length < 6)) return toast.error("Password too short");

        const tid = toast.loading("Processing...");
        try {
            const payload = { ...form, role_id: form.roles[0] };
            modalState === 'create' ? await createUser(payload) : await updateUser(form.id, payload);
            toast.success("Success", { id: tid });
            setModalState(null);
            fetchData();
        } catch (e) { toast.error("Operation failed", { id: tid }); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Revoke access?")) return;
        try {
            await deleteUser(id);
            toast.success("Identity removed");
            fetchData();
        } catch (err) { toast.error("Delete failed"); }
    };

    return {
        users: filteredUsers, roles, loading, modalState, setModalState,
        search, setSearch, currentPage, setCurrentPage, form, setForm,
        initialFormState, handleSave, handleDelete, fetchData
    };
};