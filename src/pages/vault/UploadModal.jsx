import React, { useState } from 'react';
import { X, Upload, File, Loader2, CheckCircle2 } from 'lucide-react';
import { uploadDocument } from '@/services/documentService';
import toast from 'react-hot-toast';

const UploadModal = ({ isOpen, onClose, onUploadSuccess }) => {
    const [file, setFile] = useState(null);
    const [title, setTitle] = useState('');
    const [category, setCategory] = useState('');
    const [isUploading, setIsUploading] = useState(false);

    if (!isOpen) return null;

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            // Auto-fill title with filename if empty
            if (!title) {
                const nameWithoutExt = selectedFile.name.replace(/\.[^/.]+$/, "");
                setTitle(nameWithoutExt);
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!file || !title) {
            return toast.error("Please provide both a file and a title");
        }

        const formData = new FormData();
        formData.append('file', file);
        formData.append('title', title);
        formData.append('category', category || 'Uncategorized');

        setIsUploading(true);
        const tid = toast.loading("Uploading to Sovereign Registry...");

        try {
            await uploadDocument(formData);
            toast.success("Document Archiving Successful", { id: tid });

            // Reset form and close
            setFile(null);
            setTitle('');
            setCategory('');
            onUploadSuccess();
            onClose();
        } catch (error) {
            console.error("Upload failed:", error);
            toast.error(error.response?.data?.message || "Upload failed. Please check connection.", { id: tid });
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[150] animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-300">
                {/* Modal Header */}
                <div className="p-8 flex justify-between items-center bg-[#004A7C] text-white">
                    <div>
                        <h2 className="text-xl font-black uppercase tracking-tighter">New Archive Entry</h2>
                        <p className="text-[10px] font-bold opacity-70 uppercase tracking-[0.2em] mt-1">Registry Protocol 4.0</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/10 rounded-full transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    {/* File Dropzone/Input */}
                    <div className="relative group">
                        <input
                            type="file"
                            onChange={handleFileChange}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        />
                        <div className={`border-2 border-dashed rounded-3xl p-8 flex flex-col items-center justify-center transition-all ${
                            file
                                ? 'border-green-500 bg-green-50/50 dark:bg-green-900/10'
                                : 'border-slate-200 dark:border-slate-800 group-hover:border-[#004A7C] bg-slate-50 dark:bg-slate-900/50'
                        }`}>
                            {file ? (
                                <>
                                    <div className="p-4 bg-green-100 dark:bg-green-900/30 rounded-2xl text-green-600 mb-3">
                                        <CheckCircle2 size={32} />
                                    </div>
                                    <p className="text-xs font-black text-green-700 dark:text-green-400 uppercase tracking-widest truncate max-w-full px-4">
                                        {file.name}
                                    </p>
                                    <p className="text-[10px] text-slate-400 mt-1 uppercase">Ready for transmission</p>
                                </>
                            ) : (
                                <>
                                    <div className="p-4 bg-white dark:bg-slate-800 rounded-2xl text-slate-400 group-hover:text-[#004A7C] transition-colors shadow-sm mb-3">
                                        <Upload size={32} />
                                    </div>
                                    <p className="text-xs font-black text-slate-500 uppercase tracking-widest">Select Source File</p>
                                    <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-tighter">Click or drag to begin</p>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="text-[#004A7C] text-[11px] font-black uppercase tracking-[0.15em] mb-2 block ml-1">Document Title</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Enter archive identification..."
                                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-xs focus:ring-2 focus:ring-[#004A7C] outline-none transition-all"
                                required
                            />
                        </div>

                        <div>
                            <label className="text-[#004A7C] text-[11px] font-black uppercase tracking-[0.15em] mb-2 block ml-1">Archive Category</label>
                            <input
                                type="text"
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                placeholder="e.g. FEDERAL, REGIONAL, POLICY..."
                                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-xs focus:ring-2 focus:ring-[#004A7C] outline-none transition-all"
                            />
                        </div>
                    </div>

                    <div className="pt-4 flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-red-500 transition-colors"
                        >
                            Abort
                        </button>
                        <button
                            type="submit"
                            disabled={isUploading}
                            className="flex-[2] bg-[#004A7C] hover:bg-blue-800 disabled:bg-slate-400 text-white px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.25em] flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-900/20 active:scale-95"
                        >
                            {isUploading ? (
                                <>
                                    <Loader2 className="animate-spin" size={16} />
                                    Syncing...
                                </>
                            ) : (
                                <>Establish Archive</>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UploadModal;