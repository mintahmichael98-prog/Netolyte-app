import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { ViewMode, INDUSTRIES } from './types';
import { generateLeadsBatch } from './services/geminiService';
import { authService } from './services/authService';
import { useWebRTC } from './hooks/useWebRTC';
import { useUserPresence } from './hooks/useUserPresence';
import Dashboard from './components/Dashboard';
import LeadTable from './components/LeadTable';
import MapView from './components/MapView';
import PipelineBoard from './components/PipelineBoard';
import CompetitorScanner from './components/CompetitorScanner';
import EmailWarmup from './components/EmailWarmup';
import LookalikeFinder from './components/LookalikeFinder';
import RoleplayDojo from './components/RoleplayDojo';
import SequenceBuilder from './components/SequenceBuilder';
import PowerDialer from './components/PowerDialer';
import SalesStrategyView from './components/SalesStrategy';
import EmailSequenceModal from './components/EmailSequenceModal';
import WhatsAppCampaignModal from './components/WhatsAppCampaignModal';
import SMSCampaignModal from './components/SMSCampaignModal';
import ActivityDrawer from './components/ActivityDrawer';
import SavedLists from './components/SavedLists';
import ReportsView from './components/ReportsView';
import TeamManagement from './components/TeamManagement';
import CallWidget from './components/CallWidget';
import ChatWidget from './components/ChatWidget';
import LeadSignals from './components/LeadSignals';
import NotificationCenter from './components/NotificationCenter';
import BookingCalendar from './components/BookingCalendar';
import LeadDetailsModal from './components/LeadDetailsModal';
import { ImportModal } from './components/ImportModal';
import { AuthModal } from './components/AuthModal';
import { PricingModal } from './components/PricingModal';
import { TermsModal, PrivacyModal } from './components/LegalModals';
import { ExportModal } from './components/ExportModal';
import SettingsModal from './components/SettingsModal';
import { exportToCSV } from './utils/exportCSV';
import { t } from './utils/i18n';
import toast, { Toaster } from 'react-hot-toast';
import html2canvas from 'html2canvas';
import { Download, Moon, Sun, Search, List, Zap, LogOut, Star, Upload, Loader2, Filter, FileSpreadsheet, Ban, Map, MessageCircle, Kanban, Target, ShieldCheck, MessageSquare, Users, Settings as SettingsIcon, ChevronDown, ChevronUp, ChevronRight, ChevronLeft, Menu, X, History, Bot, Workflow, ArrowRight, FolderOpen, RotateCcw, Eye, Phone, Lightbulb, Sparkles, UserPlus, Calendar } from 'lucide-react';
const BATCH_SIZE = 10;
const MAX_BATCHES = 50;
const NavItem = ({ item, isActive, isCollapsed, onClick }) => (_jsxs("button", { onClick: onClick, title: isCollapsed ? item.label : undefined, className: `w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors duration-200 text-sm font-medium group ${isActive
        ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/50 hover:text-slate-900 dark:hover:text-white'} ${isCollapsed ? 'justify-center' : ''}`, children: [_jsx(item.icon, { className: `w-4 h-4 transition-colors shrink-0 ${isActive ? 'text-indigo-700 dark:text-indigo-300' : 'text-slate-400 group-hover:text-indigo-500'}` }), !isCollapsed && _jsx("span", { className: "whitespace-nowrap", children: item.label })] }));
