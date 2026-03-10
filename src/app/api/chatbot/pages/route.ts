import { NextResponse } from 'next/server';
import { chatbotService } from '@/lib/services/chatbotService';
import { checkAdmin } from '@/lib/auth-server';

export async function GET() {
    try {
        const pages = await chatbotService.getAllPages();
        return NextResponse.json(pages);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const admin = await checkAdmin(request);
        if (!admin) return NextResponse.json({ error: 'Not authorized' }, { status: 401 });

        const { title, content, keywords } = await request.json();
        if (!title || !content) {
            return NextResponse.json({ error: 'Title and content are required' }, { status: 400 });
        }

        const newPage = await chatbotService.addPage(title, content, keywords || []);
        return NextResponse.json(newPage, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
