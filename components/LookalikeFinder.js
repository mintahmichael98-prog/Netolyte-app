import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import React, { useState } from 'react';
import { Loader2, ArrowRight, Plus, Users, Globe } from 'lucide-react';
import { findLookalikes } from '../services/geminiService';
import toast from 'react-hot-toast';
export default function LookalikeFinder({ onAddLeads }) {
    const [url, setUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState([]);
    const handleSearch = async (e) => {
        e.preventDefault();
        if (!url)
            return;
        setLoading(true);
        setResults([]);
        try {
            const leads = await findLookalikes(url);
            setResults(leads);
            if (leads.length > 0)
                toast.success(`Found ${leads.length} lookalike companies!`);
            else
                toast.error("No results found. Try a different URL.");
        }
        catch (e) {
            toast.error(e.message || "Search failed");
        }
        finally {
            setLoading(false);
        }
    };
    const handleImport = () => {
        onAddLeads(results);
        toast.success(`Imported ${results.length} leads to your database`);
        setResults([]);
        setUrl('');
    };
    return (_jsx("div", { className: "h-full flex flex-col p-8 overflow-y-auto", children: _jsxs("div", { className: "max-w-4xl mx-auto w-full space-y-8", children: [_jsxs("div", { className: "text-center space-y-4", children: [_jsx("div", { className: "inline-flex items-center justify-center p-3 bg-purple-100 dark:bg-purple-900/30 rounded-full mb-2", children: _jsx(Users, { className: "w-8 h-8 text-purple-600 dark:text-purple-400" }) }), _jsx("h2", { className: "text-3xl font-bold text-slate-900 dark:text-white", children: "Lookalike Audience Finder" }), _jsx("p", { className: "text-slate-500 dark:text-slate-400 max-w-lg mx-auto", children: "Input a website, and our AI will find 20 other companies with matching business models, tech stacks, and customer bases." })] }), _jsxs("form", { onSubmit: handleSearch, className: "relative max-w-2xl mx-auto w-full", children: [_jsx("div", { className: "absolute inset-y-0 left-4 flex items-center pointer-events-none", children: _jsx(Globe, { className: "w-5 h-5 text-slate-400" }) }), _jsx("input", { type: "text", value: url, onChange: (e) => setUrl(e.target.value), placeholder: "e.g. airbnb.com", className: "w-full pl-12 pr-4 py-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none shadow-sm text-lg" }), _jsx("button", { type: "submit", disabled: loading || !url, className: "absolute right-2 top-2 bottom-2 px-6 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-300 text-white rounded-lg font-semibold transition-colors flex items-center gap-2", children: loading ? _jsx(Loader2, { className: "w-5 h-5 animate-spin" }) : _jsxs(_Fragment, { children: ["Find Lookalikes ", _jsx(ArrowRight, { className: "w-4 h-4" })] }) })] }), results.length > 0 && (_jsxs("div", { className: "space-y-6 animate-fade-in-up", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsxs("h3", { className: "text-lg font-bold text-slate-900 dark:text-white", children: ["Found ", results.length, " Companies similar to ", url] }), _jsxs("button", { onClick: handleImport, className: "px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium flex items-center gap-2 shadow-sm", children: [_jsx(Plus, { className: "w-4 h-4" }), " Import All to Leads"] })] }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: results.map((lead) => (_jsxs("div", { className: "bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col", children: [_jsxs("div", { className: "flex justify-between items-start mb-2", children: [_jsx("h4", { className: "font-bold text-slate-900 dark:text-white", children: lead.company }), _jsx("span", { className: "text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded", children: lead.industry })] }), _jsx("p", { className: "text-sm text-slate-500 dark:text-slate-400 mb-3 flex-1", children: lead.description }), _jsxs("div", { className: "pt-3 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between text-xs text-slate-500", children: [_jsx("span", { children: lead.location }), _jsx("a", { href: lead.website, target: "_blank", rel: "noreferrer", className: "text-purple-600 hover:underline", children: "Visit Website" })] })] }, lead.id))) })] }))] }) }));
}
