'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Loader2, ArrowLeft, ChevronRight } from 'lucide-react';
import { getSecureUrl } from '@/lib/secureUrl';
import { sanitizeHtml } from '@/lib/sanitize';

interface ServiceDetail {
    id: string;
    title: string;
    description: string;
    image_url: string;
    detail_content: string | null;
    created_at: string;
}

export default function ServiceDetailPage() {
    const params = useParams();
    const [service, setService] = useState<ServiceDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!params.id) return;
        fetch(`/api/services/${params.id}`)
            .then(res => {
                if (!res.ok) throw new Error('Service not found');
                return res.json();
            })
            .then(data => setService(data))
            .catch(err => setError(err.message))
            .finally(() => setLoading(false));
    }, [params.id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center pt-20">
                <Loader2 className="h-8 w-8 animate-spin text-[#E8652D]" />
            </div>
        );
    }

    if (error || !service) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center gap-4 pt-20 px-4">
                <p className="text-zinc-400">{error || 'Service not found'}</p>
                <Link href="/our-services" className="text-[#E8652D] hover:text-[#FF7A42] flex items-center gap-2 text-sm">
                    <ArrowLeft className="h-4 w-4" /> Back to Services
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0a0a0a]">
            {/* Hero Image — Full Width */}
            <section className="relative w-full bg-[#0a0a0a] pt-16 sm:pt-20">
                <div className="relative w-full max-h-[400px] sm:max-h-[450px] overflow-hidden">
                    <img
                        src={getSecureUrl(service.image_url)}
                        alt={service.title}
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/30 to-transparent" />
                </div>
            </section>

            {/* Header: Breadcrumb + Title */}
            <section className="relative z-10 -mt-16 sm:-mt-20 px-4 sm:px-6 lg:px-8 pb-6">
                <div className="max-w-7xl mx-auto">
                    <nav className="flex items-center gap-1.5 text-xs sm:text-sm text-zinc-500 mb-4 sm:mb-6">
                        <Link href="/" className="hover:text-[#E8652D] transition-colors">Home</Link>
                        <ChevronRight className="h-3 w-3" />
                        <Link href="/our-services" className="hover:text-[#E8652D] transition-colors">Our Services</Link>
                        <ChevronRight className="h-3 w-3" />
                        <span className="text-zinc-400 truncate max-w-[150px] sm:max-w-none">{service.title}</span>
                    </nav>
                    <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight mb-2 sm:mb-3">
                        {service.title}
                    </h1>
                    {service.description && (
                        <p className="text-zinc-400 text-sm sm:text-base max-w-3xl">{service.description}</p>
                    )}
                </div>
            </section>

            {/* Detail Content — Full Width, No Box */}
            <section className="pb-16 sm:pb-24">
                <div className="w-full">
                    {service.detail_content ? (
                        <div
                            className="service-detail-content"
                            dangerouslySetInnerHTML={{ __html: sanitizeHtml(service.detail_content) }}
                        />
                    ) : (
                        <div className="text-center py-10 sm:py-16">
                            <p className="text-zinc-500 text-sm sm:text-base mb-4">Detailed information coming soon.</p>
                            <Link href="/our-services" className="inline-flex items-center gap-2 text-[#E8652D] hover:text-[#FF7A42] text-sm font-semibold transition-colors">
                                <ArrowLeft className="h-4 w-4" /> Browse other services
                            </Link>
                        </div>
                    )}
                </div>

                {/* Back link */}
                <div className="mt-8 text-center">
                    <Link href="/our-services" className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-[#E8652D] transition-colors">
                        <ArrowLeft className="h-4 w-4" /> Back to All Services
                    </Link>
                </div>
            </section>

            {/* Full-Page Rich HTML Styles */}
            <style jsx global>{`
                /* ── Base Content ── */
                .service-detail-content {
                    color: #d4d4d8;
                    font-size: 15px;
                    line-height: 1.8;
                    word-wrap: break-word;
                    overflow-wrap: break-word;
                }
                @media (min-width: 640px) { .service-detail-content { font-size: 16px; } }
                @media (min-width: 768px) { .service-detail-content { font-size: 17px; line-height: 1.85; } }

                /* ── Headings ── */
                .service-detail-content h1 { font-size: 1.75em; font-weight: 800; color: #fff; margin: 1.5em 0 0.6em; padding: 0 4%; }
                .service-detail-content h2 { font-size: 1.4em; font-weight: 700; color: #fff; margin: 1.3em 0 0.5em; padding: 0 4% 0.3em; border-bottom: 2px solid rgba(232,101,45,0.2); }
                .service-detail-content h3 { font-size: 1.15em; font-weight: 600; color: #e4e4e7; margin: 1.2em 0 0.4em; padding: 0 4%; }

                /* ── Paragraphs & Text ── */
                .service-detail-content p { margin-bottom: 1em; padding: 0 4%; }
                .service-detail-content a { color: #E8652D; text-decoration: underline; text-underline-offset: 3px; }
                .service-detail-content a:hover { color: #FF7A42; }
                .service-detail-content strong, .service-detail-content b { color: #fff; font-weight: 600; }

                /* ── Lists ── */
                .service-detail-content ul, .service-detail-content ol { margin: 0.75em 4%; padding-left: 1.5em; }
                .service-detail-content li { margin-bottom: 0.4em; color: #a1a1aa; }
                .service-detail-content li::marker { color: #E8652D; }

                /* ── Blockquote / Callout Box ── */
                .service-detail-content blockquote {
                    border-left: 4px solid #E8652D;
                    padding: 1em 1.5em;
                    margin: 1.5em 4%;
                    background: linear-gradient(135deg, rgba(232,101,45,0.08), rgba(232,101,45,0.02));
                    border-radius: 0 12px 12px 0;
                    color: #a1a1aa;
                    font-style: normal;
                }

                /* ── Images ── */
                .service-detail-content img { max-width: 100%; height: auto; border-radius: 12px; border: 1px solid #27272a; margin: 1.5em auto; display: block; }

                /* ── Code ── */
                .service-detail-content pre { background: #18181b; border: 1px solid #27272a; border-radius: 8px; padding: 1em; overflow-x: auto; margin: 1em 4%; }
                .service-detail-content code { color: #E8652D; background: rgba(232,101,45,0.1); padding: 0.15em 0.4em; border-radius: 4px; font-size: 0.9em; }

                /* ── Divider ── */
                .service-detail-content hr { border: none; border-top: 1px solid #27272a; margin: 2em 4%; }

                /* ── Tables — Full width, styled ── */
                .service-detail-content table {
                    width: 100%;
                    border-collapse: collapse;
                    margin: 1.5em 0;
                    background: #111;
                    font-size: 0.95em;
                }
                .service-detail-content table td,
                .service-detail-content table th {
                    border: 1px solid #27272a;
                    padding: 12px 16px;
                    color: #d4d4d8;
                    vertical-align: top;
                }
                .service-detail-content table tr:first-child td,
                .service-detail-content table th {
                    background: #1a1a1a;
                    font-weight: 700;
                    color: #fff;
                    text-transform: uppercase;
                    font-size: 0.85em;
                    letter-spacing: 0.05em;
                }
                .service-detail-content table tr:nth-child(even) td {
                    background: rgba(255,255,255,0.02);
                }
                .service-detail-content table tr:hover td {
                    background: rgba(232,101,45,0.05);
                }

                /* ── Responsive table ── */
                @media (max-width: 640px) {
                    .service-detail-content table {
                        display: block;
                        overflow-x: auto;
                        -webkit-overflow-scrolling: touch;
                    }
                }

                /* ── Colored Highlight Boxes (via background-color in editor) ── */
                .service-detail-content [style*="background-color"] {
                    border-radius: 12px;
                    padding: 1em 1.5em !important;
                    margin: 1em 4%;
                }

                /* ── Centered text ── */
                .service-detail-content .ql-align-center { text-align: center; }
                .service-detail-content .ql-align-right { text-align: right; }
                .service-detail-content .ql-align-justify { text-align: justify; }

                /* ── Size variants ── */
                .service-detail-content .ql-size-small { font-size: 0.8em; }
                .service-detail-content .ql-size-large { font-size: 1.3em; }
                .service-detail-content .ql-size-huge { font-size: 1.8em; color: #fff; font-weight: 700; }
            `}</style>
        </div>
    );
}
