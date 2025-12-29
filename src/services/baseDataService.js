// src/services/baseDataService.js
import api from "../axios";

// --- MODULES ---
export const getBaseDataModules = async () => {
    try {
        const response = await api.get('/base-data/modules');
        return response.data;
    } catch (error) {
        console.error("Error fetching modules:", error);
        throw error;
    }
};

export const updateBaseDataModule = async (id, updateData) => {
    try {
        console.log(`Updating module ${id} with:`, updateData);
        return { success: true };
    } catch (error) {
        console.error("Error in updateBaseDataModule:", error);
        throw error;
    }
};

// --- ORGANIZATIONS ---
export const getOrganizations = async (page = 1, search = "") => {
    try {
        console.log(`Fetching page ${page} with search: ${search}`);
        return { success: true, data: [] };
    } catch (error) {
        console.error("Error in getOrganizations:", error);
        throw error;
    }
};

export const createOrganization = async (orgData) => {
    try {
        console.log("Creating organization with data:", orgData);
        return { success: true };
    } catch (error) {
        console.error("Error in createOrganization:", error);
        throw error;
    }
};

export const deleteOrganization = async (id) => {
    try {
        console.log("Deleting organization ID:", id);
        return { success: true };
    } catch (error) {
        console.error("Error in deleteOrganization:", error);
        throw error;
    }
};

// --- PRIORITIES (ADD THESE TO FIX THE ERROR) ---

export const getPriorities = async (search = "") => {
    try {
        // const response = await api.get(`/api/priorities?search=${search}`);
        // return response.data;
        console.log("Fetching priorities with search:", search);
        return { success: true, data: [] };
    } catch (error) {
        console.error("Error in getPriorities:", error);
        throw error;
    }
};

export const createPriority = async (priorityData) => {
    try {
        // const response = await api.post('/api/priorities', priorityData);
        // return response.data;
        console.log("Creating priority with data:", priorityData);
        return { success: true };
    } catch (error) {
        console.error("Error in createPriority:", error);
        throw error;
    }
};

export const updatePriority = async (id, priorityData) => {
    try {
        // const response = await api.put(`/api/priorities/${id}`, priorityData);
        // return response.data;
        console.log(`Updating priority ${id} with:`, priorityData);
        return { success: true };
    } catch (error) {
        console.error("Error in updatePriority:", error);
        throw error;
    }
};

export const deletePriority = async (id) => {
    try {
        // const response = await api.delete(`/api/priorities/${id}`);
        // return response.data;
        console.log("Deleting priority ID:", id);
        return { success: true };
    } catch (error) {
        console.error("Error in deletePriority:", error);
        throw error;
    }
};