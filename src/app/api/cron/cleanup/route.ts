import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET || 'secret'}`) {
        return new NextResponse('Unauthorized', { status: 401 });
    }

    try {
        const FILE_EXPIRY_MINUTES = 60;
        const now = new Date().toISOString();

        // 1. Clean up expired service_requests documents
        const { data: expiredRequests } = await supabaseAdmin
            .from('service_requests')
            .select('id, document_url')
            .not('document_url', 'is', null)
            .lt('document_expires_at', now);

        if (expiredRequests && expiredRequests.length > 0) {
            for (const req of expiredRequests) {
                try {
                    const url = req.document_url;
                    const parts = url.split('/');
                    const fileName = parts[parts.length - 1];

                    if (fileName) {
                        await supabaseAdmin.storage.from('documents').remove([fileName]);
                    }

                    await supabaseAdmin
                        .from('service_requests')
                        .update({ document_url: null, document_expires_at: null })
                        .eq('id', req.id);
                } catch (e) {
                    console.error('Error cleaning up request', e);
                }
            }
        }

        // 2. Clean up expired chat upload files
        const expiryThreshold = new Date(Date.now() - FILE_EXPIRY_MINUTES * 60 * 1000).toISOString();
        const { data: expiredFiles } = await supabaseAdmin
            .from('files')
            .select('id, file_url')
            .lt('uploaded_at', expiryThreshold);

        if (expiredFiles && expiredFiles.length > 0) {
            for (const file of expiredFiles) {
                try {
                    const url = file.file_url;
                    const parts = url.split('/');
                    const fileName = parts[parts.length - 1];

                    if (fileName) {
                        await supabaseAdmin.storage.from('chat-uploads').remove([fileName]);
                    }

                    await supabaseAdmin.from('files').delete().eq('id', file.id);
                } catch (e) {
                    console.error('Error cleaning up chat file', e);
                }
            }
        }

        return NextResponse.json({ success: true, message: 'Cleanup complete' });
    } catch (error: any) {
        console.error('Cron cleanup error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
