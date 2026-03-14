import React, { useState, useEffect } from "react";
import { getProjects } from "@/services/projectService"; // Your project service
import { Zap } from "lucide-react";

function KanbanBoard() {
    const [projects, setProjects] = useState([]); // initial state as array
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Example columns for Kanban
    const columns = ["Backlog", "In Progress", "Completed"];

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                setLoading(true);
                const data = await getProjects();
                // Ensure it's an array
                setProjects(Array.isArray(data) ? data : data.data ?? []);
            } catch (err) {
                console.error("Failed to fetch projects:", err);
                setError("Failed to load projects.");
            } finally {
                setLoading(false);
            }
        };

        fetchProjects();
    }, []);

    // Group projects by status
    const groupedProjects = columns.reduce((acc, col) => {
        acc[col] = projects.filter(p => p.status === col) || [];
        return acc;
    }, {});

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Kanban Board</h1>

            {loading && <p className="text-slate-500">Loading projects...</p>}
            {error && <p className="text-red-500">{error}</p>}
            {!loading && !error && projects.length === 0 && (
                <p className="text-slate-500">No projects found.</p>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                {columns.map((col) => (
                    <div key={col} className="bg-slate-100 dark:bg-slate-800 rounded-xl p-4 space-y-3">
                        <h2 className="font-semibold text-lg">{col}</h2>
                        <div className="space-y-2">
                            {groupedProjects[col]?.map((project) => (
                                <div
                                    key={project.id}
                                    className="p-3 bg-white dark:bg-slate-700 rounded-lg shadow flex items-center justify-between"
                                >
                                    <span className="font-medium text-slate-900 dark:text-white">
                                        {project.name}
                                    </span>
                                    <Zap className="text-blue-500" />
                                </div>
                            ))}

                            {groupedProjects[col]?.length === 0 && (
                                <p className="text-slate-500 text-sm">No projects</p>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default KanbanBoard;
