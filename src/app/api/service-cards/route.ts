import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/db';
import { checkAdmin } from '@/lib/auth-server';

export async function GET() {
    try {
        const { data, error } = await supabaseAdmin
            .from('service_cards')
            .select('*')
            .eq('is_active', true)
            .order('sort_order', { ascending: true });

        if (error) throw error;
        return NextResponse.json(data);
    } catch (error: any) {
        console.error(error);
        return NextResponse.json({ error: error.message || 'Something went wrong' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const admin = await checkAdmin(request);
        if (!admin) return NextResponse.json({ error: 'Not authorized' }, { status: 401 });

        const body = await request.json();
        const { data, error } = await supabaseAdmin
            .from('service_cards')
            .insert([body])
            .select();

        if (error) throw error;
        return NextResponse.json(data[0], { status: 201 });
    } catch (error: any) {
        console.error(error);
        return NextResponse.json({ error: error.message || 'Something went wrong' }, { status: 500 });
    }
}
