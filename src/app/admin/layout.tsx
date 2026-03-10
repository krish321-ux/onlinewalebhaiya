'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
    LayoutDashboard, Briefcase, GraduationCap,
    FileText, Search, MessageSquare, LogOut, Menu, X, Users, Image, Layers, Globe
} from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        // Simple check for auth
        const token = localStorage.getItem('adminToken');
        if (!token && pathname !== '/admin/login') {
            router.push('/admin/login');
        }
    }, [pathname, router]);

    if (!mounted) return null;

    // Don't show layout on login page
    if (pathname === '/admin/login') {
        return <div className="dark">{children}</div>;
    }

    const menuItems = [
        { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
        { name: 'Jobs', href: '/admin/jobs', icon: Briefcase },
        { name: 'Scholarships', href: '/admin/scholarships', icon: GraduationCap },
        { name: 'Services', href: '/admin/services', icon: Layers },
        { name: 'Service Requests', href: '/admin/requests', icon: FileText },
        { name: 'Case Tracking', href: '/admin/cases', icon: Search },
        { name: 'Conversations', href: '/admin/conversations', icon: MessageSquare },
        { name: 'User Leads', href: '/admin/leads', icon: Users },
        { name: 'Liza AI Training', href: '/admin/chatbot', icon: MessageSquare },
        { name: 'Website Pages', href: '/admin/chatbot/pages', icon: FileText },
        { name: 'About Us Page', href: '/admin/about', icon: Globe },
        { name: 'Gallery', href: '/admin/gallery', icon: Image },
    ];

    const handleLogout = () => {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        router.push('/admin/login');
    };

    return (
        <div className="dark min-h-screen bg-zinc-100 dark:bg-zinc-950 flex">
            {/* Mobile Sidebar Toggle */}
            <button
                className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white dark:bg-zinc-800 rounded-md shadow-md"
                onClick={() => setSidebarOpen(!isSidebarOpen)}
            >
                {isSidebarOpen ? <X /> : <Menu />}
            </button>

            {/* Sidebar */}
            <aside className={`
        fixed lg:static inset-y-0 left-0 z-40 w-64 bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 transform transition-transform duration-200 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
                <div className="h-full flex flex-col">
                    <div className="p-6 border-b border-zinc-200 dark:border-zinc-800">
                        <img src="/logo.png" alt="OWB Admin" style={{ height: '50px', width: 'auto' }} className="object-contain mb-1" />
                        <p className="text-xs text-zinc-500">Control Panel</p>
                    </div>

                    <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                        {menuItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${isActive
                                        ? 'bg-[#E8652D]/10 dark:bg-[#E8652D]/20 text-[#E8652D] dark:text-[#FF7A42]'
                                        : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-white'
                                        }`}
                                >
                                    <Icon className="h-5 w-5" />
                                    {item.name}
                                </Link>
                            );
                        })}
                    </nav>

                    <div className="p-4 border-t border-zinc-200 dark:border-zinc-800">
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-3 w-full px-4 py-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-sm font-medium transition-colors"
                        >
                            <LogOut className="h-5 w-5" />
                            Logout
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto h-screen p-4 lg:p-8 pt-16 lg:pt-8 w-full">
                {children}
            </main>

            {/* Overlay for mobile */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-30 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                ></div>
            )}
        </div>
    );
}
