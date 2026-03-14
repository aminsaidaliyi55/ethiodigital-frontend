import React, { useState, useEffect } from "react";
import ActivityTable from "./ActivityTable"; // Import the component above
import * as api from "../../services/activityService";

function ProjectDashboard() {
    const [activities, setActivities] = useState([]);
    const [selectedProjectId, setSelectedProjectId] = useState("your-id-here");

    useEffect(() => {
        loadData();
    }, [selectedProjectId]);

    const loadData = async () => {
        const response = await api.getProjectActivities(selectedProjectId);
        setActivities(response.activities || []);
    };

    return (
        <div className="p-8 bg-slate-50 min-h-screen">
            <header className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-black text-slate-900">Project Activities</h1>
                    <p className="text-slate-500">Manage work packages and task weights</p>
                </div>
                <button className="bg-indigo-900 text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2">
                    <Plus size={18} /> New Activity
                </button>
            </header>

            {/* CALLING THE SEPARATED COMPONENT */}
            <ActivityTable
                activities={activities}

            />
        </div>
    );
}