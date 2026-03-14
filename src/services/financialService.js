import axios from 'axios';

const API_URL = 'http://localhost:8000/api/finance';

// Create an instance to apply interceptors
const financeAPI = axios.create({
    baseURL: API_URL,
});

/**
 * AUTH INTERCEPTOR
 * This automatically attaches the token from localStorage to every request.
 */
financeAPI.interceptors.request.use((config) => {
    // Get user object from localStorage (where your login logic stores it)
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const token = user.token;

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

/**
 * BUDGETS
 */
export const getProjectBudget = async (projectId) => {
    const response = await financeAPI.get(`/budget/project/${projectId}`);
    return response.data;
};

export const updateProjectBudget = async (projectId, totalBudget) => {
    const response = await financeAPI.put(`/budget/project/${projectId}`, {
        total_budget: totalBudget
    });
    return response.data;
};

/**
 * EXPENSES
 */
export const getProjectExpenses = async (projectId) => {
    const response = await financeAPI.get(`/expenses/project/${projectId}`);
    return response.data;
};

export const addExpense = async (expenseData) => {
    const response = await financeAPI.post(`/expenses`, expenseData);
    return response.data;
};

export const deleteExpense = async (id) => {
    const response = await financeAPI.delete(`/expenses/${id}`);
    return response.data;
};

/**
 * INVOICES
 */
export const getProjectInvoices = async (projectId) => {
    const response = await financeAPI.get(`/invoices/project/${projectId}`);
    return response.data;
};

export const generateMilestoneInvoice = async (projectId, activityId) => {
    const response = await financeAPI.post(`/invoices/generate`, {
        project_id: projectId,
        activity_id: activityId
    });
    return response.data;
};

export const updateInvoiceStatus = async (invoiceId, status) => {
    const response = await financeAPI.patch(`/invoices/${invoiceId}/status`, {
        status: status
    });
    return response.data;
};

export const updateActivityPaymentStatus = async (activityId, status) => {
    const response = await financeAPI.patch(`/activities/${activityId}/payment-status`, {
        payment_status: status
    });
    return response.data;
};

/**
 * DASHBOARD SUMMARY
 */
export const getGlobalFinancialSummary = async () => {
    try {
        const response = await financeAPI.get(`/summary`);
        return response.data;
    } catch (error) {
        console.error("Sync Error:", error);
        throw error;
    }
};