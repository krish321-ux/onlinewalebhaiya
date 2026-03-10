'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Bot, X, MessageCircle, Paperclip, Upload, CheckCircle2 } from 'lucide-react';
import { chatbotAPI } from '@/lib/api';

type Message = {
    role: 'user' | 'bot';
    content: string;
    type?: 'text' | 'file' | 'success' | 'auto-delete';
    deleteCountdown?: number;
};

const QUICK_SUGGESTIONS = [
    { label: '🎓 Scholarship', text: 'Scholarship ke baare mein batao' },
    { label: '💼 Job Forms', text: 'Job form kaise bhare?' },
    { label: '📇 PAN Card', text: 'PAN card ke liye kya documents chahiye?' },
    { label: '📄 Documents', text: 'Kya kya documents required hain?' },
    { label: '📝 Form Fillup', text: 'Form fillup ke liye kya karna hoga?' },
];

// WhatsApp SVG icon
function WhatsAppIcon({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
    );
}

// Typing animation dots
function TypingDots() {
    return (
        <div className="flex justify-start">
            <div className="bg-zinc-800 px-4 py-2.5 rounded-xl rounded-bl-none flex items-center gap-1.5">
                <span className="w-2 h-2 bg-[#E8652D] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-[#E8652D] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-[#E8652D] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
        </div>
    );
}

