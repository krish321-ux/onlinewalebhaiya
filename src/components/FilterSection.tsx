'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Briefcase, GraduationCap, MapPin, ChevronDown, ArrowRight, Loader2, Calendar, Building2, ExternalLink, Search, Download } from 'lucide-react';
import { INDIAN_STATES, QUALIFICATIONS } from '@/lib/constants';
import { getSecureUrl } from '@/lib/secureUrl';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

type FilterType = 'jobs' | 'scholarships';
type ResultItem = Record<string, any>;

function useInView(ref: React.RefObject<HTMLElement | null>) {
    const [inView, setInView] = useState(false);
    useEffect(() => {
        if (!ref.current) return;
        const observer = new IntersectionObserver(
            ([entry]) => { if (entry.isIntersecting) setInView(true); },
            { threshold: 0.1 }
        );
        observer.observe(ref.current);
        return () => observer.disconnect();
    }, [ref]);
    return inView;
}

export default function FilterSection() {
    const router = useRouter();
    const sectionRef = useRef<HTMLDivElement>(null);
    const inView = useInView(sectionRef);

    const [type, setType] = useState<FilterType>('jobs');
    const [state, setState] = useState('');
    const [qualification, setQualification] = useState('');
    const [results, setResults] = useState<ResultItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);
    const [totalCount, setTotalCount] = useState(0);

    const doSearch = useCallback(async (t: FilterType, s: string, q: string) => {
        setLoading(true);
        setHasSearched(true);
        try {
            const params = new URLSearchParams({ limit: '4' });
            if (s) params.set('state', s);
            if (q) params.set('qualification', q);
            const endpoint = t === 'jobs' ? '/api/jobs' : '/api/scholarships';
            const res = await fetch(`${API_BASE}${endpoint}?${params}`);
            if (!res.ok) throw new Error('Fetch failed');
            const data = await res.json();
            setResults(data.data || []);
            setTotalCount(data.total || 0);
        } catch {
            setResults([]);
            setTotalCount(0);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        doSearch(type, state, qualification);
    }, [type, state, qualification, doSearch]);

    const handleViewMore = () => {
        const params = new URLSearchParams();
        if (state) params.set('state', state);
        if (qualification) params.set('qualification', qualification);
        router.push(`/${type}?${params.toString()}`);
    };

    const formatDate = (dateStr: string) => {
        if (!dateStr) return '—';
        return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    return (
        <section ref={sectionRef} className="py-16 bg-[#0a0a0a] relative">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[200px] bg-[#E8652D]/5 rounded-full blur-[120px]" />

            <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 ${inView ? 'animate-fade-in-up' : 'opacity-0'}`}>
                {/* Header */}
                <div className="text-center mb-10">
                    <span className="inline-block text-[#E8652D] font-semibold text-sm uppercase tracking-widest mb-3">Quick Search</span>
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">Find Jobs &amp; Scholarships</h2>
                    <p className="text-zinc-500 max-w-lg mx-auto">Choose a category, state and qualification — results update instantly.</p>
                </div>

                {/* Filter Box */}
                <div className="bg-[#111] rounded-2xl border border-zinc-800 p-6 md:p-8 shadow-xl">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {/* State */}
                        <div>
                            <label className="block text-xs text-zinc-500 uppercase tracking-wider font-medium mb-2">State</label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                                <select value={state} onChange={e => setState(e.target.value)}
                                    className="w-full pl-10 pr-8 py-3 rounded-xl bg-zinc-800/70 border border-zinc-700 text-white text-sm focus:ring-2 focus:ring-[#E8652D] focus:border-transparent outline-none appearance-none cursor-pointer transition-all">
                                    <option value="">All India</option>
                                    {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 pointer-events-none" />
                            </div>
                        </div>
                        {/* Qualification */}
                        <div>
                            <label className="block text-xs text-zinc-500 uppercase tracking-wider font-medium mb-2">Qualification</label>
                            <div className="relative">
                                <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                                <select value={qualification} onChange={e => setQualification(e.target.value)}
                                    className="w-full pl-10 pr-8 py-3 rounded-xl bg-zinc-800/70 border border-zinc-700 text-white text-sm focus:ring-2 focus:ring-[#E8652D] focus:border-transparent outline-none appearance-none cursor-pointer transition-all">
                                    <option value="">All Qualifications</option>
                                    {QUALIFICATIONS.map(q => <option key={q} value={q}>{q}</option>)}
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 pointer-events-none" />
                            </div>
                        </div>
                        {/* Category */}
                        <div>
                            <label className="block text-xs text-zinc-500 uppercase tracking-wider font-medium mb-2">Category</label>
                            <div className="relative">
                                {type === 'jobs'
                                    ? <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#E8652D]" />
                                    : <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#E8652D]" />
                                }
                                <select value={type} onChange={e => setType(e.target.value as FilterType)}
                                    className="w-full pl-10 pr-8 py-3 rounded-xl bg-zinc-800/70 border border-[#E8652D]/40 text-white text-sm focus:ring-2 focus:ring-[#E8652D] focus:border-transparent outline-none appearance-none cursor-pointer transition-all font-semibold">
                                    <option value="jobs">Jobs</option>
                                    <option value="scholarships">Scholarships</option>
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 pointer-events-none" />
                            </div>
                        </div>
                    </div>

                    {/* Active filter chips */}
                    {(state || qualification) && (
                        <div className="flex items-center gap-2 mt-4 flex-wrap">
                            <span className="text-xs text-zinc-500">Active filters:</span>
                            {state && <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#E8652D]/10 text-[#E8652D] rounded-full text-xs font-medium">{state}</span>}
                            {qualification && <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#E8652D]/10 text-[#E8652D] rounded-full text-xs font-medium">{qualification}</span>}
                            <button onClick={() => { setState(''); setQualification(''); }} className="text-xs text-zinc-500 hover:text-white underline ml-1 transition-colors">Clear all</button>
                        </div>
                    )}
                </div>

                {/* Results */}
                {hasSearched && (
                    <div className="mt-8" style={{ animation: 'fadeInUp 0.5s ease-out' }}>
                        {loading ? (
                            <div className="space-y-3">
                                {[1, 2, 3, 4].map(i => <div key={i} className="h-14 bg-[#111] border border-zinc-800 rounded-xl animate-pulse" />)}
                            </div>
                        ) : results.length === 0 ? (
                            <div className="text-center py-12 text-zinc-500">
                                <Search className="h-10 w-10 mx-auto mb-3 text-zinc-600" />
                                <p className="text-lg">No {type} found matching your criteria.</p>
                                <p className="text-sm mt-1">Try adjusting your filters.</p>
                            </div>
                        ) : (
                            <>
                                <div className="flex items-center justify-between mb-4">
                                    <p className="text-sm text-zinc-500">
                                        Showing <span className="text-white font-semibold">{results.length}</span> of <span className="text-[#E8652D] font-semibold">{totalCount}</span> {type}
                                    </p>
                                    {loading && <Loader2 className="h-4 w-4 animate-spin text-[#E8652D]" />}
                                </div>

                                {/* ── Desktop table ── */}
                                <div className="hidden md:block bg-[#111] border border-zinc-800 rounded-xl overflow-hidden">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead className="bg-zinc-800/60">
                                                <tr className="text-left text-xs text-zinc-400 uppercase tracking-wider">
                                                    {type === 'jobs' ? (
                                                        <>
                                                            <th className="px-4 py-3 font-medium">Post Name</th>
                                                            <th className="px-4 py-3 font-medium">Qualification</th>
                                                            <th className="px-4 py-3 font-medium whitespace-nowrap">No. of Vacancy</th>
                                                            <th className="px-4 py-3 font-medium whitespace-nowrap">Apply Start Date</th>
                                                            <th className="px-4 py-3 font-medium whitespace-nowrap">Last Date</th>
                                                            <th className="px-4 py-3 font-medium text-center whitespace-nowrap">Full Details</th>
                                                            <th className="px-4 py-3 font-medium text-right whitespace-nowrap">View More</th>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <th className="px-4 py-3 font-medium">Name</th>
                                                            <th className="px-4 py-3 font-medium">Amount</th>
                                                            <th className="px-4 py-3 font-medium">Eligibility</th>
                                                            <th className="px-4 py-3 font-medium whitespace-nowrap">Apply Start Date</th>
                                                            <th className="px-4 py-3 font-medium whitespace-nowrap">Last Date</th>
                                                            <th className="px-4 py-3 font-medium text-center whitespace-nowrap">Full Details</th>
                                                            <th className="px-4 py-3 font-medium text-right">View More</th>
                                                        </>
                                                    )}
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-zinc-800/60">
                                                {results.map((item, i) => (
                                                    <tr key={item.id} className="group hover:bg-zinc-800/30 transition-colors"
                                                        style={{ animation: `fadeInUp 0.4s ease-out ${i * 0.08}s both` }}>
                                                        {type === 'jobs' ? (
                                                            <>
                                                                <td className="px-4 py-3">
                                                                    <p className="font-semibold text-white text-sm group-hover:text-[#FF7A42] transition-colors">{item.title}</p>
                                                                    <p className="text-xs text-zinc-500 mt-0.5">{item.department}</p>
                                                                </td>
                                                                <td className="px-4 py-3 text-zinc-400 text-sm">{item.qualification || '—'}</td>
                                                                <td className="px-4 py-3 text-zinc-400 text-sm">{item.no_of_vacancy || '—'}</td>
                                                                <td className="px-4 py-3 text-zinc-400 text-xs whitespace-nowrap">
                                                                    {item.apply_start_date ? formatDate(item.apply_start_date) : '—'}
                                                                </td>
                                                                <td className="px-4 py-3 text-xs whitespace-nowrap">
                                                                    <span className="flex items-center gap-1 text-[#E8652D] font-medium">
                                                                        <Calendar className="h-3 w-3 shrink-0" />{formatDate(item.last_date)}
                                                                    </span>
                                                                </td>
                                                                <td className="px-4 py-3 text-center">
                                                                    {item.notification_url ? (
                                                                        <a href={getSecureUrl(item.notification_url)} target="_blank" rel="noopener noreferrer"
                                                                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-zinc-700 hover:bg-zinc-600 text-zinc-200 rounded-lg text-xs font-semibold transition-all whitespace-nowrap">
                                                                            <Download className="h-3 w-3" /> PDF
                                                                        </a>
                                                                    ) : (
                                                                        <span className="text-zinc-600 text-xs">—</span>
                                                                    )}
                                                                </td>
                                                                <td className="px-4 py-3 text-right">
                                                                    <a href={`/jobs/${item.id}`}
                                                                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#E8652D]/10 text-[#E8652D] hover:bg-[#E8652D] hover:text-white rounded-lg text-xs font-semibold transition-all whitespace-nowrap">
                                                                        View More <ExternalLink className="h-3 w-3" />
                                                                    </a>
                                                                </td>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <td className="px-4 py-3">
                                                                    <p className="font-semibold text-white text-sm group-hover:text-[#FF7A42] transition-colors">{item.title}</p>
                                                                    <p className="text-xs text-zinc-500 mt-0.5">{item.organization}</p>
                                                                </td>
                                                                <td className="px-4 py-3 text-zinc-400 text-sm">{item.amount || '—'}</td>
                                                                <td className="px-4 py-3 text-zinc-400 text-sm">{item.eligibility || '—'}</td>
                                                                <td className="px-4 py-3 text-zinc-400 text-xs whitespace-nowrap">
                                                                    {item.apply_start_date ? formatDate(item.apply_start_date) : '—'}
                                                                </td>
                                                                <td className="px-4 py-3 whitespace-nowrap">
                                                                    <span className="flex items-center gap-1 text-[#E8652D] font-medium text-xs">
                                                                        <Calendar className="h-3.5 w-3.5 shrink-0" />{formatDate(item.last_date)}
                                                                    </span>
                                                                </td>
                                                                <td className="px-4 py-3 text-center">
                                                                    {item.notification_url ? (
                                                                        <a href={getSecureUrl(item.notification_url)} target="_blank" rel="noopener noreferrer"
                                                                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-zinc-700 hover:bg-zinc-600 text-zinc-200 rounded-lg text-xs font-semibold transition-all whitespace-nowrap">
                                                                            <Download className="h-3 w-3" /> PDF
                                                                        </a>
                                                                    ) : (
                                                                        <span className="text-zinc-600 text-xs">—</span>
                                                                    )}
                                                                </td>
                                                                <td className="px-4 py-3 text-right">
                                                                    <a href={`/scholarships/${item.id}`}
                                                                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#E8652D]/10 text-[#E8652D] hover:bg-[#E8652D] hover:text-white rounded-lg text-xs font-semibold transition-all">
                                                                        View More <ExternalLink className="h-3 w-3" />
                                                                    </a>
                                                                </td>
                                                            </>
                                                        )}
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* ── Mobile cards ── */}
                                <div className="md:hidden space-y-3">
                                    {results.map((item, i) => (
                                        <div key={item.id} className="bg-[#111] border border-zinc-800 rounded-xl px-4 py-4 hover:border-[#E8652D]/30 transition-all"
                                            style={{ animation: `fadeInUp 0.4s ease-out ${i * 0.08}s both` }}>
                                            <p className="font-semibold text-white text-sm mb-1">{item.title}</p>
                                            <p className="text-xs text-zinc-500 flex items-center gap-1 mb-2">
                                                <Building2 className="h-3 w-3" />
                                                {type === 'jobs' ? item.department : item.organization}
                                            </p>
                                            <div className="flex items-center gap-3 text-xs text-zinc-500 flex-wrap mb-3">
                                                {type === 'jobs' && item.advt_no && <span className="text-zinc-400">{item.advt_no}</span>}
                                                {type === 'jobs' && item.qualification && <span>{item.qualification}</span>}
                                                {item.last_date && (
                                                    <span className="flex items-center gap-1 text-[#E8652D] font-medium">
                                                        <Calendar className="h-3 w-3" />{formatDate(item.last_date)}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {type === 'jobs' && item.notification_url && (
                                                    <a href={getSecureUrl(item.notification_url)} target="_blank" rel="noopener noreferrer"
                                                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-zinc-700 hover:bg-zinc-600 text-zinc-200 rounded-lg text-xs font-semibold transition-all">
                                                        <Download className="h-3.5 w-3.5" /> Download PDF
                                                    </a>
                                                )}
                                                <a href={`/${type}/${item.id}`}
                                                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-[#E8652D] hover:bg-[#FF7A42] text-white rounded-lg text-xs font-semibold transition-all">
                                                    View Details <ExternalLink className="h-3.5 w-3.5" />
                                                </a>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* View More */}
                                {totalCount > 4 && (
                                    <div className="text-center mt-6">
                                        <button onClick={handleViewMore}
                                            className="group inline-flex items-center gap-2 px-8 py-3 bg-white/5 hover:bg-[#E8652D] text-white border border-zinc-700 hover:border-[#E8652D] rounded-xl font-semibold transition-all duration-300 hover:shadow-[0_0_25px_rgba(232,101,45,0.3)]">
                                            View All {totalCount} {type === 'jobs' ? 'Jobs' : 'Scholarships'}
                                            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                )}
            </div>
        </section>
    );
}
