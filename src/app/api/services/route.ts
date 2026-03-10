import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/db';
import { checkAdmin } from '@/lib/auth-server';

// GET /api/services — public: list active services, admin: list all
export async function GET(request: Request) {
    try {
        const url = new URL(request.url);
        const isAdminRequest = url.searchParams.get('admin') === 'true';

        if (isAdminRequest) {
            // Admin needs to see all services (including inactive) and all fields (including detail_content)
            const admin = await checkAdmin(request);
            if (!admin) return NextResponse.json({ error: 'Not authorized' }, { status: 401 });

            const { data, error } = await supabaseAdmin
                .from('services')
                .select('*')
                .order('sort_order', { ascending: true });

            if (error) throw error;
            return NextResponse.json(data || []);
        } else {
            // Public only sees active services and doesn't need heavy detail_content
            const { data, error } = await supabaseAdmin
                .from('services')
                .select('id, title, description, image_url, icon_url, sort_order')
                .eq('is_active', true)
                .order('sort_order', { ascending: true });

            if (error) throw error;
            return NextResponse.json(data || []);
        }
    } catch (error: any) {
        console.error(error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST /api/services — admin: create service with image upload
export async function POST(request: Request) {
    try {
        const admin = await checkAdmin(request);
        if (!admin) return NextResponse.json({ error: 'Not authorized' }, { status: 401 });

        const formData = await request.formData();
        const file = formData.get('image') as File | null;
        const iconFile = formData.get('icon') as File | null;
        const title = formData.get('title') as string || '';
        const description = formData.get('description') as string || '';
        const sortOrder = parseInt((formData.get('sort_order') as string) || '0', 10);

        if (!title) return NextResponse.json({ error: 'Title is required' }, { status: 400 });
        if (!file && !iconFile) return NextResponse.json({ error: 'At least an image or icon is required' }, { status: 400 });

        let imagePublicUrl = '';
        let iconPublicUrl = '';

        // Upload main image (for detail page hero)
        if (file && file.size > 0) {
            const arrayBuffer = await file.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            const fileExt = file.name.split('.').pop();
            const fileName = `services/${Date.now()}-${Math.round(Math.random() * 1E9)}.${fileExt}`;

            const { error: uploadError } = await supabaseAdmin.storage
                .from('gallery')
                .upload(fileName, buffer, { contentType: file.type });
            if (uploadError) throw uploadError;
            imagePublicUrl = supabaseAdmin.storage.from('gallery').getPublicUrl(fileName).data.publicUrl;
        }

        // Upload icon (for service card)
        if (iconFile && iconFile.size > 0) {
            const iconBuffer = Buffer.from(await iconFile.arrayBuffer());
            const iconExt = iconFile.name.split('.').pop();
            const iconName = `service-icons/${Date.now()}-${Math.round(Math.random() * 1E9)}.${iconExt}`;

            const { error: iconUploadError } = await supabaseAdmin.storage
                .from('gallery')
                .upload(iconName, iconBuffer, { contentType: iconFile.type });
            if (iconUploadError) throw iconUploadError;
            iconPublicUrl = supabaseAdmin.storage.from('gallery').getPublicUrl(iconName).data.publicUrl;
        }

        // Insert record
        const insertData: any = { title, description, sort_order: sortOrder };
        if (imagePublicUrl) insertData.image_url = imagePublicUrl;
        if (iconPublicUrl) insertData.icon_url = iconPublicUrl;

        const { data, error } = await supabaseAdmin
            .from('services')
            .insert([insertData])
            .select();

        if (error) throw error;
        return NextResponse.json(data[0], { status: 201 });
    } catch (error: any) {
        console.error(error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
