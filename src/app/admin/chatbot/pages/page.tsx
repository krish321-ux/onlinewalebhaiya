'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, Loader2, AlertCircle, Pencil, X, CheckCircle, AlertTriangle, Globe } from 'lucide-react';
import { chatbotAPI } from '@/lib/api';

type WebPage = {
    id: string;
    title: string;
    content: string;
    keywords: string[];
    embedding: number[] | null;
    created_at: string;
};

export default function AdminWebPages() {
    const [pages, setPages] = useState<WebPage[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState({ title: '', content: '', keywords: '' });
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    useEffect(() => { fetchPages(); }, []);

    useEffect(() => {
        if (success) {
            const timer = setTimeout(() => setSuccess(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [success]);

    const fetchPages = async () => {
        try {
            const data = await chatbotAPI.getPages();
            setPages(data);
        } catch (err) {
            console.error("Failed to fetch pages", err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSaving(true);

        const keywords = formData.keywords.split(',').map(k => k.trim().toLowerCase()).filter(k => k.length > 0);

        try {
            if (editingId) {
                await chatbotAPI.updatePage(editingId, { title: formData.title, content: formData.content, keywords });
                setSuccess('Page updated with new embedding! ✅');
            } else {
                await chatbotAPI.addPage({ title: formData.title, content: formData.content, keywords });
                setSuccess('Page added with semantic embedding! ✅');
            }
            await fetchPages();
            resetForm();
        } catch (err: any) {
            setError(err.message || 'Failed to save page.');
        } finally {
            setSaving(false);
        }
    };

    const handleEdit = (page: WebPage) => {
        setEditingId(page.id);
        setFormData({
            title: page.title,
            content: page.content,
            keywords: (page.keywords || []).join(', '),
        });
        setShowForm(true);
        setError(null);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this page?')) return;
        try {
            await chatbotAPI.deletePage(id);
            setPages(prev => prev.filter(p => p.id !== id));
            setSuccess('Page deleted.');
        } catch (err: any) {
            setError(err.message || 'Failed to delete page.');
        }
    };

    const resetForm = () => {
        setFormData({ title: '', content: '', keywords: '' });
        setEditingId(null);
        setShowForm(false);
    };

    return (
        <div className="max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Website Pages</h1>
                    <p className="text-sm text-zinc-500 mt-1">
                        Add website content so Liza can answer questions about your services.
                    </p>
                </div>
                <button onClick={() => { resetForm(); setShowForm(true); }} className="bg-[#E8652D] hover:bg-[#FF7A42] text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
                    <Plus className="h-5 w-5" /> Add Page
                </button>
            </div>

            {error && (
                <div className="flex items-center gap-2 bg-red-900/30 border border-red-700/50 text-red-300 px-4 py-3 rounded-lg mb-6 text-sm">
                    <AlertCircle className="h-4 w-4 shrink-0" />{error}
                    <button onClick={() => setError(null)} className="ml-auto"><X className="h-4 w-4" /></button>
                </div>
            )}
            {success && (
                <div className="flex items-center gap-2 bg-green-900/30 border border-green-700/50 text-green-300 px-4 py-3 rounded-lg mb-6 text-sm">
                    <CheckCircle className="h-4 w-4 shrink-0" />{success}
                </div>
            )}

            {showForm && (
                <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 mb-8 shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-bold text-zinc-900 dark:text-white">{editingId ? 'Edit Page' : 'Add Page'}</h2>
                        <button onClick={resetForm} className="text-zinc-400 hover:text-white"><X className="h-5 w-5" /></button>
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-zinc-400 mb-1">Title</label>
                            <input
                                placeholder="e.g. Cyber Cafe Services"
                                className="w-full px-4 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 outline-none focus:ring-1 focus:ring-[#E8652D] text-zinc-900 dark:text-white"
                                value={formData.title}
                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-zinc-400 mb-1">Content</label>
                            <textarea
                                placeholder="Describe the page content in detail..."
                                rows={5}
                                className="w-full px-4 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 outline-none focus:ring-1 focus:ring-[#E8652D] text-zinc-900 dark:text-white"
                                value={formData.content}
                                onChange={e => setFormData({ ...formData, content: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-zinc-400 mb-1">Keywords (comma separated)</label>
                            <input
                                placeholder="e.g. services, pan card, aadhaar, scholarship"
                                className="w-full px-4 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 outline-none focus:ring-1 focus:ring-[#E8652D] text-zinc-900 dark:text-white"
                                value={formData.keywords}
                                onChange={e => setFormData({ ...formData, keywords: e.target.value })}
                            />
                        </div>
                        <div className="flex gap-3">
                            <button type="submit" disabled={saving} className="bg-[#E8652D] hover:bg-[#FF7A42] text-white px-6 py-2 rounded-lg disabled:opacity-50 flex items-center gap-2">
                                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                                {saving ? 'Saving...' : editingId ? 'Update Page' : 'Save Page'}
                            </button>
                            <button type="button" onClick={resetForm} className="px-6 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800">Cancel</button>
                        </div>
                    </form>
                </div>
            )}

            {loading ? (
                <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-[#E8652D]" /></div>
            ) : (
                <div className="grid gap-4">
                    {pages.length === 0 ? (
                        <div className="text-center py-12 text-zinc-500 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800">
                            <Globe className="h-12 w-12 mx-auto mb-3 text-zinc-600" />
                            <p>No website pages yet. Add content so Liza can answer questions about your services.</p>
                        </div>
                    ) : (
                        pages.map(page => (
                            <div key={page.id} className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                                <div className="flex justify-between items-start gap-3">
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-bold text-zinc-900 dark:text-white mb-2 flex items-center gap-2">
                                            <Globe className="h-4 w-4 text-[#E8652D] shrink-0" />
                                            {page.title}
                                        </h3>
                                        <p className="text-zinc-600 dark:text-zinc-400 mb-3 whitespace-pre-line text-sm line-clamp-3">{page.content}</p>
                                        <div className="flex flex-wrap items-center gap-2 text-sm">
                                            {page.embedding ? (
                                                <span className="flex items-center gap-1 text-green-500 text-xs"><CheckCircle className="h-3 w-3" /> Embedding ready</span>
                                            ) : (
                                                <span className="flex items-center gap-1 text-amber-500 text-xs"><AlertTriangle className="h-3 w-3" /> No embedding</span>
                                            )}
                                            {page.keywords?.map((kw, i) => (
                                                <span key={i} className="bg-blue-500/10 text-blue-400 px-1.5 py-0.5 rounded text-xs">{kw}</span>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                        <button onClick={() => handleEdit(page)} className="text-zinc-400 hover:text-[#E8652D] transition-colors p-1" title="Edit"><Pencil className="h-4 w-4" /></button>
                                        <button onClick={() => handleDelete(page.id)} className="text-zinc-400 hover:text-red-500 transition-colors p-1" title="Delete"><Trash2 className="h-4 w-4" /></button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}
