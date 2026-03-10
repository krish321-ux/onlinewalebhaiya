import { NextResponse } from 'next/server';
import { userProfileService } from '@/lib/services/userProfileService';
import { isRateLimited, containsMaliciousPayload, sanitizeText, getClientIp } from '@/lib/security';

export async function POST(request: Request) {
    try {
        // Rate limit: 10 profile saves per minute per IP
        const ip = getClientIp(request);
        if (isRateLimited(ip, 'profiles', 10, 60_000)) {
            return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 });
        }

        const body = await request.json();

        // Validate required fields
        if (!body.name || !body.phone) {
            return NextResponse.json({ error: 'Name and phone are required.' }, { status: 400 });
        }

        // Validate types and lengths
        if (typeof body.name !== 'string' || body.name.length > 100 ||
            typeof body.phone !== 'string' || body.phone.length > 15) {
            return NextResponse.json({ error: 'Invalid input.' }, { status: 400 });
        }

        // Block malicious payloads in all string fields
        const stringFields = Object.values(body).filter((v): v is string => typeof v === 'string');
        for (const field of stringFields) {
            if (containsMaliciousPayload(field)) {
                return NextResponse.json({ error: 'Invalid characters detected.' }, { status: 400 });
            }
        }

        // Sanitize string fields
        const sanitized = { ...body };
        for (const key of Object.keys(sanitized)) {
            if (typeof sanitized[key] === 'string') {
                sanitized[key] = sanitizeText(sanitized[key]);
            }
        }

        const profile = await userProfileService.saveProfile(sanitized);
        return NextResponse.json(profile, { status: 201 });
    } catch (error: any) {
        console.error(error);
        return NextResponse.json({ error: error.message || 'Something went wrong' }, { status: 500 });
    }
}
