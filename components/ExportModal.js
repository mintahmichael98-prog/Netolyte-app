import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useState, useEffect } from 'react';
import { exportToCSV } from '../utils/exportCSV';
import { X, FileSpreadsheet, Download, Filter, CheckCircle2 } from 'lucide-react';
const STATUS_OPTIONS = [
    { value: 'all', label: 'All Leads', color: 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200' },
    { value: 'new', label: 'New Leads', color: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300' },
    { value: 'contacted', label: 'Contacted', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' },
    { value: 'qualified', label: 'Qualified', color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400' },
    { value: 'negotiation', label: 'Negotiation', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400' },
    { value: 'won', label: 'Closed Won', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' },
    { value: 'lost', label: 'Lost', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' },
];
export const ExportModal = ({ isOpen, onClose, leads, query }) => {
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [filteredCount, setFilteredCount] = useState(0);
    useEffect(() => {
        const count = selectedStatus === 'all'
            ? leads.length
            : leads.filter(l => l.status === selectedStatus).length;
        setFilteredCount(count);
    }, [selectedStatus, leads]);
    if (!isOpen)
        return null;
    const handleExport = () => {
        const leadsToExport = selectedStatus === 'all'
            ? leads
            : leads.filter(l => l.status === selectedStatus);
        // Append status to query name for file clarity
        const exportName = selectedStatus === 'all' ? query : `${query}_${selectedStatus}`;
        exportToCSV(leadsToExport, exportName);
        onClose();
    };
    return (_jsx("div", { className: "fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-[80] p-4", children: _jsxs("div", { className: "bg-white dark:bg-slate-800 rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-700 flex flex-col animate-in fade-in zoom-in duration-200", children: [_jsxs("div", { className: "flex justify-between items-center p-6 border-b border-slate-200 dark:border-slate-700", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg", children: _jsx(FileSpreadsheet, { className: "w-6 h-6 text-emerald-600 dark:text-emerald-400" }) }), _jsxs("div", { children: [_jsx("h3", { className: "text-xl font-bold text-slate-900 dark:text-white", children: "Export Report" }), _jsx("p", { className: "text-xs text-slate-500 dark:text-slate-400", children: "Download pipeline data" })] })] }), _jsx("button", { onClick: onClose, className: "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200", children: _jsx(X, { className: "w-5 h-5" }) })] }), _jsxs("div", { className: "p-6 space-y-6", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2", children: "Filter by Pipeline Stage" }), _jsxs("div", { className: "relative", children: [_jsx("select", { value: selectedStatus, onChange: (e) => setSelectedStatus(e.target.value), className: "w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none appearance-none text-slate-900 dark:text-white", children: STATUS_OPTIONS.map(opt => (_jsx("option", { value: opt.value, children: opt.label }, opt.value))) }), _jsx("div", { className: "absolute left-3 top-3.5 pointer-events-none", children: _jsx(Filter, { className: "w-5 h-5 text-slate-400" }) })] })] }), _jsxs("div", { className: "bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4 border border-slate-100 dark:border-slate-700", children: [_jsxs("div", { className: "flex justify-between items-center mb-2", children: [_jsx("span", { className: "text-sm font-medium text-slate-500 dark:text-slate-400", children: "Target Audience" }), _jsx("span", { className: "text-xs text-slate-400 truncate max-w-[150px]", children: query })] }), _jsxs("div", { className: "flex justify-between items-center", children: [_jsx("span", { className: "text-sm font-medium text-slate-500 dark:text-slate-400", children: "Leads Found" }), _jsx("span", { className: "text-lg font-bold text-slate-900 dark:text-white", children: filteredCount })] }), selectedStatus !== 'all' && (_jsxs("div", { className: "mt-2 text-xs text-indigo-500 flex items-center gap-1", children: [_jsx(CheckCircle2, { className: "w-3 h-3" }), "Filtered by '", STATUS_OPTIONS.find(o => o.value === selectedStatus)?.label, "'"] }))] }), _jsxs("button", { onClick: handleExport, disabled: filteredCount === 0, className: "w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-emerald-500/25", children: [_jsx(Download, { className: "w-5 h-5" }), "Download CSV Report"] })] })] }) }));
};
