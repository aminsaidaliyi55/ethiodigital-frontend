import React, { useEffect, useState, useCallback } from 'react';
import { Search, Plus, X, Loader2, Edit, Trash2, Eye, Globe, Shield, ChevronLeft, ChevronRight } from "lucide-react";
import toast from "react-hot-toast";
import institutionService from '@/services/institutionService';
import DataTable from '@/components/DataTable';
import NodeModal from './NodeModal';
import "leaflet/dist/leaflet.css";

const FederalAdminDashboard = () => {
    const [hierarchy, setHierarchy] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedLevel, setSelectedLevel] = useState('Region');
    const [modalState, setModalState] = useState(null);
    const [form, setForm] = useState({});
    const [currentPage, setCurrentPage] = useState(1);

    const initialFormState = {
        name: '',
        level: 'Region',
        parent_id: '',
        admin_code: '',
        population: '',
        area_km2: '',
        north_lat: '9.06',
        south_lat: '8.98',
        east_lng: '38.80',
        west_lng: '38.70'
    };

    const levels = ['Region', 'Zone', 'Woreda', 'Kebele'];
    const itemsPerPage = 8;

    const loadHierarchy = useCallback(async (search = searchTerm, level = selectedLevel) => {
        try {
            setLoading(true);
            const data = await institutionService.getRegionalHierarchy(search, level);
            setHierarchy(data || []);
        } catch (err) {
            toast.error("Registry synchronization failed");
        } finally {
            setLoading(false);
        }
    }, [searchTerm, selectedLevel]);

    useEffect(() => {
        const timer = setTimeout(() => { loadHierarchy(); }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm, selectedLevel, loadHierarchy]);

    const columns = [
        {
            header: "REF #",
            render: (row, index) => (
                <span className="text-indigo-900 dark:text-indigo-400 font-mono text-[9px] font-black tracking-widest opacity-60">
                    {((currentPage - 1) * itemsPerPage + index + 1).toString().padStart(3, '0')}
                </span>
            )
        },
        { header: "Administrative Territory", accessor: "name", className: "font-black text-[#004A7C] uppercase text-[10px]" },
        { header: "Population", render: (row) => <span className="text-[10px] font-bold text-slate-500 font-mono">{row.population?.toLocaleString() || '0'}</span> },
        {
            header: "Control Actions",
            align: "right",
            render: (row) => (
                <div className="flex justify-end gap-2">
                    {/* Logic: Trigger modals with the current row data */}
                    <ActionButton icon={<Eye size={16} />} textColor="text-blue-600" onClick={() => { setForm(row); setModalState('view'); }} />
                    <ActionButton icon={<Edit size={16} />} textColor="text-amber-600" onClick={() => { setForm(row); setModalState('edit'); }} />
                    <ActionButton icon={<Trash2 size={16} />} textColor="text-red-600" onClick={() => { setForm(row); setModalState('delete'); }} />
                </div>
            )
        }
    ];

    return (
        <div className="p-8 bg-[#F8FAFC] dark:bg-[#070D18] min-h-screen">
            <header className="flex justify-between mb-8 items-end">
                <div>
                    <h1 className="text-[#004A7C] dark:text-white text-2xl font-black uppercase">Admin Hierarchy</h1>
                    <p className="text-slate-400 text-xs">Total Records: {hierarchy.length}</p>
                </div>
                <div className="flex gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-3 text-slate-400" size={16} />
                        <input type="text" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 pr-4 py-2 border rounded-lg text-xs w-64 dark:bg-slate-900 dark:border-slate-700 dark:text-white" />
                    </div>
                    <button onClick={() => { setForm(initialFormState); setModalState('create'); }} className="bg-[#004A7C] text-white px-5 py-2 rounded-lg text-xs font-black uppercase">+ New Entry</button>
                </div>
            </header>

            <div className="flex bg-white dark:bg-slate-900 p-1 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 mb-6 w-fit">
                {levels.map((l) => (
                    <button key={l} onClick={() => { setSelectedLevel(l); setCurrentPage(1); }} className={`px-6 py-2 rounded-lg font-black text-[9px] uppercase tracking-widest transition-all ${selectedLevel === l ? 'bg-[#004A7C] text-white shadow-md' : 'text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
                        {l}
                    </button>
                ))}
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
                {loading ? <div className="p-20 text-center"><Loader2 className="animate-spin mx-auto text-[#004A7C]" /></div> : (
                    <>
                        <DataTable columns={columns} data={hierarchy.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)} rowKey="id" />
                        <div className="p-4 flex justify-between items-center border-t border-slate-100 dark:border-slate-800">
                            <span className="text-[10px] font-black text-slate-400 uppercase">Page {currentPage} of {Math.ceil(hierarchy.length / itemsPerPage)}</span>
                            <div className="flex gap-2">
                                <button onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 1} className="p-2 border rounded-xl disabled:opacity-20"><ChevronLeft size={18}/></button>
                                <button onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage === Math.ceil(hierarchy.length / itemsPerPage)} className="p-2 border rounded-xl disabled:opacity-20"><ChevronRight size={18}/></button>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Logic: Single Modal wrapper that changes behavior based on modalState */}
            {modalState && (
                <NodeModal
                    mode={modalState}
                    form={form}
                    initialFormState={initialFormState}
                    levels={levels}
                    onClose={() => setModalState(null)}
                    onSuccess={loadHierarchy}
                    readOnly={modalState === 'view'}
                />
            )}
        </div>
    );
};

const ActionButton = ({ icon, textColor, onClick }) => (
    <button onClick={onClick} className={`p-2 bg-slate-50 dark:bg-slate-800 rounded-lg ${textColor} transition-all border border-slate-100 dark:border-slate-700 hover:shadow-md active:scale-95`}>
        {icon}
    </button>
);

export default FederalAdminDashboard;