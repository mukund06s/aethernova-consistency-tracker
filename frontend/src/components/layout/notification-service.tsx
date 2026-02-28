'use client';

import { useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { toast } from 'sonner';

export default function NotificationService() {
    const { user } = useAuth();
    const lastNotifiedRef = useRef<string | null>(null);

    useEffect(() => {
        if (!user || typeof window === 'undefined') return;

        // 1. Request Permission
        if (Notification.permission === 'default') {
            Notification.requestPermission();
        }

        // 2. Heartbeat check (every 30 seconds)
        const checkReminders = () => {
            if (!user.reminderTime) return;

            const now = new Date();
            const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
            const todayKey = new Date().toLocaleDateString();

            // Only notify if time matches and we haven't notified today for this specific time
            if (currentTime === user.reminderTime && lastNotifiedRef.current !== todayKey) {
                triggerNotification("It's time to check your habits! Keep the streak alive. 🔥");
                lastNotifiedRef.current = todayKey;
            }
        };

        const triggerNotification = (body: string) => {
            if (Notification.permission === 'granted') {
                new Notification('AetherNova Reminder', {
                    body,
                    icon: '/favicon.ico',
                });
            } else {
                toast.info(`Reminder: ${body} (Enable notifications for alerts)`);
            }
        };

        // Expose a test method to window for the UI to trigger
        const win = window as unknown as Window & { sendTestNotification?: () => void };
        win.sendTestNotification = () => {
            triggerNotification("This is a test notification from AetherNova! Everything is working correctly. ✨");
        };

        const interval = setInterval(checkReminders, 30000); // Check every 30 seconds

        // Initial check
        checkReminders();

        return () => {
            clearInterval(interval);
            delete win.sendTestNotification;
        };
    }, [user]);

    return null; // Side-effect only component
}
