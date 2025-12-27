import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import React, { useState } from 'react';
import { X, MessageSquare, Send, Sparkles, CheckCircle2, AlertCircle, Loader2, Key, User, Smartphone, ExternalLink, Globe, PieChart as PieChartIcon, Ban } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { sendArkeselSMS } from '../services/arkeselService';
import toast from 'react-hot-toast';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
const COLORS = {
    delivered: '#22c55e', // green-500
    failed: '#ef4444', // red-500
    opted_out: '#f59e0b', // amber-500
    pending: '#cbd5e1' // slate-300
};
export default function SMSCampaignModal({ leads, isOpen, onClose, brandVoice }) {
    const [step, setStep] = useState('config');
    const [apiKey, setApiKey] = useState('');
    const [senderId, setSenderId] = useState('Netolyte');
    const [messageTemplate, setMessageTemplate] = useState("Hi {{name}}, saw {{company}} and wanted to connect about scaling your leads.");
    const [isGenerating, setIsGenerating] = useState(false);
    const [queue, setQueue] = useState([]);
    const [isSending, setIsSending] = useState(false);
    // Initialize queue
    React.useEffect(() => {
        if (leads.length > 0) {
            const newQueue = leads.map(lead => {
                // Extract numbers
                let phone = lead.socials?.whatsapp || '';
                if (!phone && lead.contact) {
                    const match = lead.contact.match(/[\d\-\+\(\)\s]+/);
                    if (match)
                        phone = match[0].replace(/\D/g, '');
                }
                return {
                    leadId: lead.id,
                    leadName: lead.management?.[0]?.name || 'there',
                    phone: phone,
                    status: phone ? 'pending' : 'failed'
                };
            });
            setQueue(newQueue);
        }
    }, [leads]);
    if (!isOpen)
        return null;
    const generateTemplate = async () => {
        setIsGenerating(true);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const toneInstruction = brandVoice ? `Tone: ${brandVoice}` : "Tone: Professional but urgent.";
            const prompt = `
        Write a hyper-short SMS (under 160 characters) for B2B cold outreach.
        Variables: {{name}}, {{company}}.
        ${toneInstruction}
        Context: Selling lead gen services.
      `;
            const result = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt
            });
            const text = result.text;
            if (text)
                setMessageTemplate(text.trim());
        }
        catch (e) {
            toast.error("AI Generation failed");
        }
        finally {
            setIsGenerating(false);
        }
    };
    const compileMessage = (template, item, company) => {
        return template
            .replace(/{{name}}/g, item.leadName)
            .replace(/{{company}}/g, company);
    };
    const startSending = async () => {
        setIsSending(true);
        const newQueue = [...queue];
        // Process sequentially to avoid rate limits and update UI
        for (let i = 0; i < newQueue.length; i++) {
            const item = newQueue[i];
            if (item.status !== 'pending')
                continue;
            const lead = leads.find(l => l.id === item.leadId);
            if (!lead)
                continue;
            const msg = compileMessage(messageTemplate, item, lead.company);
            // Call Arkesel Service
            const result = await sendArkeselSMS(apiKey, senderId, item.phone, msg);
            newQueue[i].status = result.status;
            setQueue([...newQueue]);
            // Small delay between sends
            await new Promise(r => setTimeout(r, 500));
        }
        setIsSending(false);
        setStep('analytics'); // Auto move to analytics when done
        toast.success("Campaign Completed");
    };
    const progress = Math.round((queue.filter(q => q.status !== 'pending').length / queue.length) * 100) || 0;
    // Analytics Calculations
    const totalSent = queue.filter(q => q.status !== 'pending').length;
    const delivered = queue.filter(q => q.status === 'delivered').length;
    const failed = queue.filter(q => q.status === 'failed').length;
    const optedOut = queue.filter(q => q.status === 'opted_out').length;
    const deliveryRate = totalSent > 0 ? Math.round((delivered / totalSent) * 100) : 0;
    const chartData = [
        { name: 'Delivered', value: delivered, color: COLORS.delivered },
        { name: 'Failed', value: failed, color: COLORS.failed },
        { name: 'Opted Out', value: optedOut, color: COLORS.opted_out }
    ].filter(d => d.value > 0);
    return (_jsx("div", { className: "fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-[70] p-4", children: _jsxs("div", { className: "bg-white dark:bg-slate-800 rounded-xl w-full max-w-2xl shadow-2xl border border-slate-200 dark:border-slate-700 flex flex-col max-h-[90vh]", children: [_jsxs("div", { className: "flex justify-between items-center p-6 border-b border-slate-200 dark:border-slate-700", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg", children: _jsx(MessageSquare, { className: "w-6 h-6 text-orange-600 dark:text-orange-500" }) }), _jsxs("div", { children: [_jsx("h3", { className: "text-xl font-bold text-slate-900 dark:text-white", children: "Bulk SMS Gateway" }), _jsxs("p", { className: "text-sm text-slate-500", children: ["Powered by Arkesel \u2022 ", leads.length, " contacts"] })] })] }), _jsx("button", { onClick: onClose, className: "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300", children: _jsx(X, { className: "w-6 h-6" }) })] }), _jsxs("div", { className: "flex-1 overflow-y-auto p-6", children: [step === 'config' && (_jsxs("div", { className: "space-y-8", children: [_jsxs("div", { className: "bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl p-6 text-white text-center shadow-lg relative overflow-hidden group", children: [_jsx("div", { className: "absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-150 duration-700" }), _jsx("h4", { className: "text-2xl font-bold mb-2 relative z-10", children: "New to Arkesel?" }), _jsx("p", { className: "text-orange-50 mb-6 text-sm max-w-sm mx-auto relative z-10", children: "Create a free account to get your API Key and start sending branded SMS campaigns instantly." }), _jsxs("a", { href: "https://arkesel.com/signup", target: "_blank", rel: "noopener noreferrer", className: "inline-flex items-center gap-2 px-6 py-3 bg-white text-orange-600 rounded-xl font-bold hover:bg-orange-50 transition-colors shadow-xl relative z-10", children: ["Create Free Account ", _jsx(ExternalLink, { className: "w-4 h-4" })] })] }), _jsxs("div", { className: "bg-slate-50 dark:bg-slate-900/50 p-6 rounded-xl border border-slate-200 dark:border-slate-700", children: [_jsxs("div", { className: "flex items-center gap-2 mb-4", children: [_jsx(Globe, { className: "w-5 h-5 text-slate-400" }), _jsx("h4", { className: "font-semibold text-slate-900 dark:text-white", children: "Connect Existing Account" })] }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1", children: "API Key" }), _jsxs("div", { className: "relative", children: [_jsx(Key, { className: "absolute left-3 top-3 w-4 h-4 text-slate-400" }), _jsx("input", { type: "password", value: apiKey, onChange: e => setApiKey(e.target.value), placeholder: "Paste your Arkesel V2 API Key", className: "w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-orange-500 outline-none transition-all" })] }), _jsx("p", { className: "text-[10px] text-slate-400 mt-1 ml-1", children: "Found in Arkesel Dashboard \u2192 Developers \u2192 API Keys" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1", children: "Sender ID" }), _jsxs("div", { className: "relative", children: [_jsx(User, { className: "absolute left-3 top-3 w-4 h-4 text-slate-400" }), _jsx("input", { type: "text", maxLength: 11, value: senderId, onChange: e => setSenderId(e.target.value), placeholder: "e.g. Netolyte", className: "w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-orange-500 outline-none transition-all" })] }), _jsx("p", { className: "text-[10px] text-slate-400 mt-1 ml-1", children: "Must be registered on Arkesel. Max 11 characters." })] })] })] })] })), step === 'draft' && (_jsx("div", { className: "space-y-6", children: _jsxs("div", { children: [_jsxs("label", { className: "block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2", children: ["SMS Message (", messageTemplate.length, " chars)"] }), _jsxs("div", { className: "relative", children: [_jsx("textarea", { value: messageTemplate, onChange: (e) => setMessageTemplate(e.target.value), className: "w-full h-32 p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none resize-none font-medium" }), _jsxs("div", { className: `absolute bottom-3 left-3 text-xs font-medium ${messageTemplate.length > 160 ? 'text-red-500' : 'text-slate-400'}`, children: [messageTemplate.length, " / 160"] }), _jsxs("button", { onClick: generateTemplate, disabled: isGenerating, className: "absolute bottom-3 right-3 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs rounded-lg flex items-center gap-1 transition-colors shadow-sm", children: [isGenerating ? _jsx(Loader2, { className: "w-3 h-3 animate-spin" }) : _jsx(Sparkles, { className: "w-3 h-3" }), "AI Draft"] })] }), _jsxs("div", { className: "mt-2 flex gap-2 text-xs text-slate-500", children: [_jsx("span", { className: "bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded", children: '{{name}}' }), _jsx("span", { className: "bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded", children: '{{company}}' })] }), brandVoice && (_jsxs("div", { className: "mt-2 text-xs text-orange-500 font-medium", children: ["Using Brand Voice: \"", brandVoice, "\""] }))] }) })), step === 'send' && (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsx("span", { className: "text-sm font-medium text-slate-500", children: "Sending Progress" }), _jsxs("span", { className: "text-sm font-bold text-slate-900 dark:text-white", children: [progress, "%"] })] }), _jsx("div", { className: "h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden", children: _jsx("div", { className: "h-full bg-orange-500 transition-all duration-300", style: { width: `${progress}%` } }) }), _jsx("div", { className: "space-y-2 mt-4 max-h-[300px] overflow-y-auto", children: queue.map((item, idx) => (_jsxs("div", { className: "flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: `w-8 h-8 rounded-full flex items-center justify-center ${item.status === 'delivered' ? 'bg-green-100 text-green-600' :
                                                            item.status === 'failed' ? 'bg-red-100 text-red-500' :
                                                                item.status === 'opted_out' ? 'bg-amber-100 text-amber-500' :
                                                                    'bg-slate-100 dark:bg-slate-700 text-slate-500'}`, children: item.status === 'delivered' ? _jsx(CheckCircle2, { className: "w-4 h-4" }) :
                                                            item.status === 'failed' ? _jsx(AlertCircle, { className: "w-4 h-4" }) :
                                                                item.status === 'opted_out' ? _jsx(Ban, { className: "w-4 h-4" }) :
                                                                    _jsx(Smartphone, { className: "w-4 h-4" }) }), _jsxs("div", { children: [_jsx("p", { className: "text-sm font-semibold text-slate-900 dark:text-white", children: item.leadName }), _jsx("p", { className: "text-xs text-slate-500", children: item.phone || 'No Number' })] })] }), _jsxs("div", { children: [item.status === 'delivered' && _jsx("span", { className: "text-xs font-bold text-green-600", children: "DELIVERED" }), item.status === 'failed' && _jsx("span", { className: "text-xs font-bold text-red-500", children: "FAILED" }), item.status === 'opted_out' && _jsx("span", { className: "text-xs font-bold text-amber-500", children: "OPTOUT" }), item.status === 'pending' && _jsx("span", { className: "text-xs text-slate-400", children: "WAITING" })] })] }, item.leadId))) })] })), step === 'analytics' && (_jsxs("div", { className: "h-full flex flex-col space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500", children: [_jsxs("div", { className: "text-center", children: [_jsx("div", { className: "inline-flex p-3 bg-green-100 dark:bg-green-900/30 rounded-full mb-3", children: _jsx(PieChartIcon, { className: "w-8 h-8 text-green-600 dark:text-green-400" }) }), _jsx("h2", { className: "text-2xl font-bold text-slate-900 dark:text-white", children: "Campaign Results" }), _jsxs("p", { className: "text-slate-500", children: ["Delivery report for ", queue.length, " contacts"] })] }), _jsxs("div", { className: "grid grid-cols-3 gap-4", children: [_jsxs("div", { className: "bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700 text-center", children: [_jsx("div", { className: "text-2xl font-bold text-slate-900 dark:text-white", children: delivered }), _jsx("div", { className: "text-xs text-slate-500 font-medium uppercase tracking-wide mt-1", children: "Delivered" })] }), _jsxs("div", { className: "bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700 text-center", children: [_jsx("div", { className: "text-2xl font-bold text-red-500", children: failed }), _jsx("div", { className: "text-xs text-slate-500 font-medium uppercase tracking-wide mt-1", children: "Failed" })] }), _jsxs("div", { className: "bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700 text-center", children: [_jsx("div", { className: "text-2xl font-bold text-amber-500", children: optedOut }), _jsx("div", { className: "text-xs text-slate-500 font-medium uppercase tracking-wide mt-1", children: "Opt-Outs" })] })] }), _jsxs("div", { className: "h-48 w-full relative", children: [_jsx(ResponsiveContainer, { width: "100%", height: "100%", children: _jsxs(PieChart, { children: [_jsx(Pie, { data: chartData, cx: "50%", cy: "50%", innerRadius: 60, outerRadius: 80, paddingAngle: 5, dataKey: "value", children: chartData.map((entry, index) => (_jsx(Cell, { fill: entry.color }, `cell-${index}`))) }), _jsx(Tooltip, { contentStyle: { backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff', borderRadius: '8px' } }), _jsx(Legend, { verticalAlign: "middle", align: "right", layout: "vertical", iconType: "circle" })] }) }), _jsx("div", { className: "absolute inset-0 flex items-center justify-center pointer-events-none pr-20", children: _jsxs("div", { className: "text-center", children: [_jsxs("span", { className: "text-3xl font-bold text-slate-900 dark:text-white block", children: [deliveryRate, "%"] }), _jsx("span", { className: "text-[10px] text-slate-500 uppercase font-bold", children: "Success Rate" })] }) })] }), _jsxs("div", { className: "bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg flex items-start gap-3", children: [_jsx(Sparkles, { className: "w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" }), _jsxs("div", { children: [_jsx("h4", { className: "text-sm font-bold text-blue-800 dark:text-blue-300", children: "AI Insight" }), _jsx("p", { className: "text-xs text-blue-700 dark:text-blue-400 mt-1", children: deliveryRate > 80
                                                        ? "Great delivery rate! Your list quality is high. Follow up with those who didn't opt-out in 3 days."
                                                        : "Delivery rate is lower than average. Consider verifying phone numbers before your next blast." })] })] })] }))] }), _jsxs("div", { className: "p-6 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 flex justify-end gap-3 rounded-b-xl", children: [step === 'config' && (_jsx("button", { onClick: () => setStep('draft'), disabled: !apiKey, className: "px-6 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg font-bold disabled:opacity-50 hover:opacity-90 transition-opacity", children: "Connect & Continue" })), step === 'draft' && (_jsxs(_Fragment, { children: [_jsx("button", { onClick: () => setStep('config'), className: "px-4 py-2 text-slate-600 dark:text-slate-300 font-medium hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors", children: "Back" }), _jsxs("button", { onClick: () => { setStep('send'); startSending(); }, className: "px-6 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-bold flex items-center gap-2 transition-colors shadow-lg hover:shadow-orange-500/25", children: ["Launch SMS Campaign ", _jsx(Send, { className: "w-4 h-4" })] })] })), step === 'send' && (_jsx("button", { disabled: true, className: "px-6 py-2 bg-slate-300 text-slate-500 rounded-lg font-bold cursor-not-allowed", children: "Sending..." })), step === 'analytics' && (_jsx("button", { onClick: onClose, className: "px-6 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg font-bold", children: "Close Report" }))] })] }) }));
}
