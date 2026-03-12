'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Loader2, ArrowLeft, ChevronRight, Download, Calendar, Briefcase, ExternalLink, Phone, Users, Clock, FileText, CheckCircle, Shield, Monitor, Trash2, Award, Home as HomeIcon } from 'lucide-react';
import { Job } from '@/types/job';
import { getSecureUrl } from '@/lib/secureUrl';
import { sanitizeHtml } from '@/lib/sanitize';

export default function JobDetailPage() {
    const params = useParams();
    const id = params.id as string;

    const [job, setJob] = useState<Job | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchJob = async () => {
            try {
                const res = await fetch(`/api/jobs/${id}`);
                if (!res.ok) throw new Error('Job not found');
                const data = await res.json();
                setJob(data);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchJob();
    }, [id]);

    const formatDate = (d: string) => {
        if (!d) return '—';
        return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="relative">
                        <div className="w-16 h-16 rounded-full border-2 border-zinc-800 flex items-center justify-center">
                            <Loader2 className="h-8 w-8 animate-spin text-[#E8652D]" />
                        </div>
                        <div className="absolute inset-0 rounded-full bg-[#E8652D]/10 animate-ping" />
                    </div>
                    <p className="text-zinc-500 text-sm font-medium">Loading job details...</p>
                </div>
            </div>
        );
    }

    if (error || !job) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] pt-24 px-4 flex flex-col items-center justify-center text-center">
                <div className="w-20 h-20 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-6">
                    <Briefcase className="h-10 w-10 text-zinc-700" />
                </div>
                <h1 className="text-xl sm:text-2xl font-bold text-white mb-2">Job Not Found</h1>
                <p className="text-zinc-400 text-sm sm:text-base mb-8 max-w-md">The job you&apos;re looking for doesn&apos;t exist or has been removed.</p>
                <Link href="/jobs" className="px-8 py-3 bg-[#E8652D] text-white rounded-xl font-semibold hover:bg-[#FF7A42] transition-all hover:shadow-[0_0_20px_rgba(232,101,45,0.3)] text-sm">
                    ← Back to Jobs
                </Link>
            </div>
        );
    }

    const { title, department, detail_content, notification_url, last_date, apply_start_date, apply_link, no_of_vacancy } = job;

    return (
        <>
            <div className="min-h-screen bg-[#0a0a0a] pb-24 sm:pb-12">

                {/* ═══════════════════ HERO SECTION ═══════════════════ */}
                <div className="relative overflow-hidden">
                    {/* Background Effects */}
                    <div className="absolute inset-0 bg-gradient-to-b from-[#E8652D]/8 via-[#0a0a0a] to-[#0a0a0a]" />
                    <div className="absolute top-0 left-1/4 w-[600px] h-[400px] bg-[#E8652D]/5 rounded-full blur-[150px]" />
                    <div className="absolute top-20 right-0 w-[300px] h-[300px] bg-[#E8652D]/3 rounded-full blur-[120px]" />

                    <div className="relative z-10 pt-20 sm:pt-28 pb-8 sm:pb-12 px-2 sm:px-6 lg:px-8">
                        <div className="max-w-7xl mx-auto">

                            {/* Breadcrumbs */}
                            <div className="flex items-center gap-1.5 text-xs sm:text-sm text-zinc-500 mb-6 sm:mb-8 overflow-x-auto whitespace-nowrap pb-1 scrollbar-hide">
                                <Link href="/" className="hover:text-white transition-colors flex items-center gap-1 shrink-0">
                                    <HomeIcon className="h-3.5 w-3.5" /> Home
                                </Link>
                                <ChevronRight className="h-3.5 w-3.5 shrink-0 text-zinc-700" />
                                <Link href="/jobs" className="hover:text-white transition-colors shrink-0">Jobs</Link>
                                <ChevronRight className="h-3.5 w-3.5 shrink-0 text-zinc-700" />
                                <span className="text-[#E8652D] font-medium truncate max-w-[200px] sm:max-w-md">{title}</span>
                            </div>

                            {/* Back */}
                            <Link href="/jobs" className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors text-sm mb-6 sm:mb-8 group">
                                <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" /> Back to Jobs
                            </Link>

                            {/* Title Area */}
                            <div className="mb-6 sm:mb-10">
                                <div className="flex items-center gap-2 mb-3">
                                    <span className="px-3 py-1 bg-[#E8652D]/15 text-[#E8652D] rounded-full text-xs font-bold uppercase tracking-wider">
                                        {(job as any).job_type || 'Government Job'}
                                    </span>
                                </div>
                                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-[1.1] mb-3 sm:mb-4 break-words">
                                    {title}
                                </h1>
                                <p className="text-lg sm:text-xl text-zinc-400 flex items-center gap-2.5 font-medium">
                                    <Briefcase className="h-5 w-5 text-[#E8652D] shrink-0" />
                                    {department}
                                </p>
                            </div>

                            {/* ═══ Stat Cards ═══ */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-10">
                                {/* Vacancies */}
                                <div className="relative group bg-gradient-to-br from-zinc-900/80 to-zinc-900/40 backdrop-blur-xl rounded-2xl border border-zinc-800/60 p-4 sm:p-5 overflow-hidden hover:border-[#E8652D]/30 transition-all duration-300">
                                    <div className="absolute top-0 right-0 w-20 h-20 bg-[#E8652D]/5 rounded-full blur-2xl group-hover:bg-[#E8652D]/10 transition-all" />
                                    <div className="relative z-10 flex items-center gap-3 sm:block">
                                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-[#E8652D]/10 flex items-center justify-center sm:mb-3 shrink-0">
                                            <Users className="h-5 w-5 sm:h-6 sm:w-6 text-[#E8652D]" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] sm:text-xs text-zinc-500 uppercase tracking-widest font-semibold sm:mb-1">Total Vacancies</p>
                                            <p className="text-xl sm:text-3xl font-extrabold text-white">{no_of_vacancy || '—'}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Apply Start */}
                                <div className="relative group bg-gradient-to-br from-zinc-900/80 to-zinc-900/40 backdrop-blur-xl rounded-2xl border border-zinc-800/60 p-4 sm:p-5 overflow-hidden hover:border-green-500/30 transition-all duration-300">
                                    <div className="absolute top-0 right-0 w-20 h-20 bg-green-500/5 rounded-full blur-2xl group-hover:bg-green-500/10 transition-all" />
                                    <div className="relative z-10 flex items-center gap-3 sm:block">
                                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-green-500/10 flex items-center justify-center sm:mb-3 shrink-0">
                                            <Calendar className="h-5 w-5 sm:h-6 sm:w-6 text-green-400" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] sm:text-xs text-zinc-500 uppercase tracking-widest font-semibold sm:mb-1">Start Date</p>
                                            <p className="text-lg sm:text-2xl font-bold text-white">{apply_start_date ? formatDate(apply_start_date) : '—'}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Last Date */}
                                <div className="relative group bg-gradient-to-br from-zinc-900/80 to-zinc-900/40 backdrop-blur-xl rounded-2xl border border-red-900/30 p-4 sm:p-5 overflow-hidden hover:border-red-500/40 transition-all duration-300">
                                    <div className="absolute top-0 right-0 w-20 h-20 bg-red-500/5 rounded-full blur-2xl group-hover:bg-red-500/10 transition-all" />
                                    <div className="relative z-10 flex items-center gap-3 sm:block">
                                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-red-500/10 flex items-center justify-center sm:mb-3 shrink-0">
                                            <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-red-400" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] sm:text-xs text-zinc-500 uppercase tracking-widest font-semibold sm:mb-1">Last Date</p>
                                            <p className="text-lg sm:text-2xl font-bold text-white">{last_date ? formatDate(last_date) : '—'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* ═══ Action Buttons (Desktop) ═══ */}
                            <div className="hidden sm:flex items-center gap-3 flex-wrap">
                                {notification_url && (
                                    <a href={getSecureUrl(notification_url)} target="_blank" rel="noopener noreferrer"
                                        className="flex items-center gap-2.5 px-6 py-3.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 hover:border-zinc-600 text-white font-semibold rounded-xl transition-all duration-300 group">
                                        <Download className="h-5 w-5 text-zinc-400 group-hover:text-white transition-colors" />
                                        <span>Download Notification</span>
                                    </a>
                                )}
                                <a href="https://wa.me/918581823795" target="_blank" rel="noopener noreferrer"
                                    className="flex items-center gap-2.5 px-8 py-3.5 bg-gradient-to-r from-[#E8652D] to-[#FF7A42] hover:from-[#FF7A42] hover:to-[#E8652D] text-white font-bold rounded-xl transition-all duration-300 shadow-lg hover:shadow-[0_0_30px_rgba(232,101,45,0.4)]">
                                    <Phone className="h-5 w-5" />
                                    <span>Contact Us</span>
                                </a>
                                <a href="https://wa.me/918581823795" target="_blank" rel="noopener noreferrer"
                                    className="flex items-center gap-2.5 px-6 py-3.5 bg-green-600 hover:bg-green-500 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-[0_0_20px_rgba(34,197,94,0.3)]">
                                    <Phone className="h-5 w-5" />
                                    <span>WhatsApp Help</span>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ═══════════════════ CONTENT AREA ═══════════════════ */}
                <div className="px-2 sm:px-6 lg:px-8">
                    <div className="max-w-7xl mx-auto">

                        {/* Rich HTML Content */}
                        {detail_content ? (
                            <div className="bg-gradient-to-b from-zinc-900/50 to-[#111] rounded-xl sm:rounded-3xl border border-zinc-800 p-3 sm:p-8 md:p-12 mb-6 detail-content overflow-hidden">
                                <div
                                    className="prose prose-invert max-w-none prose-orange"
                                    dangerouslySetInnerHTML={{ __html: sanitizeHtml(detail_content.replace(/&nbsp;/g, ' ')) }}
                                />
                            </div>
                        ) : (
                            <div className="bg-zinc-900/50 rounded-2xl border border-zinc-800 p-8 sm:p-12 text-center mb-6">
                                <FileText className="h-12 w-12 text-zinc-700 mx-auto mb-4" />
                                <p className="text-zinc-400 text-sm sm:text-base">Detailed information will be updated soon. Please download the notification PDF above.</p>
                            </div>
                        )}

                        {/* ═══ Trust Section ═══ */}
                        <div className="bg-gradient-to-br from-[#E8652D]/5 via-zinc-900/50 to-zinc-900/50 rounded-2xl sm:rounded-3xl border border-[#E8652D]/20 p-4 sm:p-8 md:p-10">
                            <h2 className="text-xl sm:text-2xl font-bold text-white mb-2 text-center">
                                Why Students Trust <span className="text-[#E8652D]">Online Wale Bhaiya</span>?
                            </h2>
                            <p className="text-zinc-500 text-center text-xs sm:text-sm mb-6 sm:mb-8 max-w-lg mx-auto">Form भरते समय सही जानकारी और सही process का ध्यान रखना बहुत जरूरी होता है।</p>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                {[
                                    { icon: Monitor, title: 'Live Screen Share', desc: 'पूरी process live screen share के माध्यम से दिखाई जाती है', color: 'text-blue-400', bg: 'bg-blue-500/10' },
                                    { icon: Trash2, title: 'Auto Document Delete', desc: 'Documents 30 सेकंड में automatically delete हो जाते हैं', color: 'text-purple-400', bg: 'bg-purple-500/10' },
                                    { icon: Award, title: 'TEC-CCE Certified', desc: 'Certified Village Level Entrepreneur द्वारा संचालित', color: 'text-amber-400', bg: 'bg-amber-500/10' },
                                    { icon: HomeIcon, title: 'Ghar Baithe Service', desc: 'WhatsApp के ज़रिए form filling घर बैठे हो सकता है', color: 'text-green-400', bg: 'bg-green-500/10' },
                                ].map((item, i) => (
                                    <div key={i} className="flex items-start gap-3 p-3 sm:p-4 bg-zinc-900/60 rounded-xl border border-zinc-800/50 hover:border-zinc-700 transition-all">
                                        <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-lg ${item.bg} flex items-center justify-center shrink-0`}>
                                            <item.icon className={`h-4 w-4 sm:h-5 sm:w-5 ${item.color}`} />
                                        </div>
                                        <div>
                                            <p className="text-white font-semibold text-sm sm:text-base">{item.title}</p>
                                            <p className="text-zinc-500 text-xs sm:text-sm mt-0.5 leading-relaxed">{item.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-6 sm:mt-8 text-center">
                                <a href="https://wa.me/918581823795" target="_blank" rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 px-6 sm:px-8 py-3 bg-green-600 hover:bg-green-500 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-[0_0_20px_rgba(34,197,94,0.3)] text-sm sm:text-base">
                                    <Phone className="h-4 w-4 sm:h-5 sm:w-5" /> WhatsApp/Call – 8581823795
                                </a>
                                <p className="text-zinc-600 text-xs mt-3">
                                    <a href="https://www.onlinewalebhaiya.com" className="text-[#E8652D] hover:text-[#FF7A42] transition-colors">www.onlinewalebhaiya.com</a>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ═══ Mobile Sticky Bottom Bar ═══ */}
            <div className="fixed bottom-0 left-0 right-0 z-40 sm:hidden bg-[#111]/95 backdrop-blur-xl border-t border-zinc-800 px-3 py-2 safe-area-bottom" style={{ marginBottom: 'env(safe-area-inset-bottom)' }}>
                <div className="flex items-center gap-2">
                    {notification_url && (
                        <a href={getSecureUrl(notification_url)} target="_blank" rel="noopener noreferrer"
                            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-zinc-800 text-white font-semibold rounded-xl text-xs border border-zinc-700">
                            <Download className="h-3.5 w-3.5" /> PDF
                        </a>
                    )}
                    <a href="https://wa.me/918581823795" target="_blank" rel="noopener noreferrer"
                        className="flex-[2] flex items-center justify-center gap-1.5 py-2.5 bg-gradient-to-r from-[#E8652D] to-[#FF7A42] text-white font-bold rounded-xl text-xs shadow-lg">
                        <Phone className="h-3.5 w-3.5" /> Contact Us
                    </a>
                </div>
            </div>

            {/* ═══ Global Styles ═══ */}
            <style jsx global>{`
                .detail-content {
                    overflow-wrap: anywhere !important;
                    word-wrap: break-word !important;
                    word-break: normal !important;
                }
                .detail-content * {
                    overflow-wrap: anywhere !important;
                    word-wrap: break-word !important;
                    word-break: normal !important;
                    white-space: normal !important;
                }
                .detail-content h1, .detail-content h2 {
                    margin-top: 1.5em; margin-bottom: 0.5em; font-weight: 800; color: #fff;
                    letter-spacing: -0.01em;
                    font-size: clamp(1.25rem, 4vw, 1.75rem);
                    border-bottom: 1px solid #27272a; padding-bottom: 0.3em;
                }
                .detail-content h3 {
                    margin-top: 1.5em; margin-bottom: 0.5em; font-weight: 700; color: #fff;
                    font-size: clamp(1.05rem, 3.5vw, 1.3rem);
                }
                .detail-content p {
                    margin-bottom: 0.8em; color: #a1a1aa; line-height: 1.8;
                    font-size: clamp(0.875rem, 2.5vw, 1rem);
                }
                .detail-content ul, .detail-content ol {
                    margin-bottom: 1.2em; padding-left: 1.25em; color: #a1a1aa;
                    font-size: clamp(0.875rem, 2.5vw, 1rem);
                }
                .detail-content li {
                    margin-bottom: 0.5em; line-height: 1.7;
                    padding-left: 0.5em;
                }
                .detail-content li::marker { color: #E8652D; }
                .detail-content table {
                    width: 100%; border-collapse: separate; border-spacing: 0;
                    margin: 1.5em 0; background: #18181b; border-radius: 16px;
                    overflow: hidden; display: block; overflow-x: auto;
                    -webkit-overflow-scrolling: touch; border: 1px solid #27272a;
                }
                .detail-content tbody { display: table; width: 100%; }
                .detail-content th, .detail-content td {
                    padding: 12px 16px; text-align: left;
                    font-size: clamp(0.75rem, 2.2vw, 0.875rem);
                    border-bottom: 1px solid #1e1e21;
                }
                .detail-content tr:nth-child(even) { background: #1a1a1e; }
                .detail-content tr:last-child td { border-bottom: none; }
                @media (min-width: 640px) {
                    .detail-content th, .detail-content td { padding: 14px 20px; white-space: normal; }
                }
                .detail-content th { background: #1f1f23; font-weight: 700; color: #fff; text-transform: uppercase; font-size: 0.7rem; letter-spacing: 0.05em; }
                .detail-content a { color: #E8652D; text-decoration: underline; text-underline-offset: 4px; overflow-wrap: anywhere; word-break: normal; }
                .detail-content a:hover { color: #FF7A42; }
                .detail-content strong { color: #e4e4e7; font-weight: 700; }
                .detail-content img { max-width: 100%; height: auto; border-radius: 16px; margin: 1em 0; border: 1px solid #27272a; }
                .safe-area-bottom { padding-bottom: max(0.5rem, env(safe-area-inset-bottom)); }
                .scrollbar-hide::-webkit-scrollbar { display: none; }
                .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </>
    );
}
