'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit, Loader2, X, Upload, Pencil } from 'lucide-react';
import { Scholarship } from '@/types/scholarship';
import { scholarshipsAPI } from '@/lib/api';
import { INDIAN_STATES, COMMON_QUALIFICATIONS } from '@/lib/constants';
import RichTextEditor from '@/components/RichTextEditor';
import MultiSelect from '@/components/MultiSelect';

const EMPTY_FORM = {
    title: '', organization: '', eligibility: '', last_date: '', apply_link: '', notification_url: '',
    state: '', qualification: '', amount: '', is_active: true, apply_start_date: ''
};

const DEFAULT_SCHOLARSHIP_CONTENT = `
<h2>Full details information - pdf here</h2>
<h3>About the Scholarship</h3>
<p>Write a short introduction about the scholarship, its purpose and the organization providing it.</p>
<h3>Eligibility Criteria</h3>
<ul>
  <li>Nationality requirement</li>
  <li>Class / course eligibility</li>
  <li>Minimum marks required</li>
  <li>Income limit (if applicable)</li>
</ul>
<h3>Scholarship Benefits</h3>
<ul>
  <li>Tuition fee coverage</li>
  <li>Financial assistance</li>
  <li>Other academic support if available</li>
</ul>
<h3>Required Documents</h3>
<ul>
  <li>Aadhaar Card</li>
  <li>Passport size photograph</li>
  <li>Previous marksheet</li>
  <li>Income certificate</li>
  <li>Bank passbook</li>
  <li>Admission proof / College ID</li>
</ul>
<h3>Selection Process</h3>
<ol>
  <li>Application screening</li>
  <li>Document verification</li>
  <li>Interview (if applicable)</li>
  <li>Final selection</li>
</ol>
<h3>Why Students Trust Online Wale Bhaiya?</h3>
<p>हर साल हजारों छात्रों के सरकारी job forms सिर्फ छोटी-सी गलती जैसे गलत category, photo size या document upload की वजह से reject हो जाते हैं। इसलिए form भरते समय सही जानकारी और सही process का ध्यान रखना बहुत जरूरी होता है।</p>
<p>Online Wale Bhaiya भारत का एक पहला digital cyber cafe concept है, जिसका उद्देश्य लोगों को सरकारी forms और online services के बारे में जागरूक करना है। यह initiative TEC-CCE certified Village Level Entrepreneur द्वारा संचालित है, जिससे users को form filling process में भरोसा और transparency मिलती है।</p>
<h3>Online Wale Bhaiya Trust Assurance</h3>
<p>✔ <strong>Live Screen Share Process</strong><br/>Form fill करते समय पूरी process live screen share के माध्यम से दिखाई जाती है, जिससे हर step transparent रहता है।</p>
<p>✔ <strong>Auto Document Delete System</strong><br/>आपकी privacy को ध्यान में रखते हुए website पर upload किए गए documents लगभग 30 सेकंड के अंदर automatically delete हो जाते हैं, जिससे आपकी personal information सुरक्षित रहती है।</p>
<p>✔ <strong>TEC-CCE Certified Operator</strong><br/>यह service TEC-CCE certified Village Level Entrepreneur द्वारा संचालित है, जिससे process में भरोसा और reliability बनी रहती है।</p>
<p>✔ <strong>Ghar Baithe Digital Service</strong><br/>अब आपको cyber cafe जाने की जरूरत नहीं — WhatsApp और online support के ज़रिए form filling घर बैठे आपके fingertips पर हो सकता है।</p>
<p><strong>WhatsApp/Call – 8581823795</strong><br/><a href="https://www.onlinewalebhaiya.com">www.onlinewalebhaiya.com</a></p>
`;

