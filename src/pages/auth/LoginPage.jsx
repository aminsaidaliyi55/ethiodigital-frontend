import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
    Eye,
    EyeOff,
    Loader2,
    Phone,
    ShieldCheck,
    ArrowRight,
    Landmark,
    Fingerprint,
    HelpCircle,
    X,
    KeyRound,
    CheckCircle2,
    Lock
} from "lucide-react";

function LoginPage() {
    const [phoneNumber, setPhoneNumber] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    // Modal States
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalStep, setModalStep] = useState(1); // 1: Phone, 2: OTP, 3: Reset, 4: Success
    const [forgotPhone, setForgotPhone] = useState("");
    const [otp, setOtp] = useState("");
    const [newPass, setNewPass] = useState("");
    const [confirmPass, setConfirmPass] = useState("");
    const [modalError, setModalError] = useState("");

    const navigate = useNavigate();

    // --- Login Logic ---
    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);
        try {
            const response = await fetch("http://localhost:8000/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ phone_number: phoneNumber, password }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || "Incorrect phone or password");

            localStorage.setItem("user", JSON.stringify({ token: data.token, user: data.user }));
            localStorage.setItem("token", data.token);
            navigate("/dashboard");
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    // --- Forgot Password Logic ---
    const validateEthioPhone = (num) => /^(0|251|\+251)(9|7)[0-9]{8}$/.test(num);

    const handleRequestOTP = async (e) => {
        e.preventDefault();
        if (!validateEthioPhone(forgotPhone)) return setModalError("Invalid Ethiopian phone number.");
        setModalError("");
        setIsLoading(true);
        try {
            // Mock API Call
            await new Promise(resolve => setTimeout(resolve, 1500));
            setModalStep(2);
        } catch (err) { setModalError("Service unavailable."); } finally { setIsLoading(false); }
    };

    const handleVerifyOTP = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            // Mock API Call
            await new Promise(resolve => setTimeout(resolve, 1000));
            setModalStep(3);
        } catch (err) { setModalError("Invalid Code."); } finally { setIsLoading(false); }
    };

    const handleFinalReset = async (e) => {
        e.preventDefault();
        if (newPass !== confirmPass) return setModalError("Passwords do not match.");
        setIsLoading(true);
        try {
            // Mock API Call
            await new Promise(resolve => setTimeout(resolve, 1500));
            setModalStep(4);
            setTimeout(() => setIsModalOpen(false), 3000);
        } catch (err) { setModalError("Reset failed."); } finally { setIsLoading(false); }
    };

    const handleBiometricLogin = async () => {
        setIsLoading(true);
        setTimeout(() => { console.log("Biometric scan successful"); setIsLoading(false); }, 1500);
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 md:p-6 relative overflow-hidden font-sans">
            {/* Background Ambience */}
            <div className="absolute top-[-10%] left-[-5%] w-[600px] h-[600px] bg-indigo-900/10 rounded-full blur-[120px]" />
            <div className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] bg-[#068D46]/5 rounded-full blur-[100px]" />

            <div className="w-full max-w-5xl flex flex-col md:flex-row bg-white rounded-[2.5rem] border border-slate-200 shadow-[0_40px_100px_rgba(30,41,59,0.15)] overflow-hidden z-10 relative">

                {/* Left Side: National Identity */}
                <div className="w-full md:w-[45%] p-8 md:p-12 flex flex-col justify-between relative bg-indigo-900 overflow-hidden">
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
                            Welcome <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#068D46] via-[#FCE300] to-[#E52521]">Back.</span>
                        </h1>
                    </div>
                    <div className="mt-8 pt-6 border-t border-white/10 relative z-20">
                        <p className="text-[9px] text-indigo-400 font-bold uppercase tracking-[0.4em]">Official Government System</p>
                    </div>
                </div>

                {/* Right Side: Login Form */}
                <div className="w-full md:w-[55%] bg-white p-8 md:p-16 flex flex-col justify-center">
                    <div className="w-full max-w-sm mx-auto">
                        <header className="mb-10">
                            <button onClick={handleBiometricLogin} className="bg-indigo-50 p-3 rounded-2xl text-indigo-900 hover:scale-110 active:scale-95 transition-all mb-4">
                                <Fingerprint size={28} />
                            </button>
                            <h2 className="text-2xl font-black text-indigo-900">Login to Account</h2>
                            <p className="text-slate-400 text-sm font-semibold">Secure official access for Ethiopian citizens.</p>
                        </header>

                        {error && <div className="mb-6 p-4 bg-red-50 text-red-600 text-xs font-bold rounded-2xl border border-red-100">{error}</div>}

                        <form onSubmit={handleLogin} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Phone Number</label>
                                <div className="relative">
                                    <Phone className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                                    <input type="tel" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} required className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-indigo-900 font-bold focus:bg-white focus:border-indigo-600 outline-none transition-all" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between items-center ml-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Password</label>
                                    <button type="button" onClick={() => { setIsModalOpen(true); setModalStep(1); }} className="text-[10px] font-black text-indigo-600 uppercase tracking-widest flex items-center gap-1">
                                        <HelpCircle size={10} /> Forgot?
                                    </button>
                                </div>
                                <div className="relative">
                                    <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-indigo-900 font-bold focus:bg-white focus:border-indigo-600 outline-none transition-all" />
                                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300">
                                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                            </div>

                            <button type="submit" disabled={isLoading} className="w-full py-4 bg-indigo-900 hover:bg-indigo-950 text-white font-black rounded-2xl shadow-xl transition-all flex items-center justify-center gap-3 disabled:opacity-70 h-14 uppercase tracking-widest text-xs">
                                {isLoading ? <Loader2 className="animate-spin" size={20} /> : <>Sign In <ArrowRight size={16} /></>}
                            </button>
                        </form>

                        <div className="mt-8 text-center">
                            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">
                                New to system? <Link to="/register" className="text-indigo-600 ml-1">Register</Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- FORGOT PASSWORD MODAL --- */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-indigo-950/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
                    <div className="relative bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden p-8 md:p-10 animate-in fade-in zoom-in duration-300">
                        <button onClick={() => setIsModalOpen(false)} className="absolute right-8 top-8 text-slate-300 hover:text-indigo-900 transition-colors">
                            <X size={24} />
                        </button>

                        <div className="text-center mb-8">
                            <div className="inline-flex p-4 bg-indigo-50 rounded-2xl mb-4">
                                {modalStep === 1 && <Phone className="text-indigo-600" size={32} />}
                                {modalStep === 2 && <ShieldCheck className="text-indigo-600" size={32} />}
                                {modalStep === 3 && <KeyRound className="text-indigo-600" size={32} />}
                                {modalStep === 4 && <CheckCircle2 className="text-[#068D46]" size={32} />}
                            </div>
                            <h3 className="text-2xl font-black text-indigo-900">
                                {modalStep === 1 && "Reset Access"}
                                {modalStep === 2 && "Verify OTP"}
                                {modalStep === 3 && "New Password"}
                                {modalStep === 4 && "Password Reset!"}
                            </h3>
                            <p className="text-slate-400 text-sm font-medium mt-2">
                                {modalStep === 1 && "Enter your phone to receive a code."}
                                {modalStep === 2 && `Code sent to ${forgotPhone}`}
                                {modalStep === 3 && "Set a secure new password."}
                                {modalStep === 4 && "Redirecting to login portal..."}
                            </p>
                        </div>

                        {modalError && <div className="mb-4 text-red-500 text-[10px] font-black uppercase text-center">{modalError}</div>}

                        {modalStep === 1 && (
                            <form onSubmit={handleRequestOTP} className="space-y-4">
                                <input type="tel" required placeholder="09..." value={forgotPhone} onChange={(e) => setForgotPhone(e.target.value)} className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold focus:border-indigo-600 outline-none" />
                                <button disabled={isLoading} className="w-full py-4 bg-indigo-900 text-white font-black rounded-2xl text-xs uppercase tracking-widest h-14">
                                    {isLoading ? <Loader2 className="animate-spin mx-auto" /> : "Send Code"}
                                </button>
                            </form>
                        )}

                        {modalStep === 2 && (
                            <form onSubmit={handleVerifyOTP} className="space-y-4">
                                <input type="text" required maxLength={6} placeholder="******" value={otp} onChange={(e) => setOtp(e.target.value)} className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-center text-2xl font-black tracking-widest focus:border-indigo-600 outline-none" />
                                <button disabled={isLoading} className="w-full py-4 bg-indigo-900 text-white font-black rounded-2xl text-xs uppercase tracking-widest h-14">
                                    {isLoading ? <Loader2 className="animate-spin mx-auto" /> : "Verify OTP"}
                                </button>
                            </form>
                        )}

                        {modalStep === 3 && (
                            <form onSubmit={handleFinalReset} className="space-y-4">
                                <div className="relative">
                                    <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                                    <input type="password" required placeholder="New Password" value={newPass} onChange={(e) => setNewPass(e.target.value)} className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold focus:border-indigo-600 outline-none" />
                                </div>
                                <div className="relative">
                                    <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                                    <input type="password" required placeholder="Confirm Password" value={confirmPass} onChange={(e) => setConfirmPass(e.target.value)} className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold focus:border-indigo-600 outline-none" />
                                </div>
                                <button disabled={isLoading} className="w-full py-4 bg-indigo-900 text-white font-black rounded-2xl text-xs uppercase tracking-widest h-14">
                                    {isLoading ? <Loader2 className="animate-spin mx-auto" /> : "Update Password"}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default LoginPage;