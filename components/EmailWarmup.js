import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import React, { useState, useEffect } from 'react';
import { ShieldCheck, Activity, Play, Pause, CheckCircle2, AlertTriangle, RefreshCw } from 'lucide-react';
import { BarChart, Bar, ResponsiveContainer, XAxis, Tooltip } from 'recharts';
import toast from 'react-hot-toast';
export default function EmailWarmup() {
    const [email, setEmail] = useState('');
    const [analyzing, setAnalyzing] = useState(false);
    const [warmingUp, setWarmingUp] = useState(false);
    const [stats, setStats] = useState({ score: 0, sent: 0, landed: 0, spam: 0 });
    const [history, setHistory] = useState([]);
    const [checks, setChecks] = useState({ spf: false, dkim: false, dmarc: false, blacklist: false });
    // Simulate Warmup Progress
    useEffect(() => {
        let interval;
        if (warmingUp) {
            interval = setInterval(() => {
                setStats(prev => {
                    const newSent = prev.sent + Math.floor(Math.random() * 3) + 1;
                    const isSpam = Math.random() > 0.95;
                    return {
                        ...prev,
                        sent: newSent,
                        landed: isSpam ? prev.landed : prev.landed + 1,
                        spam: isSpam ? prev.spam + 1 : prev.spam
                    };
                });
                // Update Chart Data
                setHistory(prev => {
                    const last = prev[prev.length - 1];
                    const now = new Date();
                    const timeLabel = `${now.getHours()}:${now.getMinutes() < 10 ? '0' : ''}${now.getMinutes()}`;
                    if (last && last.time === timeLabel) {
                        const updated = [...prev];
                        updated[updated.length - 1].emails += 1;
                        return updated;
                    }
                    return [...prev.slice(-10), { time: timeLabel, emails: 1 }];
                });
            }, 2000);
        }
        return () => clearInterval(interval);
    }, [warmingUp]);
    const handleAnalyze = async () => {
        if (!email)
            return;
        setAnalyzing(true);
        setChecks({ spf: false, dkim: false, dmarc: false, blacklist: false });
        // Simulate Analysis Steps
        await new Promise(r => setTimeout(r, 800));
        setChecks(p => ({ ...p, spf: true }));
        await new Promise(r => setTimeout(r, 600));
        setChecks(p => ({ ...p, dkim: true }));
        await new Promise(r => setTimeout(r, 700));
        setChecks(p => ({ ...p, dmarc: true }));
        await new Promise(r => setTimeout(r, 900));
        setChecks(p => ({ ...p, blacklist: true }));
        setStats(s => ({ ...s, score: 94 }));
        setAnalyzing(false);
        toast.success("Domain reputation analysis complete");
    };
    const toggleWarmup = () => {
        setWarmingUp(!warmingUp);
        if (!warmingUp)
            toast.success("Warmup sequence started");
        else
            toast("Warmup paused");
    };
    return (_jsx("div", { className: "h-full p-8 overflow-y-auto", children: _jsxs("div", { className: "max-w-5xl mx-auto space-y-8", children: [_jsxs("div", { className: "flex justify-between items-end", children: [_jsxs("div", { children: [_jsxs("h2", { className: "text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3", children: [_jsx(ShieldCheck, { className: "w-8 h-8 text-emerald-500" }), " Email Warmup & Reputation"] }), _jsx("p", { className: "text-slate-500 dark:text-slate-400 mt-2", children: "Ensure your emails land in the primary inbox, not spam." })] }), _jsxs("div", { className: "flex gap-2", children: [_jsx("input", { type: "email", value: email, onChange: (e) => setEmail(e.target.value), placeholder: "sender@domain.com", className: "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2 w-64 outline-none focus:ring-2 focus:ring-indigo-500" }), _jsxs("button", { onClick: handleAnalyze, disabled: analyzing || !email, className: "px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-lg font-medium transition-colors flex items-center gap-2", children: [analyzing ? _jsx(RefreshCw, { className: "w-4 h-4 animate-spin" }) : _jsx(Activity, { className: "w-4 h-4" }), " Analyze"] })] })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-6", children: [_jsxs("div", { className: "bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm relative overflow-hidden", children: [_jsx("div", { className: "absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full -mr-12 -mt-12" }), _jsx("p", { className: "text-sm font-medium text-slate-500 dark:text-slate-400 mb-1", children: "Reputation Score" }), _jsxs("div", { className: "flex items-end gap-2", children: [_jsx("span", { className: "text-4xl font-bold text-slate-900 dark:text-white", children: stats.score }), _jsx("span", { className: "text-sm text-emerald-500 font-medium mb-1", children: "/ 100" })] })] }), _jsxs("div", { className: "bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm", children: [_jsx("p", { className: "text-sm font-medium text-slate-500 dark:text-slate-400 mb-1", children: "Emails Sent" }), _jsx("span", { className: "text-3xl font-bold text-slate-900 dark:text-white", children: stats.sent })] }), _jsxs("div", { className: "bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm", children: [_jsx("p", { className: "text-sm font-medium text-slate-500 dark:text-slate-400 mb-1", children: "Landed in Inbox" }), _jsx("span", { className: "text-3xl font-bold text-emerald-500", children: stats.landed })] }), _jsxs("div", { className: "bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm", children: [_jsx("p", { className: "text-sm font-medium text-slate-500 dark:text-slate-400 mb-1", children: "Spam Folder" }), _jsx("span", { className: "text-3xl font-bold text-red-500", children: stats.spam })] })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-8", children: [_jsxs("div", { className: "bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm", children: [_jsx("h3", { className: "text-lg font-bold text-slate-900 dark:text-white mb-6", children: "DNS Health Check" }), _jsx("div", { className: "space-y-4", children: [
                                        { label: 'SPF Record', status: checks.spf, desc: 'Authorizes mail servers' },
                                        { label: 'DKIM Signature', status: checks.dkim, desc: 'Verifies email integrity' },
                                        { label: 'DMARC Policy', status: checks.dmarc, desc: 'Instructs handling of failures' },
                                        { label: 'Blacklist Status', status: checks.blacklist, desc: 'Domain is clean' },
                                    ].map((item, i) => (_jsxs("div", { className: "flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg", children: [_jsxs("div", { children: [_jsx("p", { className: "font-semibold text-slate-800 dark:text-slate-200", children: item.label }), _jsx("p", { className: "text-xs text-slate-500", children: item.desc })] }), item.status ? (_jsx(CheckCircle2, { className: "w-6 h-6 text-emerald-500" })) : analyzing ? (_jsx(RefreshCw, { className: "w-5 h-5 text-slate-400 animate-spin" })) : (_jsx(AlertTriangle, { className: "w-5 h-5 text-amber-500" }))] }, i))) })] }), _jsxs("div", { className: "bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col", children: [_jsxs("div", { className: "flex justify-between items-center mb-6", children: [_jsx("h3", { className: "text-lg font-bold text-slate-900 dark:text-white", children: "Warmup Activity" }), _jsx("button", { onClick: toggleWarmup, className: `px-4 py-1.5 rounded-full text-sm font-bold flex items-center gap-2 transition-colors ${warmingUp ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'}`, children: warmingUp ? _jsxs(_Fragment, { children: [_jsx(Pause, { className: "w-3 h-3" }), " Pause"] }) : _jsxs(_Fragment, { children: [_jsx(Play, { className: "w-3 h-3" }), " Start Warmup"] }) })] }), _jsx("div", { className: "flex-1 min-h-[200px]", children: _jsx(ResponsiveContainer, { width: "100%", height: "100%", children: _jsxs(BarChart, { data: history, children: [_jsx(XAxis, { dataKey: "time", stroke: "#94a3b8", fontSize: 12, tickLine: false, axisLine: false }), _jsx(Tooltip, { cursor: { fill: 'transparent' }, contentStyle: { backgroundColor: '#1e293b', borderColor: '#334155', color: '#f1f5f9' } }), _jsx(Bar, { dataKey: "emails", fill: "#6366f1", radius: [4, 4, 0, 0], barSize: 20 })] }) }) }), _jsx("p", { className: "text-center text-xs text-slate-400 mt-4", children: "Real-time sending volume (simulated for demo)" })] })] })] }) }));
}
