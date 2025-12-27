import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useState, useEffect } from 'react';
import { monitorLeadSignals } from '../services/geminiService';
import { Zap, Loader2, Sparkles, ExternalLink } from 'lucide-react';
const LeadSignals = ({ leads }) => {
    const [signals, setSignals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    useEffect(() => {
        fetchSignals();
    }, [leads]);
    const fetchSignals = async () => {
        // Only use recent leads that haven't been contacted yet for signal monitoring
        const targetLeads = leads
            .filter(l => l.status === 'new')
            .sort((a, b) => b.id - a.id)
            .slice(0, 20); // Limit to 20 to manage API usage
        if (targetLeads.length === 0) {
            setLoading(false);
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const results = await monitorLeadSignals(targetLeads);
            setSignals(results);
        }
        catch (e) {
            setError("Failed to fetch signals from the AI engine.");
        }
        finally {
            setLoading(false);
        }
    };
    const getSignalIcon = (title) => {
        const lowerTitle = title.toLowerCase();
        if (lowerTitle.includes('funding') || lowerTitle.includes('raised'))
            return '💰';
        if (lowerTitle.includes('launch') || lowerTitle.includes('release'))
            return '🚀';
        if (lowerTitle.includes('hire') || lowerTitle.includes('appoint'))
            return '👥';
        if (lowerTitle.includes('partner'))
            return '🤝';
        return '⚡️';
    };
    return (_jsx("div", { className: "h-full p-8 overflow-y-auto bg-slate-50 dark:bg-[#020617]", children: _jsxs("div", { className: "max-w-4xl mx-auto space-y-8", children: [_jsxs("div", { className: "text-center space-y-4 animate-slide-up", children: [_jsx("div", { className: "inline-flex items-center justify-center p-4 bg-indigo-600 rounded-full shadow-lg shadow-indigo-500/30 mb-2", children: _jsx(Zap, { className: "w-10 h-10 text-white" }) }), _jsx("h2", { className: "text-4xl font-bold text-slate-900 dark:text-white", children: "AI Lead Signals" }), _jsx("p", { className: "text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto", children: "Real-time intelligence on your prospects. We scan the news for funding events, product launches, and key hires so you can reach out with perfect timing." })] }), loading && (_jsxs("div", { className: "text-center py-20", children: [_jsx(Loader2, { className: "w-12 h-12 text-indigo-600 animate-spin mx-auto mb-4" }), _jsx("p", { className: "text-slate-600 dark:text-slate-300 font-medium text-lg", children: "Scanning for market signals..." }), _jsx("p", { className: "text-sm text-slate-400 mt-2", children: "This may take a moment as the AI analyzes recent news." })] })), !loading && signals.length === 0 && (_jsxs("div", { className: "text-center py-20 bg-white dark:bg-slate-800 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700", children: [_jsx(Sparkles, { className: "w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" }), _jsx("h3", { className: "text-xl font-bold text-slate-900 dark:text-white", children: "All Clear for Now" }), _jsx("p", { className: "text-slate-500 dark:text-slate-400 mt-2 max-w-sm mx-auto", children: "No significant news detected for your newest leads. Generate more leads or check back later!" })] })), !loading && signals.length > 0 && (_jsx("div", { className: "space-y-4", children: signals.map((signal, index) => (_jsxs("div", { className: "bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow flex items-start gap-4 animate-slide-up", style: { animationDelay: `${index * 100}ms` }, children: [_jsx("div", { className: "text-2xl mt-1", children: getSignalIcon(signal.title) }), _jsxs("div", { className: "flex-1", children: [_jsx("p", { className: "text-xs text-slate-400 font-bold uppercase tracking-wider", children: signal.leadCompany }), _jsx("h4", { className: "font-bold text-slate-900 dark:text-white mt-1", children: signal.title }), _jsx("p", { className: "text-sm text-slate-600 dark:text-slate-300 mt-2", children: signal.summary }), _jsxs("a", { href: signal.source, target: "_blank", rel: "noopener noreferrer", className: "mt-3 inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 transition-colors", children: ["View Source ", _jsx(ExternalLink, { className: "w-3 h-3" })] })] })] }, index))) }))] }) }));
};
export default LeadSignals;
