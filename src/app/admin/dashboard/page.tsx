'use client';

import { useState, useEffect } from 'react';
import { Users, FileText, Briefcase, GraduationCap, Loader2, MessageSquare } from 'lucide-react';
import { adminAPI, servicesAPI } from '@/lib/api';

export default function AdminDashboard() {
    const [stats, setStats] = useState<any>(null);
    const [requests, setRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadDashboard();
    }, []);

    const loadDashboard = async () => {
        try {
            const [statsData, requestsData] = await Promise.all([
                adminAPI.getStats(),
                servicesAPI.getAll()
            ]);
            setStats(statsData);
            setRequests(requestsData.slice(0, 5)); // Latest 5
        } catch (error) {
            console.error("Failed to load dashboard:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[60vh]">
                <Loader2 className="h-8 w-8 animate-spin text-[#E8652D]" />
            </div>
        );
    }

    const statCards = [
        { label: 'Total Jobs', value: stats?.totalJobs ?? 0, icon: Briefcase, color: 'text-[#E8652D]', bg: 'bg-[#E8652D]/10 dark:bg-[#E8652D]/20' },
        { label: 'Pending Requests', value: stats?.pendingRequests ?? 0, icon: FileText, color: 'text-amber-600', bg: 'bg-amber-100 dark:bg-amber-900/30' },
        { label: 'Total Users', value: stats?.totalUsers ?? 0, icon: Users, color: 'text-green-600', bg: 'bg-green-100 dark:bg-green-900/30' },
        { label: 'Scholarships', value: stats?.totalScholarships ?? 0, icon: GraduationCap, color: 'text-purple-600', bg: 'bg-purple-100 dark:bg-purple-900/30' },
        { label: 'New Chat Leads', value: stats?.conversations?.new ?? 0, icon: MessageSquare, color: 'text-cyan-600', bg: 'bg-cyan-100 dark:bg-cyan-900/30' },
    ];

    return (
        <div className="max-w-7xl mx-auto">
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-white mb-8">Dashboard Overview</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-8">
                {statCards.map((stat) => {
                    const Icon = stat.icon;
                    return (
                        <div key={stat.label} className="bg-white dark:bg-zinc-900 p-6 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 flex items-center gap-4">
                            <div className={`p-3 rounded-lg ${stat.bg}`}>
                                <Icon className={`h-6 w-6 ${stat.color}`} />
                            </div>
                            <div>
                                <p className="text-sm text-zinc-500 dark:text-zinc-400">{stat.label}</p>
                                <p className="text-2xl font-bold text-zinc-900 dark:text-white">{stat.value.toLocaleString()}</p>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 p-6">
                <h2 className="text-lg font-bold text-zinc-900 dark:text-white mb-4">Recent Service Requests</h2>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-zinc-600 dark:text-zinc-400">
                        <thead className="bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white uppercase font-medium">
                            <tr>
                                <th className="px-6 py-3 rounded-l-lg">Case ID</th>
                                <th className="px-6 py-3">User</th>
                                <th className="px-6 py-3">Service</th>
                                <th className="px-6 py-3">Status</th>
                                <th className="px-6 py-3 rounded-r-lg">Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                            {requests.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-zinc-500">No service requests yet.</td>
                                </tr>
                            ) : requests.map((req) => (
                                <tr key={req.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                                    <td className="px-6 py-4 font-mono text-zinc-600 dark:text-zinc-400">{req.case_id}</td>
                                    <td className="px-6 py-4 font-medium text-zinc-900 dark:text-white">{req.name}</td>
                                    <td className="px-6 py-4">{req.service_type}</td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${req.status === 'Completed' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                                            req.status === 'In Process' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300' :
                                                'bg-[#E8652D]/10 text-[#E8652D] dark:bg-[#E8652D]/20 dark:text-[#FF7A42]'
                                            }`}>
                                            {req.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">{new Date(req.created_at).toLocaleDateString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
