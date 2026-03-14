import axios from "../axios";
import api from "../axios";

/**
 * Generic error handler for API transactions
 */
const handleError = (error: any, defaultMessage: string) => {
    const message = error.response?.data?.error || error.response?.data?.message || defaultMessage;
    console.error(`${defaultMessage}:`, message);
    throw new Error(message);
};

/* =========================
   PROJECT CATEGORIES
   ========================= */

export const getProjectCategories = async () => {
    try {
        const response = await api.get("/categories");
        return response.data;
    } catch (error) {
        handleError(error, "Failed to fetch project categories");
    }
};

/* =========================
   PROJECTS CRUD
   ========================= */

export const getProjects = async (params: Record<string, any> = {}) => {
    try {
        const response = await api.get("/projects", { params });
        return response.data;
    } catch (error) {
        handleError(error, "Failed to fetch projects");
    }
};

export const createProject = async (projectData: any) => {
    try {
        const response = await api.post("/projects", projectData);
        return response.data;
    } catch (error) {
        handleError(error, "Failed to create project");
    }
};

export const updateProject = async (id: string | number, projectData: any) => {
    try {
        const response = await api.put(`/projects/${id}`, projectData);
        return response.data;
    } catch (error) {
        handleError(error, "Failed to update project");
    }
};

export const deleteProject = async (id: string | number) => {
    try {
        const response = await api.delete(`/projects/${id}`);
        return response.data;
    } catch (error) {
        handleError(error, "Failed to delete project");
    }
};

/* =========================
   INSTITUTIONS / ORGANIZATIONS
   ========================= */

/**
 * FIXED: Switched to /school-profiles.
 * Many education systems use this specific naming convention.
 */
export const getInstitutions = async () => {
    try {
        const response = await api.get("/school-profiles");
        return response.data;
    } catch (error) {
        handleError(error, "Failed to fetch institutions");
    }
};

/* =========================
   USER MANAGEMENT
   ========================= */

export const getUsers = async () => {
    try {
        const response = await api.get("/users");
        return response.data;
    } catch (error) {
        handleError(error, "Failed to fetch users");
    }
};