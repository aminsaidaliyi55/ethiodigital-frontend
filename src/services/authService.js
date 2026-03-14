import axios from "axios";
import { startRegistration } from "@simplewebauthn/browser";

const API_URL = "http://localhost:8000/api";

/**
 * Registers biometrics for the currently logged-in user.
 * This should be called from a "Settings" or "Profile" page.
 */
export const registerFingerprint = async () => {
    try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("You must be logged in to register biometrics.");

        // 1. Get creation options from the backend
        const optionsResponse = await axios.get(`${API_URL}/auth/biometric/register-options`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        // 2. Trigger the native browser prompt (TouchID/FaceID/Windows Hello)
        const localCredential = await startRegistration(optionsResponse.data);

        // 3. Send the credential back to the server for verification and storage
        const verificationResponse = await axios.post(
            `${API_URL}/auth/biometric/register-verify`,
            localCredential,
            { headers: { Authorization: `Bearer ${token}` } }
        );

        return verificationResponse.data;
    } catch (error) {
        console.error("Biometric Registration Error:", error);
        throw error;
    }
};
export const login = async (phoneNumber, password) => {
    try {
        const response = await axios.post(`${API_URL}/auth/login`, {
            phone_number: phoneNumber, // Adjusted to match your DB column
            password: password,
        });

        if (response.data.token) {
            // Store token and user data consistently
            localStorage.setItem("token", response.data.token);
            localStorage.setItem("user", JSON.stringify(response.data.user));
        }

        return response.data;
    } catch (error) {
        console.error(
            "Login Error:",
            error.response?.data || error.message
        );
        throw error;
    }
};

/**
 * Get the currently logged-in user details from the backend.
 * Requires a valid JWT token stored in localStorage.
 */
export const getCurrentUser = async () => {
    try {
        const token = localStorage.getItem("token");

        if (!token) {
            throw new Error("No authentication token found. Please login.");
        }

        const response = await axios.get(`${API_URL}/auth/me`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        return response.data;
    } catch (error) {
        // If the token is invalid or expired (401), clear the local data
        if (error.response?.status === 401) {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
        }

        console.error(
            "Auth Service Error:",
            error.response?.data || error.message
        );
        throw error;
    }
};

/**
 * Clear authentication data and redirect to the login page.
 */
export const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    // Hard redirect to clear any lingering application state
    window.location.href = "/login";
};