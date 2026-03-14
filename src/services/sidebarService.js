import api from "../axios"; // ✅ Standardized to use axios.js

/**
 * Fetches badge counts and statistics for the sidebar.
 * Usually returns an object like: { activities_count: 5, task_count: 12 }
 */
export const getSidebarStats = async () => {
    try {
        const response = await api.get("/sidebar/stats");
        return response.data;
    } catch (error) {
        console.error("Error fetching sidebar stats:", error);
        // Fallback to prevent UI breakage
        return { activities_count: 0 };
    }
};