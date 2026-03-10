import { NextResponse } from 'next/server';
import { chatbotService } from '@/lib/services/chatbotService';
import { isRateLimited, containsMaliciousPayload, sanitizeText, getClientIp } from '@/lib/security';

export async function POST(request: Request) {
    try {
        // Rate limit: 20 messages per minute per IP
        const ip = getClientIp(request);
        if (isRateLimited(ip, 'chatbot-message', 20, 60_000)) {
            return NextResponse.json({ error: 'Too many messages. Please slow down.' }, { status: 429 });
        }

        const { sessionId, message } = await request.json();
        if (!sessionId || !message) {
            return NextResponse.json({ error: 'sessionId and message are required' }, { status: 400 });
        }

        // Validate input lengths
        if (typeof message !== 'string' || message.length > 1000) {
            return NextResponse.json({ error: 'Message is too long (max 1000 characters).' }, { status: 400 });
        }
        if (typeof sessionId !== 'string' || sessionId.length > 100) {
            return NextResponse.json({ error: 'Invalid session.' }, { status: 400 });
        }

        // Block malicious payloads (SQL injection, XSS, SSTI)
        if (containsMaliciousPayload(message)) {
            return NextResponse.json({ error: 'Invalid characters detected in your message.' }, { status: 400 });
        }

        // Sanitize input
        const cleanMessage = sanitizeText(message);
        if (!cleanMessage) {
            return NextResponse.json({ error: 'Message cannot be empty.' }, { status: 400 });
        }

        const response = await chatbotService.processMessage(sessionId, cleanMessage);
        return NextResponse.json(response);
    } catch (error: any) {
        return NextResponse.json({ error: error.message || 'Something went wrong' }, { status: 500 });
    }
}
