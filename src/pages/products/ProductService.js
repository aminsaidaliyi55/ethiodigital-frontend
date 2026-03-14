import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

const inventoryAPI = axios.create({
    baseURL: API_BASE_URL,
});

inventoryAPI.interceptors.request.use((config) => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const token = user.token || user.accessToken;
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

const prepareProductFormData = (productData) => {
    const formData = new FormData();
    formData.append('name', productData.name || "");
    formData.append('sku', productData.sku || "");
    formData.append('selling_price', productData.selling_price || 0);
    formData.append('stock_quantity', productData.stock_quantity || 0);
    formData.append('description', productData.description || "");
    formData.append('size', productData.size || "");
    formData.append('color', productData.color || "");
    formData.append('category_id', (productData.category_id && productData.category_id !== 'undefined') ? productData.category_id : "");
    formData.append('shop_id', (productData.shop_id && productData.shop_id !== 'undefined') ? productData.shop_id : "");

    if (productData.image instanceof File) {
        formData.append('image', productData.image);
    }
    return formData;
};

// --- PRODUCT SERVICES ---
export const getProducts = () => inventoryAPI.get('/inventory').then(res => res.data);

export const createProduct = (productData) => {
    const formData = prepareProductFormData(productData);
    return inventoryAPI.post('/inventory', formData).then(res => res.data);
};

export const updateProduct = (id, productData) => {
    if (!id) throw new Error("Product ID is undefined");
    const formData = prepareProductFormData(productData);
    return inventoryAPI.post(`/inventory/${id}`, formData).then(res => res.data);
};

export const deleteProduct = (id) => inventoryAPI.delete(`/inventory/${id}`).then(res => res.data);

// --- ORDER SERVICES ---
// --- ORDER SERVICES ---
/**
 * @param {Object} orderData
 * Expects: { total_amount, payment_method, transaction_id, items: [...] }
 */
export const createOrder = (orderData) => {
    return inventoryAPI.post('/orders', orderData).then(res => res.data);
};

// --- LOOKUP SERVICES ---
export const getCategories = () => inventoryAPI.get('/categories').then(res => res.data);
export const getShops = () => inventoryAPI.get('/shops').then(res => res.data);