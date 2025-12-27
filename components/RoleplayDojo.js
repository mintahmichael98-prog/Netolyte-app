import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import React, { useState, useEffect, useRef } from 'react';
import { chatWithPersona, getCoachingFeedback } from '../services/geminiService';
import { Bot, Send, RotateCcw, Award, CheckCircle2, XCircle, Lightbulb, Play } from 'lucide-react';
import toast from 'react-hot-toast';
export default function RoleplayDojo({ leads }) {
    const [selectedLead, setSelectedLead] = useState(null);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [feedback, setFeedback] = useState(null);
    const scrollRef = useRef(null);
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);
    const handleStart = (lead) => {
        setSelectedLead(lead);
        setMessages([]);
        setFeedback(null);
        // Add initial system greeting from persona
        const greeting = `Hi, this is ${lead.management?.[0]?.name || 'the Director'}. I have about 2 minutes. What's this about?`;
        setMessages([{ role: 'model', text: greeting }]);
    };
    const handleSend = async (e) => {
        e?.preventDefault();
        if (!input.trim() || !selectedLead || loading)
            return;
        const userMsg = { role: 'user', text: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);
        try {
            const responseText = await chatWithPersona(selectedLead, messages, userMsg.text);
            setMessages(prev => [...prev, { role: 'model', text: responseText }]);
        }
        catch (err) {
            toast.error("Connection lost");
        }
        finally {
            setLoading(false);
        }
    };
    const handleEndSession = async () => {
        if (messages.length < 3) {
            toast.error("Chat a bit longer to get feedback!");
            return;
        }
        setLoading(true);
        try {
            const result = await getCoachingFeedback(messages);
            setFeedback(result);
        }
        catch (err) {
            toast.error("Failed to generate feedback");
        }
        finally {
            setLoading(false);
        }
    };
    if (!selectedLead) {
        return (_jsx("div", { className: "h-full p-8 overflow-y-auto", children: _jsxs("div", { className: "max-w-5xl mx-auto space-y-8", children: [_jsxs("div", { className: "text-center space-y-4", children: [_jsx("div", { className: "inline-flex items-center justify-center p-4 bg-indigo-600 rounded-full shadow-lg shadow-indigo-500/30 mb-2", children: _jsx(Bot, { className: "w-10 h-10 text-white" }) }), _jsx("h2", { className: "text-4xl font-bold text-slate-900 dark:text-white", children: "AI Sales Dojo" }), _jsx("p", { className: "text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto", children: "Master your pitch before you dial. Select a real lead from your list to enter a simulation. The AI will become that person\u2014objections, personality, and all." })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6", children: [leads.slice(0, 9).map(lead => (_jsxs("button", { onClick: () => handleStart(lead), className: "group relative bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-xl hover:border-indigo-500 transition-all text-left", children: [_jsx("div", { className: "absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity", children: _jsx(Play, { className: "w-8 h-8 text-indigo-600 fill-indigo-100 dark:fill-indigo-900" }) }), _jsx("div", { className: "w-12 h-12 bg-slate-100 dark:bg-slate-700 rounded-lg flex items-center justify-center mb-4 text-xl", children: lead.company.charAt(0) }), _jsx("h3", { className: "font-bold text-slate-900 dark:text-white truncate", children: lead.company }), _jsx("p", { className: "text-sm text-slate-500 dark:text-slate-400 truncate", children: lead.management?.[0]?.name || 'Decision Maker' }), _jsx("div", { className: "mt-4 flex gap-2", children: _jsx("span", { className: "text-xs bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded text-slate-600 dark:text-slate-300", children: lead.industry }) })] }, lead.id))), leads.length === 0 && (_jsx("div", { className: "col-span-full text-center py-20 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700", children: _jsx("p", { className: "text-slate-500", children: "No leads found. Generate some leads first to start training!" }) }))] })] }) }));
    }
    return (_jsxs("div", { className: "h-full flex flex-col md:flex-row overflow-hidden bg-slate-50 dark:bg-[#020617]", children: [_jsxs("div", { className: "w-full md:w-80 bg-white dark:bg-slate-800 border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-700 p-6 flex flex-col z-10 shadow-sm", children: [_jsx("button", { onClick: () => setSelectedLead(null), className: "mb-6 text-sm text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center gap-2", children: "\u2190 Back to Dojo" }), _jsxs("div", { className: "mb-6", children: [_jsx("div", { className: "w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-2xl font-bold text-white mb-4 shadow-lg shadow-indigo-500/20", children: selectedLead.company.charAt(0) }), _jsx("h2", { className: "text-xl font-bold text-slate-900 dark:text-white leading-tight", children: selectedLead.management?.[0]?.name || 'Prospect' }), _jsx("p", { className: "text-sm text-slate-500 dark:text-slate-400", children: selectedLead.management?.[0]?.role || 'Decision Maker' }), _jsx("p", { className: "text-xs font-semibold text-indigo-600 dark:text-indigo-400 mt-1", children: selectedLead.company })] }), _jsxs("div", { className: "space-y-4 flex-1 overflow-y-auto", children: [_jsxs("div", { className: "p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-700/50", children: [_jsx("h4", { className: "text-xs font-bold text-slate-400 uppercase tracking-wider mb-2", children: "Context" }), _jsx("p", { className: "text-sm text-slate-600 dark:text-slate-300", children: selectedLead.description })] }), _jsxs("div", { className: "p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-700/50", children: [_jsx("h4", { className: "text-xs font-bold text-slate-400 uppercase tracking-wider mb-2", children: "Key Data" }), _jsxs("ul", { className: "text-sm space-y-2 text-slate-600 dark:text-slate-300", children: [_jsxs("li", { children: ["\uD83D\uDCCD ", selectedLead.location] }), _jsxs("li", { children: ["\uD83C\uDFE2 ", selectedLead.industry] }), _jsxs("li", { children: ["\uD83D\uDC65 ", selectedLead.employees, " Employees"] })] })] })] }), !feedback && (_jsx("button", { onClick: handleEndSession, className: "mt-4 w-full py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold shadow-lg shadow-rose-500/20 transition-all", children: "End & Get Feedback" }))] }), _jsx("div", { className: "flex-1 flex flex-col h-full relative", children: feedback ? (_jsx("div", { className: "flex-1 overflow-y-auto p-8 animate-in fade-in slide-in-from-bottom-4", children: _jsxs("div", { className: "max-w-3xl mx-auto space-y-8", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("h2", { className: "text-3xl font-bold text-slate-900 dark:text-white", children: "Performance Report" }), _jsxs("button", { onClick: () => { setFeedback(null); setMessages([]); handleStart(selectedLead); }, className: "flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-medium", children: [_jsx(RotateCcw, { className: "w-4 h-4" }), " Restart"] })] }), _jsxs("div", { className: "bg-white dark:bg-slate-800 p-8 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-slate-500 dark:text-slate-400 font-medium mb-1", children: "Overall Score" }), _jsx("h3", { className: "text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-600", children: feedback.score })] }), _jsx("div", { className: "h-24 w-px bg-slate-200 dark:bg-slate-700 mx-8 hidden sm:block" }), _jsx("div", { className: "flex-1", children: _jsxs("p", { className: "text-lg font-medium text-slate-800 dark:text-slate-200 italic", children: ["\"", feedback.summary, "\""] }) }), _jsx("div", { className: "hidden md:block", children: _jsx(Award, { className: `w-20 h-20 ${feedback.score >= 80 ? 'text-yellow-400' : 'text-slate-300'}` }) })] }), _jsxs("div", { className: "grid md:grid-cols-2 gap-6", children: [_jsxs("div", { className: "bg-green-50 dark:bg-green-900/10 p-6 rounded-xl border border-green-100 dark:border-green-900/30", children: [_jsxs("h3", { className: "font-bold text-green-800 dark:text-green-400 flex items-center gap-2 mb-4", children: [_jsx(CheckCircle2, { className: "w-5 h-5" }), " Strengths"] }), _jsx("ul", { className: "space-y-2", children: feedback.strengths?.map((s, i) => (_jsxs("li", { className: "text-green-700 dark:text-green-300 text-sm", children: ["\u2022 ", s] }, i))) })] }), _jsxs("div", { className: "bg-rose-50 dark:bg-rose-900/10 p-6 rounded-xl border border-rose-100 dark:border-rose-900/30", children: [_jsxs("h3", { className: "font-bold text-rose-800 dark:text-rose-400 flex items-center gap-2 mb-4", children: [_jsx(XCircle, { className: "w-5 h-5" }), " Missed Opportunities"] }), _jsx("ul", { className: "space-y-2", children: feedback.weaknesses?.map((w, i) => (_jsxs("li", { className: "text-rose-700 dark:text-rose-300 text-sm", children: ["\u2022 ", w] }, i))) })] })] }), _jsxs("div", { className: "bg-indigo-50 dark:bg-indigo-900/20 p-6 rounded-xl border border-indigo-100 dark:border-indigo-800", children: [_jsxs("h3", { className: "font-bold text-indigo-900 dark:text-indigo-300 flex items-center gap-2 mb-3", children: [_jsx(Lightbulb, { className: "w-5 h-5" }), " Better Approach"] }), _jsxs("p", { className: "text-indigo-800 dark:text-indigo-200 text-sm italic", children: ["\"", feedback.improved_pitch, "\""] })] })] }) })) : (_jsxs(_Fragment, { children: [_jsxs("div", { className: "flex-1 overflow-y-auto p-4 md:p-8 space-y-6", ref: scrollRef, children: [messages.map((msg, idx) => (_jsx("div", { className: `flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`, children: _jsx("div", { className: `
                    max-w-[85%] md:max-w-[70%] p-4 rounded-2xl text-sm leading-relaxed shadow-sm
                    ${msg.role === 'user'
                                            ? 'bg-indigo-600 text-white rounded-br-none'
                                            : 'bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 rounded-bl-none border border-slate-200 dark:border-slate-600'}
                  `, children: msg.text }) }, idx))), loading && (_jsx("div", { className: "flex justify-start", children: _jsxs("div", { className: "bg-white dark:bg-slate-700 p-4 rounded-2xl rounded-bl-none border border-slate-200 dark:border-slate-600 flex gap-1", children: [_jsx("span", { className: "w-2 h-2 bg-slate-400 rounded-full animate-bounce" }), _jsx("span", { className: "w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-100" }), _jsx("span", { className: "w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-200" })] }) }))] }), _jsxs("div", { className: "p-4 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700", children: [_jsxs("form", { onSubmit: handleSend, className: "max-w-4xl mx-auto relative", children: [_jsx("input", { type: "text", value: input, onChange: (e) => setInput(e.target.value), placeholder: "Type your pitch...", className: "w-full pl-6 pr-14 py-4 rounded-full bg-slate-100 dark:bg-slate-900 border-transparent focus:bg-white dark:focus:bg-slate-950 focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-inner text-slate-900 dark:text-white", autoFocus: true }), _jsx("button", { type: "submit", disabled: !input.trim() || loading, className: "absolute right-2 top-2 bottom-2 w-10 h-10 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white rounded-full flex items-center justify-center transition-transform active:scale-95 shadow-md", children: _jsx(Send, { className: "w-4 h-4 ml-0.5" }) })] }), _jsxs("p", { className: "text-center text-xs text-slate-400 mt-2", children: ["AI is roleplaying as ", selectedLead.management?.[0]?.name, ". Be persuasive."] })] })] })) })] }));
}
