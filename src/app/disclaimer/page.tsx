import Link from 'next/link';

const SECTIONS = [
    {
        id: 'A',
        title: 'Service Disclaimer',
        content: `Online Wale Bhaiya provides application assistance services only. Final approval, rejection, eligibility verification, or processing of any application is solely determined by the respective government department, recruitment board, or concerned authority. We do not guarantee any specific outcome.`,
    },
    {
        id: 'B',
        title: 'No Guarantee Policy',
        content: `Submission of an application through our platform does not guarantee selection, approval, benefit disbursement, or recruitment. Outcomes depend entirely on official evaluation procedures and eligibility criteria set by the authority. Online Wale Bhaiya shall not be held liable for any rejection or delay caused by the government body.`,
    },
    {
        id: 'C',
        title: 'Data Privacy & Security Policy',
        content: `We strictly respect user privacy. Personal documents and information are used only for application submission purposes. We do not store, sell, or misuse customer data beyond operational requirements. Upon request, document deletion confirmation can be provided for transparency. All data is handled securely and in compliance with applicable privacy norms.`,
    },
    {
        id: 'D',
        title: 'Independent Entity Clarification',
        content: `Online Wale Bhaiya is an independent service provider operating under CSC guidelines. We are not directly affiliated with any specific government department, recruitment board, or authority unless officially stated. Our role is limited to facilitating the application process on behalf of the applicant.`,
    },
    {
        id: 'E',
        title: 'Transparency Commitment',
        content: `We maintain complete transparency in our operations. Service charges are clearly communicated before processing. Acknowledgment receipts and submission proofs are shared with applicants for verification. No hidden charges are levied beyond the agreed service fee.`,
    },
    {
        id: 'F',
        title: 'About Us',
        content: `Online Wale Bhaiya is an authorised VLE (Village Level Entrepreneur) operating under the Digital India Programme. We strictly follow all government guidelines and compliance standards while providing digital assistance services. Our mission is to make government services accessible to every citizen, especially in rural and semi-urban areas.`,
    },
];

export default function DisclaimerPage() {
    return (
        <div className="min-h-screen bg-[#0a0a0a]">
            {/* Hero */}
            <div className="relative pt-32 pb-12 px-4 text-center">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[200px] bg-[#E8652D]/6 rounded-full blur-[100px]" />
                <div className="relative z-10 max-w-3xl mx-auto">
                    <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#E8652D]/10 border border-[#E8652D]/20 text-[#E8652D] text-sm font-semibold mb-4">
                        📋 Legal Document
                    </span>
                    <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-3">
                        Official <span className="text-gradient">Disclaimer</span>
                    </h1>
                    <p className="text-zinc-500 text-lg mb-2">
                        Service Disclaimer &amp; Policy Document — Online Wale Bhaiya
                    </p>
                    <p className="text-zinc-600 text-sm">
                        Last updated: March 2025
                    </p>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-3xl mx-auto px-4 sm:px-6 pb-24">
                {/* Intro box */}
                <div className="bg-[#E8652D]/8 border border-[#E8652D]/20 rounded-2xl p-6 mb-10 text-sm text-zinc-400 leading-relaxed">
                    <strong className="text-[#E8652D]">Important:</strong> Please read this disclaimer carefully before using our services. By submitting any application or document through Online Wale Bhaiya, you acknowledge and agree to the terms stated below.
                </div>

                {/* Sections */}
                <div className="space-y-6">
                    {SECTIONS.map((section, i) => (
                        <div
                            key={section.id}
                            className="bg-[#111] border border-zinc-800 rounded-2xl p-5 sm:p-7 hover:border-zinc-700 transition-all"
                            style={{ animation: `fadeInUp 0.5s ease-out ${i * 0.06}s both` }}
                        >
                            <div className="flex items-start gap-4">
                                {/* Letter badge */}
                                <span className="shrink-0 w-10 h-10 rounded-xl bg-[#E8652D]/10 border border-[#E8652D]/20 flex items-center justify-center text-[#E8652D] font-extrabold text-sm">
                                    {section.id}
                                </span>
                                <div>
                                    <h2 className="text-lg font-bold text-white mb-3">{section.title}</h2>
                                    <p className="text-zinc-400 leading-relaxed text-sm">{section.content}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer note */}
                <div className="mt-10 text-center">
                    <p className="text-zinc-600 text-sm mb-4">
                        For any queries related to this disclaimer, please contact us.
                    </p>
                    <Link href="/contact"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-[#E8652D] hover:bg-[#FF7A42] text-white font-semibold rounded-xl transition-all duration-300 text-sm">
                        Contact Us →
                    </Link>
                </div>
            </div>
        </div>
    );
}
