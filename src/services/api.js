import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:8000/api",
});

api.interceptors.request.use(
    (config) => {
        // 🔍 IMPORTANT: Double check if your login saves it as "token" or "authToken"
        const token = localStorage.getItem("token") || localStorage.getItem("authToken");

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export default api;