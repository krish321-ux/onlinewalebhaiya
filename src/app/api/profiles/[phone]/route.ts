import { NextResponse } from 'next/server';
import { userProfileService } from '@/lib/services/userProfileService';

export async function GET(request: Request, { params }: { params: Promise<{ phone: string }> }) {
    try {
        const { phone } = await params;
        const profile = await userProfileService.getProfile(phone);
        if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
        return NextResponse.json(profile);
    } catch (error: any) {
        console.error(error);
        return NextResponse.json({ error: error.message || 'Something went wrong' }, { status: 500 });
    }
}
