// src/services/workLogService.js
import api from "./api";

/**
 * Fetch all logs for the currently authenticated user
 */
export const getMyLogs = async () => {
    const response = await api.get("/work-logs/me");
    return response.data;
};

/**
 * Start a new work session
 * This is the function the error says is missing!
 */
export const clockIn = async (logData) => {
    const response = await api.post("/work-logs/clock-in", logData);
    return response.data;
};

/**
 * End an active work session
 */
export const clockOut = async (id) => {
    const response = await api.put(`/work-logs/clock-out/${id}`);
    return response.data;
};
