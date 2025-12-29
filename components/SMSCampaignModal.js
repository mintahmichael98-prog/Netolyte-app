"use client";

import React, { useState, useEffect } from 'react';
import { X, MessageSquare, Send, Sparkles, CheckCircle2, AlertCircle, Loader2, Key, User, Smartphone, ExternalLink, Globe, PieChart as PieChartIcon, Ban } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { sendArkeselSMS } from '../services/arkeselService';
import toast from 'react-hot-toast';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const COLORS = {
    delivered: '#22c55e',
    failed: '#ef4444',
    opted_out: '#f59e0b',
    pending: '#cbd5e1'
};

export default function SMSCampaignModal({ leads, isOpen, onClose, brandVoice }) {
    const [step, setStep] = useState('config');
    const [apiKey, setApiKey] = useState('');
    const [senderId, setSenderId] = useState('Netolyte');
    const [messageTemplate, setMessageTemplate] = useState("Hi {{name}}, saw {{company}} and wanted to connect about scaling your leads.");
    const [isGenerating, setIsGenerating] = useState(false);
    const [queue, setQueue] = useState([]);
    const [isSending, setIsSending] = useState(false);

    // Sync queue when leads change
    useEffect(() => {
        if (leads.length > 0) {
            const newQueue = leads.map(lead => {
                let phone = lead.socials?.whatsapp || '';
                if (!phone && lead.contact) {
                    const match = lead.contact.match(/[\d\-\+\(\)\s]+/);
                    if (match) phone = match[0].replace(/\D/g, '');
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
    }, [leads, isOpen]);

    if (!isOpen) return null;

    const generateTemplate = async () => {
        setIsGenerating(true);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY });
            const prompt = `Write a hyper-short B2B SMS (under 160 chars). Variables: {{name}}, {{company}}. Tone: ${brandVoice || 'Professional'}. Context: Lead generation services.`;
            
            const result = await ai.models.generateContent({
                model: 'gemini-1.5-flash',
                contents: prompt
            });

            const text = result.response.text();
            if (text) setMessageTemplate(text.trim());
        } catch (e) {
            toast.error("AI Generation failed");
        } finally {
            setIsGenerating(false);
        }
    };

    const startSending = async () => {
        setIsSending(true);
        const currentQueue = [...queue];
        
        for (let i = 0; i < currentQueue.length; i++) {
            const item = currentQueue[i];
            if (item.status !== 'pending') continue;

            const lead = leads.find(l => l.id === item.leadId);
            const msg = messageTemplate
                .replace(/{{name}}/g, item.leadName)
                .replace(/{{company}}/g, lead?.company || "your company");

            try {
                const result = await sendArkeselSMS(apiKey, senderId, item.phone, msg);
                currentQueue[i].status = result.status || 'delivered';
            } catch (err) {
                currentQueue[i].status = 'failed';
            }
            
            setQueue([...currentQueue]);
            await new Promise(r => setTimeout(r, 600)); // Rate limiting safety
        }

        setIsSending(false);
        setStep('analytics');
        toast.success("Campaign Completed");
    };

    // Analytics Helpers
    const totalSent = queue.filter(q => q.status !== 'pending').length;
    const delivered = queue.filter(q => q.status === 'delivered').length;
    const failed = queue.filter(q => q.status === 'failed').length;
    const progress = Math.round((totalSent / queue.length) * 100) || 0;

    const chartData = [
        { name: 'Delivered', value: delivered, color: COLORS.delivered },
        { name: 'Failed', value: failed, color: COLORS.failed }
    ].filter(d => d.value > 0);

    return (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-[70] p-4">
            <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl border border-slate-200 dark:border-slate-700 flex flex-col max-h-[90vh]">
                
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-3">
                        <MessageSquare className="w-6 h-6 text-orange-600" />
                        <div>
                            <h3 className="text-xl font-bold dark:text-white">SMS Campaign Manager</h3>
                            <p className="text-sm text-slate-500">{leads.length} Target Contacts</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="hover:bg-slate-100 p-2 rounded-full"><X /></button>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto p-6">
                    {step === 'config' && (
                        <div className="space-y-6">
                            <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-xl border border-orange-100 dark:border-orange-800 flex gap-3">
                                <AlertCircle className="text-orange-600 shrink-0" />
                                <p className="text-sm text-orange-800 dark:text-orange-200">Arkesel V2 API Keys are required for bulk sending. Ensure your Sender ID is pre-approved.</p>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">API Key</label>
                                    <input 
                                        type="password" 
                                        className="w-full p-3 rounded-xl border dark:bg-slate-900 dark:border-slate-700 dark:text-white"
                                        value={apiKey}
                                        onChange={(e) => setApiKey(e.target.value)}
                                        placeholder="Enter Arkesel API Key..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Sender ID</label>
                                    <input 
                                        type="text" 
                                        className="w-full p-3 rounded-xl border dark:bg-slate-900 dark:border-slate-700 dark:text-white"
                                        value={senderId}
                                        onChange={(e) => setSenderId(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 'draft' && (
                        <div className="space-y-4">
                            <div className="relative">
                                <textarea 
                                    className="w-full h-40 p-4 rounded-xl border dark:bg-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none"
                                    value={messageTemplate}
                                    onChange={(e) => setMessageTemplate(e.target.value)}
                                />
                                <button 
                                    onClick={generateTemplate}
                                    className="absolute bottom-4 right-4 flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm"
                                >
                                    {isGenerating ? <Loader2 className="animate-spin w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                                    AI Rewrite
                                </button>
                            </div>
                            <div className="flex gap-2">
                                <span className="text-[10px] px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded text-slate-500">{"{{name}}"}</span>
                                <span className="text-[10px] px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded text-slate-500">{"{{company}}"}</span>
                            </div>
                        </div>
                    )}

                    {step === 'send' && (
                        <div className="space-y-6">
                            <div className="text-center">
                                <div className="text-3xl font-bold dark:text-white mb-2">{progress}%</div>
                                <div className="w-full bg-slate-100 dark:bg-slate-700 h-3 rounded-full overflow-hidden">
                                    <div className="bg-orange-500 h-full transition-all" style={{ width: `${progress}%` }} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                {queue.map((item) => (
                                    <div key={item.leadId} className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                                        <span className="text-sm dark:text-white">{item.leadName}</span>
                                        <span className={`text-[10px] font-bold px-2 py-1 rounded ${
                                            item.status === 'delivered' ? 'bg-green-100 text-green-700' : 
                                            item.status === 'failed' ? 'bg-red-100 text-red-700' : 'bg-slate-200 text-slate-600'
                                        }`}>
                                            {item.status.toUpperCase()}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {step === 'analytics' && (
                        <div className="h-64 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={chartData} innerRadius={60} outerRadius={80} dataKey="value">
                                        {chartData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="p-6 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-3 bg-slate-50 dark:bg-slate-900/20">
                    <button onClick={onClose} className="px-4 py-2 text-slate-500 font-medium">Cancel</button>
                    {step === 'config' && (
                        <button onClick={() => setStep('draft')} disabled={!apiKey} className="px-6 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold">Continue</button>
                    )}
                    {step === 'draft' && (
                        <button onClick={startSending} className="px-6 py-2 bg-orange-600 text-white rounded-xl font-bold flex items-center gap-2">Launch <Send className="w-4 h-4" /></button>
                    )}
                    {step === 'analytics' && (
                        <button onClick={onClose} className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold">Done</button>
                    )}
                </div>
            </div>
        </div>
    );
}
