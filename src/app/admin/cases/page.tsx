'use client';

import { useState } from 'react';
import { Search, Loader2, CheckCircle, Clock, FileCheck } from 'lucide-react';
import { servicesAPI } from '@/lib/api';

export default function AdminCaseTracking() {
    const [caseId, setCaseId] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState('');

    const handleSearch = async () => {
        if (!caseId.trim()) return;
        setLoading(true);
        setError('');
        setResult(null);
        try {
            const data = await servicesAPI.checkStatus(caseId.trim());
            setResult(data);
        } catch (err: any) {
            setError(err.message || 'Case not found.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto">
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-white mb-8">Case Tracking Search</h1>

            <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 p-8">
                <div className="flex gap-3 max-w-lg mb-6">
                    <input
                        value={caseId}
                        onChange={e => setCaseId(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleSearch()}
                        placeholder="Enter Case ID to search..."
                        className="flex-1 px-4 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 outline-none focus:ring-2 focus:ring-[#E8652D] font-mono"
                    />
                    <button
                        onClick={handleSearch}
                        disabled={loading}
                        className="bg-[#E8652D] hover:bg-[#FF7A42] text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                    >
                        {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <><Search className="h-5 w-5" /> Search</>}
                    </button>
                </div>

                {error && (
                    <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg mb-4">
                        {error}
                    </div>
                )}

                {result && (
                    <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl p-6">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                                <p className="text-xs text-zinc-500 mb-1">Case ID</p>
                                <p className="font-bold font-mono text-zinc-900 dark:text-white">{result.case_id}</p>
                            </div>
                            <div>
                                <p className="text-xs text-zinc-500 mb-1">Name</p>
                                <p className="font-semibold text-zinc-900 dark:text-white">{result.name}</p>
                            </div>
                            <div>
                                <p className="text-xs text-zinc-500 mb-1">Service</p>
                                <p className="font-semibold text-zinc-900 dark:text-white">{result.service_type}</p>
                            </div>
                            <div>
                                <p className="text-xs text-zinc-500 mb-1">Status</p>
                                <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${result.status === 'Completed' ? 'bg-green-100 text-green-800' :
                                    result.status === 'In Process' ? 'bg-amber-100 text-amber-800' :
                                        'bg-[#E8652D]/10 text-[#E8652D]'
                                    }`}>
                                    {result.status}
                                </span>
                            </div>
                            <div>
                                <p className="text-xs text-zinc-500 mb-1">Phone</p>
                                <p className="text-zinc-600 dark:text-zinc-400">{result.phone}</p>
                            </div>
                            <div>
                                <p className="text-xs text-zinc-500 mb-1">Submitted</p>
                                <p className="text-zinc-600 dark:text-zinc-400">{new Date(result.created_at).toLocaleDateString()}</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
