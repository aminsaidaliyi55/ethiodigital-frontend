import React, { useEffect, useRef } from "react";
import { BrowserRouter, Navigate, Outlet, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import toast, { Toaster } from 'react-hot-toast';

// Layout & Auth
import AppLayout from "./components/Layout/AppLayout";
import LoginPage from "./pages/auth/LoginPage";
import Register from "./pages/auth/Register";

// Pages
import Dashboard from "./pages/Dashboard";
import DocumentVault from "./pages/vault/DocumentVault";
import AllUsers from "./pages/users/AllUsers";
import RolesPermissions from "./pages/users/RolesPermissions";
import NotFound from "./pages/NotFound";
import AuditLogs from "./pages/reports/AuditLogs.jsx";
import Profile from "./pages/profile/Profile.jsx";
import Settings from "./pages/settings/Settings.jsx";

// National Control & Org Pages
import ClientDirectory from "./pages/clients/ClientDirectory.jsx";
import CentralBaseDataPage from "@/pages/basedata/CentralBaseDataPage.jsx";
import Organizations from "./pages/organizations/FederalAdminDashboard.jsx";
import RegionalHierarchy from "./pages/Regions/RegionalHierarchy.jsx";
import ZoneHierarchy from "./pages/Zones/ZoneHierarchy.jsx";
import WoredaHierarchy from "./pages/Woredas/WoredaHierarchy.jsx";
import KebeleHierarchy from "./pages/Kebeles/KebeleHierarchy.jsx";
import OrganizationStructure from "@/pages/organizations/OrganizationStructure.jsx";
import TasksList from "@/pages/tasks/TasksList.jsx";
import IssuesMain from "@/pages/issues/IssuesMain";
import StockInventory from "./pages/operations/requests/StockInventory.jsx";
import Orders from "./pages/operations/requests/Orders.jsx";
import ProductInventory from "@/pages/products/ProductInventory.jsx";
import FederalAdminDashboard from "./pages/organizations/FederalAdminDashboard.jsx";
import LogisticsMain from "@/pages/issues/LogisticsMain.jsx";

const BRAND_LOGO = "http://localhost:5173/uploads/1769603065594-1.jpg";

/**
 * ✅ SESSION PROTECTOR
 */
const SessionTimeout = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const timerRef = useRef(null);

    useEffect(() => {
        const handleLogout = () => {
            const hasUser = localStorage.getItem("user");
            if (hasUser) {
                localStorage.clear();
                toast.error("Security timeout. Please sign in again.", {
                    id: 'session-timeout',
                    style: {
                        borderRadius: '12px',
                        background: '#0F172A',
                        color: '#fff',
                        fontSize: '12px',
                        fontWeight: 'bold'
                    }
                });
                navigate("/login");
            }
        };

        const resetTimer = () => {
            if (timerRef.current) clearTimeout(timerRef.current);
            const isAuthPage = ['/login', '/register'].includes(location.pathname);
            if (!isAuthPage && localStorage.getItem("user")) {
                timerRef.current = setTimeout(handleLogout, 3600000);
            }
        };

        const events = ["mousedown", "mousemove", "keypress", "scroll", "touchstart", "click"];
        events.forEach(event => window.addEventListener(event, resetTimer));
        resetTimer();

        return () => {
            events.forEach(event => window.removeEventListener(event, resetTimer));
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, [location.pathname, navigate]);

    return null;
};

/**
 * ✅ ACCESS GUARD
 * Updated to handle roles from your DB: AUDITOR, KEBELEADMIN, SUPERADMIN, etc.
 */
const ProtectedRoute = ({ allowedRoles = [] }) => {
    const storedData = JSON.parse(localStorage.getItem("user") || "{}");

    if (!storedData.token) return <Navigate to="/login" replace />;

    // Normalize user role to UPPERCASE to match your DB mix (e.g., 'Auditor' -> 'AUDITOR')
    const userRole = String(storedData.user?.role || storedData.role || "").toUpperCase();

    // High-level Admins who can access everything
    const superRoles = ["SUPERADMIN", "FEDERALADMIN", "ADMIN"];
    const isSuperUser = superRoles.includes(userRole);

    if (isSuperUser) return <Outlet />;
    if (allowedRoles.length === 0) return <Outlet />;

    // Check if the normalized user role is in the allowed list
    const hasAccess = allowedRoles.map(r => r.toUpperCase()).includes(userRole);
    return hasAccess ? <Outlet /> : <Navigate to="/dashboard" replace />;
};

export default function App() {
    return (
        <BrowserRouter>
            <SessionTimeout />
            <Toaster
                position="top-right"
                toastOptions={{
                    duration: 4000,
                    style: { padding: '16px', borderRadius: '16px', border: '1px solid #e2e8f0', fontSize: '14px' }
                }}
            />

            <Routes>
                {/* ─── PUBLIC ACCESS ─── */}
                <Route path="/login" element={<LoginPage logo={BRAND_LOGO} />} />
                <Route path="/register" element={<Register />} />
                <Route path="/" element={<Navigate to="/dashboard" replace />} />

                {/* ─── PROTECTED PORTAL ROUTES ─── */}
                <Route element={<AppLayout logo={BRAND_LOGO} />}>

                    {/* 1. MAIN (General Access) */}
                    <Route element={<ProtectedRoute />}>
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/reports" element={<AuditLogs />} />
                        <Route path="/reports/daily" element={<AuditLogs filter="daily" />} />
                        <Route path="/reports/monthly" element={<AuditLogs filter="monthly" />} />
                        <Route path="/reports/yearly" element={<AuditLogs filter="yearly" />} />
                        <Route path="/documents" element={<DocumentVault />} />
                        <Route path="/user/profile" element={<Profile />} />
                    </Route>

                    {/* 2. CATALOG & WAREHOUSE (High Level Only) */}
                    <Route element={<ProtectedRoute allowedRoles={["SUPERADMIN", "FEDERALADMIN"]} />}>
                        <Route path="/settings/types" element={<CentralBaseDataPage tab="categories" />} />
                        <Route path="/inventory/products" element={<ProductInventory filter="products" />} />
                        <Route path="/inventory/units" element={<CentralBaseDataPage tab="units" />} />
                        <Route path="/inventory/stock" element={<StockInventory filter="stock" />} />
                        <Route path="/inventory/warehouses" element={<StockInventory filter="warehouses" />} />
                    </Route>

                    {/* 3. SALES & FINANCE (Admin & Region Level) */}
                    <Route element={<ProtectedRoute allowedRoles={["SUPERADMIN", "FEDERALADMIN", "REGIONALADMIN"]} />}>
                        <Route path="/orders/live" element={<Orders filter="live" />} />
                        <Route path="/orders/history" element={<StockInventory filter="history" />} />
                        <Route path="/orders/returns" element={<IssuesMain filter="returns" />} />
                        <Route path="/finance/promos" element={<IssuesMain filter="promotions" />} />
                        <Route path="/finance/payouts" element={<StockInventory filter="payouts" />} />
                        <Route path="/finance/tax" element={<AuditLogs filter="tax" />} />
                    </Route>

                    {/* 4. SHIPPING & LOGISTICS */}
                    <Route element={<ProtectedRoute allowedRoles={["SUPERADMIN", "FEDERALADMIN", "REGIONALADMIN"]} />}>
                        <Route path="/logistics/track" element={<LogisticsMain filter="tracking" />} />
                        <Route path="/logistics/carriers" element={<ClientDirectory filter="carriers" />} />
                        <Route path="/logistics/routes" element={<IssuesMain filter="routes" />} />
                    </Route>

                    {/* 5. BUSINESSES (Accessible by Zone and Shop Owners) */}
                    <Route element={<ProtectedRoute allowedRoles={["SUPERADMIN", "FEDERALADMIN", "REGIONALADMIN", "ZONEADMIN", "SHOPOWNER"]} />}>
                        <Route path="/business/shops" element={<ClientDirectory />} />
                        <Route path="/business/licensing" element={<StockInventory filter="licensing" />} />
                        <Route path="/business/map" element={<IssuesMain filter="map" />} />
                    </Route>

                    {/* 6. TEAM & HIERARCHY (Includes Kebele Admin) */}
                    <Route element={<ProtectedRoute allowedRoles={["SUPERADMIN", "FEDERALADMIN", "REGIONALADMIN", "ZONEADMIN", "KEBELEADMIN"]} />}>
                        <Route path="/hierarchy/federal" element={<FederalAdminDashboard type="federal" />} />
                        <Route path="/hierarchy/regions" element={<RegionalHierarchy type="regional" />} />
                        <Route path="/hierarchy/zones" element={<ZoneHierarchy type="zone" />} />
                        <Route path="/hierarchy/woredas" element={<WoredaHierarchy type="woreda" />} />
                        <Route path="/hierarchy/kebeles" element={<KebeleHierarchy type="kebele" />} />

                        <Route path="/users/list" element={<AllUsers />} />
                        <Route path="/roles/permissions" element={<RolesPermissions />} />
                        <Route path="/organizations/structure" element={<OrganizationStructure />} />
                    </Route>

                    {/* 7. AUDIT (Field Work - Role: AUDITOR) */}
                    <Route element={<ProtectedRoute allowedRoles={["SUPERADMIN", "FEDERALADMIN", "AUDITOR"]} />}>
                        <Route path="/audit/list" element={<TasksList />} />
                        <Route path="/audit/violations" element={<IssuesMain filter="violations" />} />
                        <Route path="/audit/reports" element={<AuditLogs />} />
                        <Route path="/trade/stock" element={<StockInventory filter="emergency" />} />
                        <Route path="/trade/prices" element={<IssuesMain filter="prices" />} />
                        <Route path="/trade/rules" element={<IssuesMain filter="rules" />} />
                    </Route>

                    {/* 8. SETUP */}
                    <Route element={<ProtectedRoute allowedRoles={["SUPERADMIN", "FEDERALADMIN"]} />}>
                        <Route path="/settings/general" element={<Settings />} />
                    </Route>

                    {/* ─── ERROR 404 ─── */}
                    <Route path="*" element={<NotFound />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}