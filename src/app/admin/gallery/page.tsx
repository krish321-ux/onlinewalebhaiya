'use client';

import { useState, useEffect, useRef } from 'react';
import { galleryAPI } from '@/lib/api';
import { Upload, Trash2, Eye, EyeOff, Plus, ImageIcon, X, Pencil, Save, Loader2 } from 'lucide-react';
import Image from 'next/image';
import RichTextEditor from '@/components/RichTextEditor';

interface GalleryImage {
    id: string;
    image_url: string;
    title: string;
    sort_order: number;
    is_active: boolean;
    detail_content: string | null;
    created_at: string;
}

export default function AdminGalleryPage() {
    const [images, setImages] = useState<GalleryImage[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [preview, setPreview] = useState<string | null>(null);
    const [newTitle, setNewTitle] = useState('');
    const [newFile, setNewFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Content editor modal state
    const [editingImage, setEditingImage] = useState<GalleryImage | null>(null);
    const [editContent, setEditContent] = useState('');
    const [savingContent, setSavingContent] = useState(false);

    const load = async () => {
        try {
            setLoading(true);
            const data = await galleryAPI.getAllImages();
            setImages(data);
        } catch (e: any) {
            setError(e.message || 'Failed to load images');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, []);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setNewFile(file);
        setPreview(URL.createObjectURL(file));
    };

    const handleUpload = async () => {
        if (!newFile) return;
        try {
            setUploading(true);
            setError('');
            const sortOrder = images.length;
            await galleryAPI.uploadImage(newFile, newTitle, sortOrder);
            setSuccess('Image uploaded successfully!');
            setNewFile(null);
            setNewTitle('');
            setPreview(null);
            if (fileInputRef.current) fileInputRef.current.value = '';
            setTimeout(() => setSuccess(''), 3000);
            await load();
        } catch (e: any) {
            setError(e.message || 'Upload failed');
        } finally {
            setUploading(false);
        }
    };

    const toggleActive = async (img: GalleryImage) => {
        try {
            await galleryAPI.updateImage(img.id, { is_active: !img.is_active });
            setImages(prev => prev.map(i => i.id === img.id ? { ...i, is_active: !i.is_active } : i));
        } catch (e: any) { setError(e.message); }
    };

    const deleteImage = async (id: string) => {
        if (!confirm('Delete this image permanently?')) return;
        try {
            await galleryAPI.deleteImage(id);
            setImages(prev => prev.filter(i => i.id !== id));
            setSuccess('Image deleted.');
            setTimeout(() => setSuccess(''), 2000);
        } catch (e: any) { setError(e.message); }
    };

    const updateTitle = async (id: string, title: string) => {
        try {
            await galleryAPI.updateImage(id, { title });
            setImages(prev => prev.map(i => i.id === id ? { ...i, title } : i));
        } catch (e: any) { setError(e.message); }
    };

    const openContentEditor = (img: GalleryImage) => {
        setEditingImage(img);
        setEditContent(img.detail_content || '');
    };

    const saveDetailContent = async () => {
        if (!editingImage) return;
        setSavingContent(true);
        try {
            await galleryAPI.updateImage(editingImage.id, { detail_content: editContent } as any);
            setImages(prev => prev.map(i => i.id === editingImage.id ? { ...i, detail_content: editContent } : i));
            setSuccess('Detail content saved! ✅');
            setTimeout(() => setSuccess(''), 3000);
            setEditingImage(null);
        } catch (e: any) {
            setError(e.message || 'Failed to save content');
        } finally {
            setSavingContent(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Gallery Management</h1>
                <p className="text-zinc-500 text-sm mt-1">
                    Manage homepage banner images. Click <strong>&quot;Edit Content&quot;</strong> to add detail page content for each image.
                </p>
            </div>

            {error && (
                <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm flex items-center gap-2">
                    <X className="h-4 w-4 shrink-0" /> {error}
                </div>
            )}
            {success && (
                <div className="mb-4 p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 text-sm">
                    ✓ {success}
                </div>
            )}

            {/* Upload Section */}
            <div className="mb-8 p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                <h2 className="text-lg font-semibold text-zinc-800 dark:text-zinc-100 mb-4 flex items-center gap-2">
                    <Plus className="h-5 w-5 text-[#E8652D]" /> Upload New Image
                </h2>

                <div className="mb-4 p-3 rounded-lg bg-[#E8652D]/5 border border-[#E8652D]/20 text-sm text-zinc-600 dark:text-zinc-400">
                    📐 <strong>Recommended size: 1366 × 379 px</strong> (Banner · 3.6:1 ratio) — max 5 MB · JPG or PNG.<br />
                    <span className="text-xs opacity-80">The banner displays full-width. Images will be scaled to fit the 1366×379 aspect ratio.</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div
                        className="relative border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-xl flex flex-col items-center justify-center p-8 cursor-pointer hover:border-[#E8652D] transition-colors"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        {preview ? (
                            <div className="relative w-full rounded-lg overflow-hidden" style={{ aspectRatio: '1366 / 379' }}>
                                <img src={preview} alt="preview" className="object-cover w-full h-full" />
                            </div>
                        ) : (
                            <>
                                <ImageIcon className="h-10 w-10 text-zinc-400 mb-2" />
                                <p className="text-sm text-zinc-500">Click to choose image</p>
                                <p className="text-xs text-zinc-400 mt-1">JPG, PNG · max 5 MB</p>
                                <p className="text-xs font-semibold text-[#E8652D] mt-0.5">Best: 1366×379 px (Banner ratio)</p>
                            </>
                        )}
                        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                    </div>

                    <div className="flex flex-col gap-4">
                        <div>
                            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Caption / Title (optional)</label>
                            <input
                                type="text"
                                value={newTitle}
                                onChange={e => setNewTitle(e.target.value)}
                                placeholder="e.g. Office Setup, Service Counter..."
                                className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white text-sm focus:outline-none focus:border-[#E8652D]"
                            />
                        </div>
                        <button
                            onClick={handleUpload}
                            disabled={!newFile || uploading}
                            className="mt-auto flex items-center justify-center gap-2 bg-[#E8652D] hover:bg-[#FF7A42] disabled:opacity-50 text-white px-4 py-2.5 rounded-xl font-semibold text-sm transition-all"
                        >
                            <Upload className="h-4 w-4" />
                            {uploading ? 'Uploading...' : 'Upload Image'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Images Grid */}
            <div>
                <h2 className="text-lg font-semibold text-zinc-800 dark:text-zinc-100 mb-4">
                    Current Gallery ({images.filter(i => i.is_active).length} active)
                </h2>

                {loading ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="rounded-xl bg-zinc-100 dark:bg-zinc-800 animate-pulse" style={{ aspectRatio: '1366 / 379' }} />
                        ))}
                    </div>
                ) : images.length === 0 ? (
                    <div className="text-center py-16 text-zinc-400">
                        <ImageIcon className="h-12 w-12 mx-auto mb-3 opacity-40" />
                        <p>No images uploaded yet. Upload your first image above.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {images.map((img, idx) => (
                            <div
                                key={img.id}
                                className={`group relative rounded-xl overflow-hidden border transition-all ${img.is_active
                                    ? 'border-zinc-200 dark:border-zinc-700'
                                    : 'border-zinc-200 dark:border-zinc-700 opacity-50'
                                    }`}
                            >
                                {/* Thumbnail */}
                                <div className="relative bg-zinc-100 dark:bg-zinc-800" style={{ aspectRatio: '1366 / 379' }}>
                                    <img src={img.image_url} alt={img.title || `Gallery ${idx + 1}`} className="object-cover w-full h-full" />
                                    <span className="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-0.5 rounded-full">
                                        #{idx + 1}
                                    </span>
                                    {img.detail_content && (
                                        <span className="absolute top-2 right-2 bg-green-500/80 text-white text-xs px-2 py-0.5 rounded-full">
                                            Has Content
                                        </span>
                                    )}
                                    {!img.is_active && (
                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                            <span className="text-white text-xs font-semibold bg-zinc-800/80 px-2 py-1 rounded">Hidden</span>
                                        </div>
                                    )}
                                </div>

                                {/* Controls */}
                                <div className="p-3 bg-white dark:bg-zinc-900">
                                    <input
                                        type="text"
                                        defaultValue={img.title}
                                        onBlur={e => updateTitle(img.id, e.target.value)}
                                        placeholder="Caption..."
                                        className="w-full text-xs px-2 py-1 rounded-md border border-zinc-200 dark:border-zinc-700 bg-transparent text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-[#E8652D] mb-2"
                                    />
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => openContentEditor(img)}
                                            title="Edit detail page content"
                                            className="flex-1 flex items-center justify-center gap-1 text-xs py-1.5 rounded-lg border border-[#E8652D]/30 text-[#E8652D] hover:bg-[#E8652D]/10 transition-colors"
                                        >
                                            <Pencil className="h-3.5 w-3.5" /> Edit Content
                                        </button>
                                        <button
                                            onClick={() => toggleActive(img)}
                                            title={img.is_active ? 'Hide from homepage' : 'Show on homepage'}
                                            className="flex items-center justify-center gap-1 text-xs px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:border-[#E8652D] hover:text-[#E8652D] transition-colors"
                                        >
                                            {img.is_active ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                                        </button>
                                        <button
                                            onClick={() => deleteImage(img.id)}
                                            title="Delete permanently"
                                            className="flex items-center justify-center gap-1 text-xs px-3 py-1.5 rounded-lg border border-red-200 dark:border-red-800 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* ── Rich Text Editor Modal ── */}
            {editingImage && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
                    <div className="bg-zinc-900 rounded-2xl border border-zinc-700 w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-5 border-b border-zinc-700 shrink-0">
                            <div>
                                <h2 className="text-lg font-bold text-white">Edit Detail Content</h2>
                                <p className="text-sm text-zinc-400 mt-0.5">
                                    {editingImage.title || 'Untitled Image'} — This content shows when users click this banner image.
                                </p>
                            </div>
                            <button onClick={() => setEditingImage(null)} className="text-zinc-400 hover:text-white p-1">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Editor */}
                        <div className="flex-1 overflow-y-auto p-5">
                            <RichTextEditor
                                value={editContent}
                                onChange={setEditContent}
                                placeholder="Write the detail content for this banner image..."
                            />
                        </div>

                        {/* Modal Footer */}
                        <div className="flex items-center justify-end gap-3 p-5 border-t border-zinc-700 shrink-0">
                            <button
                                onClick={() => setEditingImage(null)}
                                className="px-5 py-2 rounded-lg border border-zinc-700 text-zinc-400 hover:bg-zinc-800 text-sm"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={saveDetailContent}
                                disabled={savingContent}
                                className="bg-[#E8652D] hover:bg-[#FF7A42] text-white px-5 py-2 rounded-lg flex items-center gap-2 disabled:opacity-50 text-sm font-semibold"
                            >
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
