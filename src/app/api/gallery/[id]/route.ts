import { NextResponse } from 'next/server';
import { galleryService } from '@/lib/services/galleryService';
import { checkAdmin } from '@/lib/auth-server';
import { supabaseAdmin } from '@/lib/db';

// GET /api/gallery/[id] — public: get single image with detail content
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const { data, error } = await supabaseAdmin
            .from('gallery_images')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            console.error('Gallery GET error:', error);
            throw error;
        }
        if (!data) return NextResponse.json({ error: 'Image not found' }, { status: 404 });

        return NextResponse.json(data);
    } catch (error: any) {
        console.error('Gallery detail error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const admin = await checkAdmin(request);
        if (!admin) return NextResponse.json({ error: 'Not authorized' }, { status: 401 });

        const { id } = await params;
        const body = await request.json();
        const updatedImage = await galleryService.updateImage(id, body);
        return NextResponse.json(updatedImage);
    } catch (error: any) {
        console.error(error);
        return NextResponse.json({ error: error.message || 'Something went wrong' }, { status: 500 });
    }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const admin = await checkAdmin(request);
        if (!admin) return NextResponse.json({ error: 'Not authorized' }, { status: 401 });

        const { id } = await params;
        await galleryService.deleteImage(id);
        return new NextResponse(null, { status: 204 });
    } catch (error: any) {
        console.error(error);
        return NextResponse.json({ error: error.message || 'Something went wrong' }, { status: 500 });
    }
}
