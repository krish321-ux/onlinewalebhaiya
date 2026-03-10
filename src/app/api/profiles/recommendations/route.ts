import { NextResponse } from 'next/server';
import { userProfileService } from '@/lib/services/userProfileService';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const recommendations = await userProfileService.getRecommendations(body);
        return NextResponse.json(recommendations);
    } catch (error: any) {
        console.error(error);
        return NextResponse.json({ error: error.message || 'Something went wrong' }, { status: 500 });
    }
}
