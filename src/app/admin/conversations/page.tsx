'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Search, MessageSquare, Phone, User, Filter, ChevronRight, Trash2 } from 'lucide-react';
import { conversationAPI } from '@/lib/api';

const STATUS_OPTIONS = ['ALL', 'NEW', 'CONTACTED', 'COMPLETED'];
const STATUS_COLORS: Record<string, string> = {
    NEW: 'bg-[#E8652D]/10 text-[#E8652D] dark:bg-[#E8652D]/20 dark:text-[#FF7A42]',
    CONTACTED: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
    COMPLETED: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
};

export default function AdminConversations() {
    const router = useRouter();
    const [conversations, setConversations] = useState<any[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [page, setPage] = useState(1);
    const [stats, setStats] = useState<any>(null);

    useEffect(() => {
        loadConversations();
    }, [statusFilter, page]);

    useEffect(() => {
        loadStats();
    }, []);

    const loadConversations = async () => {
        setLoading(true);
        try {
            const params: any = { page };
            if (search) params.search = search;
            if (statusFilter !== 'ALL') params.status = statusFilter;
            const result = await conversationAPI.getAll(params);
            setConversations(result.data);
            setTotal(result.total);
        } catch (err) {
            console.error('Failed to load conversations:', err);
        } finally {
            setLoading(false);
        }
    };

    const loadStats = async () => {
        try {
            const s = await conversationAPI.getStats();
            setStats(s);
        } catch (err) {
            console.error('Failed to load stats:', err);
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setPage(1);
        loadConversations();
    };

    const handleStatusUpdate = async (id: string, newStatus: string) => {
        try {
            await conversationAPI.updateStatus(id, newStatus);
            setConversations(prev =>
                prev.map(c => c.id === id ? { ...c, status: newStatus } : c)
            );
            loadStats();
        } catch (err) {
            console.error('Failed to update status:', err);
        }
    };

    const handleDelete = async (id: string, name: string) => {
        if (!window.confirm(`Are you sure you want to delete the conversation with ${name || 'this user'}?`)) return;
        try {
            await conversationAPI.delete(id);
            setConversations(prev => prev.filter(c => c.id !== id));
            setTotal(prev => prev - 1);
            loadStats();
        } catch (err) {
            console.error('Failed to delete conversation:', err);
            alert('Failed to delete conversation. Please try again.');
        }
    };

    return (
        <div className="max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Conversations</h1>
            </div>

            {/* Stats Cards */}
            {stats && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    {[
                        { label: 'Total', value: stats.total, color: 'text-zinc-600 dark:text-zinc-300', bg: 'bg-zinc-100 dark:bg-zinc-800' },
                        { label: 'New', value: stats.new, color: 'text-[#E8652D]', bg: 'bg-[#E8652D]/10' },
                        { label: 'Contacted', value: stats.contacted, color: 'text-amber-600', bg: 'bg-amber-100 dark:bg-amber-900/30' },
                        { label: 'Completed', value: stats.completed, color: 'text-green-600', bg: 'bg-green-100 dark:bg-green-900/30' },
                    ].map(s => (
                        <div key={s.label} className="bg-white dark:bg-zinc-900 rounded-xl p-4 border border-zinc-200 dark:border-zinc-800 shadow-sm">
                            <p className="text-xs text-zinc-500 uppercase font-medium">{s.label}</p>
                            <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
                        </div>
                    ))}
                </div>
            )}

            {/* Search + Filters */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <form onSubmit={handleSearch} className="flex-1 flex gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                        <input
                            type="text"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Search by name or phone..."
                            className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-sm outline-none focus:ring-1 focus:ring-[#E8652D] text-zinc-900 dark:text-white"
                        />
                    </div>
                    <button type="submit" className="bg-[#E8652D] hover:bg-[#FF7A42] text-white px-4 py-2 rounded-lg text-sm transition-colors">
                        Search
                    </button>
                </form>

                <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-zinc-400" />
                    {STATUS_OPTIONS.map(s => (
                        <button
                            key={s}
                            onClick={() => { setStatusFilter(s); setPage(1); }}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${statusFilter === s
                                ? 'bg-[#E8652D] text-white'
                                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                                }`}
                        >
                            {s}
                        </button>
                    ))}
                </div>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 overflow-hidden">
                {loading ? (
                    <div className="flex justify-center p-12">
                        <Loader2 className="h-8 w-8 animate-spin text-[#E8652D]" />
                    </div>
                ) : conversations.length === 0 ? (
                    <div className="p-8 text-center text-zinc-500">
                        <MessageSquare className="h-12 w-12 mx-auto mb-3 text-zinc-300" />
                        No conversations found.
                    </div>
                ) : (
                    <>
                        <table className="w-full text-sm text-left">
                            <thead className="bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white uppercase font-medium text-xs">
                                <tr>
                                    <th className="px-6 py-3">Name</th>
                                    <th className="px-6 py-3">Phone</th>
                                    <th className="px-6 py-3">Service</th>
                                    <th className="px-6 py-3">Status</th>
                                    <th className="px-6 py-3">Date</th>
                                    <th className="px-6 py-3"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                                {conversations.map((conv) => (
                                    <tr key={conv.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-zinc-900 dark:text-white">
                                            <div className="flex items-center gap-2">
                                                <User className="h-4 w-4 text-zinc-400" />
                                                {conv.name || 'N/A'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-mono text-zinc-600 dark:text-zinc-400">
                                            <div className="flex items-center gap-2">
                                                <Phone className="h-3.5 w-3.5 text-zinc-400" />
                                                {conv.phone || 'N/A'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-zinc-600 dark:text-zinc-400 max-w-[200px] truncate">
                                            {conv.service_message || 'N/A'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <select
                                                value={conv.status}
                                                onChange={e => handleStatusUpdate(conv.id, e.target.value)}
                                                className={`text-xs font-medium px-2.5 py-1 rounded-full border-0 outline-none cursor-pointer ${STATUS_COLORS[conv.status] || ''}`}
                                            >
                                                <option value="NEW">NEW</option>
                                                <option value="CONTACTED">CONTACTED</option>
                                                <option value="COMPLETED">COMPLETED</option>
                                            </select>
                                        </td>
                                        <td className="px-6 py-4 text-zinc-500 text-xs whitespace-nowrap">
                                            {new Date(conv.created_at).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <button
                                                    onClick={() => router.push(`/admin/conversations/${conv.id}`)}
                                                    className="text-[#E8652D] hover:text-[#FF7A42] transition-colors"
                                                    title="View chat"
                                                >
                                                    <ChevronRight className="h-5 w-5" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(conv.id, conv.name)}
                                                    className="text-red-500 hover:text-red-600 transition-colors"
                                                    title="Delete conversation"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* Pagination */}
                        {total > 50 && (
                            <div className="flex justify-between items-center px-6 py-4 border-t border-zinc-100 dark:border-zinc-800">
                                <span className="text-xs text-zinc-500">
                                    Showing {(page - 1) * 50 + 1}–{Math.min(page * 50, total)} of {total}
                                </span>
                                <div className="flex gap-2">
                                    <button
                                        disabled={page <= 1}
                                        onClick={() => setPage(p => p - 1)}
                                        className="px-3 py-1 rounded text-xs bg-zinc-100 dark:bg-zinc-800 disabled:opacity-50"
                                    >
                                        Previous
                                    </button>
                                    <button
                                        disabled={page * 50 >= total}
                                        onClick={() => setPage(p => p + 1)}
                                        className="px-3 py-1 rounded text-xs bg-zinc-100 dark:bg-zinc-800 disabled:opacity-50"
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
