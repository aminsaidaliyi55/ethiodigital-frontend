import axios from "../axios";

// Roles
export const getRoles = async () => {
    const res = await axios.get("/roles");
    return res.data;
};

export const createRole = async (roleData) => {
    const res = await axios.post("/roles", roleData);
    return res.data;
};

export const updateRole = async (id, roleData) => {
    const res = await axios.put(`/roles/${id}`, roleData);
    return res.data;
};

export const deleteRole = async (id) => {
    const res = await axios.delete(`/roles/${id}`);
    return res.data;
};

/* ---------------- PERMISSIONS ---------------- */
/* ---------------- PERMISSIONS ---------------- */
export const getPermissions = async () => {
    try {
        // Update the path to include /roles if that is how your backend is mounted
        const res = await axios.get("/roles/permissions");
        return res.data;
    } catch (err) {
        console.error("Failed to fetch permissions:", err);
        return [];
    }
};