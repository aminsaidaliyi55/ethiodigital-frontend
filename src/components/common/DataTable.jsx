import React from 'react';

const DataTable = ({ columns, data, emptyMessage = "No data found" }) => {
    return (
        <div className="w-full overflow-x-auto scrollbar-hide">
            <table className="w-full text-left border-separate border-spacing-y-4">
                <thead>
                <tr className="bg-indigo-900 dark:bg-indigo-900 text-white">
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
                            className="bg-white dark:bg-slate-800/50 hover:bg-indigo-50/30 dark:hover:bg-indigo-500/5 transition-all duration-300 group shadow-sm"
                        >
                            {columns.map((col, colIndex) => {
                                // Extract value safely based on accessor string
                                const value = col.accessor ? row[col.accessor] : undefined;

                                return (
                                    <td
                                        key={colIndex}
                                        className={`py-5 px-8 text-sm
                                                        ${colIndex === 0 ? 'rounded-l-[1.5rem] border-l border-y border-slate-100 dark:border-slate-800' : ''} 
                                                        ${colIndex === columns.length - 1 ? 'rounded-r-[1.5rem] border-r border-y border-slate-100 dark:border-slate-800' : 'border-y border-slate-100 dark:border-slate-800'}
                                                        ${col.align === 'right' ? 'text-right' : 'text-left'}`}
                                    >
                                        {/* LOGIC FLOW:
                                                1. If custom render() exists:
                                                   - If accessor exists, pass (value, fullRow)
                                                   - If no accessor, pass (fullRow)
                                                2. If no render, display the raw primitive value
                                            */}
                                        {col.render ? (
                                            col.accessor ? col.render(value, row) : col.render(row)
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
                            className="py-32 text-center bg-slate-50/50 dark:bg-slate-800/20 rounded-[2.5rem] border-2 border-dashed border-slate-100 dark:border-slate-800"
                        >
                            <div className="flex flex-col items-center justify-center gap-3">
                                <div className="p-4 bg-white dark:bg-slate-800 rounded-2xl shadow-sm">
                                    <svg className="w-8 h-8 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2-2 0 00-2-2H6a2-2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2-2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                                    </svg>
                                </div>
                                <p className="text-slate-400 font-black uppercase tracking-[0.2em] text-[10px]">
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