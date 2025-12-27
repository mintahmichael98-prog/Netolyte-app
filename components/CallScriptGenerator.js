import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useState, useEffect } from 'react';
import { generateCallScript } from '../services/geminiService';
import { FileText, RefreshCw } from 'lucide-react';
const CallScriptGenerator = ({ lead }) => {
    const [script, setScript] = useState('');
    const [loading, setLoading] = useState(true);
    const fetchScript = async () => {
        setLoading(true);
        try {
            const generatedScript = await generateCallScript(lead);
            setScript(generatedScript);
        }
        catch (e) {
            setScript("Could not generate a script. Please check your connection.");
        }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        fetchScript();
    }, [lead.id]); // Re-fetch when the lead changes
    return (_jsxs("div", { className: "h-full flex flex-col", children: [_jsxs("div", { className: "flex justify-between items-center mb-4 shrink-0", children: [_jsxs("h4", { className: "text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2", children: [_jsx(FileText, { className: "w-4 h-4" }), " AI Sales Script"] }), _jsx("button", { onClick: fetchScript, disabled: loading, className: "p-1 text-slate-400 hover:text-indigo-500 disabled:opacity-50 transition-colors", title: "Regenerate Script", children: _jsx(RefreshCw, { className: `w-3 h-3 ${loading ? 'animate-spin' : ''}` }) })] }), _jsx("div", { className: "flex-1 overflow-y-auto custom-scrollbar pr-2", children: loading ? (_jsxs("div", { className: "space-y-4 pt-2", children: [_jsx("div", { className: "h-4 bg-slate-100 dark:bg-slate-700/50 rounded w-1/3 animate-pulse" }), _jsxs("div", { className: "space-y-2", children: [_jsx("div", { className: "h-3 bg-slate-100 dark:bg-slate-700/50 rounded w-full animate-pulse" }), _jsx("div", { className: "h-3 bg-slate-100 dark:bg-slate-700/50 rounded w-5/6 animate-pulse" }), _jsx("div", { className: "h-3 bg-slate-100 dark:bg-slate-700/50 rounded w-4/6 animate-pulse" })] }), _jsx("div", { className: "h-4 bg-slate-100 dark:bg-slate-700/50 rounded w-1/4 animate-pulse mt-6" }), _jsxs("div", { className: "space-y-2", children: [_jsx("div", { className: "h-3 bg-slate-100 dark:bg-slate-700/50 rounded w-full animate-pulse" }), _jsx("div", { className: "h-3 bg-slate-100 dark:bg-slate-700/50 rounded w-full animate-pulse" })] })] })) : (_jsx("div", { className: "prose prose-sm dark:prose-invert max-w-none text-slate-600 dark:text-slate-300 leading-relaxed text-sm", dangerouslySetInnerHTML: {
                        __html: script
                            .replace(/^### (.*?)$/gm, '<h3 class="text-indigo-600 dark:text-indigo-400 text-sm font-bold uppercase tracking-wide mt-6 mb-2">$1</h3>')
                            .replace(/\*\*(.*?)\*\*/g, '<strong class="text-slate-900 dark:text-white">$1</strong>')
                            .replace(/\n/g, '<br/>')
                    } })) })] }));
};
export default CallScriptGenerator;
