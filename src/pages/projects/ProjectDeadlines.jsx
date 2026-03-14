import React, { useState, useEffect } from "react";
import { getProjects } from "@/services/projectService"; // Project service
import { CalendarDays } from "lucide-react";

function ProjectDeadlines() {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                setLoading(true);
                const data = await getProjects();
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

    const today = new Date();

    const getStatus = (deadline) => {
        const d = new Date(deadline);
        if (d < today) return "Overdue";
        if ((d - today) / (1000 * 60 * 60 * 24) <= 7) return "Due Soon";
        return "On Track";
    };

    const getStatusColor = (status) => {
        switch (status) {
            case "Overdue":
                return "text-red-600";
            case "Due Soon":
                return "text-yellow-600";
            default:
                return "text-green-600";
        }
    };

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Project Deadlines</h1>

            {loading && <p className="text-slate-500">Loading projects...</p>}
            {error && <p className="text-red-500">{error}</p>}
            {!loading && !error && projects.length === 0 && (
                <p className="text-slate-500">No projects found.</p>
            )}

            <div className="overflow-x-auto bg-white dark:bg-slate-900 rounded-xl shadow mt-4">
                <table className="w-full text-sm">
                    <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    <tr>
                        <th className="px-4 py-3 text-left">Project Name</th>
                        <th className="px-4 py-3 text-left">Deadline</th>
                        <th className="px-4 py-3 text-left">Status</th>
                    </tr>
                    </thead>
                    <tbody>
                    {projects.map((project) => {
                        const status = getStatus(project.deadline);
                        return (
                            <tr key={project.id} className="border-t border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition">
                                <td className="px-4 py-3 font-medium text-slate-800 dark:text-white">{project.name}</td>
                                <td className="px-4 py-3">{new Date(project.deadline).toLocaleDateString()}</td>
                                <td className={`px-4 py-3 font-semibold ${getStatusColor(status)}`}>
                                    {status}
                                </td>
                            </tr>
                        );
                    })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default ProjectDeadlines;
