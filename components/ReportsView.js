import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useState, useMemo } from 'react';
import { generateExcelReport } from '../utils/reportGenerator';
import { FileSpreadsheet, Calendar, Filter, PieChart, Download, BarChart3, TrendingUp, Building2, MapPin, User } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RePieChart, Pie, Cell, Legend } from 'recharts';
const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316', '#eab308'];
export default function ReportsView({ leads, teamMembers, currentUser }) {
    // Default to last 30 days
    const today = new Date().toISOString().split('T')[0];
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const [startDate, setStartDate] = useState(thirtyDaysAgo);
    const [endDate, setEndDate] = useState(today);
    const [statusFilter, setStatusFilter] = useState('all');
    const [industryFilter, setIndustryFilter] = useState('all');
    const [locationFilter, setLocationFilter] = useState('all');
    const [userFilter, setUserFilter] = useState('all');
    // Extract unique Industries and Locations for Dropdowns
    const availableIndustries = useMemo(() => {
        const industries = new Set(leads.map(l => l.industry || 'Unknown'));
        return Array.from(industries).sort();
    }, [leads]);
    const availableLocations = useMemo(() => {
        // Simplify locations to Cities if possible, or just unique strings
        const locations = new Set(leads.map(l => l.location ? l.location.split(',')[0].trim() : 'Unknown'));
        return Array.from(locations).sort();
    }, [leads]);
    // Filter Logic for Preview
    const filteredData = useMemo(() => {
        const start = new Date(startDate).getTime();
        const end = new Date(endDate).getTime();
        return leads.filter(l => {
            // Heuristic: use ID as timestamp if valid, else assume recent
            const leadDate = l.id > 1000000000000 ? l.id : Date.now();
            const matchesDate = leadDate >= start && leadDate <= end + 86400000;
            const matchesStatus = statusFilter === 'all' || (l.status || 'new') === statusFilter;
            const matchesIndustry = industryFilter === 'all' || (l.industry || 'Unknown') === industryFilter;
            const matchesLocation = locationFilter === 'all' || (l.location && l.location.includes(locationFilter));
            // User/Owner Filter
            const matchesUser = userFilter === 'all' || l.ownerId === userFilter;
            return matchesDate && matchesStatus && matchesIndustry && matchesLocation && matchesUser;
        });
    }, [leads, startDate, endDate, statusFilter, industryFilter, locationFilter, userFilter]);
    // Chart Data Preparation
    const statusData = useMemo(() => {
        const counts = {};
        filteredData.forEach(l => {
            const s = (l.status || 'new').toUpperCase();
            counts[s] = (counts[s] || 0) + 1;
        });
        return Object.entries(counts).map(([name, value]) => ({ name, value }));
    }, [filteredData]);
    const industryData = useMemo(() => {
        const counts = {};
        filteredData.forEach(l => {
            const i = l.industry || 'Unknown';
            counts[i] = (counts[i] || 0) + 1;
        });
        return Object.entries(counts)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 5);
    }, [filteredData]);
    const handleGenerate = () => {
        generateExcelReport(filteredData, {
            startDate,
            endDate,
            status: statusFilter,
            industry: industryFilter,
            location: locationFilter
        });
    };
    // Calculate Pipeline Value (Estimated GHS)
    const pipelineValue = useMemo(() => {
        const totalValue = filteredData.length * 15000;
        return new Intl.NumberFormat('en-GH', {
            style: 'currency',
            currency: 'GHS',
            maximumFractionDigits: 0
        }).format(totalValue);
    }, [filteredData]);
    const isAdmin = currentUser?.role === 'admin';
    return (_jsx("div", { className: "h-full p-8 overflow-y-auto bg-slate-50 dark:bg-[#020617]", children: _jsxs("div", { className: "max-w-7xl mx-auto space-y-8", children: [_jsxs("div", { children: [_jsxs("h2", { className: "text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3", children: [_jsx(FileSpreadsheet, { className: "w-8 h-8 text-emerald-600" }), " Lead Intelligence Reports"] }), _jsx("p", { className: "text-slate-500 dark:text-slate-400 mt-2", children: "Generate advanced Excel reports with pivot tables, and pipeline breakdowns in GHS." })] }), _jsx("div", { className: "bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm", children: _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4 items-end", children: [_jsxs("div", { className: "col-span-1", children: [_jsx("label", { className: "block text-xs font-bold text-slate-500 uppercase mb-2", children: "Start Date" }), _jsxs("div", { className: "relative", children: [_jsx(Calendar, { className: "absolute left-3 top-2.5 w-4 h-4 text-slate-400" }), _jsx("input", { type: "date", value: startDate, onChange: (e) => setStartDate(e.target.value), className: "w-full pl-9 pr-2 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500 dark:text-white" })] })] }), _jsxs("div", { className: "col-span-1", children: [_jsx("label", { className: "block text-xs font-bold text-slate-500 uppercase mb-2", children: "End Date" }), _jsxs("div", { className: "relative", children: [_jsx(Calendar, { className: "absolute left-3 top-2.5 w-4 h-4 text-slate-400" }), _jsx("input", { type: "date", value: endDate, onChange: (e) => setEndDate(e.target.value), className: "w-full pl-9 pr-2 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500 dark:text-white" })] })] }), isAdmin && teamMembers && (_jsxs("div", { className: "col-span-1", children: [_jsx("label", { className: "block text-xs font-bold text-slate-500 uppercase mb-2", children: "Team Member" }), _jsxs("div", { className: "relative", children: [_jsx(User, { className: "absolute left-3 top-2.5 w-4 h-4 text-slate-400" }), _jsxs("select", { value: userFilter, onChange: (e) => setUserFilter(e.target.value), className: "w-full pl-9 pr-2 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500 dark:text-white appearance-none", children: [_jsx("option", { value: "all", children: "All Users" }), _jsx("option", { value: currentUser.id, children: "My Leads Only" }), teamMembers.filter(m => m.id !== currentUser.id).map(member => (_jsx("option", { value: member.id, children: member.name }, member.id)))] })] })] })), _jsxs("div", { className: "col-span-1", children: [_jsx("label", { className: "block text-xs font-bold text-slate-500 uppercase mb-2", children: "Status" }), _jsxs("div", { className: "relative", children: [_jsx(Filter, { className: "absolute left-3 top-2.5 w-4 h-4 text-slate-400" }), _jsxs("select", { value: statusFilter, onChange: (e) => setStatusFilter(e.target.value), className: "w-full pl-9 pr-2 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500 dark:text-white appearance-none", children: [_jsx("option", { value: "all", children: "All Statuses" }), _jsx("option", { value: "new", children: "New" }), _jsx("option", { value: "contacted", children: "Contacted" }), _jsx("option", { value: "qualified", children: "Qualified" }), _jsx("option", { value: "negotiation", children: "Negotiation" }), _jsx("option", { value: "won", children: "Closed Won" }), _jsx("option", { value: "lost", children: "Lost" })] })] })] }), _jsxs("div", { className: "col-span-1", children: [_jsx("label", { className: "block text-xs font-bold text-slate-500 uppercase mb-2", children: "Industry" }), _jsxs("div", { className: "relative", children: [_jsx(Building2, { className: "absolute left-3 top-2.5 w-4 h-4 text-slate-400" }), _jsxs("select", { value: industryFilter, onChange: (e) => setIndustryFilter(e.target.value), className: "w-full pl-9 pr-2 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500 dark:text-white appearance-none", children: [_jsx("option", { value: "all", children: "All Industries" }), availableIndustries.map(ind => _jsx("option", { value: ind, children: ind }, ind))] })] })] }), _jsxs("div", { className: "col-span-1", children: [_jsx("label", { className: "block text-xs font-bold text-slate-500 uppercase mb-2", children: "Location" }), _jsxs("div", { className: "relative", children: [_jsx(MapPin, { className: "absolute left-3 top-2.5 w-4 h-4 text-slate-400" }), _jsxs("select", { value: locationFilter, onChange: (e) => setLocationFilter(e.target.value), className: "w-full pl-9 pr-2 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500 dark:text-white appearance-none", children: [_jsx("option", { value: "all", children: "All Locations" }), availableLocations.map(loc => _jsx("option", { value: loc, children: loc }, loc))] })] })] }), _jsxs("button", { onClick: handleGenerate, className: "col-span-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-transform active:scale-95 h-[40px] whitespace-nowrap", children: [_jsx(Download, { className: "w-4 h-4" }), " Download"] })] }) }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-6", children: [_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm text-slate-500", children: "Selected Leads" }), _jsx("h3", { className: "text-3xl font-bold text-slate-900 dark:text-white", children: filteredData.length })] }), _jsx("div", { className: "p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg", children: _jsx(Filter, { className: "w-6 h-6 text-indigo-600 dark:text-indigo-400" }) })] }), _jsxs("div", { className: "bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm text-slate-500", children: "Pipeline Value (Est)" }), _jsx("h3", { className: "text-3xl font-bold text-emerald-600 dark:text-emerald-400", children: pipelineValue })] }), _jsx("div", { className: "p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg", children: _jsx(TrendingUp, { className: "w-6 h-6 text-emerald-600 dark:text-emerald-400" }) })] })] }), _jsxs("div", { className: "bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col", children: [_jsxs("h3", { className: "font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2", children: [_jsx(PieChart, { className: "w-4 h-4 text-purple-500" }), " Status Breakdown"] }), _jsx("div", { className: "flex-1 min-h-[200px]", children: _jsx(ResponsiveContainer, { width: "100%", height: "100%", children: _jsxs(RePieChart, { children: [_jsx(Pie, { data: statusData, dataKey: "value", nameKey: "name", cx: "50%", cy: "50%", innerRadius: 50, outerRadius: 80, paddingAngle: 5, children: statusData.map((entry, index) => (_jsx(Cell, { fill: COLORS[index % COLORS.length] }, `cell-${index}`))) }), _jsx(Tooltip, { contentStyle: { backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff', borderRadius: '8px' } }), _jsx(Legend, { verticalAlign: "bottom", height: 36 })] }) }) })] }), _jsxs("div", { className: "bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col", children: [_jsxs("h3", { className: "font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2", children: [_jsx(BarChart3, { className: "w-4 h-4 text-blue-500" }), " Top Industries"] }), _jsx("div", { className: "flex-1 min-h-[200px]", children: _jsx(ResponsiveContainer, { width: "100%", height: "100%", children: _jsxs(BarChart, { data: industryData, layout: "vertical", margin: { left: 20 }, children: [_jsx(CartesianGrid, { strokeDasharray: "3 3", horizontal: false, stroke: "#334155", opacity: 0.1 }), _jsx(XAxis, { type: "number", hide: true }), _jsx(YAxis, { dataKey: "name", type: "category", width: 90, tick: { fontSize: 10 } }), _jsx(Tooltip, { cursor: { fill: 'transparent' }, contentStyle: { backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff', borderRadius: '8px' } }), _jsx(Bar, { dataKey: "value", fill: "#3b82f6", radius: [0, 4, 4, 0], barSize: 20 })] }) }) })] })] })] }) }));
}
