import React, { useEffect, useState } from "react";
import api from "../../axios";
import { Plus, Edit, Eye, Trash2, Loader2, X } from "lucide-react";
import toast from "react-hot-toast";

const ClientRequests = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [viewData, setViewData] = useState(null);
    const [formData, setFormData] = useState({ title: "", description: "" });
    const [editingId, setEditingId] = useState(null);

    const fetchMyRequests = async () => {
        try {
            setLoading(true);
            const res = await api.get("/requests/my-requests");
            setRequests(res.data);
        } catch (err) { toast.error("Could not load requests"); }
        finally { setLoading(false); }
    };

    const formatStatus = (status) => {
        if (typeof status === 'string' && status.startsWith('{')) {
            try {
                const parsed = JSON.parse(status);
                return parsed.status || parsed.STATUS || "APPROVED";
            } catch (e) { return "APPROVED"; }
        }
        return status;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                await api.put(`/requests/${editingId}`, formData);
                toast.success("Request updated!");
            } else {
                await api.post("/requests", formData);
                toast.success("Request sent!");
            }
            closeForm();
            fetchMyRequests();
        } catch (err) { toast.error("Action failed"); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this request permanently?")) return;
        try {
            await api.delete(`/requests/${id}`);
            toast.success("Deleted");
            fetchMyRequests();
        } catch (err) { toast.error("Delete failed"); }
    };

    const openEdit = (req) => {
        setFormData({ title: req.title, description: req.description });
        setEditingId(req.id);
        setShowForm(true);
    };

    const closeForm = () => {
        setShowForm(false);
        setEditingId(null);
        setFormData({ title: "", description: "" });
    };

    useEffect(() => { fetchMyRequests(); }, []);

    return (
        <div className="p-8 max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-black text-slate-900">My Project Requests</h1>
                <button onClick={() => setShowForm(true)} className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl font-bold hover:bg-indigo-700">
                    <Plus size={18} /> New Request
                </button>
            </div>

            {loading ? <Loader2 className="animate-spin mx-auto text-indigo-600" /> : (
                <div className="grid gap-4">
                    {requests.map(req => {
                        const cleanStatus = formatStatus(req.status);
                        return (
                            <div key={req.id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex justify-between items-center">
                                <div>
                                    <h3 className="font-bold text-slate-800">{req.title}</h3>
                                    <div className="flex gap-3 text-xs text-slate-400 mt-1">
                                        <span>ID: {req.id}</span>
                                        <span>{new Date(req.created_at).toLocaleDateString()}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                                        cleanStatus === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' :
                                            cleanStatus === 'REJECTED' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                                    }`}>
                                        {cleanStatus}
                                    </span>
                                    <div className="flex gap-1">
                                        <button onClick={() => setViewData(req)} className="p-2 hover:bg-slate-100 rounded-lg text-slate-500"><Eye size={18}/></button>
                                        {cleanStatus === 'PENDING' && (
                                            <>
                                                <button onClick={() => openEdit(req)} className="p-2 hover:bg-amber-50 rounded-lg text-amber-600"><Edit size={18}/></button>
                                                <button onClick={() => handleDelete(req.id)} className="p-2 hover:bg-red-50 rounded-lg text-red-600"><Trash2 size={18}/></button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* FORM MODAL */}
            {showForm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <form onSubmit={handleSubmit} className="bg-white p-8 rounded-3xl w-full max-w-md shadow-xl">
                        <h2 className="text-xl font-bold mb-4">{editingId ? "Edit Request" : "New Request"}</h2>
                        <input required className="w-full border p-3 rounded-xl mb-3 focus:outline-indigo-500" value={formData.title} placeholder="Title" onChange={e => setFormData({...formData, title: e.target.value})} />
                        <textarea required className="w-full border p-3 rounded-xl mb-4 h-32 focus:outline-indigo-500" value={formData.description} placeholder="Description" onChange={e => setFormData({...formData, description: e.target.value})} />
                        <div className="flex gap-2">
                            <button type="button" onClick={closeForm} className="flex-1 py-3 font-bold text-slate-500 hover:bg-slate-100 rounded-xl">Cancel</button>
                            <button type="submit" className="flex-1 py-3 bg-indigo-900 text-white rounded-xl font-bold hover:bg-indigo-700">Save</button>
                        </div>
                    </form>
                </div>
            )}

            {/* VIEW MODAL */}
            {viewData && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white p-8 rounded-3xl w-full max-w-lg relative shadow-xl">
                        <button onClick={() => setViewData(null)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"><X size={24}/></button>
                        <h2 className="text-2xl font-black mb-2 text-slate-900">{viewData.title}</h2>
                        <div className="h-[2px] w-12 bg-indigo-500 mb-4"></div>
                        <p className="text-slate-600 mb-6 leading-relaxed">{viewData.description}</p>
                        <div className="bg-slate-50 p-4 rounded-xl text-sm text-slate-500 border border-slate-100">
                            <p className="mb-1"><strong>Current Status:</strong> <span className="text-indigo-600 font-bold">{formatStatus(viewData.status)}</span></p>
                            <p><strong>Created On:</strong> {new Date(viewData.created_at).toLocaleString()}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ClientRequests;