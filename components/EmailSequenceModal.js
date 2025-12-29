"use client";

import React, { useState } from 'react';
import { X, Loader2, Sparkles, Wand2, CalendarPlus } from 'lucide-react';
import { GoogleGenAI } from "@google/genai"; 
import toast from 'react-hot-toast';

export default function EmailSequenceModal({ lead, isOpen, onClose, brandVoice, bookingSettings }) {
    const [loading, setLoading] = useState(false);
    const [emailContent, setEmailContent] = useState('');

    if (!isOpen) return null;

    const generateEmail = async () => {
        setLoading(true);
        try {
            // Initialize SDK
            const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY });
            
            const contactName = lead.management?.[0]?.name || 'Hiring Manager';
            const toneInstruction = brandVoice ? `BRAND VOICE: ${brandVoice}` : "Tone: Professional and concise.";

            const prompt = `Write a cold outreach email to ${lead.company} for ${contactName}. Goal: 15-min demo. ${toneInstruction}`;

            const result = await ai.models.generateContent({
                model: 'gemini-1.5-flash', // Use the standard production model name
                contents: prompt
            });

            // CORRECT ACCESS: result.response.text (SDK property) or .text() (SDK method)
            const generatedText = result.response?.text || "";

            if (generatedText) {
                setEmailContent(generatedText);
            } else {
                throw new Error("AI returned an empty response.");
            }
        } catch (e) {
            console.error("AI Generation Error:", e);
            toast.error("Generation failed: " + e.message);
        } finally {
            setLoading(false);
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(emailContent);
        toast.success("Copied to clipboard!");
    };

    return (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-2xl flex flex-col max-h-[90vh] shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b dark:border-slate-700 bg-white dark:bg-slate-800">
                    <div className="flex items-center gap-2">
                        <Wand2 className="w-5 h-5 text-indigo-500" />
                        <h3 className="font-bold text-lg dark:text-white">AI Outreach Composer</h3>
                    </div>
                    <button onClick={onClose} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors">
                        <X className="w-6 h-6 dark:text-slate-400" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 overflow-y-auto flex-1 bg-slate-50 dark:bg-slate-900/50">
                    {!emailContent && !loading && (
                        <div className="text-center py-12">
                            <Sparkles className="w-12 h-12 text-indigo-400 mx-auto mb-4 opacity-30" />
                            <p className="text-slate-500 dark:text-slate-400 mb-6">Ready to craft a personalized message for {lead.company}?</p>
                            <button 
                                onClick={generateEmail} 
                                className="px-10 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold transition-all shadow-lg shadow-indigo-200 dark:shadow-none"
                            >
                                Generate Email Draft
                            </button>
                        </div>
                    )}

                    {loading && (
                        <div className="text-center py-12">
                            <Loader2 className="animate-spin mx-auto w-12 h-12 text-indigo-600 mb-4" />
                            <p className="text-slate-500 dark:text-slate-400">Gemini is researching and writing...</p>
                        </div>
                    )}

                    {emailContent && (
                        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <textarea 
                                className="w-full h-96 p-5 rounded-xl bg-white dark:bg-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm font-mono text-sm leading-relaxed"
                                value={emailContent} 
                                onChange={(e) => setEmailContent(e.target.value)}
                            />
                        </div>
                    )}
                </div>

                {/* Footer */}
                {emailContent && (
                    <div className="p-4 border-t dark:border-slate-700 bg-white dark:bg-slate-800 flex justify-between gap-3">
                        <button 
                            onClick={() => setEmailContent('')}
                            className="px-4 py-2 text-slate-500 hover:text-slate-700 font-medium"
                        >
                            Reset
                        </button>
                        <div className="flex gap-2">
                            <button 
                                onClick={handleCopy}
                                className="flex items-center gap-2 px-5 py-2.5 bg-slate-100 dark:bg-slate-700 dark:text-white rounded-lg hover:bg-slate-200 transition-all font-medium"
                            >
                                <Copy className="w-4 h-4" /> Copy
                            </button>
                            <button 
                                onClick={onClose}
                                className="px-8 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-all font-medium"
                            >
                                Use This Draft
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
