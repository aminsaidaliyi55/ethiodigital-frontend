import React from "react";
import { Bell, Clock, AlertTriangle, ShieldCheck, Info, CheckCheck } from "lucide-react";

export default function NotificationPanel({ isOpen, onClose, notifications, markAllAsRead, unreadCount }) {
    if (!isOpen) return null;

    const getNotificationStyles = (type) => {
        switch (type) {
            case 'success':
                return {
                    icon: <ShieldCheck size={16} />,
                    container: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400',
                    dot: 'bg-emerald-500'
                };
            case 'alert':
                return {
                    icon: <AlertTriangle size={16} />,
                    container: 'bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400',
                    dot: 'bg-rose-500'
                };
            default:
                return {
                    icon: <Info size={16} />,
                    container: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
                    dot: 'bg-indigo-900'
                };
        }
    };

    return (
        <>
            <div className="fixed inset-0 z-40 bg-black/5 md:hidden" onClick={onClose} />
            <div className="absolute right-0 top-full mt-3 w-80 md:w-96 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-4 transition-all duration-300">

                <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="text-sm font-black text-slate-900 dark:text-white capitalize tracking-tight">Notifications</h3>
                            {unreadCount > 0 && (
                                <span className="bg-rose-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full uppercase">
                                    {unreadCount} New
                                </span>
                            )}
                        </div>
                        <p className="text-[10px] font-bold text-indigo-500 dark:text-indigo-400 uppercase">System Alerts & Updates</p>
                    </div>
                    {unreadCount > 0 && (
                        <button
                            onClick={markAllAsRead}
                            className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors uppercase flex items-center gap-1"
                        >
                            <CheckCheck size={14} />
                            Read All
                        </button>
                    )}
                </div>

                <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                    {notifications.length > 0 ? (
                        notifications.map((n) => {
                            const styles = getNotificationStyles(n.type);
                            return (
                                <div key={n.id} className={`p-4 border-b border-slate-50 dark:border-slate-800/50 flex gap-4 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/30 ${!n.read ? 'bg-indigo-50/30 dark:bg-indigo-900/10' : ''}`}>
                                    <div className={`mt-1 p-2 rounded-xl shrink-0 ${styles.container}`}>
                                        {styles.icon}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-snug">{n.message}</p>
                                        <div className="flex items-center gap-2 mt-2">
                                            <Clock size={10} className="text-slate-400"/>
                                            <span className="text-[10px] font-medium text-slate-400">
                                                {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    </div>
                                    {!n.read && <div className={`w-2.5 h-2.5 rounded-full mt-2 shadow-sm ${styles.dot} animate-pulse`}></div>}
                                </div>
                            );
                        })
                    ) : (
                        <div className="p-12 text-center">
                            <div className="w-14 h-14 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Bell className="text-slate-300 dark:text-slate-600" size={24}/>
                            </div>
                            <p className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Inbox is empty</p>
                        </div>
                    )}
                </div>

                <button onClick={onClose} className="w-full py-4 text-[10px] font-black text-slate-500 dark:text-slate-400 capitalize tracking-widest hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors border-t border-slate-100 dark:border-slate-800">
                    Close Panel
                </button>
            </div>
        </>
    );
}