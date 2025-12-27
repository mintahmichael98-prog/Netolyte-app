import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell } from 'recharts';
import { Users, Building2, MapPin, TrendingUp } from 'lucide-react';
const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316', '#eab308', '#22c55e', '#06b6d4', '#3b82f6'];
const StatCard = ({ title, value, icon: Icon, color, delay }) => (_jsxs("div", { className: `bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-between hover:shadow-md hover:-translate-y-1 transition-all duration-300 animate-slide-up ${delay}`, children: [_jsxs("div", { children: [_jsx("p", { className: "text-slate-500 dark:text-slate-400 text-sm font-medium", children: title }), _jsx("h3", { className: "text-2xl font-bold mt-1 text-slate-900 dark:text-white", children: value })] }), _jsx("div", { className: `p-3 rounded-lg ${color} bg-opacity-10`, children: _jsx(Icon, { className: `w-6 h-6 ${color.replace('bg-', 'text-')}` }) })] }));
const Dashboard = ({ leads }) => {
    const industryData = useMemo(() => {
        const counts = {};
        leads.forEach(l => {
            const ind = l.industry || 'Other';
            counts[ind] = (counts[ind] || 0) + 1;
        });
        return Object.entries(counts)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 3); // Top 3
    }, [leads]);
    const confidenceData = useMemo(() => {
        const buckets = { '90+': 0, '80-89': 0, '70-79': 0, '<70': 0 };
        leads.forEach(l => {
            if (l.confidence >= 90)
                buckets['90+']++;
            else if (l.confidence >= 80)
                buckets['80-89']++;
            else if (l.confidence >= 70)
                buckets['70-79']++;
            else
                buckets['<70']++;
        });
        return Object.entries(buckets).map(([name, value]) => ({ name, value }));
    }, [leads]);
    const avgConfidence = useMemo(() => {
        if (leads.length === 0)
            return 0;
        const total = leads.reduce((sum, l) => sum + l.confidence, 0);
        return Math.round(total / leads.length);
    }, [leads]);
    const topLocation = useMemo(() => {
        if (leads.length === 0)
            return 'N/A';
        const counts = {};
        leads.forEach(l => {
            const city = l.location.split(',')[0].trim();
            counts[city] = (counts[city] || 0) + 1;
        });
        const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
        return sorted[0] ? sorted[0][0] : 'N/A';
    }, [leads]);
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4", children: [_jsx(StatCard, { title: "Total Leads", value: leads.length.toLocaleString(), icon: Users, color: "text-indigo-600 bg-indigo-600", delay: "delay-0" }), _jsx(StatCard, { title: "Avg. Confidence", value: `${avgConfidence}%`, icon: TrendingUp, color: "text-emerald-500 bg-emerald-500", delay: "delay-100" }), _jsx(StatCard, { title: "Top Industry", value: industryData[0]?.name || 'N/A', icon: Building2, color: "text-orange-500 bg-orange-500", delay: "delay-200" }), _jsx(StatCard, { title: "Top Location", value: topLocation, icon: MapPin, color: "text-blue-500 bg-blue-500", delay: "delay-300" })] }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [_jsxs("div", { className: "bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm animate-scale-in delay-200", children: [_jsx("h3", { className: "text-lg font-semibold mb-4 text-slate-900 dark:text-white", children: "Top 3 Industries" }), _jsx("div", { className: "h-80 w-full", children: _jsx(ResponsiveContainer, { width: "100%", height: "100%", children: _jsxs(BarChart, { layout: "vertical", data: industryData, margin: { top: 5, right: 30, left: 20, bottom: 5 }, children: [_jsx(CartesianGrid, { strokeDasharray: "3 3", horizontal: false, stroke: "#334155", opacity: 0.1 }), _jsx(XAxis, { type: "number", hide: true }), _jsx(YAxis, { dataKey: "name", type: "category", width: 100, tick: { fill: '#64748b', fontSize: 11 }, stroke: "transparent" }), _jsx(RechartsTooltip, { cursor: { fill: 'transparent' }, contentStyle: { backgroundColor: '#1e293b', borderColor: '#334155', color: '#f1f5f9', borderRadius: '8px' } }), _jsx(Bar, { dataKey: "value", radius: [0, 4, 4, 0], barSize: 20, children: industryData.map((entry, index) => (_jsx(Cell, { fill: COLORS[index % COLORS.length] }, `cell-${index}`))) })] }) }) })] }), _jsxs("div", { className: "bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm animate-scale-in delay-300", children: [_jsx("h3", { className: "text-lg font-semibold mb-4 text-slate-900 dark:text-white", children: "Confidence Score Distribution" }), _jsx("div", { className: "h-80 w-full", children: _jsx(ResponsiveContainer, { width: "100%", height: "100%", children: _jsxs(BarChart, { data: confidenceData, margin: { top: 20, right: 30, left: 20, bottom: 5 }, children: [_jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "#334155", opacity: 0.1 }), _jsx(XAxis, { dataKey: "name", stroke: "#94a3b8", fontSize: 12 }), _jsx(YAxis, { stroke: "#94a3b8", fontSize: 12 }), _jsx(RechartsTooltip, { cursor: { fill: 'transparent' }, contentStyle: { backgroundColor: '#1e293b', borderColor: '#334155', color: '#f1f5f9', borderRadius: '8px' } }), _jsx(Bar, { dataKey: "value", fill: "#6366f1", radius: [4, 4, 0, 0], barSize: 40 })] }) }) })] })] })] }));
};
export default Dashboard;
