import React, { useEffect, useRef, useState } from "react";
import { Mic, MicOff, Video, VideoOff, PhoneOff, Maximize2, X, MessageSquare, Cpu, Send, Loader2, Users } from "lucide-react";
import { getUsers } from "@/services/userService"; // Named import
import issueService from "@/services/issueService";
import toast from "react-hot-toast";

const VideoCallModal = ({ onClose, issueId = "KAA-2025-0043" }) => {
    // Steps: 'selecting' -> 'calling' -> 'active'
    const [callStep, setCallStep] = useState('selecting');
    const [contacts, setContacts] = useState([]);
    const [loadingContacts, setLoadingContacts] = useState(true);
    const [selectedContact, setSelectedContact] = useState(null);
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);
    const localVideoRef = useRef(null);

    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

    // 1. Fetch Staff Logic (Aligned with Postgres return values)
    useEffect(() => {
        const fetchSupportStaff = async () => {
            try {
                setLoadingContacts(true);
                const response = await getUsers(); // Corrected: calling the named import

                const techStaff = response
                    .filter(u => u.user_type !== 'client') // Adjusted for Postgres user_type
                    .map(user => {
                        // Check if it's the current user or an admin
                        const isSelf = user.id === currentUser.id || user.full_name === "MR Admin";
                        const activeStatus = isSelf ? true : user.is_online;

                        return {
                            id: user.id,
                            name: user.full_name || user.name || "Unknown User",
                            role: user.user_type || "Technical Support",
                            status: activeStatus ? "Online" : "Offline",
                            statusColor: activeStatus ? "bg-[#22C55E]" : "bg-[#94A3B8]"
                        };
                    });

                setContacts(techStaff);
            } catch (error) {
                console.error("Staff load error:", error);
                toast.error("Failed to load technical staff");
            } finally {
                setLoadingContacts(false);
            }
        };

        if (callStep === 'selecting') fetchSupportStaff();
    }, [callStep, currentUser.id]);

    // 2. Camera Management
    useEffect(() => {
        if (callStep === 'active' || callStep === 'calling') startCamera();
        return () => stopCamera();
    }, [callStep]);

    // 3. Simulated Connection Logic (Calling -> Active)
    useEffect(() => {
        if (callStep === 'calling') {
            const timer = setTimeout(() => {
                setCallStep('active');
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [callStep]);

    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            if (localVideoRef.current) localVideoRef.current.srcObject = stream;
        } catch (err) {
            toast.error("Could not access camera/microphone");
        }
    };

    const stopCamera = () => {
        if (localVideoRef.current?.srcObject) {
            const tracks = localVideoRef.current.srcObject.getTracks();
            tracks.forEach(track => track.stop());
        }
    };

    const handleStartCall = async () => {
        if (!selectedContact) return toast.error("Please select a participant");
        setIsConnecting(true);
        try {
            // Ensure issueService is also using ES6 exports
            await issueService.initiateVideoSupport(issueId, selectedContact.id);
            setCallStep('calling');
        } catch (error) {
            toast.error("Failed to initiate call session");
        } finally {
            setIsConnecting(false);
        }
    };

    // VIEW: SELECTING CONTACTS
    if (callStep === 'selecting') {
        return (
            <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/20 backdrop-blur-[2px] p-4">
                <div className="bg-white w-full max-w-[500px] rounded-[24px] shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
                    <div className="p-8">
                        <div className="flex items-start gap-4 mb-8">
                            <div className="p-3 bg-blue-50 rounded-full text-[#004A7C]"><Video size={24} strokeWidth={2.5} /></div>
                            <div>
                                <h2 className="text-[#004A7C] font-black text-xl">Start Video Call</h2>
                                <p className="text-slate-400 text-sm font-medium">Select participants for this session</p>
                            </div>
                        </div>

                        <div className="mb-6">
                            <label className="text-[#004A7C] font-black text-xs uppercase mb-2 block tracking-tight">Issue Reference</label>
                            <input disabled value={issueId} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl text-slate-400 text-sm font-bold outline-none" />
                        </div>

                        <div className="mb-8">
                            <div className="flex items-center gap-2 mb-4">
                                <Users size={18} className="text-[#004A7C]" />
                                <label className="text-[#004A7C] font-black text-sm">Select Contact</label>
                            </div>
                            <div className="bg-slate-50/50 rounded-2xl p-4 border border-slate-100">
                                {loadingContacts ? (
                                    <div className="py-10 text-center"><Loader2 className="animate-spin inline text-[#004A7C]" /></div>
                                ) : (
                                    <div className="grid grid-cols-2 gap-4 max-h-[220px] overflow-y-auto pr-2 custom-scrollbar">
                                        {contacts.map((contact) => (
                                            <div key={contact.id} onClick={() => setSelectedContact(contact)} className="flex items-center gap-3 cursor-pointer group">
                                                <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${selectedContact?.id === contact.id ? 'bg-[#004A7C] border-[#004A7C]' : 'border-slate-300 bg-white'}`}>
                                                    {selectedContact?.id === contact.id && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-[#334155] text-xs font-bold truncate leading-tight">{contact.name}</p>
                                                    <p className="text-slate-400 text-[10px] truncate">{contact.role}</p>
                                                </div>
                                                <span className={`px-2 py-0.5 rounded-full text-white text-[9px] font-bold ${contact.statusColor}`}>
                                                    {contact.status}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex justify-between items-center gap-4">
                            <button onClick={onClose} className="px-8 py-3 border-2 border-[#004A7C] rounded-xl text-[#004A7C] font-black text-sm hover:bg-slate-50 transition-all">Cancel</button>
                            <button onClick={handleStartCall} disabled={!selectedContact || isConnecting} className="flex-1 py-3 bg-[#004A7C] text-white rounded-xl font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-900/20 active:scale-95 disabled:opacity-50">
                                {isConnecting ? <Loader2 className="animate-spin" size={18} /> : <><Video size={18} /> Start Call</>}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // VIEW: CALLING STATE
    if (callStep === 'calling') {
        return (
            <div className="fixed inset-0 z-[120] bg-[#0A1628] flex items-center justify-center">
                <div className="text-center">
                    <div className="relative mb-12">
                        <div className="absolute inset-0 rounded-full bg-[#004A7C] animate-ping opacity-20" />
                        <div className="absolute inset-0 rounded-full bg-[#004A7C] animate-pulse opacity-40 scale-150" />
                        <div className="relative w-32 h-32 bg-[#004A7C] rounded-full mx-auto flex items-center justify-center text-white text-4xl font-black shadow-2xl">
                            {selectedContact?.name?.charAt(0)}
                        </div>
                    </div>
                    <h2 className="text-white text-2xl font-black mb-2 tracking-tight">Calling {selectedContact?.name}...</h2>
                    <p className="text-white/40 text-xs font-bold uppercase tracking-[0.4em] mb-16">Establishing Secure Connection</p>

                    <button onClick={onClose} className="w-20 h-20 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center shadow-2xl shadow-red-900/40 transition-transform active:scale-90">
                        <PhoneOff size={32} />
                    </button>
                </div>

                <div className="absolute bottom-10 right-10 w-64 aspect-video bg-[#0F1E35] rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
                    <video ref={localVideoRef} autoPlay muted playsInline className="w-full h-full object-cover mirror-mode" />
                    <div className="absolute bottom-2 left-2 text-white/50 text-[9px] font-bold uppercase">Preview</div>
                </div>
            </div>
        );
    }

    // VIEW: ACTIVE CALL
    return (
        <div className="fixed inset-0 z-[120] bg-[#0A1628] flex flex-col font-sans animate-in fade-in duration-500">
            <div className="h-14 bg-[#0F1E35] flex items-center justify-between px-6 border-b border-white/5">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 bg-red-500/10 px-2 py-1 rounded">
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                        <span className="text-white text-[10px] font-bold uppercase tracking-widest">Recording Live</span>
                    </div>
                    <div className="text-white/80">
                        <p className="text-[10px] font-bold opacity-50 leading-none">Issue ID: {issueId}</p>
                        <p className="text-xs font-black truncate max-w-md">Technical Support Session</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="bg-white/10 text-white text-[11px] font-bold px-3 py-1 rounded-md">00:03</div>
                    <div className="bg-[#004A7C] text-white text-[11px] font-bold px-3 py-1 rounded-md flex items-center gap-2">
                        <Users size={12} /> {selectedContact?.name}
                    </div>
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden p-4 gap-4">
                <div className="flex-1 relative bg-[#070F1A] rounded-2xl flex items-center justify-center overflow-hidden border border-white/5 shadow-inner">
                    <div className="text-center">
                        <div className="w-24 h-24 bg-[#004A7C] rounded-full mx-auto flex items-center justify-center mb-4 text-white text-3xl font-black shadow-2xl">
                            {selectedContact?.name?.split(' ').map(n => n[0]).join('') || 'TC'}
                        </div>
                        <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.3em]">Connecting to Camera...</p>
                    </div>

                    <div className="absolute top-6 right-6 w-80 aspect-video bg-[#0F1E35] rounded-xl border border-white/10 overflow-hidden shadow-2xl z-20">
                        <video ref={localVideoRef} autoPlay muted playsInline className={`w-full h-full object-cover mirror-mode ${isVideoOff ? 'hidden' : ''}`} />
                        {isVideoOff && <div className="w-full h-full flex items-center justify-center text-white/10"><VideoOff size={40} /></div>}
                        <div className="absolute bottom-2 left-2 bg-black/60 px-2 py-1 rounded text-[10px] text-white font-bold">You ({currentUser.full_name || "Admin"})</div>
                    </div>

                    <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-4">
                        <div className="bg-[#0F1E35]/80 backdrop-blur-xl p-2 rounded-2xl border border-white/10 flex items-center gap-4 px-6">
                            <button onClick={() => setIsMuted(!isMuted)} className={`p-3 rounded-full transition-colors ${isMuted ? 'bg-red-500 text-white' : 'bg-white/5 text-white hover:bg-white/10'}`}>
                                {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
                            </button>
                            <button onClick={() => setIsVideoOff(!isVideoOff)} className={`p-3 rounded-full transition-colors ${isVideoOff ? 'bg-red-500 text-white' : 'bg-white/5 text-white hover:bg-white/10'}`}>
                                {isVideoOff ? <VideoOff size={20} /> : <Video size={20} />}
                            </button>
                            <button onClick={onClose} className="p-4 bg-[#EF4444] hover:bg-red-600 text-white rounded-full shadow-lg shadow-red-900/20 transition-transform active:scale-90 flex items-center gap-2 px-6">
                                <PhoneOff size={20} /> <span className="text-xs font-black uppercase">End Call</span>
                            </button>
                        </div>
                    </div>
                </div>

                <div className="w-[340px] bg-[#0F1E35] rounded-2xl flex flex-col border border-white/5 overflow-hidden shadow-2xl">
                    <div className="flex p-2 gap-1 bg-black/20">
                        <button className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-white text-[#0F1E35] rounded-lg text-[10px] font-black uppercase tracking-wider">
                            <MessageSquare size={14} /> Chat
                        </button>
                        <button className="flex-1 flex items-center justify-center gap-2 py-2.5 text-white/40 text-[10px] font-black uppercase tracking-wider hover:text-white">
                            Notes
                        </button>
                        <button className="flex-1 flex items-center justify-center gap-2 py-2.5 text-white/40 text-[10px] font-black uppercase tracking-wider hover:text-white">
                            <Cpu size={14} /> AI Support
                        </button>
                    </div>

                    <div className="flex-1 p-6 flex flex-col items-center justify-center text-center">
                        <MessageSquare className="text-white/5 mb-4" size={48} />
                        <p className="text-white/20 text-[10px] font-bold uppercase tracking-widest">Secure Chat Terminal</p>
                    </div>

                    <div className="p-4 bg-black/20 mt-auto">
                        <div className="relative">
                            <input type="text" placeholder="Type a message..." className="w-full bg-[#1A2C42] border-none rounded-xl py-4 pl-5 pr-12 text-white text-xs placeholder:text-white/20 outline-none focus:ring-1 focus:ring-[#004A7C]" />
                            <button className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-[#004A7C] hover:bg-[#003d66] rounded-lg text-white shadow-lg transition-all active:scale-90"><Send size={16} /></button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VideoCallModal;