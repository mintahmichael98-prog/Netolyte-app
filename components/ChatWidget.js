import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import React, { useState, useEffect, useRef } from 'react';
import { useChat } from '../hooks/useChat';
import { chatService } from '../services/chatService';
import { authService } from '../services/authService';
import { MessageCircle, X, Send, ChevronLeft, Phone, Video, ChevronRight, Hash, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
export default function ChatWidget({ currentUser, onStartCall }) {
    const [isOpen, setIsOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [view, setView] = useState('list');
    const [team, setTeam] = useState([]);
    const [groups, setGroups] = useState([]);
    const [inputText, setInputText] = useState('');
    const [newGroupName, setNewGroupName] = useState('');
    const [isCreatingGroup, setIsCreatingGroup] = useState(false);
    const { messages, sendMessage, activeConversation, setActiveConversation, typingUsers, handleInputChange } = useChat(currentUser);
    const messagesEndRef = useRef(null);
    // Load Team Members and Groups
    useEffect(() => {
        const loadData = async () => {
            const members = await authService.getTeamMembers();
            setTeam(members.filter(m => m.id !== currentUser.id));
            setGroups(chatService.getGroups());
        };
        if (isOpen)
            loadData();
    }, [isOpen, currentUser.id]);
    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, view]);
    const handleSelect = (id) => {
        setActiveConversation(id);
        setView('chat');
    };
    const handleCreateGroup = (e) => {
        e.preventDefault();
        if (!newGroupName.trim())
            return;
        const newGroup = chatService.createGroup(newGroupName);
        setGroups(chatService.getGroups());
        setNewGroupName('');
        setIsCreatingGroup(false);
        toast.success(`Channel #${newGroup.name} created`);
    };
    const handleSend = (e) => {
        e.preventDefault();
        if (!inputText.trim())
            return;
        sendMessage(inputText);
        setInputText('');
        handleInputChange(''); // Clear typing status
    };
    const getStatusColor = (status) => {
        if (status === 'online')
            return 'bg-green-500';
        if (status === 'busy' || status === 'in-call')
            return 'bg-red-500';
        if (status === 'away')
            return 'bg-amber-500';
        return 'bg-slate-400';
    };
    const activeUser = team.find(u => u.id === activeConversation);
    const activeGroup = groups.find(g => g.id === activeConversation);
    const totalUnread = team.reduce((acc, user) => acc + chatService.getUnreadCount(currentUser.id, user.id), 0);
    // Determine header title
    let headerTitle = 'Chat';
    let headerSubtitle = '';
    if (view === 'list')
        headerTitle = 'Team Chat';
    else if (activeUser) {
        headerTitle = activeUser.name || 'User';
        headerSubtitle = activeUser.status || 'offline';
    }
    else if (activeGroup) {
        headerTitle = `# ${activeGroup.name}`;
        headerSubtitle = `${team.length + 1} members`;
    }
    if (!isOpen) {
        if (isCollapsed) {
            return (_jsxs("button", { onClick: () => setIsCollapsed(false), className: "fixed bottom-6 -right-1 z-[150] w-10 h-10 bg-indigo-600 hover:bg-indigo-700 text-white rounded-l-full shadow-xl flex items-center justify-center transition-all duration-300 animate-fade-in pl-2", title: "Expand Chat", children: [_jsx(ChevronLeft, { className: "w-5 h-5" }), totalUnread > 0 && (_jsx("span", { className: "absolute top-0 -left-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold flex items-center justify-center rounded-full border-2 border-white dark:border-slate-900", children: totalUnread > 9 ? '9+' : totalUnread }))] }));
        }
        return (_jsxs("div", { className: "group fixed bottom-6 right-6 z-[150] animate-fade-in", children: [_jsxs("button", { onClick: () => setIsOpen(true), className: "w-14 h-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-xl flex items-center justify-center transition-all duration-300 hover:scale-105", children: [_jsx(MessageCircle, { className: "w-7 h-7" }), totalUnread > 0 && (_jsx("span", { className: "absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold flex items-center justify-center rounded-full border-2 border-white dark:border-slate-900", children: totalUnread > 9 ? '9+' : totalUnread }))] }), _jsx("button", { onClick: (e) => { e.stopPropagation(); setIsCollapsed(true); }, className: "absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-white dark:bg-slate-700 text-slate-500 rounded-full shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity", title: "Collapse Chat Button", children: _jsx(ChevronRight, { className: "w-4 h-4" }) })] }));
    }
    return (_jsxs("div", { className: "fixed bottom-6 right-6 z-[150] w-80 md:w-96 h-[600px] bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 flex flex-col overflow-hidden animate-slide-up", children: [_jsxs("div", { className: "h-16 bg-indigo-600 p-4 flex items-center justify-between shrink-0 shadow-md z-10", children: [_jsxs("div", { className: "flex items-center gap-3 text-white", children: [view === 'chat' && (_jsx("button", { onClick: () => setView('list'), className: "hover:bg-indigo-500 p-1 rounded-full transition-colors", children: _jsx(ChevronLeft, { className: "w-5 h-5" }) })), _jsxs("div", { className: "flex flex-col", children: [_jsx("h3", { className: "font-bold text-lg leading-tight truncate max-w-[150px]", children: headerTitle }), view === 'chat' && headerSubtitle && (_jsxs("span", { className: "text-xs text-indigo-200 font-medium capitalize flex items-center gap-1", children: [activeUser && _jsx("span", { className: `w-1.5 h-1.5 rounded-full ${getStatusColor(activeUser.status).replace('bg-', 'bg-white opacity-80 ')}` }), headerSubtitle] }))] })] }), _jsxs("div", { className: "flex items-center gap-1", children: [view === 'chat' && activeUser && (_jsxs(_Fragment, { children: [_jsx("button", { onClick: () => onStartCall(activeUser.id, activeUser.name || 'User', false), className: "hover:bg-indigo-500 p-2 rounded-full transition-colors text-white", title: "Audio Call", children: _jsx(Phone, { className: "w-5 h-5" }) }), _jsx("button", { onClick: () => onStartCall(activeUser.id, activeUser.name || 'User', true), className: "hover:bg-indigo-500 p-2 rounded-full transition-colors text-white mr-1", title: "Video Call", children: _jsx(Video, { className: "w-5 h-5" }) })] })), _jsx("button", { onClick: () => setIsOpen(false), className: "text-indigo-100 hover:text-white transition-colors p-2", children: _jsx(X, { className: "w-5 h-5" }) })] })] }), _jsxs("div", { className: "flex-1 overflow-hidden bg-slate-50 dark:bg-slate-900 relative", children: [view === 'list' && (_jsxs("div", { className: "h-full overflow-y-auto custom-scrollbar", children: [_jsxs("div", { className: "px-4 pt-4 pb-2", children: [_jsxs("div", { className: "flex justify-between items-center mb-2", children: [_jsx("span", { className: "text-xs font-bold text-slate-400 uppercase tracking-wider", children: "Channels" }), _jsx("button", { onClick: () => setIsCreatingGroup(!isCreatingGroup), className: "text-slate-400 hover:text-indigo-500", children: _jsx(Plus, { className: "w-4 h-4" }) })] }), isCreatingGroup && (_jsxs("form", { onSubmit: handleCreateGroup, className: "mb-3 flex gap-2", children: [_jsx("input", { type: "text", value: newGroupName, onChange: e => setNewGroupName(e.target.value), placeholder: "channel-name", className: "flex-1 bg-slate-100 dark:bg-slate-700 rounded px-2 py-1 text-sm border-none focus:ring-1 focus:ring-indigo-500 dark:text-white", autoFocus: true }), _jsx("button", { type: "submit", className: "text-xs bg-indigo-600 text-white px-2 rounded", children: "Add" })] })), _jsx("div", { className: "space-y-1", children: groups.map(group => {
                                            const lastMsgMap = chatService.getRecentConversations(currentUser.id);
                                            const lastMsg = lastMsgMap[group.id];
                                            return (_jsxs("div", { onClick: () => handleSelect(group.id), className: "flex items-center gap-2 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors", children: [_jsx("div", { className: "p-1.5 bg-slate-200 dark:bg-slate-700 rounded text-slate-500", children: _jsx(Hash, { className: "w-4 h-4" }) }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsx("h4", { className: "text-sm font-semibold text-slate-700 dark:text-slate-200", children: group.name }), _jsx("p", { className: "text-[10px] text-slate-400 truncate", children: lastMsg ? `${lastMsg.senderName?.split(' ')[0]}: ${lastMsg.content}` : group.description })] })] }, group.id));
                                        }) })] }), _jsx("div", { className: "h-px bg-slate-200 dark:bg-slate-800 mx-4 my-2" }), _jsxs("div", { className: "px-4 pb-4", children: [_jsx("div", { className: "flex justify-between items-center mb-2", children: _jsx("span", { className: "text-xs font-bold text-slate-400 uppercase tracking-wider", children: "Direct Messages" }) }), team.map(user => {
                                        const unread = chatService.getUnreadCount(currentUser.id, user.id);
                                        const lastMsgMap = chatService.getRecentConversations(currentUser.id);
                                        const lastMsg = lastMsgMap[user.id];
                                        return (_jsxs("div", { onClick: () => handleSelect(user.id), className: "p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer flex items-center gap-3 transition-colors group", children: [_jsxs("div", { className: "relative", children: [_jsx("div", { className: "w-8 h-8 bg-indigo-100 dark:bg-indigo-900/50 rounded-full flex items-center justify-center text-indigo-700 dark:text-indigo-300 font-bold text-xs border border-indigo-200 dark:border-indigo-800", children: user.name ? user.name.charAt(0).toUpperCase() : 'U' }), _jsx("div", { className: `absolute bottom-0 right-0 w-2.5 h-2.5 border-2 border-white dark:border-slate-900 rounded-full ${getStatusColor(user.status)}` })] }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsx("h4", { className: "font-semibold text-sm text-slate-900 dark:text-white truncate", children: user.name }), unread > 0 && _jsx("span", { className: "bg-red-500 text-white text-[10px] px-1.5 rounded-full font-bold shadow-sm", children: unread })] }), _jsx("p", { className: `text-xs truncate ${unread > 0 ? 'font-semibold text-slate-800 dark:text-slate-200' : 'text-slate-500 dark:text-slate-400'}`, children: lastMsg ? (lastMsg.senderId === currentUser.id ? `You: ${lastMsg.content}` : lastMsg.content) : 'Start chat' })] })] }, user.id));
                                    }), team.length === 0 && (_jsx("div", { className: "text-center text-slate-400 text-xs py-4", children: "No other members." }))] })] })), view === 'chat' && (_jsxs("div", { className: "h-full flex flex-col", children: [_jsxs("div", { className: "flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar", children: [messages.length === 0 && (_jsxs("div", { className: "text-center py-10 text-slate-400 text-xs", children: ["Start the conversation in ", activeGroup ? `#${activeGroup.name}` : 'private', "."] })), messages.map((msg, idx) => {
                                        const isMe = msg.senderId === currentUser.id;
                                        const isGroup = activeConversation?.startsWith('group_');
                                        const showHeader = isGroup && !isMe && (idx === 0 || messages[idx - 1].senderId !== msg.senderId);
                                        return (_jsxs("div", { className: `flex flex-col ${isMe ? 'items-end' : 'items-start'} animate-fade-in`, children: [showHeader && (_jsx("span", { className: "text-[10px] text-slate-500 ml-1 mb-0.5 font-semibold", children: msg.senderName || 'Unknown' })), _jsxs("div", { className: `max-w-[85%] p-3 rounded-2xl text-sm shadow-sm relative group ${isMe
                                                        ? 'bg-indigo-600 text-white rounded-br-sm'
                                                        : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-bl-sm'}`, children: [msg.content, _jsxs("div", { className: `text-[9px] mt-1 text-right opacity-70 ${isMe ? 'text-indigo-100' : 'text-slate-400'}`, children: [new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), isMe && (_jsx("span", { className: "ml-1 inline-block", children: msg.status === 'read' ? '✓✓' : '✓' }))] })] })] }, msg.id));
                                    }), activeConversation && typingUsers[activeConversation] && (_jsx("div", { className: "flex justify-start animate-fade-in", children: _jsxs("div", { className: "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3 rounded-2xl rounded-bl-sm flex gap-1 shadow-sm items-center h-10", children: [_jsx("span", { className: "w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" }), _jsx("span", { className: "w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-100" }), _jsx("span", { className: "w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-200" })] }) })), _jsx("div", { ref: messagesEndRef })] }), _jsx("div", { className: "p-3 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700", children: _jsxs("form", { onSubmit: handleSend, className: "flex gap-2 items-end", children: [_jsx("div", { className: "flex-1 relative", children: _jsx("input", { value: inputText, onChange: (e) => { setInputText(e.target.value); handleInputChange(e.target.value); }, placeholder: activeGroup ? `Message #${activeGroup.name}` : "Type a message...", className: "w-full bg-slate-100 dark:bg-slate-900 border-none rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white", autoFocus: true }) }), _jsx("button", { type: "submit", disabled: !inputText.trim(), className: "p-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600 text-white rounded-full transition-all shadow-md mb-0.5", children: _jsx(Send, { className: "w-4 h-4 ml-0.5" }) })] }) })] }))] })] }));
}
