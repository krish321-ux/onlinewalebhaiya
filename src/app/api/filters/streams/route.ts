import { NextResponse } from 'next/server';
import { filterService } from '@/lib/services/filterService';
import { checkAdmin } from '@/lib/auth-server';

export async function GET() {
    try {
        const streams = await filterService.getStreams();
        return NextResponse.json(streams);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const admin = await checkAdmin(request);
        if (!admin) return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
        const { name } = await request.json();
        const stream = await filterService.addStream(name);
        return NextResponse.json(stream, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
