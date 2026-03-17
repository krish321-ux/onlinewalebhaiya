'use client';

import { useState } from 'react';
import { Settings, Lock, AlertCircle, CheckCircle } from 'lucide-react';

export default function SettingsPage() {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(false);

        if (newPassword.length < 6) {
            setError('New password must be at least 6 characters long');
            return;
        }

        if (newPassword !== confirmPassword) {
            setError('New passwords do not match');
            return;
        }

        setIsLoading(true);

        try {
            const token = localStorage.getItem('adminToken');
            if (!token) {
                setError('You must be logged in to change your password.');
                setIsLoading(false);
                return;
            }

            const response = await fetch('/api/auth/change-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ currentPassword, newPassword })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to change password');
            }

            setSuccess(true);
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (err: any) {
            setError(err.message || 'An error occurred during password change');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3 mb-8">
                <div className="bg-[#E8652D]/10 dark:bg-[#E8652D]/20 p-3 rounded-lg">
                    <Settings className="w-6 h-6 text-[#E8652D] dark:text-[#E8652D]" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Settings</h1>
                    <p className="text-zinc-500 dark:text-zinc-400">Manage your admin account preferences.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 p-6">
                    <div className="flex items-center gap-2 mb-6 text-zinc-900 dark:text-zinc-100">
                        <Lock className="w-5 h-5text-[#E8652D]" />
                        <h2 className="text-lg font-semibold">Change Password</h2>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && (
                            <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm flex items-start gap-2">
                                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                                <span>{error}</span>
                            </div>
                        )}

                        {success && (
                            <div className="p-3 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg text-sm flex items-start gap-2">
                                <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" />
                                <span>Password updated successfully. Remember to use it on your next login.</span>
                            </div>
                        )}

                        <div className="space-y-1">
                            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 block">
                                Current Password
                            </label>
                            <input
                                type="password"
                                required
                                value={currentPassword}
                                onChange={e => setCurrentPassword(e.target.value)}
                                className="w-full p-2 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[#E8652D]/50"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 block">
                                New Password
                            </label>
                            <input
                                type="password"
                                required
                                minLength={6}
                                value={newPassword}
                                onChange={e => setNewPassword(e.target.value)}
                                className="w-full p-2 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[#E8652D]/50"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 block">
                                Confirm New Password
                            </label>
                            <input
                                type="password"
                                required
                                minLength={6}
                                value={confirmPassword}
                                onChange={e => setConfirmPassword(e.target.value)}
                                className="w-full p-2 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[#E8652D]/50"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-2 bg-[#E8652D] hover:bg-[#d55823] text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                        >
                            {isLoading ? 'Updating...' : 'Update Password'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
