import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    User,
    Mail,
    Lock,
    Eye,
    EyeOff,
    Fingerprint,
    Loader2,
    ArrowRight,
    Landmark,
    ShieldCheck,
    CheckCircle2,
    X
} from "lucide-react";
import axios from "axios";

function Register() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        role_id: "",
    });

    const [roles, setRoles] = useState([]);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    // Biometric Modal State
    const [showBioModal, setShowBioModal] = useState(false);
    const [isEnrolling, setIsEnrolling] = useState(false);
    const [enrolledSuccess, setEnrolledSuccess] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        const fetchRoles = async () => {
            try {
                const res = await axios.get("http://localhost:8000/api/roles");
                setRoles(res.data);
            } catch (err) {
                console.error("Failed to load roles", err);
            }
        };
        fetchRoles();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const { name, email, password, confirmPassword, role_id } = formData;

        if (!name || !email || !password || !confirmPassword || !role_id) {
            setError("All fields are required");
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        setError("");
        setIsLoading(true);

        try {
            const response = await axios.post(
                "http://localhost:8000/api/auth/register",
                {
                    name,
                    email,
                    password,
                    role_ids: [role_id]
                }
            );

            const token = response.data.token;
            if (token) {
                localStorage.setItem("authToken", token);
                localStorage.setItem("user", JSON.stringify(response.data.user));
            }

            // After registration, offer Biometric Enrollment
            setIsLoading(false);
            setShowBioModal(true);
        } catch (err) {
            setIsLoading(false);
            setError(err.response?.data?.error || "Registration failed");
        }
    };

    const handleBiometricEnroll = async () => {
        setIsEnrolling(true);
        try {
            // Mocking WebAuthn Enrollment process
            await new Promise(resolve => setTimeout(resolve, 2000));
            setEnrolledSuccess(true);
            setTimeout(() => navigate("/dashboard"), 1500);
        } catch (err) {
            console.error("Biometric enrollment failed", err);
            setIsEnrolling(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 md:p-6 relative overflow-hidden font-sans">
            {/* Theme Ambiance */}
            <div className="absolute top-[-10%] left-[-5%] w-[600px] h-[600px] bg-indigo-900/10 rounded-full blur-[120px]" />
            <div className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] bg-[#068D46]/5 rounded-full blur-[100px]" />

            <div className="w-full max-w-5xl flex flex-col md:flex-row bg-white rounded-[2.5rem] border border-slate-200 shadow-[0_40px_100px_rgba(30,41,59,0.15)] overflow-hidden z-10 relative">

                {/* Left Side: National Identity */}
                <div className="w-full md:w-[45%] p-8 md:p-12 flex flex-col justify-between relative bg-indigo-900">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-800 to-indigo-950 opacity-100" />
                    <div className="relative z-20">
                        <div className="flex items-center gap-3 mb-10">
                            <div className="p-2.5 bg-white/10 rounded-xl border border-white/20">
                                <Landmark size={20} className="text-[#FCE300]" />
                            </div>
                            <div>
                                <h3 className="text-white font-black text-xs uppercase tracking-[0.3em]">Federal Republic</h3>
                                <p className="text-indigo-300 text-[9px] font-bold uppercase tracking-widest">Digital Trade Portal</p>
                            </div>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black text-white leading-tight mb-6 tracking-tight">
                            Join the <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#068D46] via-[#FCE300] to-[#E52521]">Future.</span>
                        </h1>
                        <p className="text-indigo-200/70 text-sm leading-relaxed max-w-xs font-medium">
                            Create your official account for the Ethio Digital Trading & Market Control System.
                        </p>
                    </div>

                    <div className="mt-8 pt-6 border-t border-white/10 relative z-20">
                        <p className="text-[9px] text-indigo-400 font-bold uppercase tracking-[0.4em]">Official Government System</p>
                    </div>
                </div>

                {/* Right Side: Registration Form */}
                <div className="w-full md:w-[55%] bg-white p-8 md:p-12 flex flex-col justify-center">
                    <div className="w-full max-w-md mx-auto">
                        <header className="mb-8">
                            <h2 className="text-2xl font-black text-indigo-900 mb-2">Create Account</h2>
                            <p className="text-slate-400 text-sm font-semibold">Enter your details to register on the national portal.</p>
                        </header>

                        {error && (
                            <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 text-xs font-bold rounded-2xl flex items-center gap-3">
                                <div className="h-2 w-2 bg-red-600 rounded-full" />
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Name */}
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                                    <div className="relative group">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors" size={16} />
                                        <input type="text" name="name" value={formData.name} onChange={handleChange} required className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-indigo-900 focus:bg-white focus:border-indigo-600 outline-none transition-all font-bold text-sm" placeholder="John Doe" />
                                    </div>
                                </div>

                                {/* Email */}
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                                    <div className="relative group">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors" size={16} />
                                        <input type="email" name="email" value={formData.email} onChange={handleChange} required className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-indigo-900 focus:bg-white focus:border-indigo-600 outline-none transition-all font-bold text-sm" placeholder="email@example.com" />
                                    </div>
                                </div>
                            </div>

                            {/* Role Selector */}
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Assigned Role</label>
                                <select name="role_id" value={formData.role_id} onChange={handleChange} required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-indigo-900 font-bold text-sm focus:border-indigo-600 outline-none">
                                    <option value="">Select your role</option>
                                    {roles.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
                                </select>
                            </div>

                            {/* Passwords */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Password</label>
                                    <div className="relative">
                                        <input type={showPassword ? "text" : "password"} name="password" value={formData.password} onChange={handleChange} required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-indigo-900 font-bold text-sm focus:border-indigo-600 outline-none" />
                                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-indigo-600">
                                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Confirm</label>
                                    <div className="relative">
                                        <input type={showConfirmPassword ? "text" : "password"} name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-indigo-900 font-bold text-sm focus:border-indigo-600 outline-none" />
                                        <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-indigo-600">
                                            {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <button type="submit" disabled={isLoading} className="w-full mt-4 py-4 bg-indigo-900 hover:bg-indigo-950 text-white font-black rounded-2xl shadow-xl transition-all flex items-center justify-center gap-3 disabled:opacity-70 h-14 uppercase tracking-widest text-xs">
                                {isLoading ? <Loader2 className="animate-spin" size={20} /> : <>Register Account <ArrowRight size={16} /></>}
                            </button>
                        </form>

                        <p className="mt-8 text-center text-slate-400 text-xs font-bold uppercase tracking-widest">
                            Already have an account? <Link to="/login" className="text-indigo-600 hover:text-indigo-800 transition-colors ml-1">Login</Link>
                        </p>
                    </div>
                </div>
            </div>

            {/* --- OPTIONAL BIOMETRIC MODAL --- */}
            {showBioModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-indigo-950/80 backdrop-blur-md" />
                    <div className="relative bg-white w-full max-w-md rounded-[2.5rem] p-10 text-center animate-in fade-in zoom-in duration-300">
                        <div className="inline-flex p-5 bg-indigo-50 rounded-3xl mb-6">
                            {enrolledSuccess ? (
                                <CheckCircle2 className="text-[#068D46] animate-bounce" size={48} />
                            ) : (
                                <Fingerprint className={`${isEnrolling ? 'animate-pulse text-indigo-400' : 'text-indigo-600'}`} size={48} />
                            )}
                        </div>

                        <h3 className="text-2xl font-black text-indigo-900 mb-2">
                            {enrolledSuccess ? "Identity Secured" : "Enhance Security"}
                        </h3>
                        <p className="text-slate-500 text-sm mb-8">
                            {enrolledSuccess
                                ? "Your biometric data has been linked successfully."
                                : "Would you like to enable fingerprint login for faster, more secure access next time?"}
                        </p>

                        {!enrolledSuccess && (
                            <div className="space-y-3">
                                <button
                                    onClick={handleBiometricEnroll}
                                    disabled={isEnrolling}
                                    className="w-full py-4 bg-indigo-900 text-white font-black rounded-2xl uppercase tracking-widest text-xs flex items-center justify-center gap-2"
                                >
                                    {isEnrolling ? <Loader2 className="animate-spin" size={18} /> : "Enable Fingerprint"}
                                </button>
                                <button
                                    onClick={() => navigate("/dashboard")}
                                    className="w-full py-4 bg-transparent text-slate-400 font-black rounded-2xl uppercase tracking-widest text-xs hover:text-indigo-600 transition-colors"
                                >
                                    Skip for now
                                </button>
                            </div>
                        )}

                        <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-center gap-2">
                            <ShieldCheck size={14} className="text-[#068D46]" />
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">AES-256 Encrypted Enrollment</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Register;