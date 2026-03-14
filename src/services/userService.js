import api from "../axios"; // Using your custom instance

/**
 * USER MANAGEMENT
 */

export const getUsers = async () => {
    try {
        const response = await api.get("/users");
        return response.data;
    } catch (error) {
        console.error("Failed to fetch users:", error);
        throw error;
    }
};

export const getCouriers = async () => {
    try {
        // Replace with your actual backend URL
        const response = await axios.get("/api/couriers");
        return response.data;
    } catch (error) {
        console.error("Error fetching couriers:", error);
        throw error;
    }
};

export const getAllUsers = getUsers;

export const getSupportStaff = async () => {
    try {
        const response = await api.get("/users");
        const allUsers = response.data;
        return Array.isArray(allUsers)
            ? allUsers.filter(user => user.role !== 'Client')
            : [];
    } catch (error) {
        console.error("Failed to fetch support staff:", error);
        throw error;
    }
};

export const getUserById = async (id) => {
    try {
        const response = await api.get(`/users/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Failed to fetch user with ID ${id}:`, error);
        throw error;
    }
};

export const createUser = async (data) => {
    try {
        const response = await api.post("/users", data);
        return response.data;
    } catch (error) {
        console.error("Failed to create user:", error);
        throw error;
    }
};

export const updateUser = async (id, data) => {
    try {
        const response = await api.put(`/users/${id}`, data);
        return response.data;
    } catch (error) {
        console.error(`Failed to update user ${id}:`, error);
        throw error;
    }
};

export const deleteUser = async (id) => {
    try {
        const response = await api.delete(`/users/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Failed to delete user ${id}:`, error);
        throw error;
    }
};

/**
 * ROLE MANAGEMENT
 */

export const getRoles = async () => {
    try {
        const response = await api.get("/roles");
        return response.data;
    } catch (error) {
        console.error("Failed to fetch roles:", error);
        throw error;
    }
};

/**
 * LOCATION FETCHING SERVICES
 * Corrected to use the 'api' instance
 */

export const fetchFederals = async () => {
    try {
        const response = await api.get('/locations/federals');
        return response.data;
    } catch (error) {
        console.error("Failed to fetch federals:", error);
        return [];
    }
};

export const fetchRegions = async (federalId) => {
    try {
        const response = await api.get(`/locations/regions?federal_id=${federalId}`);
        return response.data;
    } catch (error) {
        console.error("Failed to fetch regions:", error);
        return [];
    }
};

export const fetchZones = async (regionId) => {
    try {
        const response = await api.get(`/locations/zones?region_id=${regionId}`);
        return response.data;
    } catch (error) {
        console.error("Failed to fetch zones:", error);
        return [];
    }
};

export const fetchWoredas = async (zoneId) => {
    try {
        const response = await api.get(`/locations/woredas?zone_id=${zoneId}`);
        return response.data;
    } catch (error) {
        console.error("Failed to fetch woredas:", error);
        return [];
    }
};

export const fetchKebeles = async (woredaId) => {
    try {
        const response = await api.get(`/locations/kebeles?woreda_id=${woredaId}`);
        return response.data;
    } catch (error) {
        console.error("Failed to fetch kebeles:", error);
        return [];
    }
};

const userService = {
    getUsers,
    getAllUsers,
    getSupportStaff,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
    getRoles,
    fetchFederals,
    fetchRegions,
    fetchZones,
    fetchWoredas,
    fetchKebeles
};

export default userService;