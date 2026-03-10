import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/db';
import { checkAdmin } from '@/lib/auth-server';

// GET /api/jobs
export async function GET(request: Request) {
    try {
        const url = new URL(request.url);
        const isAdminRequest = url.searchParams.get('admin') === 'true';

        if (isAdminRequest) {
            const admin = await checkAdmin(request);
            if (!admin) return NextResponse.json({ error: 'Not authorized' }, { status: 401 });

            const { data, error } = await supabaseAdmin
                .from('jobs')
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
            const categoryFilter = url.searchParams.get('category');

            let query = supabaseAdmin
                .from('jobs')
                .select('id, title, department, qualification, no_of_vacancy, apply_start_date, last_date, notification_url, apply_link, job_type, state, category, advt_no, post_date', { count: 'exact' })
                .eq('is_active', true);

            if (stateFilter) {
                const states = stateFilter.split(',').map(s => s.trim()).filter(Boolean);
                if (states.length === 1) {
                    query = query.eq('state', states[0]);
                } else if (states.length > 1) {
                    query = query.in('state', states);
                }
            }
            if (qualFilter) query = query.ilike('qualification', `%${qualFilter}%`);
            if (categoryFilter) query = query.ilike('category', `%${categoryFilter}%`);

            query = query.order('created_at', { ascending: false }).range(offset, offset + limit - 1);

            const { data, error, count } = await query;

            if (error) throw error;
            return NextResponse.json({ data: data || [], total: count || 0 });
        }
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST /api/jobs
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
                    } else if (key === 'no_of_vacancy') {
                        body[key] = strVal ? parseInt(strVal) : null;
                    } else {
                        body[key] = strVal || null;
                    }
                }
            }
        } else {
            body = await request.json();
        }

        const { data, error } = await supabaseAdmin
            .from('jobs')
            .insert([body])
            .select();

        if (error) throw error;
        return NextResponse.json(data[0], { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