export default function AdminScholarships() {
    const [scholarships, setScholarships] = useState<Scholarship[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editId, setEditId] = useState<string | null>(null);
    const [formData, setFormData] = useState<any>(EMPTY_FORM);
    const [pdfFile, setPdfFile] = useState<File | null>(null);
    const [saving, setSaving] = useState(false);

    // Rich Text Modal
    const [editContentScholarship, setEditContentScholarship] = useState<Scholarship | null>(null);
    const [richText, setRichText] = useState('');
    const [savingText, setSavingText] = useState(false);

    useEffect(() => { loadScholarships(); }, []);

    const loadScholarships = async () => {
        try {
            const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
            const res = await fetch('/api/scholarships?admin=true', {
                headers: token ? { 'Authorization': `Bearer ${token}` } : {},
            });
            const data = await res.json();
            setScholarships(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Failed to load scholarships:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const fd = new FormData();
            Object.entries(formData).forEach(([key, val]) => {
                if (val !== null && val !== undefined) fd.append(key, String(val));
            });
            if (pdfFile) fd.append('notification_pdf', pdfFile);

            if (editId) {
                await scholarshipsAPI.update(editId, fd);
            } else {
                await scholarshipsAPI.create(fd);
            }
            await loadScholarships();
            setShowForm(false);
            setEditId(null);
            setFormData(EMPTY_FORM);
            setPdfFile(null);
        } catch (err) {
            console.error("Failed to save:", err);
        } finally {
            setSaving(false);
        }
    };

    const handleEdit = (s: Scholarship) => {
        setFormData({
            title: s.title || '', organization: s.organization || '', eligibility: s.eligibility || '',
            last_date: s.last_date?.split('T')[0] || '', apply_link: s.apply_link || '',
            notification_url: s.notification_url || '', state: s.state || '', qualification: s.qualification || '',
            amount: s.amount || '', apply_start_date: s.apply_start_date?.split('T')[0] || '', is_active: s.is_active
        });
        setPdfFile(null);
        setEditId(s.id);
        setShowForm(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure?')) return;
        try {
            await scholarshipsAPI.delete(id);
            setScholarships(prev => prev.filter(s => s.id !== id));
        } catch (err) {
            console.error("Failed to delete:", err);
        }
    };

    const openContentEditor = (s: Scholarship) => {
        setEditContentScholarship(s);
        setRichText(s.detail_content || DEFAULT_SCHOLARSHIP_CONTENT);
    };

    const saveContent = async () => {
        if (!editContentScholarship) return;
        setSavingText(true);
        try {
            const fd = new FormData();
            fd.append('detail_content', richText);
            await scholarshipsAPI.update(editContentScholarship.id, fd);

            await loadScholarships();
            setEditContentScholarship(null);
        } catch (e: any) {
            console.error(e);
        } finally {
            setSavingText(false);
        }
    };

    const inputClass = "w-full px-3 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 outline-none focus:ring-1 focus:ring-[#E8652D] text-sm";

    return (
        <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Scholarship Management</h1>
                <button
                    onClick={() => { setShowForm(true); setEditId(null); setFormData(EMPTY_FORM); setPdfFile(null); }}
                    className="bg-[#E8652D] hover:bg-[#FF7A42] text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                >
                    <Plus className="h-5 w-5" /> Add Scholarship
                </button>
            </div>

            {showForm && (
                <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 mb-8 shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-bold text-zinc-900 dark:text-white">{editId ? 'Edit Scholarship' : 'Add Scholarship'}</h2>
                        <button onClick={() => { setShowForm(false); setEditId(null); }}><X className="h-5 w-5 text-zinc-400" /></button>
                    </div>
                    <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <input placeholder="Scholarship Name *" required className={inputClass} value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
                        <input placeholder="Organization *" required className={inputClass} value={formData.organization} onChange={e => setFormData({ ...formData, organization: e.target.value })} />
                        <input placeholder="Amount (e.g. ₹50,000)" className={inputClass} value={formData.amount} onChange={e => setFormData({ ...formData, amount: e.target.value })} />
                        <input placeholder="Eligibility" className={inputClass} value={formData.eligibility} onChange={e => setFormData({ ...formData, eligibility: e.target.value })} />
                        <input type="date" title="Apply Start Date" className={inputClass} value={formData.apply_start_date} onChange={e => setFormData({ ...formData, apply_start_date: e.target.value })} />
                        <input type="date" title="Last Date" className={inputClass} value={formData.last_date} onChange={e => setFormData({ ...formData, last_date: e.target.value })} />
                        <input placeholder="Apply Link" className={inputClass} value={formData.apply_link} onChange={e => setFormData({ ...formData, apply_link: e.target.value })} />

                        <div className="flex flex-col gap-1">
                            <label className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">Notification PDF</label>
                            <div className="relative">
                                <input
                                    type="file"
                                    accept=".pdf"
                                    onChange={e => setPdfFile(e.target.files?.[0] || null)}
                                    className="hidden"
                                    id="scholarship-pdf-upload"
                                />
                                <label htmlFor="scholarship-pdf-upload" className={`${inputClass} cursor-pointer flex items-center gap-2 text-zinc-500`}>
                                    <Upload className="h-4 w-4 shrink-0" />
                                    <span className="truncate">{pdfFile ? pdfFile.name : formData.notification_url ? '📄 PDF uploaded (click to replace)' : 'Choose PDF file'}</span>
                                </label>
                            </div>
                        </div>

                        <select className={inputClass} value={formData.state} onChange={e => setFormData({ ...formData, state: e.target.value })}>
                            <option value="">Select State</option>
                            <option value="All India">All India</option>
                            {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                        <MultiSelect options={COMMON_QUALIFICATIONS} value={formData.qualification} onChange={v => setFormData({ ...formData, qualification: v })} placeholder="Select Qualifications" className={inputClass} />
                        <button type="submit" disabled={saving}
                            className="bg-[#E8652D] hover:bg-[#FF7A42] text-white py-2 rounded-lg flex items-center justify-center gap-2 transition-colors md:col-span-2 lg:col-span-3 mt-2">
                            {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : editId ? 'Update' : 'Save Scholarship'}
                        </button>
                    </form>
                </div>
            )}

            {loading ? (
                <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-[#E8652D]" /></div>
            ) : (
                <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 overflow-hidden overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white uppercase font-medium text-xs">
                            <tr>
                                <th className="px-6 py-3">Scholarship Name</th>
                                <th className="px-6 py-3">Organization</th>
                                <th className="px-6 py-3">Amount</th>
                                <th className="px-6 py-3">Start Date</th>
                                <th className="px-6 py-3">Last Date</th>
                                <th className="px-6 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                            {scholarships.length === 0 ? (
                                <tr className="text-zinc-500 text-center">
                                    <td colSpan={6} className="py-8">No scholarships found.</td>
                                </tr>
                            ) : scholarships.map(s => (
                                <tr key={s.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-zinc-900 dark:text-white">
                                        {s.title}
                                        {s.detail_content && <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">Content</span>}
                                    </td>
                                    <td className="px-6 py-4 text-zinc-600 dark:text-zinc-400">{s.organization}</td>
                                    <td className="px-6 py-4 text-zinc-600 dark:text-zinc-400">{s.amount || '—'}</td>
                                    <td className="px-6 py-4 text-zinc-600 dark:text-zinc-400 whitespace-nowrap">{s.apply_start_date ? new Date(s.apply_start_date).toLocaleDateString('en-IN') : '—'}</td>
                                    <td className="px-6 py-4 text-zinc-600 dark:text-zinc-400 whitespace-nowrap">{s.last_date ? new Date(s.last_date).toLocaleDateString('en-IN') : '—'}</td>
                                    <td className="px-6 py-4 text-right flex justify-end gap-2">
                                        <button onClick={() => openContentEditor(s)} className="p-1.5 flex items-center gap-1 hover:bg-[#E8652D]/10 rounded-lg text-[#E8652D] text-xs font-medium border border-[#E8652D]/30 transition-colors" title="Edit Detail Content">
                                            <Pencil className="h-3.5 w-3.5" /> Content
                                        </button>
                                        <button onClick={() => handleEdit(s)} className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-lg text-zinc-600 dark:text-zinc-400"><Edit className="h-4 w-4" /></button>
                                        <button onClick={() => handleDelete(s.id)} className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-red-600"><Trash2 className="h-4 w-4" /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Rich Text Editor Modal */}
            {editContentScholarship && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
                    <div className="bg-zinc-900 rounded-2xl border border-zinc-700 w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl">
                        <div className="flex items-center justify-between p-5 border-b border-zinc-700 shrink-0">
                            <div>
                                <h2 className="text-lg font-bold text-white">Edit Scholarship Details</h2>
                                <p className="text-sm text-zinc-400 mt-0.5">{editContentScholarship.title} — Detailed HTML content for the View More page.</p>
                            </div>
                            <button onClick={() => setEditContentScholarship(null)} className="text-zinc-400 hover:text-white p-1"><X className="h-5 w-5" /></button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-5">
                            <RichTextEditor value={richText} onChange={setRichText} placeholder="Write the complete scholarship details here..." />
                        </div>
                        <div className="flex items-center justify-end gap-3 p-5 border-t border-zinc-700 shrink-0">
                            <button onClick={() => setEditContentScholarship(null)} className="px-5 py-2 rounded-lg border border-zinc-700 text-zinc-400 hover:bg-zinc-800 text-sm">Cancel</button>
                            <button onClick={saveContent} disabled={savingText}
                                className="bg-[#E8652D] hover:bg-[#FF7A42] text-white px-5 py-2 rounded-lg flex items-center gap-2 disabled:opacity-50 text-sm font-semibold">
                                {savingText ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save Details'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
