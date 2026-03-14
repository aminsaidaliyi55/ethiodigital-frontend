import api from "../axios";

export const getProducts = async () => {
    const response = await api.get('/inventory');
    return response.data;
};

// formData contains the File object; Axios handles the boundary automatically
export const createProduct = async (formData) => {
    const response = await api.post('/inventory', formData);
    return response.data;
};

export const updateProduct = async (id, formData) => {
    const response = await api.put(`/inventory/${id}`, formData);
    return response.data;
};

export const deleteProduct = async (id) => {
    const response = await api.delete(`/inventory/${id}`);
    return response.data;
};

export const getShops = async () => {
    const response = await api.get('/shops');
    return response.data;
};

export const getCategories = async () => {
    const response = await api.get('/categories');
    return response.data;
};