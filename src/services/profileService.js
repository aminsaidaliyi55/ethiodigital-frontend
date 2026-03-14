import axios from "axios";

/* =========================
   PROFILE SERVICES
   ========================= */

/**
 * Fetch current user profile
 */
export const getUserProfile = async () => {
    try {
        const response = await axios.get("/user/profile");
        return response.data;
    } catch (err) {
        console.error("Failed to fetch user profile:", err);
        return {};
    }
};

/**
 * Update current user profile
 * @param {Object} data - { name, email, avatar, password (optional) }
 */
export const updateUserProfile = async (data) => {
    try {
        const response = await axios.put("/user/profile", data);
        return response.data;
    } catch (err) {
        console.error("Failed to update user profile:", err);
        return null;
    }
};
