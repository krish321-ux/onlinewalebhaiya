'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { getSecureUrl } from '@/lib/secureUrl';

interface ServiceCardProps {
    id: string;
    title: string;
    description: string;
    image_url: string;
    icon_url?: string | null;
    delay?: number;
    inView?: boolean;
}

export default function ServiceCard({ id, title, description, image_url, icon_url, delay, inView = true }: ServiceCardProps) {
    const displayIcon = icon_url || image_url;

    return (
        <Link
            href={`/services/${id}`}
            className="group relative p-6 sm:p-8 bg-[#111] rounded-2xl border border-zinc-800 hover:border-[#E8652D]/40 transition-all duration-500 hover:shadow-[0_0_40px_rgba(232,101,45,0.1)] h-full flex flex-col"
            style={{ animation: (inView && delay !== undefined) ? `fadeInUp 0.6s ease-out ${delay}ms both` : 'none', opacity: inView ? undefined : 0 }}
        >
            {/* Service Icon */}
            <div className="mb-5 w-14 h-14 rounded-xl bg-zinc-800/50 flex items-center justify-center overflow-hidden shrink-0 p-2 group-hover:bg-[#E8652D]/10 transition-colors">
                <img
                    src={getSecureUrl(displayIcon)}
                    alt={title}
                    className="w-full h-full object-contain"
                    loading="lazy"
                />
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-white mb-2 sm:mb-3 group-hover:text-[#FF7A42] transition-colors line-clamp-2">{title}</h3>
            <p className="text-zinc-500 mb-4 sm:mb-5 leading-relaxed flex-grow text-sm sm:text-base line-clamp-3">{description}</p>
            <span className="inline-flex items-center gap-1 text-[#E8652D] font-semibold text-sm group-hover:gap-2 transition-all">
                Explore <ArrowRight className="h-4 w-4" />
            </span>
        </Link>
    );
}
