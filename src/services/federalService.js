import api from "./api"; // Your uploaded axios instance

const federalService = {
    /**
     * Fetches all federal institutions
     */
    getAllFederals: async () => {
        try {
            const response = await api.get("/federals");
            return response.data; // Returns { success: true, data: [...] }
        } catch (error) {
            throw error;
        }
    },

    /**
     * Fetches dashboard statistics (Regions, Officers, Compliance, etc.)
     */
    getDashboardStats: async () => {
        try {
            const response = await api.get("/federals/stats");
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Create a new federal entry
     * @param {Object} federalData { name, lat, lng }
     */
    createFederal: async (federalData) => {
        try {
            const response = await api.post("/federals", federalData);
            return response.data;
        } catch (error) {
            throw error;
        }
    }
};

export default federalService;