import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { getMyLogs } from '@/services/workLogService';
import { Loader2, BarChart3 } from 'lucide-react';

const WeeklyWorkChart = () => {
    const [chartData, setChartData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
        const prepareData = async () => {
            try {
                const logs = await getMyLogs();

                // Generate last 7 days
                const days = [...Array(7)].map((_, i) => {
                    const d = new Date();
                    d.setDate(d.getDate() - i);
                    return d.toISOString().split('T')[0];
                }).reverse();

                const formattedData = days.map(date => {
                    // Safety check for logs array
                    const dayLogs = (logs || []).filter(l => l.date && l.date.split('T')[0] === date);
                    const totalHours = dayLogs.reduce((sum, log) => sum + parseFloat(log.hours_worked || 0), 0);

                    return {
                        date: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
                        hours: parseFloat(totalHours.toFixed(2))
                    };
                });

                setChartData(formattedData);
            } catch (err) {
                console.error("Chart data sync failed", err);
            } finally {
                setLoading(false);
            }
        };

        prepareData();
    }, []);

    // Return loader if not mounted or still fetching data
    if (!isMounted || loading) {
        return (
            <div className="h-[400px] flex items-center justify-center bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800">
                <Loader2 className="animate-spin text-indigo-600 dark:text-indigo-400" />
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3 mb-8">
                <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg">
                    <BarChart3 size={18} />
                </div>
                <div>
                    <h3 className="text-sm font-black uppercase tracking-tight text-slate-800 dark:text-slate-100">Weekly Performance</h3>
                    <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Hours Worked / Last 7 Days</p>
                </div>
            </div>

            {/* CRITICAL FIX:
               1. Provide a min-height class (h-[250px])
               2. Use debounce on the ResponsiveContainer if needed,
                  but a fixed height wrapper is the most stable solution.
            */}
            <div className="w-full h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={chartData}
                        margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                        <XAxis
                            dataKey="date"
                            axisLine={false}
                            tickLine={false}
                            tick={{fill: '#64748b', fontSize: 10, fontWeight: 'bold'}}
                            dy={10}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{fill: '#64748b', fontSize: 10, fontWeight: 'bold'}}
                        />
                        <Tooltip
                            cursor={{fill: '#1e293b', opacity: 0.1}}
                            contentStyle={{
                                borderRadius: '16px',
                                border: 'none',
                                backgroundColor: '#0f172a',
                                color: '#f8fafc',
                                boxShadow: '0 10px 15px -3px rgba(0,0,0,0.5)',
                                padding: '12px'
                            }}
                            itemStyle={{ color: '#818cf8' }}
                        />
                        <Bar dataKey="hours" radius={[6, 6, 0, 0]} barSize={30}>
                            {chartData.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={entry.hours > 8 ? '#6366f1' : '#312e81'}
                                />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default WeeklyWorkChart;