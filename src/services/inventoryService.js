import api from "../axios";

// PRODUCTS
export const getProducts = async () => {
    const response = await api.get('/inventory');
    return response.data;
};

export const createProduct = async (productData) => {
    const response = await api.post('/inventory', productData);
    return response.data;
};

export const updateProduct = async (id, productData) => {
    // Ensure ID is passed correctly
    const response = await api.put(`/inventory/${id}`, productData);
    return response.data;
};

export const deleteProduct = async (id) => {
    try {
        // Critical: Check if ID exists before calling
        if (!id) throw new Error("Missing product ID for deletion");
        const response = await api.delete(`/inventory/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Failed to delete product ${id}:`, error.response?.data || error.message);
        throw error;
    }
};

// SUPPORTING DATA
export const getShops = async () => {
    const response = await api.get('/shops');
    return response.data;
};

export const getCategories = async () => {
    const response = await api.get('/categories');
    return response.data;
};