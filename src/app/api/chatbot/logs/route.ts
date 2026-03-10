import { NextResponse } from 'next/server';
import { chatbotService } from '@/lib/services/chatbotService';
import { checkAdmin } from '@/lib/auth-server';

export async function GET(request: Request) {
    try {
        const admin = await checkAdmin(request);
        if (!admin) return NextResponse.json({ error: 'Not authorized' }, { status: 401 });

        const logs = await chatbotService.getChatLogs();
        return NextResponse.json(logs);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
