'use client';

import { useUI } from '@/contexts/ui-context';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import ShortcutsHelpModal from './shortcuts-modal';
import HabitForm from '../habits/habit-form';
import WeeklyReviewModal from '../dashboard/weekly-review-modal';
import { useSWRConfig } from 'swr';
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

        // window.dispatchEvent triggers a custom event that HabitsPage can listen to.
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
