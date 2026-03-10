import { Job } from '@/types/job';
import { Calendar, Building2, GraduationCap, Download, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { getSecureUrl } from '@/lib/secureUrl';

export default function JobCard({ job }: { job: Job }) {
    return (
        <div className="group bg-[#111] rounded-2xl border border-zinc-800 p-4 sm:p-6 hover:border-[#E8652D]/50 transition-all duration-500 hover:shadow-[0_0_30px_rgba(232,101,45,0.1)] hover:-translate-y-1">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <span className="inline-block px-3 py-1 bg-[#E8652D]/10 text-[#E8652D] rounded-full text-xs font-semibold mb-2 border border-[#E8652D]/20">
                        {job.job_type || 'Government Job'}
                    </span>
                    <h3 className="text-lg sm:text-xl font-bold text-white line-clamp-2 group-hover:text-[#FF7A42] transition-colors duration-300">{job.title}</h3>
                    <div className="flex items-center gap-2 text-zinc-500 mt-1">
                        <Building2 className="h-4 w-4" />
                        <span className="text-sm">{job.department}</span>
                    </div>
                </div>
            </div>

            <div className="space-y-3 mb-6">
                {job.eligibility && (
                    <div className="flex items-start gap-3">
                        <GraduationCap className="h-5 w-5 text-zinc-600 mt-0.5" />
                        <div>
                            <p className="text-sm font-medium text-zinc-400">Eligibility</p>
                            <p className="text-sm text-zinc-500">{job.eligibility}</p>
                        </div>
                    </div>
                )}

                {job.last_date && (
                    <div className="flex items-center gap-3">
                        <Calendar className="h-5 w-5 text-zinc-600" />
                        <div>
                            <p className="text-sm font-medium text-zinc-400">Last Date</p>
                            <p className="text-sm text-[#E8652D] font-semibold">
                                {new Date(job.last_date).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                            </p>
                        </div>
                    </div>
                )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
                {job.notification_url && (
                    <a
                        href={getSecureUrl(job.notification_url)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 border border-zinc-700 rounded-xl text-zinc-400 hover:text-white hover:border-zinc-500 hover:bg-zinc-800/50 transition-all duration-300 text-sm font-medium"
                    >
                        <Download className="h-4 w-4" /> Notification
                    </a>
                )}
                <Link
                    href={`/jobs/${job.id}`}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-[#E8652D] hover:bg-[#FF7A42] text-white rounded-xl transition-all duration-300 text-sm font-semibold shadow-lg hover:shadow-[0_0_20px_rgba(232,101,45,0.3)]"
                >
                    View More <ArrowRight className="h-4 w-4" />
                </Link>
            </div>
        </div>
    );
}
