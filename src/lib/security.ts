// ── Shared security utilities for API routes ──

// Rate Limiting (in-memory, per IP)
const rateLimitMaps = new Map<string, Map<string, { count: number; resetAt: number }>>();

export function isRateLimited(ip: string, endpoint: string, maxRequests: number = 10, windowMs: number = 60_000): boolean {
    if (!rateLimitMaps.has(endpoint)) rateLimitMaps.set(endpoint, new Map());
    const map = rateLimitMaps.get(endpoint)!;
    const now = Date.now();
    const entry = map.get(ip);
    if (!entry || now > entry.resetAt) {
        map.set(ip, { count: 1, resetAt: now + windowMs });
        return false;
    }
    entry.count++;
    return entry.count > maxRequests;
}

// Cleanup stale entries every 15 min
setInterval(() => {
    const now = Date.now();
    for (const [, map] of rateLimitMaps.entries()) {
        for (const [ip, entry] of map.entries()) {
            if (now > entry.resetAt) map.delete(ip);
        }
    }
}, 15 * 60 * 1000);

// Malicious pattern detection
const SQL_INJECTION_PATTERN = /(\b(UNION|SELECT|INSERT|UPDATE|DELETE|DROP|ALTER|CREATE|EXEC|EXECUTE|TRUNCATE)\b\s+(SELECT|FROM|INTO|TABLE|DATABASE)|--|;.*\b(DROP|DELETE|UPDATE)\b|\/\*|\*\/|xp_)/i;
const XSS_PATTERN = /<script[\s>]|javascript:|on\w+\s*=\s*["']|<iframe|<object|<embed|<svg[\s>].*on\w+/i;
const SSTI_PATTERN = /\{\{.*\}\}|\$\{.*\}|<%.*%>|\{%.*%\}/;

export function containsMaliciousPayload(input: string): boolean {
    return SQL_INJECTION_PATTERN.test(input) || XSS_PATTERN.test(input) || SSTI_PATTERN.test(input);
}

// Sanitize text — strip HTML tags
export function sanitizeText(str: string): string {
    return str.replace(/<[^>]*>/g, '').trim();
}

// Extract client IP from request headers
export function getClientIp(request: Request): string {
    const forwarded = request.headers.get('x-forwarded-for');
    return forwarded?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || 'unknown';
}
