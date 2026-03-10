import { NextResponse } from 'next/server';
import { serviceRequestService } from '@/lib/services/serviceRequestService';
import { checkAdmin } from '@/lib/auth-server';

export async function GET(request: Request) {
    try {
        const admin = await checkAdmin(request);
        if (!admin) return NextResponse.json({ error: 'Not authorized' }, { status: 401 });

        const leads = await serviceRequestService.getLeads();
        return NextResponse.json(leads);
    } catch (error: any) {
        console.error(error);
        return NextResponse.json({ error: error.message || 'Something went wrong' }, { status: 500 });
    }
}
