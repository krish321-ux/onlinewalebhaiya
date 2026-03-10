import { NextResponse } from 'next/server';
import { serviceRequestService } from '@/lib/services/serviceRequestService';
import { whatsappNotification } from '@/lib/services/whatsappNotificationService';
import { supabaseAdmin } from '@/lib/db';

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const requestData: any = {
            name: formData.get('name') as string,
            phone: formData.get('phone') as string,
            state: (formData.get('state') as string) || 'Not Specified',
            service_type: (formData.get('service_type') || formData.get('serviceType') || 'General Inquiry') as string,
            message: (formData.get('message') as string) || '',
        };

        const file = formData.get('document') as File;
        if (file && file.size > 0) {
            const arrayBuffer = await file.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            const fileExt = file.name.split('.').pop();
            const fileName = `${Date.now()}-${Math.round(Math.random() * 1E9)}.${fileExt}`;

            const { error: uploadError } = await supabaseAdmin.storage
                .from('chat-uploads')
                .upload(fileName, buffer, { contentType: file.type });

            if (!uploadError) {
                const { data: { publicUrl } } = supabaseAdmin.storage.from('chat-uploads').getPublicUrl(fileName);
                requestData.document_url = publicUrl;
            }
        }

        const newRequest = await serviceRequestService.createRequest(requestData);

        whatsappNotification.sendNewServiceRequestNotification(
            newRequest.name,
            newRequest.phone,
            newRequest.service_type,
            newRequest.state,
            newRequest.case_id
        ).catch(err => console.error('WhatsApp service request notification failed:', err));

        return NextResponse.json(newRequest, { status: 201 });
    } catch (error: any) {
        console.error(error);
        return NextResponse.json({ error: error.message || 'Something went wrong' }, { status: 500 });
    }
}
