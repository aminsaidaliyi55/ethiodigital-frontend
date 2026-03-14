import React, { useEffect, useState } from "react";
import { getAnalyticsInsights } from "../../services/analyticsService";
import { Bar, Line, Pie } from "react-chartjs-2";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    PointElement,
    LineElement,
    ArcElement,
} from "chart.js";

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    ArcElement,
    Title,
    Tooltip,
    Legend
);

function Insights() {
    const [insights, setInsights] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchInsights = async () => {
            try {
                setLoading(true);
                setError("");
                const data = await getAnalyticsInsights();
                setInsights(Array.isArray(data) ? data : data.data || []);
            } catch (err) {
                console.error("Failed to fetch insights:", err);
                setError("Failed to load insights");
                setInsights([]);
            } finally {
                setLoading(false);
            }
        };
        fetchInsights();
    }, []);

    // Example chart data transformation
    const chartData = {
        labels: insights.map((item) => item.label || "N/A"),
        datasets: [
            {
                label: "Metric",
                data: insights.map((item) => item.value || 0),
                backgroundColor: "rgba(59, 130, 246, 0.7)",
            },
        ],
    };

    return (
        <div className="p-6 space-y-6">
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Insights</h1>
            <p className="text-slate-500">
                Visualize KPIs, trends, and analytics insights here.
            </p>

            {loading ? (
                <p className="text-center py-10">Loading...</p>
            ) : error ? (
                <p className="text-center py-10 text-red-500">{error}</p>
            ) : insights.length === 0 ? (
                <p className="text-center py-10 text-slate-500">No insights available</p>
            ) : (
                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow p-4">
                    <Bar data={chartData} options={{ responsive: true, plugins: { legend: { position: "top" } } }} />
                </div>
            )}
        </div>
    );
}

export default Insights;
