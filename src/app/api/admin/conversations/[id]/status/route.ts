import { NextResponse } from 'next/server';
import { conversationService } from '@/lib/services/conversationService';
import { checkAdmin } from '@/lib/auth-server';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const admin = await checkAdmin(request);
        if (!admin) return NextResponse.json({ error: 'Not authorized' }, { status: 401 });

        const { id } = await params;
        const { status } = await request.json();

        if (!['NEW', 'CONTACTED', 'COMPLETED'].includes(status)) {
            return NextResponse.json({ error: 'Invalid status. Must be NEW, CONTACTED, or COMPLETED.' }, { status: 400 });
        }

        const updated = await conversationService.updateStatus(id, status);
        return NextResponse.json(updated);
    } catch (error: any) {
        console.error(error);
        return NextResponse.json({ error: error.message || 'Something went wrong' }, { status: 500 });
    }
}
