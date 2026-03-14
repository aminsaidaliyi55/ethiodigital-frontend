import api from "../axios";

export const clientService = {
    getAll: async () => {
        const response = await api.get("/clients");
        return response.data;
    },

    fullShopSetup: async (data) => {
        // Backend expects 'shopForm' and 'userForm'
        const payload = {
            shopForm: data.shopForm,
            userForm: data.userForm
        };
        const response = await api.post("/clients/register", payload);
        return response.data;
    },

    update: async (id, data) => {
        // Update uses a flat structure in your controller
        const response = await api.put(`/clients/${id}`, data);
        return response.data;
    },

    delete: async (id) => {
        const response = await api.delete(`/clients/${id}`);
        return response.data;
    }
};