import { NextResponse } from 'next/server';
import { checkAdmin } from '@/lib/auth-server';
import { conversationService } from '@/lib/services/conversationService';
import { supabaseAdmin } from '@/lib/db';
import { getSecureUrl } from '@/lib/secureUrl';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const admin = await checkAdmin(request);
        if (!admin) return NextResponse.json({ error: 'Not authorized' }, { status: 401 });

        const { id } = await params;
        const contentType = request.headers.get('content-type') || '';

        // File upload via FormData
        if (contentType.includes('multipart/form-data')) {
            const formData = await request.formData();
            const file = formData.get('file') as File | null;
            const textMessage = formData.get('message') as string | null;

            if (!file) {
                return NextResponse.json({ error: 'No file provided' }, { status: 400 });
            }

            // Upload to Supabase Storage
            const fileName = `admin-${Date.now()}-${file.name}`;
            const buffer = Buffer.from(await file.arrayBuffer());

            const { data: uploadData, error: uploadError } = await supabaseAdmin
                .storage
                .from('chat-uploads')
                .upload(fileName, buffer, { contentType: file.type });

            if (uploadError) throw uploadError;

            const { data: urlData } = supabaseAdmin
                .storage
                .from('chat-uploads')
                .getPublicUrl(fileName);

            const fileUrl = urlData.publicUrl;
            const secureFileUrl = getSecureUrl(fileUrl);

            // Save file record
            await conversationService.addFile(id, fileUrl, file.type);

            // Add message about the file with secure URL so chatbot widget can render it
            const fileLabel = file.type.startsWith('image/') ? '📷 Image' :
                file.type.startsWith('video/') ? '🎥 Video' :
                    '📎 Document';
            await conversationService.addMessage(id, 'admin', `${fileLabel}: ${file.name}\n[file_url]${secureFileUrl}[/file_url][file_type]${file.type}[/file_type]`);

            // Also add text message if provided
            if (textMessage?.trim()) {
                await conversationService.addMessage(id, 'admin', textMessage.trim());
            }

            return NextResponse.json({ success: true, fileUrl });
        }

        // Text-only reply via JSON
        const { message } = await request.json();
        if (!message?.trim()) {
            return NextResponse.json({ error: 'Message is required' }, { status: 400 });
        }

        await conversationService.addMessage(id, 'admin', message.trim());
        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Admin reply error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
