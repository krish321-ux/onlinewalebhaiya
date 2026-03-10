'use client';

import { useState, useEffect } from 'react';
import { Check, X, Eye, Loader2, FileDown, MessageSquare } from 'lucide-react';
import { servicesAPI } from '@/lib/api';

export default function AdminRequests() {
    const [requests, setRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedMsg, setExpandedMsg] = useState<string | null>(null);

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

    if (loading) {
        return <div className="flex justify-center items-center min-h-[60vh]"><Loader2 className="h-8 w-8 animate-spin text-[#E8652D]" /></div>;
    }

    return (
        <div className="max-w-7xl mx-auto">
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-white mb-8">Service Requests</h1>

            <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white uppercase font-medium">
                        <tr>
                            <th className="px-6 py-3">Case ID</th>
                            <th className="px-6 py-3">User</th>
                            <th className="px-6 py-3">Phone</th>
                            <th className="px-6 py-3">Service</th>
                            <th className="px-6 py-3">Message</th>
                            <th className="px-6 py-3">Document</th>
                            <th className="px-6 py-3">Status</th>
                            <th className="px-6 py-3">Date</th>
                            <th className="px-6 py-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                        {requests.length === 0 ? (
                            <tr><td colSpan={9} className="px-6 py-8 text-center text-zinc-500">No service requests yet.</td></tr>
                        ) : requests.map((req) => (
                            <tr key={req.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                                <td className="px-6 py-4 font-mono text-zinc-600 dark:text-zinc-400 text-xs">{req.case_id}</td>
                                <td className="px-6 py-4 font-medium text-zinc-900 dark:text-white whitespace-nowrap">{req.name}</td>
                                <td className="px-6 py-4 text-zinc-600 dark:text-zinc-400">{req.phone}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{req.service_type}</td>
                                <td className="px-6 py-4 max-w-[200px]">
                                    {req.message ? (
                                        <button
                                            onClick={() => setExpandedMsg(expandedMsg === req.id ? null : req.id)}
                                            className="flex items-center gap-1 text-[#E8652D] dark:text-[#FF7A42] hover:underline text-xs"
                                            title={req.message}
                                        >
                                            <MessageSquare className="h-3.5 w-3.5" />
                                            {expandedMsg === req.id ? (
                                                <span className="text-zinc-700 dark:text-zinc-300 whitespace-normal">{req.message}</span>
                                            ) : (
                                                <span>View</span>
                                            )}
                                        </button>
                                    ) : (
                                        <span className="text-zinc-400">—</span>
                                    )}
                                </td>
                                <td className="px-6 py-4">
                                    {req.document_url ? (
                                        <a
                                            href={req.document_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#E8652D]/10 dark:bg-[#E8652D]/20 text-[#E8652D] dark:text-[#FF7A42] rounded-lg text-xs font-medium hover:bg-[#E8652D]/20 dark:hover:bg-[#E8652D]/30 transition-colors"
                                        >
                                            <FileDown className="h-3.5 w-3.5" />
                                            View File
                                        </a>
                                    ) : (
                                        <span className="text-zinc-400">—</span>
                                    )}
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${req.status === 'Completed' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                                        req.status === 'In Process' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300' :
                                            req.status === 'Rejected' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' :
                                                'bg-[#E8652D]/10 text-[#E8652D] dark:bg-[#E8652D]/20 dark:text-[#FF7A42]'
                                        }`}>
                                        {req.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-zinc-600 dark:text-zinc-400 whitespace-nowrap">{new Date(req.created_at).toLocaleDateString()}</td>
                                <td className="px-6 py-4 text-right flex justify-end gap-2">
                                    <button onClick={() => updateStatus(req.id, 'In Process')} className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded text-[#E8652D]" title="Mark In Process">
                                        <Eye className="h-4 w-4" />
                                    </button>
                                    <button onClick={() => updateStatus(req.id, 'Completed')} className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded text-green-600" title="Mark Completed">
                                        <Check className="h-4 w-4" />
                                    </button>
                                    <button onClick={() => updateStatus(req.id, 'Rejected')} className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded text-red-600" title="Reject">
                                        <X className="h-4 w-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
