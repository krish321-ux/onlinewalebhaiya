'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Loader2, ArrowRight, CheckCircle, Target, Users, Shield, Zap, BookOpen, Building2, MapPin } from 'lucide-react';
import { sanitizeHtml } from '@/lib/sanitize';

export default function AboutPage() {
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/site-content?key=about_us')
            .then(res => res.json())
            .then(data => setContent(data.content || ''))
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center pt-20">
                <Loader2 className="h-8 w-8 animate-spin text-[#E8652D]" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0a0a0a]">
            {/* Hero Header */}
            <section className="relative pt-28 sm:pt-32 pb-12 sm:pb-16 overflow-hidden">
                {/* Background effects */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#E8652D]/15 via-[#0a0a0a] to-[#0a0a0a]" />
                <div className="absolute top-0 right-0 w-[400px] sm:w-[600px] h-[400px] sm:h-[600px] bg-[#E8652D]/8 rounded-full blur-[150px]" />
                <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-[#E8652D]/5 rounded-full blur-[100px]" />
                <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '50px 50px' }} />

                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
                    <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#E8652D]/10 border border-[#E8652D]/20 text-[#E8652D] text-xs sm:text-sm font-semibold mb-4 sm:mb-6">
                        🏪 Know Us Better
                    </span>
                    <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-white tracking-tight">
                        About <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#E8652D] to-[#FF7A42]">Us</span>
                    </h1>
                    <p className="mt-3 sm:mt-4 text-sm sm:text-base text-zinc-500 max-w-xl mx-auto">
                        Your trusted partner for government forms, scholarships, and online services across India.
                    </p>
                </div>

                <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#0a0a0a] to-transparent" />
            </section>

            {/* Content */}
            <section className="pb-16 sm:pb-24">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-[#111] rounded-2xl sm:rounded-3xl border border-zinc-800/80 p-5 sm:p-8 md:p-12 shadow-xl shadow-black/20">
                        {content ? (
                            <div
                                className="about-content"
                                dangerouslySetInnerHTML={{ __html: sanitizeHtml(content) }}
                            />
                        ) : (
                            <p className="text-zinc-500 text-center py-12 text-sm sm:text-base">About us content will be available soon.</p>
                        )}
                    </div>
                </div>
            </section>

            {/* Rich HTML Styles */}
            <style jsx global>{`
                .about-content {
                    color: #d4d4d8;
                    font-size: 15px;
                    line-height: 1.8;
                    word-wrap: break-word;
                    overflow-wrap: break-word;
                }
                @media (min-width: 640px) {
                    .about-content { font-size: 16px; }
                }
                @media (min-width: 768px) {
                    .about-content { font-size: 17px; line-height: 1.85; }
                }
                .about-content h1 {
                    font-size: 1.75em;
                    font-weight: 800;
                    color: #fff;
                    margin: 1.5em 0 0.6em 0;
                    line-height: 1.3;
                }
                .about-content h2 {
                    font-size: 1.4em;
                    font-weight: 700;
                    color: #fff;
                    margin: 1.3em 0 0.5em 0;
                    line-height: 1.3;
                    padding-bottom: 0.3em;
                    border-bottom: 2px solid rgba(232,101,45,0.2);
                }
                .about-content h3 {
                    font-size: 1.15em;
                    font-weight: 600;
                    color: #e4e4e7;
                    margin: 1.2em 0 0.4em 0;
                }
                .about-content p {
                    margin-bottom: 1em;
                }
                .about-content a {
                    color: #E8652D;
                    text-decoration: underline;
                    text-underline-offset: 3px;
                    transition: color 0.2s;
                }
                .about-content a:hover { color: #FF7A42; }
                .about-content strong, .about-content b {
                    color: #fff;
                    font-weight: 600;
                }
                .about-content em { font-style: italic; }
                .about-content ul, .about-content ol {
                    margin: 0.75em 0;
                    padding-left: 1.5em;
                }
                .about-content li {
                    margin-bottom: 0.4em;
                    color: #a1a1aa;
                }
                .about-content li::marker { color: #E8652D; }
                .about-content blockquote {
                    border-left: 4px solid #E8652D;
                    padding: 0.75em 1em;
                    margin: 1em 0;
                    background: rgba(232,101,45,0.05);
                    border-radius: 0 8px 8px 0;
                    color: #a1a1aa;
                    font-style: italic;
                }
                .about-content img {
                    max-width: 100%;
                    height: auto;
                    border-radius: 12px;
                    border: 1px solid #27272a;
                    margin: 1.5em 0;
                }
                .about-content pre {
                    background: #18181b;
                    border: 1px solid #27272a;
                    border-radius: 8px;
                    padding: 1em;
                    overflow-x: auto;
                    margin: 1em 0;
                    font-size: 0.9em;
                }
                .about-content code {
                    color: #E8652D;
                    background: rgba(232,101,45,0.1);
                    padding: 0.15em 0.4em;
                    border-radius: 4px;
                    font-size: 0.9em;
                }
                .about-content pre code {
                    color: #d4d4d8;
                    background: transparent;
                    padding: 0;
                }
                .about-content hr {
                    border: none;
                    border-top: 1px solid #27272a;
                    margin: 2em 0;
                }
                .about-content table {
                    width: 100%;
                    border-collapse: collapse;
                    margin: 1em 0;
                    font-size: 0.95em;
                }
                .about-content th, .about-content td {
                    border: 1px solid #27272a;
                    padding: 0.6em 0.8em;
                    text-align: left;
                }
                .about-content th {
                    background: #18181b;
                    color: #fff;
                    font-weight: 600;
                }
            `}</style>
        </div>
    );
}
