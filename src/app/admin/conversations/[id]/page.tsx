'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Loader2, ArrowLeft, User, Bot, Download, FileText, Image as ImageIcon, Phone, Calendar, MessageSquare, Send, Paperclip, Video, X } from 'lucide-react';
import { conversationAPI } from '@/lib/api';

const STATUS_COLORS: Record<string, string> = {
    NEW: 'bg-[#E8652D]/10 text-[#E8652D] dark:bg-[#E8652D]/20 dark:text-[#FF7A42]',
    CONTACTED: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
    COMPLETED: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
};

function getFileIcon(fileType: string) {
    if (fileType?.startsWith('image/')) return <ImageIcon className="h-4 w-4" />;
    if (fileType?.startsWith('video/')) return <Video className="h-4 w-4" />;
    return <FileText className="h-4 w-4" />;
}

export default function ConversationDetail() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;

    const [conversation, setConversation] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [replyText, setReplyText] = useState('');
    const [sending, setSending] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const chatEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (id) loadConversation();
    }, [id]);

    // Auto-refresh conversation every 10s so auto-deleted files disappear from UI
    useEffect(() => {
        if (!id) return;
        const poll = setInterval(() => {
            conversationAPI.getById(id as string).then(data => {
                setConversation(data);
            }).catch(() => { });
        }, 10_000);
        return () => clearInterval(poll);
    }, [id]);

    useEffect(() => {
        scrollToBottom();
    }, [conversation?.messages]);

    const scrollToBottom = () => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const loadConversation = async () => {
        try {
            const data = await conversationAPI.getById(id);
            setConversation(data);
        } catch (err) {
            console.error('Failed to load conversation:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (status: string) => {
        try {
            await conversationAPI.updateStatus(id, status);
            setConversation((prev: any) => ({ ...prev, status }));
        } catch (err) {
            console.error('Failed to update status:', err);
        }
    };

    const handleSendReply = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!replyText.trim() && !selectedFile) return;
        setSending(true);
        try {
            if (selectedFile) {
                await conversationAPI.sendFile(id, selectedFile, replyText.trim() || undefined);
                setSelectedFile(null);
            } else {
                await conversationAPI.sendReply(id, replyText.trim());
            }
            setReplyText('');
            await loadConversation();
        } catch (err) {
            console.error('Failed to send reply:', err);
            alert('Failed to send. Please try again.');
        } finally {
            setSending(false);
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[60vh]">
                <Loader2 className="h-8 w-8 animate-spin text-[#E8652D]" />
            </div>
        );
    }

    if (!conversation) {
        return (
            <div className="text-center py-16 text-zinc-500">
                <MessageSquare className="h-12 w-12 mx-auto mb-3 text-zinc-300" />
                Conversation not found.
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
                <button
                    onClick={() => router.push('/admin/conversations')}
                    className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                >
                    <ArrowLeft className="h-5 w-5 text-zinc-600 dark:text-zinc-400" />
                </button>
                <div className="flex-1">
                    <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
                        {conversation.name || 'Unknown'}
                    </h1>
                    <div className="flex items-center gap-4 mt-1 text-sm text-zinc-500">
                        <span className="flex items-center gap-1">
                            <Phone className="h-3.5 w-3.5" />
                            {conversation.phone || 'N/A'}
                        </span>
                        <span className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5" />
                            {new Date(conversation.created_at).toLocaleString()}
                        </span>
                    </div>
                </div>
                <select
                    value={conversation.status}
                    onChange={e => handleStatusUpdate(e.target.value)}
                    className={`text-sm font-medium px-4 py-2 rounded-lg border-0 outline-none cursor-pointer ${STATUS_COLORS[conversation.status] || ''}`}
                >
                    <option value="NEW">NEW</option>
                    <option value="CONTACTED">CONTACTED</option>
                    <option value="COMPLETED">COMPLETED</option>
                </select>
            </div>

            {/* Service Request */}
            {conversation.service_message && (
                <div className="bg-[#E8652D]/5 dark:bg-[#E8652D]/10 border border-[#E8652D]/20 rounded-xl p-4 mb-6">
                    <p className="text-xs text-[#E8652D] font-medium uppercase mb-1">Service Request</p>
                    <p className="text-zinc-900 dark:text-white">{conversation.service_message}</p>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Chat Messages + Reply Composer */}
                <div className="lg:col-span-2">
                    <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 overflow-hidden flex flex-col" style={{ maxHeight: '75vh' }}>
                        <div className="px-6 py-4 border-b border-zinc-100 dark:border-zinc-800">
                            <h2 className="font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                                <MessageSquare className="h-4 w-4" />
                                Chat History
                            </h2>
                        </div>
                        <div className="flex-1 p-4 space-y-3 overflow-y-auto">
                            {(!conversation.messages || conversation.messages.length === 0) ? (
                                <p className="text-center text-zinc-500 py-8">No messages recorded.</p>
                            ) : (
                                conversation.messages.map((msg: any) => (
                                    <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[80%] px-3 py-2 rounded-xl text-sm whitespace-pre-line ${msg.sender === 'user'
                                            ? 'bg-[#E8652D] text-white rounded-br-none'
                                            : msg.sender === 'admin'
                                                ? 'bg-blue-600 text-white rounded-bl-none'
                                                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 rounded-bl-none'
                                            }`}>
                                            <div className="flex items-center gap-1.5 mb-0.5">
                                                {msg.sender === 'user' ? (
                                                    <User className="h-3 w-3" />
                                                ) : msg.sender === 'admin' ? (
                                                    <User className="h-3 w-3" />
                                                ) : (
                                                    <Bot className="h-3 w-3" />
                                                )}
                                                <span className="text-[10px] opacity-70 uppercase font-medium">{msg.sender}</span>
                                            </div>
                                            {msg.message}
                                        </div>
                                    </div>
                                ))
                            )}
                            <div ref={chatEndRef} />
                        </div>

                        {/* Reply Composer */}
                        <div className="border-t border-zinc-100 dark:border-zinc-800 p-3 bg-zinc-50 dark:bg-zinc-800/50">
                            {selectedFile && (
                                <div className="flex items-center gap-2 mb-2 bg-blue-900/20 border border-blue-700/30 text-blue-300 px-3 py-2 rounded-lg text-xs">
                                    <Paperclip className="h-3.5 w-3.5 shrink-0" />
                                    <span className="truncate flex-1">{selectedFile.name}</span>
                                    <span className="text-blue-400 shrink-0">({(selectedFile.size / 1024).toFixed(0)} KB)</span>
                                    <button onClick={() => setSelectedFile(null)} className="shrink-0 hover:text-red-400">
                                        <X className="h-3.5 w-3.5" />
                                    </button>
                                </div>
                            )}
                            <form onSubmit={handleSendReply} className="flex items-center gap-2">
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    className="hidden"
                                    accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
                                    onChange={handleFileSelect}
                                />
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="p-2.5 rounded-lg text-zinc-400 hover:text-[#E8652D] hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
                                    title="Attach file"
                                >
                                    <Paperclip className="h-5 w-5" />
                                </button>
                                <input
                                    type="text"
                                    value={replyText}
                                    onChange={e => setReplyText(e.target.value)}
                                    placeholder="Type your reply..."
                                    className="flex-1 px-4 py-2.5 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 outline-none focus:ring-1 focus:ring-blue-500 text-zinc-900 dark:text-white text-sm"
                                    disabled={sending}
                                />
                                <button
                                    type="submit"
                                    disabled={sending || (!replyText.trim() && !selectedFile)}
                                    className="p-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    title="Send reply"
                                >
                                    {sending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                                </button>
                            </form>
                            <p className="text-[10px] text-zinc-500 mt-1.5">
                                📎 Attach images, videos, PDFs, or documents. Messages are sent as Admin.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Files Panel */}
                <div>
                    <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 overflow-hidden">
                        <div className="px-6 py-4 border-b border-zinc-100 dark:border-zinc-800">
                            <h2 className="font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                                <FileText className="h-4 w-4" />
                                Files
                                {conversation.files?.length > 0 && (
                                    <span className="ml-auto text-xs bg-[#E8652D]/10 text-[#E8652D] px-2 py-0.5 rounded-full">
                                        {conversation.files.length}
                                    </span>
                                )}
                            </h2>
                        </div>
                        <div className="p-4 space-y-2 max-h-[50vh] overflow-y-auto">
                            {(!conversation.files || conversation.files.length === 0) ? (
                                <p className="text-center text-zinc-500 py-6 text-sm">No files uploaded.</p>
                            ) : (
                                conversation.files.map((file: any) => (
                                    <div key={file.id} className="flex items-center gap-3 p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors">
                                        <div className="p-2 rounded-lg bg-[#E8652D]/10">
                                            {getFileIcon(file.file_type)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-medium text-zinc-900 dark:text-white truncate">
                                                {file.file_type?.includes('image') ? 'Image' :
                                                    file.file_type?.includes('video') ? 'Video' : 'Document'}
                                            </p>
                                            <p className="text-[10px] text-zinc-500">
                                                {new Date(file.uploaded_at).toLocaleString()}
                                            </p>
                                        </div>
                                        <a
                                            href={file.file_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-2 rounded-lg bg-[#E8652D] hover:bg-[#FF7A42] text-white transition-colors"
                                            title="Download"
                                        >
                                            <Download className="h-4 w-4" />
                                        </a>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
