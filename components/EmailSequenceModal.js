"use client";

import React, { useState } from 'react';
import { X, Send, Copy, Loader2, Sparkles, Wand2, CalendarPlus } from 'lucide-react';
import { GoogleGenAI } from "@google/genai"; // Latest SDK import
import toast from 'react-hot-toast';

export default function EmailSequenceModal({ lead, isOpen, onClose, brandVoice, bookingSettings }) {
    const [loading, setLoading] = useState(false);
    const [emailContent, setEmailContent] = useState('');

    if (!isOpen) return null;

    const generateEmail = async () => {
        setLoading(true);
        try {
            // Use NEXT_PUBLIC_ for client-side keys
            const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY });
            
            const contactName = lead.management?.[0]?.name || 'Hiring Manager';
            const toneInstruction = brandVoice ? `BRAND VOICE: ${brandVoice}` : "Tone: Professional and concise.";

            const prompt = `Write a cold outreach email to ${lead.company} for ${contactName}. Goal: 15-min demo. ${toneInstruction}`;

            const result = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt
            });

            if (result.text) {
                setEmailContent(result.text);
            } else {
                throw new Error("No response");
            }
        } catch (e) {
            console.error(e);
            toast.error("Generation failed: " + e.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/80 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 rounded-xl w-full max-w-2xl flex flex-col max-h-[90vh]">
                <div className="flex justify-between items-center p-6 border-b dark:border-slate-700">
                    <h3 className="font-bold dark:text-white">AI Outreach Composer</h3>
                    <button onClick={onClose}><X /></button>
                </div>
                <div className="p-6 overflow-y-auto flex-1">
                    {!emailContent && !loading && (
                        <button onClick={generateEmail} className="px-8 py-3 bg-indigo-600 text-white rounded-lg mx-auto block">
                            Generate Email
                        </button>
                    )}
                    {loading && <Loader2 className="animate-spin mx-auto w-10 h-10 text-indigo-600" />}
                    {emailContent && (
                        <textarea 
                            className="w-full h-80 p-4 rounded bg-slate-50 dark:bg-slate-900 dark:text-white border"
                            value={emailContent} 
                            onChange={(e) => setEmailContent(e.target.value)}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}
