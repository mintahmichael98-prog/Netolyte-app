import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useState, useEffect } from 'react';
import { authService } from '../services/authService';
import { Users, UserPlus, Trash2, Eye } from 'lucide-react';
import toast from 'react-hot-toast';
export default function TeamManagement({ currentUser, onViewAs, viewingAsId, leads }) {
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteRole, setInviteRole] = useState('user');
    const [showInviteForm, setShowInviteForm] = useState(false);
    useEffect(() => {
        loadTeam();
    }, []);
    const loadTeam = async () => {
        try {
            const team = await authService.getTeamMembers();
            setMembers(team);
        }
        catch (e) {
            toast.error("Failed to load team");
        }
        finally {
            setLoading(false);
        }
    };
    const handleInvite = async (e) => {
        e.preventDefault();
        if (!inviteEmail)
            return;
        const toastId = toast.loading("Sending invitation...");
        try {
            // Cast role to 'admin' | 'member' if needed by service, but usually we sync types.
            // Here assuming authService accepts the string or we adjust.
            // For mock service, we'll just pass it.
            await authService.inviteMember(inviteEmail, inviteRole);
            toast.success(`Invited ${inviteEmail}`, { id: toastId });
            setInviteEmail('');
            setShowInviteForm(false);
            loadTeam();
        }
        catch (err) {
            toast.error("Failed to invite", { id: toastId });
        }
    };
    // Calculate stats per member from the global leads list
    const getMemberStats = (userId) => {
        const userLeads = leads.filter(l => l.ownerId === userId);
        return {
            total: userLeads.length,
            value: userLeads.length * 15000 // Estimated GHS value
        };
    };
    if (loading)
        return _jsx("div", { className: "p-8 text-center text-slate-500", children: "Loading Team..." });
    return (_jsx("div", { className: "h-full p-8 overflow-y-auto bg-slate-50 dark:bg-[#020617]", children: _jsxs("div", { className: "max-w-6xl mx-auto space-y-8", children: [_jsxs("div", { className: "flex justify-between items-end", children: [_jsxs("div", { children: [_jsxs("h2", { className: "text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3", children: [_jsx(Users, { className: "w-8 h-8 text-indigo-600" }), " Team Management"] }), _jsx("p", { className: "text-slate-500 dark:text-slate-400 mt-2", children: "Manage your team members, assign roles, and view their performance." })] }), _jsxs("button", { onClick: () => setShowInviteForm(!showInviteForm), className: "px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold flex items-center gap-2 transition-colors", children: [_jsx(UserPlus, { className: "w-4 h-4" }), " Invite Member"] })] }), showInviteForm && (_jsxs("div", { className: "bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-lg animate-slide-down", children: [_jsx("h3", { className: "font-bold text-slate-900 dark:text-white mb-4", children: "Invite New User" }), _jsxs("form", { onSubmit: handleInvite, className: "flex gap-4 items-end", children: [_jsxs("div", { className: "flex-1", children: [_jsx("label", { className: "block text-xs font-bold text-slate-500 uppercase mb-2", children: "Email Address" }), _jsx("input", { type: "email", value: inviteEmail, onChange: e => setInviteEmail(e.target.value), placeholder: "colleague@company.com", className: "w-full px-4 py-2 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white", required: true })] }), _jsxs("div", { className: "w-48", children: [_jsx("label", { className: "block text-xs font-bold text-slate-500 uppercase mb-2", children: "Role" }), _jsxs("select", { value: inviteRole, onChange: e => setInviteRole(e.target.value), className: "w-full px-4 py-2 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white cursor-pointer", children: [_jsx("option", { value: "user", children: "Member" }), _jsx("option", { value: "admin", children: "Admin" })] })] }), _jsx("button", { type: "submit", className: "px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold", children: "Send Invite" })] })] })), _jsx("div", { className: "grid grid-cols-1 gap-4", children: members.map(member => {
                        const stats = getMemberStats(member.id);
                        const isMe = member.email === currentUser.email;
                        return (_jsxs("div", { className: "bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between group hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors", children: [_jsxs("div", { className: "flex items-center gap-4", children: [_jsx("div", { className: "w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-xl font-bold text-indigo-700 dark:text-indigo-300", children: member.name ? member.name.charAt(0).toUpperCase() : 'U' }), _jsxs("div", { children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsxs("h3", { className: "font-bold text-slate-900 dark:text-white", children: [member.name, " ", isMe && '(You)'] }), _jsx("span", { className: `px-2 py-0.5 rounded text-[10px] font-bold uppercase ${member.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-600'}`, children: member.role })] }), _jsx("p", { className: "text-sm text-slate-500", children: member.email })] })] }), _jsxs("div", { className: "flex items-center gap-8", children: [_jsxs("div", { className: "text-right hidden sm:block", children: [_jsx("p", { className: "text-xs text-slate-400 font-bold uppercase", children: "Leads Generated" }), _jsx("p", { className: "text-lg font-bold text-slate-900 dark:text-white", children: stats.total })] }), _jsxs("div", { className: "text-right hidden sm:block", children: [_jsx("p", { className: "text-xs text-slate-400 font-bold uppercase", children: "Pipeline Value" }), _jsx("p", { className: "text-lg font-bold text-emerald-600", children: new Intl.NumberFormat('en-GH', { style: 'currency', currency: 'GHS', maximumFractionDigits: 0 }).format(stats.value) })] }), currentUser.role === 'admin' && (_jsxs("div", { className: "flex gap-2 pl-4 border-l border-slate-200 dark:border-slate-700", children: [_jsx("button", { onClick: () => onViewAs(member.id === viewingAsId ? null : member.id), className: `p-2 rounded-lg transition-colors border ${viewingAsId === member.id
                                                        ? 'bg-indigo-600 text-white border-indigo-600'
                                                        : 'bg-white dark:bg-slate-700 text-slate-500 hover:text-indigo-600 border-slate-200 dark:border-slate-600'}`, title: viewingAsId === member.id ? "Stop viewing" : "View Dashboard as this user", children: _jsx(Eye, { className: "w-4 h-4" }) }), !isMe && (_jsx("button", { className: "p-2 bg-white dark:bg-slate-700 text-slate-400 hover:text-red-500 rounded-lg border border-slate-200 dark:border-slate-600 transition-colors", children: _jsx(Trash2, { className: "w-4 h-4" }) }))] }))] })] }, member.id));
                    }) })] }) }));
}
