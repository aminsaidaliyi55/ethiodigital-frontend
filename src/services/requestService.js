import api from "../axios";

// Fetch all requests (Admin/Manager view)
export const getAllRequests = async () => {
    const res = await api.get("/requests");
    return res.data;
};

// Update request status (Approve/Reject)
export const updateRequestStatus = async (id, data) => {
    const res = await api.patch(`/requests/${id}/status`, data);
    return res.data;
};

// Fetch requests for a specific client
export const getMyRequests = async () => {
    const res = await api.get("/requests/my-requests");
    return res.data;
};

// Create a new request
export const createRequest = async (data) => {
    const res = await api.post("/requests", data);
    return res.data;
};

/** * ADD THESE TWO FUNCTIONS BELOW
 * TO FIX THE SYNTAX ERROR
 **/

// Update an existing request (Edit)
export const updateRequest = async (id, data) => {
    const res = await api.put(`/requests/${id}`, data);
    return res.data;
};

// Delete a request permanently
export const deleteRequest = async (id) => {
    const res = await api.delete(`/requests/${id}`);
    return res.data;
};