import React from 'react';
import { Database } from "lucide-react";

const DataTable = ({ columns, data, emptyMessage = "No data found" }) => {
    return (
        <div className="w-full overflow-x-auto scrollbar-hide">
            <table className="w-full text-left border-separate border-spacing-y-4 px-2">
                <thead>
                <tr className="bg-[#004A7C] dark:bg-slate-800 text-white shadow-md transition-colors duration-300">
                    {columns.map((col, index) => (
                        <th
                            key={index}
                            className={`py-5 px-8 text-[11px] font-black uppercase tracking-[0.15em] 
                                    ${index === 0 ? 'rounded-l-[1.5rem]' : ''} 
                                    ${index === columns.length - 1 ? 'rounded-r-[1.5rem]' : ''}
                                    ${col.align === 'right' ? 'text-right' : 'text-left'}`}
                        >
                            {col.header}
                        </th>
                    ))}
                </tr>
                </thead>
                <tbody>
                {data && data.length > 0 ? (
                    data.map((row, rowIndex) => (
                        <tr
                            key={row._id || row.id || rowIndex}
                            className="bg-white dark:bg-slate-900/40 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-all duration-300 group shadow-sm border-y border-transparent"
                        >
                            {columns.map((col, colIndex) => {
                                const value = col.accessor ? row[col.accessor] : undefined;

                                return (
                                    <td
                                        key={colIndex}
                                        className={`py-5 px-8 text-[13px] transition-colors
                                                ${colIndex === 0 ? 'rounded-l-[1.5rem] border-l border-y border-slate-100 dark:border-slate-800' : ''} 
                                                ${colIndex === columns.length - 1 ? 'rounded-r-[1.5rem] border-r border-y border-slate-100 dark:border-slate-800' : 'border-y border-slate-100 dark:border-slate-800'}
                                                ${col.align === 'right' ? 'text-right' : 'text-left'}`}
                                    >
                                        {col.render ? (
                                            col.accessor ? col.render(value, row, rowIndex) : col.render(row, rowIndex)
                                        ) : (
                                            <span className="font-bold text-slate-600 dark:text-slate-300">
                                                    {typeof value !== 'object' && value !== null ? String(value) : ''}
                                                </span>
                                        )}
                                    </td>
                                );
                            })}
                        </tr>
                    ))
                ) : (
                    <tr>
                        <td
                            colSpan={columns.length}
                            className="py-32 text-center bg-slate-50/50 dark:bg-slate-900/20 rounded-[2.5rem] border-2 border-dashed border-slate-200 dark:border-slate-800 transition-all"
                        >
                            <div className="flex flex-col items-center justify-center gap-4">
                                <div className="p-5 bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700">
                                    <Database className="w-10 h-10 text-slate-300 dark:text-slate-600" />
                                </div>
                                <p className="text-slate-400 dark:text-slate-500 font-black uppercase tracking-[0.2em] text-[10px]">
                                    {emptyMessage}
                                </p>
                            </div>
                        </td>
                    </tr>
                )}
                </tbody>
            </table>
        </div>
    );
};

export default DataTable;