export default function App() {
    const [user, setUser] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [darkMode, setDarkMode] = useState(() => {
        const saved = localStorage.getItem('leadgenius_dark_mode');
        return saved ? JSON.parse(saved) : true;
    });
    const [viewMode, setViewMode] = useState(ViewMode.DASHBOARD);
    const [leads, setLeads] = useState([]);
    const [searchState, setSearchState] = useState({
        query: '',
        isSearching: false,
        progressStep: 0,
        batchesCompleted: 0,
        totalLeads: 0,
        error: null
    });
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState({
        location: '',
        industry: '',
        employees: ''
    });
    const [savedSearches, setSavedSearches] = useState([]);
    const [favoriteSearches, setFavoriteSearches] = useState([]);
    const [searchHistory, setSearchHistory] = useState([]);
    const [showHistory, setShowHistory] = useState(false);
    const [abortController, setAbortController] = useState(null);
    const [settings, setSettings] = useState(() => {
        const saved = localStorage.getItem('leadgenius_settings');
        return saved ? JSON.parse(saved) : { webhookUrl: '', brandVoice: 'Professional, concise, and value-driven.', language: 'en' };
    });
    const [bookingSettings, setBookingSettings] = useState(() => {
        const saved = localStorage.getItem('leadgenius_booking_settings');
        return saved ? JSON.parse(saved) : {
            isConnected: false,
            urlSlug: '',
            meetingTitle: '15 Minute Meeting',
            meetingDuration: 15,
            availability: {
                monday: { enabled: true, startTime: '09:00', endTime: '17:00' },
                tuesday: { enabled: true, startTime: '09:00', endTime: '17:00' },
                wednesday: { enabled: true, startTime: '09:00', endTime: '17:00' },
                thursday: { enabled: true, startTime: '09:00', endTime: '17:00' },
                friday: { enabled: true, startTime: '09:00', endTime: '17:00' },
                saturday: { enabled: false, startTime: '09:00', endTime: '17:00' },
                sunday: { enabled: false, startTime: '09:00', endTime: '17:00' },
            }
        };
    });
    const [selectedLeadIds, setSelectedLeadIds] = useState(new Set());
    const [notifications, setNotifications] = useState(() => {
        const saved = localStorage.getItem('leadgenius_notifications');
        return saved ? JSON.parse(saved) : [];
    });
    const [showPricing, setShowPricing] = useState(false);
    const [showTerms, setShowTerms] = useState(false);
    const [showPrivacy, setShowPrivacy] = useState(false);
    const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
    const [showSMSModal, setShowSMSModal] = useState(false);
    const [showExportModal, setShowExportModal] = useState(false);
    const [showSettingsModal, setShowSettingsModal] = useState(false);
    const [showMobileMenu, setShowMobileMenu] = useState(false);
    const [showImportModal, setShowImportModal] = useState(false);
    const [selectedLead, setSelectedLead] = useState(null);
    const [activeActivityLead, setActiveActivityLead] = useState(null);
    const [selectedLeadDetails, setSelectedLeadDetails] = useState(null);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [collapsedNavGroups, setCollapsedNavGroups] = useState({});
    const [showUserMenu, setShowUserMenu] = useState(false);
    const userMenuRef = useRef(null);
    // Dynamic Navigation Groups based on language
    const navGroups = useMemo(() => [
        {
            id: 'discover',
            label: t('nav.discover', settings.language),
            items: [
                { id: ViewMode.DASHBOARD, label: t('nav.search', settings.language), icon: Search },
                { id: ViewMode.SAVED, label: t('nav.saved', settings.language), icon: FolderOpen },
                { id: ViewMode.COMPETITORS, label: t('nav.competitors', settings.language), icon: Target },
                { id: ViewMode.LOOKALIKE, label: t('nav.lookalike', settings.language), icon: Users },
            ]
        },
        {
            id: 'engage',
            label: t('nav.engage', settings.language),
            items: [
                { id: ViewMode.PIPELINE, label: t('nav.pipeline', settings.language), icon: Kanban },
                { id: ViewMode.MAP, label: t('nav.map', settings.language), icon: Map },
                { id: ViewMode.DIALER, label: t('nav.dialer', settings.language), icon: Phone },
                { id: ViewMode.SEQUENCES, label: t('nav.sequences', settings.language), icon: Workflow },
                { id: ViewMode.BOOKING, label: t('nav.booking', settings.language), icon: Calendar },
                { id: ViewMode.ROLEPLAY, label: t('nav.roleplay', settings.language), icon: Bot },
                { id: ViewMode.STRATEGY, label: t('nav.strategy', settings.language), icon: Lightbulb },
            ]
        },
        {
            id: 'intelligence',
            label: t('nav.intelligence', settings.language),
            items: [
                { id: ViewMode.SIGNALS, label: t('nav.signals', settings.language), icon: Zap },
                { id: ViewMode.REPORTS, label: t('nav.reports', settings.language), icon: FileSpreadsheet },
            ]
        },
        {
            id: 'tools',
            label: t('nav.tools', settings.language),
            items: [
                { id: ViewMode.TEAM, label: t('nav.team', settings.language), icon: Users },
                { id: ViewMode.EMAIL_WARMUP, label: t('nav.email_warmup', settings.language), icon: ShieldCheck },
            ]
        }
    ], [settings.language]);
    const toggleNavGroup = (groupId) => {
        setCollapsedNavGroups(prev => ({
            ...prev,
            [groupId]: !prev[groupId]
        }));
    };
    // TEAM STATE
    const [teamMembers, setTeamMembers] = useState([]);
    const [viewingAsId, setViewingAsId] = useState(null);
    const [sequences, setSequences] = useState(() => {
        const saved = localStorage.getItem('leadgenius_sequences');
        return saved ? JSON.parse(saved) : [];
    });
    const userRef = useRef(null);
    userRef.current = user;
    // Hooks
    useUserPresence(user, setUser);
    const { callState, activeCall, startCall, acceptCall, rejectCall, endCall, toggleMute, toggleVideo, isMuted, isVideoEnabled, remoteAudioRef, localStream, remoteStream } = useWebRTC(user);
    // Initialize Team and Mock Data Ownership
    useEffect(() => {
        const initTeam = async () => {
            const members = await authService.getTeamMembers();
            setTeamMembers(members);
            setLeads(prev => prev.map(l => {
                const changes = {};
                if (!l.ownerId) {
                    const randomOwner = members[Math.floor(Math.random() * members.length)];
                    changes.ownerId = randomOwner.id;
                }
                if (!l.activity) {
                    changes.activity = [{
                            id: `init_${Date.now()}_${l.id}`,
                            type: 'creation',
                            content: 'Lead imported/created',
                            author: 'System',
                            timestamp: new Date().toISOString()
                        }];
                }
                return { ...l, ...changes };
            }));
        };
        initTeam();
    }, []);
    // Filter Leads based on "Viewing As"
    const visibleLeads = useMemo(() => {
        if (!viewingAsId)
            return leads;
        return leads.filter(l => l.ownerId === viewingAsId);
    }, [leads, viewingAsId]);
    const viewingAsUser = teamMembers.find(m => m.id === viewingAsId);
    useEffect(() => {
        localStorage.setItem('leadgenius_dark_mode', JSON.stringify(darkMode));
        if (darkMode) {
            document.documentElement.classList.add('dark');
        }
        else {
            document.documentElement.classList.remove('dark');
        }
    }, [darkMode]);
    useEffect(() => {
        const saved = localStorage.getItem('savedLeadSearches');
        if (saved)
            setSavedSearches(JSON.parse(saved));
        const favs = localStorage.getItem('favorite_searches');
        if (favs)
            setFavoriteSearches(JSON.parse(favs));
        const history = localStorage.getItem('search_history');
        if (history)
            setSearchHistory(JSON.parse(history));
        const lastUser = localStorage.getItem('leadgenius_last_user');
        if (lastUser)
            handleLogin(lastUser);
        const savedLeads = localStorage.getItem('current_leads');
        const savedQuery = localStorage.getItem('current_query');
        if (savedLeads && savedQuery) {
            setLeads(JSON.parse(savedLeads));
            setSearchState(s => ({ ...s, query: savedQuery }));
            toast.success('Session restored');
        }
    }, []);
    useEffect(() => {
        if (leads.length > 0) {
            localStorage.setItem('current_leads', JSON.stringify(leads));
            localStorage.setItem('current_query', searchState.query);
        }
    }, [leads, searchState.query]);
    useEffect(() => {
        localStorage.setItem('leadgenius_settings', JSON.stringify(settings));
    }, [settings]);
    useEffect(() => {
        localStorage.setItem('leadgenius_booking_settings', JSON.stringify(bookingSettings));
    }, [bookingSettings]);
    useEffect(() => {
        localStorage.setItem('leadgenius_sequences', JSON.stringify(sequences));
    }, [sequences]);
    useEffect(() => {
        localStorage.setItem('leadgenius_notifications', JSON.stringify(notifications));
    }, [notifications]);
    useEffect(() => {
        if (searchState.query && !searchState.isSearching && leads.length > 0) {
            try {
                const historyJSON = localStorage.getItem('search_history');
                const history = historyJSON ? JSON.parse(historyJSON) : [];
                const newEntry = {
                    query: searchState.query,
                    count: leads.length,
                    date: new Date().toISOString()
                };
                const filtered = history.filter((h) => h.query !== newEntry.query);
                const updated = [newEntry, ...filtered].slice(0, 50);
                localStorage.setItem('search_history', JSON.stringify(updated));
                setSearchHistory(updated);
            }
            catch (e) {
                console.error("Failed to save history", e);
            }
        }
    }, [searchState.isSearching, leads.length, searchState.query]);
    useEffect(() => {
        if (!user?.email)
            return;
        const email = user.email;
        const interval = setInterval(async () => {
            try {
                const updated = await authService.getUser(email);
                setUser(prev => prev?.email === updated.email ? updated : prev);
            }
            catch (err) { }
        }, 5000);
        return () => clearInterval(interval);
    }, [user?.email]);
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
                setShowUserMenu(false);
            }
        };
        if (showUserMenu) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showUserMenu]);
    const addNotification = (type, message, link) => {
        const newNotif = {
            id: `notif_${Date.now()}`,
            type,
            message,
            timestamp: new Date().toISOString(),
            read: false,
            link
        };
        setNotifications(prev => [newNotif, ...prev.slice(0, 49)]);
    };
    const handleLogin = async (email) => {
        const profile = await authService.login(email);
        setUser(profile);
        // Explicitly set online on login
        await authService.updateStatus(profile.email, 'online');
        setTransactions(authService.getTransactions(email));
        localStorage.setItem('leadgenius_last_user', email);
        toast.success(`Welcome back, ${profile.name?.split(' ')[0] || 'User'}!`);
    };
    const handleLogout = async () => {
        if (user) {
            try {
                await authService.updateStatus(user.email, 'offline');
            }
            catch (e) {
                // Ignore if user not found during logout
            }
        }
        setUser(null);
        setLeads([]);
        localStorage.clear();
        toast('Logged out');
    };
    const handlePurchase = async (amount, plan) => {
        if (!user)
            return;
        const updatedUser = await authService.addCredits(user.email, amount, plan);
        setUser(updatedUser);
        setTransactions(authService.getTransactions(user.email));
        toast.success(`+${amount.toLocaleString()} credits added!`);
    };
    const handleToggleSelect = (id) => {
        const newSet = new Set(selectedLeadIds);
        if (newSet.has(id))
            newSet.delete(id);
        else
            newSet.add(id);
        setSelectedLeadIds(newSet);
    };
    const handleSelectAll = (ids) => {
        const newSet = new Set(selectedLeadIds);
        ids.forEach(id => newSet.add(id));
        setSelectedLeadIds(newSet);
    };
    const handleStatusChange = (id, newStatus) => {
        let updatedLead;
        setLeads(prev => prev.map(l => {
            if (l.id === id) {
                const activityItem = {
                    id: Date.now().toString(),
                    type: 'status_change',
                    content: `Status changed to ${newStatus.toUpperCase()}`,
                    author: user?.name || 'User',
                    timestamp: new Date().toISOString(),
                    metadata: { oldValue: l.status, newValue: newStatus }
                };
                updatedLead = {
                    ...l,
                    status: newStatus,
                    lastContacted: new Date().toISOString(),
                    activity: [activityItem, ...(l.activity || [])]
                };
                if (activeActivityLead?.id === id)
                    setActiveActivityLead(updatedLead);
                return updatedLead;
            }
            return l;
        }));
        const formattedStatus = newStatus.charAt(0).toUpperCase() + newStatus.slice(1);
        toast.success(`Lead moved to ${formattedStatus}`, {
            icon: '✅',
            style: { background: '#1e293b', color: '#fff' }
        });
        if (updatedLead) {
            addNotification('info', `<strong>${updatedLead.company}</strong> moved to <strong>${formattedStatus}</strong>`, { view: ViewMode.PIPELINE, leadId: id });
        }
        if (updatedLead && settings.webhookUrl) {
            fetch(settings.webhookUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    event: 'lead_status_change',
                    lead: updatedLead,
                    timestamp: new Date().toISOString()
                })
            })
                .then(() => toast.success("Webhook Triggered", { icon: '🔌' }))
                .catch((e) => console.error("Webhook failed", e));
        }
    };
    const handleUpdateLead = (updatedLead) => {
        setLeads(prev => prev.map(l => l.id === updatedLead.id ? updatedLead : l));
        if (selectedLeadDetails?.id === updatedLead.id) {
            setSelectedLeadDetails(updatedLead);
        }
        // Also update if in favorite searches ( Saved Lists )
        const updatedFavs = favoriteSearches.map(list => {
            if (list.leads) {
                const foundIndex = list.leads.findIndex((l) => l.id === updatedLead.id);
                if (foundIndex !== -1) {
                    const newLeads = [...list.leads];
                    newLeads[foundIndex] = updatedLead;
                    return { ...list, leads: newLeads };
                }
            }
            return list;
        });
        if (JSON.stringify(updatedFavs) !== JSON.stringify(favoriteSearches)) {
            setFavoriteSearches(updatedFavs);
            localStorage.setItem('favorite_searches', JSON.stringify(updatedFavs));
        }
        toast.success("Lead details updated");
    };
    const handleAddToSequence = (leadIds, sequenceId) => {
        setLeads(prev => prev.map(l => {
            if (leadIds.includes(l.id)) {
                const seq = sequences.find(s => s.id === sequenceId);
                const activityItem = {
                    id: Date.now().toString(),
                    type: 'sequence_add',
                    content: `Enrolled in sequence: ${seq?.name || 'Unknown'}`,
                    author: user?.name || 'User',
                    timestamp: new Date().toISOString()
                };
                return {
                    ...l,
                    sequenceId,
                    status: 'contacted',
                    lastContacted: new Date().toISOString(),
                    activity: [activityItem, ...(l.activity || [])]
                };
            }
            return l;
        }));
        setSequences(prev => prev.map(s => {
            if (s.id === sequenceId) {
                return { ...s, activeLeads: s.activeLeads + leadIds.length };
            }
            return s;
        }));
        toast.success(`Added ${leadIds.length} leads to sequence`, { icon: '🚀' });
        setSelectedLeadIds(new Set());
    };
    const handleBulkAssign = (assigneeId) => {
        const assigneeName = teamMembers.find(m => m.id === assigneeId)?.name || 'Unknown';
        setLeads(prev => prev.map(l => {
            if (selectedLeadIds.has(l.id)) {
                const activityItem = {
                    id: Date.now().toString() + Math.random(),
                    type: 'assignment',
                    content: `Bulk assigned to ${assigneeName}`,
                    author: user?.name || 'Admin',
                    timestamp: new Date().toISOString(),
                    metadata: { oldValue: l.assignedTo, newValue: assigneeName }
                };
                return {
                    ...l,
                    assignedTo: assigneeName,
                    ownerId: assigneeId,
                    activity: [activityItem, ...(l.activity || [])]
                };
            }
            return l;
        }));
        toast.success(`Assigned ${selectedLeadIds.size} leads to ${assigneeName}`);
        addNotification('assignment', `You assigned <strong>${selectedLeadIds.size} leads</strong> to <strong>${assigneeName}</strong>`);
        setSelectedLeadIds(new Set());
    };
    const handleAddNote = (leadId, text) => {
        setLeads(prev => prev.map(l => {
            if (l.id === leadId) {
                const newNote = {
                    id: Date.now().toString(),
                    text,
                    author: user?.name || 'You',
                    date: new Date().toISOString()
                };
                const activityItem = {
                    id: Date.now().toString(),
                    type: 'note',
                    content: text,
                    author: user?.name || 'You',
                    timestamp: new Date().toISOString()
                };
                const updated = {
                    ...l,
                    notes: [...(l.notes || []), newNote],
                    activity: [activityItem, ...(l.activity || [])]
                };
                if (activeActivityLead?.id === leadId)
                    setActiveActivityLead(updated);
                return updated;
            }
            return l;
        }));
    };
    const handleAssignLead = (leadId, assignee) => {
        let leadName = '';
        setLeads(prev => prev.map(l => {
            if (l.id === leadId) {
                leadName = l.company;
                const activityItem = {
                    id: Date.now().toString(),
                    type: 'assignment',
                    content: `Assigned to ${assignee}`,
                    author: user?.name || 'User',
                    timestamp: new Date().toISOString(),
                    metadata: { oldValue: l.assignedTo, newValue: assignee }
                };
                const updated = {
                    ...l,
                    assignedTo: assignee,
                    activity: [activityItem, ...(l.activity || [])]
                };
                if (activeActivityLead?.id === leadId)
                    setActiveActivityLead(updated);
                return updated;
            }
            return l;
        }));
        addNotification('assignment', `<strong>${leadName}</strong> assigned to <strong>${assignee}</strong>`, { view: ViewMode.LIST, leadId });
        toast.success(`Assigned to ${assignee}`);
    };
    const saveAsFavorite = async () => {
        if (leads.length === 0) {
            toast.error("No leads to save");
            return;
        }
        const toastId = toast.loading('Saving list...');
        try {
            const dashboardElement = document.getElementById('dashboard-content');
            let thumbnail = 'https://via.placeholder.com/300x200?text=No+Preview';
            if (dashboardElement) {
                try {
                    const canvas = await html2canvas(dashboardElement, {
                        scale: 0.5,
                        useCORS: true,
                        logging: false,
                        backgroundColor: document.documentElement.classList.contains('dark') ? '#0f172a' : '#f8fafc',
                        height: 600,
                        windowWidth: 1200
                    });
                    thumbnail = canvas.toDataURL('image/jpeg', 0.5);
                }
                catch (e) {
                    console.error("Thumbnail generation failed:", e);
                }
            }
            const listName = searchState.query || `List ${new Date().toLocaleDateString()}`;
            const newFav = {
                id: Date.now(),
                query: listName,
                leadsCount: leads.length,
                timestamp: Date.now(),
                thumbnail,
                leads: leads
            };
            try {
                const updated = [newFav, ...favoriteSearches];
                setFavoriteSearches(updated);
                localStorage.setItem('favorite_searches', JSON.stringify(updated));
                toast.success('List saved successfully!', { id: toastId });
            }
            catch (storageError) {
                const lightweightFav = { ...newFav, leads: undefined };
                const updated = [lightweightFav, ...favoriteSearches];
                setFavoriteSearches(updated);
                localStorage.setItem('favorite_searches', JSON.stringify(updated));
                toast.success('Saved (Without offline data due to size)', { id: toastId });
            }
        }
        catch (err) {
            toast.error('Failed to save list', { id: toastId });
        }
    };
    const deleteFavorite = (id) => {
        const updated = favoriteSearches.filter(f => f.id !== id);
        setFavoriteSearches(updated);
        localStorage.setItem('favorite_searches', JSON.stringify(updated));
        toast.success("List deleted");
    };
    const handleRenameFavorite = (id, newName) => {
        const updated = favoriteSearches.map(list => list.id === id ? { ...list, query: newName } : list);
        setFavoriteSearches(updated);
        localStorage.setItem('favorite_searches', JSON.stringify(updated));
        toast.success("List renamed");
    };
    const handleSelectHistory = (query) => {
        setSearchState(s => ({ ...s, query }));
        setShowHistory(false);
    };
    const clearHistory = () => {
        localStorage.removeItem('search_history');
        setSearchHistory([]);
        toast.success("Search history cleared");
        setShowHistory(false);
    };
    const handleImport = (importedLeads) => {
        const leadsWithOwner = importedLeads.map(l => ({ ...l, ownerId: user?.id }));
        setLeads(prev => [...prev, ...leadsWithOwner]);
        // Auto-save to Saved Lists
        const listName = `Imported Batch ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
        const newFav = {
            id: Date.now(),
            query: listName,
            leadsCount: leadsWithOwner.length,
            timestamp: Date.now(),
            thumbnail: '',
            leads: leadsWithOwner
        };
        setFavoriteSearches(prev => {
            const updated = [newFav, ...prev];
            localStorage.setItem('favorite_searches', JSON.stringify(updated));
            return updated;
        });
        setViewMode(ViewMode.LIST);
        if (!searchState.query) {
            setSearchState(s => ({ ...s, query: listName }));
        }
        toast.success("Imported leads saved to 'Saved Lists'");
    };
    const handleRestoreFavorite = (fav) => {
        if (fav.leads && fav.leads.length > 0) {
            setLeads(fav.leads);
            setSearchState(s => ({ ...s, query: fav.query }));
            toast.success(`Restored list: ${fav.query}`);
            setViewMode(ViewMode.LIST);
        }
        else {
            setSearchState(s => ({ ...s, query: fav.query }));
            toast('Restored search query');
        }
        setShowMobileMenu(false);
    };
    const handleReset = () => {
        setLeads([]);
        setSearchState({
            query: '',
            isSearching: false,
            progressStep: 0,
            batchesCompleted: 0,
            totalLeads: 0,
            error: null
        });
        setFilters({
            location: '',
            industry: '',
            employees: ''
        });
        setSelectedLeadIds(new Set());
        setSelectedLead(null);
        setActiveActivityLead(null);
        localStorage.removeItem('current_leads');
        localStorage.removeItem('current_query');
        setViewMode(ViewMode.DASHBOARD);
        toast.success("Dashboard cleared");
    };
    const handleApplyStrategy = (query) => {
        setSearchState(s => ({ ...s, query }));
        setViewMode(ViewMode.DASHBOARD);
    };
    const handleSearch = async (e) => {
        e.preventDefault();
        setShowHistory(false);
        // Guard clause: Do not allow search if already running
        if (searchState.isSearching)
            return;
        if (!searchState.query.trim() || !userRef.current)
            return;
        const controller = new AbortController();
        setAbortController(controller);
        setSearchState(s => ({ ...s, isSearching: true, progressStep: 1, error: null, batchesCompleted: 0, totalLeads: 0 }));
        setLeads([]); // Clear existing leads when starting a new search
        setSelectedLeadIds(new Set());
        let fullQuery = searchState.query;
        const constraints = [];
        if (filters.location.trim())
            constraints.push(`Location: ${filters.location.trim()}`);
        if (filters.industry && filters.industry !== 'Other')
            constraints.push(`Industry: ${filters.industry}`);
        if (filters.employees)
            constraints.push(`Size: ${filters.employees}`);
        if (constraints.length > 0)
            fullQuery += ` (${constraints.join(', ')})`;
        // Accumulate leads locally to ensure correct ignore list and autosave
        let accumulatedLeads = [];
        try {
            // Stream batches
            for (let i = 0; i < MAX_BATCHES; i++) {
                if (controller.signal.aborted)
                    break;
                const batch = await generateLeadsBatch(fullQuery, BATCH_SIZE, i, accumulatedLeads.map(l => l.company));
                // Critical Fix: If aborted during await, we still want to keep the batch we just got!
                // But we stop the loop immediately after processing this batch.
                if (batch.length === 0 && i === 0) {
                    setSearchState(s => ({ ...s, error: "No leads found. Try a broader search." }));
                    break;
                }
                if (batch.length === 0)
                    break; // Stop if no more results
                // Filter duplicates against accumulated
                const uniqueBatch = batch.filter(b => !accumulatedLeads.some(al => al.company === b.company));
                if (uniqueBatch.length > 0) {
                    setLeads(prev => {
                        const newLeads = [...prev, ...uniqueBatch];
                        // Filter unique by company name to be safe
                        return newLeads.filter((v, i, a) => a.findIndex(t => (t.company === v.company)) === i);
                    });
                    accumulatedLeads = [...accumulatedLeads, ...uniqueBatch];
                    setSearchState(s => ({
                        ...s,
                        batchesCompleted: i + 1,
                        totalLeads: s.totalLeads + uniqueBatch.length,
                        progressStep: Math.min(100, (i + 1) * 20)
                    }));
                }
                // Check abort AFTER processing the batch so we don't lose data
                if (controller.signal.aborted)
                    break;
                await new Promise(r => setTimeout(r, 1500));
            }
            // Auto-save generated leads
            if (accumulatedLeads.length > 0) {
                const listName = `${searchState.query} (Auto-Saved) - ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
                const newFav = {
                    id: Date.now(),
                    query: listName,
                    leadsCount: accumulatedLeads.length,
                    timestamp: Date.now(),
                    thumbnail: '',
                    leads: accumulatedLeads
                };
                setFavoriteSearches(prev => {
                    const updated = [newFav, ...prev];
                    localStorage.setItem('favorite_searches', JSON.stringify(updated));
                    return updated;
                });
                toast.success("Results auto-saved to 'Saved Lists'");
            }
        }
        catch (err) {
            if (err.name !== 'AbortError') {
                setSearchState(s => ({ ...s, error: "Search failed. Please try again." }));
                toast.error("Search interrupted");
            }
        }
        finally {
            setSearchState(s => ({ ...s, isSearching: false, progressStep: 100 }));
            setAbortController(null);
        }
    };
    const stopSearch = (e) => {
        e?.preventDefault();
        e?.stopPropagation();
        // Only abort the controller. The handleSearch loop will catch the signal, break,
        // and its finally block will update the state.
        // This prevents race conditions where we might clear data or re-trigger renders prematurely.
        if (abortController) {
            abortController.abort();
            setAbortController(null); // Clean up immediately
            toast('Search stopping...', { icon: '🛑' });
        }
    };
    const handleNav = (view, leadId) => {
        setViewMode(view);
        if (leadId) {
            // Small timeout to allow view to change before opening drawer
            setTimeout(() => {
                const lead = leads.find(l => l.id === leadId);
                if (lead)
                    setActiveActivityLead(lead);
            }, 100);
        }
    };
    if (!user) {
        return _jsx(AuthModal, { onLogin: handleLogin, onShowTerms: () => setShowTerms(true), onShowPrivacy: () => setShowPrivacy(true) });
    }
    return (_jsxs("div", { className: "flex h-screen bg-slate-50 dark:bg-[#020617] overflow-hidden transition-colors duration-500 font-sans", children: [_jsx(Toaster, { position: "top-right", toastOptions: {
                    style: { background: darkMode ? '#1e293b' : '#fff', color: darkMode ? '#fff' : '#0f172a', border: darkMode ? '1px solid #334155' : '1px solid #e2e8f0' },
                } }), _jsxs("div", { className: `hidden md:flex flex-col bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 transition-all duration-300 z-20 shadow-sm relative ${isSidebarCollapsed ? 'w-20' : 'w-64'}`, children: [_jsxs("div", { className: `h-16 p-4 border-b border-slate-100 dark:border-slate-700 flex items-center transition-all duration-300 ${isSidebarCollapsed ? 'justify-center' : 'justify-between'}`, children: [_jsxs("div", { className: `flex items-center gap-2 overflow-hidden transition-all duration-300 ${isSidebarCollapsed ? 'w-0 opacity-0' : 'w-full opacity-100'}`, children: [_jsx("div", { className: "bg-gradient-to-br from-indigo-600 to-purple-700 text-white p-2 rounded-lg shadow-md shrink-0", children: _jsx(Sparkles, { className: "w-5 h-5" }) }), _jsxs("div", { className: "flex items-center gap-1.5", children: [_jsxs("span", { className: "relative flex h-2 w-2", children: [_jsx("span", { className: "animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" }), _jsx("span", { className: "relative inline-flex rounded-full h-2 w-2 bg-emerald-500" })] }), _jsx("p", { className: "text-xs text-slate-400 font-semibold tracking-wide whitespace-nowrap", children: t('app.online', settings.language) })] })] }), _jsx("button", { onClick: () => setIsSidebarCollapsed(!isSidebarCollapsed), className: "p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md", children: isSidebarCollapsed ? _jsx(ChevronRight, { size: 16 }) : _jsx(ChevronLeft, { size: 16 }) })] }), _jsx("div", { className: "flex-1 overflow-y-auto py-2 px-3 space-y-1", children: navGroups.map(group => {
                            const isGroupCollapsed = collapsedNavGroups[group.id];
                            return (_jsxs("div", { className: "space-y-1", children: [!isSidebarCollapsed ? (_jsxs("button", { onClick: () => toggleNavGroup(group.id), className: "w-full flex justify-between items-center px-3 pt-4 pb-2 text-xs font-bold text-slate-400 uppercase tracking-wider hover:text-slate-500 dark:hover:text-slate-300 transition-colors rounded-md", children: [_jsx("span", { children: group.label }), isGroupCollapsed ? _jsx(ChevronRight, { size: 14 }) : _jsx(ChevronDown, { size: 14 })] })) : (_jsx("div", { className: "w-10 h-px bg-slate-200 dark:bg-slate-700 my-3 mx-auto" })), (!isSidebarCollapsed && isGroupCollapsed) ? null : (_jsx("div", { className: "space-y-0.5 animate-fade-in", children: group.items.map(item => (_jsx(NavItem, { item: item, isActive: viewMode === item.id, isCollapsed: isSidebarCollapsed, onClick: () => setViewMode(item.id) }, item.id))) }))] }, group.id));
                        }) }), _jsxs("div", { className: "p-4 border-t border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50", children: [_jsxs("div", { className: "relative", ref: userMenuRef, children: [_jsxs("button", { onClick: () => setShowUserMenu(!showUserMenu), className: `w-full flex items-center gap-3 text-left p-2 rounded-lg transition-colors duration-200 ${showUserMenu
                                            ? 'bg-slate-100 dark:bg-slate-700/50'
                                            : 'hover:bg-slate-100 dark:hover:bg-slate-700/50'} ${isSidebarCollapsed ? 'justify-center' : ''}`, children: [_jsx("div", { className: "w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-md ring-2 ring-white dark:ring-slate-800 shrink-0", children: user.name?.charAt(0) || 'U' }), !isSidebarCollapsed && (_jsxs(_Fragment, { children: [_jsxs("div", { className: "flex-1 min-w-0", children: [_jsx("p", { className: "text-sm font-bold text-slate-700 dark:text-slate-200 truncate", children: user.name || 'User' }), _jsx("p", { className: "text-xs text-slate-500 mt-0.5 truncate", children: user.plan === 'free' ? 'Free Plan' : 'Team Plan' })] }), _jsx(ChevronUp, { className: `w-4 h-4 text-slate-400 transition-transform duration-300 ${showUserMenu ? 'rotate-180' : ''}` })] }))] }), showUserMenu && (_jsx("div", { className: "absolute bottom-full left-2 right-2 mb-2 animate-slide-up", children: _jsxs("div", { className: "bg-white dark:bg-slate-850 rounded-lg shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden", children: [_jsxs("div", { className: "p-4 bg-slate-50 dark:bg-slate-900/70", children: [_jsx("p", { className: "text-xs font-bold text-slate-400 uppercase tracking-wider mb-2", children: "Available Credits" }), _jsx("div", { className: "text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500", children: user.credits.toLocaleString() }), _jsx("button", { onClick: () => { setShowPricing(true); setShowUserMenu(false); }, className: "text-xs font-bold text-indigo-600 hover:underline mt-1", children: "+ Add Credits" })] }), _jsxs("button", { onClick: handleLogout, className: "w-full flex items-center gap-3 p-3 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors", children: [_jsx(LogOut, { className: "w-4 h-4" }), _jsx("span", { children: "Logout" })] })] }) }))] }), _jsxs("button", { onClick: () => setShowPricing(true), className: `w-full mt-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm ${isSidebarCollapsed ? 'px-0' : ''}`, title: "Upgrade Plan", children: [_jsx(Zap, { className: "w-3 h-3" }), " ", !isSidebarCollapsed && t('app.upgrade', settings.language)] })] })] }), showMobileMenu && (_jsxs("div", { className: "fixed inset-0 z-50 bg-slate-900/90 backdrop-blur-sm md:hidden flex flex-col p-4 animate-in slide-in-from-left-10 duration-200", children: [_jsxs("div", { className: "flex justify-between items-center mb-8", children: [_jsxs("div", { className: "flex items-center gap-2 text-white font-bold text-xl", children: [_jsx(Zap, { className: "w-6 h-6 text-indigo-400" }), " Netolyte"] }), _jsx("button", { onClick: () => setShowMobileMenu(false), className: "p-2 bg-white/10 rounded-full text-white", children: _jsx(X, { className: "w-6 h-6" }) })] }), _jsx("div", { className: "flex-1 overflow-y-auto space-y-2", children: navGroups.map(group => (_jsxs("div", { className: "mb-4", children: [_jsx("div", { className: "text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 px-3", children: group.label }), group.items.map(item => (_jsx(NavItem, { item: item, isActive: viewMode === item.id, isCollapsed: false, onClick: () => { setViewMode(item.id); setShowMobileMenu(false); } }, item.id)))] }, group.id))) })] })), _jsxs("div", { className: "flex-1 flex flex-col min-w-0 relative", children: [_jsxs("div", { className: "h-16 border-b border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md flex items-center justify-between px-4 sticky top-0 z-10", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("button", { onClick: () => setShowMobileMenu(true), className: "md:hidden p-2 text-slate-500", children: _jsx(Menu, { className: "w-6 h-6" }) }), viewingAsId && viewingAsUser && (_jsxs("div", { className: "flex items-center gap-2 px-3 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-full text-xs font-bold animate-pulse", children: [_jsx(Eye, { className: "w-3 h-3" }), " ", t('app.viewing_as', settings.language), " ", viewingAsUser.name, _jsx("button", { onClick: () => setViewingAsId(null), className: "ml-1 hover:text-amber-900", children: _jsx(X, { className: "w-3 h-3" }) })] }))] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(NotificationCenter, { notifications: notifications, onSetNotifications: setNotifications, onNavigate: handleNav }), _jsx("div", { className: "h-6 w-px bg-slate-200 dark:bg-slate-700" }), _jsx("button", { onClick: () => setShowSettingsModal(true), className: "p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors", title: "Settings", children: _jsx(SettingsIcon, { className: "w-5 h-5" }) }), _jsx("button", { onClick: () => setDarkMode(!darkMode), className: "p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors", title: "Toggle Theme", children: darkMode ? _jsx(Sun, { className: "w-5 h-5" }) : _jsx(Moon, { className: "w-5 h-5" }) })] })] }), _jsxs("div", { className: "flex-1 overflow-hidden relative", id: "dashboard-content", children: [viewMode === ViewMode.DASHBOARD && (_jsxs("div", { className: "h-full flex flex-col p-4 md:p-8 overflow-y-auto relative", children: [_jsxs("div", { className: "absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0", children: [_jsx("div", { className: "absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/5 rounded-full blur-[100px]" }), _jsx("div", { className: "absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/5 rounded-full blur-[100px]" })] }), _jsxs("div", { className: "max-w-4xl mx-auto w-full mb-8 text-center space-y-6 relative z-10", children: [_jsxs("h2", { className: "text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight", children: ["Find your next ", _jsx("span", { className: "text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-600", children: "Opportunity" })] }), _jsx("p", { className: "text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto", children: "AI-powered intelligence. Access millions of verified contacts and enrich your pipeline instantly." }), _jsxs("form", { onSubmit: handleSearch, className: "relative max-w-2xl mx-auto w-full group z-20", children: [_jsx("div", { className: "absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200" }), _jsxs("div", { className: "relative flex items-center bg-white dark:bg-slate-800 rounded-xl shadow-xl", children: [_jsx(Search, { className: "absolute left-4 w-6 h-6 text-slate-400" }), _jsx("input", { type: "text", value: searchState.query, onChange: (e) => {
                                                                    setSearchState(s => ({ ...s, query: e.target.value }));
                                                                    if (e.target.value.trim())
                                                                        setShowHistory(true);
                                                                    else
                                                                        setShowHistory(false);
                                                                }, onFocus: () => { if (searchHistory.length > 0)
                                                                    setShowHistory(true); }, placeholder: "e.g. Software companies in London", className: "w-full py-4 pl-14 pr-48 md:pr-[220px] bg-transparent text-lg border-none focus:ring-0 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400" }), _jsxs("div", { className: "absolute right-2 flex items-center gap-2", children: [searchState.isSearching ? (_jsxs("button", { type: "button", onClick: stopSearch, className: "px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-all shadow-lg shadow-red-500/30 flex items-center gap-2", children: [_jsx(X, { className: "w-5 h-5" }), " Stop"] })) : (_jsx("button", { type: "submit", className: "px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition-all shadow-lg shadow-indigo-500/30", children: "Generate" })), !searchState.isSearching && (_jsxs("button", { type: "button", onClick: () => setShowImportModal(true), className: "px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-200 font-bold rounded-lg transition-all flex items-center gap-2", title: "Import List", children: [_jsx(Upload, { className: "w-4 h-4" }), " ", _jsx("span", { className: "hidden sm:inline", children: "Import" })] }))] }), showHistory && searchHistory.length > 0 && !searchState.isSearching && (_jsxs("div", { className: "absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden z-50 animate-slide-down", children: [_jsxs("div", { className: "flex justify-between items-center px-4 py-2 bg-slate-50 dark:bg-slate-900/50 text-xs font-bold text-slate-500 uppercase", children: [_jsx("span", { children: "Recent Searches" }), _jsx("button", { onClick: clearHistory, className: "hover:text-red-500", children: "Clear" })] }), searchHistory.map((item, idx) => (_jsxs("button", { type: "button", onClick: () => handleSelectHistory(item.query), className: "w-full text-left px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 flex items-center justify-between group/item transition-colors", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx(History, { className: "w-4 h-4 text-slate-400 group-hover/item:text-indigo-500" }), _jsx("span", { className: "text-slate-700 dark:text-slate-200 font-medium", children: item.query })] }), _jsx("span", { className: "text-xs text-slate-400", children: new Date(item.date).toLocaleDateString() })] }, idx)))] }))] })] }), _jsxs("div", { className: "flex flex-wrap justify-center gap-3 text-sm", children: [_jsxs("button", { onClick: () => setShowFilters(!showFilters), className: `flex items-center gap-2 px-4 py-2 rounded-full border transition-all ${showFilters ? 'bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-900/30 dark:border-indigo-800 dark:text-indigo-300' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-indigo-300'}`, children: [_jsx(Filter, { className: "w-4 h-4" }), " Advanced Filters"] }), ['SaaS', 'Real Estate', 'Marketing Agencies', 'Startups'].map(q => (_jsx("button", { onClick: () => setSearchState(s => ({ ...s, query: q })), className: "px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full text-slate-600 dark:text-slate-300 hover:border-indigo-300 transition-colors", children: q }, q)))] }), showFilters && (_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-lg animate-slide-down text-left", children: [_jsxs("div", { children: [_jsx("label", { className: "text-xs font-bold text-slate-500 uppercase mb-1", children: "Location" }), _jsx("input", { type: "text", placeholder: "City, Country", className: "w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white", value: filters.location, onChange: e => setFilters(f => ({ ...f, location: e.target.value })) })] }), _jsxs("div", { children: [_jsx("label", { className: "text-xs font-bold text-slate-500 uppercase mb-1", children: "Industry" }), _jsxs("select", { className: "w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white", value: filters.industry, onChange: e => setFilters(f => ({ ...f, industry: e.target.value })), children: [_jsx("option", { value: "", children: "Any" }), INDUSTRIES.map(i => _jsx("option", { value: i, children: i }, i))] })] }), _jsxs("div", { children: [_jsx("label", { className: "text-xs font-bold text-slate-500 uppercase mb-1", children: "Company Size" }), _jsxs("select", { className: "w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white", value: filters.employees, onChange: e => setFilters(f => ({ ...f, employees: e.target.value })), children: [_jsx("option", { value: "", children: "Any" }), _jsx("option", { value: "1-10", children: "1-10" }), _jsx("option", { value: "11-50", children: "11-50" }), _jsx("option", { value: "51-200", children: "51-200" }), _jsx("option", { value: "201-500", children: "201-500" }), _jsx("option", { value: "500+", children: "500+" })] })] })] }))] }), searchState.isSearching && (_jsxs("div", { className: "max-w-2xl mx-auto w-full mb-8 relative z-10", children: [_jsxs("div", { className: "flex justify-between text-sm font-medium text-slate-600 dark:text-slate-300 mb-2", children: [_jsxs("span", { className: "flex items-center gap-2", children: [_jsx(Loader2, { className: "w-4 h-4 animate-spin text-indigo-500" }), " AI Agent Working..."] }), _jsxs("span", { children: [Math.round(searchState.progressStep), "%"] })] }), _jsx("div", { className: "h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden", children: _jsx("div", { className: "h-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-500 ease-out", style: { width: `${searchState.progressStep}%` } }) }), _jsxs("div", { className: "text-center mt-2 text-xs text-slate-400", children: ["Scanning ", searchState.batchesCompleted + 1, " / ", MAX_BATCHES, " batches \u2022 Found ", searchState.totalLeads, " leads"] })] })), visibleLeads.length > 0 && (_jsxs("div", { className: "relative z-10", children: [_jsx(Dashboard, { leads: visibleLeads }), _jsxs("div", { className: "flex justify-between items-center mt-8 mb-4", children: [_jsxs("h3", { className: "text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2", children: [_jsx(List, { className: "w-5 h-5 text-indigo-600" }), " ", searchState.isSearching ? 'Generating Results...' : 'Recent Results'] }), _jsxs("div", { className: "flex gap-2", children: [_jsxs("button", { onClick: handleReset, className: "px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-red-600 dark:hover:text-red-400 rounded-lg text-sm font-bold transition-colors flex items-center gap-2 shadow-sm", children: [_jsx(RotateCcw, { className: "w-4 h-4" }), " Start Fresh"] }), _jsxs("button", { onClick: () => setViewMode(ViewMode.LIST), className: "px-4 py-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg text-sm font-bold hover:bg-indigo-100 transition-colors flex items-center gap-2", children: ["View All ", _jsx(ArrowRight, { className: "w-4 h-4" })] })] })] }), _jsx("div", { className: "h-[400px]", children: _jsx(LeadTable, { leads: [...visibleLeads].slice().reverse().slice(0, 5), selectedIds: selectedLeadIds, onToggleSelect: handleToggleSelect, onSelectAll: handleSelectAll, onStatusChange: handleStatusChange, onOpenEmail: (l) => { setSelectedLead(l); }, onViewDetails: (l) => setSelectedLeadDetails(l) }) })] })), visibleLeads.length === 0 && !searchState.isSearching && (_jsxs("div", { className: "flex-1 flex flex-col items-center justify-center text-center p-8 animate-fade-in relative z-10", children: [_jsx("div", { className: "w-24 h-24 bg-white dark:bg-slate-800 rounded-3xl shadow-xl shadow-indigo-500/10 flex items-center justify-center mb-6 border border-slate-100 dark:border-slate-700 transform rotate-3 transition-transform hover:rotate-6 duration-500", children: _jsx("div", { className: "w-16 h-16 bg-gradient-to-tr from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-white shadow-lg", children: _jsx(Sparkles, { className: "w-8 h-8" }) }) }), _jsx("h2", { className: "text-3xl font-bold text-slate-900 dark:text-white mb-3 tracking-tight", children: "Ready to Grow?" }), _jsx("p", { className: "text-lg text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed mb-8", children: "Enter your target criteria above to generate high-quality contacts and enrich your pipeline using AI." })] }))] })), viewMode === ViewMode.LIST && (_jsxs("div", { className: "h-full flex flex-col", children: [_jsxs("div", { className: "p-4 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex justify-between items-center", children: [_jsxs("div", { className: "flex items-center gap-4", children: [_jsx("h2", { className: "text-xl font-bold text-slate-900 dark:text-white", children: "Contacts Database" }), _jsx("div", { className: "h-6 w-px bg-slate-300 dark:bg-slate-600" }), _jsxs("span", { className: "text-sm text-slate-500", children: [visibleLeads.length, " contacts found"] })] }), _jsxs("div", { className: "flex gap-2", children: [_jsxs("button", { onClick: () => setShowImportModal(true), className: "px-3 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-700 dark:text-white rounded-lg text-sm font-bold transition-colors flex items-center gap-2", children: [_jsx(Upload, { className: "w-4 h-4" }), " Import"] }), _jsxs("button", { onClick: saveAsFavorite, className: "px-3 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-700 dark:text-white rounded-lg text-sm font-bold transition-colors flex items-center gap-2", children: [_jsx(Star, { className: "w-4 h-4" }), " Save List"] }), _jsxs("button", { onClick: () => setShowExportModal(true), className: "px-3 py-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg text-sm font-bold transition-colors flex items-center gap-2", children: [_jsx(Download, { className: "w-4 h-4" }), " Export"] })] })] }), _jsx("div", { className: "flex-1 overflow-hidden p-4 bg-slate-50 dark:bg-[#020617]", children: _jsx(LeadTable, { leads: visibleLeads, selectedIds: selectedLeadIds, onToggleSelect: handleToggleSelect, onSelectAll: handleSelectAll, onStatusChange: handleStatusChange, onOpenEmail: (l) => { setSelectedLead(l); }, onOpenActivity: (l) => { setActiveActivityLead(l); }, onViewDetails: (l) => setSelectedLeadDetails(l), sequences: sequences, onAddToSequence: handleAddToSequence }) }), selectedLeadIds.size > 0 && (_jsxs("div", { className: "absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-slate-900 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-6 z-30 animate-slide-up", children: [_jsxs("span", { className: "font-bold", children: [selectedLeadIds.size, " selected"] }), _jsx("div", { className: "h-4 w-px bg-slate-700" }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsxs("span", { className: "text-sm font-medium text-slate-400 flex items-center gap-1", children: [_jsx(UserPlus, { className: "w-3 h-3" }), " Assign:"] }), _jsxs("select", { onChange: (e) => { if (e.target.value)
                                                            handleBulkAssign(e.target.value); }, className: "bg-slate-800 text-white text-sm border border-slate-700 rounded px-2 py-1 outline-none focus:border-indigo-500 cursor-pointer", value: "", children: [_jsx("option", { value: "", children: "Select User..." }), _jsx("option", { value: user.id, children: "Me" }), teamMembers.filter(m => m.id !== user.id).map(m => (_jsx("option", { value: m.id, children: m.name }, m.id)))] })] }), _jsx("div", { className: "h-4 w-px bg-slate-700" }), _jsxs("button", { onClick: () => setShowWhatsAppModal(true), className: "hover:text-green-400 transition-colors flex items-center gap-2 text-sm font-medium", children: [_jsx(MessageCircle, { className: "w-4 h-4" }), " WhatsApp"] }), _jsxs("button", { onClick: () => setShowSMSModal(true), className: "hover:text-orange-400 transition-colors flex items-center gap-2 text-sm font-medium", children: [_jsx(MessageSquare, { className: "w-4 h-4" }), " SMS"] }), _jsxs("button", { onClick: () => {
                                                    const ids = Array.from(selectedLeadIds);
                                                    const selected = leads.filter(l => ids.includes(l.id));
                                                    exportToCSV(selected, "Selected_Leads");
                                                }, className: "hover:text-indigo-400 transition-colors flex items-center gap-2 text-sm font-medium", children: [_jsx(Download, { className: "w-4 h-4" }), " Export"] }), _jsx("div", { className: "h-4 w-px bg-slate-700" }), _jsx("button", { onClick: () => {
                                                    const updatedLeads = leads.filter(l => !selectedLeadIds.has(l.id));
                                                    setLeads(updatedLeads);
                                                    setSelectedLeadIds(new Set());
                                                    toast.error(`Removed ${selectedLeadIds.size} leads`);
                                                }, className: "text-red-500 hover:text-red-400 transition-colors", title: "Delete Selected", children: _jsx(Ban, { className: "w-4 h-4" }) })] }))] })), viewMode === ViewMode.MAP && _jsx("div", { className: "p-4 h-full", children: _jsx(MapView, { leads: visibleLeads }) }), viewMode === ViewMode.PIPELINE && _jsx(PipelineBoard, { leads: visibleLeads, onStatusChange: handleStatusChange }), viewMode === ViewMode.COMPETITORS && _jsx(CompetitorScanner, { onAddLeads: handleImport, defaultLocation: filters.location }), viewMode === ViewMode.EMAIL_WARMUP && _jsx(EmailWarmup, {}), viewMode === ViewMode.LOOKALIKE && _jsx(LookalikeFinder, { onAddLeads: handleImport }), viewMode === ViewMode.ROLEPLAY && _jsx(RoleplayDojo, { leads: visibleLeads }), viewMode === ViewMode.SEQUENCES && _jsx(SequenceBuilder, { sequences: sequences, onSaveSequence: (seq) => {
                                    const exists = sequences.some(s => s.id === seq.id);
                                    if (exists)
                                        setSequences(sequences.map(s => s.id === seq.id ? seq : s));
                                    else
                                        setSequences([...sequences, seq]);
                                } }), viewMode === ViewMode.DIALER && _jsx(PowerDialer, { leads: visibleLeads, onExit: () => setViewMode(ViewMode.LIST), onUpdateLead: (updated) => {
                                    setLeads(prev => prev.map(l => l.id === updated.id ? updated : l));
                                } }), viewMode === ViewMode.STRATEGY && _jsx(SalesStrategyView, { onApplyStrategy: handleApplyStrategy }), viewMode === ViewMode.SAVED && _jsx(SavedLists, { savedLists: favoriteSearches, onRestore: handleRestoreFavorite, onDelete: deleteFavorite, onRename: handleRenameFavorite }), viewMode === ViewMode.REPORTS && _jsx(ReportsView, { leads: leads, teamMembers: teamMembers, currentUser: user }), viewMode === ViewMode.TEAM && _jsx(TeamManagement, { currentUser: user, onViewAs: setViewingAsId, viewingAsId: viewingAsId, leads: leads }), viewMode === ViewMode.SIGNALS && _jsx(LeadSignals, { leads: leads }), viewMode === ViewMode.BOOKING && _jsx(BookingCalendar, { settings: bookingSettings, onSave: setBookingSettings })] }), selectedLead && (_jsx(EmailSequenceModal, { lead: selectedLead, isOpen: !!selectedLead, onClose: () => setSelectedLead(null), brandVoice: settings.brandVoice, bookingSettings: bookingSettings })), activeActivityLead && (_jsx(ActivityDrawer, { lead: activeActivityLead, isOpen: !!activeActivityLead, onClose: () => setActiveActivityLead(null), onAddNote: handleAddNote, onAssignLead: handleAssignLead, teamMembers: teamMembers.map(m => m.name || 'Unknown') })), _jsx(LeadDetailsModal, { lead: selectedLeadDetails, onClose: () => setSelectedLeadDetails(null), onUpdate: handleUpdateLead }), showWhatsAppModal && (_jsx(WhatsAppCampaignModal, { leads: leads.filter(l => selectedLeadIds.has(l.id)), isOpen: showWhatsAppModal, onClose: () => setShowWhatsAppModal(false), brandVoice: settings.brandVoice })), showSMSModal && (_jsx(SMSCampaignModal, { leads: leads.filter(l => selectedLeadIds.has(l.id)), isOpen: showSMSModal, onClose: () => setShowSMSModal(false), brandVoice: settings.brandVoice })), _jsx(PricingModal, { isOpen: showPricing, onClose: () => setShowPricing(false), onPurchase: handlePurchase }), _jsx(TermsModal, { isOpen: showTerms, onClose: () => setShowTerms(false) }), _jsx(PrivacyModal, { isOpen: showPrivacy, onClose: () => setShowPrivacy(false) }), _jsx(ExportModal, { isOpen: showExportModal, onClose: () => setShowExportModal(false), leads: visibleLeads, query: searchState.query }), _jsx(SettingsModal, { isOpen: showSettingsModal, onClose: () => setShowSettingsModal(false), settings: settings, onSave: setSettings, onAddLeads: handleImport }), _jsx(ImportModal, { isOpen: showImportModal, onClose: () => setShowImportModal(false), onImport: handleImport }), _jsx(CallWidget, { callState: callState, activeCall: activeCall, onAccept: acceptCall, onReject: rejectCall, onEnd: endCall, onMute: toggleMute, onToggleVideo: toggleVideo, isMuted: isMuted, isVideoEnabled: isVideoEnabled, remoteAudioRef: remoteAudioRef, localStream: localStream, remoteStream: remoteStream }), user && _jsx(ChatWidget, { currentUser: user, onStartCall: startCall })] })] }));
}
