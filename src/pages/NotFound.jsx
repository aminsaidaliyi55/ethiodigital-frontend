import React from "react";
import { Link } from "react-router-dom";

function NotFound() {
    return (
        <div className="flex flex-col items-center justify-center h-screen bg-slate-100 dark:bg-slate-900">
            <h1 className="text-6xl font-bold text-red-600 dark:text-red-400">404</h1>
            <p className="text-xl mt-4 text-slate-700 dark:text-slate-300">
                Page Not Found
            </p>
            <Link
                to="/dashboard"
                className="mt-6 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
            >
                Go Back Home
            </Link>
        </div>
    );
}

export default NotFound;
