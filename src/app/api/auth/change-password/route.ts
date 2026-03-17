import { NextResponse } from 'next/server';
import { passwordService } from '@/lib/passwordService';
import { isRateLimited, getClientIp } from '@/lib/security';
import { checkAdmin } from '@/lib/auth-server';

export async function POST(request: Request) {
    try {
        // Rate limit: 5 attempts per 5 minutes per IP
        const ip = getClientIp(request);
        if (isRateLimited(ip, 'auth-change-password', 5, 5 * 60_000)) {
            return NextResponse.json({ error: 'Too many attempts. Please try again in a few minutes.' }, { status: 429 });
        }

        const admin = await checkAdmin(request);
        if (!admin) {
             return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { currentPassword, newPassword } = await request.json();

        if (!currentPassword || !newPassword || typeof currentPassword !== 'string' || typeof newPassword !== 'string') {
            return NextResponse.json({ error: 'Current password and new password are required.' }, { status: 400 });
        }
        
        if (newPassword.length < 6 || newPassword.length > 200) {
            return NextResponse.json({ error: 'New password must be between 6 and 200 characters.' }, { status: 400 });
        }

        const data = await passwordService.changePassword(admin.id, currentPassword, newPassword);
        return NextResponse.json(data);
    } catch (error: any) {
        console.error('Change password error:', error);
        // Anti-brute-force delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        const isInvalid = error.message === 'Invalid current password';
        const status = isInvalid ? 401 : 500;
        const message = isInvalid ? 'Invalid current password' : 'Internal Server Error';
        return NextResponse.json({ error: message }, { status });
    }
}
