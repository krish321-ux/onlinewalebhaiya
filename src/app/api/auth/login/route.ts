import { NextResponse } from 'next/server';
import { authService } from '@/lib/services/authService';

export async function POST(request: Request) {
    try {
        const { email, password } = await request.json();
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
