'use client';

import { useState, useEffect } from 'react';
import { Check, X, Eye, Loader2, FileDown, MessageSquare, Trash2 } from 'lucide-react';
import { servicesAPI } from '@/lib/api';

export default function AdminRequests() {
    const [requests, setRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedMsg, setExpandedMsg] = useState<string | null>(null);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

    useEffect(() => { loadRequests(); }, []);

    const loadRequests = async () => {
        try {
            const data = await servicesAPI.getAll();
            setRequests(data);
        } catch (err) {
            console.error("Failed to load requests:", err);
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (id: string, status: string) => {
        try {
            await servicesAPI.updateStatus(id, status);
            setRequests(requests.map(req => req.id === id ? { ...req, status } : req));
        } catch (err) {
            console.error("Failed to update status:", err);
        }
    };

    const deleteRequest = async (id: string) => {
        if (!confirm('Are you sure you want to delete this service request? This cannot be undone.')) return;
        try {
            await servicesAPI.delete(id);
            setRequests(requests.filter(req => req.id !== id));
            selectedIds.delete(id);
            setSelectedIds(new Set(selectedIds));
        } catch (err) {
            console.error("Failed to delete request:", err);
        }
    };

    const bulkDelete = async () => {
        if (selectedIds.size === 0) return;
        if (!confirm(`Delete ${selectedIds.size} selected request(s)? This cannot be undone.`)) return;
        try {
            await Promise.all(Array.from(selectedIds).map(id => servicesAPI.delete(id)));
            setRequests(requests.filter(req => !selectedIds.has(req.id)));
            setSelectedIds(new Set());
        } catch (err) {
            console.error("Failed to bulk delete:", err);
        }
    };

    const toggleSelect = (id: string) => {
        const next = new Set(selectedIds);
        if (next.has(id)) next.delete(id); else next.add(id);
        setSelectedIds(next);
    };

    const toggleSelectAll = () => {
        if (selectedIds.size === requests.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(requests.map(r => r.id)));
        }
    };

    if (loading) {
        return <div className="flex justify-center items-center min-h-[60vh]"><Loader2 className="h-8 w-8 animate-spin text-[#E8652D]" /></div>;
    }

    return (
        <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Service Requests</h1>
                {selectedIds.size > 0 && (
                    <button onClick={bulkDelete}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors">
                        <Trash2 className="h-4 w-4" />
                        Delete Selected ({selectedIds.size})
                    </button>
                )}
            </div>

            <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white uppercase font-medium text-xs">
                        <tr>
                            <th className="px-4 py-3 w-10">
                                <input type="checkbox" checked={requests.length > 0 && selectedIds.size === requests.length}
                                    onChange={toggleSelectAll}
                                    className="accent-[#E8652D] h-4 w-4 rounded cursor-pointer" />
                            </th>
                            <th className="px-4 py-3">Case ID</th>
                            <th className="px-4 py-3">User</th>
                            <th className="px-4 py-3">Phone</th>
                            <th className="px-4 py-3">Service</th>
                            <th className="px-4 py-3">Status</th>
                            <th className="px-4 py-3">Date</th>
                            <th className="px-4 py-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                        {requests.length === 0 ? (
                            <tr><td colSpan={8} className="px-6 py-8 text-center text-zinc-500">No service requests yet.</td></tr>
                        ) : requests.map((req) => (
                            <tr key={req.id} className={`hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors ${selectedIds.has(req.id) ? 'bg-[#E8652D]/5 dark:bg-[#E8652D]/10' : ''}`}>
                                <td className="px-4 py-3">
                                    <input type="checkbox" checked={selectedIds.has(req.id)}
                                        onChange={() => toggleSelect(req.id)}
                                        className="accent-[#E8652D] h-4 w-4 rounded cursor-pointer" />
                                </td>
                                <td className="px-4 py-3 font-mono text-zinc-600 dark:text-zinc-400 text-xs">{req.case_id}</td>
                                <td className="px-4 py-3 font-medium text-zinc-900 dark:text-white max-w-[150px] truncate" title={req.name}>{req.name}</td>
                                <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">{req.phone}</td>
                                <td className="px-4 py-3 whitespace-nowrap text-zinc-700 dark:text-zinc-300">{req.service_type}</td>
                                <td className="px-4 py-3">
                                    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${req.status === 'Completed' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                                        req.status === 'In Process' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300' :
                                            req.status === 'Rejected' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' :
                                                'bg-[#E8652D]/10 text-[#E8652D] dark:bg-[#E8652D]/20 dark:text-[#FF7A42]'
                                        }`}>
                                        {req.status}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400 whitespace-nowrap text-xs">{new Date(req.created_at).toLocaleDateString()}</td>
                                <td className="px-4 py-3">
                                    <div className="flex justify-end gap-1">
                                        <button onClick={() => updateStatus(req.id, 'In Process')} className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded text-[#E8652D]" title="Mark In Process">
                                            <Eye className="h-4 w-4" />
                                        </button>
                                        <button onClick={() => updateStatus(req.id, 'Completed')} className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded text-green-600" title="Mark Completed">
                                            <Check className="h-4 w-4" />
                                        </button>
                                        <button onClick={() => updateStatus(req.id, 'Rejected')} className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded text-red-600" title="Reject">
                                            <X className="h-4 w-4" />
                                        </button>
                                        <button onClick={() => deleteRequest(req.id)} className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 rounded text-red-500" title="Delete">
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
