'use client';

import { useState, useEffect } from 'react';
import { MessageSquare, Loader2 } from 'lucide-react';
import { chatbotAPI } from '@/lib/api';

export default function ChatLogs() {
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadLogs();
    }, []);

    const loadLogs = async () => {
        try {
            const data = await chatbotAPI.getLogs();
            setLogs(data);
        } catch (error) {
            console.error("Failed to fetch logs:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="flex justify-center items-center min-h-[60vh]"><Loader2 className="h-8 w-8 animate-spin text-[#E8652D]" /></div>;
    }

    return (
        <div className="max-w-7xl mx-auto">
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-white mb-8">Chat Logs</h1>

            <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 overflow-hidden">
                {logs.length === 0 ? (
                    <div className="p-8 text-center text-zinc-500">
                        <MessageSquare className="h-12 w-12 mx-auto mb-3 text-zinc-300" />
                        No chat logs yet. Logs will appear as users interact with Liza.
                    </div>
                ) : (
                    <table className="w-full text-sm text-left">
                        <thead className="bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white uppercase font-medium">
                            <tr>
                                <th className="px-6 py-3">Time</th>
                                <th className="px-6 py-3">Source</th>
                                <th className="px-6 py-3">User Query</th>
                                <th className="px-6 py-3">Bot Response</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                            {logs.map((log) => (
                                <tr key={log.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                                    <td className="px-6 py-4 text-zinc-500 whitespace-nowrap text-xs">
                                        {new Date(log.created_at).toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${log.source === 'whatsapp' ? 'bg-green-100 text-green-700' : 'bg-[#E8652D]/10 text-[#E8652D]'
                                            }`}>
                                            {log.source || 'website'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 font-medium text-zinc-900 dark:text-white max-w-xs truncate">
                                        {log.message}
                                    </td>
                                    <td className="px-6 py-4 text-zinc-600 dark:text-zinc-400 max-w-xs truncate">
                                        {log.response}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
