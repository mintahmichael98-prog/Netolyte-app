import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import React from 'react';
import { Bell, Zap, UserPlus, RefreshCw, X } from 'lucide-react';
const NotificationCenter = ({ notifications, onSetNotifications, onNavigate }) => {
    const [isOpen, setIsOpen] = React.useState(false);
    const unreadCount = notifications.filter(n => !n.read).length;
    const toggleOpen = () => {
        if (!isOpen) {
            // Mark all as read when opening
            onSetNotifications(notifications.map(n => ({ ...n, read: true })));
        }
        setIsOpen(!isOpen);
    };
    const getIcon = (type) => {
        switch (type) {
            case 'assignment': return _jsx(UserPlus, { className: "w-4 h-4 text-purple-500" });
            case 'success': return _jsx(Zap, { className: "w-4 h-4 text-green-500" });
            default: return _jsx(RefreshCw, { className: "w-4 h-4 text-blue-500" });
        }
    };
    const timeAgo = (timestamp) => {
        const seconds = Math.floor((new Date().getTime() - new Date(timestamp).getTime()) / 1000);
        let interval = seconds / 31536000;
        if (interval > 1)
            return Math.floor(interval) + "y ago";
        interval = seconds / 2592000;
        if (interval > 1)
            return Math.floor(interval) + "mo ago";
        interval = seconds / 86400;
        if (interval > 1)
            return Math.floor(interval) + "d ago";
        interval = seconds / 3600;
        if (interval > 1)
            return Math.floor(interval) + "h ago";
        interval = seconds / 60;
        if (interval > 1)
            return Math.floor(interval) + "m ago";
        return Math.floor(seconds) + "s ago";
    };
    return (_jsxs("div", { className: "relative", children: [_jsxs("button", { onClick: toggleOpen, className: "relative p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors", children: [_jsx(Bell, { className: "w-5 h-5" }), unreadCount > 0 && (_jsx("span", { className: "absolute top-0 right-0 w-4 h-4 bg-red-500 text-white text-[9px] font-bold flex items-center justify-center rounded-full border-2 border-white dark:border-slate-800", children: unreadCount }))] }), isOpen && (_jsxs(_Fragment, { children: [_jsx("div", { className: "fixed inset-0 z-30", onClick: () => setIsOpen(false) }), _jsxs("div", { className: "absolute top-full right-0 mt-2 w-80 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 z-40 overflow-hidden animate-scale-in", children: [_jsxs("div", { className: "flex justify-between items-center p-4 border-b border-slate-200 dark:border-slate-700", children: [_jsx("h3", { className: "font-bold text-slate-900 dark:text-white", children: "Notifications" }), _jsx("button", { onClick: () => setIsOpen(false), className: "text-slate-400 hover:text-slate-600", children: _jsx(X, { className: "w-4 h-4" }) })] }), notifications.length === 0 ? (_jsx("div", { className: "p-8 text-center text-sm text-slate-400", children: "No new notifications." })) : (_jsx("div", { className: "max-h-96 overflow-y-auto", children: notifications.map(notif => (_jsxs("div", { onClick: () => {
                                        if (notif.link)
                                            onNavigate(notif.link.view, notif.link.leadId);
                                        setIsOpen(false);
                                    }, className: "flex items-start gap-3 p-4 border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer transition-colors", children: [_jsx("div", { className: "w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center flex-shrink-0 mt-0.5", children: getIcon(notif.type) }), _jsxs("div", { children: [_jsx("p", { className: "text-sm text-slate-800 dark:text-slate-200", dangerouslySetInnerHTML: { __html: notif.message } }), _jsx("span", { className: "text-xs text-slate-400", children: timeAgo(notif.timestamp) })] })] }, notif.id))) }))] })] }))] }));
};
export default NotificationCenter;