function generateSessionId() {
    return `sess-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export default function FloatingChat() {
    const [menuOpen, setMenuOpen] = useState(false);
    const [chatOpen, setChatOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        { role: 'bot', content: 'Hi! 👋 I\'m **Liza**, your personal assistant at OnlineWaleBhaiya. Ask me anything about jobs, scholarships, or our services!\n\nNeed help? Just tell me — e.g. "I want to apply for PAN card" 🎯', type: 'text' }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [sessionId] = useState(generateSessionId);
    const [chatState, setChatState] = useState('idle');
    const [conversationId, setConversationId] = useState<string | null>(null);
    const [showSuggestions, setShowSuggestions] = useState(true);
    const menuRef = useRef<HTMLDivElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Close menu when clicking outside
    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setMenuOpen(false);
            }
        }
        if (menuOpen) document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [menuOpen]);

    // Auto-scroll chat
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, loading, uploading]);

    // Countdown timer for auto-delete messages
    useEffect(() => {
        const hasCountdown = messages.some(m => m.type === 'auto-delete' && m.deleteCountdown && m.deleteCountdown > 0);
        if (!hasCountdown) return;
        const timer = setInterval(() => {
            setMessages(prev => prev.map(m => {
                if (m.type === 'auto-delete' && m.deleteCountdown && m.deleteCountdown > 0) {
                    const newCount = m.deleteCountdown - 1;
                    return {
                        ...m,
                        deleteCountdown: newCount,
                        content: newCount > 0
                            ? `⏱️ Document will be auto-deleted in ${newCount}s for your security.`
                            : '🗑️ Document auto-deleted for your security.'
                    };
                }
                return m;
            }));
        }, 1000);
        return () => clearInterval(timer);
    }, [messages]);

    // Poll for admin messages when conversation is active
    const lastPollTime = useRef<string | null>(null);
    const seenAdminMsgIds = useRef<Set<string>>(new Set());
    useEffect(() => {
        if (!conversationId || !chatOpen) return;
        // Initialize poll time to now
        if (!lastPollTime.current) {
            lastPollTime.current = new Date().toISOString();
        }
        const pollInterval = setInterval(async () => {
            try {
                const afterParam = lastPollTime.current ? `?after=${encodeURIComponent(lastPollTime.current)}` : '';
                const res = await fetch(`/api/chatbot/messages/${conversationId}${afterParam}`);
                if (!res.ok) return;
                const adminMsgs: { id: string; sender: string; message: string; timestamp: string }[] = await res.json();
                if (adminMsgs.length > 0) {
                    const newMsgs = adminMsgs.filter(m => !seenAdminMsgIds.current.has(m.id));
                    if (newMsgs.length > 0) {
                        newMsgs.forEach(m => seenAdminMsgIds.current.add(m.id));
                        setMessages(prev => [
                            ...prev,
                            ...newMsgs.map(m => ({
                                role: 'bot' as const,
                                content: `👨‍💼 **Admin:** ${m.message}`,
                                type: 'text' as const,
                            }))
                        ]);
                        lastPollTime.current = newMsgs[newMsgs.length - 1].timestamp;
                    }
                }
            } catch (err) {
                // Silently ignore poll failures
            }
        }, 5000);
        return () => clearInterval(pollInterval);
    }, [conversationId, chatOpen]);

    const sendMessage = async (question: string) => {
        if (!question.trim() || loading) return;

        setMessages(prev => [...prev, { role: 'user', content: question.trim(), type: 'text' }]);
        setInput('');
        setLoading(true);
        setShowSuggestions(false);

        try {
            const response = await chatbotAPI.sendMessage(sessionId, question.trim());
            setMessages(prev => [...prev, { role: 'bot', content: response.answer, type: response.source === 'lead_created' ? 'success' : 'text' }]);
            setChatState(response.state);
            if (response.conversationId) {
                setConversationId(response.conversationId);
            }
        } catch {
            setMessages(prev => [...prev, { role: 'bot', content: 'Sorry, I could not process your request. Please try again.', type: 'text' }]);
        } finally {
            setLoading(false);
        }
    };

    const handleSend = () => sendMessage(input);

    const handleSuggestionClick = (text: string) => {
        sendMessage(text);
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file
        const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
        if (!allowed.includes(file.type)) {
            setMessages(prev => [...prev, { role: 'bot', content: '❌ Only images (JPG, PNG) and PDFs are allowed.', type: 'text' }]);
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            setMessages(prev => [...prev, { role: 'bot', content: '❌ File too large. Maximum 5MB allowed.', type: 'text' }]);
            return;
        }

        setMessages(prev => [...prev, { role: 'user', content: `📎 ${file.name}`, type: 'file' }]);
        setUploading(true);

        try {
            const result = await chatbotAPI.uploadFile(sessionId, file, conversationId);
            setMessages(prev => [...prev, { role: 'bot', content: result.message, type: result.success ? 'success' : 'text' }]);
            // Show auto-delete countdown if server confirms auto-deletion
            if (result.autoDeleteSeconds) {
                setMessages(prev => [...prev, {
                    role: 'bot',
                    content: `⏱️ Document will be auto-deleted in ${result.autoDeleteSeconds}s for your security.`,
                    type: 'auto-delete',
                    deleteCountdown: result.autoDeleteSeconds
                }]);
            }
        } catch {
            setMessages(prev => [...prev, { role: 'bot', content: '❌ Upload failed. Please try again.', type: 'text' }]);
        } finally {
            setUploading(false);
            // Reset file input
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleFABClick = () => {
        if (chatOpen) {
            setChatOpen(false);
        } else {
            setMenuOpen(!menuOpen);
        }
    };

    const openWhatsApp = () => {
        setMenuOpen(false);
        window.open('https://wa.me/918581823795', '_blank');
    };

    const openWebChat = () => {
        setMenuOpen(false);
        setChatOpen(true);
    };

    const getPlaceholder = () => {
        switch (chatState) {
            case 'awaiting_name': return 'Enter your full name...';
            case 'awaiting_phone': return 'Enter your phone number...';
            default: return 'Type your question...';
        }
    };

    return (
        <div ref={menuRef} className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 flex flex-col items-end gap-3 pb-safe">
            {/* ── Chat Window ── */}
            {chatOpen && (
                <div className="w-[calc(100vw-2rem)] sm:w-80 md:w-96 bg-[#111] rounded-2xl shadow-2xl border border-zinc-800 flex flex-col max-h-[75dvh] sm:max-h-[70vh] animate-fade-in-up">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-[#E8652D] to-[#FF7A42] text-white px-4 py-3 rounded-t-2xl flex items-center gap-2 shrink-0">
                        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                            <Bot className="h-4 w-4" />
                        </div>
                        <div className="flex-1">
                            <span className="font-bold text-sm">Liza ✨</span>
                            {chatState !== 'idle' && chatState !== 'lead_created' && (
                                <span className="block text-xs opacity-75 capitalize">{chatState.replace(/_/g, ' ')}</span>
                            )}
                            {chatState === 'idle' && (
                                <span className="block text-xs opacity-75">Your AI Assistant • Always online</span>
                            )}
                        </div>
                        {conversationId && (
                            <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">Lead Active</span>
                        )}
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[200px]">
                        {messages.map((msg, i) => (
                            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[85%] px-3 py-2 rounded-2xl text-sm whitespace-pre-line leading-relaxed ${msg.role === 'user'
                                    ? msg.type === 'file'
                                        ? 'bg-[#E8652D]/80 text-white rounded-br-sm flex items-center gap-1.5'
                                        : 'bg-[#E8652D] text-white rounded-br-sm'
                                    : msg.type === 'success'
                                        ? 'bg-green-900/40 text-green-200 rounded-bl-sm border border-green-700/30'
                                        : msg.type === 'auto-delete'
                                            ? `rounded-bl-sm border ${msg.deleteCountdown && msg.deleteCountdown > 0 ? 'bg-amber-900/30 text-amber-200 border-amber-700/30' : 'bg-red-900/30 text-red-300 border-red-700/30'}`
                                            : 'bg-zinc-800 text-zinc-200 rounded-bl-sm'
                                    }`}>
                                    {msg.type === 'file' && <Paperclip className="h-3.5 w-3.5 shrink-0" />}
                                    {msg.type === 'success' && msg.role === 'bot' && <CheckCircle2 className="h-4 w-4 text-green-400 shrink-0 inline mr-1" />}
                                    {(() => {
                                        // Check for embedded file URL from admin messages
                                        const fileUrlMatch = msg.content.match(/\[file_url\](.*?)\[\/file_url\]/);
                                        const fileTypeMatch = msg.content.match(/\[file_type\](.*?)\[\/file_type\]/);
                                        if (fileUrlMatch) {
                                            const url = fileUrlMatch[1];
                                            const fType = fileTypeMatch?.[1] || '';
                                            const textPart = msg.content.replace(/\[file_url\].*?\[\/file_url\]/, '').replace(/\[file_type\].*?\[\/file_type\]/, '').trim();
                                            return (
                                                <div>
                                                    {textPart && <p className="mb-2">{textPart}</p>}
                                                    {fType.startsWith('image/') ? (
                                                        <a href={url} target="_blank" rel="noopener noreferrer">
                                                            <img src={url} alt="Admin shared image" className="rounded-lg max-w-full max-h-48 object-cover cursor-pointer hover:opacity-90 transition-opacity" />
                                                        </a>
                                                    ) : fType.startsWith('video/') ? (
                                                        <video src={url} controls className="rounded-lg max-w-full max-h-48" />
                                                    ) : (
                                                        <a href={url} target="_blank" rel="noopener noreferrer"
                                                            className="flex items-center gap-2 mt-1 px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-xs">
                                                            <Paperclip className="h-3.5 w-3.5" />
                                                            <span className="underline">Open / Download</span>
                                                        </a>
                                                    )}
                                                </div>
                                            );
                                        }
                                        return msg.content;
                                    })()}
                                </div>
                            </div>
                        ))}

                        {/* Quick Suggestions */}
                        {showSuggestions && messages.length <= 1 && (
                            <div className="flex flex-wrap gap-2 pt-1">
                                {QUICK_SUGGESTIONS.map((s, i) => (
                                    <button
                                        key={i}
                                        onClick={() => handleSuggestionClick(s.text)}
                                        className="text-xs px-3 py-1.5 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700 hover:border-[#E8652D]/50 hover:text-[#FF7A42] hover:bg-zinc-800/80 transition-all whitespace-nowrap"
                                    >
                                        {s.label}
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Typing Animation */}
                        {(loading || uploading) && (
                            uploading ? (
                                <div className="flex justify-start">
                                    <div className="bg-zinc-800 px-3 py-2 rounded-xl rounded-bl-none flex items-center gap-2">
                                        <Upload className="h-4 w-4 animate-pulse text-[#E8652D]" />
                                        <span className="text-xs text-zinc-400">Uploading...</span>
                                    </div>
                                </div>
                            ) : (
                                <TypingDots />
                            )
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="p-3 border-t border-zinc-800 shrink-0">
                        <form onSubmit={e => { e.preventDefault(); handleSend(); }} className="flex gap-2 items-center">
                            {/* File Upload Button */}
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/jpeg,image/jpg,image/png,application/pdf"
                                className="hidden"
                                onChange={handleFileUpload}
                            />
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={uploading}
                                className="text-zinc-400 hover:text-[#E8652D] transition-colors disabled:opacity-50 p-1.5 rounded-lg hover:bg-zinc-800"
                                title="Upload document (JPG, PNG, PDF)"
                            >
                                <Paperclip className="h-4 w-4" />
                            </button>

                            <input
                                type="text"
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                className="flex-1 px-3 py-2 text-sm rounded-lg bg-zinc-800 border border-zinc-700 outline-none focus:ring-1 focus:ring-[#E8652D] text-white placeholder-zinc-500"
                                placeholder={getPlaceholder()}
                                disabled={loading || uploading}
                            />
                            <button
                                type="submit"
                                disabled={loading || uploading || !input.trim()}
                                className="bg-[#E8652D] text-white p-2 rounded-lg hover:bg-[#FF7A42] transition-colors disabled:opacity-50"
                            >
                                <Send className="h-4 w-4" />
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* ── Pop-up Menu (2 options) ── */}
            {menuOpen && !chatOpen && (
                <div className="flex flex-col gap-2 animate-fade-in-up">
                    {/* WhatsApp Option */}
                    <button
                        onClick={openWhatsApp}
                        className="flex items-center gap-2 sm:gap-3 bg-[#111] pl-3 pr-4 sm:pl-4 sm:pr-5 py-2.5 sm:py-3 rounded-full shadow-lg border border-zinc-800 hover:border-green-500/50 hover:shadow-[0_0_20px_rgba(34,197,94,0.2)] hover:scale-[1.03] transition-all group"
                    >
                        <span className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-green-500 flex items-center justify-center shrink-0">
                            <WhatsAppIcon className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                        </span>
                        <span className="text-xs sm:text-sm font-semibold text-zinc-300 group-hover:text-green-400 transition-colors whitespace-nowrap">WhatsApp</span>
                    </button>

                    {/* Website Chat Option */}
                    <button
                        onClick={openWebChat}
                        className="flex items-center gap-2 sm:gap-3 bg-[#111] pl-3 pr-4 sm:pl-4 sm:pr-5 py-2.5 sm:py-3 rounded-full shadow-lg border border-zinc-800 hover:border-[#E8652D]/50 hover:shadow-[0_0_20px_rgba(232,101,45,0.2)] hover:scale-[1.03] transition-all group"
                    >
                        <span className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#E8652D] flex items-center justify-center shrink-0">
                            <Bot className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                        </span>
                        <span className="text-xs sm:text-sm font-semibold text-zinc-300 group-hover:text-[#FF7A42] transition-colors whitespace-nowrap">Chat with Liza</span>
                    </button>
                </div>
            )}

            {/* ── Single FAB Button ── */}
            <button
                onClick={handleFABClick}
                className={`w-14 h-14 rounded-full shadow-xl flex items-center justify-center transition-all duration-300 hover:scale-110 ${chatOpen
                    ? 'bg-zinc-700 hover:bg-zinc-600'
                    : menuOpen
                        ? 'bg-red-500 hover:bg-red-600 rotate-45'
                        : 'bg-gradient-to-br from-[#E8652D] to-[#FF7A42] hover:from-[#FF7A42] hover:to-[#E8652D] animate-pulse-glow'
                    }`}
                aria-label="Chat options"
            >
                {chatOpen ? (
                    <X className="h-6 w-6 text-white" />
                ) : menuOpen ? (
                    <X className="h-6 w-6 text-white -rotate-45" />
                ) : (
                    <MessageCircle className="h-6 w-6 text-white" />
                )}
            </button>
        </div>
    );
}
