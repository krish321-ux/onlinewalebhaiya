import { NextResponse } from 'next/server';
import { chatbotService } from '@/lib/services/chatbotService';
import { isRateLimited, containsMaliciousPayload, sanitizeText, getClientIp } from '@/lib/security';

export async function POST(request: Request) {
    try {
        // Rate limit: 20 questions per minute per IP
        const ip = getClientIp(request);
        if (isRateLimited(ip, 'chatbot-ask', 20, 60_000)) {
            return NextResponse.json({ error: 'Too many requests. Please slow down.' }, { status: 429 });
        }

        const { question } = await request.json();
        if (!question) return NextResponse.json({ error: 'Question is required' }, { status: 400 });

        // Validate length
        if (typeof question !== 'string' || question.length > 1000) {
            return NextResponse.json({ error: 'Question is too long (max 1000 characters).' }, { status: 400 });
        }

        // Block malicious payloads
        if (containsMaliciousPayload(question)) {
            return NextResponse.json({ error: 'Invalid characters detected in your question.' }, { status: 400 });
        }

        // Sanitize
        const cleanQuestion = sanitizeText(question);
        if (!cleanQuestion) {
            return NextResponse.json({ error: 'Question cannot be empty.' }, { status: 400 });
        }

        const tempSession = `temp-${Date.now()}-${Math.random().toString(36).slice(2)}`;
        const response = await chatbotService.processMessage(tempSession, cleanQuestion);

        return NextResponse.json(response);
    } catch (error: any) {
        return NextResponse.json({ error: error.message || 'Something went wrong' }, { status: 500 });
    }
}
