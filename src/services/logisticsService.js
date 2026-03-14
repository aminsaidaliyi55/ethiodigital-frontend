import axios from 'axios';

const API_URL = 'http://localhost:8000/api/logistics';

export const getBatches = () => axios.get(`${API_URL}/batches`).then(res => res.data);

export const updateBatchStatus = (id, data) =>
    axios.patch(`${API_URL}/batches/${id}`, data).then(res => res.data);

/**
 * Creates a logistics batch
 * @param {Object} batchData { items: [], driver_id: 1, transaction_id: "TRX-..." }
 */
export const createBatch = (batchData) =>
    axios.post(`${API_URL}/create-batch`, batchData).then(res => res.data);