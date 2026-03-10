import { NextResponse } from 'next/server';
import { chatbotService } from '@/lib/services/chatbotService';
import { whatsappNotification } from '@/lib/services/whatsappNotificationService';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const mode = searchParams.get('hub.mode');
    const token = searchParams.get('hub.verify_token');
    const challenge = searchParams.get('hub.challenge');

    if (mode && token) {
        if (mode === 'subscribe' && token === (process.env.WHATSAPP_VERIFY_TOKEN || process.env.VERIFY_TOKEN || 'my_test_token')) {
            console.log('WEBHOOK_VERIFIED');
            return new NextResponse(challenge, { status: 200 });
        } else {
            return new NextResponse('Forbidden', { status: 403 });
        }
    }
    return new NextResponse('Bad Request', { status: 400 });
}

export async function POST(request: Request) {
    try {
        const body = await request.json();

        if (body.object) {
            if (body.entry && body.entry[0].changes && body.entry[0].changes[0].value.messages && body.entry[0].changes[0].value.messages[0]) {
                const from = body.entry[0].changes[0].value.messages[0].from;
                const msg_body = body.entry[0].changes[0].value.messages[0].text?.body;

                if (!msg_body) {
                    return new NextResponse('OK', { status: 200 });
                }

                console.log(`Message from ${from}: ${msg_body}`);

                try {
                    const response = await chatbotService.processMessage(from, msg_body);
                    await whatsappNotification.sendMessage(from, response.answer);
                } catch (error) {
                    console.error("Error processing WhatsApp message:", error);
                }
            }
            return new NextResponse('OK', { status: 200 });
        }
        return new NextResponse('Not Found', { status: 404 });
    } catch (error) {
        return new NextResponse('Error', { status: 500 });
    }
}
