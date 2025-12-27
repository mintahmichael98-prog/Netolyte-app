import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import React, { useEffect, useState, useRef } from 'react';
import { Phone, PhoneOff, Mic, MicOff, User, Video, VideoOff } from 'lucide-react';
export default function CallWidget({ callState, activeCall, onAccept, onReject, onEnd, onMute, onToggleVideo, isMuted, isVideoEnabled, remoteAudioRef, localStream, remoteStream }) {
    const [duration, setDuration] = useState(0);
    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);
    useEffect(() => {
        let interval;
        if (callState === 'connected') {
            interval = setInterval(() => {
                setDuration(prev => prev + 1);
            }, 1000);
        }
        else {
            setDuration(0);
        }
        return () => clearInterval(interval);
    }, [callState]);
    // Attach streams to video elements
    useEffect(() => {
        if (localVideoRef.current && localStream) {
            localVideoRef.current.srcObject = localStream;
        }
    }, [localStream, activeCall?.isVideo]);
    useEffect(() => {
        if (remoteVideoRef.current && remoteStream) {
            remoteVideoRef.current.srcObject = remoteStream;
        }
    }, [remoteStream, activeCall?.isVideo]);
    const formatTime = (secs) => {
        const mins = Math.floor(secs / 60);
        const s = secs % 60;
        return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };
    // Render nothing if idle
    if (callState === 'idle' || !activeCall) {
        return _jsx("audio", { ref: remoteAudioRef, autoPlay: true });
    }
    const isVideoCall = activeCall.isVideo;
    return (_jsxs(_Fragment, { children: [_jsx("audio", { ref: remoteAudioRef, autoPlay: true }), _jsxs("div", { className: `fixed z-[200] bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden animate-slide-up transition-all duration-300 ${isVideoCall && callState === 'connected' ? 'inset-0 md:inset-auto md:bottom-6 md:right-6 md:w-[600px] md:h-[450px]' : 'bottom-6 right-6 w-80'}`, children: [isVideoCall && callState === 'connected' && (_jsxs("div", { className: "absolute inset-0 bg-slate-900 flex items-center justify-center", children: [_jsx("video", { ref: remoteVideoRef, autoPlay: true, playsInline: true, className: "w-full h-full object-cover" }), _jsx("div", { className: "absolute top-4 right-4 w-32 h-48 bg-black rounded-xl overflow-hidden shadow-lg border-2 border-white/20", children: _jsx("video", { ref: localVideoRef, autoPlay: true, playsInline: true, muted: true, className: "w-full h-full object-cover mirror", style: { transform: 'scaleX(-1)' } }) })] })), _jsxs("div", { className: `relative z-10 flex flex-col h-full ${isVideoCall && callState === 'connected' ? 'justify-end bg-gradient-to-t from-black/80 via-transparent to-transparent' : ''}`, children: [(!isVideoCall || callState !== 'connected') && (_jsxs("div", { className: `p-4 text-center ${callState === 'connected' ? 'bg-emerald-600' : 'bg-indigo-600'} text-white transition-colors duration-500`, children: [_jsx("div", { className: "w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3 animate-pulse-slow", children: _jsx(User, { className: "w-8 h-8 text-white" }) }), _jsx("h3", { className: "text-lg font-bold", children: activeCall.callerId === activeCall.callerName ? 'Incoming Call...' : (callState === 'connected' ? activeCall.receiverName : activeCall.receiverName) }), _jsx("p", { className: "text-xs opacity-80 uppercase tracking-wider font-bold mb-1", children: callState === 'ringing' ? (activeCall.isVideo ? 'Incoming Video Call' : 'Incoming Call') : callState === 'calling' ? 'Calling...' : 'Connected' }), callState === 'connected' && (_jsx("div", { className: "font-mono text-xl font-bold", children: formatTime(duration) }))] })), isVideoCall && callState === 'connected' && (_jsx("div", { className: "absolute top-0 left-0 right-0 p-4 text-white flex justify-between items-start bg-gradient-to-b from-black/50 to-transparent", children: _jsxs("div", { children: [_jsx("h3", { className: "font-bold text-lg text-shadow", children: activeCall.receiverName }), _jsx("p", { className: "text-sm font-mono opacity-80", children: formatTime(duration) })] }) })), _jsx("div", { className: `p-6 ${isVideoCall && callState === 'connected' ? 'pb-8 pt-0' : ''}`, children: callState === 'ringing' && activeCall.receiverId !== activeCall.callerId ? (_jsxs("div", { className: "flex justify-between gap-4", children: [_jsxs("button", { onClick: onReject, className: "flex-1 flex flex-col items-center gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors", children: [_jsx("div", { className: "p-3 bg-red-500 text-white rounded-full shadow-md", children: _jsx(PhoneOff, { className: "w-6 h-6" }) }), _jsx("span", { className: "text-xs font-bold", children: "Decline" })] }), _jsxs("button", { onClick: onAccept, className: "flex-1 flex flex-col items-center gap-2 p-3 rounded-xl bg-green-50 dark:bg-green-900/20 text-green-600 hover:bg-green-100 dark:hover:bg-green-900/40 transition-colors", children: [_jsx("div", { className: "p-3 bg-green-500 text-white rounded-full shadow-md animate-pulse", children: activeCall.isVideo ? _jsx(Video, { className: "w-6 h-6" }) : _jsx(Phone, { className: "w-6 h-6" }) }), _jsx("span", { className: "text-xs font-bold", children: "Accept" })] })] })) : (_jsxs("div", { className: "flex justify-center gap-4", children: [_jsx("button", { onClick: onMute, className: `p-4 rounded-full shadow-md transition-all ${isMuted ? 'bg-white text-slate-900' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'} ${isVideoCall ? 'backdrop-blur-md bg-white/20 text-white border-white/20' : ''}`, children: isMuted ? _jsx(MicOff, { className: "w-6 h-6" }) : _jsx(Mic, { className: "w-6 h-6" }) }), isVideoCall && onToggleVideo && (_jsx("button", { onClick: onToggleVideo, className: `p-4 rounded-full shadow-md transition-all ${!isVideoEnabled ? 'bg-white text-slate-900' : 'backdrop-blur-md bg-white/20 text-white border-white/20'}`, children: isVideoEnabled ? _jsx(Video, { className: "w-6 h-6" }) : _jsx(VideoOff, { className: "w-6 h-6" }) })), _jsx("button", { onClick: onEnd, className: "p-4 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg shadow-red-500/30 transition-all transform active:scale-95", children: _jsx(PhoneOff, { className: "w-6 h-6" }) })] })) })] })] })] }));
}
