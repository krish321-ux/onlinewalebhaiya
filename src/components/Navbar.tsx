'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, ChevronDown } from 'lucide-react';

const serviceDropdownItems = [
    { name: 'All Services', href: '/our-services' },
    { name: 'Form Filling', href: '/contact?service=Form+Filling' },
    { name: 'Aadhaar Card Services', href: '/contact?service=Aadhaar+Card+Services' },
    { name: 'Railway Ticket Booking', href: '/contact?service=Ticket+Booking' },
    { name: 'Scholarships', href: '/scholarships' },
    { name: 'Track Status', href: '/case-status' },
];

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const pathname = usePathname();

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close mobile menu on route change
    useEffect(() => {
        setIsOpen(false);
    }, [pathname]);

    const links = [
        { name: 'Home', href: '/' },
        { name: 'Jobs', href: '/jobs' },
        { name: 'Scholarships', href: '/scholarships' },
        { name: 'Our Services', href: '/our-services' },
        { name: 'Status', href: '/case-status' },
        { name: 'About Us', href: '/about' },
        { name: 'Contact', href: '/contact' },
    ];

    const isActive = (href: string) => {
        if (href === '/') return pathname === '/';
        return pathname.startsWith(href);
    };

    return (
        <nav className={`fixed w-full z-50 transition-all duration-500 ${scrolled
            ? 'bg-black/80 backdrop-blur-xl shadow-[0_2px_20px_rgba(0,0,0,0.5)] border-b border-white/5'
            : 'bg-transparent'
            }`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16 sm:h-20 items-center">
                    <Link href="/" className="flex-shrink-0 group">
                        <img src="/logo.png" alt="OnlineWaleBhaiya" className="object-contain group-hover:brightness-110 transition-all duration-300 h-[50px] sm:h-[65px] w-auto" />
                    </Link>

                    <div className="hidden md:flex space-x-1 items-center">
                        {links.map((link) => (
                            <Link
                                key={link.name}
                                href={link.href}
                                className={`relative px-4 py-2 font-medium transition-all duration-300 group ${isActive(link.href) ? 'text-white' : 'text-zinc-400 hover:text-white'}`}
                            >
                                {link.name}
                                <span className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 bg-[#E8652D] rounded-full transition-all duration-300 ${isActive(link.href) ? 'w-3/4' : 'w-0 group-hover:w-3/4'}`} />
                            </Link>
                        ))}
                    </div>

                    <div className="md:hidden flex items-center">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="text-zinc-400 hover:text-white p-2 transition-colors"
                        >
                            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            <div className={`md:hidden overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="bg-black/95 backdrop-blur-xl border-t border-white/5 px-4 pt-2 pb-6 space-y-1">
                    {links.map((link) => (
                        <Link
                            key={link.name}
                            href={link.href}
                            className={`block px-4 py-3.5 rounded-xl text-base font-medium transition-all duration-200 ${isActive(link.href)
                                ? 'text-[#E8652D] bg-[#E8652D]/10'
                                : 'text-zinc-400 hover:text-white hover:bg-white/5'
                                }`}
                            onClick={() => setIsOpen(false)}
                        >
                            {link.name}
                        </Link>
                    ))}
                </div>
            </div>
        </nav>
    );
}
