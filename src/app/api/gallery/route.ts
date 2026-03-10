import { NextResponse } from 'next/server';
import { galleryService } from '@/lib/services/galleryService';
import { checkAdmin } from '@/lib/auth-server';
import { supabaseAdmin } from '@/lib/db';

export async function GET() {
    try {
        const images = await galleryService.getActiveImages();
        return NextResponse.json(images);
    } catch (error: any) {
        console.error(error);
        return NextResponse.json({ error: error.message || 'Something went wrong' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const admin = await checkAdmin(request);
        if (!admin) return NextResponse.json({ error: 'Not authorized' }, { status: 401 });

        const formData = await request.formData();
        const file = formData.get('image') as File;
        const title = formData.get('title') as string || '';
        const sortOrder = parseInt((formData.get('sort_order') as string) || '0', 10);

        if (!file) return NextResponse.json({ error: 'No image provided' }, { status: 400 });

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.round(Math.random() * 1E9)}.${fileExt}`;

        const { error: uploadError } = await supabaseAdmin.storage
            .from('gallery')
            .upload(fileName, buffer, { contentType: file.type });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabaseAdmin.storage.from('gallery').getPublicUrl(fileName);

        const newImage = await galleryService.addImage(publicUrl, title, sortOrder);
        return NextResponse.json(newImage, { status: 201 });
    } catch (error: any) {
        console.error(error);
        return NextResponse.json({ error: error.message || 'Upload failed' }, { status: 500 });
    }
}
