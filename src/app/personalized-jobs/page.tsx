'use client';

import { useState } from 'react';
import { Loader2, UserCheck, Sparkles } from 'lucide-react';
import { INDIAN_STATES, COMMON_QUALIFICATIONS } from '@/lib/constants';
import { profilesAPI } from '@/lib/api';
import JobCard from '@/components/JobCard';
import { Job } from '@/types/job';

export default function PersonalizedJobsPage() {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [jobs, setJobs] = useState<Job[]>([]);

    const [formData, setFormData] = useState({
        phone: '',
        state: '',
        qualification: '',
    });

    const handleSubmit = async () => {
        if (!formData.phone || !formData.state || !formData.qualification) {
            setError('Please fill in all required fields.');
            return;
        }
        setLoading(true);
        setError('');
        try {
            await profilesAPI.save(formData);
            const recommendations = await profilesAPI.getRecommendations({
                state: formData.state,
                qualification: formData.qualification,
            });
            setJobs(recommendations);
            setStep(3);
        } catch (err: any) {
            setError(err.message || 'Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const inputClass = "w-full px-4 py-2.5 rounded-xl bg-zinc-800/50 border border-zinc-700 text-white placeholder-zinc-600 outline-none focus:ring-2 focus:ring-[#E8652D] focus:border-transparent transition-all";

    return (
        <div className="min-h-screen bg-[#0a0a0a] pt-24 pb-16 px-4">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-10 animate-fade-in-up">
                    <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#E8652D]/10 border border-[#E8652D]/20 text-[#E8652D] text-sm font-semibold mb-4">
                        <Sparkles className="h-4 w-4" /> AI-Powered
                    </span>
                    <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-4">
                        Personalized Job <span className="text-gradient">Recommendations</span>
                    </h1>
                    <p className="text-zinc-500 text-lg">
                        Tell us about yourself and we&apos;ll find the most relevant jobs for you.
                    </p>
                </div>

                {/* Step indicator */}
                {step < 3 && (
                    <div className="flex justify-center gap-3 mb-8">
                        {[1, 2].map(s => (
                            <div key={s} className={`h-2 rounded-full transition-all duration-500 ${s === step ? 'w-12 bg-[#E8652D]' : s < step ? 'w-8 bg-[#E8652D]/50' : 'w-8 bg-zinc-800'}`} />
                        ))}
                    </div>
                )}

                {step < 3 && (
                    <div className="max-w-xl mx-auto bg-[#111] rounded-3xl p-5 sm:p-8 border border-zinc-800 shadow-2xl" style={{ animation: 'fadeInUp 0.6s ease-out 0.2s both' }}>
                        {error && (
                            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm">
                                {error}
                            </div>
                        )}

                        {step === 1 && (
                            <div className="space-y-5">
                                <h2 className="text-xl font-bold text-white mb-4">Step 1: Your Details</h2>
                                <div>
                                    <label className="block text-sm font-medium text-zinc-400 mb-1.5">Phone Number *</label>
                                    <input type="tel" required pattern="[0-9]{10}" maxLength={10}
                                        value={formData.phone}
                                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                        className={inputClass} placeholder="10-digit number" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-zinc-400 mb-1.5">State *</label>
                                    <select required value={formData.state}
                                        onChange={e => setFormData({ ...formData, state: e.target.value })}
                                        className={inputClass}>
                                        <option value="">Select State</option>
                                        {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                                <button
                                    onClick={() => { if (formData.phone && formData.state) setStep(2); else setError('Phone and State are required.'); }}
                                    className="w-full bg-[#E8652D] hover:bg-[#FF7A42] text-white font-bold py-3 rounded-xl transition-all duration-300 shadow-lg hover:shadow-[0_0_20px_rgba(232,101,45,0.3)]"
                                >
                                    Next →
                                </button>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="space-y-5">
                                <h2 className="text-xl font-bold text-white mb-4">Step 2: Your Education</h2>
                                <div>
                                    <label className="block text-sm font-medium text-zinc-400 mb-1.5">Qualification *</label>
                                    <select required value={formData.qualification}
                                        onChange={e => setFormData({ ...formData, qualification: e.target.value })}
                                        className={inputClass}>
                                        <option value="">Select Qualification</option>
                                        {COMMON_QUALIFICATIONS.map(q => <option key={q} value={q}>{q}</option>)}
                                    </select>
                                </div>
                                <div className="flex gap-3">
                                    <button onClick={() => setStep(1)}
                                        className="flex-1 border border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-500 font-bold py-3 rounded-xl transition-all">
                                        ← Back
                                    </button>
                                    <button onClick={handleSubmit} disabled={loading}
                                        className="flex-1 bg-[#E8652D] hover:bg-[#FF7A42] text-white font-bold py-3 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-[0_0_20px_rgba(232,101,45,0.3)]">
                                        {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <><UserCheck className="h-5 w-5" /> Get Jobs</>}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {step === 3 && (
                    <div className="animate-fade-in-up">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-white">
                                Found <span className="text-[#E8652D]">{jobs.length}</span> Matching Jobs
                            </h2>
                            <button onClick={() => { setStep(1); setJobs([]); }}
                                className="text-[#E8652D] hover:text-[#FF7A42] font-medium text-sm transition-colors">
                                ← Change Preferences
                            </button>
                        </div>
                        {jobs.length === 0 ? (
                            <div className="text-center py-12 text-zinc-500 bg-[#111] rounded-2xl border border-zinc-800">
                                No matching jobs found. Try broadening your preferences.
                            </div>
                        ) : (
                            <div className="grid gap-6 md:grid-cols-2">
                                {jobs.map((job, i) => (
                                    <div key={job.id} style={{ animation: `fadeInUp 0.5s ease-out ${i * 0.05}s both` }}>
                                        <JobCard job={job} />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
