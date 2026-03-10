'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { X, Award, ZoomIn } from 'lucide-react';
import { getSecureUrl } from '@/lib/secureUrl';

type Certificate = {
    id: string;
    imageUrl: string;
    title: string;
    description: string;
};
type SocialLinks = {
    twitter: string;
    instagram: string;
    youtube: string;
};

export default function Footer() {
    const [certOpen, setCertOpen] = useState<Certificate | null>(null);
    const [socialLinks, setSocialLinks] = useState<SocialLinks>({ twitter: '', instagram: '', youtube: '' });
    const [certificates, setCertificates] = useState<Certificate[]>([]);

    useEffect(() => {
        // Fetch social links
        fetch('/api/site-content?key=social_links')
            .then(r => r.json())
            .then(data => { try { setSocialLinks(JSON.parse(data.content || '{}')); } catch { } })
            .catch(() => { });
        // Fetch certificates
        fetch('/api/site-content?key=certificates')
            .then(r => r.json())
            .then(data => { try { setCertificates(JSON.parse(data.content || '[]')); } catch { } })
            .catch(() => { });
    }, []);

    return (
        <>
            <footer className="relative bg-[#0a0a0a] border-t border-[#E8652D]/20 mt-0">
                {/* Top gradient line */}
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#E8652D] to-transparent" />

                <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 sm:gap-10">
                        {/* Brand */}
                        <div className="col-span-1 sm:col-span-2">
                            <div className="mb-4">
                                <img src="/logo.png" alt="OnlineWaleBhaiya" className="object-contain h-[60px] sm:h-[80px] md:h-[120px] w-auto" />
                            </div>
                            <div className="max-w-sm mb-6">
                                <div className="flex items-start gap-2.5">
                                    <p className="text-zinc-400 text-[13px] leading-relaxed">
                                        <span className="text-zinc-300 font-medium">Online Wale Bhaiya</span> is an authorised VLE (Village Level Entrepreneur) under the <span className="text-zinc-300 font-medium">Digital India Programme</span>. We follow all government guidelines &amp; compliance standards for digital assistance services.
                                    </p>
                                </div>
                            </div>

                            {/* Dynamic Certificate Badges - Circular */}
                            {certificates.length > 0 && (
                                <div className="flex flex-wrap gap-3 mb-6">
                                    {certificates.map(cert => (
                                        <div
                                            key={cert.id}
                                            onClick={() => setCertOpen(cert)}
                                            className="group cursor-pointer relative shrink-0"
                                            title={cert.title || 'Click to view certificate'}
                                        >
                                            <img
                                                src={getSecureUrl(cert.imageUrl)}
                                                alt={cert.title || 'Certificate'}
                                                className="w-16 h-16 rounded-full object-cover group-hover:scale-110 transition-transform duration-300"
                                            />
                                            <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                                <ZoomIn className="h-4 w-4 text-white" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Dynamic Social Links */}
                            <div className="flex gap-3">
                                {socialLinks.twitter && (
                                    <a href={socialLinks.twitter} target="_blank" rel="noopener noreferrer"
                                        className="w-10 h-10 rounded-xl bg-zinc-800 hover:bg-[#E8652D] flex items-center justify-center transition-all duration-300 text-zinc-400 hover:text-white">
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" /></svg>
                                    </a>
                                )}
                                {socialLinks.instagram && (
                                    <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer"
                                        className="w-10 h-10 rounded-xl bg-zinc-800 hover:bg-[#E8652D] flex items-center justify-center transition-all duration-300 text-zinc-400 hover:text-white">
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg>
                                    </a>
                                )}
                                {socialLinks.youtube && (
                                    <a href={socialLinks.youtube} target="_blank" rel="noopener noreferrer"
                                        className="w-10 h-10 rounded-xl bg-zinc-800 hover:bg-[#E8652D] flex items-center justify-center transition-all duration-300 text-zinc-400 hover:text-white">
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" /></svg>
                                    </a>
                                )}
                                {/* Show fallback if no links configured */}
                                {!socialLinks.twitter && !socialLinks.instagram && !socialLinks.youtube && (
                                    <>
                                        <span className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center text-zinc-600">
                                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" /></svg>
                                        </span>
                                        <span className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center text-zinc-600">
                                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg>
                                        </span>
                                        <span className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center text-zinc-600">
                                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" /></svg>
                                        </span>
                                    </>
                                )}
                            </div>
                        </div>

                        <div>
                            <h4 className="text-sm font-semibold text-[#E8652D] uppercase tracking-widest mb-5">Quick Links</h4>
                            <ul className="space-y-3">
                                <li><Link href="/jobs" className="text-zinc-500 hover:text-white transition-colors duration-200">Latest Jobs</Link></li>
                                <li><Link href="/scholarships" className="text-zinc-500 hover:text-white transition-colors duration-200">Scholarships</Link></li>
                                <li><Link href="/our-services" className="text-zinc-500 hover:text-white transition-colors duration-200">Our Services</Link></li>
                                <li><Link href="/case-status" className="text-zinc-500 hover:text-white transition-colors duration-200">Track Status</Link></li>
                                <li><Link href="/disclaimer" className="text-zinc-500 hover:text-white transition-colors duration-200">Disclaimer</Link></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="text-sm font-semibold text-[#E8652D] uppercase tracking-widest mb-5">Contact</h4>
                            <ul className="space-y-3 text-zinc-500">
                                <li className="hover:text-white transition-colors break-all">support@onlinewalebhaiya.com</li>
                                <li className="hover:text-white transition-colors">WhatsApp: +91 8581823795</li>
                                <li className="hover:text-white transition-colors">Pan-India Online Service</li>
                            </ul>
                        </div>
                    </div>

                    <div className="mt-10 sm:mt-12 pt-6 sm:pt-8 border-t border-zinc-800 flex flex-col items-center gap-4 text-center">
                        <p className="text-zinc-600 text-sm">
                            &copy; {new Date().getFullYear()} OnlineWaleBhaiya. All rights reserved.
                        </p>
                        <div className="flex items-center gap-4">
                            <Link href="/disclaimer" className="text-zinc-600 hover:text-[#E8652D] text-xs transition-colors">Disclaimer &amp; Policy</Link>
                            <span className="text-zinc-800">·</span>
                            <Link href="/contact" className="text-zinc-600 hover:text-[#E8652D] text-xs transition-colors">Contact Us</Link>
                            <span className="text-zinc-800">·</span>
                            <p className="text-zinc-700 text-xs">Made with 🧡 for India</p>
                        </div>
                    </div>
                </div>
            </footer>

            {/* Certificate Modal */}
            {certOpen && (
                <div
                    className="fixed inset-0 z-[999] flex items-center justify-center p-4"
                    onClick={() => setCertOpen(null)}
                >
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
                    <div className="relative z-10 max-w-3xl w-full animate-fade-in-scale" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between bg-[#111] border border-zinc-700 rounded-t-2xl px-5 py-3">
                            <div className="flex items-center gap-2">
                                <Award className="h-4 w-4 text-[#E8652D]" />
                                <span className="text-white text-sm font-semibold">{certOpen.title || 'Certificate'}</span>
                                <span className="ml-2 px-2 py-0.5 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs rounded-full font-medium">Verified ✓</span>
                            </div>
                            <button onClick={() => setCertOpen(null)}
                                className="w-8 h-8 rounded-lg bg-zinc-800 hover:bg-red-500/20 hover:text-red-400 flex items-center justify-center text-zinc-400 transition-all">
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                        <div className="bg-black border-x border-b border-zinc-700 rounded-b-2xl overflow-hidden">
                            <img src={getSecureUrl(certOpen.imageUrl)} alt={certOpen.title || 'Certificate'} className="w-full h-auto object-contain" />
                        </div>
                        <p className="text-center text-zinc-600 text-xs mt-3">
                            Click anywhere outside to close &nbsp;·&nbsp; {certOpen.description}
                        </p>
                    </div>
                </div>
            )}
        </>
    );
}
