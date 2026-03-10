'use client';

import { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, Pencil, Loader2, X, Upload, ImageIcon, Save, Eye, EyeOff } from 'lucide-react';
import Image from 'next/image';
import RichTextEditor from '@/components/RichTextEditor';

interface Service {
    id: string;
    title: string;
    description: string;
    image_url: string;
    icon_url: string | null;
    detail_content: string | null;
    sort_order: number;
    is_active: boolean;
}

export default function AdminServicesPage() {
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Add form state
    const [showAdd, setShowAdd] = useState(false);
    const [newTitle, setNewTitle] = useState('');
    const [newDesc, setNewDesc] = useState('');
    const [newFile, setNewFile] = useState<File | null>(null);
    const [newIconFile, setNewIconFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [iconPreview, setIconPreview] = useState<string | null>(null);
    const fileRef = useRef<HTMLInputElement>(null);
    const iconFileRef = useRef<HTMLInputElement>(null);

    // Edit content modal
    const [editService, setEditService] = useState<Service | null>(null);
    const [editContent, setEditContent] = useState('');
    const [savingContent, setSavingContent] = useState(false);

    const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;

    const headers: Record<string, string> = token ? { 'Authorization': `Bearer ${token}` } : {};

    const loadAll = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/services?admin=true', { headers });
            const data = await res.json();
            setServices(Array.isArray(data) ? data : []);
        } catch (e: any) {
            setError(e.message || 'Failed to load');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadAll(); }, []);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setNewFile(file);
        setPreview(URL.createObjectURL(file));
    };

    const handleIconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setNewIconFile(file);
        setIconPreview(URL.createObjectURL(file));
    };

    const handleAdd = async () => {
        if ((!newFile && !newIconFile) || !newTitle) return;
        setUploading(true);
        setError('');
        try {
            const formData = new FormData();
            if (newFile) formData.append('image', newFile);
            if (newIconFile) formData.append('icon', newIconFile);
            formData.append('title', newTitle);
            formData.append('description', newDesc);
            formData.append('sort_order', String(services.length));

            const res = await fetch('/api/services', {
                method: 'POST',
                headers,
                body: formData,
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Upload failed');
            }

            setSuccess('Service added! ✅');
            setNewTitle(''); setNewDesc(''); setNewFile(null); setNewIconFile(null); setPreview(null); setIconPreview(null);
            if (fileRef.current) fileRef.current.value = '';
            if (iconFileRef.current) iconFileRef.current.value = '';
            setShowAdd(false);
            setTimeout(() => setSuccess(''), 3000);
            await loadAll();
        } catch (e: any) {
            setError(e.message);
        } finally {
            setUploading(false);
        }
    };

    const deleteService = async (id: string) => {
        if (!confirm('Delete this service permanently?')) return;
        try {
            await fetch(`/api/services/${id}`, { method: 'DELETE', headers });
            setServices(prev => prev.filter(s => s.id !== id));
            setSuccess('Service deleted.');
            setTimeout(() => setSuccess(''), 2000);
        } catch (e: any) { setError(e.message); }
    };

    const toggleActive = async (svc: Service) => {
        try {
            await fetch(`/api/services/${svc.id}`, {
                method: 'PUT',
                headers: { ...headers, 'Content-Type': 'application/json' },
                body: JSON.stringify({ is_active: !svc.is_active }),
            });
            setServices(prev => prev.map(s => s.id === svc.id ? { ...s, is_active: !s.is_active } : s));
        } catch (e: any) { setError(e.message); }
    };

    const openEditor = (svc: Service) => {
        setEditService(svc);
        setEditContent(svc.detail_content || '');
    };

    const saveContent = async () => {
        if (!editService) return;
        setSavingContent(true);
        try {
            await fetch(`/api/services/${editService.id}`, {
                method: 'PUT',
                headers: { ...headers, 'Content-Type': 'application/json' },
                body: JSON.stringify({ detail_content: editContent }),
            });
            setServices(prev => prev.map(s => s.id === editService.id ? { ...s, detail_content: editContent } : s));
            setSuccess('Detail content saved! ✅');
            setTimeout(() => setSuccess(''), 3000);
            setEditService(null);
        } catch (e: any) {
            setError(e.message);
        } finally {
            setSavingContent(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Services Management</h1>
                    <p className="text-sm text-zinc-500 mt-1">Add services with images. Click &quot;Edit Content&quot; to write detail page content.</p>
                </div>
                <button
                    onClick={() => setShowAdd(!showAdd)}
                    className="bg-[#E8652D] hover:bg-[#FF7A42] text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-semibold transition-colors"
                >
                    <Plus className="h-4 w-4" /> Add Service
                </button>
            </div>

            {error && (
                <div className="mb-4 p-3 rounded-lg bg-red-900/20 border border-red-800 text-red-300 text-sm flex items-center gap-2">
                    <X className="h-4 w-4 shrink-0" /> {error}
                </div>
            )}
            {success && (
                <div className="mb-4 p-3 rounded-lg bg-green-900/20 border border-green-800 text-green-300 text-sm">✓ {success}</div>
            )}

            {/* Add Form */}
            {showAdd && (
                <div className="mb-8 p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                    <h2 className="text-lg font-semibold text-zinc-800 dark:text-zinc-100 mb-4">New Service</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Icon Upload */}
                        <div>
                            <p className="text-xs text-zinc-400 font-medium mb-2">🎯 Card Icon (square, shown on card)</p>
                            <div
                                className="border-2 border-dashed border-zinc-700 rounded-xl flex flex-col items-center justify-center p-4 cursor-pointer hover:border-[#E8652D] transition-colors aspect-square"
                                onClick={() => iconFileRef.current?.click()}
                            >
                                {iconPreview ? (
                                    <div className="relative w-full h-full rounded-lg overflow-hidden flex items-center justify-center">
                                        <img src={iconPreview} alt="icon preview" className="max-w-full max-h-full object-contain" />
                                    </div>
                                ) : (
                                    <>
                                        <ImageIcon className="h-8 w-8 text-zinc-400 mb-2" />
                                        <p className="text-xs text-zinc-500 text-center">Click to choose icon</p>
                                        <p className="text-[10px] text-zinc-600 mt-1">PNG with transparency works best</p>
                                    </>
                                )}
                                <input ref={iconFileRef} type="file" accept="image/*" className="hidden" onChange={handleIconChange} />
                            </div>
                        </div>

                        {/* Image Upload */}
                        <div>
                            <p className="text-xs text-zinc-400 font-medium mb-2">🖼️ Detail Page Image (wide, shown on top)</p>
                            <div
                                className="border-2 border-dashed border-zinc-700 rounded-xl flex flex-col items-center justify-center p-4 cursor-pointer hover:border-[#E8652D] transition-colors aspect-square"
                                onClick={() => fileRef.current?.click()}
                            >
                                {preview ? (
                                    <div className="relative w-full h-full rounded-lg overflow-hidden">
                                        <img src={preview} alt="preview" className="object-cover w-full h-full" />
                                    </div>
                                ) : (
                                    <>
                                        <ImageIcon className="h-8 w-8 text-zinc-400 mb-2" />
                                        <p className="text-xs text-zinc-500 text-center">Click to choose image</p>
                                        <p className="text-[10px] text-zinc-600 mt-1">JPG, PNG · max 5 MB</p>
                                    </>
                                )}
                                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                            </div>
                        </div>

                        {/* Text Fields */}
                        <div className="flex flex-col gap-3">
                            <input
                                type="text" value={newTitle} onChange={e => setNewTitle(e.target.value)}
                                placeholder="Service Title *"
                                className="w-full px-3 py-2.5 rounded-lg border border-zinc-700 bg-zinc-800 text-white text-sm focus:outline-none focus:border-[#E8652D]"
                            />
                            <textarea
                                value={newDesc} onChange={e => setNewDesc(e.target.value)}
                                placeholder="Short description (shown on card)"
                                rows={3}
                                className="w-full px-3 py-2.5 rounded-lg border border-zinc-700 bg-zinc-800 text-white text-sm focus:outline-none focus:border-[#E8652D] resize-none"
                            />
                            <button
                                onClick={handleAdd}
                                disabled={(!newFile && !newIconFile) || !newTitle || uploading}
                                className="mt-auto flex items-center justify-center gap-2 bg-[#E8652D] hover:bg-[#FF7A42] disabled:opacity-50 text-white px-4 py-2.5 rounded-xl font-semibold text-sm transition-all"
                            >
                                {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                                {uploading ? 'Uploading...' : 'Add Service'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Services Grid */}
            {loading ? (
                <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-[#E8652D]" /></div>
            ) : services.length === 0 ? (
                <div className="text-center py-16 text-zinc-400">
                    <ImageIcon className="h-12 w-12 mx-auto mb-3 opacity-40" />
                    <p>No services yet. Add your first service above.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {services.map((svc, idx) => (
                        <div
                            key={svc.id}
                            className={`group rounded-xl overflow-hidden border transition-all ${svc.is_active ? 'border-zinc-700' : 'border-zinc-700 opacity-50'}`}
                        >
                            <div className="relative aspect-[4/3]">
                                <img src={svc.image_url} alt={svc.title} className="object-contain w-full h-full" />
                                <span className="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-0.5 rounded-full">#{idx + 1}</span>
                                {svc.icon_url && (
                                    <div className="absolute bottom-2 left-2 w-10 h-10 rounded-lg bg-black/60 p-1 border border-zinc-600">
                                        <img src={svc.icon_url} alt="icon" className="w-full h-full object-contain" />
                                    </div>
                                )}
                                {svc.detail_content && (
                                    <span className="absolute top-2 right-2 bg-green-500/80 text-white text-xs px-2 py-0.5 rounded-full">Has Content</span>
                                )}
                                {!svc.is_active && (
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                        <span className="text-white text-xs font-semibold bg-zinc-800/80 px-2 py-1 rounded">Hidden</span>
                                    </div>
                                )}
                            </div>
                            <div className="p-3 bg-zinc-900">
                                <h3 className="text-sm font-semibold text-white truncate mb-1">{svc.title}</h3>
                                {svc.description && <p className="text-xs text-zinc-500 truncate mb-2">{svc.description}</p>}
                                <div className="flex gap-2">
                                    <button onClick={() => openEditor(svc)} className="flex-1 flex items-center justify-center gap-1 text-xs py-1.5 rounded-lg border border-[#E8652D]/30 text-[#E8652D] hover:bg-[#E8652D]/10 transition-colors">
                                        <Pencil className="h-3.5 w-3.5" /> Edit Content
                                    </button>
                                    <button onClick={() => toggleActive(svc)} title={svc.is_active ? 'Hide' : 'Show'}
                                        className="flex items-center justify-center text-xs px-3 py-1.5 rounded-lg border border-zinc-700 text-zinc-400 hover:border-[#E8652D] hover:text-[#E8652D] transition-colors">
                                        {svc.is_active ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                                    </button>
                                    <button onClick={() => deleteService(svc.id)} className="flex items-center justify-center text-xs px-3 py-1.5 rounded-lg border border-red-800 text-red-500 hover:bg-red-900/20 transition-colors">
                                        <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Rich Text Editor Modal */}
            {editService && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
                    <div className="bg-zinc-900 rounded-2xl border border-zinc-700 w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl">
                        <div className="flex items-center justify-between p-5 border-b border-zinc-700 shrink-0">
                            <div>
                                <h2 className="text-lg font-bold text-white">Edit Service Content</h2>
                                <p className="text-sm text-zinc-400 mt-0.5">{editService.title} — This content shows when users click this service.</p>
                            </div>
                            <button onClick={() => setEditService(null)} className="text-zinc-400 hover:text-white p-1"><X className="h-5 w-5" /></button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-5">
                            <RichTextEditor value={editContent} onChange={setEditContent} placeholder="Write the detail content for this service..." />
                        </div>
                        <div className="flex items-center justify-end gap-3 p-5 border-t border-zinc-700 shrink-0">
                            <button onClick={() => setEditService(null)} className="px-5 py-2 rounded-lg border border-zinc-700 text-zinc-400 hover:bg-zinc-800 text-sm">Cancel</button>
                            <button onClick={saveContent} disabled={savingContent}
                                className="bg-[#E8652D] hover:bg-[#FF7A42] text-white px-5 py-2 rounded-lg flex items-center gap-2 disabled:opacity-50 text-sm font-semibold">
                                {savingContent ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                {savingContent ? 'Saving...' : 'Save Content'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
