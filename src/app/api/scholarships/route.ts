import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/db';
import { checkAdmin } from '@/lib/auth-server';

// GET /api/scholarships
export async function GET(request: Request) {
    try {
        const url = new URL(request.url);
        const isAdminRequest = url.searchParams.get('admin') === 'true';

        if (isAdminRequest) {
            const admin = await checkAdmin(request);
            if (!admin) return NextResponse.json({ error: 'Not authorized' }, { status: 401 });

            const { data, error } = await supabaseAdmin
                .from('scholarships')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            return NextResponse.json(data || []);
        } else {
            // Public request — supports pagination and filters
            const limit = parseInt(url.searchParams.get('limit') || '20');
            const offset = parseInt(url.searchParams.get('offset') || '0');
            const stateFilter = url.searchParams.get('state');
            const qualFilter = url.searchParams.get('qualification');

            let query = supabaseAdmin
                .from('scholarships')
                .select('id, title, organization, amount, eligibility, apply_start_date, last_date, notification_url, apply_link, state, qualification', { count: 'exact' })
                .eq('is_active', true);

            if (stateFilter) query = query.eq('state', stateFilter);
            if (qualFilter) query = query.ilike('qualification', `%${qualFilter}%`);

            query = query.order('created_at', { ascending: false }).range(offset, offset + limit - 1);

            const { data, error, count } = await query;

            if (error) throw error;
            return NextResponse.json({ data: data || [], total: count || 0 });
        }
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST /api/scholarships
export async function POST(request: Request) {
    try {
        const admin = await checkAdmin(request);
        if (!admin) return NextResponse.json({ error: 'Not authorized' }, { status: 401 });

        // Support both JSON and FormData
        const contentType = request.headers.get('content-type') || '';
        let body: Record<string, any>;

        if (contentType.includes('multipart/form-data')) {
            const formData = await request.formData();
            body = {};
            for (const [key, value] of formData.entries()) {
                if (key === 'notification_pdf' && value instanceof File) {
                    const file = value as File;
                    const fileName = `${Date.now()}-${file.name}`;
                    const { error: uploadError } = await supabaseAdmin.storage
                        .from('notifications')
                        .upload(fileName, file, { contentType: file.type, upsert: true });

                    if (uploadError) throw uploadError;

                    const { data: urlData } = supabaseAdmin.storage
                        .from('notifications')
                        .getPublicUrl(fileName);

                    body.notification_url = urlData.publicUrl;
                } else {
                    const strVal = value as string;
                    if (key === 'is_active') {
                        body[key] = strVal === 'true';
                    } else {
                        body[key] = strVal || null;
                    }
                }
            }
        } else {
            body = await request.json();
        }

        const { data, error } = await supabaseAdmin
            .from('scholarships')
            .insert([body])
            .select();

        if (error) throw error;
        return NextResponse.json(data[0], { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
