import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
    LayoutGrid,
    Users2,
    ShieldCheck,
    Store,
    PackageSearch,
    MapPin,
    BarChart3,
    Settings,
    LogOut,
    Landmark,
    Layers,
    Tags,
    Briefcase,
    Network,
    UserCog,
    ChevronDown,
    ChevronRight,
    ClipboardCheck,
    AlertOctagon,
    FileText,
    Globe,
    Scale,
    GitGraph,
    Building2,
    CircleDot,
    ShoppingCart,
    Truck,
    Wallet,
    Boxes,
    Warehouse,
    BadgePercent,
    CalendarDays,
    CalendarRange,
    CalendarClock
} from "lucide-react";

const menuConfig = [
    {
        section: "Overview",
        items: [
            { id: "dashboard", icon: LayoutGrid, label: "Dashboard", link: "/dashboard" },
            {
                id: "reports",
                icon: BarChart3,
                label: "Reports & Analytics",
                link: "/reports",
                children: [
                    { id: "daily-reports", label: "Daily Reports", link: "/reports/daily" },
                    { id: "monthly-reports", label: "Monthly Reports", link: "/reports/monthly" },
                    { id: "yearly-reports", label: "Yearly Reports", link: "/reports/yearly" }
                ]
            },
            { id: "documents", icon: FileText, label: "Documents", link: "/documents" }
        ]
    },

    // ================= CATALOG =================
    {
        section: "Catalog",
        items: [
            { id: "categories", icon: Tags, label: "Categories", link: "/settings/types" },
            {
                id: "products",
                icon: PackageSearch,
                label: "Products",
                link: "/inventory/products"
            },
            { id: "units", icon: Layers, label: "Units of Measure", link: "/inventory/units" }
        ]
    },

    // // ================= INVENTORY =================
    // {
    //     section: "Inventory",
    //     items: [
    //         { id: "stock", icon: Boxes, label: "Stock Levels", link: "/inventory/stock" },
    //         { id: "warehouses", icon: Warehouse, label: "Warehouses", link: "/inventory/warehouses" },
    //         {
    //             id: "strategic-stock",
    //             icon: BadgePercent,
    //             label: "Strategic Stock",
    //             link: "/trade/stock"
    //         }
    //     ]
    // },

    // ================= ORDERS & SALES =================
    {
        section: "Orders & Sales",
        items: [
            {
                id: "orders",
                icon: ShoppingCart,
                label: "Orders",
                link: "/orders",
                children: [
                    { id: "live-orders", label: "Active Orders", link: "/orders/live" },
                    // { id: "history", label: "Order History", link: "/orders/history" },
                    // { id: "returns", label: "Returns", link: "/orders/returns" }
                ]
            },
            // {
            //     id: "promotions",
            //     icon: BadgePercent,
            //     label: "Promotions",
            //     link: "/finance/promos"
            // }
        ]
    },

    // ================= PAYMENTS =================
    // {
    //     section: "Finance",
    //     items: [
    //         {
    //             id: "payments",
    //             icon: Wallet,
    //             label: "Payments",
    //             link: "/finance",
    //             children: [
    //                 { id: "payouts", label: "Merchant Payouts", link: "/finance/payouts" },
    //                 { id: "taxation", label: "Tax & Revenue", link: "/finance/tax" },
    //                 { id: "prices", label: "Price Watch", link: "/trade/prices" }
    //             ]
    //         }
    //     ]
    // },

    // ================= SHIPPING =================
    {
        section: "Shipping & Logistics",
        items: [
            {
                id: "logistics",
                icon: Truck,
                label: "Logistics",
                link: "/logistics",
                children: [
                    { id: "tracking", label: "Live Tracking", link: "/logistics/track" },
                    { id: "carriers", label: "Delivery Partners", link: "/logistics/carriers" },
                    { id: "routes", label: "Route Optimization", link: "/logistics/routes" }
                ]
            }
        ]
    },

    // ================= BUSINESS / MARKET =================
    {
        section: "Market Management",
        items: [
            {
                id: "business",
                icon: Store,
                label: "Business Registry",
                link: "/business",
                children: [
                    { id: "shops", label: "Shops", link: "/business/shops" },
                    // { id: "licensing", label: "Licenses", link: "/business/licensing" },
                    // { id: "map", label: "Map View", link: "/business/map" }
                ]
            }
        ]
    },

    // ================= ORGANIZATION =================
    {
        section: "Organization",
        items: [
            {
                id: "locations",
                icon: Landmark,
                label: "Locations",
                link: "/hierarchy",
                children: [
                    { id: "federal", label: "Areas Management", link: "/hierarchy/federal" },

                ]
            },
            {
                id: "users",
                icon: Users2,
                label: "Users & Roles",
                link: "/admin",
                children: [
                    { id: "staff", label: "User Accounts", link: "/users/list" },
                    { id: "roles", label: "Roles and Permission", link: "/roles/permissions" },
                    // { id: "departments", label: "Departments", link: "/organizations/structure" }
                ]
            }
        ]
    },

    // ================= COMPLIANCE =================
    // {
    //     section: "Compliance",
    //     items: [
    //         {
    //             id: "inspections",
    //             icon: ClipboardCheck,
    //             label: "Inspections",
    //             link: "/audit",
    //             children: [
    //                 { id: "audits", label: "Site Audits", link: "/audit/list" },
    //                 { id: "violations", label: "Violations", link: "/audit/violations" },
    //                 { id: "reports-audit", label: "Reports", link: "/audit/reports" },
    //                 { id: "regulations", label: "Regulations", link: "/trade/rules" }
    //             ]
    //         }
    //     ]
    // },

    // ================= SETTINGS =================
    // {
    //     section: "Settings",
    //     items: [
    //         { id: "system", icon: Settings, label: "System Setup", link: "/settings/general" }
    //     ]
    // }
];



