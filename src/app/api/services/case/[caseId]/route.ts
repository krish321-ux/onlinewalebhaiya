import { NextResponse } from 'next/server';
import { serviceRequestService } from '@/lib/services/serviceRequestService';

export async function GET(request: Request, { params }: { params: Promise<{ caseId: string }> }) {
    try {
        const { caseId } = await params;
        const status = await serviceRequestService.getStatusByCaseId(caseId);
        if (!status) return NextResponse.json({ error: 'Case ID not found' }, { status: 404 });
        return NextResponse.json(status);
    } catch (error: any) {
        return NextResponse.json({ error: error.message || 'Something went wrong' }, { status: 500 });
    }
}
