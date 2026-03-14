import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
};
// Add this log to ProductService.js
export const addInventory = async (data) => {
    console.log("Sending to Backend:", data); // Check this in your browser console
    const response = await axios.post('http://localhost:8000/api/inventory', data);
    return response.data;
};
/**
 * Fetches all products for the inventory and order pages.
 */
export const getProducts = async () => {
    try {
        const res = await axios.get(`${API_URL}/products`, {
            headers: getAuthHeader()
        });
        return res.data;
    } catch (error) {
        console.error("Error fetching products:", error);
        throw error.response?.data || error;
    }
};

/**
 * Optional: Fetch a single product by ID
 */
export const getProductById = async (id) => {
    try {
        const res = await axios.get(`${API_URL}/products/${id}`, {
            headers: getAuthHeader()
        });
        return res.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};