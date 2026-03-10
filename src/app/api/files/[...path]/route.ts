import { NextResponse } from 'next/server';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://onlinewalebhaiya.jiobase.com';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ path: string[] }> }
) {
    try {
        // Basic Security: Protect against simple hotlinking and interceptors
        // We ensure the request comes from our own site if a referer is present
        const referer = request.headers.get('referer');
        const host = request.headers.get('host');

        // If there's a referer, ensure it matches our host. 
        // Note: Browsers sometimes omit referers, so we only block if it's explicitly explicitly from an external domain.
        if (referer && host && !referer.includes(host)) {
            return new NextResponse('Forbidden: Hotlinking denied', { status: 403 });
        }

        const resolvedParams = await params;
        const filePath = resolvedParams.path.join('/');

        // Construct the authentic Supabase URL
        const backendUrl = `${SUPABASE_URL}/storage/v1/object/public/${filePath}`;

        // Fetch the file server-side (this IP will be your Vercel/Host server, not the end user)
        const response = await fetch(backendUrl);

        if (!response.ok) {
            return new NextResponse('File not found', { status: 404 });
        }

        // Stream the response back to client with appropriate headers
        const headers = new Headers();
        headers.set('Content-Type', response.headers.get('Content-Type') || 'application/octet-stream');
        headers.set('Cache-Control', 'public, max-age=31536000, immutable'); // Cache for 1 year
        headers.set('X-Content-Type-Options', 'nosniff'); // Security header

        return new NextResponse(response.body, {
            status: 200,
            headers,
        });
    } catch (error) {
        console.error('Proxy routing error:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
