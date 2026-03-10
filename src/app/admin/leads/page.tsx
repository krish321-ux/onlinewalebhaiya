'use client';

import { useState, useEffect } from 'react';
import { Download, Loader2, Users, Trash2 } from 'lucide-react';
import { adminAPI } from '@/lib/api';

export default function AdminLeads() {
    const [leads, setLeads] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => { loadLeads(); }, []);

    const loadLeads = async () => {
        try {
            const data = await adminAPI.getLeads();
            setLeads(data);
        } catch (err) {
            console.error("Failed to load leads:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string, name: string) => {
        if (!window.confirm(`Are you sure you want to delete the lead for ${name}?`)) return;
        try {
            await adminAPI.deleteLead(id);
            setLeads(prev => prev.filter(l => l.id !== id));
        } catch (err) {
            console.error("Failed to delete lead:", err);
            alert("Failed to delete lead. Please try again.");
        }
    };

    const exportCSV = () => {
        if (leads.length === 0) return;
        const headers = ['Name', 'Phone', 'State', 'Service', 'Status', 'Date'];
        const rows = leads.map(l => [
            l.name, l.phone, l.state, l.service_type, l.status,
            new Date(l.created_at).toLocaleDateString()
        ]);
        const csv = [headers.join(','), ...rows.map(r => r.map((v: string) => `"${v || ''}"`).join(','))].join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `leads_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    if (loading) {
        return <div className="flex justify-center items-center min-h-[60vh]"><Loader2 className="h-8 w-8 animate-spin text-[#E8652D]" /></div>;
    }

    return (
        <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">User Leads</h1>
                <button
                    onClick={exportCSV}
                    disabled={leads.length === 0}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
                >
                    <Download className="h-5 w-5" /> Export to CSV
                </button>
            </div>

            <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 overflow-hidden">
                {leads.length === 0 ? (
                    <div className="p-8 text-center text-zinc-500">
                        <Users className="h-12 w-12 mx-auto mb-3 text-zinc-300" />
                        No leads captured yet. Leads are generated when users submit service requests.
                    </div>
                ) : (
                    <table className="w-full text-sm text-left">
                        <thead className="bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white uppercase font-medium">
                            <tr>
                                <th className="px-6 py-3">Name</th>
                                <th className="px-6 py-3">Phone</th>
                                <th className="px-6 py-3">State</th>
                                <th className="px-6 py-3">Service</th>
                                <th className="px-6 py-3">Status</th>
                                <th className="px-6 py-3">Date</th>
                                <th className="px-6 py-3"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                            {leads.map((lead, i) => (
                                <tr key={i} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-zinc-900 dark:text-white">{lead.name}</td>
                                    <td className="px-6 py-4 font-mono text-zinc-600 dark:text-zinc-400">{lead.phone}</td>
                                    <td className="px-6 py-4 text-zinc-600 dark:text-zinc-400">{lead.state || 'N/A'}</td>
                                    <td className="px-6 py-4">{lead.service_type}</td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${lead.status === 'Completed' ? 'bg-green-100 text-green-800' :
                                            lead.status === 'In Process' ? 'bg-amber-100 text-amber-800' :
                                                'bg-[#E8652D]/10 text-[#E8652D]'
                                            }`}>
                                            {lead.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-zinc-600 dark:text-zinc-400">{new Date(lead.created_at).toLocaleDateString()}</td>
                                    <td className="px-6 py-4">
                                        <button
                                            onClick={() => handleDelete(lead.id, lead.name)}
                                            className="text-red-500 hover:text-red-600 p-1 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                            title="Delete Lead"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
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
