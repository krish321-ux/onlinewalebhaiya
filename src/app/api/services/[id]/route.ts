import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/db';
import { checkAdmin } from '@/lib/auth-server';

// GET /api/services/[id] — public: get single service with detail content
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const { data, error } = await supabaseAdmin
            .from('services')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        if (!data) return NextResponse.json({ error: 'Service not found' }, { status: 404 });

        return NextResponse.json(data);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// PUT /api/services/[id] — admin: update service (supports JSON or FormData with icon/image uploads)
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const admin = await checkAdmin(request);
        if (!admin) return NextResponse.json({ error: 'Not authorized' }, { status: 401 });

        const { id } = await params;
        const contentType = request.headers.get('content-type') || '';

        let updateData: any = {};

        if (contentType.includes('multipart/form-data')) {
            const formData = await request.formData();

            // Handle icon upload
            const iconFile = formData.get('icon') as File | null;
            if (iconFile && iconFile.size > 0) {
                const iconBuffer = Buffer.from(await iconFile.arrayBuffer());
                const iconExt = iconFile.name.split('.').pop();
                const iconName = `service-icons/${Date.now()}-${Math.round(Math.random() * 1E9)}.${iconExt}`;

                const { error: uploadError } = await supabaseAdmin.storage
                    .from('gallery')
                    .upload(iconName, iconBuffer, { contentType: iconFile.type });
                if (uploadError) throw uploadError;
                updateData.icon_url = supabaseAdmin.storage.from('gallery').getPublicUrl(iconName).data.publicUrl;
            }

            // Handle image upload
            const imageFile = formData.get('image') as File | null;
            if (imageFile && imageFile.size > 0) {
                const imgBuffer = Buffer.from(await imageFile.arrayBuffer());
                const imgExt = imageFile.name.split('.').pop();
                const imgName = `services/${Date.now()}-${Math.round(Math.random() * 1E9)}.${imgExt}`;

                const { error: uploadError } = await supabaseAdmin.storage
                    .from('gallery')
                    .upload(imgName, imgBuffer, { contentType: imageFile.type });
                if (uploadError) throw uploadError;
                updateData.image_url = supabaseAdmin.storage.from('gallery').getPublicUrl(imgName).data.publicUrl;
            }

            // Copy other text fields
            for (const [key, val] of formData.entries()) {
                if (key !== 'icon' && key !== 'image') {
                    updateData[key] = val;
                }
            }
        } else {
            updateData = await request.json();
        }

        const { data, error } = await supabaseAdmin
            .from('services')
            .update(updateData)
            .eq('id', id)
            .select();

        if (error) throw error;
        return NextResponse.json(data?.[0]);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// DELETE /api/services/[id] — admin: delete service + cleanup storage
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const admin = await checkAdmin(request);
        if (!admin) return NextResponse.json({ error: 'Not authorized' }, { status: 401 });

        const { id } = await params;

        const { data: svc } = await supabaseAdmin
            .from('services')
            .select('image_url, icon_url')
            .eq('id', id)
            .single();

        if (svc?.image_url) {
            const parts = svc.image_url.split('/');
            const fileName = `services/${parts[parts.length - 1]}`;
            await supabaseAdmin.storage.from('gallery').remove([fileName]);
        }
        if (svc?.icon_url) {
            const parts = svc.icon_url.split('/');
            const iconFileName = `service-icons/${parts[parts.length - 1]}`;
            await supabaseAdmin.storage.from('gallery').remove([iconFileName]);
        }

        const { error } = await supabaseAdmin.from('services').delete().eq('id', id);
        if (error) throw error;

        return new NextResponse(null, { status: 204 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
