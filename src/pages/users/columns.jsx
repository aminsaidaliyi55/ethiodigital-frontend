import { Eye, Edit, Trash2 } from "lucide-react";

export const getUserColumns = (setForm, setModalState, handleDelete) => [
    { header: "Full Name", accessor: "name", className: "font-black text-[#004A7C] uppercase" },
    { header: "Email Address", accessor: "email", className: "lowercase text-slate-500" },
    { header: "Phone", accessor: "phone_number", className: "text-slate-500" },
    {
        header: "Status",
        render: (row) => (
            <span className={`px-2 py-1 rounded text-[10px] font-black ${row.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {row.is_active ? 'ACTIVE' : 'INACTIVE'}
            </span>
        )
    },
    {
        header: "Actions",
        className: "text-right",
        render: (row) => (
            <div className="flex justify-end gap-2">
                <button onClick={() => { setForm({...row, roles: [row.role_id]}); setModalState('view'); }} className="p-1.5 text-blue-600"><Eye size={16} /></button>
                <button onClick={() => { setForm({...row, roles: [row.role_id]}); setModalState('edit'); }} className="p-1.5 text-amber-600"><Edit size={16} /></button>
                <button onClick={() => handleDelete(row.id)} className="p-1.5 text-red-600"><Trash2 size={16} /></button>
            </div>
        )
    }
];