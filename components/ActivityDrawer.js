import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import React, { useState, useEffect, useRef } from 'react';
import { X, Send, UserPlus, StickyNote, Activity, RefreshCw, GitBranch } from 'lucide-react';
export default function ActivityDrawer({ lead, isOpen, onClose, onAddNote, onAssignLead, teamMembers }) {
    const [noteText, setNoteText] = useState('');
    const messagesEndRef = useRef(null);
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [lead.activity, isOpen]);
    if (!isOpen)
        return null;
    const handleSubmitNote = (e) => {
        e.preventDefault();
        if (!noteText.trim())
            return;
        onAddNote(lead.id, noteText);
        setNoteText('');
    };
    const getActivityIcon = (type) => {
        switch (type) {
            case 'note': return _jsx(StickyNote, { className: "w-4 h-4 text-amber-500" });
            case 'status_change': return _jsx(RefreshCw, { className: "w-4 h-4 text-blue-500" });
            case 'assignment': return _jsx(UserPlus, { className: "w-4 h-4 text-purple-500" });
            case 'creation': return _jsx(Activity, { className: "w-4 h-4 text-emerald-500" });
            case 'sequence_add': return _jsx(GitBranch, { className: "w-4 h-4 text-indigo-500" });
            default: return _jsx(Activity, { className: "w-4 h-4 text-slate-500" });
        }
    };
    return (_jsxs(_Fragment, { children: [_jsx("div", { className: "fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-[90]", onClick: onClose }), _jsxs("div", { className: "fixed inset-y-0 right-0 w-full md:w-[400px] bg-white dark:bg-slate-800 shadow-2xl z-[100] border-l border-slate-200 dark:border-slate-700 flex flex-col animate-slide-left", children: [_jsxs("div", { className: "p-6 border-b border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50", children: [_jsxs("div", { className: "flex justify-between items-start mb-4", children: [_jsxs("div", { children: [_jsx("h3", { className: "font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2", children: lead.company }), _jsxs("p", { className: "text-sm text-slate-500", children: [lead.industry, " \u2022 ", lead.location] })] }), _jsx("button", { onClick: onClose, className: "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200", children: _jsx(X, { className: "w-5 h-5" }) })] }), _jsxs("div", { className: "flex items-center justify-between bg-white dark:bg-slate-700 p-3 rounded-lg border border-slate-200 dark:border-slate-600", children: [_jsxs("div", { className: "flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300", children: [_jsx(UserPlus, { className: "w-4 h-4" }), _jsx("span", { children: "Owner:" })] }), _jsxs("select", { value: lead.assignedTo || '', onChange: (e) => onAssignLead(lead.id, e.target.value), className: "bg-transparent font-medium text-indigo-600 dark:text-indigo-400 outline-none text-sm text-right cursor-pointer", children: [_jsx("option", { value: "", children: "Unassigned" }), teamMembers.map(member => (_jsx("option", { value: member, children: member }, member)))] })] })] }), _jsx("div", { className: "flex-1 overflow-y-auto p-6 bg-slate-50 dark:bg-[#020617]", children: _jsxs("div", { className: "space-y-6 relative", children: [lead.activity && lead.activity.length > 1 && (_jsx("div", { className: "absolute left-4 top-4 bottom-4 w-0.5 bg-slate-200 dark:bg-slate-800 -z-10" })), lead.activity?.map((item) => (_jsxs("div", { className: "flex gap-4 group", children: [_jsx("div", { className: "w-8 h-8 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center shadow-sm flex-shrink-0 z-10", children: getActivityIcon(item.type) }), _jsxs("div", { className: "flex-1", children: [_jsxs("div", { className: "flex items-baseline justify-between mb-1", children: [_jsxs("span", { className: "text-xs font-bold text-slate-700 dark:text-slate-300", children: [item.author, _jsx("span", { className: "font-normal text-slate-500 ml-1", children: item.type === 'note' ? 'added a note' :
                                                                        item.type === 'status_change' ? 'changed status' :
                                                                            item.type === 'assignment' ? 'updated assignment' :
                                                                                item.type === 'sequence_add' ? 'triggered sequence' : 'created lead' })] }), _jsx("span", { className: "text-[10px] text-slate-400", children: new Date(item.timestamp).toLocaleTimeString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) })] }), _jsxs("div", { className: `p-3 rounded-lg border text-sm ${item.type === 'note'
                                                        ? 'bg-amber-50 border-amber-100 dark:bg-amber-900/10 dark:border-amber-900/30 text-slate-700 dark:text-slate-200'
                                                        : 'bg-white border-slate-200 dark:bg-slate-800 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`, children: [item.content, item.metadata && (_jsxs("div", { className: "mt-1 text-xs opacity-75", children: [item.metadata.oldValue && _jsxs("span", { children: [item.metadata.oldValue, " \u2192 "] }), _jsx("span", { className: "font-semibold", children: item.metadata.newValue })] }))] })] })] }, item.id))), (!lead.activity || lead.activity.length === 0) && (_jsx("div", { className: "text-center text-slate-400 text-sm py-10", children: "No activity recorded yet." })), _jsx("div", { ref: messagesEndRef })] }) }), _jsx("div", { className: "p-4 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800", children: _jsxs("form", { onSubmit: handleSubmitNote, className: "relative", children: [_jsx("input", { type: "text", value: noteText, onChange: (e) => setNoteText(e.target.value), placeholder: "Add an internal note...", className: "w-full pl-4 pr-12 py-3 rounded-xl bg-slate-100 dark:bg-slate-900 border-transparent focus:bg-white dark:focus:bg-slate-800 border focus:border-indigo-500 outline-none transition-all dark:text-white" }), _jsx("button", { type: "submit", disabled: !noteText.trim(), className: "absolute right-2 top-2 p-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:bg-slate-400 transition-colors", children: _jsx(Send, { className: "w-4 h-4" }) })] }) })] })] }));
}
