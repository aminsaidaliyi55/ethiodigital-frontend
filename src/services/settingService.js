import axios from "axios";

/* =========================
   SETTINGS SERVICES
   ========================= */

/**
 * Fetch system settings
 */
export const getSystemSettings = async () => {
    try {
        const response = await axios.get("/system/settings");
        return response.data;
    } catch (err) {
        console.error("Failed to fetch system settings:", err);
        return {};
    }
};

/**
 * Update system settings
 * @param {Object} data - settings data
 */
export const updateSystemSettings = async (data) => {
    try {
        const response = await axios.put("/system/settings", data);
        return response.data;
    } catch (err) {
        console.error("Failed to update system settings:", err);
        return null;
    }
};
