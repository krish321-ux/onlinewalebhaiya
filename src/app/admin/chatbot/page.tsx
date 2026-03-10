'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, Loader2, AlertCircle, Pencil, Search, X, CheckCircle, AlertTriangle, ChevronDown, ChevronRight, Upload, FolderPlus } from 'lucide-react';
import { chatbotAPI } from '@/lib/api';

type FAQ = {
    id: string;
    question: string;
    answer: string;
    category: string;
    keywords: string[];
    embedding: number[] | null;
};

const CATEGORIES = ['General', 'Scholarship', 'Jobs', 'PAN Card', 'Aadhaar', 'Documents', 'Services', 'Other'];

export default function AdminChatbot() {
    const [faqs, setFaqs] = useState<FAQ[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [showBulkPaste, setShowBulkPaste] = useState(false);
    const [showNewTopic, setShowNewTopic] = useState(false);
    const [newTopicName, setNewTopicName] = useState('');
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState({ question: '', answer: '', category: 'General', keywords: '' });
    const [bulkText, setBulkText] = useState('');
    const [bulkTopic, setBulkTopic] = useState('General');
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [filterCategory, setFilterCategory] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedTopics, setExpandedTopics] = useState<Set<string>>(new Set());

    useEffect(() => { fetchFAQs(); }, []);
    useEffect(() => {
        if (success) { const t = setTimeout(() => setSuccess(null), 3000); return () => clearTimeout(t); }
    }, [success]);

    const fetchFAQs = async () => {
        try {
            const data = await chatbotAPI.getFAQs();
            setFaqs(data);
            // Auto-expand all topics on first load
            const topics = new Set(data.map((f: FAQ) => f.category || 'General'));
            setExpandedTopics(topics);
        } catch (err) {
            console.error("Failed to fetch FAQs", err);
        } finally {
            setLoading(false);
        }
    };

    // Group FAQs by category/topic
    const topics = Array.from(new Set(faqs.map(f => f.category || 'General'))).sort();
    const faqsByTopic: Record<string, FAQ[]> = {};
    for (const faq of faqs) {
        const cat = faq.category || 'General';
        if (!faqsByTopic[cat]) faqsByTopic[cat] = [];
        faqsByTopic[cat].push(faq);
    }

    const filteredTopics = topics.filter(t => {
        if (filterCategory && t !== filterCategory) return false;
        if (searchQuery) {
            const topicFaqs = faqsByTopic[t] || [];
            return topicFaqs.some(f =>
                f.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                f.answer.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }
        return true;
    });

    const getFilteredFaqs = (topic: string) => {
        const topicFaqs = faqsByTopic[topic] || [];
        if (!searchQuery) return topicFaqs;
        return topicFaqs.filter(f =>
            f.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
            f.answer.toLowerCase().includes(searchQuery.toLowerCase())
        );
    };

    const toggleTopic = (topic: string) => {
        setExpandedTopics(prev => {
            const next = new Set(prev);
            if (next.has(topic)) next.delete(topic); else next.add(topic);
            return next;
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSaving(true);
        const keywords = formData.keywords.split(',').map(k => k.trim().toLowerCase()).filter(k => k.length > 0);
        try {
            if (editingId) {
                await chatbotAPI.updateFAQ(editingId, { question: formData.question, answer: formData.answer, category: formData.category, keywords });
                setSuccess('FAQ updated! ✅');
            } else {
                await chatbotAPI.addFAQ({ question: formData.question, answer: formData.answer, category: formData.category, keywords });
                setSuccess('FAQ added! ✅');
            }
            await fetchFAQs();
            resetForm();
        } catch (err: any) {
            setError(err.message || 'Failed to save FAQ.');
        } finally {
            setSaving(false);
        }
    };

    const handleEdit = (faq: FAQ) => {
        setEditingId(faq.id);
        const cat = faq.category || 'General';
        // Ensure the category exists in the dropdown
        if (!CATEGORIES.includes(cat)) {
            CATEGORIES.push(cat);
        }
        setFormData({ question: faq.question, answer: faq.answer, category: cat, keywords: (faq.keywords || []).join(', ') });
        setShowForm(true);
        setShowBulkPaste(false);
        setError(null);
        // Scroll to form after state update
        setTimeout(() => {
            document.getElementById('faq-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this FAQ?')) return;
        try {
            await chatbotAPI.deleteFAQ(id);
            setFaqs(prev => prev.filter(f => f.id !== id));
            setSuccess('FAQ deleted.');
        } catch (err: any) {
            setError(err.message || 'Failed to delete FAQ.');
        }
    };

    const handleDeleteTopic = async (topic: string) => {
        const count = (faqsByTopic[topic] || []).length;
        if (!confirm(`Delete topic "${topic}" and all ${count} FAQ(s) under it?`)) return;
        setError(null);
        try {
            await chatbotAPI.deleteTopic(topic);
            setFaqs(prev => prev.filter(f => (f.category || 'General') !== topic));
            setSuccess(`Topic "${topic}" and ${count} FAQ(s) deleted.`);
        } catch (err: any) {
            setError(err.message || 'Failed to delete topic.');
        }
    };

    const handleAddTopic = () => {
        const name = newTopicName.trim();
        if (!name) return;
        if (!CATEGORIES.includes(name)) {
            CATEGORIES.push(name);
        }
        setFormData({ ...formData, category: name });
        setBulkTopic(name);
        setNewTopicName('');
        setShowNewTopic(false);
        setSuccess(`Topic "${name}" ready. Add FAQs to it.`);
    };

    // Parse bulk Q&A text — robust line-by-line parser
    const parseBulkText = (text: string): { question: string; answer: string }[] => {
        const pairs: { question: string; answer: string }[] = [];
        const lines = text.split(/\r?\n/);

        let currentQuestion = '';
        let currentAnswer = '';
        let mode: 'none' | 'question' | 'answer' = 'none';

        const qPrefix = /^\s*(?:Q|Question)\s*[:.]\s*/i;
        const aPrefix = /^\s*(?:A|Answer)\s*[:.]\s*/i;
        // Also detect numbered format like "1. question" or "1) question"
        const numberedQ = /^\s*\d+\s*[.)]\s*/;

        const flush = () => {
            const q = currentQuestion.trim();
            const a = currentAnswer.trim();
            if (q && a) pairs.push({ question: q, answer: a });
            currentQuestion = '';
            currentAnswer = '';
            mode = 'none';
        };

        for (const line of lines) {
            const trimmed = line.trim();

            if (qPrefix.test(trimmed)) {
                // New question found — flush previous pair
                flush();
                currentQuestion = trimmed.replace(qPrefix, '').trim();
                mode = 'question';
            } else if (aPrefix.test(trimmed)) {
                currentAnswer = trimmed.replace(aPrefix, '').trim();
                mode = 'answer';
            } else if (trimmed === '') {
                // Blank line — could be separator between pairs
                if (mode === 'answer' && currentAnswer) {
                    // End of a Q&A pair
                    flush();
                }
            } else {
                // Continuation line
                if (mode === 'question') {
                    currentQuestion += ' ' + trimmed;
                } else if (mode === 'answer') {
                    currentAnswer += ' ' + trimmed;
                }
            }
        }
        // Flush last pair
        flush();

        if (pairs.length > 0) return pairs;

        // Fallback: try numbered format (1. Q \n A \n 2. Q \n A)
        mode = 'none';
        currentQuestion = '';
        currentAnswer = '';

        for (const line of lines) {
            const trimmed = line.trim();
            if (numberedQ.test(trimmed)) {
                flush();
                currentQuestion = trimmed.replace(numberedQ, '').trim();
                mode = 'question';
            } else if (trimmed === '') {
                if (mode === 'answer') flush();
            } else {
                if (mode === 'question') {
                    // First non-empty line after question = answer
                    currentAnswer = trimmed;
                    mode = 'answer';
                } else if (mode === 'answer') {
                    currentAnswer += ' ' + trimmed;
                }
            }
        }
        flush();

        if (pairs.length > 0) return pairs;

        // Final fallback: double-newline separated, odd=question, even=answer
        const blocks = text.split(/\n\s*\n/).map(b => b.trim()).filter(b => b.length > 0);
        for (let i = 0; i < blocks.length - 1; i += 2) {
            pairs.push({ question: blocks[i], answer: blocks[i + 1] });
        }
        return pairs;
    };

    const handleBulkPaste = async () => {
        const parsed = parseBulkText(bulkText);
        if (parsed.length === 0) {
            setError('Could not detect any Q&A pairs. Use format: Q: question\\nA: answer');
            return;
        }
        setError(null);
        setSaving(true);
        try {
            const items = parsed.map(p => ({ question: p.question, answer: p.answer, category: bulkTopic, keywords: [] as string[] }));
            await chatbotAPI.bulkAddFAQs(items);
            setSuccess(`${parsed.length} FAQ(s) added to "${bulkTopic}"! ✅`);
            setBulkText('');
            setShowBulkPaste(false);
            await fetchFAQs();
        } catch (err: any) {
            setError(err.message || 'Bulk import failed.');
        } finally {
            setSaving(false);
        }
    };

    const resetForm = () => {
        setFormData({ question: '', answer: '', category: 'General', keywords: '' });
        setEditingId(null);
        setShowForm(false);
    };

    const allTopics = Array.from(new Set([...CATEGORIES, ...topics]));

    return (
        <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Liza AI Training (FAQ)</h1>
                    <p className="text-sm text-zinc-500 mt-1">
                        {faqs.length} FAQs across {topics.length} topics • {faqs.filter(f => f.embedding).length} with embeddings
                    </p>
                </div>
                <div className="flex gap-2 flex-wrap">
                    <button onClick={() => setShowNewTopic(true)}
                        className="bg-zinc-700 hover:bg-zinc-600 text-white px-3 py-2 rounded-lg flex items-center gap-2 text-sm transition-colors">
                        <FolderPlus className="h-4 w-4" /> New Topic
                    </button>
                    <button onClick={() => { setShowBulkPaste(true); setShowForm(false); }}
                        className="bg-zinc-700 hover:bg-zinc-600 text-white px-3 py-2 rounded-lg flex items-center gap-2 text-sm transition-colors">
                        <Upload className="h-4 w-4" /> Bulk Paste
                    </button>
                    <button onClick={() => { resetForm(); setShowForm(true); setShowBulkPaste(false); }}
                        className="bg-[#E8652D] hover:bg-[#FF7A42] text-white px-3 py-2 rounded-lg flex items-center gap-2 text-sm transition-colors">
                        <Plus className="h-4 w-4" /> Add FAQ
                    </button>
                </div>
            </div>

            {/* Status Banners */}
            {error && (
                <div className="flex items-center gap-2 bg-red-900/30 border border-red-700/50 text-red-300 px-4 py-3 rounded-lg mb-6 text-sm">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    {error}
                    <button onClick={() => setError(null)} className="ml-auto"><X className="h-4 w-4" /></button>
                </div>
            )}
            {success && (
                <div className="flex items-center gap-2 bg-green-900/30 border border-green-700/50 text-green-300 px-4 py-3 rounded-lg mb-6 text-sm">
                    <CheckCircle className="h-4 w-4 shrink-0" />
                    {success}
                </div>
            )}

            {/* New Topic Modal */}
            {showNewTopic && (
                <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 mb-6 shadow-sm">
                    <div className="flex justify-between items-center mb-3">
                        <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Create New Topic</h2>
                        <button onClick={() => setShowNewTopic(false)} className="text-zinc-400 hover:text-white"><X className="h-5 w-5" /></button>
                    </div>
                    <div className="flex gap-3">
                        <input
                            placeholder="Topic name, e.g. Income Certificate"
                            className="flex-1 px-4 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 outline-none focus:ring-1 focus:ring-[#E8652D] text-zinc-900 dark:text-white"
                            value={newTopicName}
                            onChange={e => setNewTopicName(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleAddTopic()}
                        />
                        <button onClick={handleAddTopic} className="bg-[#E8652D] hover:bg-[#FF7A42] text-white px-6 py-2 rounded-lg transition-colors">
                            Create
                        </button>
                    </div>
                </div>
            )}

            {/* Bulk Paste Modal */}
            {showBulkPaste && (
                <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 mb-8 shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Bulk Paste Q&A</h2>
                        <button onClick={() => setShowBulkPaste(false)} className="text-zinc-400 hover:text-white"><X className="h-5 w-5" /></button>
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-zinc-400 mb-1">Target Topic</label>
                        <select
                            className="w-full px-4 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 outline-none focus:ring-1 focus:ring-[#E8652D] text-zinc-900 dark:text-white"
                            value={bulkTopic}
                            onChange={e => setBulkTopic(e.target.value)}
                        >
                            {allTopics.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-zinc-400 mb-1">Paste Q&A Text</label>
                        <textarea
                            rows={10}
                            placeholder={"Q: What documents are needed for PAN card?\nA: You need Aadhaar card and a passport-size photo.\n\nQ: How long does it take?\nA: Usually 15-20 working days."}
                            className="w-full px-4 py-3 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 outline-none focus:ring-1 focus:ring-[#E8652D] text-zinc-900 dark:text-white font-mono text-sm"
                            value={bulkText}
                            onChange={e => setBulkText(e.target.value)}
                        />
                        <p className="text-xs text-zinc-500 mt-1">
                            Format: <code className="bg-zinc-800 px-1 rounded">Q: question</code> on one line, <code className="bg-zinc-800 px-1 rounded">A: answer</code> on the next. Separate pairs with blank lines.
                        </p>
                    </div>
                    {bulkText.trim() && (
                        <div className="mb-4 p-3 bg-zinc-800 rounded-lg">
                            <p className="text-xs text-zinc-400">
                                Preview: <span className="text-[#E8652D] font-bold">{parseBulkText(bulkText).length}</span> Q&A pair(s) detected
                            </p>
                        </div>
                    )}
                    <div className="flex gap-3">
                        <button onClick={handleBulkPaste} disabled={saving || !bulkText.trim()}
                            className="bg-[#E8652D] hover:bg-[#FF7A42] text-white px-6 py-2 rounded-lg disabled:opacity-50 flex items-center gap-2 transition-colors">
                            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                            {saving ? 'Importing...' : 'Import All'}
                        </button>
                        <button onClick={() => setShowBulkPaste(false)}
                            className="px-6 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800">
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {/* Add/Edit Form */}
            {showForm && (
                <div id="faq-form" className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 mb-8 shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-bold text-zinc-900 dark:text-white">
                            {editingId ? 'Edit FAQ' : 'Add New FAQ'}
                        </h2>
                        <button onClick={resetForm} className="text-zinc-400 hover:text-white"><X className="h-5 w-5" /></button>
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-zinc-400 mb-1">Question</label>
                            <input
                                placeholder="e.g. What documents are required for scholarship?"
                                className="w-full px-4 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 outline-none focus:ring-1 focus:ring-[#E8652D] text-zinc-900 dark:text-white"
                                value={formData.question}
                                onChange={e => setFormData({ ...formData, question: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-zinc-400 mb-1">Answer</label>
                            <textarea
                                placeholder="Bot answer..."
                                rows={3}
                                className="w-full px-4 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 outline-none focus:ring-1 focus:ring-[#E8652D] text-zinc-900 dark:text-white"
                                value={formData.answer}
                                onChange={e => setFormData({ ...formData, answer: e.target.value })}
                                required
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-zinc-400 mb-1">Topic</label>
                                <select
                                    className="w-full px-4 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 outline-none focus:ring-1 focus:ring-[#E8652D] text-zinc-900 dark:text-white"
                                    value={formData.category}
                                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                                >
                                    {allTopics.map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-zinc-400 mb-1">Keywords (comma separated)</label>
                                <input
                                    placeholder="e.g. scholarship, documents"
                                    className="w-full px-4 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 outline-none focus:ring-1 focus:ring-[#E8652D] text-zinc-900 dark:text-white"
                                    value={formData.keywords}
                                    onChange={e => setFormData({ ...formData, keywords: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button type="submit" disabled={saving} className="bg-[#E8652D] hover:bg-[#FF7A42] text-white px-6 py-2 rounded-lg disabled:opacity-50 flex items-center gap-2">
                                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                                {saving ? 'Saving...' : editingId ? 'Update FAQ' : 'Save FAQ'}
                            </button>
                            <button type="button" onClick={resetForm} className="px-6 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800">
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                    <input
                        placeholder="Search FAQs..."
                        className="w-full pl-10 pr-4 py-2 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 outline-none focus:ring-1 focus:ring-[#E8652D] text-zinc-900 dark:text-white text-sm"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                    />
                </div>
                <select
                    className="px-4 py-2 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 outline-none text-zinc-900 dark:text-white text-sm"
                    value={filterCategory}
                    onChange={e => setFilterCategory(e.target.value)}
                >
                    <option value="">All Topics</option>
                    {topics.map(cat => (
                        <option key={cat} value={cat}>{cat} ({(faqsByTopic[cat] || []).length})</option>
                    ))}
                </select>
            </div>

            {/* Topic Accordion FAQ List */}
            {loading ? (
                <div className="flex justify-center p-12">
                    <Loader2 className="h-8 w-8 animate-spin text-[#E8652D]" />
                </div>
            ) : filteredTopics.length === 0 ? (
                <div className="text-center py-12 text-zinc-500 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800">
                    {faqs.length === 0 ? 'No FAQs found. Add some to train the bot.' : 'No topics match your filters.'}
                </div>
            ) : (
                <div className="space-y-3">
                    {filteredTopics.map(topic => {
                        const topicFaqs = getFilteredFaqs(topic);
                        const isExpanded = expandedTopics.has(topic);
                        return (
                            <div key={topic} className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
                                {/* Topic Header */}
                                <div
                                    className="flex items-center justify-between px-5 py-3.5 cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
                                    onClick={() => toggleTopic(topic)}
                                >
                                    <div className="flex items-center gap-3">
                                        {isExpanded ? <ChevronDown className="h-4 w-4 text-[#E8652D]" /> : <ChevronRight className="h-4 w-4 text-zinc-400" />}
                                        <h3 className="font-bold text-zinc-900 dark:text-white">{topic}</h3>
                                        <span className="text-xs bg-zinc-100 dark:bg-zinc-800 text-zinc-500 px-2 py-0.5 rounded-full">
                                            {topicFaqs.length} FAQ{topicFaqs.length !== 1 ? 's' : ''}
                                        </span>
                                    </div>
                                    <button
                                        onClick={e => { e.stopPropagation(); handleDeleteTopic(topic); }}
                                        className="text-zinc-400 hover:text-red-500 transition-colors p-1.5 rounded-lg hover:bg-red-500/10"
                                        title={`Delete "${topic}" topic and all its FAQs`}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                                {/* FAQ Items */}
                                {isExpanded && (
                                    <div className="border-t border-zinc-100 dark:border-zinc-800 divide-y divide-zinc-100 dark:divide-zinc-800">
                                        {topicFaqs.length === 0 ? (
                                            <p className="text-center text-zinc-500 py-6 text-sm">No FAQs in this topic yet.</p>
                                        ) : (
                                            topicFaqs.map(faq => (
                                                <div key={faq.id} className="px-5 py-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors">
                                                    <div className="flex justify-between items-start gap-3">
                                                        <div className="flex-1 min-w-0">
                                                            <h4 className="font-semibold text-zinc-900 dark:text-white text-sm mb-1">Q: {faq.question}</h4>
                                                            <p className="text-zinc-600 dark:text-zinc-400 text-sm whitespace-pre-line">A: {faq.answer}</p>
                                                            <div className="flex flex-wrap items-center gap-2 mt-2 text-xs">
                                                                {faq.embedding ? (
                                                                    <span className="flex items-center gap-1 text-green-500">
                                                                        <CheckCircle className="h-3 w-3" /> Embedding
                                                                    </span>
                                                                ) : (
                                                                    <span className="flex items-center gap-1 text-amber-500">
                                                                        <AlertTriangle className="h-3 w-3" /> No embedding
                                                                    </span>
                                                                )}
                                                                {faq.keywords?.slice(0, 4).map((kw, i) => (
                                                                    <span key={i} className="bg-[#E8652D]/10 text-[#E8652D] px-1.5 py-0.5 rounded">{kw}</span>
                                                                ))}
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-1 shrink-0">
                                                            <button onClick={() => handleEdit(faq)} className="text-zinc-400 hover:text-[#E8652D] transition-colors p-1.5" title="Edit">
                                                                <Pencil className="h-3.5 w-3.5" />
                                                            </button>
                                                            <button onClick={() => handleDelete(faq.id)} className="text-zinc-400 hover:text-red-500 transition-colors p-1.5" title="Delete">
                                                                <Trash2 className="h-3.5 w-3.5" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
