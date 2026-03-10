import { NextResponse } from 'next/server';
import { filterService } from '@/lib/services/filterService';
import { checkAdmin } from '@/lib/auth-server';

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const admin = await checkAdmin(request);
        if (!admin) return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
        const { id } = await params;
        await filterService.deleteStream(id);
        return new NextResponse(null, { status: 204 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
