import { NextResponse } from 'next/server';
import { supabase, supabaseAdmin } from '@/lib/db';
import { checkAdmin } from '@/lib/auth-server';

// GET /api/site-content?key=about_us
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const key = searchParams.get('key');
        if (!key) return NextResponse.json({ error: 'key parameter is required' }, { status: 400 });

        const { data, error } = await supabase
            .from('site_content')
            .select('*')
            .eq('key', key)
            .single();

        if (error && error.code !== 'PGRST116') throw error;
        return NextResponse.json(data || { key, content: '', updated_at: null });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// PUT /api/site-content — upsert content
export async function PUT(request: Request) {
    try {
        const admin = await checkAdmin(request);
        if (!admin) return NextResponse.json({ error: 'Not authorized' }, { status: 401 });

        const { key, content } = await request.json();
        if (!key || content === undefined) {
            return NextResponse.json({ error: 'key and content are required' }, { status: 400 });
        }

        const { data, error } = await supabaseAdmin
            .from('site_content')
            .upsert(
                { key, content, updated_at: new Date().toISOString() },
                { onConflict: 'key' }
            )
            .select()
            .single();

        if (error) throw error;
        return NextResponse.json(data);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
