import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const getAuthHeaders = (isFormData = false) => {
    const token = localStorage.getItem('token');
    return {
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': isFormData ? 'multipart/form-data' : 'application/json'
        }
    };
};

const issueService = {
    getIssues: async (status = null) => {
        const params = (status && status !== 'all') ? { status } : {};
        const response = await axios.get(`${API_URL}/issues`, { params, ...getAuthHeaders() });
        return response.data;
    },

    getUsers: async (role = null) => {
        const params = role ? { role } : {};
        const response = await axios.get(`${API_URL}/users`, { params, ...getAuthHeaders() });
        return response.data;
    },

    assignTask: async (issueId, assignmentData) => {
        const response = await axios.put(`${API_URL}/issues/assign/${issueId}`, assignmentData, getAuthHeaders());
        return response.data;
    },

    // New: Handle the Request Rework action
    requestRework: async (issueId, reworkData) => {
        const response = await axios.post(`${API_URL}/issues/${issueId}/rework`, reworkData, getAuthHeaders());
        return response.data;
    },

    createIssue: async (issueData) => {
        const formData = new FormData();
        Object.keys(issueData).forEach(key => {
            if (key === 'documents' && issueData[key]) {
                formData.append('documents', issueData[key]);
            } else {
                formData.append(key, issueData[key]);
            }
        });
        const response = await axios.post(`${API_URL}/issues/report`, formData, getAuthHeaders(true));
        return response.data;
    },

    initiateVideoSupport: async (issueId, participantId) => {
        const response = await axios.post(`${API_URL}/support/video/initiate`, { issueId, participantId }, getAuthHeaders());
        return response.data;
    }
};

export default issueService;