import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import React, { useState } from 'react';
import { Loader2, Globe, Target, TrendingUp, TrendingDown, ArrowRight, Linkedin, Twitter, Facebook, Instagram, Plus, MapPin } from 'lucide-react';
import { analyzeCompetitors } from '../services/geminiService';
import toast from 'react-hot-toast';
export default function CompetitorScanner({ onAddLeads, defaultLocation = '' }) {
    const [url, setUrl] = useState('');
    const [location, setLocation] = useState(defaultLocation);
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState(null);
    const handleScan = async (e) => {
        e.preventDefault();
        if (!url)
            return;
        setLoading(true);
        setData(null);
        try {
            const result = await analyzeCompetitors(url, location);
            setData(result);
            if (result)
                toast.success(`Found ${result.competitors.length} competitors!`);
        }
        catch (err) {
            toast.error("Analysis failed. Please check the URL.");
        }
        finally {
            setLoading(false);
        }
    };
    const handleSaveToLeads = () => {
        if (!data)
            return;
        const newLeads = data.competitors.map((comp, idx) => ({
            id: Date.now() + idx,
            company: comp.name,
            description: comp.description,
            location: location || 'Unknown', // Use the scanned location
            confidence: 90,
            website: comp.website,
            contact: 'N/A',
            industry: data.target.industry,
            employees: 'Unknown',
            status: 'new',
            socials: comp.socials,
            management: [],
            activity: [{
                    id: `comp_scan_${Date.now()}_${idx}`,
                    type: 'creation',
                    content: `Identified as competitor to ${data.target.name}`,
                    author: 'Competitor Spy',
                    timestamp: new Date().toISOString()
                }]
        }));
        onAddLeads(newLeads);
        toast.success(`Added ${newLeads.length} competitors to your leads list!`);
    };
    const ensureUrl = (link) => {
        if (!link || link === 'N/A')
            return '#';
        return link.startsWith('http') ? link : `https://${link}`;
    };
    return (_jsx("div", { className: "h-full flex flex-col p-8 overflow-y-auto bg-slate-50 dark:bg-[#020617]", children: _jsxs("div", { className: "max-w-4xl mx-auto w-full space-y-8", children: [_jsxs("div", { className: "text-center space-y-4", children: [_jsx("div", { className: "inline-flex items-center justify-center p-3 bg-rose-100 dark:bg-rose-900/30 rounded-full mb-2", children: _jsx(Target, { className: "w-8 h-8 text-rose-600 dark:text-rose-400" }) }), _jsx("h2", { className: "text-3xl font-bold text-slate-900 dark:text-white", children: "Competitor Spy" }), _jsx("p", { className: "text-slate-500 dark:text-slate-400 max-w-lg mx-auto", children: "Enter a website URL and location to instantly uncover direct competitors, analyze their strengths, and find gaps in the market." })] }), _jsxs("form", { onSubmit: handleScan, className: "relative max-w-3xl mx-auto w-full flex flex-col md:flex-row gap-3", children: [_jsxs("div", { className: "flex-1 relative", children: [_jsx("div", { className: "absolute inset-y-0 left-4 flex items-center pointer-events-none", children: _jsx(Globe, { className: "w-5 h-5 text-slate-400" }) }), _jsx("input", { type: "text", value: url, onChange: (e) => setUrl(e.target.value), placeholder: "e.g. stripe.com or airbnb.com", className: "w-full pl-12 pr-4 py-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500 outline-none shadow-sm text-lg" })] }), _jsxs("div", { className: "md:w-1/3 relative", children: [_jsx("div", { className: "absolute inset-y-0 left-4 flex items-center pointer-events-none", children: _jsx(MapPin, { className: "w-5 h-5 text-slate-400" }) }), _jsx("input", { type: "text", value: location, onChange: (e) => setLocation(e.target.value), placeholder: "Global / City", className: "w-full pl-12 pr-4 py-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500 outline-none shadow-sm text-lg" })] }), _jsx("button", { type: "submit", disabled: loading || !url, className: "px-8 py-4 bg-rose-600 hover:bg-rose-700 disabled:bg-slate-300 text-white rounded-xl font-semibold transition-colors flex items-center justify-center gap-2 shadow-lg hover:shadow-rose-500/30", children: loading ? _jsx(Loader2, { className: "w-5 h-5 animate-spin" }) : _jsxs(_Fragment, { children: ["Scan ", _jsx(ArrowRight, { className: "w-5 h-5" })] }) })] }), data && (_jsxs("div", { className: "space-y-8 animate-fade-in-up", children: [_jsxs("div", { className: "flex flex-col md:flex-row gap-6", children: [_jsxs("div", { className: "flex-1 bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm", children: [_jsxs("div", { className: "flex items-center gap-4 mb-4", children: [_jsx("div", { className: "w-12 h-12 bg-slate-100 dark:bg-slate-700 rounded-lg flex items-center justify-center text-xl font-bold text-slate-700 dark:text-slate-300 uppercase", children: data.target.name.substring(0, 2) }), _jsxs("div", { children: [_jsx("h3", { className: "text-xl font-bold text-slate-900 dark:text-white", children: data.target.name }), _jsx("span", { className: "inline-block px-2 py-0.5 rounded text-xs font-medium bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400", children: data.target.industry })] })] }), _jsx("p", { className: "text-slate-600 dark:text-slate-300", children: data.target.summary })] }), _jsx("div", { className: "flex items-center justify-center", children: _jsxs("button", { onClick: handleSaveToLeads, className: "px-6 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 transition-all flex items-center gap-2", children: [_jsx(Plus, { className: "w-5 h-5" }), " Save ", data.competitors.length, " Competitors to Leads"] }) })] }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: data.competitors.map((comp, idx) => (_jsxs("div", { className: "bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden flex flex-col h-full", children: [_jsx("div", { className: "absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-slate-100 to-transparent dark:from-slate-700/50 -mr-8 -mt-8 rounded-full" }), _jsxs("div", { className: "flex justify-between items-start mb-4", children: [_jsx("h4", { className: "text-lg font-bold text-slate-900 dark:text-white truncate pr-4", children: comp.name }), _jsxs("div", { className: "flex items-center gap-2", children: [comp.socials?.linkedin && (_jsx("a", { href: ensureUrl(comp.socials.linkedin), target: "_blank", rel: "noreferrer", className: "text-slate-400 hover:text-[#0077b5] transition-colors", title: "LinkedIn", children: _jsx(Linkedin, { className: "w-4 h-4" }) })), comp.socials?.twitter && (_jsx("a", { href: ensureUrl(comp.socials.twitter), target: "_blank", rel: "noreferrer", className: "text-slate-400 hover:text-[#1DA1F2] transition-colors", title: "Twitter", children: _jsx(Twitter, { className: "w-4 h-4" }) })), comp.socials?.instagram && (_jsx("a", { href: ensureUrl(comp.socials.instagram), target: "_blank", rel: "noreferrer", className: "text-slate-400 hover:text-[#E4405F] transition-colors", title: "Instagram", children: _jsx(Instagram, { className: "w-4 h-4" }) })), comp.socials?.facebook && (_jsx("a", { href: ensureUrl(comp.socials.facebook), target: "_blank", rel: "noreferrer", className: "text-slate-400 hover:text-[#1877F2] transition-colors", title: "Facebook", children: _jsx(Facebook, { className: "w-4 h-4" }) })), comp.website && (_jsx("a", { href: ensureUrl(comp.website), target: "_blank", rel: "noreferrer", className: "text-slate-400 hover:text-rose-500 transition-colors", title: "Website", children: _jsx(Globe, { className: "w-4 h-4" }) }))] })] }), _jsx("p", { className: "text-sm text-slate-500 dark:text-slate-400 mb-6 h-10 line-clamp-2", children: comp.description }), _jsxs("div", { className: "space-y-3 mt-auto", children: [_jsxs("div", { className: "flex gap-3", children: [_jsx("div", { className: "mt-1", children: _jsx(TrendingUp, { className: "w-4 h-4 text-emerald-500" }) }), _jsxs("div", { children: [_jsx("span", { className: "text-xs font-bold text-slate-400 uppercase tracking-wide", children: "Strength" }), _jsx("p", { className: "text-sm text-slate-700 dark:text-slate-200", children: comp.strength })] })] }), _jsxs("div", { className: "flex gap-3", children: [_jsx("div", { className: "mt-1", children: _jsx(TrendingDown, { className: "w-4 h-4 text-rose-500" }) }), _jsxs("div", { children: [_jsx("span", { className: "text-xs font-bold text-slate-400 uppercase tracking-wide", children: "Weakness" }), _jsx("p", { className: "text-sm text-slate-700 dark:text-slate-200", children: comp.weakness })] })] })] })] }, idx))) })] }))] }) }));
}
