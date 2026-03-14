import React, { useState } from 'react';
import { Database, ChevronLeft, ChevronRight } from "lucide-react";

const DataTable = ({ columns, data, emptyMessage = "No data found", itemsPerPage = 5 }) => {
    const [currentPage, setCurrentPage] = useState(1);

    // Pagination Logic
    const totalPages = Math.ceil(data.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentData = data.slice(startIndex, startIndex + itemsPerPage);

    const goToPage = (page) => {
        if (page >= 1 && page <= totalPages) setCurrentPage(page);
    };

    return (
        <div className="w-full flex flex-col gap-6">
            <div className="w-full overflow-x-auto scrollbar-hide">
                <table className="w-full text-left border-separate border-spacing-y-2 px-2">
                    <thead>
                    <tr className="bg-indigo-900 text-white shadow-xl transition-colors duration-300">
                        {columns.map((col, index) => (
                            <th
                                key={index}
                                className={`py-6 px-8 text-[11px] font-black uppercase tracking-[0.2em] 
                                            ${index === 0 ? 'rounded-l-[2rem]' : ''} 
                                            ${index === columns.length - 1 ? 'rounded-r-[2rem]' : ''}
                                            ${col.align === 'right' ? 'text-right' : 'text-left'}`}
                            >
                                {col.header}
                            </th>
                        ))}
                    </tr>
                    </thead>
                    <tbody>
                    {currentData && currentData.length > 0 ? (
                        currentData.map((row, rowIndex) => {
                            const absoluteIndex = startIndex + rowIndex;

                            return (
                                <tr
                                    key={row.id || rowIndex}
                                    className="bg-white dark:bg-slate-900/40 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/10 transition-all duration-300 group shadow-sm"
                                >
                                    {columns.map((col, colIndex) => {
                                        const value = col.accessor ? row[col.accessor] : undefined;
                                        return (
                                            <td
                                                key={colIndex}
                                                className={`py-5 px-8 text-[13px] 
                                                            ${colIndex === 0 ? 'rounded-l-[2rem]' : ''} 
                                                            ${colIndex === columns.length - 1 ? 'rounded-r-[2rem]' : ''}
                                                            ${col.align === 'right' ? 'text-right' : 'text-left'}`}
                                            >
                                                {col.render ? (
                                                    col.accessor ? col.render(value, row, absoluteIndex) : col.render(row, absoluteIndex)
                                                ) : (
                                                    <span className="font-bold text-slate-600 dark:text-slate-300">
                                                            {value !== null ? String(value) : ''}
                                                        </span>
                                                )}
                                            </td>
                                        );
                                    })}
                                </tr>
                            );
                        })
                    ) : (
                        <tr>
                            <td colSpan={columns.length} className="py-32 text-center bg-slate-50/50 dark:bg-slate-900/20 rounded-[3rem]">
                                <div className="flex flex-col items-center justify-center gap-4">
                                    <div className="p-6 bg-white dark:bg-slate-800 rounded-[2rem] shadow-sm">
                                        <Database className="w-12 h-12 text-indigo-200" />
                                    </div>
                                    <p className="text-slate-400 font-black uppercase tracking-[0.25em] text-[10px]">{emptyMessage}</p>
                                </div>
                            </td>
                        </tr>
                    )}
                    </tbody>
                </table>
            </div>

            {/* Pagination Controls */}
            {data.length > itemsPerPage && (
                <div className="flex items-center justify-between px-8 py-4 bg-white dark:bg-slate-900 rounded-[2rem] shadow-sm">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                        Showing <span className="text-indigo-600 font-bold">{startIndex + 1}</span> to <span className="text-indigo-600 font-bold">{Math.min(startIndex + itemsPerPage, data.length)}</span> of <span className="dark:text-white">{data.length}</span>
                    </p>
                    <div className="flex gap-2">
                        <button
                            onClick={() => goToPage(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-indigo-600 hover:text-white disabled:opacity-30 disabled:hover:bg-slate-50 transition-all dark:text-slate-400"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>

                        {[...Array(totalPages)].map((_, i) => (
                            <button
                                key={i}
                                onClick={() => goToPage(i + 1)}
                                className={`w-11 h-11 rounded-xl font-black text-xs transition-all 
                                    ${currentPage === i + 1
                                    ? 'bg-indigo-900 text-white shadow-lg shadow-indigo-200/50'
                                    : 'bg-slate-50 dark:bg-slate-800 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
                            >
                                {i + 1}
                            </button>
                        ))}

                        <button
                            onClick={() => goToPage(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-indigo-600 hover:text-white disabled:opacity-30 disabled:hover:bg-slate-50 transition-all dark:text-slate-400"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DataTable;