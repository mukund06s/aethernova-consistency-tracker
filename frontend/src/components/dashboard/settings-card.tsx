'use client';

import { useState } from 'react';
import { Bell, Save, Clock, CheckCircle2, User, Sparkles, Volume2, Trash2, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { authApi } from '@/lib/api';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

export default function SettingsCard() {
    const { user, setUser, deleteAccount } = useAuth();
    const [name, setName] = useState(user?.name || '');
    const [reminderTime, setReminderTime] = useState(user?.reminderTime || '09:00');
    const [confettiEnabled, setConfettiEnabled] = useState(user?.confettiEnabled ?? true);
    const [soundEnabled, setSoundEnabled] = useState(user?.soundEnabled ?? true);

    const [saving, setSaving] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const hasChanges =
        name !== user?.name ||
        reminderTime !== user?.reminderTime ||
        confettiEnabled !== user?.confettiEnabled ||
        soundEnabled !== user?.soundEnabled;

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await authApi.updateSettings({
                name,
                reminderTime,
                confettiEnabled,
                soundEnabled
            });
            setUser(res.user);
            toast.success('Settings updated!');
        } catch {
            toast.error('Failed to save settings.');
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteAccount = async () => {
        setDeleting(true);
        try {
            await deleteAccount();
            toast.success('Account deleted. We’re sorry to see you go.');
        } catch {
            toast.error('Failed to delete account.');
            setDeleting(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass rounded-xl p-4 h-full flex flex-col"
            style={{ border: '1px solid var(--card-border)' }}
        >
            <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    <User className="w-5 h-5" />
                </div>
                <div>
                    <h2 className="text-xl font-display font-bold text-foreground">Account Settings</h2>
                    <p className="text-xs text-foreground/40">Manage your profile and preferences</p>
                </div>
            </div>

            <form onSubmit={handleSave} className="flex-1 space-y-4">
                {/* Profile Section */}
                <div className="space-y-4">
                    <h3 className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground flex items-center gap-2">
                        <User className="w-3 h-3" /> Personal Information
                    </h3>
                    <div className="space-y-3">
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Full Name"
                            className="w-full bg-foreground/[0.03] border border-foreground/[0.05] rounded-xl px-4 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-accent transition-all hover:border-foreground/[0.1]"
                        />
                        <input
                            type="email"
                            value={user?.email}
                            disabled
                            className="w-full bg-foreground/[0.03] border border-foreground/[0.05] rounded-xl px-4 py-2 text-sm text-foreground opacity-50 cursor-not-allowed"
                        />
                    </div>
                </div>

                {/* Preferences Section */}
                <div className="space-y-4">
                    <h3 className="text-[10px] uppercase tracking-widest font-bold text-foreground/30 flex items-center gap-2">
                        <Sparkles className="w-3 h-3" /> Experience Defaults
                    </h3>

                    <div className="grid grid-cols-1 gap-2">
                        <div className="flex items-center justify-between p-3 rounded-xl bg-foreground/[0.03] border border-foreground/[0.05]">
                            <div className="flex items-center gap-3">
                                <Sparkles className="w-4 h-4 text-accent" />
                                <div>
                                    <p className="text-sm font-semibold text-foreground">Confetti Effects</p>
                                    <p className="text-[10px] text-foreground/40">Celebrate habit completions</p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setConfettiEnabled(!confettiEnabled)}
                                className={`w-10 h-5 rounded-full transition-colors relative ${confettiEnabled ? 'bg-accent' : 'bg-foreground/10'}`}
                            >
                                <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${confettiEnabled ? 'right-1' : 'left-1'}`} />
                            </button>
                        </div>

                        <div className="flex items-center justify-between p-3 rounded-xl bg-foreground/[0.03] border border-foreground/[0.05]">
                            <div className="flex items-center gap-3">
                                <Volume2 className="w-4 h-4 text-primary" />
                                <div>
                                    <p className="text-sm font-semibold text-foreground">Sound Effects</p>
                                    <p className="text-[10px] text-foreground/40">Tactile audio feedback</p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setSoundEnabled(!soundEnabled)}
                                className={`w-10 h-5 rounded-full transition-colors relative ${soundEnabled ? 'bg-primary' : 'bg-foreground/10'}`}
                            >
                                <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${soundEnabled ? 'right-1' : 'left-1'}`} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Reminders Section */}
                <div className="space-y-4">
                    <h3 className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground flex items-center gap-2">
                        <Clock className="w-3 h-3" /> Daily Reminders
                    </h3>
                    <div className="relative group">
                        <input
                            type="time"
                            value={reminderTime}
                            onChange={(e) => setReminderTime(e.target.value)}
                            className="w-full bg-foreground/[0.03] border border-foreground/[0.05] rounded-xl px-4 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-accent transition-all group-hover:border-foreground/[0.1]"
                        />
                    </div>
                </div>

                <div className="pt-4">
                    <button
                        type="submit"
                        disabled={saving || !hasChanges}
                        className="btn-premium w-full flex items-center justify-center gap-2 py-2.5 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed group relative overflow-hidden shadow-lg shadow-primary/20"
                    >
                        {saving ? (
                            <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                <Save className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                <span className="font-semibold">Save All Changes</span>
                            </>
                        )}
                    </button>
                </div>
            </form>

            <div className="mt-6 pt-4 border-t border-white/5">
                <AnimatePresence mode="wait">
                    {!showDeleteConfirm ? (
                        <motion.button
                            key="delete-btn"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            type="button"
                            onClick={() => setShowDeleteConfirm(true)}
                            className="w-full flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest text-red-400/60 hover:text-red-400 transition-colors py-2"
                        >
                            <Trash2 className="w-3.5 h-3.5" />
                            Delete Account
                        </motion.button>
                    ) : (
                        <motion.div
                            key="delete-confirm"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 space-y-3"
                        >
                            <div className="flex items-start gap-3">
                                <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5" />
                                <div>
                                    <p className="text-sm font-bold text-red-400">Are you absolutely sure?</p>
                                    <p className="text-xs text-red-400/70 mt-1">
                                        This will permanently delete your profile, and all your habit streaks. This action cannot be undone.
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={handleDeleteAccount}
                                    disabled={deleting}
                                    className="flex-1 bg-red-500 hover:bg-red-600 text-white rounded-xl py-2 text-xs font-bold transition-colors disabled:opacity-50"
                                >
                                    {deleting ? 'Deleting...' : 'Confirm Delete'}
                                </button>
                                <button
                                    onClick={() => setShowDeleteConfirm(false)}
                                    className="flex-1 bg-foreground/[0.05] hover:bg-foreground/[0.1] text-foreground rounded-xl py-2 text-xs font-bold transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
}
