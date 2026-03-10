import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET && process.env.NODE_ENV === 'production') {
    throw new Error('FATAL: JWT_SECRET environment variable is missing.');
}
const SECRET_KEY = JWT_SECRET || 'fallback_secret_for_local_dev';
export async function verifyServerToken(request: Request) {
    const authHeader = request.headers.get('authorization');

    if (authHeader && authHeader.startsWith('Bearer ')) {
        try {
            const token = authHeader.split(' ')[1];
            const decoded = jwt.verify(token, SECRET_KEY);
            return decoded as any;
        } catch (error) {
            console.error('Token verification error:', error);
            return null;
        }
    }

    return null;
}

export async function checkAdmin(request: Request) {
    const user = await verifyServerToken(request);
    if (user && user.role === 'admin') {
        return user;
    }
    return null;
}
