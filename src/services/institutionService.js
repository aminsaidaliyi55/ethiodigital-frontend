import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000/api';

const institutionService = {
    // Fetch hierarchy data with optional search and level filtering
    getRegionalHierarchy: async (search = '', level = '') => {
        try {
            const response = await axios.get(`${API_URL}/institutions/all/sub-structures`, {
                params: { search, level },
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            return response.data;
        } catch (error) {
            console.error('Fetch Hierarchy Error:', error);
            throw error;
        }
    },
    // src/services/institutionService.js

    updateSubStructure: async (id, formData) => {
        try {
            const response = await axios.put(`${API_URL}/sub-structures/${id}`, formData, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            return response.data;
        } catch (error) {
            console.error('Update Node Error:', error);
            throw error;
        }
    },

    // Create a new administrative node
    createSubStructure: async (formData) => {
        try {
            const response = await axios.post(`${API_URL}/sub-structures`, formData, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            return response.data;
        } catch (error) {
            console.error('Create Node Error:', error);
            throw error;
        }
    },

    // Delete a node
    deleteSubStructure: async (id, level) => {
        try {
            const response = await axios.delete(`${API_URL}/sub-structures/${id}`, {
                params: { level },
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            return response.data;
        } catch (error) {
            console.error('Delete Node Error:', error);
            throw error;
        }
    }
};


export default institutionService;