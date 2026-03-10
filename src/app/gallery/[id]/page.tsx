'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Loader2, ArrowLeft, Calendar } from 'lucide-react';
import { getSecureUrl } from '@/lib/secureUrl';
import { sanitizeHtml } from '@/lib/sanitize';

interface ImageDetail {
    id: string;
    title: string;
    image_url: string;
    detail_content: string | null;
    created_at: string;
}

export default function GalleryDetailPage() {
    const params = useParams();
    const [image, setImage] = useState<ImageDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!params.id) return;
        fetch(`/api/gallery/${params.id}`)
            .then(res => {
                if (!res.ok) throw new Error('Image not found');
                return res.json();
            })
            .then(data => setImage(data))
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

    if (error || !image) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center gap-4 pt-20 px-4">
                <p className="text-zinc-400 text-sm sm:text-base">{error || 'Image not found'}</p>
                <Link href="/" className="text-[#E8652D] hover:text-[#FF7A42] flex items-center gap-2 text-sm">
                    <ArrowLeft className="h-4 w-4" /> Back to Home
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0a0a0a]">
            {/* Hero Image — responsive aspect ratio */}
            <section className="relative w-full bg-[#0a0a0a] pt-16 sm:pt-20">
                <div className="relative w-full overflow-hidden" style={{ aspectRatio: '1366 / 379' }}>
                    <img
                        src={image.image_url}
                        alt={image.title || 'Gallery Image'}
                        className="w-full h-full object-contain"
                    />
                    <div className="absolute bottom-0 left-0 right-0 h-16 sm:h-24 bg-gradient-to-t from-[#0a0a0a] to-transparent" />
                </div>
            </section>

            {/* Content Area */}
            <section className="pb-16 sm:pb-24">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Breadcrumb */}
                    <div className="mb-4 sm:mb-6 mt-4 sm:mt-0">
                        <Link href="/" className="inline-flex items-center gap-2 text-xs sm:text-sm text-zinc-400 hover:text-[#E8652D] transition-colors">
                            <ArrowLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> Back to Home
                        </Link>
                    </div>

                    {/* Title Card */}
                    {image.title && (
                        <div className="mb-6 sm:mb-8">
                            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
                                {image.title}
                            </h1>
                            <div className="flex items-center gap-2 mt-2 sm:mt-3 text-xs sm:text-sm text-zinc-500">
                                <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                {new Date(image.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                            </div>
                        </div>
                    )}

                    {/* Detail Content */}
                    <div className="bg-[#111] rounded-2xl sm:rounded-3xl border border-zinc-800/80 p-5 sm:p-8 md:p-12 shadow-xl shadow-black/20">
                        {image.detail_content ? (
                            <div
                                className="gallery-detail-content"
                                dangerouslySetInnerHTML={{ __html: sanitizeHtml(image.detail_content) }}
                            />
                        ) : (
                            <div className="text-center py-10 sm:py-16">
                                <p className="text-zinc-500 text-sm sm:text-base mb-4">No additional details available for this image yet.</p>
                                <Link href="/" className="inline-flex items-center gap-2 text-[#E8652D] hover:text-[#FF7A42] text-sm font-semibold transition-colors">
                                    <ArrowLeft className="h-4 w-4" /> Explore more
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* Rich HTML Styles */}
            <style jsx global>{`
                .gallery-detail-content {
                    color: #d4d4d8;
                    font-size: 15px;
                    line-height: 1.8;
                    word-wrap: break-word;
                    overflow-wrap: break-word;
                }
                @media (min-width: 640px) {
                    .gallery-detail-content { font-size: 16px; }
                }
                @media (min-width: 768px) {
                    .gallery-detail-content { font-size: 17px; line-height: 1.85; }
                }
                .gallery-detail-content h1 {
                    font-size: 1.75em;
                    font-weight: 800;
                    color: #fff;
                    margin: 1.5em 0 0.6em 0;
                    line-height: 1.3;
                }
                .gallery-detail-content h2 {
                    font-size: 1.4em;
                    font-weight: 700;
                    color: #fff;
                    margin: 1.3em 0 0.5em 0;
                    line-height: 1.3;
                    padding-bottom: 0.3em;
                    border-bottom: 2px solid rgba(232,101,45,0.2);
                }
                .gallery-detail-content h3 {
                    font-size: 1.15em;
                    font-weight: 600;
                    color: #e4e4e7;
                    margin: 1.2em 0 0.4em 0;
                }
                .gallery-detail-content p { margin-bottom: 1em; }
                .gallery-detail-content a {
                    color: #E8652D;
                    text-decoration: underline;
                    text-underline-offset: 3px;
                }
                .gallery-detail-content a:hover { color: #FF7A42; }
                .gallery-detail-content strong, .gallery-detail-content b {
                    color: #fff;
                    font-weight: 600;
                }
                .gallery-detail-content ul, .gallery-detail-content ol {
                    margin: 0.75em 0;
                    padding-left: 1.5em;
                }
                .gallery-detail-content li {
                    margin-bottom: 0.4em;
                    color: #a1a1aa;
                }
                .gallery-detail-content li::marker { color: #E8652D; }
                .gallery-detail-content blockquote {
                    border-left: 4px solid #E8652D;
                    padding: 0.75em 1em;
                    margin: 1em 0;
                    background: rgba(232,101,45,0.05);
                    border-radius: 0 8px 8px 0;
                    color: #a1a1aa;
                }
                .gallery-detail-content img {
                    max-width: 100%;
                    height: auto;
                    border-radius: 12px;
                    border: 1px solid #27272a;
                    margin: 1.5em 0;
                }
                .gallery-detail-content pre {
                    background: #18181b;
                    border: 1px solid #27272a;
                    border-radius: 8px;
                    padding: 1em;
                    overflow-x: auto;
                    margin: 1em 0;
                }
                .gallery-detail-content code {
                    color: #E8652D;
                    background: rgba(232,101,45,0.1);
                    padding: 0.15em 0.4em;
                    border-radius: 4px;
                    font-size: 0.9em;
                }
                .gallery-detail-content hr {
                    border: none;
                    border-top: 1px solid #27272a;
                    margin: 2em 0;
                }
            `}</style>
        </div>
    );
}
