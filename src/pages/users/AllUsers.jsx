import React from "react";
import { Plus, X, Loader2, Search, ChevronLeft, ChevronRight } from "lucide-react";
import DataTable from "@/components/DataTable";
import UserForm from "@/components/users/UserForm";
import { useUsers } from "./useUsers";
import { getUserColumns } from "./columns";

export default function AllUser() {
    const {
        users, roles, loading, modalState, setModalState, search, setSearch,
        currentPage, setCurrentPage, form, setForm, initialFormState, handleSave, handleDelete
    } = useUsers();

    const itemsPerPage = 8;
    const totalPages = Math.ceil(users.length / itemsPerPage);
    const paginatedUsers = users.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
    const columns = getUserColumns(setForm, setModalState, handleDelete);

    return (
        <div className="p-8 bg-[#F8FAFC] dark:bg-[#070D18] min-h-screen">
            <header className="flex justify-between mb-8 items-end">
                <div>
                    <h1 className="text-[#004A7C] dark:text-white text-2xl font-black uppercase">User Directory</h1>
                    <p className="text-slate-400 text-xs">Total: {users.length}</p>
                </div>
                <div className="flex gap-3">
                    <div className="relative"><Search className="absolute left-3 top-3 text-slate-400" size={16} />
                        <input type="text" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 pr-4 py-2 border rounded-lg text-xs" />
                    </div>
                    <button onClick={() => { setForm(initialFormState); setModalState('create'); }} className="bg-[#004A7C] text-white px-5 py-2 rounded-lg text-xs font-black uppercase">+ New User</button>
                </div>
            </header>

            <div className="bg-white dark:bg-slate-900 border rounded-xl overflow-hidden">
                {loading ? <div className="p-20 text-center"><Loader2 className="animate-spin mx-auto" /></div> : (
                    <>
                        <DataTable columns={columns} data={paginatedUsers} rowKey="id" />
                        <div className="p-4 flex justify-between items-center border-t">
                            <span className="text-[10px] font-black text-slate-400 uppercase">Page {currentPage} of {totalPages}</span>
                            <div className="flex gap-2">
                                <button onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 1} className="p-2 border rounded-xl"><ChevronLeft size={18}/></button>
                                <button onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage === totalPages} className="p-2 border rounded-xl"><ChevronRight size={18}/></button>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {modalState && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[120]">
                    <div className="bg-white dark:bg-slate-900 w-full max-w-4xl rounded-2xl overflow-hidden shadow-2xl">
                        <div className={`p-6 flex justify-between text-white ${modalState === 'view' ? 'bg-slate-700' : 'bg-[#004A7C]'}`}>
                            <h2 className="font-black uppercase">{modalState} User Profile</h2>
                            <button onClick={() => setModalState(null)}><X size={20} /></button>
                        </div>
                        <div className="p-8 max-h-[60vh] overflow-y-auto">
                            <UserForm form={form} setForm={setForm} roles={roles} isCreate={modalState === 'create'} readOnly={modalState === 'view'} />
                        </div>
                        <div className="p-6 bg-slate-50 flex justify-end gap-3">
                            <button onClick={() => setModalState(null)} className="px-6 text-xs font-black uppercase text-slate-400">Discard</button>
                            {modalState !== 'view' && <button onClick={handleSave} className="bg-[#004A7C] text-white px-8 py-2 rounded-lg text-xs font-black uppercase">Save</button>}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}