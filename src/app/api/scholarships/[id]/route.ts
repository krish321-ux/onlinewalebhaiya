import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/db';
import { checkAdmin } from '@/lib/auth-server';

// GET /api/scholarships/[id]
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const { data, error } = await supabaseAdmin
            .from('scholarships')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        if (!data) return NextResponse.json({ error: 'Scholarship not found' }, { status: 404 });

        return NextResponse.json(data);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// PUT /api/scholarships/[id]
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const admin = await checkAdmin(request);
        if (!admin) return NextResponse.json({ error: 'Not authorized' }, { status: 401 });

        const { id } = await params;

        // Support both JSON and FormData
        const contentType = request.headers.get('content-type') || '';
        let updateData: Record<string, any>;

        if (contentType.includes('multipart/form-data')) {
            const formData = await request.formData();
            updateData = {};
            for (const [key, value] of formData.entries()) {
                if (key === 'notification_pdf' && value instanceof File) {
                    const file = value as File;
                    const fileName = `${Date.now()}-${file.name}`;
                    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
                        .from('notifications')
                        .upload(fileName, file, { contentType: file.type, upsert: true });

                    if (uploadError) throw uploadError;

                    const { data: urlData } = supabaseAdmin.storage
                        .from('notifications')
                        .getPublicUrl(fileName);

                    updateData.notification_url = urlData.publicUrl;
                } else {
                    const strVal = value as string;
                    if (key === 'is_active') {
                        updateData[key] = strVal === 'true';
                    } else {
                        updateData[key] = strVal || null;
                    }
                }
            }
        } else {
            updateData = await request.json();
        }

        const { data, error } = await supabaseAdmin
            .from('scholarships')
            .update(updateData)
            .eq('id', id)
            .select();

        if (error) throw error;
        return NextResponse.json(data[0]);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// DELETE /api/scholarships/[id]
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const admin = await checkAdmin(request);
        if (!admin) return NextResponse.json({ error: 'Not authorized' }, { status: 401 });

        const { id } = await params;
        const { error } = await supabaseAdmin
            .from('scholarships')
            .delete()
            .eq('id', id);

        if (error) throw error;
        return new NextResponse(null, { status: 204 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
