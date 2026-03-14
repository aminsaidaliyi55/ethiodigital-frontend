import React, { useState, useEffect } from "react";
import { Plus, Tag, Trash2, Folder, Edit3, X, Loader2, Save } from "lucide-react";
import { getCategories, createCategory, deleteCategory, updateCategory } from "@/services/categoryService.js";
import toast from "react-hot-toast";

const CategoryManager = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [formData, setFormData] = useState({ name: "", color: "#6366f1" });

    useEffect(() => {
        loadCategories();
    }, []);

    const loadCategories = async () => {
        try {
            const data = await getCategories();
            setCategories(data);
        } catch (e) {
            toast.error("Taxonomy Sync Failed");
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        if (!formData.name.trim()) return toast.error("Category name required");

        setSubmitting(true);
        try {
            await createCategory(formData);
            toast.success("New portfolio category deployed");
            setFormData({ name: "", color: "#6366f1" });
            await loadCategories();
        } catch (err) {
            toast.error(err.response?.data?.error || "Deployment failed");
        } finally {
            setSubmitting(false);
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await updateCategory(editingCategory.id, formData);
            toast.success("Category updated successfully");
            closeModal();
            await loadCategories();
        } catch (err) {
            toast.error("Update failed");
        } finally {
            setSubmitting(false);
        }
    };

    const openEditModal = (cat) => {
        setEditingCategory(cat);
        setFormData({ name: cat.name, color: cat.color });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingCategory(null);
        setFormData({ name: "", color: "#6366f1" });
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete category? Associated projects will become 'Uncategorized'.")) return;
        try {
            await deleteCategory(id);
            toast.success("Category removed from system");
            loadCategories();
        } catch (e) {
            toast.error("Database deletion failed");
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <Loader2 className="animate-spin text-indigo-600 mb-4" size={40} />
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Synchronizing...</p>
        </div>
    );

    return (
        <div className="p-8 max-w-6xl mx-auto animate-in fade-in duration-500 relative">
            <header className="mb-10">
                <h1 className="text-4xl font-black uppercase tracking-tighter text-slate-900">
                    Portfolio <span className="text-indigo-600">Taxonomy</span>
                </h1>
                <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-[0.4em]">
                    Define organizational groupings
                </p>
            </header>

            <div className="grid grid-cols-12 gap-10">
                {/* CREATE FORM */}
                <div className="col-span-12 lg:col-span-4">
                    <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl border border-slate-100 sticky top-8">
                        <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
                            <Plus size={14} className="text-indigo-600" /> Global Deployment
                        </h2>
                        <form onSubmit={handleCreate} className="space-y-6">
                            <FormFields formData={formData} setFormData={setFormData} />
                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full bg-slate-900 text-white font-black uppercase text-[10px] tracking-widest py-4 rounded-2xl hover:bg-indigo-900 transition-all flex items-center justify-center gap-2"
                            >
                                {submitting && <Loader2 size={14} className="animate-spin" />}
                                Deploy Logic
                            </button>
                        </form>
                    </div>
                </div>

                {/* LIST GRID */}
                <div className="col-span-12 lg:col-span-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {categories.map((cat) => (
                            <CategoryCard
                                key={cat.id}
                                cat={cat}
                                onEdit={() => openEditModal(cat)}
                                onDelete={() => handleDelete(cat.id)}
                            />
                        ))}
                    </div>
                </div>
            </div>

            {/* EDIT MODAL */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-md rounded-[3rem] shadow-2xl p-10 animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center mb-8">
                            <div>
                                <h2 className="text-2xl font-black uppercase tracking-tighter text-slate-900">Modify <span className="text-indigo-600">Definition</span></h2>
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">ID: {editingCategory?.id}</p>
                            </div>
                            <button onClick={closeModal} className="p-3 bg-slate-100 text-slate-400 rounded-2xl hover:bg-red-50 hover:text-red-500 transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleUpdate} className="space-y-6">
                            <FormFields formData={formData} setFormData={setFormData} />
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="flex-1 bg-indigo-900 text-white font-black uppercase text-[10px] tracking-widest py-4 rounded-2xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200 flex items-center justify-center gap-2"
                                >
                                    {submitting ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                                    Commit Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

// Sub-component for form inputs to keep code DRY
const FormFields = ({ formData, setFormData }) => (
    <>
        <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-500 ml-1">Category Label</label>
            <input
                className="w-full px-5 py-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-indigo-500 focus:bg-white transition-all outline-none font-bold text-sm text-slate-800"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
        </div>
        <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-500 ml-1">Brand Signature</label>
            <div className="flex gap-4 items-center bg-slate-50 p-3 rounded-2xl">
                <input
                    type="color"
                    className="w-12 h-12 rounded-xl cursor-pointer bg-transparent border-none"
                    value={formData.color}
                    onChange={(e) => setFormData({...formData, color: e.target.value})}
                />
                <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest">{formData.color}</span>
            </div>
        </div>
    </>
);

const CategoryCard = ({ cat, onEdit, onDelete }) => (
    <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all group relative overflow-hidden">
        <div className="flex justify-between items-start relative z-10 mb-8">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white" style={{ backgroundColor: cat.color, boxShadow: `0 12px 24px ${cat.color}40` }}>
                <Folder size={24} />
            </div>
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                <button onClick={onEdit} className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors"><Edit3 size={16} /></button>
                <button onClick={onDelete} className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"><Trash2 size={16} /></button>
            </div>
        </div>
        <div className="relative z-10">
            <h3 className="text-base font-black uppercase text-slate-800 tracking-tight">{cat.name}</h3>
            <div className="mt-4 flex items-center gap-2">
                <span className="text-[9px] font-black px-3 py-1 bg-slate-100 text-slate-400 rounded-lg uppercase tracking-wider">
                    {cat.project_count || 0} Registered Projects
                </span>
            </div>
        </div>
    </div>
);

export default CategoryManager;