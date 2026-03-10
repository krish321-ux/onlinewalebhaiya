import { NextResponse } from 'next/server';
import { chatbotService } from '@/lib/services/chatbotService';

export async function POST(request: Request) {
    try {
        const { question } = await request.json();
        if (!question) return NextResponse.json({ error: 'Question is required' }, { status: 400 });

        const tempSession = `temp-${Date.now()}-${Math.random().toString(36).slice(2)}`;
        const response = await chatbotService.processMessage(tempSession, question);

        return NextResponse.json(response);
    } catch (error: any) {
        return NextResponse.json({ error: error.message || 'Something went wrong' }, { status: 500 });
    }
}
