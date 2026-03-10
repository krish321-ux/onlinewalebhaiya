/**
 * Utility function to convert raw Supabase storage URLs
 * into our secure, local Next.js proxy URLs to hide the backend infrastructure.
 */
export function getSecureUrl(rawUrl: string | null | undefined): string {
    if (!rawUrl) return '';

    // Check if it's our specific Supabase domain
    const supabaseDomain = 'onlinewalebhaiya.jiobase.com/storage/v1/object/public/';

    if (rawUrl.includes(supabaseDomain)) {
        // Extract the path after 'public/'
        const pathSplit = rawUrl.split(supabaseDomain);
        if (pathSplit.length > 1) {
            const filePath = pathSplit[1];
            // Point to our secure Next.js interceptor route
            return `/api/files/${filePath}`;
        }
    }

    return rawUrl;
}
