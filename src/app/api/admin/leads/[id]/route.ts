import { NextResponse } from 'next/server';
import { serviceRequestService } from '@/lib/services/serviceRequestService';
import { checkAdmin } from '@/lib/auth-server';

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const admin = await checkAdmin(request);
        if (!admin) return NextResponse.json({ error: 'Not authorized' }, { status: 401 });

        const { id } = await params;
        await serviceRequestService.deleteRequest(id);

        return new NextResponse(null, { status: 204 });
    } catch (error: any) {
        console.error(error);
        return NextResponse.json({ error: error.message || 'Something went wrong' }, { status: 500 });
    }
}
