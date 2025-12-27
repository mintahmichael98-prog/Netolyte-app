import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useState } from 'react';
import { X, Send, Copy, Loader2, Sparkles, Wand2, CalendarPlus } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import toast from 'react-hot-toast';
export default function EmailSequenceModal({ lead, isOpen, onClose, brandVoice, bookingSettings }) {
    const [loading, setLoading] = useState(false);
    const [emailContent, setEmailContent] = useState('');
    if (!isOpen)
        return null;
    const generateEmail = async () => {
        setLoading(true);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const contactName = lead.management?.[0]?.name || 'Hiring Manager';
            const toneInstruction = brandVoice ? `BRAND VOICE: ${brandVoice}` : "Tone: Professional, concise, value-driven, and not spammy.";
            const prompt = `
          Write a high-converting cold outreach email to ${lead.company}.
          
          Target: ${contactName} (${lead.management?.[0]?.role || 'Decision Maker'})
          Industry: ${lead.industry}
          Location: ${lead.location}
          
          Context: I am offering a B2B lead generation service called "Netolyte".
          Goal: Book a 15-minute demo.
          ${toneInstruction}
          
          Subject Line: [Generate a catchy subject]
          Body: [Generate the email body]
        `;
            const result = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt
            });
            const text = result.text;
            if (text)
                setEmailContent(text);
            else
                throw new Error("No response");
        }
        catch (e) {
            toast.error("Failed to generate email: " + e.message);
        }
        finally {
            setLoading(false);
        }
    };
    const handleInsertBookingLink = () => {
        if (bookingSettings.isConnected && bookingSettings.urlSlug) {
            const bookingLink = `https://netolyte.ai/book/${bookingSettings.urlSlug}`;
            const linkText = `\n\nReady to talk? Book a ${bookingSettings.meetingDuration}-minute slot on my calendar: ${bookingLink}`;
            setEmailContent(prev => prev + linkText);
            toast.success("Booking link inserted!");
        }
        else {
            toast.error("Please set up your calendar in the Booking Calendar view first.");
        }
    };
    return (_jsx("div", { className: "fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-50 p-4", children: _jsxs("div", { className: "bg-white dark:bg-slate-800 rounded-xl w-full max-w-2xl shadow-2xl border border-slate-200 dark:border-slate-700 flex flex-col max-h-[90vh]", children: [_jsxs("div", { className: "flex justify-between items-center p-6 border-b border-slate-200 dark:border-slate-700", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("div", { className: "p-2 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg", children: _jsx(Wand2, { className: "w-5 h-5 text-indigo-600 dark:text-indigo-400" }) }), _jsxs("div", { children: [_jsx("h3", { className: "text-lg font-bold text-slate-900 dark:text-white", children: "AI Outreach Composer" }), _jsxs("p", { className: "text-xs text-slate-500", children: ["Drafting for ", lead.company] })] })] }), _jsx("button", { onClick: onClose, className: "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300", children: _jsx(X, { className: "w-5 h-5" }) })] }), _jsxs("div", { className: "p-6 overflow-y-auto flex-1", children: [!emailContent && !loading && (_jsxs("div", { className: "text-center py-12 flex flex-col items-center", children: [_jsx("div", { className: "w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mb-4 shadow-lg shadow-indigo-500/20", children: _jsx(Sparkles, { className: "w-8 h-8 text-white" }) }), _jsx("h4", { className: "text-lg font-medium text-slate-900 dark:text-white mb-2", children: "Generate Personalized Outreach" }), _jsxs("p", { className: "text-slate-500 dark:text-slate-400 max-w-sm mb-8", children: ["Use AI to craft a tailored cold email to ", _jsx("span", { className: "font-semibold text-slate-700 dark:text-slate-300", children: lead.company }), " based on their industry and key decision makers.", brandVoice && _jsxs("span", { className: "block mt-2 text-indigo-500 text-xs", children: ["Using Brand Voice: \"", brandVoice, "\""] })] }), _jsxs("button", { onClick: generateEmail, className: "px-8 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-all shadow-lg hover:shadow-indigo-500/25 flex items-center gap-2", children: [_jsx(Sparkles, { className: "w-4 h-4" }), " Generate Email"] })] })), loading && (_jsxs("div", { className: "text-center py-20", children: [_jsx(Loader2, { className: "w-10 h-10 animate-spin text-indigo-600 mx-auto mb-4" }), _jsx("p", { className: "text-slate-600 dark:text-slate-300 font-medium", children: "Analyzing prospect data..." }), _jsx("p", { className: "text-sm text-slate-400 mt-2", children: "Crafting the perfect hook" })] })), emailContent && (_jsxs("div", { className: "space-y-4 animate-fade-in", children: [_jsx("div", { className: "relative", children: _jsx("textarea", { className: "w-full h-80 p-5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none resize-none font-mono text-sm leading-relaxed text-slate-800 dark:text-slate-200", value: emailContent, onChange: (e) => setEmailContent(e.target.value) }) }), _jsxs("div", { className: "flex justify-end gap-3", children: [_jsxs("button", { onClick: handleInsertBookingLink, className: "flex items-center gap-2 px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg font-medium transition-colors", title: "Insert Booking Link", children: [_jsx(CalendarPlus, { className: "w-4 h-4" }), " Insert Link"] }), _jsxs("button", { onClick: () => { navigator.clipboard.writeText(emailContent); toast.success("Copied to clipboard"); }, className: "flex items-center gap-2 px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg font-medium transition-colors", children: [_jsx(Copy, { className: "w-4 h-4" }), " Copy Text"] }), _jsxs("button", { onClick: () => toast.success("Sent to outbox!"), className: "flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg font-medium shadow-md transition-colors", children: [_jsx(Send, { className: "w-4 h-4" }), " Send Email"] })] })] }))] })] }) }));
}
