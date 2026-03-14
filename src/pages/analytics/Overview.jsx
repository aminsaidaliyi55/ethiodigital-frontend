import React, { useEffect, useState } from "react";
import { getAnalyticsOverview } from "../../services/analyticsService";

function Overview() {
    const [stats, setStats] = useState({ projects: 0, tasks: 0, completed: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                setLoading(true);
                const data = await getAnalyticsOverview(); // Fetch from backend
                setStats(data);
            } catch (err) {
                console.error("Failed to fetch analytics overview:", err);
                setStats({ projects: 0, tasks: 0, completed: 0 });
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    return (
        <div className="p-6 space-y-6">
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
                Analytics Overview
            </h1>

            {loading ? (
                <p className="text-slate-500">Loading...</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl shadow">
                        <h2 className="text-sm text-slate-500">Projects</h2>
                        <p className="text-2xl font-semibold">{stats.projects}</p>
                    </div>
                    <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl shadow">
                        <h2 className="text-sm text-slate-500">Tasks</h2>
                        <p className="text-2xl font-semibold">{stats.tasks}</p>
                    </div>
                    <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl shadow">
                        <h2 className="text-sm text-slate-500">Completed</h2>
                        <p className="text-2xl font-semibold">{stats.completed}</p>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Overview;
