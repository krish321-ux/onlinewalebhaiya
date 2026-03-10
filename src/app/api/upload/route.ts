import { NextResponse } from 'next/server';
import { checkAdmin } from '@/lib/auth-server';
import { supabaseAdmin } from '@/lib/db';
import { getSecureUrl } from '@/lib/secureUrl';

// Generic file upload API for admin
export async function POST(request: Request) {
    try {
        const admin = await checkAdmin(request);
        if (!admin) return NextResponse.json({ error: 'Not authorized' }, { status: 401 });

        const formData = await request.formData();
        const file = formData.get('file') as File | null;
        const bucket = (formData.get('bucket') as string) || 'certificates';

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
        const buffer = Buffer.from(await file.arrayBuffer());

        const { error: uploadError } = await supabaseAdmin
            .storage
            .from(bucket)
            .upload(fileName, buffer, { contentType: file.type });

        if (uploadError) throw uploadError;

        const { data: urlData } = supabaseAdmin
            .storage
            .from(bucket)
            .getPublicUrl(fileName);

        const publicUrl = urlData.publicUrl;
        const url = getSecureUrl(publicUrl);

        return NextResponse.json({ url, publicUrl });
    } catch (error: any) {
        console.error('Upload error:', error);
        return NextResponse.json({ error: error.message || 'Upload failed' }, { status: 500 });
    }
}
