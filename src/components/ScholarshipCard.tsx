import { Scholarship } from '@/types/scholarship';
import { Calendar, Building2, GraduationCap, IndianRupee, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function ScholarshipCard({ scholarship }: { scholarship: Scholarship }) {
    return (
        <div className="group bg-[#111] rounded-2xl border border-zinc-800 p-6 hover:border-[#E8652D]/50 transition-all duration-500 hover:shadow-[0_0_30px_rgba(232,101,45,0.1)] hover:-translate-y-1">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <span className="inline-block px-3 py-1 bg-[#E8652D]/10 text-[#E8652D] rounded-full text-xs font-semibold mb-2 border border-[#E8652D]/20">
                        Scholarship
                    </span>
                    <h3 className="text-xl font-bold text-white line-clamp-2 group-hover:text-[#FF7A42] transition-colors duration-300">{scholarship.title}</h3>
                    <div className="flex items-center gap-2 text-zinc-500 mt-1">
                        <Building2 className="h-4 w-4" />
                        <span className="text-sm">{scholarship.organization}</span>
                    </div>
                </div>
            </div>

            <div className="space-y-3 mb-6">
                {scholarship.amount && (
                    <div className="flex items-center gap-3">
                        <IndianRupee className="h-5 w-5 text-emerald-500" />
                        <div>
                            <p className="text-sm font-medium text-zinc-400">Amount</p>
                            <p className="text-lg font-bold text-emerald-400">{scholarship.amount}</p>
                        </div>
                    </div>
                )}

                {scholarship.eligibility && (
                    <div className="flex items-start gap-3">
                        <GraduationCap className="h-5 w-5 text-zinc-600 mt-0.5" />
                        <div>
                            <p className="text-sm font-medium text-zinc-400">Eligibility</p>
                            <p className="text-sm text-zinc-500">{scholarship.eligibility}</p>
                        </div>
                    </div>
                )}

                {scholarship.last_date && (
                    <div className="flex items-center gap-3">
                        <Calendar className="h-5 w-5 text-zinc-600" />
                        <div>
                            <p className="text-sm font-medium text-zinc-400">Last Date</p>
                            <p className="text-sm text-[#E8652D] font-semibold">
                                {new Date(scholarship.last_date).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                            </p>
                        </div>
                    </div>
                )}
            </div>

            <Link
                href={`/scholarships/${scholarship.id}`}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#E8652D] hover:bg-[#FF7A42] text-white rounded-xl transition-all duration-300 text-sm font-semibold shadow-lg hover:shadow-[0_0_20px_rgba(232,101,45,0.3)]"
            >
                View More <ArrowRight className="h-4 w-4" />
            </Link>
        </div>
    );
}
