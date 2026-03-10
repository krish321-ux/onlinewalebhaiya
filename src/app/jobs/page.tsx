'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Job } from '@/types/job';
import { Search, Filter, MapPin, Calendar, Building2, ExternalLink, ChevronLeft, ChevronRight, ChevronDown, Briefcase, Loader2, Download } from 'lucide-react';
import { INDIAN_STATES, QUALIFICATIONS } from '@/lib/constants';
import Link from 'next/link';
import { getSecureUrl } from '@/lib/secureUrl';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';
const PER_PAGE = 20;

export default function JobsPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-[#E8652D]" /></div>}>
            <JobsPageContent />
        </Suspense>
    );
}

function JobsPageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Pre-populate from URL
    const [selectedState, setSelectedState] = useState(searchParams.get('state') || '');
    const [selectedQualification, setSelectedQualification] = useState(searchParams.get('qualification') || '');
    const [searchQuery, setSearchQuery] = useState('');
    const [showFilters, setShowFilters] = useState(
        !!(searchParams.get('state') || searchParams.get('qualification'))
    );

    const [jobs, setJobs] = useState<Job[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);

    useEffect(() => {
        fetchJobs();
    }, [selectedState, selectedQualification, page]);

    // Update URL without navigation
    useEffect(() => {
        const params = new URLSearchParams();
        if (selectedState) params.set('state', selectedState);
        if (selectedQualification) params.set('qualification', selectedQualification);
        const qs = params.toString();
        router.replace(`/jobs${qs ? `?${qs}` : ''}`, { scroll: false });
    }, [selectedState, selectedQualification]);

    const fetchJobs = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                limit: PER_PAGE.toString(),
                offset: ((page - 1) * PER_PAGE).toString(),
            });
            if (selectedState) params.set('state', selectedState);
            if (selectedQualification) params.set('qualification', selectedQualification);

            const res = await fetch(`${API_BASE}/api/jobs?${params}`);
            if (!res.ok) throw new Error('Failed to fetch');
            const data = await res.json();
            setJobs(data.data || []);
            setTotal(data.total || 0);
        } catch (err) {
            console.error('Error fetching jobs:', err);
        } finally {
            setLoading(false);
        }
    };

    const filteredJobs = searchQuery
        ? jobs.filter(j =>
            j.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            j.department.toLowerCase().includes(searchQuery.toLowerCase())
        )
        : jobs;

    const totalPages = Math.ceil(total / PER_PAGE);

    const formatDate = (d: string) => {
        if (!d) return '—';
        return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    const clearFilters = () => {
        setSelectedState('');
        setSelectedQualification('');
        setSearchQuery('');
        setPage(1);
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] pt-24 pb-12 px-4 sm:px-6 lg:px-8">
            {/* Page Header */}
            <div className="relative overflow-hidden bg-gradient-to-r from-[#E8652D]/10 via-[#0a0a0a] to-[#0a0a0a] rounded-3xl max-w-7xl mx-auto mb-10 p-6 sm:p-10 md:p-14 border border-zinc-800/50">
                <div className="absolute top-0 right-0 w-72 h-72 bg-[#E8652D]/10 rounded-full blur-[100px]" />
                <div className="relative z-10 text-center">
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 animate-fade-in-up">Latest Government <span className="text-gradient">Jobs</span></h1>
                    <p className="text-zinc-500 max-w-2xl mx-auto text-lg" style={{ animation: 'fadeInUp 0.6s ease-out 0.2s both' }}>
                        Stay updated with the latest notifications from Central and State governments.
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto">
                {/* Search & Filter Bar */}
                <div className="bg-[#111] p-4 rounded-2xl border border-zinc-800 mb-4 flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-3 h-5 w-5 text-zinc-600" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            placeholder="Search jobs by title or department..."
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-800/50 border border-zinc-700 text-white placeholder-zinc-500 focus:ring-2 focus:ring-[#E8652D] focus:border-transparent outline-none transition-all"
                        />
                    </div>
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all duration-300 font-medium ${showFilters ? 'bg-[#E8652D]/10 text-[#E8652D] border border-[#E8652D]/30' : 'bg-zinc-800 text-zinc-400 border border-zinc-700 hover:bg-zinc-700 hover:text-white'}`}
                    >
                        <Filter className="h-5 w-5" />
                        <span className="hidden sm:inline">Filters</span>
                    </button>
                </div>

                {/* Filters */}
                <div className={`overflow-hidden transition-all duration-300 ${showFilters ? 'max-h-40 opacity-100 mb-4' : 'max-h-0 opacity-0'}`}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-[#111] p-6 rounded-2xl border border-zinc-800">
                        <div className="relative">
                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                            <select value={selectedState} onChange={e => { setSelectedState(e.target.value); setPage(1); }} className="w-full pl-10 pr-8 py-2.5 rounded-xl bg-zinc-800 border border-zinc-700 text-white focus:ring-2 focus:ring-[#E8652D] outline-none appearance-none cursor-pointer">
                                <option value="">All India</option>
                                {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 pointer-events-none" />
                        </div>
                        <div className="relative">
                            <select value={selectedQualification} onChange={e => { setSelectedQualification(e.target.value); setPage(1); }} className="w-full px-4 py-2.5 rounded-xl bg-zinc-800 border border-zinc-700 text-white focus:ring-2 focus:ring-[#E8652D] outline-none appearance-none cursor-pointer">
                                <option value="">All Qualifications</option>
                                {QUALIFICATIONS.map(q => <option key={q} value={q}>{q}</option>)}
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 pointer-events-none" />
                        </div>
                    </div>
                </div>

                {/* Active Filters + Count */}
                <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                        {(selectedState || selectedQualification) && (
                            <>
                                {selectedState && <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#E8652D]/10 text-[#E8652D] rounded-full text-xs font-medium"><MapPin className="h-3 w-3" />{selectedState}</span>}
                                {selectedQualification && <span className="px-2.5 py-1 bg-[#E8652D]/10 text-[#E8652D] rounded-full text-xs font-medium">{selectedQualification}</span>}
                                <button onClick={clearFilters} className="text-xs text-zinc-500 hover:text-white underline transition-colors">Clear</button>
                            </>
                        )}
                    </div>
                    {!loading && <span className="text-sm text-zinc-500"><span className="text-white font-semibold">{total}</span> jobs found</span>}
                </div>

                {/* Table */}
                <div className="bg-[#111] rounded-2xl border border-zinc-800 overflow-hidden shadow-xl">
                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <Loader2 className="h-8 w-8 animate-spin text-[#E8652D]" />
                        </div>
                    ) : filteredJobs.length === 0 ? (
                        <div className="text-center py-20 text-zinc-500">
                            <Briefcase className="h-12 w-12 mx-auto mb-3 text-zinc-600" />
                            <p className="text-lg">No jobs found matching your criteria.</p>
                            <button onClick={clearFilters} className="mt-4 text-[#E8652D] hover:text-[#FF7A42] font-medium transition-colors">Clear all filters</button>
                        </div>
                    ) : (
                        <>
                            {/* Desktop Table */}
                            <div className="hidden md:block overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-zinc-800/50">
                                        <tr className="text-left text-xs text-zinc-400 uppercase tracking-wider">
                                            <th className="px-4 py-4 font-medium">Post Name</th>
                                            <th className="px-4 py-4 font-medium">Qualification</th>
                                            <th className="px-4 py-4 font-medium">No. of Vacancy</th>
                                            <th className="px-4 py-4 font-medium">Apply Start Date</th>
                                            <th className="px-4 py-4 font-medium">Last Date</th>
                                            <th className="px-4 py-4 font-medium text-center">Full Details</th>
                                            <th className="px-4 py-4 font-medium text-right">View More</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-zinc-800/50">
                                        {filteredJobs.map((job, i) => (
                                            <tr key={job.id} className="hover:bg-zinc-800/30 transition-colors group" style={{ animation: `fadeInUp 0.3s ease-out ${i * 0.03}s both` }}>
                                                <td className="px-4 py-4">
                                                    <p className="font-semibold text-white group-hover:text-[#FF7A42] transition-colors">{job.title}</p>
                                                    <p className="text-xs text-zinc-500 mt-0.5">{job.department}</p>
                                                    {job.job_type && <span className="text-[10px] text-[#E8652D] bg-[#E8652D]/10 px-2 py-0.5 rounded-full mt-1 inline-block">{job.job_type}</span>}
                                                </td>
                                                <td className="px-4 py-4 text-zinc-400">{job.qualification || '—'}</td>
                                                <td className="px-4 py-4 text-zinc-400">{job.no_of_vacancy || '—'}</td>
                                                <td className="px-4 py-4 text-zinc-400">
                                                    {job.apply_start_date ? new Date(job.apply_start_date).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '—'}
                                                </td>
                                                <td className="px-4 py-4">
                                                    <span className="flex items-center gap-1 text-[#E8652D] font-medium text-xs">
                                                        <Calendar className="h-3.5 w-3.5" />{formatDate(job.last_date || '')}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    {job.notification_url ? (
                                                        <a href={getSecureUrl(job.notification_url)} target="_blank" rel="noopener noreferrer"
                                                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-zinc-700 hover:bg-zinc-600 text-zinc-200 rounded-lg text-xs font-semibold transition-all">
                                                            <Download className="h-3 w-3" /> PDF
                                                        </a>
                                                    ) : (
                                                        <span className="text-zinc-600 text-xs">—</span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <Link href={`/jobs/${job.id}`}
                                                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#E8652D]/10 text-[#E8652D] hover:bg-[#E8652D] hover:text-white rounded-lg text-xs font-semibold transition-all duration-200">
                                                        View More <ExternalLink className="h-3 w-3" />
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Mobile Cards */}
                            <div className="md:hidden divide-y divide-zinc-800/50">
                                {filteredJobs.map(job => (
                                    <div key={job.id} className="px-4 py-4 hover:bg-zinc-800/20 transition-colors">
                                        <div className="flex justify-between items-start gap-3">
                                            <div className="min-w-0 flex-1">
                                                <p className="font-semibold text-white text-sm">{job.title}</p>
                                                <p className="text-xs text-zinc-500 mt-0.5 flex items-center gap-1"><Building2 className="h-3 w-3" />{job.department}</p>
                                                <div className="flex items-center gap-3 mt-1.5 text-xs text-zinc-500 flex-wrap">
                                                    {(job as any).advt_no && <span className="text-zinc-400">{(job as any).advt_no}</span>}
                                                    {job.qualification && <span>{job.qualification}</span>}
                                                    {job.last_date && <span className="text-[#E8652D] font-medium flex items-center gap-1"><Calendar className="h-3 w-3" />{formatDate(job.last_date)}</span>}
                                                </div>
                                            </div>
                                            <div className="flex flex-col gap-1.5 shrink-0">
                                                {job.notification_url && (
                                                    <a href={getSecureUrl(job.notification_url)} target="_blank" rel="noopener noreferrer"
                                                        className="px-2.5 py-1.5 bg-zinc-700 hover:bg-zinc-600 text-zinc-200 rounded-lg text-xs font-semibold flex items-center gap-1">
                                                        <Download className="h-3 w-3" /> PDF
                                                    </a>
                                                )}
                                                <Link href={`/jobs/${job.id}`}
                                                    className="px-3 py-1.5 bg-[#E8652D] text-white rounded-lg text-xs font-semibold text-center">
                                                    View More
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="flex items-center justify-between px-6 py-4 border-t border-zinc-800">
                                    <span className="text-xs text-zinc-500">
                                        Page <span className="text-white font-medium">{page}</span> of <span className="text-white font-medium">{totalPages}</span> · {total} total
                                    </span>
                                    <div className="flex items-center gap-1">
                                        <button
                                            disabled={page <= 1}
                                            onClick={() => setPage(p => p - 1)}
                                            className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                        >
                                            <ChevronLeft className="h-4 w-4 text-zinc-400" />
                                        </button>
                                        {Array.from({ length: Math.min(3, totalPages) }, (_, i) => {
                                            const maxVisible = 3;
                                            const pageNum = page <= Math.floor(maxVisible / 2) + 1 ? i + 1 : page + i - Math.floor(maxVisible / 2);
                                            if (pageNum < 1 || pageNum > totalPages) return null;
                                            return (
                                                <button
                                                    key={pageNum}
                                                    onClick={() => setPage(pageNum)}
                                                    className={`w-8 h-8 rounded-lg text-xs font-medium transition-colors ${pageNum === page ? 'bg-[#E8652D] text-white' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white'}`}
                                                >
                                                    {pageNum}
                                                </button>
                                            );
                                        })}
                                        <button
                                            disabled={page >= totalPages}
                                            onClick={() => setPage(p => p + 1)}
                                            className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                        >
                                            <ChevronRight className="h-4 w-4 text-zinc-400" />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
