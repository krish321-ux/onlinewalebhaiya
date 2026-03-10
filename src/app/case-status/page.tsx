'use client';

import { useState } from 'react';
import { Search, Loader2, CheckCircle, Clock, FileCheck } from 'lucide-react';
import { servicesAPI } from '@/lib/api';

type StatusStep = 'Received' | 'In Process' | 'Completed';

const STEPS: { key: StatusStep; label: string; icon: any }[] = [
    { key: 'Received', label: 'Received', icon: FileCheck },
    { key: 'In Process', label: 'In Process', icon: Clock },
    { key: 'Completed', label: 'Completed', icon: CheckCircle },
];

export default function CaseStatusPage() {
    const [caseId, setCaseId] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [result, setResult] = useState<any>(null);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!caseId.trim()) return;
        setLoading(true);
        setError('');
        setResult(null);
        try {
            const data = await servicesAPI.checkStatus(caseId.trim());
            setResult(data);
        } catch (err: any) {
            setError(err.message || 'Case ID not found.');
        } finally {
            setLoading(false);
        }
    };

    const getStepIndex = (status: string) => STEPS.findIndex(s => s.key === status);

    return (
        <div className="min-h-screen bg-[#0a0a0a] pt-24 pb-16 px-4">
            <div className="max-w-2xl mx-auto">
                <div className="text-center mb-10 animate-fade-in-up">
                    <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-semibold mb-4">
                        🔍 Track Request
                    </span>
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white mb-4">
                        Case Status <span className="text-gradient">Tracking</span>
                    </h1>
                    <p className="text-zinc-500 text-lg">
                        Enter your Case ID to check the current status of your service request.
                    </p>
                </div>

                <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 mb-8" style={{ animation: 'fadeInUp 0.6s ease-out 0.2s both' }}>
                    <input
                        type="text"
                        value={caseId}
                        onChange={e => setCaseId(e.target.value)}
                        className="flex-1 px-5 py-3.5 rounded-xl bg-[#111] border border-zinc-800 text-white placeholder-zinc-600 outline-none focus:ring-2 focus:ring-[#E8652D] text-lg font-mono transition-all"
                        placeholder="e.g. CASE-123456-789"
                    />
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-[#E8652D] hover:bg-[#FF7A42] text-white px-4 sm:px-6 py-3.5 rounded-xl font-bold flex items-center gap-2 transition-all duration-300 shadow-lg hover:shadow-[0_0_20px_rgba(232,101,45,0.3)]"
                    >
                        {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <><Search className="h-5 w-5" /> Search</>}
                    </button>
                </form>

                {error && (
                    <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-center mb-6 animate-fade-in-scale">
                        {error}
                    </div>
                )}

                {result && (
                    <div className="bg-[#111] rounded-3xl p-8 border border-zinc-800 shadow-2xl animate-fade-in-up">
                        <div className="mb-6">
                            <p className="text-sm text-zinc-500 mb-1">Case ID</p>
                            <p className="text-xl font-bold text-white font-mono">{result.case_id}</p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                            {[
                                { label: 'Service', value: result.service_type || 'N/A' },
                                { label: 'Name', value: result.name || 'N/A' },
                                { label: 'Submitted', value: result.created_at ? new Date(result.created_at).toLocaleDateString() : 'N/A' },
                                { label: 'Status', value: result.status, highlight: true },
                            ].map((item, i) => (
                                <div key={i} className="bg-zinc-800/30 rounded-xl p-4 border border-zinc-800">
                                    <p className="text-sm text-zinc-500">{item.label}</p>
                                    <p className={`font-semibold ${item.highlight ? 'text-[#E8652D]' : 'text-white'}`}>{item.value}</p>
                                </div>
                            ))}
                        </div>

                        {/* Stepper */}
                        <div className="flex items-center justify-between relative mb-4">
                            <div className="absolute left-0 right-0 top-1/2 h-1 bg-zinc-800 -translate-y-1/2 z-0 rounded-full" />
                            <div
                                className="absolute left-0 top-1/2 h-1 bg-gradient-to-r from-[#E8652D] to-[#FF7A42] -translate-y-1/2 z-0 transition-all duration-700 rounded-full"
                                style={{ width: `${(getStepIndex(result.status) / (STEPS.length - 1)) * 100}%` }}
                            />
                            {STEPS.map((step, i) => {
                                const active = getStepIndex(result.status) >= i;
                                const Icon = step.icon;
                                return (
                                    <div key={step.key} className="relative z-10 flex flex-col items-center">
                                        <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all duration-500 ${active
                                            ? 'bg-[#E8652D] text-white shadow-lg shadow-[#E8652D]/30'
                                            : 'bg-zinc-800 text-zinc-600 border border-zinc-700'
                                            }`}>
                                            <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
                                        </div>
                                        <span className={`text-[10px] sm:text-xs font-semibold mt-2 ${active ? 'text-[#E8652D]' : 'text-zinc-600'}`}>
                                            {step.label}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
