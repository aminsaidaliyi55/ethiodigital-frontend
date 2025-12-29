import api from "../axios";

export const clientService = {
    /**
     * Retrieves all client/shop environments.
     * Maps to: GET /api/clients
     */
    getAll: async () => {
        const response = await api.get("/clients");
        return response.data;
    },

    /**
     * Retrieves a single client detail by ID.
     * Maps to: GET /api/clients/:id
     */
    getById: async (id) => {
        const response = await api.get(`/clients/${id}`);
        return response.data;
    },

    /**
     * Orchestrates a full environment deployment including shop,
     * initial branch structure, and admin user credentials.
     * Maps to: POST /api/clients/register
     */
    fullShopSetup: async (data) => {
        try {
            // Explicitly mapping to ensure the backend receives the expected keys
            const payload = {
                shopForm: data.clientForm,
                structureForm: data.structureForm,
                userForm: data.userForm
            };
            const response = await api.post("/clients/register", payload);
            return response.data;
        } catch (error) {
            console.error("Full Shop Setup Failed:", error);
            throw error;
        }
    },

    /**
     * Updates an existing shop profile.
     * Maps to: PUT /api/clients/:id
     */
    update: async (id, data) => {
        const response = await api.put(`/clients/${id}`, data);
        return response.data;
    },

    /**
     * Removes a shop environment from the network.
     * Maps to: DELETE /api/clients/:id
     */
    delete: async (id) => {
        const response = await api.delete(`/clients/${id}`);
        return response.data;
    }
};

export default clientService;