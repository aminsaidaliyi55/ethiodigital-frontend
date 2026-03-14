import React, { useEffect, useState } from "react";
import { getAnalyticsReports } from "../../services/analyticsService";

function Reports() {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchReports = async () => {
            try {
                setLoading(true);
                setError("");
                // Use the correct service function
                const data = await getAnalyticsReports();
                // Ensure data is always an array
                setReports(Array.isArray(data) ? data : data.data || []);
            } catch (err) {
                console.error("Failed to fetch reports:", err);
                setError("Failed to fetch reports from the server.");
                setReports([]);
            } finally {
                setLoading(false);
            }
        };

        fetchReports();
    }, []);

    return (
        <div className="p-6 space-y-6">
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
                Reports
            </h1>
            <p className="text-slate-500">
                Generate and view detailed project & task reports here.
            </p>

            {/* Reports Table */}
            <div className="overflow-x-auto bg-white dark:bg-slate-900 rounded-2xl shadow mt-4">
                <table className="w-full text-sm">
                    <thead className="text-slate-500">
                    <tr>
                        <th className="px-6 py-4 text-left">Project</th>
                        <th className="px-6 py-4 text-left">Total Tasks</th>
                        <th className="px-6 py-4 text-left">Completed</th>
                        <th className="px-6 py-4 text-left">Pending</th>
                        <th className="px-6 py-4 text-left">Deadline</th>
                    </tr>
                    </thead>
                    <tbody>
                    {loading ? (
                        <tr>
                            <td colSpan={5} className="py-10 text-center">
                                Loading...
                            </td>
                        </tr>
                    ) : error ? (
                        <tr>
                            <td colSpan={5} className="py-10 text-center text-red-500">
                                {error}
                            </td>
                        </tr>
                    ) : reports.length === 0 ? (
                        <tr>
                            <td colSpan={5} className="py-10 text-center text-slate-500">
                                No reports found
                            </td>
                        </tr>
                    ) : (
                        reports.map((report) => (
                            <tr
                                key={report.id}
                                className="hover:bg-slate-50 dark:hover:bg-slate-800"
                            >
                                <td className="px-6 py-4 font-medium">{report.project_name}</td>
                                <td className="px-6 py-4">{report.total_tasks}</td>
                                <td className="px-6 py-4">{report.completed_tasks}</td>
                                <td className="px-6 py-4">{report.pending_tasks}</td>
                                <td className="px-6 py-4">{report.deadline || "N/A"}</td>
                            </tr>
                        ))
                    )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default Reports;
