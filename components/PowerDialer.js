import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import React, { useState, useEffect, useRef } from 'react';
import { Phone, User, CheckCircle2, XCircle, Voicemail, Save, Play, PhoneOff, ArrowLeft, AlertTriangle, Mic, Volume2, LayoutGrid, Activity, Sparkles } from 'lucide-react';
import CallScriptGenerator from './CallScriptGenerator';
import { generateCallAnalysis } from '../services/geminiService';
import toast from 'react-hot-toast';
// Simulated conversation snippets for the "Real-Time" effect
const SIMULATED_RESPONSES = [
    "Hello, this is {name}.",
    "Hi there, who is calling?",
    "I'm actually in a meeting right now.",
    "We are currently looking for solutions like that.",
    "Can you send me some information via email?",
    "How does your pricing compare to competitors?",
    "I'm not the right person, you should talk to IT.",
    "Interesting, tell me more about the AI features.",
    "We don't have budget for this quarter.",
    "Okay, let's schedule a follow-up next Tuesday."
];
export default function PowerDialer({ leads, onUpdateLead, onExit }) {
    const callQueue = leads.filter(l => !l.isPhoneInvalid &&
        l.status !== 'bad_data' &&
        l.status !== 'won' &&
        (/[0-9]/.test(l.contact) || l.socials?.whatsapp));
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isSessionActive, setIsSessionActive] = useState(false);
    const [isCallActive, setIsCallActive] = useState(false);
    const [callDuration, setCallDuration] = useState(0);
    const [outcomeMode, setOutcomeMode] = useState(false);
    const [callNotes, setCallNotes] = useState('');
    const [selectedNextStatus, setSelectedNextStatus] = useState(null);
    const [dialMode, setDialMode] = useState('voip');
    // Real-time Intelligence State
    const [transcript, setTranscript] = useState([]);
    const [isMuted, setIsMuted] = useState(false);
    const [showKeypad, setShowKeypad] = useState(false);
    const [keypadNumber, setKeypadNumber] = useState('');
    // Post-Call Analysis State
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [callAnalysis, setCallAnalysis] = useState(null);
    const currentLead = callQueue[currentIndex];
    const timerRef = useRef(null);
    const transcriptIntervalRef = useRef(null);
    const transcriptEndRef = useRef(null);
    // Timer Logic
    useEffect(() => {
        if (isCallActive) {
            timerRef.current = setInterval(() => {
                setCallDuration(prev => prev + 1);
            }, 1000);
            // Simulate live transcription if in VoIP mode
            if (dialMode === 'voip') {
                startSimulation();
            }
        }
        else {
            clearInterval(timerRef.current);
            clearInterval(transcriptIntervalRef.current);
        }
        return () => {
            clearInterval(timerRef.current);
            clearInterval(transcriptIntervalRef.current);
        };
    }, [isCallActive, dialMode]);
    // Auto-scroll transcript
    useEffect(() => {
        transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [transcript]);
    const startSimulation = () => {
        let step = 0;
        setTranscript([]);
        const name = currentLead.management?.[0]?.name.split(' ')[0] || 'Prospect';
        transcriptIntervalRef.current = setInterval(() => {
            if (Math.random() > 0.6) {
                const text = SIMULATED_RESPONSES[Math.floor(Math.random() * SIMULATED_RESPONSES.length)].replace('{name}', name);
                const speaker = Math.random() > 0.5 ? 'prospect' : 'agent'; // Simulate both sides randomly
                setTranscript(prev => [...prev, {
                        speaker: speaker,
                        text: speaker === 'agent' ? "Yes, exactly. We help with that." : text, // Simple filler for agent
                        timestamp: Date.now()
                    }]);
            }
        }, 3500);
    };
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };
    const startCall = (mode) => {
        if (!currentLead)
            return;
        setDialMode(mode);
        setIsCallActive(true);
        setCallDuration(0);
        setTranscript([]);
        setCallAnalysis(null);
        toast.success(`Dialing ${currentLead.company} via ${mode === 'voip' ? 'Cloud Voice' : 'Cellular'}...`);
        if (mode === 'phone') {
            const num = currentLead.contact.replace(/[^0-9+]/g, '');
            window.location.href = `tel:${num}`;
        }
    };
    const endCall = async () => {
        setIsCallActive(false);
        setOutcomeMode(true);
        // Trigger AI Analysis automatically if we have data
        if (transcript.length > 0 || callNotes.length > 10) {
            setIsAnalyzing(true);
            try {
                const analysis = await generateCallAnalysis(transcript, callNotes);
                setCallAnalysis(analysis);
            }
            catch (e) {
                console.error(e);
            }
            finally {
                setIsAnalyzing(false);
            }
        }
    };
    const handleOutcome = (outcome) => {
        if (!currentLead)
            return;
        const timestamp = new Date().toISOString();
        const newLog = {
            id: Date.now().toString(),
            timestamp,
            outcome,
            notes: callNotes,
            durationSeconds: callDuration,
            user: 'You',
            analysis: callAnalysis || undefined
        };
        const activityItem = {
            id: `call_${Date.now()}`,
            type: 'call_log',
            content: `Call logged: ${outcome.toUpperCase().replace('_', ' ')} (${formatTime(callDuration)})`,
            author: 'You',
            timestamp,
            metadata: { outcome }
        };
        let updates = {
            callLogs: [...(currentLead.callLogs || []), newLog],
            activity: [activityItem, ...(currentLead.activity || [])],
            lastContacted: timestamp,
            callCount: (currentLead.callCount || 0) + 1
        };
        if (outcome === 'answered') {
            if (selectedNextStatus)
                updates.status = selectedNextStatus;
            else
                updates.status = 'contacted';
            toast.success("Call logged: Answered");
        }
        else if (outcome === 'voicemail') {
            updates.status = 'attempted';
            toast("Logged: Voicemail. Rescheduled.");
        }
        else if (outcome === 'wrong_number') {
            updates.isPhoneInvalid = true;
            updates.status = 'bad_data';
            toast.error("Marked as Invalid Number");
        }
        else if (outcome === 'skipped') {
            toast("Skipped lead");
            updates.callCount = (currentLead.callCount || 0);
        }
        onUpdateLead({ ...currentLead, ...updates });
        advanceQueue();
    };
    const advanceQueue = () => {
        setOutcomeMode(false);
        setCallNotes('');
        setSelectedNextStatus(null);
        setCallDuration(0);
        setTranscript([]);
        setCallAnalysis(null);
        if (currentIndex < callQueue.length - 1) {
            setCurrentIndex(prev => prev + 1);
        }
        else {
            setIsSessionActive(false);
            toast.success("All leads in queue processed!");
        }
    };
    const handleKeypadPress = (digit) => {
        setKeypadNumber(prev => prev + digit);
        // Play DTMF tone sound effect here if needed
    };
    if (!isSessionActive) {
        return (_jsx("div", { className: "h-full flex flex-col items-center justify-center bg-slate-50 dark:bg-[#020617] p-8 animate-fade-in", children: _jsxs("div", { className: "bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-xl max-w-lg w-full text-center border border-slate-200 dark:border-slate-700", children: [_jsx("div", { className: "w-20 h-20 bg-indigo-100 dark:bg-indigo-900/50 rounded-full flex items-center justify-center mx-auto mb-6", children: _jsx(Phone, { className: "w-10 h-10 text-indigo-600 dark:text-indigo-400" }) }), _jsx("h2", { className: "text-3xl font-bold text-slate-900 dark:text-white mb-2", children: "Power Dialer" }), _jsxs("p", { className: "text-slate-500 dark:text-slate-400 mb-8", children: ["You have ", _jsx("span", { className: "font-bold text-indigo-600", children: callQueue.length }), " leads queued for calling. The system will guide you through each call sequentially with real-time AI assistance."] }), callQueue.length > 0 ? (_jsxs("div", { className: "space-y-4", children: [_jsxs("button", { onClick: () => setIsSessionActive(true), className: "w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-lg shadow-lg transition-transform hover:scale-[1.02] flex items-center justify-center gap-2", children: [_jsx(Play, { className: "w-5 h-5 fill-current" }), " Start Session"] }), _jsx("button", { onClick: onExit, className: "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 text-sm font-medium", children: "Cancel and go back" })] })) : (_jsxs("div", { children: [_jsxs("div", { className: "p-4 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 rounded-xl mb-6 flex items-center gap-2 text-left text-sm", children: [_jsx(AlertTriangle, { className: "w-5 h-5 flex-shrink-0" }), "No valid, un-called leads found in your current list. Try generating new leads or resetting statuses."] }), _jsx("button", { onClick: onExit, className: "px-6 py-2 bg-slate-200 dark:bg-slate-700 rounded-lg font-medium text-slate-700 dark:text-white", children: "Go Back" })] }))] }) }));
    }
    if (currentIndex >= callQueue.length) {
        return (_jsx("div", { className: "h-full flex flex-col items-center justify-center bg-slate-50 dark:bg-[#020617] p-8 animate-fade-in", children: _jsxs("div", { className: "text-center", children: [_jsx(CheckCircle2, { className: "w-24 h-24 text-emerald-500 mx-auto mb-6" }), _jsx("h2", { className: "text-4xl font-bold text-slate-900 dark:text-white mb-2", children: "Session Complete!" }), _jsx("p", { className: "text-lg text-slate-500 dark:text-slate-400 mb-8", children: "You have processed all leads in the queue." }), _jsx("button", { onClick: onExit, className: "px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold", children: "Return to Dashboard" })] }) }));
    }
    return (_jsxs("div", { className: "h-full flex flex-col bg-slate-50 dark:bg-[#020617]", children: [_jsxs("div", { className: "h-16 px-6 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center shrink-0", children: [_jsxs("div", { className: "flex items-center gap-4", children: [_jsx("button", { onClick: onExit, className: "p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full", title: "Exit Dialer", children: _jsx(ArrowLeft, { className: "w-5 h-5 text-slate-500" }) }), _jsxs("div", { children: [_jsx("h3", { className: "font-bold text-slate-900 dark:text-white", children: "Session in Progress" }), _jsxs("p", { className: "text-xs text-slate-500", children: ["Lead ", currentIndex + 1, " of ", callQueue.length] })] })] }), _jsxs("div", { className: `px-4 py-1 rounded-full font-mono font-bold flex items-center gap-2 transition-colors ${isCallActive ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'}`, children: [isCallActive && _jsx("div", { className: "w-2 h-2 rounded-full bg-green-500 animate-pulse" }), formatTime(callDuration)] })] }), _jsxs("div", { className: "flex-1 flex overflow-hidden", children: [_jsx("div", { className: "w-1/2 p-6 overflow-y-auto border-r border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900", children: _jsxs("div", { className: "max-w-xl mx-auto space-y-6", children: [_jsxs("div", { className: "flex items-start gap-4", children: [_jsx("div", { className: "w-16 h-16 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-2xl font-bold text-indigo-600 dark:text-indigo-400 border border-slate-200 dark:border-slate-700", children: currentLead.company.charAt(0) }), _jsxs("div", { children: [_jsx("h1", { className: "text-3xl font-bold text-slate-900 dark:text-white leading-tight", children: currentLead.company }), _jsxs("div", { className: "flex gap-2 mt-2", children: [_jsx("span", { className: "px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-medium text-slate-600 dark:text-slate-300", children: currentLead.industry }), _jsx("span", { className: "px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-medium text-slate-600 dark:text-slate-300", children: currentLead.location })] })] })] }), _jsxs("div", { className: "bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 space-y-4", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx(User, { className: "w-5 h-5 text-slate-400" }), _jsxs("div", { children: [_jsx("p", { className: "text-sm text-slate-500 dark:text-slate-400", children: "Decision Maker" }), _jsx("p", { className: "font-semibold text-slate-900 dark:text-white", children: currentLead.management?.[0]?.name || 'Unknown' }), _jsx("p", { className: "text-xs text-indigo-600 dark:text-indigo-400", children: currentLead.management?.[0]?.role })] })] }), _jsxs("div", { className: "flex items-center gap-3", children: [_jsx(Phone, { className: "w-5 h-5 text-slate-400" }), _jsxs("div", { children: [_jsx("p", { className: "text-sm text-slate-500 dark:text-slate-400", children: "Phone" }), _jsx("p", { className: "font-mono text-lg font-bold text-slate-900 dark:text-white tracking-wide", children: currentLead.contact.replace(/[^0-9+]/g, '') || 'No direct number' })] })] })] }), _jsx("div", { className: "bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden", children: _jsx(CallScriptGenerator, { lead: currentLead }) })] }) }), _jsx("div", { className: "w-1/2 p-6 flex flex-col bg-slate-50 dark:bg-[#020617] overflow-y-auto", children: _jsx("div", { className: "flex-1 max-w-xl mx-auto w-full flex flex-col h-full", children: !outcomeMode ? (_jsxs(_Fragment, { children: [_jsxs("div", { className: "flex-1 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm mb-6 flex flex-col overflow-hidden relative", children: [_jsxs("div", { className: "p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50", children: [_jsxs("h3", { className: "font-bold text-slate-900 dark:text-white flex items-center gap-2", children: [_jsx(Activity, { className: "w-4 h-4 text-emerald-500" }), " Live Intelligence"] }), _jsx("span", { className: "text-[10px] uppercase font-bold text-slate-400 tracking-wider", children: isCallActive ? 'Listening...' : 'Ready' })] }), _jsxs("div", { className: "flex-1 overflow-y-auto p-4 space-y-3", children: [transcript.length === 0 && (_jsx("div", { className: "text-center text-slate-400 text-sm mt-10", children: isCallActive ? 'Waiting for speech...' : 'Start call to activate live transcription' })), transcript.map((line, idx) => (_jsx("div", { className: `flex ${line.speaker === 'agent' ? 'justify-end' : 'justify-start'}`, children: _jsxs("div", { className: `max-w-[85%] p-3 rounded-2xl text-sm ${line.speaker === 'agent'
                                                                ? 'bg-indigo-50 text-indigo-900 dark:bg-indigo-900/30 dark:text-indigo-200 rounded-br-sm'
                                                                : 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200 rounded-bl-sm'}`, children: [_jsx("p", { className: "text-[10px] opacity-70 mb-1 capitalize font-bold", children: line.speaker }), line.text] }) }, idx))), _jsx("div", { ref: transcriptEndRef })] }), _jsx("div", { className: "p-4 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800", children: _jsx("input", { value: callNotes, onChange: (e) => setCallNotes(e.target.value), placeholder: "Type quick notes here...", className: "w-full bg-slate-100 dark:bg-slate-900 border-none rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white" }) })] }), showKeypad && (_jsxs("div", { className: "absolute bottom-24 right-8 bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 z-20 animate-slide-up", children: [_jsx("div", { className: "mb-4 bg-slate-100 dark:bg-slate-900 p-3 rounded-lg text-center text-xl font-mono font-bold dark:text-white min-w-[200px] min-h-[50px] flex items-center justify-center", children: keypadNumber }), _jsx("div", { className: "grid grid-cols-3 gap-2", children: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'].map(key => (_jsx("button", { onClick: () => handleKeypadPress(key), className: "w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 font-bold text-lg flex items-center justify-center transition-colors", children: key }, key))) }), _jsx("button", { onClick: () => setShowKeypad(false), className: "mt-4 w-full text-xs text-slate-500 hover:text-slate-700", children: "Hide Keypad" })] })), _jsx("div", { className: "mt-auto shrink-0", children: !isCallActive ? (_jsxs("div", { className: "grid grid-cols-2 gap-3", children: [_jsxs("button", { onClick: () => startCall('voip'), className: "py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold text-lg shadow-xl hover:shadow-indigo-500/20 transition-all flex flex-col items-center justify-center gap-1", children: [_jsx(Phone, { className: "w-6 h-6 fill-current" }), _jsx("span", { className: "text-xs font-normal opacity-80", children: "Browser Call" })] }), _jsxs("button", { onClick: () => startCall('phone'), className: "py-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-indigo-500 text-slate-700 dark:text-slate-200 rounded-2xl font-bold text-lg shadow-sm transition-all flex flex-col items-center justify-center gap-1", children: [_jsx(Phone, { className: "w-6 h-6" }), _jsx("span", { className: "text-xs font-normal opacity-80 text-slate-500", children: "Cellular / App" })] }), _jsx("button", { onClick: () => handleOutcome('skipped'), className: "col-span-2 py-3 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 font-medium", children: "Skip this lead" })] })) : (_jsxs("div", { className: "flex items-center gap-4", children: [_jsx("button", { onClick: () => setIsMuted(!isMuted), className: `p-4 rounded-full transition-colors ${isMuted ? 'bg-white text-slate-900' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`, children: isMuted ? _jsx(Volume2, { className: "w-6 h-6" }) : _jsx(Mic, { className: "w-6 h-6" }) }), _jsxs("button", { onClick: () => endCall(), className: "flex-1 py-4 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-bold text-xl shadow-xl hover:shadow-red-500/20 transition-all flex items-center justify-center gap-3 animate-pulse", children: [_jsx(PhoneOff, { className: "w-6 h-6 fill-current" }), " End Call"] }), _jsx("button", { onClick: () => setShowKeypad(!showKeypad), className: `p-4 rounded-full transition-colors ${showKeypad ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`, children: _jsx(LayoutGrid, { className: "w-6 h-6" }) })] })) })] })) : (_jsxs("div", { className: "bg-white dark:bg-slate-800 p-8 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-lg flex-1 flex flex-col animate-scale-in", children: [_jsxs("div", { className: "flex justify-between items-start mb-6", children: [_jsx("h3", { className: "text-xl font-bold text-slate-900 dark:text-white", children: "Call Report" }), isAnalyzing ? (_jsxs("span", { className: "flex items-center gap-2 text-indigo-600 text-sm font-medium animate-pulse", children: [_jsx(Sparkles, { className: "w-4 h-4" }), " AI Analyzing..."] })) : callAnalysis && (_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "text-sm text-slate-500", children: "Confidence Score:" }), _jsxs("div", { className: `px-3 py-1 rounded-full text-sm font-bold ${callAnalysis.confidenceScore > 70 ? 'bg-green-100 text-green-700' :
                                                            callAnalysis.confidenceScore > 40 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`, children: [callAnalysis.confidenceScore, "/100"] })] }))] }), callAnalysis ? (_jsxs("div", { className: "mb-6 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-100 dark:border-indigo-800/50 space-y-4", children: [_jsxs("div", { children: [_jsx("h4", { className: "text-xs font-bold text-indigo-800 dark:text-indigo-300 uppercase mb-1", children: "AI Summary" }), _jsx("p", { className: "text-sm text-slate-700 dark:text-slate-200", children: callAnalysis.summary })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("h4", { className: "text-xs font-bold text-indigo-800 dark:text-indigo-300 uppercase mb-1", children: "Coaching Tips" }), _jsx("ul", { className: "list-disc list-inside text-xs text-slate-600 dark:text-slate-300 space-y-1", children: callAnalysis.coachingTips.slice(0, 2).map((tip, i) => _jsx("li", { children: tip }, i)) })] }), _jsxs("div", { children: [_jsx("h4", { className: "text-xs font-bold text-indigo-800 dark:text-indigo-300 uppercase mb-1", children: "Missed Opportunities" }), _jsx("ul", { className: "list-disc list-inside text-xs text-slate-600 dark:text-slate-300 space-y-1", children: callAnalysis.missedOpportunities.slice(0, 2).map((tip, i) => _jsx("li", { children: tip }, i)) })] })] })] })) : (_jsx("div", { className: "mb-6 text-center text-slate-400 text-sm italic", children: isAnalyzing ? "Processing audio transcript..." : "No significant dialogue detected for analysis." })), _jsxs("div", { className: "grid grid-cols-3 gap-3 mb-6", children: [_jsxs("button", { onClick: () => handleOutcome('answered'), className: "p-3 rounded-xl border border-green-200 bg-green-50 hover:bg-green-100 text-green-700 text-center transition-colors", children: [_jsx(CheckCircle2, { className: "w-5 h-5 mx-auto mb-1" }), _jsx("span", { className: "text-xs font-bold", children: "Answered" })] }), _jsxs("button", { onClick: () => handleOutcome('voicemail'), className: "p-3 rounded-xl border border-amber-200 bg-amber-50 hover:bg-amber-100 text-amber-700 text-center transition-colors", children: [_jsx(Voicemail, { className: "w-5 h-5 mx-auto mb-1" }), _jsx("span", { className: "text-xs font-bold", children: "Voicemail" })] }), _jsxs("button", { onClick: () => handleOutcome('wrong_number'), className: "p-3 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 text-center transition-colors", children: [_jsx(XCircle, { className: "w-5 h-5 mx-auto mb-1" }), _jsx("span", { className: "text-xs font-bold", children: "Bad #" })] })] }), _jsxs("div", { className: "space-y-4 flex-1 overflow-y-auto", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2", children: "Final Notes" }), _jsx("textarea", { value: callNotes, onChange: (e) => setCallNotes(e.target.value), placeholder: "Key takeaways, objections, next steps...", className: "w-full h-24 p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none resize-none text-sm" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2", children: "Next Stage" }), _jsx("div", { className: "flex flex-wrap gap-2", children: ['qualified', 'negotiation', 'won', 'lost', 'contacted'].map((status) => (_jsx("button", { onClick: () => setSelectedNextStatus(status), className: `px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${selectedNextStatus === status
                                                                ? 'bg-indigo-600 text-white border-indigo-600'
                                                                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-indigo-400'}`, children: status.charAt(0).toUpperCase() + status.slice(1) }, status))) })] })] }), _jsxs("button", { onClick: () => handleOutcome('answered'), disabled: !selectedNextStatus, className: "mt-6 w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-xl font-bold text-md shadow-lg flex items-center justify-center gap-2", children: [_jsx(Save, { className: "w-4 h-4" }), " Save & Next Lead"] })] })) }) })] })] }));
}
