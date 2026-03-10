import { NextResponse } from 'next/server';
import { chatbotService } from '@/lib/services/chatbotService';

export async function POST(request: Request) {
    try {
        const { sessionId, message } = await request.json();
        if (!sessionId || !message) {
            return NextResponse.json({ error: 'sessionId and message are required' }, { status: 400 });
        }

        const response = await chatbotService.processMessage(sessionId, message);
        return NextResponse.json(response);
    } catch (error: any) {
        return NextResponse.json({ error: error.message || 'Something went wrong' }, { status: 500 });
    }
}
