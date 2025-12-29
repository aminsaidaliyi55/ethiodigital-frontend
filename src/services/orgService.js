import api from "../axios.js";

/**
 * ORGANIZATIONAL STRUCTURE (The "Bones")
 */

// Fetch the complete nested tree for the Sidebar/Navigator
export const getOrgStructure = async () => {
    const response = await api.get("/org/structure");
    return response.data;
};

// Fetch specific details for a single Wing, Division, or Unit
export const getUnitDetails = async (id) => {
    const response = await api.get(`/org/details/${id}`);
    return response.data;
};

// Create a new sub-unit (Organization -> Wing -> Division -> Unit)
export const registerOrgUnit = async (unitData) => {
    // unitData: { name: string, type: string, parent_id: number }
    const response = await api.post("/org/register", unitData);
    return response.data;
};

// Update an existing unit's name
export const updateOrgUnit = async (id, updateData) => {
    const response = await api.put(`/org/${id}`, updateData);
    return response.data;
};

// Delete a unit and all its children (Recursive Delete)
export const deleteOrgUnit = async (id) => {
    const response = await api.delete(`/org/${id}`);
    return response.data;
};

/**
 * PERSONNEL & LEADERSHIP (The "People")
 */

// Fetch all personnel assigned to a specific unit type
export const getUnitPersonnel = async (id, type) => {
    const response = await api.get(`/org/personnel/${id}?type=${type}`);
    return response.data;
};

// Appoint a leader (Wing Director, Division Director, Team Leader, etc.)
export const assignLeadership = async (assignmentData) => {
    /* assignmentData: {
         user_id: number,
         unit_id: number,
         type: string,
         leadership_title: string
       }
    */
    const response = await api.post("/org/assign-leadership", assignmentData);
    return response.data;
};

// Remove a person from a unit and reset their role to 'STAFF'
export const unassignPersonnel = async (userId, type) => {
    const response = await api.post("/org/unassign", { user_id: userId, type });
    return response.data;
};

// Fetch all system users (for the assignment dropdown)
export const getAllUsers = async () => {
    const response = await api.get("/users");
    return response.data;
};