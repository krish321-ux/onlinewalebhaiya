import { NextResponse } from 'next/server';
import { chatbotService } from '@/lib/services/chatbotService';
import { supabaseAdmin } from '@/lib/db';

export async function POST(request: Request) {
    try {
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

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const fileExt = file.name.split('.').pop();
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

        // Auto-delete the file from storage AND database after 60 seconds
        setTimeout(async () => {
            try {
                // Delete from Supabase storage
                await supabaseAdmin.storage.from('chat-uploads').remove([fileName]);
                // Delete from files database table
                await supabaseAdmin.from('files').delete().eq('file_url', publicUrl);
                console.log(`[Auto-Delete] Removed chatbot upload from storage and database: ${fileName}`);
            } catch (err) {
                console.error(`[Auto-Delete] Failed to remove ${fileName}:`, err);
            }
        }, 60_000);

        return NextResponse.json({ ...result, autoDeleteSeconds: 60 });
    } catch (error: any) {
        console.error(error);
        return NextResponse.json({ error: error.message || 'Upload failed' }, { status: 500 });
    }
}
