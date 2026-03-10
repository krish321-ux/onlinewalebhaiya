import { supabase, supabaseAdmin } from '../db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET && process.env.NODE_ENV === 'production') {
    throw new Error('FATAL: JWT_SECRET environment variable is missing.');
}
const SECRET_KEY = JWT_SECRET || 'fallback_secret_for_local_dev';
export const authService = {
    async register(name: string, email: string, password: string, role = 'operator') {
        const { data: existingUser } = await supabase.from('admins').select('id').eq('email', email).single();
        if (existingUser) throw new Error('User already exists');

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        const { data: newUser, error } = await supabaseAdmin.from('admins').insert([{
            name,
            email,
            password_hash: passwordHash,
            role
        }]).select();

        if (error) throw error;
        return { id: newUser[0].id, name: newUser[0].name, role: newUser[0].role };
    },

    async login(email: string, password: string) {
        const localEmail = process.env.LOCAL_ADMIN_EMAIL;
        const localPassword = process.env.LOCAL_ADMIN_PASSWORD;
        if (localEmail && localPassword) {
            if (email === localEmail && password === localPassword) {
                const token = jwt.sign(
                    { id: 'local-admin', role: 'admin' },
                    SECRET_KEY,
                    { expiresIn: '30d' }
                );
                return { token, user: { id: 'local-admin', name: 'Local Admin', role: 'admin' } };
            }
            throw new Error('Invalid credentials');
        }

        const { data: user, error } = await supabase.from('admins').select('*').eq('email', email).single();

        if (error) {
            const isTimeout = error.message?.includes('fetch failed') || error.code === 'PGRST301';
            if (isTimeout) throw new Error('Database connection timeout. Please check if Supabase is reachable.');
            if (error.code === 'PGRST116') throw new Error('Invalid credentials');
            throw error;
        }

        if (!user) throw new Error('Invalid credentials');

        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) throw new Error('Invalid credentials');

        const payload = { id: user.id, role: user.role };
        const token = jwt.sign(payload, SECRET_KEY, { expiresIn: '30d' });

        return { token, user: { id: user.id, name: user.name, role: user.role } };
    }
};
