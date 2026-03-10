import { NextResponse } from 'next/server';
import { authService } from '@/lib/services/authService';
import { isRateLimited, getClientIp } from '@/lib/security';

export async function POST(request: Request) {
    try {
        // Rate limit: 5 login attempts per 5 minutes per IP (brute-force protection)
        const ip = getClientIp(request);
        if (isRateLimited(ip, 'auth-login', 5, 5 * 60_000)) {
            return NextResponse.json({ error: 'Too many login attempts. Please try again in a few minutes.' }, { status: 429 });
        }

        const { email, password } = await request.json();

        if (!email || !password || typeof email !== 'string' || typeof password !== 'string') {
            return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 });
        }
        if (email.length > 100 || password.length > 200) {
            return NextResponse.json({ error: 'Invalid input.' }, { status: 400 });
        }

        const data = await authService.login(email, password);
        return NextResponse.json(data);
    } catch (error: any) {
        console.error('Login error:', error);
        // Anti-brute-force delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        const isInvalid = error.message === 'Invalid credentials';
        const status = isInvalid ? 401 : 500;
        const message = isInvalid ? 'Invalid credentials' : 'Internal Server Error';
        return NextResponse.json({ error: message }, { status });
    }
}
