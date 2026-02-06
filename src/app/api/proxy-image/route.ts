import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const url = searchParams.get('url');

    if (!url) {
        return new NextResponse('Missing URL parameter', { status: 400 });
    }

    try {
        // Security check: simple validation ensuring it's a URL
        // In a stricter environment, you might want to validate the domain matches your Supabase project
        const targetUrl = new URL(url);

        // Security: Validate the domain matches our Supabase project
        // This prevents SSRF (Server-Side Request Forgery) attacks
        const allowedDomain = process.env.NEXT_PUBLIC_SUPABASE_URL;

        if (!allowedDomain) {
            console.error('SSRF Check Failed: NEXT_PUBLIC_SUPABASE_URL is not defined');
            return new NextResponse('Server Configuration Error', { status: 500 });
        }

        if (!targetUrl.href.startsWith(allowedDomain)) {
            console.warn(`Blocked SSRF attempt: ${url}`);
            return new NextResponse('Forbidden: External URLs not allowed', { status: 403 });
        }

        const response = await fetch(url);

        if (!response.ok) {
            return new NextResponse(`Failed to fetch image: ${response.statusText}`, { status: response.status });
        }

        const contentType = response.headers.get('content-type') || 'application/octet-stream';
        const blob = await response.blob();

        return new NextResponse(blob, {
            headers: {
                'Content-Type': contentType,
                'Cache-Control': 'public, max-age=31536000, immutable',
            },
        });
    } catch (error) {
        console.error('Proxy Error:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
