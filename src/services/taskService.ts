import axios from "axios"; // Or your axios instance

/* =========================
   TASKS CRUD
   ========================= */

// Fetch all tasks
export const getTasks = async () => {
    try {
        const response = await axios.get("/tasks"); // backend endpoint for tasks
        return response.data; // should return array of tasks
    } catch (error) {
        console.error("Failed to fetch tasks:", error);
        throw error;
    }
};

// Fetch a single task by ID
export const getTaskById = async (id: string | number) => {
    try {
        const response = await axios.get(`/tasks/${id}`);
        return response.data;
    } catch (error) {
        console.error("Failed to fetch task:", error);
        throw error;
    }
};

// Create a new task
export const createTask = async (taskData: any) => {
    try {
        const response = await axios.post("/tasks", taskData);
        return response.data;
    } catch (error) {
        console.error("Failed to create task:", error);
        throw error;
    }
};

// Update an existing task
export const updateTask = async (id: string | number, taskData: any) => {
    try {
        const response = await axios.put(`/tasks/${id}`, taskData);
        return response.data;
    } catch (error) {
        console.error("Failed to update task:", error);
        throw error;
    }
};

// Delete a task
export const deleteTask = async (id: string | number) => {
    try {
        const response = await axios.delete(`/tasks/${id}`);
        return response.data;
    } catch (error) {
        console.error("Failed to delete task:", error);
        throw error;
    }
};
