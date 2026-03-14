import api from "./api";

/**
 * PORTFOLIO TAXONOMY SERVICE
 */

export const getCategories = async () => {
    try {
        const response = await api.get("/categories");
        return response.data; // Array of { id, name, color, project_count }
    } catch (error) {
        console.error("Taxonomy Sync Failed:", error);
        throw error;
    }
};

export const createCategory = async (formData) => {
    try {
        const response = await api.post("/categories", formData);
        return response.data;
    } catch (error) {
        console.error("Deployment Failed:", error);
        throw error;
    }
};

export const updateCategory = async (id, formData) => {
    try {
        const response = await api.put(`/categories/${id}`, formData);
        return response.data;
    } catch (error) {
        console.error("Modification Failed:", error);
        throw error;
    }
};

export const deleteCategory = async (id) => {
    try {
        const response = await api.delete(`/categories/${id}`);
        return response.data;
    } catch (error) {
        console.error("System Removal Failed:", error);
        throw error;
    }
};