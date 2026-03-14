import React, { useState } from "react";
import RouteList from "./RouteList";
import RouteDetail from "./RouteDetail";
import AddRoute from "./AddRoute";

const RoutesMain = ({ filter }) => {
    // We use 'view' to switch between the list, seeing details, or adding a new one
    const [view, setView] = useState("list");
    const [selectedRoute, setSelectedRoute] = useState(null);

    return (
        <div className="w-full">
            {/* 1. Show the list of all routes */}
            {view === "list" && (
                <RouteList
                    filter={filter}
                    onViewDetails={(route) => {
                        setSelectedRoute(route);
                        setView("details"); // Show the specific route details
                    }}
                    onAddNew={() => setView("add")} // Show the form to add a new route
                />
            )}

            {/* 2. Show details for a specific route (like distance, stops, or driver) */}
            {view === "details" && (
                <RouteDetail
                    route={selectedRoute}
                    onBack={() => setView("list")}
                />
            )}

            {/* 3. Show the form to create a new delivery route */}
            {view === "add" && (
                <AddRoute
                    onBack={() => setView("list")}
                    onSuccess={() => {
                        // After successfully adding, go back to the list
                        setView("list");
                    }}
                />
            )}
        </div>
    );
};

export default RoutesMain;