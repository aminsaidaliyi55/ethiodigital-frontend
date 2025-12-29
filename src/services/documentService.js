import axios from 'axios';

const API_URL = "http://localhost:8000/api/documents";

/**
 * GET all documents
 */
export const fetchDocuments = async () => {
    const response = await axios.get(API_URL);
    return response.data;
};

/**
 * POST a new document (Multipart for files)
 */
export const uploadDocument = async (formData) => {
    const response = await axios.post(API_URL, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
};

/**
 * PUT (Update) document metadata
 */
export const updateDocument = async (id, data) => {
    // We send only the metadata (title, category) to the update endpoint
    const response = await axios.put(`${API_URL}/${id}`, data);
    return response.data;
};

/**
 * DELETE a document
 */
export const deleteDocument = async (id) => {
    const response = await axios.delete(`${API_URL}/${id}`);
    return response.data;
};