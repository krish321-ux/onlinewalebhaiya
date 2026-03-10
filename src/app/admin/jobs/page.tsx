'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit, Loader2, X, Upload, Pencil } from 'lucide-react';
import { Job } from '@/types/job';
import { jobsAPI } from '@/lib/api';
import { INDIAN_STATES, COMMON_QUALIFICATIONS, JOB_TYPES } from '@/lib/constants';
import RichTextEditor from '@/components/RichTextEditor';
import MultiSelect from '@/components/MultiSelect';

const EMPTY_FORM = {
    title: '', department: '', eligibility: '', last_date: '', apply_link: '', notification_url: '',
    state: '', qualification: '', category: '', job_type: 'Central Govt', is_active: true,
    advt_no: '', post_date: '', no_of_vacancy: '', apply_start_date: ''
};

const DEFAULT_JOB_CONTENT = `
<h2>Full details information - pdf here</h2>
<h3>Overview</h3>
<table>
  <tbody>
    <tr><td><strong>भर्ती का नाम</strong></td><td>[Job Name]</td></tr>
    <tr><td><strong>पद का नाम</strong></td><td>[Post Name]</td></tr>
    <tr><td><strong>कुल पद</strong></td><td>[Vacancy Count]</td></tr>
    <tr><td><strong>आवेदन शुरू</strong></td><td>[Start Date]</td></tr>
    <tr><td><strong>अंतिम तिथि</strong></td><td>[End Date]</td></tr>
    <tr><td><strong>Official वेबसाइट</strong></td><td><a href="#">Link</a></td></tr>
  </tbody>
</table>
<h3>Eligibility (योग्यता)</h3>
<ul>
  <li>उम्मीदवार भारत का नागरिक (Indian Citizen) होना चाहिए।</li>
  <li>उम्मीदवार किसी मान्यता प्राप्त बोर्ड से कम से कम 10वीं पास (10th Pass) होना चाहिए।</li>
  <li>उम्मीदवार की न्यूनतम आयु 18 वर्ष होनी चाहिए।</li>
  <li>अधिकतम आयु में आरक्षित वर्ग को सरकार के नियम के अनुसार Age Relaxation दिया जाएगा।</li>
</ul>
<h3>Documents Required (जरूरी दस्तावेज़)</h3>
<ul>
  <li>आधार कार्ड</li>
  <li>10वीं की मार्कशीट या सर्टिफिकेट</li>
  <li>जाति प्रमाण पत्र</li>
  <li>निवास प्रमाण पत्र</li>
  <li>ईमेल आईडी</li>
  <li>मोबाइल नंबर</li>
  <li>पासपोर्ट साइज फोटो</li>
  <li>हस्ताक्षर</li>
  <li>बैंक खाते की पासबुक</li>
</ul>
<h3>Application Fees (आवेदन शुल्क)</h3>
<table>
  <tbody>
    <tr><td><strong>Category</strong></td><td><strong>Fees</strong></td></tr>
    <tr><td>General / OBC / EWS</td><td>500</td></tr>
    <tr><td>SC/ST/PWD</td><td>250</td></tr>
  </tbody>
</table>
<h3>Selection Process (चयन प्रक्रिया)</h3>
<ul>
  <li>Computer Based Test (CBT)</li>
  <li>Physical Efficiency Test (PET)</li>
  <li>Document Verification</li>
  <li>Medical Examination</li>
</ul>
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

export default function AdminJobs() {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editId, setEditId] = useState<string | null>(null);
    const [formData, setFormData] = useState<any>(EMPTY_FORM);
    const [pdfFile, setPdfFile] = useState<File | null>(null);
    const [saving, setSaving] = useState(false);

    // Rich Text Modal State
    const [editContentJob, setEditContentJob] = useState<Job | null>(null);
    const [richText, setRichText] = useState('');
    const [savingText, setSavingText] = useState(false);

    useEffect(() => { loadJobs(); }, []);

    const loadJobs = async () => {
        try {
            const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
            const res = await fetch('/api/jobs?admin=true', {
                headers: token ? { 'Authorization': `Bearer ${token}` } : {},
            });
            const data = await res.json();
            setJobs(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Failed to load jobs:", err);
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
                await jobsAPI.update(editId, fd);
            } else {
                await jobsAPI.create(fd);
            }
            await loadJobs();
            setShowForm(false);
            setEditId(null);
            setFormData(EMPTY_FORM);
            setPdfFile(null);
        } catch (err) {
            console.error("Failed to save job:", err);
        } finally {
            setSaving(false);
        }
    };

    const handleEdit = (job: Job) => {
        setFormData({
            title: job.title || '', department: job.department || '', eligibility: job.eligibility || '',
            last_date: job.last_date?.split('T')[0] || '', apply_link: job.apply_link || '',
            notification_url: job.notification_url || '', state: job.state || '',
            qualification: job.qualification || '', no_of_vacancy: job.no_of_vacancy || '',
            apply_start_date: job.apply_start_date?.split('T')[0] || '',
            category: job.category || '', job_type: job.job_type || 'Central Govt', is_active: job.is_active,
            advt_no: (job as any).advt_no || '', post_date: (job as any).post_date?.split('T')[0] || ''
        });
        setPdfFile(null);
        setEditId(job.id);
        setShowForm(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this job?')) return;
        try {
            await jobsAPI.delete(id);
            setJobs(prev => prev.filter(j => j.id !== id));
        } catch (err) {
            console.error("Failed to delete:", err);
        }
    };

    const openContentEditor = (job: Job) => {
        setEditContentJob(job);
        setRichText(job.detail_content || DEFAULT_JOB_CONTENT);
    };

    const saveContent = async () => {
        if (!editContentJob) return;
        setSavingText(true);
        try {
            const fd = new FormData();
            fd.append('detail_content', richText);
            await jobsAPI.update(editContentJob.id, fd);

            await loadJobs();
            setEditContentJob(null);
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
                <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Job Management</h1>
                <button
                    onClick={() => { setShowForm(true); setEditId(null); setFormData(EMPTY_FORM); setPdfFile(null); }}
                    className="bg-[#E8652D] hover:bg-[#FF7A42] text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                >
                    <Plus className="h-5 w-5" /> Add New Job
                </button>
            </div>

            {showForm && (
                <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 mb-8 shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-bold text-zinc-900 dark:text-white">{editId ? 'Edit Job' : 'Add New Job'}</h2>
                        <button onClick={() => { setShowForm(false); setEditId(null); }}><X className="h-5 w-5 text-zinc-400" /></button>
                    </div>
                    <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <input placeholder="Post Name (Job Title) *" required className={inputClass} value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
                        <input placeholder="Recruitment Board (Department) *" required className={inputClass} value={formData.department} onChange={e => setFormData({ ...formData, department: e.target.value })} />
                        <input placeholder="Advt No / Notification No" className={inputClass} value={(formData as any).advt_no} onChange={e => setFormData({ ...formData, advt_no: e.target.value } as any)} />
                        <input type="number" placeholder="No. of Vacancies" className={inputClass} value={formData.no_of_vacancy} onChange={e => setFormData({ ...formData, no_of_vacancy: e.target.value })} />
                        <input type="date" title="Apply Start Date" placeholder="Apply Start Date" className={inputClass} value={formData.apply_start_date} onChange={e => setFormData({ ...formData, apply_start_date: e.target.value })} />
                        <input type="date" title="Last Date" placeholder="Last Date" className={inputClass} value={formData.last_date} onChange={e => setFormData({ ...formData, last_date: e.target.value })} />
                        <input placeholder="Apply Link" className={inputClass} value={formData.apply_link} onChange={e => setFormData({ ...formData, apply_link: e.target.value })} />

                        <div className="flex flex-col gap-1">
                            <label className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">Notification PDF</label>
                            <div className="relative">
                                <input
                                    type="file"
                                    accept=".pdf"
                                    onChange={e => setPdfFile(e.target.files?.[0] || null)}
                                    className="hidden"
                                    id="pdf-upload"
                                />
                                <label htmlFor="pdf-upload" className={`${inputClass} cursor-pointer flex items-center gap-2 text-zinc-500`}>
                                    <Upload className="h-4 w-4 shrink-0" />
                                    <span className="truncate">{pdfFile ? pdfFile.name : formData.notification_url ? '📄 PDF uploaded (click to replace)' : 'Choose PDF file'}</span>
                                </label>
                            </div>
                        </div>

                        <MultiSelect options={['All India', ...INDIAN_STATES]} value={formData.state} onChange={v => setFormData({ ...formData, state: v })} placeholder="Select State(s)" className={inputClass} />
                        <MultiSelect options={COMMON_QUALIFICATIONS} value={formData.qualification} onChange={v => setFormData({ ...formData, qualification: v })} placeholder="Select Qualifications" className={inputClass} />
                        <MultiSelect options={JOB_TYPES} value={formData.job_type} onChange={v => setFormData({ ...formData, job_type: v })} placeholder="Select Job Type" className={inputClass} />
                        <input placeholder="Category (e.g. Group A)" className={inputClass} value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} />
                        <button
                            type="submit"
                            disabled={saving}
                            className="bg-[#E8652D] hover:bg-[#FF7A42] text-white py-2 rounded-lg flex items-center justify-center gap-2 transition-colors md:col-span-2 lg:col-span-3 mt-2"
                        >
                            {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : editId ? 'Update Job' : 'Save Job'}
                        </button>
                    </form>
                </div>
            )}

            {loading ? (
                <div className="flex justify-center p-12">
                    <Loader2 className="h-8 w-8 animate-spin text-[#E8652D]" />
                </div>
            ) : (
                <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 overflow-hidden overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white uppercase font-medium text-xs">
                            <tr>
                                <th className="px-4 py-3">Recruitment Board</th>
                                <th className="px-4 py-3">Post Name</th>
                                <th className="px-4 py-3">Qualification</th>
                                <th className="px-4 py-3">Vacancies</th>
                                <th className="px-4 py-3">Start Date</th>
                                <th className="px-4 py-3">Last Date</th>
                                <th className="px-4 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                            {jobs.length === 0 ? (
                                <tr className="text-zinc-500 text-center">
                                    <td colSpan={7} className="py-8">No jobs found. Add one above.</td>
                                </tr>
                            ) : jobs.map(job => (
                                <tr key={job.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                                    <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">{job.department}</td>
                                    <td className="px-4 py-3 font-medium text-zinc-900 dark:text-white">
                                        {job.title}
                                        {job.detail_content && <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">Content</span>}
                                    </td>
                                    <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">{job.qualification || '—'}</td>
                                    <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">{job.no_of_vacancy || '—'}</td>
                                    <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400 whitespace-nowrap">{job.apply_start_date ? new Date(job.apply_start_date).toLocaleDateString('en-IN') : '—'}</td>
                                    <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400 whitespace-nowrap">{job.last_date ? new Date(job.last_date).toLocaleDateString('en-IN') : '—'}</td>
                                    <td className="px-4 py-3 text-right flex justify-end gap-2">
                                        <button onClick={() => openContentEditor(job)} className="p-1.5 flex items-center gap-1 hover:bg-[#E8652D]/10 rounded-lg text-[#E8652D] text-xs font-medium border border-[#E8652D]/30 transition-colors" title="Edit Detail Content">
                                            <Pencil className="h-3.5 w-3.5" /> Content
                                        </button>
                                        <button onClick={() => handleEdit(job)} className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-lg text-zinc-600 dark:text-zinc-400" title="Edit Properties">
                                            <Edit className="h-4 w-4" />
                                        </button>
                                        <button onClick={() => handleDelete(job.id)} className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-red-600" title="Delete">
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Rich Text Editor Modal */}
            {editContentJob && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
                    <div className="bg-zinc-900 rounded-2xl border border-zinc-700 w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl">
                        <div className="flex items-center justify-between p-5 border-b border-zinc-700 shrink-0">
                            <div>
                                <h2 className="text-lg font-bold text-white">Edit Job Details</h2>
                                <p className="text-sm text-zinc-400 mt-0.5">{editContentJob.title} — Detailed HTML content for the View More page.</p>
                            </div>
                            <button onClick={() => setEditContentJob(null)} className="text-zinc-400 hover:text-white p-1"><X className="h-5 w-5" /></button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-5">
                            <RichTextEditor value={richText} onChange={setRichText} placeholder="Write the complete job overview here..." />
                        </div>
                        <div className="flex items-center justify-end gap-3 p-5 border-t border-zinc-700 shrink-0">
                            <button onClick={() => setEditContentJob(null)} className="px-5 py-2 rounded-lg border border-zinc-700 text-zinc-400 hover:bg-zinc-800 text-sm">Cancel</button>
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
