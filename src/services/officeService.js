import axios from 'axios';

// Ensure this matches your backend URL/Port
const API_BASE = 'http://localhost:8000/api/offices';

export const officeService = {
    /**
     * Fetches the complete hierarchical tree
     * constructed from federal, regional, zone, woreda, and kebele tables.
     */
    getAll: async () => {
        try {
            const { data } = await axios.get(API_BASE);
            return Array.isArray(data) ? data : [];
        } catch (error) {
            console.error("Office Service Error (getAll):", error);
            throw error;
        }
    },

    /**
     * Creates a new record in the appropriate table based on payload.type
     */
    create: async (payload) => {
        try {
            const { data } = await axios.post(API_BASE, payload);
            return data;
        } catch (error) {
            console.error("Office Service Error (create):", error);
            throw error;
        }
    },

    /**
     * Updates an existing record
     */
    update: async (id, payload) => {
        try {
            const { data } = await axios.put(`${API_BASE}/${id}`, payload);
            return data;
        } catch (error) {
            console.error("Office Service Error (update):", error);
            throw error;
        }
    },

    /**
     * Deletes a record from the specific table
     */
    remove: async (id, type) => {
        try {
            // We pass type as a query param so the backend knows which table to delete from
            const { data } = await axios.delete(`${API_BASE}/${id}`, { params: { type } });
            return data;
        } catch (error) {
            console.error("Office Service Error (remove):", error);
            throw error;
        }
    }
};