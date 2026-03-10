import { NextResponse } from 'next/server';
import { serviceRequestService } from '@/lib/services/serviceRequestService';
import { isRateLimited, containsMaliciousPayload, getClientIp } from '@/lib/security';

export async function GET(request: Request, { params }: { params: Promise<{ caseId: string }> }) {
    try {
        // Rate limit: 15 lookups per minute per IP
        const ip = getClientIp(request);
        if (isRateLimited(ip, 'case-lookup', 15, 60_000)) {
            return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 });
        }

        const { caseId } = await params;

        // Validate case ID format (CASE-XXXXXX-XXX)
        if (!caseId || typeof caseId !== 'string' || caseId.length > 30) {
            return NextResponse.json({ error: 'Invalid case ID.' }, { status: 400 });
        }
        if (containsMaliciousPayload(caseId)) {
            return NextResponse.json({ error: 'Invalid case ID.' }, { status: 400 });
        }

        const status = await serviceRequestService.getStatusByCaseId(caseId);
        if (!status) return NextResponse.json({ error: 'Case ID not found' }, { status: 404 });
        return NextResponse.json(status);
    } catch (error: any) {
        return NextResponse.json({ error: error.message || 'Something went wrong' }, { status: 500 });
    }
}
