'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, Phone, MessageCircle, FileText, Loader2 } from 'lucide-react';
import ServiceCard from '@/components/ServiceCard';

interface Service {
    id: string;
    title: string;
    description: string;
    image_url: string;
    icon_url?: string | null;
    sort_order: number;
}

export default function OurServicesPage() {
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/services')
            .then(res => res.json())
            .then(data => setServices(Array.isArray(data) ? data : []))
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="min-h-screen bg-[#0a0a0a]">
            {/* Hero */}
            <div className="relative overflow-hidden pt-28 sm:pt-32 pb-12 sm:pb-16 px-4">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[#E8652D]/8 rounded-full blur-[120px]" />
                <div className="max-w-7xl mx-auto text-center relative z-10">
                    <span className="inline-block text-[#E8652D] font-semibold text-xs sm:text-sm uppercase tracking-widest mb-4">What We Offer</span>
                    <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-4 sm:mb-5">
                        Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#E8652D] to-[#FF7A42]">Services</span>
                    </h1>
                    <p className="text-zinc-400 text-sm sm:text-lg max-w-2xl mx-auto mb-6 sm:mb-8">
                        From government documents to job applications — we handle it all, quickly and accurately.
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
                        <Link href="/contact"
                            className="inline-flex items-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 bg-[#E8652D] hover:bg-[#FF7A42] text-white font-semibold rounded-xl transition-all duration-300 hover:shadow-[0_0_25px_rgba(232,101,45,0.4)] text-sm sm:text-base">
                            Request a Service <ArrowRight className="h-4 w-4" />
                        </Link>
                        <Link href="/contact"
                            className="inline-flex items-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 bg-white/5 hover:bg-white/10 text-white border border-zinc-700 hover:border-zinc-500 font-semibold rounded-xl transition-all duration-300 text-sm sm:text-base">
                            <Phone className="h-4 w-4" /> Contact Us
                        </Link>
                    </div>
                </div>
            </div>

            {/* Services Grid — Same card design as homepage */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 sm:pb-24">
                {loading ? (
                    <div className="flex justify-center p-12">
                        <Loader2 className="h-8 w-8 animate-spin text-[#E8652D]" />
                    </div>
                ) : services.length === 0 ? (
                    <div className="text-center py-16 text-zinc-400">
                        <p>Services will be available soon.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
                        {services.map((svc, i) => (
                            <ServiceCard
                                key={svc.id}
                                id={svc.id}
                                title={svc.title}
                                description={svc.description}
                                image_url={svc.image_url}
                                icon_url={svc.icon_url}
                                delay={i * 50}
                                inView={true}
                            />
                        ))}
                    </div>
                )}

                {/* Bottom CTA */}
                <div className="mt-12 sm:mt-16 text-center bg-[#111] border border-zinc-800 rounded-2xl p-6 sm:p-8 md:p-12">
                    <MessageCircle className="h-8 w-8 sm:h-10 sm:w-10 text-[#E8652D] mx-auto mb-3 sm:mb-4" />
                    <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-2 sm:mb-3">Can&apos;t find your service?</h2>
                    <p className="text-zinc-500 text-sm sm:text-base mb-4 sm:mb-6 max-w-lg mx-auto">
                        Contact us directly via WhatsApp or our contact form and our team will help you out.
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
                        <Link href="/contact"
                            className="inline-flex items-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 bg-[#E8652D] hover:bg-[#FF7A42] text-white font-semibold rounded-xl transition-all duration-300 text-sm sm:text-base">
                            <FileText className="h-4 w-4" /> Submit a Request
                        </Link>
                        <Link href="/contact"
                            className="inline-flex items-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 bg-white/5 hover:bg-white/10 text-white border border-zinc-700 font-semibold rounded-xl transition-all duration-300 text-sm sm:text-base">
                            <Phone className="h-4 w-4" /> Contact Us
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
