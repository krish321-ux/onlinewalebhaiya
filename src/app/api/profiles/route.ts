import { NextResponse } from 'next/server';
import { userProfileService } from '@/lib/services/userProfileService';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const profile = await userProfileService.saveProfile(body);
        return NextResponse.json(profile, { status: 201 });
    } catch (error: any) {
        console.error(error);
        return NextResponse.json({ error: error.message || 'Something went wrong' }, { status: 500 });
    }
}
