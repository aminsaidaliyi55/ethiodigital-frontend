import api from "../axios"; // Assuming your axios instance is in src/services/api.js

export const institutionService = {
    // Get header info for a specific institution
    getInstitutionById: async (id) => {
        const response = await api.get(`/institutions/${id}`);
        return response.data;
    },

    // Get table data (sub-structures)
    getSubStructures: async (institutionId, search = "") => {
        const response = await api.get(`/institutions/${institutionId}/sub-structures`, {
            params: { search }
        });
        return response.data;
    },

    // Get dropdown data for the modal
    getAssignmentLookups: async () => {
        const response = await api.get("/lookups/assignment-data");
        return response.data;
    },
// Add this to your institutionService object
    createSubStructure: async (payload) => {
        const response = await api.post("/sub-structures", payload);
        return response.data;
    },
    // POST assignment
    assignUser: async (payload) => {
        const response = await api.post("/assignments", payload);
        return response.data;
    }
};
