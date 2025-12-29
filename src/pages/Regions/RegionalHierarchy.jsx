import React, { useState, useMemo } from "react";
import {
    MapPin,
    Search,
    Activity,
    ShieldAlert,
    Layers,
    Plus,
    X,
    Cpu,
    Info,
    Globe,
    UserCheck,
    Briefcase,
    ChevronRight,
    ChevronDown,
    Building2,
    Database
} from "lucide-react";
import toast, { Toaster } from 'react-hot-toast';

const RegionalHierarchy = () => {
    // --- MOCK DATA ---
    const orgStructureFederal = [
        { id: "FED-01", name: "Ministry of Finance", level: "Tier 1" },
        { id: "FED-02", name: "Revenue Authority", level: "Tier 1" }
    ];

    const userTable = [
        { id: "USR-001", name: "Dr. Elias Tesfaye", role: "Senior Administrator" },
        { id: "USR-002", name: "Sara Kelati", role: "Regional Director" },
        { id: "USR-003", name: "Mohammed Ahmed", role: "Operations Lead" }
    ];

    // --- INITIAL HIERARCHICAL STATE ---
    const [nodes, setNodes] = useState([
        {
            id: "REG-AD",
            name: "Addis Ababa",
            type: "Region",
            code: "AD",
            compliance: 98,
            manager: "Dr. Elias Tesfaye",
            federalParent: "FED-01",
            isOpen: true,
            children: [
                {
                    id: "ZN-BKK",
                    name: "Bole Sub-City",
                    type: "Zone",
                    code: "BL",
                    compliance: 92,
                    manager: "Martha Bekele",
                    isOpen: false,
                    children: [
                        { id: "WD-01", name: "Woreda 01", type: "Woreda", code: "W1", compliance: 95, manager: "Abebe H.", children: [] },
                        { id: "WD-02", name: "Woreda 02", type: "Woreda", code: "W2", compliance: 88, manager: "Sifan T.", children: [] }
                    ]
                },
                { id: "ZN-KRL", name: "Kirkos Sub-City", type: "Zone", code: "KR", compliance: 85, manager: "John Doe", children: [] }
            ]
        },
        {
            id: "REG-OR",
            name: "Oromia",
            type: "Region",
            code: "OR",
            compliance: 85,
            manager: "Sara Kelati",
            federalParent: "FED-01",
            isOpen: false,
            children: []
        }
    ]);

    const [selectedNode, setSelectedNode] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [targetParentId, setTargetParentId] = useState(null); // For adding sub-nodes

    const [newRegion, setNewRegion] = useState({
        name: "", code: "", federalParent: "FED-01", managerId: "USR-001"
    });

    // --- RECURSIVE LOGIC ---
    const toggleNode = (nodeId) => {
        const toggleRecursive = (list) => {
            return list.map(node => {
                if (node.id === nodeId) return { ...node, isOpen: !node.isOpen };
                if (node.children) return { ...node, children: toggleRecursive(node.children) };
                return node;
            });
        };
        setNodes(toggleRecursive(nodes));
    };

    const addNodeToHierarchy = (parentId, newNode) => {
        const addRecursive = (list) => {
            return list.map(node => {
                if (node.id === parentId) {
                    return { ...node, children: [...(node.children || []), newNode], isOpen: true };
                }
                if (node.children) return { ...node, children: addRecursive(node.children) };
                return node;
            });
        };

        if (!parentId) {
            setNodes([...nodes, newNode]);
        } else {
            setNodes(addRecursive(nodes));
        }
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();
        const managerName = userTable.find(u => u.id === newRegion.managerId)?.name || "Unassigned";

        const newNode = {
            id: `NODE-${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
            name: newRegion.name,
            code: newRegion.code.toUpperCase(),
            type: targetParentId ? "Sub-Node" : "Region",
            compliance: Math.floor(Math.random() * 30) + 70,
            manager: managerName,
            federalParent: newRegion.federalParent,
            isOpen: false,
            children: []
        };

        addNodeToHierarchy(targetParentId, newNode);
        setIsModalOpen(false);
        setTargetParentId(null);
        setNewRegion({ name: "", code: "", federalParent: "FED-01", managerId: "USR-001" });
        toast.success(`${newNode.name} Integrated into Hierarchy`);
    };

    // --- RECURSIVE ROW COMPONENT ---
    const RenderNodeRow = ({ node, depth = 0 }) => {
        const hasChildren = node.children && node.children.length > 0;
        const matchesSearch = node.name.toLowerCase().includes(searchQuery.toLowerCase());

        if (searchQuery && !matchesSearch && !hasChildren) return null;

        return (
            <React.Fragment key={node.id}>
                <tr className={`transition-all hover:bg-indigo-50 dark:hover:bg-white/[0.02] border-b border-indigo-50 dark:border-white/5 ${!matchesSearch && searchQuery ? 'opacity-40' : ''}`}>
                    <td className="px-10 py-6" style={{ paddingLeft: `${depth * 2 + 2.5}rem` }}>
                        <div className="flex items-center gap-4">
                            {hasChildren ? (
                                <button onClick={() => toggleNode(node.id)} className="text-indigo-400 hover:text-indigo-900 transition-colors">
                                    {node.isOpen ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                                </button>
                            ) : (
                                <div className="w-5" />
                            )}
                            <div className="w-10 h-10 rounded-xl bg-indigo-900/10 text-indigo-900 dark:text-indigo-400 flex items-center justify-center font-black text-[10px] border border-indigo-200 dark:border-indigo-500/20">
                                {node.code}
                            </div>
                            <div>
                                <p className="text-sm font-black tracking-tight text-indigo-900 dark:text-white">{node.name}</p>
                                <p className="text-[9px] font-bold uppercase opacity-30 tracking-widest">{node.type}</p>
                            </div>
                        </div>
                    </td>
                    <td className="px-8 py-6 text-[11px] font-bold text-indigo-600 dark:text-indigo-400 italic">
                        <div className="flex items-center gap-2"><UserCheck size={14} /> {node.manager}</div>
                    </td>
                    <td className="px-8 py-6">
                        <div className="flex items-center gap-3">
                            <div className="w-20 h-1.5 bg-indigo-100 dark:bg-indigo-800 rounded-full overflow-hidden">
                                <div className="h-full bg-indigo-900" style={{ width: `${node.compliance}%` }}></div>
                            </div>
                            <span className="text-[10px] font-black opacity-60">{node.compliance}%</span>
                        </div>
                    </td>
                    <td className="px-10 py-6 text-right space-x-2">
                        <button
                            onClick={() => { setTargetParentId(node.id); setIsModalOpen(true); }}
                            className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 border border-emerald-100 dark:border-emerald-500/20 hover:bg-emerald-600 hover:text-white transition-all"
                            title="Add Sub-node"
                        >
                            <Plus size={16} />
                        </button>
                        <button onClick={() => setSelectedNode(node)} className="p-2.5 rounded-xl bg-indigo-50 dark:bg-white/5 border border-indigo-100 dark:border-white/5 hover:border-indigo-900 transition-all">
                            <Info size={16} className="text-indigo-400" />
                        </button>
                    </td>
                </tr>
                {node.isOpen && node.children && node.children.map(child => (
                    <RenderNodeRow node={child} depth={depth + 1} key={child.id} />
                ))}
            </React.Fragment>
        );
    };

    return (
        <div className="min-h-screen p-6 md:p-10 font-sans bg-indigo-50 dark:bg-indigo-950 text-slate-900 dark:text-indigo-50 transition-colors duration-300">
            <Toaster position="bottom-right" />

            {/* --- MODAL (Shared for Region & Sub-node) --- */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-indigo-900/40 backdrop-blur-sm" onClick={() => {setIsModalOpen(false); setTargetParentId(null);}}></div>
                    <div className="relative w-full max-w-xl rounded-[3rem] shadow-2xl overflow-hidden bg-white dark:bg-indigo-900 border border-indigo-200 dark:border-indigo-800">
                        <div className="p-8 border-b border-indigo-100 dark:border-white/5 bg-indigo-50/50 flex justify-between items-center">
                            <div>
                                <h2 className="text-xl font-black italic text-indigo-900 dark:text-white">
                                    {targetParentId ? "Add Sub-Authority" : "Register Primary Region"}
                                </h2>
                                <p className="text-[9px] font-bold opacity-40 tracking-widest uppercase mt-1">
                                    {targetParentId ? `Parent: ${targetParentId}` : "Level: Federal Tier 1"}
                                </p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-indigo-200 rounded-full transition-colors"><X size={24} /></button>
                        </div>

                        <form onSubmit={handleFormSubmit} className="p-8 space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black tracking-widest text-indigo-400 uppercase">Node Name</label>
                                    <input type="text" required placeholder="e.g. Bole Zone" className="w-full bg-indigo-50 dark:bg-indigo-950 rounded-xl px-5 py-3 text-xs font-bold outline-none border-2 border-indigo-100 dark:border-indigo-800 focus:border-indigo-900" value={newRegion.name} onChange={(e) => setNewRegion({...newRegion, name: e.target.value})} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black tracking-widest text-indigo-400 uppercase">Code</label>
                                    <input type="text" required placeholder="BZ" className="w-full bg-indigo-50 dark:bg-indigo-950 rounded-xl px-5 py-3 text-xs font-bold outline-none border-2 border-indigo-100 dark:border-indigo-800 focus:border-indigo-900 uppercase" value={newRegion.code} onChange={(e) => setNewRegion({...newRegion, code: e.target.value})} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[9px] font-black tracking-widest text-indigo-400 uppercase">Lead Authority</label>
                                <select className="w-full bg-indigo-50 dark:bg-indigo-950 rounded-xl px-5 py-3 text-xs font-bold outline-none border-2 border-indigo-100 dark:border-indigo-800" value={newRegion.managerId} onChange={(e) => setNewRegion({...newRegion, managerId: e.target.value})}>
                                    {userTable.map(u => <option key={u.id} value={u.id}>{u.name} ({u.role})</option>)}
                                </select>
                            </div>
                            <button type="submit" className="w-full bg-indigo-900 hover:bg-black py-4 rounded-xl text-white font-black text-xs uppercase tracking-widest transition-all">
                                Initialize Node
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* --- HEADER --- */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 mb-12">
                <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-white dark:bg-indigo-900 border border-indigo-200 dark:border-indigo-800 rounded-2xl flex items-center justify-center text-indigo-900 dark:text-indigo-400 shadow-xl">
                        <Database size={32} />
                    </div>
                    <div>
                        <h1 className="text-4xl font-black italic tracking-tighter text-indigo-900 dark:text-white">Authority Tree</h1>
                        <p className="text-[10px] font-bold uppercase tracking-[0.3em] mt-1 opacity-40">Multi-Level Regional Management</p>
                    </div>
                </div>
                <button
                    onClick={() => { setTargetParentId(null); setIsModalOpen(true); }}
                    className="px-8 py-4 bg-indigo-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg hover:bg-black transition-all flex items-center gap-2"
                >
                    <Plus size={16} /> New Primary Node
                </button>
            </div>

            {/* --- TREE TABLE --- */}
            <div className="rounded-[2.5rem] border border-indigo-100 dark:border-indigo-800 bg-white dark:bg-indigo-900 shadow-xl overflow-hidden">
                <div className="p-8 flex flex-col md:flex-row justify-between items-center gap-6 bg-indigo-50/30 dark:bg-white/5 border-b border-indigo-50 dark:border-white/5">
                    <div className="flex items-center gap-4">
                        <Building2 className="text-indigo-900 dark:text-indigo-400" size={24} />
                        <h3 className="font-black text-sm italic tracking-widest uppercase">Organizational Hierarchy</h3>
                    </div>
                    <div className="relative w-full md:w-[350px]">
                        <Search size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-indigo-400" />
                        <input
                            type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search by name or code..."
                            className="pl-12 pr-6 py-4 bg-indigo-50 dark:bg-indigo-950 border-2 border-indigo-100 dark:border-indigo-800 rounded-2xl text-[11px] font-bold w-full outline-none focus:border-indigo-900"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                        <tr className="bg-indigo-50/50 dark:bg-white/5 text-[10px] font-black opacity-40 uppercase tracking-widest text-indigo-900 dark:text-white">
                            <th className="px-10 py-5">Structural Designation</th>
                            <th className="px-8 py-5">Lead Authority</th>
                            <th className="px-8 py-5">Compliance</th>
                            <th className="px-10 py-5 text-right">Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {nodes.map(node => (
                            <RenderNodeRow node={node} key={node.id} />
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default RegionalHierarchy;