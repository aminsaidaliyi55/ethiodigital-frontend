import React, { useEffect, useState } from "react";
import { getSystemSettings, updateSystemSettings } from "../../services/settingService";

function Settings() {
    const [settings, setSettings] = useState({ siteName: "", timezone: "UTC" });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSettings = async () => {
            const data = await getSystemSettings();
            setSettings(data);
            setLoading(false);
        };
        fetchSettings();
    }, []);

    const handleChange = (e) => setSettings({ ...settings, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        await updateSystemSettings(settings);
        alert("Settings updated successfully!");
    };

    if (loading) return <div className="p-6">Loading settings...</div>;

    return (
        <div className="p-6 space-y-6">
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white">System Settings</h1>
            <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
                <input
                    name="siteName"
                    value={settings.siteName}
                    onChange={handleChange}
                    placeholder="Site Name"
                    className="w-full px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800"
                />
                <select
                    name="timezone"
                    value={settings.timezone}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800"
                >
                    <option value="UTC">UTC</option>
                    <option value="Africa/Addis_Ababa">Africa/Addis_Ababa</option>
                    <option value="America/New_York">America/New_York</option>
                    <option value="Europe/London">Europe/London</option>
                </select>
                <button type="submit" className="px-4 py-2 rounded-xl bg-blue-600 text-white">
                    Save Settings
                </button>
            </form>
        </div>
    );
}

export default Settings;
