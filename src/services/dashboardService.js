import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8000/api',
});

// Interceptor to attach Bearer Token
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

/**
 * Fetches the summary data for KPIs and Charts
 */
export const getDashboardSummary = async () => {
    const response = await api.get('/dashboard/summary');
    return response.data;
};

/**
 * Fetches project-specific details
 */
export const getProjectList = async () => {
    const response = await api.get('/dashboard/projects');
    return response.data;
};

export default api;