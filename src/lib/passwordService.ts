import { supabaseAdmin } from './db';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';

export const passwordService = {
    async changePassword(userId: string, currentPassword: string, newPassword: string) {
        // Handle Local Admin (.env.local)
        if (userId === 'local-admin') {
            const localPassword = process.env.LOCAL_ADMIN_PASSWORD;
            if (currentPassword !== localPassword) {
                throw new Error('Invalid current password');
            }

            // Update in-memory for the current process
            process.env.LOCAL_ADMIN_PASSWORD = newPassword;

            // Attempt to update the local .env.local file on disk
            try {
                const envPath = path.resolve(process.cwd(), '.env.local');
                if (fs.existsSync(envPath)) {
                    let envContent = fs.readFileSync(envPath, 'utf8');
                    const regex = /^LOCAL_ADMIN_PASSWORD=.*$/m;
                    if (regex.test(envContent)) {
                        envContent = envContent.replace(regex, `LOCAL_ADMIN_PASSWORD=${newPassword}`);
                    } else {
                        envContent += `\nLOCAL_ADMIN_PASSWORD=${newPassword}\n`;
                    }
                    fs.writeFileSync(envPath, envContent, 'utf8');
                }
            } catch (err) {
                console.warn('Could not update .env.local on disk, falling back to memory only.', err);
            }

            return { success: true, message: 'Password updated successfully' };
        }

        // Handle Supabase Admin
        const { data: user, error: fetchError } = await supabaseAdmin.from('admins').select('*').eq('id', userId).single();
        if (fetchError || !user) {
            throw new Error('Admin user not found');
        }

        const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
        if (!isMatch) {
            throw new Error('Invalid current password');
        }

        const salt = await bcrypt.genSalt(10);
        const newPasswordHash = await bcrypt.hash(newPassword, salt);

        const { error: updateError } = await supabaseAdmin.from('admins').update({ password_hash: newPasswordHash }).eq('id', userId);
        
        if (updateError) {
            console.error('Failed to update password in DB', updateError);
            throw new Error('Failed to update password');
        }

        return { success: true, message: 'Password updated successfully' };
    }
};
