import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import React, { useState } from 'react';
import { Plus, Mail, Phone, Linkedin, CheckSquare, Trash2, Save, Play, Clock, Layout } from 'lucide-react';
import toast from 'react-hot-toast';
export default function SequenceBuilder({ sequences, onSaveSequence }) {
    const [activeSeq, setActiveSeq] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const handleCreateNew = () => {
        const newSeq = {
            id: Date.now().toString(),
            name: 'New Campaign',
            activeLeads: 0,
            steps: [
                { id: '1', day: 1, type: 'email', title: 'Intro Email', content: 'Hi {{name}}, ...' },
                { id: '2', day: 3, type: 'linkedin', title: 'Connection Request', content: '' },
            ]
        };
        setActiveSeq(newSeq);
        setIsEditing(true);
    };
    const handleAddStep = (type) => {
        if (!activeSeq)
            return;
        const lastDay = activeSeq.steps.length > 0 ? activeSeq.steps[activeSeq.steps.length - 1].day : 0;
        const newStep = {
            id: Date.now().toString(),
            day: lastDay + 2,
            type,
            title: type === 'email' ? 'Follow Up' : type === 'call' ? 'Quick Call' : type === 'linkedin' ? 'Message' : 'Task',
            content: ''
        };
        setActiveSeq({ ...activeSeq, steps: [...activeSeq.steps, newStep] });
    };
    const handleSave = () => {
        if (activeSeq) {
            onSaveSequence(activeSeq);
            setIsEditing(false);
            toast.success('Sequence saved successfully');
        }
    };
    const getIcon = (type) => {
        switch (type) {
            case 'email': return _jsx(Mail, { className: "w-4 h-4 text-blue-500" });
            case 'call': return _jsx(Phone, { className: "w-4 h-4 text-green-500" });
            case 'linkedin': return _jsx(Linkedin, { className: "w-4 h-4 text-[#0077b5]" });
            default: return _jsx(CheckSquare, { className: "w-4 h-4 text-slate-500" });
        }
    };
    return (_jsxs("div", { className: "h-full flex flex-col md:flex-row bg-slate-50 dark:bg-[#020617] overflow-hidden", children: [_jsxs("div", { className: "w-full md:w-80 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 flex flex-col", children: [_jsxs("div", { className: "p-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center", children: [_jsxs("h2", { className: "font-bold text-slate-900 dark:text-white flex items-center gap-2", children: [_jsx(Layout, { className: "w-5 h-5 text-indigo-600" }), " Campaigns"] }), _jsx("button", { onClick: handleCreateNew, className: "p-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg hover:bg-indigo-100 transition-colors", children: _jsx(Plus, { className: "w-5 h-5" }) })] }), _jsxs("div", { className: "flex-1 overflow-y-auto p-4 space-y-3", children: [sequences.length === 0 && !activeSeq && (_jsxs("div", { className: "text-center py-10 text-slate-400 text-sm", children: ["No sequences yet.", _jsx("br", {}), "Create one to start automating."] })), sequences.map(seq => (_jsxs("div", { onClick: () => { setActiveSeq(seq); setIsEditing(false); }, className: `p-4 rounded-xl border cursor-pointer transition-all ${activeSeq?.id === seq.id
                                    ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800 shadow-sm'
                                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-indigo-300'}`, children: [_jsxs("div", { className: "flex justify-between items-start mb-2", children: [_jsx("h3", { className: "font-bold text-slate-900 dark:text-white", children: seq.name }), _jsxs("span", { className: `text-[10px] px-2 py-0.5 rounded-full ${seq.activeLeads > 0 ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`, children: [seq.activeLeads, " active"] })] }), _jsxs("div", { className: "flex items-center gap-2 text-xs text-slate-500", children: [_jsx(Clock, { className: "w-3 h-3" }), " ", seq.steps.length, " Steps", _jsx("span", { children: "\u2022" }), _jsxs("span", { children: [(seq.steps[seq.steps.length - 1]?.day || 1) - 1, " Days duration"] })] })] }, seq.id)))] })] }), _jsx("div", { className: "flex-1 flex flex-col h-full overflow-hidden relative", children: activeSeq ? (_jsxs(_Fragment, { children: [_jsxs("div", { className: "h-16 px-8 flex items-center justify-between bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700", children: [isEditing ? (_jsx("input", { value: activeSeq.name, onChange: (e) => setActiveSeq({ ...activeSeq, name: e.target.value }), className: "text-xl font-bold bg-transparent border-b border-indigo-300 focus:outline-none text-slate-900 dark:text-white", autoFocus: true })) : (_jsx("h2", { className: "text-xl font-bold text-slate-900 dark:text-white", children: activeSeq.name })), _jsx("div", { className: "flex gap-2", children: isEditing ? (_jsxs("button", { onClick: handleSave, className: "flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors shadow-sm", children: [_jsx(Save, { className: "w-4 h-4" }), " Save Sequence"] })) : (_jsx("button", { onClick: () => setIsEditing(true), className: "px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg font-medium transition-colors", children: "Edit" })) })] }), _jsx("div", { className: "flex-1 overflow-y-auto p-8 bg-slate-50 dark:bg-[#020617] bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px]", children: _jsxs("div", { className: "max-w-3xl mx-auto space-y-8 pb-20", children: [_jsxs("div", { className: "flex items-center gap-4", children: [_jsx("div", { className: "w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/30 z-10", children: _jsx(Play, { className: "w-6 h-6 text-white ml-1" }) }), _jsxs("div", { className: "bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm", children: [_jsx("p", { className: "font-bold text-slate-900 dark:text-white", children: "Enrollment Trigger" }), _jsx("p", { className: "text-xs text-slate-500", children: "When lead is added to sequence" })] })] }), _jsx("div", { className: "absolute left-[calc(50%-1px)] top-20 bottom-0 w-0.5 bg-slate-200 dark:bg-slate-800 -z-0 hidden md:block" }), activeSeq.steps.map((step, idx) => (_jsx("div", { className: "relative group animate-slide-up", style: { animationDelay: `${idx * 100}ms` }, children: _jsxs("div", { className: "flex items-start gap-4", children: [_jsxs("div", { className: "flex flex-col items-center gap-2 mt-4 min-w-[3rem]", children: [_jsxs("div", { className: "text-[10px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full border border-slate-200 dark:border-slate-700 z-10", children: ["Day ", step.day] }), _jsx("div", { className: "w-3 h-3 rounded-full bg-slate-300 dark:bg-slate-600 z-10" })] }), _jsxs("div", { className: "flex-1 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm group-hover:shadow-md transition-all p-5 relative", children: [isEditing && (_jsx("button", { onClick: () => setActiveSeq({ ...activeSeq, steps: activeSeq.steps.filter(s => s.id !== step.id) }), className: "absolute top-4 right-4 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity", children: _jsx(Trash2, { className: "w-4 h-4" }) })), _jsxs("div", { className: "flex items-center gap-3 mb-3", children: [_jsx("div", { className: "p-2 bg-slate-100 dark:bg-slate-700/50 rounded-lg", children: getIcon(step.type) }), _jsxs("div", { children: [isEditing ? (_jsx("input", { value: step.title, onChange: (e) => {
                                                                                const newSteps = [...activeSeq.steps];
                                                                                newSteps[idx].title = e.target.value;
                                                                                setActiveSeq({ ...activeSeq, steps: newSteps });
                                                                            }, className: "font-bold text-slate-900 dark:text-white bg-transparent outline-none border-b border-transparent focus:border-indigo-500 w-full" })) : (_jsx("h4", { className: "font-bold text-slate-900 dark:text-white", children: step.title })), _jsxs("p", { className: "text-xs text-slate-500 capitalize", children: [step.type, " Task"] })] })] }), step.type === 'email' && (_jsx("div", { className: "bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg border border-slate-100 dark:border-slate-700/50", children: isEditing ? (_jsx("textarea", { value: step.content, onChange: (e) => {
                                                                    const newSteps = [...activeSeq.steps];
                                                                    newSteps[idx].content = e.target.value;
                                                                    setActiveSeq({ ...activeSeq, steps: newSteps });
                                                                }, className: "w-full bg-transparent text-sm text-slate-600 dark:text-slate-300 outline-none resize-none h-20", placeholder: "Email body template..." })) : (_jsx("p", { className: "text-sm text-slate-600 dark:text-slate-300 line-clamp-3", children: step.content || 'No content template set.' })) }))] })] }) }, step.id))), isEditing && (_jsxs("div", { className: "flex justify-center gap-3 pt-4 pb-12", children: [_jsxs("button", { onClick: () => handleAddStep('email'), className: "flex flex-col items-center gap-2 p-4 bg-white dark:bg-slate-800 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500 hover:text-indigo-500 transition-colors w-24", children: [_jsx(Mail, { className: "w-6 h-6" }), _jsx("span", { className: "text-xs font-bold", children: "Email" })] }), _jsxs("button", { onClick: () => handleAddStep('call'), className: "flex flex-col items-center gap-2 p-4 bg-white dark:bg-slate-800 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 hover:border-green-500 hover:text-green-500 transition-colors w-24", children: [_jsx(Phone, { className: "w-6 h-6" }), _jsx("span", { className: "text-xs font-bold", children: "Call" })] }), _jsxs("button", { onClick: () => handleAddStep('linkedin'), className: "flex flex-col items-center gap-2 p-4 bg-white dark:bg-slate-800 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 hover:border-[#0077b5] hover:text-[#0077b5] transition-colors w-24", children: [_jsx(Linkedin, { className: "w-6 h-6" }), _jsx("span", { className: "text-xs font-bold", children: "LinkedIn" })] })] }))] }) })] })) : (_jsxs("div", { className: "flex-1 flex flex-col items-center justify-center text-center p-8", children: [_jsx("div", { className: "w-20 h-20 bg-indigo-50 dark:bg-indigo-900/20 rounded-full flex items-center justify-center mb-6", children: _jsx(Layout, { className: "w-10 h-10 text-indigo-600 dark:text-indigo-400" }) }), _jsx("h3", { className: "text-2xl font-bold text-slate-900 dark:text-white mb-2", children: "Select a Campaign" }), _jsx("p", { className: "text-slate-500 dark:text-slate-400 max-w-sm", children: "Design multi-step outreach workflows to automate your follow-ups and increase conversion rates." }), _jsx("button", { onClick: handleCreateNew, className: "mt-8 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg hover:shadow-indigo-500/20 transition-all hover:-translate-y-1", children: "Create New Sequence" })] })) })] }));
}
