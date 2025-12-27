import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import React, { useState, useEffect } from 'react';
import { X, MessageCircle, Send, Sparkles, CheckCircle2, AlertCircle, Loader2, ExternalLink } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import toast from 'react-hot-toast';
export default function WhatsAppCampaignModal({ leads, isOpen, onClose, brandVoice }) {
    const [step, setStep] = useState('draft');
    const [messageTemplate, setMessageTemplate] = useState("Hi {{name}}, I noticed {{company}} is doing great work in the {{industry}} space. Would love to connect!");
    const [isGenerating, setIsGenerating] = useState(false);
    const [queue, setQueue] = useState([]);
    // Initialize queue when leads change
    useEffect(() => {
        if (leads.length > 0) {
            const newQueue = leads.map(lead => {
                // Prioritize WhatsApp number, then fallback to cleaning the contact string
                let phone = lead.socials?.whatsapp || '';
                if (!phone && lead.contact) {
                    // Extract potential phone number from contact string "123456 | email"
                    const match = lead.contact.match(/[\d\-\+\(\)\s]+/);
                    if (match) {
                        // Clean non-numeric characters
                        phone = match[0].replace(/\D/g, '');
                    }
                }
                return {
                    leadId: lead.id,
                    leadName: lead.management?.[0]?.name || 'there',
                    leadCompany: lead.company,
                    phone: phone,
                    status: phone ? 'pending' : 'failed' // Auto-fail if no phone
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
            const toneInstruction = brandVoice ? `Tone: ${brandVoice}` : "Tone: Friendly, direct, not salesy.";
            const prompt = `
        Write a short, casual, and professional WhatsApp message template for B2B cold outreach.
        Keep it under 30 words.
        Use variables: {{name}} for person's name, {{company}} for company name, {{industry}} for industry.
        ${toneInstruction}
        Goal: Start a conversation.
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
    const compileMessage = (template, item) => {
        const lead = leads.find(l => l.id === item.leadId);
        if (!lead)
            return template;
        return template
            .replace(/{{name}}/g, item.leadName)
            .replace(/{{company}}/g, item.leadCompany)
            .replace(/{{industry}}/g, lead.industry || 'your industry');
    };
    const handleSend = (index) => {
        const item = queue[index];
        if (!item.phone)
            return;
        const msg = compileMessage(messageTemplate, item);
        const url = `https://wa.me/${item.phone}?text=${encodeURIComponent(msg)}`;
        window.open(url, '_blank');
        // Update status
        const newQueue = [...queue];
        newQueue[index].status = 'sent';
        setQueue(newQueue);
    };
    const markSkipped = (index) => {
        const newQueue = [...queue];
        newQueue[index].status = 'skipped';
        setQueue(newQueue);
    };
    const progress = Math.round((queue.filter(q => q.status === 'sent').length / queue.length) * 100) || 0;
    return (_jsx("div", { className: "fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-[70] p-4", children: _jsxs("div", { className: "bg-white dark:bg-slate-800 rounded-xl w-full max-w-2xl shadow-2xl border border-slate-200 dark:border-slate-700 flex flex-col max-h-[90vh]", children: [_jsxs("div", { className: "flex justify-between items-center p-6 border-b border-slate-200 dark:border-slate-700", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "p-2 bg-[#25D366]/10 rounded-lg", children: _jsx(MessageCircle, { className: "w-6 h-6 text-[#25D366]" }) }), _jsxs("div", { children: [_jsx("h3", { className: "text-xl font-bold text-slate-900 dark:text-white", children: "WhatsApp Broadcast" }), _jsxs("p", { className: "text-sm text-slate-500", children: ["Targeting ", leads.length, " contacts"] })] })] }), _jsx("button", { onClick: onClose, className: "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300", children: _jsx(X, { className: "w-6 h-6" }) })] }), _jsx("div", { className: "flex-1 overflow-y-auto p-6", children: step === 'draft' ? (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-lg border border-indigo-100 dark:border-indigo-800", children: [_jsxs("h4", { className: "font-semibold text-indigo-900 dark:text-indigo-200 mb-2 flex items-center gap-2", children: [_jsx(Sparkles, { className: "w-4 h-4" }), " AI Strategy"] }), _jsxs("p", { className: "text-sm text-indigo-700 dark:text-indigo-300", children: ["WhatsApp messages should be extremely short and personal. Use the AI to generate a high-response conversational opener.", brandVoice && _jsxs("span", { className: "block mt-1 font-semibold", children: ["Using Brand Voice: \"", brandVoice, "\""] })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2", children: "Message Template" }), _jsxs("div", { className: "relative", children: [_jsx("textarea", { value: messageTemplate, onChange: (e) => setMessageTemplate(e.target.value), className: "w-full h-32 p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-[#25D366] outline-none resize-none font-medium", placeholder: "Hi {{name}}..." }), _jsxs("button", { onClick: generateTemplate, disabled: isGenerating, className: "absolute bottom-3 right-3 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs rounded-lg flex items-center gap-1 transition-colors shadow-sm", children: [isGenerating ? _jsx(Loader2, { className: "w-3 h-3 animate-spin" }) : _jsx(Sparkles, { className: "w-3 h-3" }), "Rewrite with AI"] })] }), _jsxs("div", { className: "mt-2 flex gap-2 text-xs text-slate-500", children: [_jsx("span", { className: "bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded", children: '{{name}}' }), _jsx("span", { className: "bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded", children: '{{company}}' }), _jsx("span", { className: "bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded", children: '{{industry}}' })] })] }), _jsxs("div", { className: "border-t border-slate-200 dark:border-slate-700 pt-6", children: [_jsx("h4", { className: "font-semibold text-slate-900 dark:text-white mb-4", children: "Preview (First Contact)" }), _jsxs("div", { className: "bg-[#DCF8C6] dark:bg-[#056162] p-4 rounded-lg rounded-tl-none inline-block max-w-sm shadow-sm", children: [_jsx("p", { className: "text-slate-800 dark:text-white whitespace-pre-wrap", children: queue.length > 0 ? compileMessage(messageTemplate, queue[0]) : "No leads selected" }), _jsx("span", { className: "text-[10px] text-slate-500 dark:text-slate-300 block text-right mt-1", children: "12:00 PM" })] })] })] })) : (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsx("span", { className: "text-sm font-medium text-slate-500", children: "Progress" }), _jsxs("span", { className: "text-sm font-bold text-slate-900 dark:text-white", children: [progress, "%"] })] }), _jsx("div", { className: "h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden", children: _jsx("div", { className: "h-full bg-[#25D366] transition-all duration-300", style: { width: `${progress}%` } }) }), _jsx("div", { className: "space-y-2 mt-4 max-h-[300px] overflow-y-auto pr-2", children: queue.map((item, idx) => (_jsxs("div", { className: `flex items-center justify-between p-3 rounded-lg border ${item.status === 'sent' ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-900' :
                                        item.status === 'failed' ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-900 opacity-60' :
                                            'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'}`, children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: `w-8 h-8 rounded-full flex items-center justify-center ${item.status === 'sent' ? 'bg-green-100 text-green-600' :
                                                        item.status === 'failed' ? 'bg-red-100 text-red-500' :
                                                            'bg-slate-100 dark:bg-slate-700 text-slate-500'}`, children: item.status === 'sent' ? _jsx(CheckCircle2, { className: "w-4 h-4" }) :
                                                        item.status === 'failed' ? _jsx(AlertCircle, { className: "w-4 h-4" }) :
                                                            _jsx("span", { className: "text-xs font-bold", children: idx + 1 }) }), _jsxs("div", { children: [_jsx("p", { className: "text-sm font-semibold text-slate-900 dark:text-white", children: item.leadName }), _jsx("p", { className: "text-xs text-slate-500 truncate max-w-[150px]", children: item.leadCompany })] })] }), _jsxs("div", { className: "flex items-center gap-2", children: [item.status === 'pending' && (_jsxs(_Fragment, { children: [_jsx("button", { onClick: () => markSkipped(idx), className: "p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 text-xs", children: "Skip" }), _jsxs("button", { onClick: () => handleSend(idx), className: "flex items-center gap-2 px-3 py-1.5 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-md text-xs font-bold transition-transform active:scale-95 shadow-sm", children: ["Send ", _jsx(ExternalLink, { className: "w-3 h-3" })] })] })), item.status === 'sent' && _jsx("span", { className: "text-xs font-medium text-green-600 dark:text-green-400 px-3", children: "Sent" }), item.status === 'skipped' && _jsx("span", { className: "text-xs font-medium text-slate-400 px-3", children: "Skipped" }), item.status === 'failed' && _jsx("span", { className: "text-xs font-medium text-red-500 px-3", children: "No Number" })] })] }, item.leadId))) })] })) }), _jsx("div", { className: "p-6 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 flex justify-end gap-3 rounded-b-xl", children: step === 'draft' ? (_jsxs(_Fragment, { children: [_jsx("button", { onClick: onClose, className: "px-4 py-2 text-slate-600 dark:text-slate-300 font-medium hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg", children: "Cancel" }), _jsxs("button", { onClick: () => setStep('send'), className: "px-6 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg font-bold flex items-center gap-2 hover:opacity-90 transition-opacity", children: ["Start Campaign ", _jsx(Send, { className: "w-4 h-4" })] })] })) : (_jsx("button", { onClick: onClose, className: "px-6 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg font-bold", children: "Done" })) })] }) }));
}
