"use client";

import React, { useState } from 'react';
import { X, MessageSquare, Loader2, Copy, Sparkles } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import toast from 'react-hot-toast';

export default function SMSCampaignModal({ lead, isOpen, onClose }) {
    const [loading, setLoading] = useState(false);
    const [smsBody, setSmsBody] = useState('');

    if (!isOpen) return null;

    const generateSMS = async () => {
        setLoading(true);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY });
            
            const prompt = `Write a short, friendly B2B SMS outreach (under 160 characters) to ${lead.company}. 
            Goal: Brief check-in regarding their ${lead.industry} operations. 
            Tone: Professional but casual. No hashtags.`;

            const result = await ai.models.generateContent({
                model: 'gemini-1.5-flash',
                contents: prompt
            });

            const text = result.response?.text || "Could not generate SMS.";
            setSmsBody(text.trim());
        } catch (e) {
            console.error(e);
            toast.error("SMS Generation failed");
        } finally {
            setLoading(false);
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(smsBody);
        toast.success("SMS copied!");
    };

    return (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
                <div className="flex justify-between items-center p-5 border-b dark:border-slate-800">
                    <div className="flex items-center gap-2">
                        <MessageSquare className="w-5 h-5 text-green-500" />
                        <h2 className="font-bold dark:text-white">SMS Campaign</h2>
                    </div>
                    <button onClick={onClose}><X className="text-slate-400" /></button>
                </div>

                <div className="p-6">
                    {loading ? (
                        <div className="flex flex-col items-center py-8">
                            <Loader2 className="animate-spin text-green-500 w-10 h-10 mb-2" />
                            <p className="text-sm text-slate-500">Writing text...</p>
                        </div>
                    ) : (
                        <>
                            <textarea 
                                value={smsBody}
                                onChange={(e) => setSmsBody(e.target.value)}
                                className="w-full h-32 p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 dark:text-white text-sm focus:ring-2 focus:ring-green-500 outline-none transition-all"
                                placeholder="Click generate to create an SMS draft..."
                            />
                            <div className="mt-2 flex justify-between text-[10px] text-slate-400 uppercase font-bold tracking-widest">
                                <span>{smsBody.length} Characters</span>
                                <span>{Math.ceil(smsBody.length / 160)} Segment(s)</span>
                            </div>
                        </>
                    )}
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 flex gap-2">
                    <button 
                        onClick={generateSMS}
                        className="flex-1 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium transition-all flex items-center justify-center gap-2"
                    >
                        <Sparkles className="w-4 h-4" /> {smsBody ? "Regenerate" : "Generate"}
                    </button>
                    {smsBody && (
                        <button 
                            onClick={handleCopy}
                            className="p-3 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl hover:bg-slate-50"
                        >
                            <Copy className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
