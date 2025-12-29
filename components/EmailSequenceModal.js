"use client";

import React, { useState } from 'react';
import { X, Send, Copy, Loader2, Sparkles, Wand2, CalendarPlus } from 'lucide-react';
import { GoogleGenerativeAI } from "@google/generative-ai"; // Updated package
import toast from 'react-hot-toast';

export default function EmailSequenceModal({ lead, isOpen, onClose, brandVoice, bookingSettings }) {
    const [loading, setLoading] = useState(false);
    const [emailContent, setEmailContent] = useState('');

    if (!isOpen) return null;

    const generateEmail = async () => {
        setLoading(true);
        try {
            // Ensure you add NEXT_PUBLIC_GEMINI_API_KEY to Vercel Environment Variables
            const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY);
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

            const contactName = lead.management?.[0]?.name || 'Hiring Manager';
            const toneInstruction = brandVoice ? `BRAND VOICE: ${brandVoice}` : "Tone: Professional, concise, value-driven, and not spammy.";

            const prompt = `
                Write a high-converting cold outreach email to ${lead.company}.
                Target: ${contactName} (${lead.management?.[0]?.role || 'Decision Maker'})
                Industry: ${lead.industry}
                Context: B2B lead generation service "Netolyte".
                Goal: Book a 15-minute demo.
                ${toneInstruction}
                Subject Line: [Catchy Subject]
                Body: [Email Body]
            `;

            const result = await model.generateContent(prompt);
            const text = result.response.text();

            if (text) {
                setEmailContent(text);
            } else {
                throw new Error("Empty response");
            }
        } catch (e) {
            console.error(e);
            toast.error("Generation failed: " + e.message);
        } finally {
            setLoading(false);
        }
    };

    const handleInsertBookingLink = () => {
        if (bookingSettings?.isConnected && bookingSettings?.urlSlug) {
            const bookingLink = `https://netolyte.ai/book/${bookingSettings.urlSlug}`;
            setEmailContent(prev => prev + `\n\nBook a slot: ${bookingLink}`);
            toast.success("Link inserted!");
        } else {
            toast.error("Set up your calendar first.");
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 rounded-xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh]">
                <div className="flex justify-between items-center p-6 border-b dark:border-slate-700">
                    <h3 className="text-lg font-bold dark:text-white">AI Outreach Composer</h3>
                    <button onClick={onClose}><X className="w-5 h-5" /></button>
                </div>
                <div className="p-6 overflow-y-auto flex-1 text-center">
                    {!emailContent && !loading && (
                        <button onClick={generateEmail} className="px-8 py-3 bg-indigo-600 text-white rounded-xl flex items-center gap-2 mx-auto">
                            <Sparkles className="w-4 h-4" /> Generate Email
                        </button>
                    )}
                    {loading && <Loader2 className="w-10 h-10 animate-spin text-indigo-600 mx-auto" />}
                    {emailContent && (
                        <textarea 
                            className="w-full h-80 p-4 rounded-lg bg-slate-50 dark:bg-slate-900 dark:text-white border"
                            value={emailContent} 
                            onChange={(e) => setEmailContent(e.target.value)}
                        />
                    )}
                </div>
                {emailContent && (
                    <div className="p-4 border-t dark:border-slate-700 flex justify-end gap-2">
                        <button onClick={handleInsertBookingLink} className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-700 rounded-lg">
                            <CalendarPlus className="w-4 h-4" /> Link
                        </button>
                        <button onClick={() => {navigator.clipboard.writeText(emailContent); toast.success("Copied!");}} className="px-4 py-2 bg-slate-100 dark:bg-slate-700 rounded-lg">Copy</button>
                        <button onClick={onClose} className="px-4 py-2 bg-indigo-600 text-white rounded-lg">Finish</button>
                    </div>
                )}
            </div>
        </div>
    );
}
