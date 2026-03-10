import { NextResponse } from 'next/server';
import { chatbotService } from '@/lib/services/chatbotService';
import { supabaseAdmin } from '@/lib/db';
import { isRateLimited, getClientIp } from '@/lib/security';

const ALLOWED_FILE_TYPES = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export async function POST(request: Request) {
    try {
        // Rate limit: 10 uploads per minute per IP
        const ip = getClientIp(request);
        if (isRateLimited(ip, 'chatbot-upload', 10, 60_000)) {
            return NextResponse.json({ error: 'Too many uploads. Please slow down.' }, { status: 429 });
        }

        const formData = await request.formData();
        const sessionId = formData.get('sessionId') as string;
        const file = formData.get('file') as File;
        const conversationId = formData.get('conversationId') as string | null;

        if (!sessionId) {
            return NextResponse.json({ error: 'sessionId is required' }, { status: 400 });
        }
        if (!file || file.size === 0) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        // Validate file size
        if (file.size > MAX_FILE_SIZE) {
            return NextResponse.json({ error: 'File size must be under 5MB.' }, { status: 400 });
        }

        // Validate file type
        if (!ALLOWED_FILE_TYPES.includes(file.type)) {
            return NextResponse.json({ error: 'Only PDF and image files (JPG, PNG, WebP) are allowed.' }, { status: 400 });
        }

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const fileExt = file.name.split('.').pop()?.toLowerCase();
        const fileName = `${Date.now()}-${Math.round(Math.random() * 1E9)}.${fileExt}`;

        const { error: uploadError } = await supabaseAdmin.storage
            .from('chat-uploads')
            .upload(fileName, buffer, { contentType: file.type });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabaseAdmin.storage.from('chat-uploads').getPublicUrl(fileName);

        const result = await chatbotService.handleFileUpload(sessionId, publicUrl, file.type, conversationId);
        console.log(`[Upload Debug] sessionId=${sessionId}, result=`, JSON.stringify(result));

        if (result.skipAutoDelete) {
            // No conversation — delete the orphaned file immediately
            supabaseAdmin.storage.from('chat-uploads').remove([fileName]).catch(() => { });
            return NextResponse.json(result);
        }

        // Auto-delete the file from storage AND database after 30 seconds
        setTimeout(async () => {
            try {
                await supabaseAdmin.storage.from('chat-uploads').remove([fileName]);
                await supabaseAdmin.from('files').delete().eq('file_url', publicUrl);
                console.log(`[Auto-Delete] Removed chatbot upload from storage and database: ${fileName}`);
            } catch (err) {
                console.error(`[Auto-Delete] Failed to remove ${fileName}:`, err);
            }
        }, 30_000);

        return NextResponse.json({ ...result, autoDeleteSeconds: 30 });
    } catch (error: any) {
        console.error(error);
        return NextResponse.json({ error: error.message || 'Upload failed' }, { status: 500 });
    }
}
