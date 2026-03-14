import axios from "axios";

/**
 * EDT-MCS API Instance
 * Configured for Sovereign National Portal Communication
 */
const api = axios.create({
    baseURL: "http://localhost:8000/api",
    headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
    },
});

// ✅ Request Interceptor: Injects the National Authority Token
api.interceptors.request.use(
    (config) => {
        try {
            const storedData = localStorage.getItem("user");
            if (storedData) {
                const user = JSON.parse(storedData);
                // Supports both 'token' and 'accessToken' naming conventions
                const token = user.token || user.accessToken;

                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
            }
        } catch (err) {
            console.error("Critical: Auth Interceptor failed to parse user data", err);
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// ✅ Response Interceptor: Handles Session Expiry and Global Errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const { response } = error;

        if (response) {
            // 1. Unauthorized: Session has expired or token is invalid
            if (response.status === 401) {
                if (window.location.pathname !== "/login") {
                    console.warn("Session expired. Redirecting to National Login...");
                    localStorage.clear(); // Clear everything to prevent stale state
                    window.location.href = "/login";
                }
            }

            // 2. Forbidden: User lacks specific administrative rights
            if (response.status === 403) {
                console.error("Access Denied: The current role lacks authority for this endpoint.");
            }

            // 3. Server Error: Helps you debug the 500 error
            if (response.status === 500) {
                console.error("National Server Error (500):", response.data?.message || "Internal Crash");
            }
        } else {
            // Network error (Server is down)
            console.error("Network Error: Cannot connect to the National API.");
        }

        return Promise.reject(error);
    }
);

export default api;