import React, { useState, useEffect } from 'react';
import { X, Loader2, UserCheck, MessageSquare, AlertCircle, ChevronDown } from 'lucide-react';
import axios from 'axios';
import issueService from '@/services/issueService';
import toast from 'react-hot-toast';

const AssignQAOfficerModal = ({ task, onClose, onRefresh }) => {
    const [officers, setOfficers] = useState([]);
    const [loadingOfficers, setLoadingOfficers] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        officerId: '',
        note: ''
    });

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

    useEffect(() => {
        fetchQAOfficers();
    }, []);

    /**
     * ✅ DYNAMIC DATA FETCHING
     * Fetches real users from the backend and filters for QA roles
     */
    const fetchQAOfficers = async () => {
        try {
            setLoadingOfficers(true);
            const token = localStorage.getItem('token');

            // Standardizing request to your user management endpoint
            const response = await axios.get(`${API_URL}/users`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const allUsers = Array.isArray(response.data) ? response.data : (response.data.users || []);

            // Filter logic: adjust string to match your DB role names (e.g., 'QA_OFFICER' or 'OFFICER')
            const qaStaff = allUsers.filter(user =>
                user.role?.toUpperCase().includes('QA') ||
                user.role?.toUpperCase().includes('OFFICER')
            );

            setOfficers(qaStaff);
        } catch (error) {
            console.error("Error fetching officers:", error);
            toast.error("Could not load QA Officers list");
        } finally {
            setLoadingOfficers(false);
        }
    };

    /**
     * ✅ DYNAMIC FORM SUBMISSION
     * Updates the issue in the database via the service
     */
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.officerId) {
            toast.error("Please select an officer");
            return;
        }

        try {
            setSubmitting(true);

            // Payload matches the backend expectation for an assignment
            const assignmentPayload = {
                assignedTo: formData.officerId,
                assignmentNote: formData.note,
                status: 'Assigned'
            };

            // Dynamic ID handling for MongoDB (_id) or SQL (id)
            const targetId = task._id || task.id;

            await issueService.assignTask(targetId, assignmentPayload);

            toast.success(`Issue ${task.issueId || ''} assigned successfully`);
            onRefresh(); // Triggers re-fetch in TasksList.jsx
            onClose();
        } catch (error) {
            console.error("Assignment error:", error);
            toast.error(error.response?.data?.message || "Failed to update assignment");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#0A1628]/70 backdrop-blur-sm">
            <div className="bg-white w-full max-w-xl rounded-[32px] shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="p-8 pb-0 flex justify-between items-start">
                    <div>
                        <h2 className="text-[#004A7C] text-2xl font-black tracking-tight">Assign Task</h2>
                        <p className="text-slate-400 text-sm font-medium mt-1">Route this issue to a Quality Assurance Officer</p>
                    </div>
                    <button onClick={onClose} className="p-2 bg-slate-50 text-slate-400 hover:text-red-500 rounded-full transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8">
                    {/* Dynamic Context Card */}
                    <div className="mb-8 p-5 bg-blue-50/50 rounded-2xl border border-blue-100 flex items-center justify-between">
                        <div>
                            <span className="text-[10px] font-black uppercase text-[#004A7C] opacity-60">Target System</span>
                            <p className="text-sm font-black text-[#004A7C]">{task?.systemName || task?.system || 'Generic System'}</p>
                        </div>
                        <div className="text-right">
                            <span className="text-[10px] font-black uppercase text-[#004A7C] opacity-60">Priority</span>
                            <p className={`text-sm font-black ${task?.priority === 'Critical' ? 'text-red-500' : 'text-orange-500'}`}>
                                {task?.priority || 'Normal'}
                            </p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        {/* Dynamic Dropdown */}
                        <div className="relative">
                            <label className="block text-[#004A7C] text-[11px] font-black uppercase tracking-[0.2em] mb-3 ml-1">
                                Select QA Officer <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <select
                                    disabled={loadingOfficers || submitting}
                                    value={formData.officerId}
                                    onChange={(e) => setFormData({ ...formData, officerId: e.target.value })}
                                    className="w-full bg-slate-50 border border-slate-100 text-slate-700 text-sm font-bold rounded-2xl p-4 pr-12 outline-none focus:ring-2 focus:ring-[#004A7C]/10 appearance-none disabled:opacity-50 transition-all"
                                >
                                    <option value="">Choose an officer...</option>
                                    {officers.map(officer => (
                                        <option key={officer._id || officer.id} value={officer._id || officer.id}>
                                            {officer.fullName || officer.name}
                                        </option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                            </div>
                            {loadingOfficers && (
                                <p className="mt-2 text-[10px] text-blue-500 font-bold animate-pulse italic">Connecting to personnel database...</p>
                            )}
                        </div>

                        {/* Instruction Note */}
                        <div>
                            <label className="block text-[#004A7C] text-[11px] font-black uppercase tracking-[0.2em] mb-3 ml-1">
                                Assignment Note
                            </label>
                            <div className="relative">
                                <textarea
                                    disabled={submitting}
                                    value={formData.note}
                                    onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                                    placeholder="e.g. Please prioritize the functional testing on the login module..."
                                    className="w-full bg-slate-50 border border-slate-100 text-slate-700 text-sm font-medium rounded-2xl p-4 pl-12 h-32 outline-none focus:ring-2 focus:ring-[#004A7C]/10 resize-none transition-all"
                                />
                                <MessageSquare className="absolute left-4 top-4 text-slate-300" size={20} />
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-10 flex gap-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-4 border-2 border-slate-100 rounded-2xl text-slate-400 font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting || loadingOfficers}
                            className="flex-[1.5] py-4 bg-[#004A7C] text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-900/20 flex items-center justify-center gap-3 active:scale-95 transition-all disabled:opacity-50"
                        >
                            {submitting ? (
                                <Loader2 className="animate-spin" size={20} />
                            ) : (
                                <>
                                    <UserCheck size={20} />
                                    Confirm Assignment
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AssignQAOfficerModal;