const Sidebar = ({ isOpen }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const [isDark, setIsDark] = useState(document.documentElement.classList.contains("dark"));
    const [expandedMenus, setExpandedMenus] = useState({});

    useEffect(() => {
        const observer = new MutationObserver(() => {
            setIsDark(document.documentElement.classList.contains("dark"));
        });
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
        return () => observer.disconnect();
    }, []);

    const toggleMenu = (menuId) => {
        setExpandedMenus(prev => ({ ...prev, [menuId]: !prev[menuId] }));
    };

    const COLORS = {
        primary: "text-indigo-900 dark:text-white",
        activeBg: "bg-indigo-900 dark:bg-indigo-800 shadow-lg shadow-indigo-200 dark:shadow-none",
        activeIcon: "text-[#FCE300]",
        activeText: "text-white",
        inactiveText: "text-slate-500 dark:text-slate-400",
        hoverBg: "hover:bg-indigo-50 dark:hover:bg-slate-800",
        sectionLabel: "text-indigo-900/40 dark:text-slate-500",
        border: "border-slate-100 dark:border-slate-800",
        sidebarBg: "bg-white dark:bg-slate-900"
    };

    return (
        <aside className={`fixed inset-y-0 left-0 z-[110] transition-all duration-500 ease-in-out flex flex-col border-r ${COLORS.sidebarBg} ${COLORS.border} ${isOpen ? "w-72" : "w-24"}`}>

            {/* BRANDING */}
            <div className="h-24 flex items-center px-6 shrink-0">
                <div className="flex items-center gap-4">
                    <div className="min-w-[44px] h-11 bg-gradient-to-tr from-[#068D46] via-[#FCE300] to-[#E52521] p-[2.5px] rounded-2xl">
                        <div className={`w-full h-full rounded-[13px] flex items-center justify-center ${isDark ? "bg-slate-900" : "bg-white"}`}>
                            <Building2 size={20} className={isDark ? "text-white" : "text-indigo-900"} />
                        </div>
                    </div>
                    {isOpen && (
                        <div className="animate-in fade-in slide-in-from-left-2 duration-500">
                            <h1 className={`font-black text-sm tracking-widest uppercase italic ${COLORS.primary}`}>
                                EDT <span className="text-[#068D46]">M</span><span className="text-[#FCE300]">C</span><span className="text-[#E52521]">S</span>
                            </h1>
                            <p className="text-slate-400 text-[9px] font-black tracking-[0.2em] uppercase mt-1">Sovereign Portal</p>
                        </div>
                    )}
                </div>
            </div>

            {/* NAVIGATION */}
            <nav className="flex-1 px-4 space-y-8 overflow-y-auto scrollbar-hide pt-4">
                {menuConfig.map((section) => (
                    <div key={section.section} className="space-y-3">
                        {isOpen ? (
                            <p className={`px-4 text-[11px] font-black uppercase tracking-[0.15em] ${COLORS.sectionLabel}`}>
                                {section.section}
                            </p>
                        ) : (
                            <div className="h-[1px] mx-4 bg-slate-100 dark:bg-slate-800" />
                        )}

                        <div className="space-y-1">
                            {section.items.map((item) => {
                                const hasChildren = item.children && item.children.length > 0;
                                const isExpanded = expandedMenus[item.id];
                                const isActive = location.pathname === item.link || (hasChildren && item.children.some(c => location.pathname === c.link));

                                return (
                                    <div key={item.id} className="space-y-1">
                                        <button
                                            onClick={() => hasChildren ? toggleMenu(item.id) : navigate(item.link)}
                                            className={`w-full flex items-center py-3.5 rounded-2xl transition-all relative group
                                                ${isOpen ? "px-4 gap-4" : "justify-center"} 
                                                ${isActive && !hasChildren ? COLORS.activeBg : `${COLORS.inactiveText} ${COLORS.hoverBg}`}
                                            `}
                                        >
                                            <item.icon size={22} className={isActive && !hasChildren ? COLORS.activeIcon : "group-hover:text-indigo-900"} />

                                            {isOpen && (
                                                <div className="flex-1 flex items-center justify-between">
                                                    <span className={`text-[14.5px] tracking-tight ${isActive ? `font-black ${isActive && !hasChildren ? 'text-white' : 'text-indigo-900'}` : "font-bold"}`}>
                                                        {item.label}
                                                    </span>
                                                    {hasChildren && (
                                                        <div className={`transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`}>
                                                            <ChevronDown size={16} />
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </button>

                                        {/* SUB-ITEMS (CHILDREN) */}
                                        {isOpen && hasChildren && isExpanded && (
                                            <div className="ml-9 mt-1 space-y-1 border-l-2 border-slate-50 dark:border-slate-800 pl-2 animate-in slide-in-from-top-2 duration-300">
                                                {item.children.map((child) => {
                                                    const isChildActive = location.pathname === child.link;
                                                    return (
                                                        <button
                                                            key={child.id}
                                                            onClick={() => navigate(child.link)}
                                                            className={`w-full flex items-center py-2.5 px-4 rounded-xl text-[13.5px] transition-all
                                                                ${isChildActive
                                                                ? "font-black text-indigo-900 bg-indigo-50/50 dark:bg-indigo-500/10 dark:text-indigo-300"
                                                                : "font-semibold text-slate-400 hover:text-indigo-600 hover:bg-slate-50 dark:hover:bg-slate-800"}`}
                                                        >
                                                            <CircleDot size={9} className={`mr-3 ${isChildActive ? 'text-indigo-600' : 'opacity-20'}`} />
                                                            {child.label}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </nav>

            {/* LOGOUT */}
            <div className={`p-4 mt-auto border-t ${isDark ? "border-slate-800" : "border-slate-50"}`}>
                <button
                    onClick={() => navigate("/login")}
                    className={`w-full flex items-center py-4 rounded-2xl transition-all font-black group
                        ${isOpen ? "px-6 gap-4" : "justify-center px-0"}
                        text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10`}
                >
                    <LogOut size={22} className="group-hover:-translate-x-1 transition-transform" />
                    {isOpen && <span className="text-[12px] uppercase tracking-[0.2em]">Logout</span>}
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;