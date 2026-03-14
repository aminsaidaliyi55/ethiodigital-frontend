import React, { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import Footer from "./Footer";

function AppLayout() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isDark, setIsDark] = useState(document.documentElement.classList.contains("dark"));

    // Sync dark mode for the layout background
    useEffect(() => {
        const observer = new MutationObserver(() => {
            setIsDark(document.documentElement.classList.contains("dark"));
        });
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
        return () => observer.disconnect();
    }, []);

    return (
        <div className={`min-h-screen font-sans capitalize transition-colors duration-300 ${isDark ? "bg-[#070D18]" : "bg-[#F8FAFC]"}`}>
            {/* National Ambient Accents */}
            <div className="fixed top-0 right-0 w-[500px] h-[500px] capitalize bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none" />

            <Sidebar isOpen={isSidebarOpen} />

            {/* Main Wrapper: flex-col pushes footer to the bottom */}
            <div className={`flex flex-col capitalize min-h-screen transition-all duration-500 ease-in-out ${isSidebarOpen ? "pl-72" : "pl-24"}`}>

                <Header onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)} />

                {/* STRATEGY:
                  - Removed 'p-6 md:p-10' (The Gap Maker)
                  - Removed 'max-w-7xl' (The Centering Constraint)
                */}
                <main className="flex-grow capitalize flex flex-col">
                    <div className="flex-grow capitalize animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <Outlet />
                    </div>
                </main>

                <Footer />
            </div>
        </div>
    );
}

export default AppLayout;