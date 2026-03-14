import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

// --- STOCK REQUESTS ---
export const getAllRequests = async () => {
    try {
        const res = await axios.get(`${API_URL}/requests`, { headers: getAuthHeader() });
        return res.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

export const updateRequestStatus = async (id, data) => {
    const res = await axios.put(`${API_URL}/requests/${id}/status`, data, { headers: getAuthHeader() });
    return res.data;
};

export const deleteRequest = async (id) => {
    const res = await axios.delete(`${API_URL}/requests/${id}`, { headers: getAuthHeader() });
    return res.data;
};

// --- SALES ORDERS ---
export const getOrders = async () => {
    try {
        const res = await axios.get(`${API_URL}/orders`, { headers: getAuthHeader() });
        return res.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

export const updateOrderStatus = async (id, data) => {
    if (!id) throw new Error("Order ID is missing");
    try {
        // Ensure your backend supports PATCH for status updates
        const response = await axios.patch(`${API_URL}/orders/${id}/status`, data, {
            headers: getAuthHeader()
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};