import { NextResponse } from 'next/server';
import { conversationService } from '@/lib/services/conversationService';
import { checkAdmin } from '@/lib/auth-server';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const admin = await checkAdmin(request);
        if (!admin) return NextResponse.json({ error: 'Not authorized' }, { status: 401 });

        const { id } = await params;
        const conversation = await conversationService.getById(id);

        if (!conversation) return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });

        return NextResponse.json(conversation);
    } catch (error: any) {
        console.error(error);
        return NextResponse.json({ error: error.message || 'Something went wrong' }, { status: 500 });
    }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const admin = await checkAdmin(request);
        if (!admin) return NextResponse.json({ error: 'Not authorized' }, { status: 401 });

        const { id } = await params;
        await conversationService.delete(id);

        return new NextResponse(null, { status: 204 });
    } catch (error: any) {
        console.error(error);
        return NextResponse.json({ error: error.message || 'Something went wrong' }, { status: 500 });
    }
}
