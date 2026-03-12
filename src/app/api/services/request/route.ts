import { NextResponse } from 'next/server';
import { serviceRequestService } from '@/lib/services/serviceRequestService';
import { whatsappNotification } from '@/lib/services/whatsappNotificationService';
import { emailNotification } from '@/lib/services/emailNotificationService';
import { supabaseAdmin } from '@/lib/db';

// ── Rate Limiting (in-memory, per IP) ──
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_MAX = 5;       // max requests per window
const RATE_LIMIT_WINDOW = 10 * 60 * 1000; // 10 minutes

function isRateLimited(ip: string): boolean {
    const now = Date.now();
    const entry = rateLimitMap.get(ip);
    if (!entry || now > entry.resetAt) {
        rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
        return false;
    }
    entry.count++;
    return entry.count > RATE_LIMIT_MAX;
}

// Cleanup stale entries every 15 min
setInterval(() => {
    const now = Date.now();
    for (const [ip, entry] of rateLimitMap.entries()) {
        if (now > entry.resetAt) rateLimitMap.delete(ip);
    }
}, 15 * 60 * 1000);

// ── Validation helpers ──
const SQL_INJECTION_PATTERN = /(\b(UNION|SELECT|INSERT|UPDATE|DELETE|DROP|ALTER|CREATE|EXEC|EXECUTE|TRUNCATE)\b|--|;.*$|\/\*|\*\/|xp_|0x[0-9a-f]{2})/i;
const XSS_PATTERN = /<script[\s>]|javascript:|on\w+\s*=|<iframe|<object|<embed|<form|<svg.*on/i;
const ALLOWED_FILE_TYPES = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

function stripHtmlTags(str: string): string {
    return str.replace(/<[^>]*>/g, '').trim();
}

function sanitizeInput(str: string): string {
    return stripHtmlTags(str).substring(0, 2000);
}

function isValidPhone(phone: string): boolean {
    return /^\d{10}$/.test(phone.replace(/[\s\-\+\(\)]/g, '').replace(/^91/, ''));
}

export async function POST(request: Request) {
    try {
        // Rate limit check
        const forwarded = request.headers.get('x-forwarded-for');
        const ip = forwarded?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || 'unknown';
        if (isRateLimited(ip)) {
            return NextResponse.json(
                { error: 'Too many requests. Please try again later.' },
                { status: 429 }
            );
        }

        const formData = await request.formData();

        // Honeypot field — bots fill this hidden field, real users don't
        const honeypot = formData.get('website') as string;
        if (honeypot) {
            // Silently reject — return success to fool the bot
            return NextResponse.json({ case_id: 'CASE-000000-000', status: 'received' }, { status: 201 });
        }

        const rawName = (formData.get('name') as string || '').trim();
        const rawPhone = (formData.get('phone') as string || '').trim();
        const rawState = (formData.get('state') as string || 'Not Specified').trim();
        const rawServiceType = ((formData.get('service_type') || formData.get('serviceType') || 'General Inquiry') as string).trim();
        const rawMessage = (formData.get('message') as string || '').trim();

        // ── Validate name ──
        if (!rawName || rawName.length < 2 || rawName.length > 100) {
            return NextResponse.json({ error: 'Name must be between 2 and 100 characters.' }, { status: 400 });
        }

        // ── Validate phone ──
        if (!rawPhone || !isValidPhone(rawPhone)) {
            return NextResponse.json({ error: 'Please provide a valid 10-digit phone number.' }, { status: 400 });
        }

        // ── Block SQL injection / XSS in all text fields ──
        const allInputs = [rawName, rawPhone, rawState, rawServiceType, rawMessage];
        for (const input of allInputs) {
            if (SQL_INJECTION_PATTERN.test(input)) {
                return NextResponse.json({ error: 'Invalid characters detected in your input.' }, { status: 400 });
            }
            if (XSS_PATTERN.test(input)) {
                return NextResponse.json({ error: 'Invalid characters detected in your input.' }, { status: 400 });
            }
        }

        // ── Block long/overflow payloads ──
        if (rawName.length > 100 || rawMessage.length > 2000 || rawState.length > 50 || rawServiceType.length > 50) {
            return NextResponse.json({ error: 'Input exceeds maximum allowed length.' }, { status: 400 });
        }

        // Sanitize inputs (strip HTML tags as extra safety)
        const requestData: any = {
            name: sanitizeInput(rawName),
            phone: rawPhone.replace(/[\s\-\+\(\)]/g, '').replace(/^91/, '').substring(0, 10),
            state: sanitizeInput(rawState),
            service_type: sanitizeInput(rawServiceType),
            message: sanitizeInput(rawMessage),
        };

        // ── Validate file upload ──
        const file = formData.get('document') as File;
        if (file && file.size > 0) {
            if (file.size > MAX_FILE_SIZE) {
                return NextResponse.json({ error: 'File size must be under 5MB.' }, { status: 400 });
            }
            if (!ALLOWED_FILE_TYPES.includes(file.type)) {
                return NextResponse.json({ error: 'Only PDF, JPG, and PNG files are allowed.' }, { status: 400 });
            }

            const arrayBuffer = await file.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            const fileExt = file.name.split('.').pop()?.toLowerCase();
            const safeFileName = `${Date.now()}-${Math.round(Math.random() * 1E9)}.${fileExt}`;

            const { error: uploadError } = await supabaseAdmin.storage
                .from('chat-uploads')
                .upload(safeFileName, buffer, { contentType: file.type });

            if (!uploadError) {
                const { data: { publicUrl } } = supabaseAdmin.storage.from('chat-uploads').getPublicUrl(safeFileName);
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

        emailNotification.sendNewServiceRequestEmail(
            newRequest.name,
            newRequest.phone,
            newRequest.service_type,
            newRequest.state,
            newRequest.case_id
        );

        return NextResponse.json(newRequest, { status: 201 });
    } catch (error: any) {
        console.error(error);
        return NextResponse.json({ error: error.message || 'Something went wrong' }, { status: 500 });
    }
}

