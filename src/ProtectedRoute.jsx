import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = ({ requiredPermission }) => {
    // 1. Get the stored data object
    const storedData = JSON.parse(localStorage.getItem("user") || "null");

    // 2. JWT Check: Only redirect to login if there is no token at all
    if (!storedData || !storedData.token) {
        return <Navigate to="/login" replace />;
    }

    // 3. Permission/Role Check
    // Based on your controller, roles are likely in storedData.roles or storedData.user.roles
    const userRoles = storedData.roles || (storedData.user && storedData.user.roles) || [];
    const userPermissions = storedData.permissions || [];

    // Allow access if they have the specific permission OR if they are an Admin
    const hasPermission =
        userPermissions.includes(requiredPermission) ||
        userRoles.some(role => role.toUpperCase() === "ADMIN");

    // 4. Critical: If they are logged in but lack permission,
    // send them to Dashboard, NOT the login page.
    if (requiredPermission && !hasPermission) {
        return <Navigate to="/dashboard" replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;