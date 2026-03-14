import React, { useState } from "react";
import { Fingerprint, ShieldCheck, Loader2, AlertCircle } from "lucide-react";
import { registerFingerprint } from "@/services/authService"; // Adjust path as needed

function SecuritySettings() {
    const [status, setStatus] = useState("idle"); // idle, loading, success, error
    const [message, setMessage] = useState("");

    const handleEnrollment = async () => {
        setStatus("loading");
        setMessage("");

        try {
            await registerFingerprint();
            setStatus("success");
            setMessage("Fingerprint successfully linked to your official account.");
        } catch (err) {
            setStatus("error");
            setMessage(err.message);
        }
    };

    return (
        <div className="max-w-md bg-white rounded-[2rem] border border-slate-200 p-8 shadow-sm">
            <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-900">
                    <Fingerprint size={24} />
                </div>
                <div>
                    <h3 className="text-lg font-black text-indigo-900">Biometric Security</h3>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Device Enrollment</p>
                </div>
            </div>

            <div className="space-y-4">
                <p className="text-sm text-slate-600 leading-relaxed font-medium">
                    Secure your portal access by linking your device's fingerprint or face recognition sensor.
                    This allows you to sign in without typing your password.
                </p>

                {status === "success" && (
                    <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center gap-3 text-emerald-700">
                        <ShieldCheck size={20} />
                        <span className="text-xs font-bold">{message}</span>
                    </div>
                )}

                {status === "error" && (
                    <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600">
                        <AlertCircle size={20} />
                        <span className="text-xs font-bold">{message}</span>
                    </div>
                )}

                <button
                    onClick={handleEnrollment}
                    disabled={status === "loading" || status === "success"}
                    className="w-full py-4 bg-indigo-900 hover:bg-indigo-950 text-white font-black rounded-2xl transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                >
                    {status === "loading" ? (
                        <Loader2 className="animate-spin" size={20} />
                    ) : status === "success" ? (
                        "Device Enrolled"
                    ) : (
                        "Enable Biometric Login"
                    )}
                </button>
            </div>
        </div>
    );
}

export default SecuritySettings;