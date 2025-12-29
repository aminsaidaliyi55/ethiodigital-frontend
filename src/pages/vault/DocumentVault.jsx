import React, { useState, useEffect, useMemo } from 'react';
import DataTable from '../../components/DataTable';
import { fetchDocuments, deleteDocument, updateDocument } from '@/services/documentService';
import { FileText, Plus, Search, HardDrive, Edit, Trash2, Eye, X } from 'lucide-react';
import UploadModal from './UploadModal';
import toast from 'react-hot-toast';

const BASE_URL = "http://localhost:8000";

const DocumentVault = () => {
    const [docs, setDocs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    // Modal & Form States
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [modalState, setModalState] = useState(null);
    const [editForm, setEditForm] = useState({ id: '', title: '', category: '' });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const response = await fetchDocuments();
            const actualData = Array.isArray(response) ? response : (response?.data || []);
            setDocs(actualData);
        } catch (error) {
            console.error("Failed to load archive:", error);
            toast.error("Failed to synchronize archive");
            setDocs([]);
        } finally {
            setLoading(false);
        }
    };

    const handleEditClick = (doc) => {
        setEditForm({
            id: doc.id,
            title: doc.title || '',
            category: doc.category || ''
        });
        setModalState('edit');
    };

    const handleUpdate = async () => {
        if (!editForm.title.trim()) {
            return toast.error("Document title is required");
        }

        const tid = toast.loading("Updating metadata...");
        try {
            await updateDocument(editForm.id, {
                title: editForm.title,
                category: editForm.category
            });
            toast.success("Registry entry updated", { id: tid });
            setModalState(null);
            loadData(); // Refresh the list
        } catch (err) {
            toast.error(err.response?.data?.message || "Update failed", { id: tid });
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("CRITICAL: Purge this document from the sovereign registry?")) {
            const tid = toast.loading("Purging...");
            try {
                await deleteDocument(id);
                toast.success("Identity removed", { id: tid });
                loadData();
            } catch (err) {
                toast.error("Purge failed", { id: tid });
            }
        }
    };

    const filteredDocs = useMemo(() => {
        return docs.filter(doc =>
            doc.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            doc.category?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [searchTerm, docs]);

    const columns = [
        {
            header: "Document Title",
            accessor: "title",
            render: (val) => (
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <FileText size={16} className="text-[#004A7C] dark:text-blue-400" />
                    </div>
                    <span className="font-bold text-slate-700 dark:text-slate-200">{val}</span>
                </div>
            )
        },
        {
            header: "Category",
            accessor: "category",
            render: (val) => (
                <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-[10px] font-black uppercase tracking-wider text-slate-500">
                    {val || 'Uncategorized'}
                </span>
            )
        },
        { header: "Uploaded By", accessor: "uploader_name" },
        {
            header: "Date",
            accessor: "created_at",
            render: (val) => val ? new Date(val).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : "N/A"
        },
        {
            header: "Actions",
            align: "right",
            render: (row) => {
                const fullUrl = row.file_path?.startsWith('http') ? row.file_path : `${BASE_URL}${row.file_path}`;
                return (
                    <div className="flex justify-end gap-2">
                        <a href={fullUrl} target="_blank" rel="noopener noreferrer" className="p-1.5 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded transition-colors">
                            <Eye size={16} />
                        </a>
                        <button onClick={() => handleEditClick(row)} className="p-1.5 hover:bg-amber-50 dark:hover:bg-amber-900/20 text-amber-600 dark:text-amber-400 rounded transition-colors">
                            <Edit size={16} />
                        </button>
                        <button onClick={() => handleDelete(row.id)} className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 rounded transition-colors">
                            <Trash2 size={16} />
                        </button>
                    </div>
                );
            }
        }
    ];

    return (
        <div className="p-8 animate-in fade-in duration-500 bg-[#F8FAFC] dark:bg-[#070D18] min-h-screen">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-black text-slate-800 dark:text-white uppercase tracking-tighter">Digital Archive</h1>
                    <div className="flex items-center gap-2 mt-1">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Sovereign Registry Active</p>
                    </div>
                </div>

                <div className="flex gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-72">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search Vault..."
                            className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm focus:ring-2 focus:ring-[#004A7C] outline-none transition-all shadow-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button
                        onClick={() => setIsUploadModalOpen(true)}
                        className="bg-[#004A7C] hover:bg-blue-800 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 transition-all shadow-lg shadow-blue-900/20"
                    >
                        <Plus size={18} /> Upload
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white dark:bg-slate-900/40 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-4">
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl text-[#004A7C] dark:text-blue-400">
                        <HardDrive size={24} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Archive</p>
                        <h3 className="text-2xl font-black text-slate-700 dark:text-white">{docs.length} <span className="text-xs text-slate-400">Items</span></h3>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900/20 rounded-[2.5rem] border border-slate-100 dark:border-slate-800/50 p-2 overflow-hidden shadow-sm">
                <DataTable columns={columns} data={filteredDocs} loading={loading} />
            </div>

            {/* Edit Modal */}
            {modalState === 'edit' && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[120]">
                    <div className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden border dark:border-slate-800">
                        <div className="p-6 flex justify-between items-center text-white bg-[#004A7C]">
                            <div>
                                <h2 className="font-black text-lg uppercase tracking-tight">Edit Metadata</h2>
                                <p className="text-[10px] opacity-80 uppercase tracking-widest">Doc ID: {editForm.id}</p>
                            </div>
                            <button onClick={() => setModalState(null)} className="hover:rotate-90 transition-transform"><X size={20} /></button>
                        </div>
                        <div className="p-8 space-y-4">
                            <div>
                                <label className="text-[#004A7C] text-[11px] font-bold mb-1.5 block uppercase tracking-wider">Document Title</label>
                                <input
                                    className="w-full bg-[#FDFDFD] dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md px-3 py-2 text-[11px] text-slate-600 focus:outline-none focus:border-[#004A7C]"
                                    value={editForm.title}
                                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="text-[#004A7C] text-[11px] font-bold mb-1.5 block uppercase tracking-wider">Category</label>
                                <input
                                    className="w-full bg-[#FDFDFD] dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md px-3 py-2 text-[11px] text-slate-600 focus:outline-none focus:border-[#004A7C]"
                                    value={editForm.category}
                                    onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="p-6 bg-slate-50 dark:bg-slate-800/50 border-t flex justify-end gap-3">
                            <button onClick={() => setModalState(null)} className="px-6 py-2 text-xs font-black text-slate-500 uppercase tracking-widest">Cancel</button>
                            <button onClick={handleUpdate} className="bg-[#004A7C] text-white px-8 py-2 rounded-lg text-xs font-black uppercase tracking-[0.2em] shadow-xl hover:scale-95 transition-all">Update Entry</button>
                        </div>
                    </div>
                </div>
            )}

            <UploadModal isOpen={isUploadModalOpen} onClose={() => setIsUploadModalOpen(false)} onUploadSuccess={loadData} />
        </div>
    );
};

export default DocumentVault;