import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

export const getAllRequests = async () => {
    const res = await axios.get(`${API_URL}/requests`, { headers: getAuthHeader() });
    return res.data;
};

export const updateRequestStatus = async (id, data) => {
    const res = await axios.patch(`${API_URL}/requests/${id}/status`, data, { headers: getAuthHeader() });
    return res.data;
};

export const getOrders = async () => {
    const res = await axios.get(`${API_URL}/orders`, { headers: getAuthHeader() });
    return res.data;
};

export const createOrder = async (orderData) => {
    const res = await axios.post(`${API_URL}/orders`, orderData, { headers: getAuthHeader() });
    return res.data;
};

export const updateOrderManifest = async (id, manifestData) => {
    // 1. Must be .patch to match backend
    // 2. URL must be /orders/${id}/dispatch to match router.patch("/:id/dispatch")
    const res = await axios.patch(
        `${API_URL}/orders/${id}/dispatch`,
        manifestData,
        {
            headers: getAuthHeader()
        }
    );
    return res.data;
};

// Added/Updated updateOrderStatus for the BatchAction component
export const updateOrderStatus = async (id, data) => {
    const res = await axios.patch(
        `${API_URL}/orders/${id}/status`,
        data,
        { headers: getAuthHeader() }
    );
    return res.data;
};

export const updateTransactionPayment = async (id, data) => {
    const response = await axios.patch(
        `${API_URL}/orders/payment/${id}`,
        data,
        { headers: getAuthHeader() }
    );
    return response.data;
};
export const uploadOrderReceipt = async (id, file) => {
    const formData = new FormData();
    formData.append('receipt', file);
    const res = await axios.patch(`${API_URL}/orders/${id}/receipt`, formData, {
        headers: { ...getAuthHeader(), 'Content-Type': 'multipart/form-data' }
    });
    return res.data;
};


// ... existing imports

export const updateShippingDetails = async (id, shippingData) => {
    // shippingData = { courier_id, delivery_address, estimated_delivery, tracking_number }
    const res = await axios.patch(`${API_URL}/orders/${id}/ship`, shippingData, { headers: getAuthHeader() });
    return res.data;
};

export const getLogisticsStats = async () => {
    const res = await axios.get(`${API_URL}/orders/logistics/stats`, { headers: getAuthHeader() });
    return res.data;
};

