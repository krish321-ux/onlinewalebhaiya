import { NextResponse } from 'next/server';
import { supabase } from '@/lib/db';

// Public endpoint: chatbot widget polls for new admin messages
// GET /api/chatbot/messages/[conversationId]?after=<timestamp>
export async function GET(request: Request, { params }: { params: Promise<{ conversationId: string }> }) {
    try {
        const { conversationId } = await params;
        const { searchParams } = new URL(request.url);
        const after = searchParams.get('after');

        let query = supabase
            .from('messages')
            .select('id, sender, message, timestamp')
            .eq('conversation_id', conversationId)
            .eq('sender', 'admin')
            .order('timestamp', { ascending: true });

        if (after) {
            query = query.gt('timestamp', after);
        }

        const { data, error } = await query;
        if (error) throw error;

        return NextResponse.json(data || []);
    } catch (error: any) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
