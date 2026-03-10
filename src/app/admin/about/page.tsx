'use client';

import { useState, useEffect, useRef } from 'react';
import { Loader2, Save, Eye, Plus, Trash2, Upload, Instagram, Twitter, Youtube, X, Award, ExternalLink } from 'lucide-react';
import RichTextEditor from '@/components/RichTextEditor';
import { sanitizeHtml } from '@/lib/sanitize';

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

export default function AdminAboutPage() {
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');
    const [previewMode, setPreviewMode] = useState(false);
    const [activeTab, setActiveTab] = useState<'content' | 'social' | 'certificates'>('content');

    // Social links
    const [socialLinks, setSocialLinks] = useState<SocialLinks>({ twitter: '', instagram: '', youtube: '' });
    const [savingSocial, setSavingSocial] = useState(false);

    // Certificates
    const [certificates, setCertificates] = useState<Certificate[]>([]);
    const [savingCerts, setSavingCerts] = useState(false);
    const [uploadingCert, setUploadingCert] = useState(false);
    const certFileRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        Promise.all([
            fetch('/api/site-content?key=about_us').then(r => r.json()),
            fetch('/api/site-content?key=social_links').then(r => r.json()),
            fetch('/api/site-content?key=certificates').then(r => r.json()),
        ]).then(([aboutData, socialData, certData]) => {
            setContent(aboutData.content || '');
            try {
                const parsed = JSON.parse(socialData.content || '{}');
                setSocialLinks({ twitter: parsed.twitter || '', instagram: parsed.instagram || '', youtube: parsed.youtube || '' });
            } catch { }
            try { setCertificates(JSON.parse(certData.content || '[]')); } catch { }
        }).catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    const getToken = () => localStorage.getItem('adminToken');
    const authHeaders = () => {
        const token = getToken();
        return { 'Content-Type': 'application/json', ...(token ? { 'Authorization': `Bearer ${token}` } : {}) };
    };

    // Save About content
    const handleSaveContent = async () => {
        setSaving(true); setError('');
        try {
            const res = await fetch('/api/site-content', {
                method: 'PUT', headers: authHeaders(),
                body: JSON.stringify({ key: 'about_us', content }),
            });
            if (!res.ok) throw new Error((await res.json()).error || 'Save failed');
            setSuccess('About Us content saved! ✅');
            setTimeout(() => setSuccess(''), 3000);
        } catch (err: any) { setError(err.message); }
        finally { setSaving(false); }
    };

    // Save Social Links
    const handleSaveSocial = async () => {
        setSavingSocial(true); setError('');
        try {
            const res = await fetch('/api/site-content', {
                method: 'PUT', headers: authHeaders(),
                body: JSON.stringify({ key: 'social_links', content: JSON.stringify(socialLinks) }),
            });
            if (!res.ok) throw new Error((await res.json()).error || 'Save failed');
            setSuccess('Social links saved! ✅');
            setTimeout(() => setSuccess(''), 3000);
        } catch (err: any) { setError(err.message); }
        finally { setSavingSocial(false); }
    };

    // Upload certificate image
    const handleCertUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploadingCert(true); setError('');
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('bucket', 'certificates');
            const token = getToken();
            const res = await fetch('/api/upload', {
                method: 'POST',
                headers: token ? { 'Authorization': `Bearer ${token}` } : {},
                body: formData,
            });
            if (!res.ok) throw new Error('Upload failed');
            const data = await res.json();
            const newCert: Certificate = {
                id: Date.now().toString(),
                imageUrl: data.url || data.publicUrl,
                title: '',
                description: '',
            };
            setCertificates(prev => [...prev, newCert]);
        } catch (err: any) { setError(err.message); }
        finally { setUploadingCert(false); if (certFileRef.current) certFileRef.current.value = ''; }
    };

    // Save certificates
    const handleSaveCerts = async () => {
        setSavingCerts(true); setError('');
        try {
            const res = await fetch('/api/site-content', {
                method: 'PUT', headers: authHeaders(),
                body: JSON.stringify({ key: 'certificates', content: JSON.stringify(certificates) }),
            });
            if (!res.ok) throw new Error((await res.json()).error || 'Save failed');
            setSuccess('Certificates saved! ✅');
            setTimeout(() => setSuccess(''), 3000);
        } catch (err: any) { setError(err.message); }
        finally { setSavingCerts(false); }
    };

    const updateCert = (id: string, field: keyof Certificate, value: string) => {
        setCertificates(prev => prev.map(c => c.id === id ? { ...c, [field]: value } : c));
    };
    const removeCert = (id: string) => {
        setCertificates(prev => prev.filter(c => c.id !== id));
    };

    if (loading) {
        return <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-[#E8652D]" /></div>;
    }

    const tabs = [
        { key: 'content' as const, label: 'Page Content', icon: Eye },
        { key: 'social' as const, label: 'Social Links', icon: Instagram },
        { key: 'certificates' as const, label: 'Certificates', icon: Award },
    ];

    return (
        <div className="max-w-5xl mx-auto">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">About Us Page</h1>
                    <p className="text-sm text-zinc-500 mt-1">Manage content, social media links, and certificates.</p>
                </div>
            </div>

            {error && <div className="mb-4 p-3 rounded-lg bg-red-900/20 border border-red-800 text-red-300 text-sm">{error}</div>}
            {success && <div className="mb-4 p-3 rounded-lg bg-green-900/20 border border-green-800 text-green-300 text-sm">{success}</div>}

            {/* Tabs */}
            <div className="flex gap-1 mb-6 bg-zinc-100 dark:bg-zinc-900 rounded-xl p-1 border border-zinc-200 dark:border-zinc-800">
                {tabs.map(tab => {
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === tab.key
                                ? 'bg-[#E8652D] text-white shadow-md'
                                : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-zinc-800'
                                }`}
                        >
                            <Icon className="h-4 w-4" />
                            <span className="hidden sm:inline">{tab.label}</span>
                        </button>
                    );
                })}
            </div>

            {/* ── TAB: Page Content ── */}
            {activeTab === 'content' && (
                <div>
                    <div className="flex justify-end gap-3 mb-4">
                        <button onClick={() => setPreviewMode(!previewMode)}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-sm">
                            <Eye className="h-4 w-4" /> {previewMode ? 'Edit' : 'Preview'}
                        </button>
                        <button onClick={handleSaveContent} disabled={saving}
                            className="bg-[#E8652D] hover:bg-[#FF7A42] text-white px-5 py-2 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50 text-sm font-semibold">
                            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                            {saving ? 'Saving...' : 'Save'}
                        </button>
                    </div>
                    {previewMode ? (
                        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 sm:p-6 lg:p-10 overflow-x-auto w-full">
                            <div className="prose prose-sm sm:prose-base lg:prose-lg prose-invert max-w-full break-words
                                prose-headings:text-white prose-headings:font-bold prose-p:text-zinc-300 prose-p:leading-relaxed
                                prose-a:text-[#E8652D] prose-a:break-all prose-strong:text-white
                                prose-blockquote:border-l-[#E8652D] prose-blockquote:text-zinc-400
                                prose-img:rounded-xl prose-img:w-full prose-img:object-cover
                                prose-li:text-zinc-300 prose-table:w-full prose-table:overflow-x-auto"
                                dangerouslySetInnerHTML={{ __html: sanitizeHtml(content) }}
                            />
                        </div>
                    ) : (
                        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4">
                            <RichTextEditor value={content} onChange={setContent} placeholder="Write your About Us content here..." />
                        </div>
                    )}
                </div>
            )}

            {/* ── TAB: Social Links ── */}
            {activeTab === 'social' && (
                <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6">
                    <h2 className="text-lg font-bold text-zinc-900 dark:text-white mb-1">Social Media Links</h2>
                    <p className="text-sm text-zinc-500 mb-6">These links will appear in the website footer.</p>
                    <div className="space-y-5">
                        {/* Twitter/X */}
                        <div>
                            <label className="flex items-center gap-2 text-sm font-medium text-zinc-400 mb-2">
                                <Twitter className="h-4 w-4" /> Twitter / X
                            </label>
                            <input
                                type="url"
                                placeholder="https://twitter.com/yourhandle"
                                value={socialLinks.twitter}
                                onChange={e => setSocialLinks({ ...socialLinks, twitter: e.target.value })}
                                className="w-full px-4 py-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 outline-none focus:ring-1 focus:ring-[#E8652D] text-zinc-900 dark:text-white text-sm"
                            />
                        </div>
                        {/* Instagram */}
                        <div>
                            <label className="flex items-center gap-2 text-sm font-medium text-zinc-400 mb-2">
                                <Instagram className="h-4 w-4" /> Instagram
                            </label>
                            <input
                                type="url"
                                placeholder="https://instagram.com/yourhandle"
                                value={socialLinks.instagram}
                                onChange={e => setSocialLinks({ ...socialLinks, instagram: e.target.value })}
                                className="w-full px-4 py-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 outline-none focus:ring-1 focus:ring-[#E8652D] text-zinc-900 dark:text-white text-sm"
                            />
                        </div>
                        {/* YouTube */}
                        <div>
                            <label className="flex items-center gap-2 text-sm font-medium text-zinc-400 mb-2">
                                <Youtube className="h-4 w-4" /> YouTube
                            </label>
                            <input
                                type="url"
                                placeholder="https://youtube.com/@yourchannel"
                                value={socialLinks.youtube}
                                onChange={e => setSocialLinks({ ...socialLinks, youtube: e.target.value })}
                                className="w-full px-4 py-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 outline-none focus:ring-1 focus:ring-[#E8652D] text-zinc-900 dark:text-white text-sm"
                            />
                        </div>
                    </div>
                    <div className="mt-6 flex justify-end">
                        <button onClick={handleSaveSocial} disabled={savingSocial}
                            className="bg-[#E8652D] hover:bg-[#FF7A42] text-white px-5 py-2 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50 text-sm font-semibold">
                            {savingSocial ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                            {savingSocial ? 'Saving...' : 'Save Links'}
                        </button>
                    </div>
                </div>
            )}

            {/* ── TAB: Certificates ── */}
            {activeTab === 'certificates' && (
                <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6">
                    <div className="flex items-center justify-between mb-1">
                        <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Certificates & Badges</h2>
                        <div className="flex gap-2">
                            <input ref={certFileRef} type="file" accept="image/*" className="hidden" onChange={handleCertUpload} />
                            <button onClick={() => certFileRef.current?.click()} disabled={uploadingCert}
                                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors text-sm border border-zinc-200 dark:border-zinc-700 disabled:opacity-50">
                                {uploadingCert ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                                {uploadingCert ? 'Uploading...' : 'Upload Certificate'}
                            </button>
                        </div>
                    </div>
                    <p className="text-sm text-zinc-500 mb-6">These certificates will display as circular badges in the website footer.</p>

                    {certificates.length === 0 ? (
                        <div className="text-center py-12 text-zinc-500">
                            <Award className="h-12 w-12 mx-auto mb-3 text-zinc-600" />
                            <p>No certificates yet. Upload certificate images to display in the footer.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {certificates.map(cert => (
                                <div key={cert.id} className="flex items-start gap-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl p-4 border border-zinc-200 dark:border-zinc-700">
                                    {/* Circular preview */}
                                    <div className="shrink-0">
                                        <img src={cert.imageUrl} alt={cert.title || 'Certificate'}
                                            className="w-20 h-20 rounded-full object-cover border-2 border-[#E8652D]/40" />
                                    </div>
                                    <div className="flex-1 space-y-3 min-w-0">
                                        <input
                                            type="text"
                                            placeholder="Certificate title (e.g. ISB & CSC Certified)"
                                            value={cert.title}
                                            onChange={e => updateCert(cert.id, 'title', e.target.value)}
                                            className="w-full px-3 py-2 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 outline-none focus:ring-1 focus:ring-[#E8652D] text-zinc-900 dark:text-white text-sm"
                                        />
                                        <input
                                            type="text"
                                            placeholder="Short description (e.g. Digital India Programme)"
                                            value={cert.description}
                                            onChange={e => updateCert(cert.id, 'description', e.target.value)}
                                            className="w-full px-3 py-2 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 outline-none focus:ring-1 focus:ring-[#E8652D] text-zinc-900 dark:text-white text-sm"
                                        />
                                    </div>
                                    <button onClick={() => removeCert(cert.id)}
                                        className="text-zinc-400 hover:text-red-500 p-2 rounded-lg hover:bg-red-500/10 transition-colors shrink-0" title="Remove">
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {certificates.length > 0 && (
                        <div className="mt-6 flex justify-between items-center">
                            <p className="text-xs text-zinc-500">{certificates.length} certificate{certificates.length !== 1 ? 's' : ''} — will show as circular badges in the footer</p>
                            <button onClick={handleSaveCerts} disabled={savingCerts}
                                className="bg-[#E8652D] hover:bg-[#FF7A42] text-white px-5 py-2 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50 text-sm font-semibold">
                                {savingCerts ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                {savingCerts ? 'Saving...' : 'Save Certificates'}
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
