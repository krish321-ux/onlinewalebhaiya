'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { FileText, Upload, CheckCircle, Loader2, Phone, Mail, MapPin, Clock } from 'lucide-react';
import { INDIAN_STATES } from '@/lib/constants';
import { servicesAPI } from '@/lib/api';
import Link from 'next/link';

export const SERVICE_TYPES = [
    'Form Filling',
    'Aadhaar Card Services',
    'PAN Card Services',
    'Voter ID Card Apply',
    'Jati / Awasiye / Aay / NCL Certificate',
    'Ticket Booking',
    'APAAR ID Card',
    'eShram Card',
    'Jamin Ka Raseed Katayi',
    'Aadhaar Correction',
    'Admit Card Download',
    'Result Check',
    'Online Application',
    'Certificate Verification',
    'Scholarship Application',
    'Railway Booking',
    'Other',
];

const CONTACT_INFO = [
    {
        icon: <Phone className="h-5 w-5" />,
        title: 'Call / WhatsApp',
        value: '+91 85818 23795',
        sub: 'Mon–Sat, 9AM–8PM',
    },
    {
        icon: <Mail className="h-5 w-5" />,
        title: 'Email',
        value: 'support@onlinewalebhaiya.com',
        sub: 'We reply within 24 hrs',
    },
    {
        icon: <MapPin className="h-5 w-5" />,
        title: 'Location',
        value: 'Bihar / Uttar Pradesh',
        sub: 'Service available PAN India',
    },
];

function ContactForm() {
    const searchParams = useSearchParams();

    const [formData, setFormData] = useState({
        name: '',
        phone: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [caseId, setCaseId] = useState('');

    useEffect(() => {
        const service = searchParams.get('service');
        if (service) {
            const match = SERVICE_TYPES.find(
                s => s === service || s.toLowerCase() === service.toLowerCase()
            );
            if (match) {
                setFormData(prev => ({ ...prev, serviceType: match }));
                setTimeout(() => {
                    document.getElementById('contact-form')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }, 300);
            }
        }
    }, [searchParams]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const data = new FormData();
            data.append('name', formData.name);
            data.append('phone', formData.phone);
            const result = await servicesAPI.submit(data);
            setCaseId(result.case_id);
            setSubmitted(true);
        } catch (err: any) {
            setError(err.message || 'Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] py-16 px-4 flex items-center justify-center">
                <div className="max-w-lg mx-auto text-center">
                    <div className="bg-[#111] rounded-3xl p-10 border border-zinc-800 shadow-2xl">
                        <div className="w-20 h-20 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                            <CheckCircle className="h-10 w-10 text-emerald-500" />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2">Request Submitted! 🎉</h2>
                        <p className="text-zinc-500 mb-6">Your service request has been successfully submitted.</p>
                        <div className="bg-[#E8652D]/10 border border-[#E8652D]/20 rounded-2xl p-5 mb-6">
                            <p className="text-sm text-zinc-500 mb-1">Your Case ID</p>
                            <p className="text-2xl font-bold text-[#E8652D] font-mono tracking-widest">{caseId}</p>
                        </div>
                        <p className="text-sm text-zinc-500 mb-8">
                            Save this Case ID to track your request.{' '}
                            <Link href="/case-status" className="text-[#E8652D] hover:text-[#FF7A42] font-semibold transition-colors">Track Status →</Link>
                        </p>
                        <button onClick={() => { setSubmitted(false); setFormData({ name: '', phone: '' }); }}
                            className="bg-[#E8652D] hover:bg-[#FF7A42] text-white font-bold py-3 px-8 rounded-xl transition-all duration-300">
                            Submit Another Request
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0a0a0a]">
            {/* Hero */}
            <div className="relative pt-32 pb-14 px-4 text-center">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[250px] bg-[#E8652D]/8 rounded-full blur-[120px]" />
                <div className="relative z-10">
                    <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#E8652D]/10 border border-[#E8652D]/20 text-[#E8652D] text-sm font-semibold mb-4">
                        📞 Get In Touch
                    </span>
                    <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">
                        Contact <span className="text-gradient">Us</span>
                    </h1>
                    <p className="text-zinc-500 text-lg max-w-xl mx-auto">
                        Fill the form below or reach us directly. We&apos;ll respond within a few hours.
                    </p>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Contact Info Cards */}
                    <div className="space-y-4">
                        {CONTACT_INFO.map((info) => (
                            <div key={info.title} className="bg-[#111] border border-zinc-800 rounded-2xl p-5 flex items-start gap-4 hover:border-[#E8652D]/30 transition-all">
                                <div className="w-10 h-10 bg-[#E8652D]/10 rounded-xl flex items-center justify-center text-[#E8652D] shrink-0">
                                    {info.icon}
                                </div>
                                <div>
                                    <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider mb-0.5">{info.title}</p>
                                    <p className="text-white font-semibold text-sm">{info.value}</p>
                                    <p className="text-zinc-600 text-xs mt-0.5">{info.sub}</p>
                                </div>
                            </div>
                        ))}
                        <div className="bg-[#E8652D]/10 border border-[#E8652D]/20 rounded-2xl p-5 text-center">
                            <p className="text-zinc-400 text-sm mb-3">Need to track an existing request?</p>
                            <Link href="/case-status"
                                className="inline-flex items-center gap-2 px-4 py-2 bg-[#E8652D] hover:bg-[#FF7A42] text-white text-sm font-semibold rounded-xl transition-all">
                                Track Status →
                            </Link>
                        </div>
                    </div>

                    {/* Form */}
                    <div className="lg:col-span-2">
                        <div id="contact-form" className="bg-[#111] rounded-3xl p-6 sm:p-8 border border-zinc-800 shadow-2xl">
                            {error && (
                                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm">{error}</div>
                            )}
                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div>
                                    <label className="block text-sm font-medium text-zinc-400 mb-1.5">Full Name *</label>
                                    <input type="text" required value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-4 py-2.5 rounded-xl bg-zinc-800/50 border border-zinc-700 text-white placeholder-zinc-600 outline-none focus:ring-2 focus:ring-[#E8652D] focus:border-transparent transition-all"
                                        placeholder="e.g. Rahul Kumar" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-zinc-400 mb-1.5">Phone Number *</label>
                                    <input type="tel" required pattern="[0-9]{10}" maxLength={10} value={formData.phone}
                                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                        className="w-full px-4 py-2.5 rounded-xl bg-zinc-800/50 border border-zinc-700 text-white placeholder-zinc-600 outline-none focus:ring-2 focus:ring-[#E8652D] focus:border-transparent transition-all"
                                        placeholder="10-digit number" />
                                </div>
                                <button type="submit" disabled={loading}
                                    className="w-full bg-[#E8652D] hover:bg-[#FF7A42] text-white font-bold py-3.5 rounded-xl shadow-lg hover:shadow-[0_0_25px_rgba(232,101,45,0.3)] transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50">
                                    {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <><FileText className="h-5 w-5" /> Submit Request</>}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function ContactPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-[#0a0a0a]" />}>
            <ContactForm />
        </Suspense>
    );
}
