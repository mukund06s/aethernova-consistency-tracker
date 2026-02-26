'use client';

import { useUI } from '@/contexts/ui-context';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import ShortcutsHelpModal from './shortcuts-modal';
import HabitForm from '../habits/habit-form';
import WeeklyReviewModal from '../dashboard/weekly-review-modal';
import { useSWRConfig } from 'swr';
import { habitsApi } from '@/lib/api';
import { toast } from 'sonner';
import { Habit } from '@/lib/types';
import { usePathname } from 'next/navigation';

export default function ShortcutHandler() {
    const {
        shortcutsOpen, setShortcutsOpen,
        newHabitOpen, setNewHabitOpen,
        weeklyReviewOpen, setWeeklyReviewOpen,
        toggleShortcuts, toggleNewHabit, toggleWeeklyReview
    } = useUI();
    const { mutate } = useSWRConfig();
    const pathname = usePathname();

    const handleToggleHabit = async (index: number) => {
        // Only toggle if we're on the habits page where habits are visible
        if (pathname !== '/habits') return;

        // Try to get habits from SWR cache
        // Note: This is an implementation detail of how habits are stored in SWR
        // In HabitsPage, we use ['habits', showArchived]
        // For simplicity, we'll assume the active habits (showArchived=false)
        const habitsCache = mutate(['habits', false]);
        // mutate without data returns the current value in some versions, 
        // but it's safer to just let the HabitsPage handle its own local shortcuts 
        // if we want to be perfectly accurate.

        // HOWEVER, the prompt asked for a SINGLE hook and GLOBAL listener.
        // Let's use a custom event or a shared state if needed.
        // For now, I'll trigger a custom event that HabitsPage can listen to.
        window.dispatchEvent(new CustomEvent('aethernova-toggle-habit', { detail: { index } }));
    };

    useKeyboardShortcuts({
        onOpenNewHabit: toggleNewHabit,
        onToggleHelp: toggleShortcuts,
        onToggleHabit: handleToggleHabit,
        onOpenWeeklyReview: toggleWeeklyReview,
    });

    return (
        <>
            <ShortcutsHelpModal
                isOpen={shortcutsOpen}
                onClose={() => setShortcutsOpen(false)}
            />
            <HabitForm
                open={newHabitOpen}
                onClose={() => setNewHabitOpen(false)}
                onSaved={() => {
                    setNewHabitOpen(false);
                    mutate(['habits', false]);
                    mutate('dashboard-stats');
                }}
            />
            <WeeklyReviewModal
                isOpen={weeklyReviewOpen}
                onClose={() => setWeeklyReviewOpen(false)}
            />
        </>
    );
}
