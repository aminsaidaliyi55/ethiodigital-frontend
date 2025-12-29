// ✅ Import your pre-configured axios instance
import api from "../axios";

/**
 * Fetch Project Performance Report
 */
export const getPerformanceReport = async () => {
    try {
        const response = await api.get("/reports/performance");
        return response.data;
    } catch (error) {
        console.error("Failed to fetch performance report:", error);
        throw error;
    }
};

/**
 * Fetch Team Productivity Report
 */
export const getTeamProductivityReport = async () => {
    try {
        const response = await api.get("/reports/team");
        // Ensure we always return an array to prevent .map() errors in UI
        return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
        console.error("Failed to fetch team productivity:", error);
        throw error;
    }
};

/**
 * Fetch Audit Logs
 */
export const getAuditLogs = async () => {
    try {
        const response = await api.get("/reports/audit");
        return response.data;
    } catch (error) {
        console.error("Failed to fetch audit logs:", error);
        throw error;
    }
};

/**
 * NEW: Fetch Weekly Report Data
 */
export const getWeeklyReport = async () => {
    try {
        const response = await api.get("/reports/weekly");
        return response.data;
    } catch (error) {
        console.error("Failed to fetch weekly report:", error);
        throw error;
    }
};

/**
 * NEW: Fetch Monthly Report Data
 */
export const getMonthlyReport = async () => {
    try {
        const response = await api.get("/reports/monthly");
        return response.data;
    } catch (error) {
        console.error("Failed to fetch monthly report:", error);
        throw error;
    }
};
/**
 * NEW: Fetch Yearly Report Data
 */
export const getYearlyReport = async () => {
    try {
        const response = await api.get("/reports/yearly");
        return response.data;
    } catch (error) {
        console.error("Failed to fetch yearly report:", error);
        throw error;
    }
};