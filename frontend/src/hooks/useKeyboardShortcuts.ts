'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface ShortcutOptions {
    onOpenNewHabit: () => void;
    onToggleHelp: () => void;
    onToggleHabit: (index: number) => void;
    onOpenWeeklyReview?: () => void;
}

export function useKeyboardShortcuts({ onOpenNewHabit, onToggleHelp, onToggleHabit, onOpenWeeklyReview }: ShortcutOptions) {
    const router = useRouter();

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Guard against firing when focused on input/textarea
            const target = e.target as HTMLElement;
            if (
                target.tagName === 'INPUT' ||
                target.tagName === 'TEXTAREA' ||
                target.isContentEditable
            ) {
                if (e.key === 'Escape') {
                    target.blur();
                }
                return;
            }

            // Global Shortcuts
            switch (e.key.toLowerCase()) {
                case 'n':
                    e.preventDefault();
                    onOpenNewHabit();
                    break;
                case 'w':
                    e.preventDefault();
                    onOpenWeeklyReview?.();
                    break;
                case 'd':
                    e.preventDefault();
                    router.push('/dashboard');
                    break;
                case 'h':
                    e.preventDefault();
                    router.push('/habits');
                    break;
                case 's':
                    e.preventDefault();
                    router.push('/settings');
                    break;
                case '?':
                    e.preventDefault();
                    onToggleHelp();
                    break;
                case 'escape':
                    break;
            }

            // 1-5 to toggle habits
            if (['1', '2', '3', '4', '5'].includes(e.key)) {
                e.preventDefault();
                onToggleHabit(parseInt(e.key) - 1);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [router, onOpenNewHabit, onToggleHelp, onToggleHabit, onOpenWeeklyReview]);
}
