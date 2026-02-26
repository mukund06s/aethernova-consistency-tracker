'use client';

import { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Archive, ArchiveRestore, RefreshCw } from 'lucide-react';
import { Habit } from '@/lib/types';
import { habitsApi } from '@/lib/api';
import { getMilestone, isCompletedToday, cn } from '@/lib/utils';
import DragDropList from '@/components/habits/drag-drop-list';
import HabitForm from '@/components/habits/habit-form';
import MilestoneBanner from '@/components/dashboard/milestone-banner';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { HabitCardSkeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { CheckSquare } from 'lucide-react';
import useSWR from 'swr';
import type { Milestone } from '@/lib/types';

// Use SWR for data fetching with cache
const fetchHabits = async (showArchived: boolean) => {
    const res = await habitsApi.list(showArchived);
    return res.habits;
};

export default function HabitsPage() {
    const [showArchived, setShowArchived] = useState(false);

    const { data: habits, error, isLoading, isValidating, mutate } = useSWR(['habits', showArchived], () => fetchHabits(showArchived), {
        revalidateOnFocus: false,
    });

    const [formOpen, setFormOpen] = useState(false);
    const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
    const [milestone, setMilestone] = useState<Milestone | null>(null);

    const handleEdit = (habit: Habit) => {
        setEditingHabit(habit);
        setFormOpen(true);
    };

    const handleArchive = useCallback(async () => {
        await mutate();
    }, [mutate]);

    const handleDelete = useCallback(async (id: string) => {
        try {
            await mutate(
                (current: Habit[] | undefined) => current?.filter(h => h.id !== id),
                { revalidate: false }
            );
            await habitsApi.delete(id);
            toast.success('Habit deleted.');
        } catch {
            await mutate(); // Revalidate on error
            toast.error('Failed to delete habit.');
        }
    }, [mutate]);

    const handleComplete = useCallback(async (habitId: string, newStreak: number) => {
        const m = getMilestone(newStreak);
        if (m) setMilestone(m);

        // Optimistic update for completions (local simulation)
        await mutate(
            (current: Habit[] | undefined) => current?.map(h =>
                h.id === habitId
                    ? { ...h, completions: [...(h.completions || []), { id: 'temp', habitId, userId: 'temp', date: new Date().toISOString().split('T')[0], completedAt: new Date().toISOString() }] }
                    : h
            ),
            { revalidate: false }
        );
        // The HabitCard already calls the API, so we just need to wait for revalidation if we didn't do optimistic
        // But here we do it for instant feedback.
    }, [mutate]);

    // Handle global keyboard shortcuts for toggling
    useEffect(() => {
        const handler = (e: any) => {
            const index = e.detail.index;
            if (habits && habits[index] && !isCompletedToday(habits[index].completions || [])) {
                const buttons = document.querySelectorAll('[aria-label="Mark as complete"]');
                if (buttons[index]) (buttons[index] as HTMLButtonElement).click();
            }
        };
        window.addEventListener('aethernova-toggle-habit', handler);
        return () => window.removeEventListener('aethernova-toggle-habit', handler);
    }, [habits]);

    const handleSaved = useCallback(async (savedHabit: Habit) => {
        setFormOpen(false);
        setEditingHabit(null);

        await mutate(
            (current: Habit[] | undefined) => {
                const existing = current?.find(h => h.id === savedHabit.id);
                if (existing) {
                    return current?.map(h => h.id === savedHabit.id ? savedHabit : h);
                }
                return [...(current || []), savedHabit];
            },
            { revalidate: true }
        );
    }, [mutate]);

    const handleReorder = useCallback((newOrder: Habit[]) => {
        mutate(newOrder, { revalidate: false });
    }, [mutate]);

    const openCreate = () => {
        setEditingHabit(null);
        setFormOpen(true);
    };

    const completedToday = habits?.filter((h: Habit) => isCompletedToday(h.completions || [])).length || 0;
    const total = habits?.length || 0;

    if (error) {
        return <ErrorState message="Failed to load habits." onRetry={() => mutate()} />;
    }

    return (
        <>
            {/* Milestone celebration */}
            <MilestoneBanner milestone={milestone} onClose={() => setMilestone(null)} />

            {/* Habit form modal */}
            <HabitForm
                habit={editingHabit}
                open={formOpen}
                onClose={() => { setFormOpen(false); setEditingHabit(null); }}
                onSaved={handleSaved}
            />

            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between mb-6"
            >
                <div>
                    <h1 className="text-3xl font-display font-bold tracking-tight">My <span className="gradient-text">Habits</span></h1>
                    {!isLoading && total > 0 && (
                        <p className="text-sm mt-1 opacity-60">
                            {completedToday}/{total} completed today
                        </p>
                    )}
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => mutate()}
                        className="p-2.5 rounded-xl border bg-white/5 border-white/10 text-white/40 hover:text-white transition-all flex items-center gap-2 text-xs font-bold uppercase"
                        disabled={isValidating}
                    >
                        <RefreshCw className={cn("w-4 h-4", (isValidating) && "animate-spin")} />
                        <span className="hidden lg:inline">{isValidating ? "Syncing..." : "Refresh"}</span>
                    </button>
                    <button
                        onClick={() => setShowArchived(!showArchived)}
                        className={cn(
                            "p-2.5 rounded-xl border transition-all duration-300 flex items-center gap-2 text-xs font-bold uppercase tracking-wider",
                            showArchived
                                ? "bg-accent/10 border-accent/20 text-accent"
                                : "bg-white/5 border-white/10 text-white/40 hover:text-white hover:bg-white/10"
                        )}
                        aria-label={showArchived ? "View active habits" : "View archived habits"}
                    >
                        {showArchived ? <ArchiveRestore className="w-4 h-4" /> : <Archive className="w-4 h-4" />}
                        <span className="hidden md:inline">{showArchived ? "Active" : "Archived"}</span>
                    </button>
                    <button
                        onClick={openCreate}
                        className="btn-premium btn-premium-primary flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                        aria-label="Create new habit"
                    >
                        <Plus className="w-4 h-4" aria-hidden="true" />
                        <span className="hidden sm:inline">New Habit</span>
                        <span className="sm:hidden">Add</span>
                    </button>
                </div>
            </motion.div>

            {/* Progress bar */}
            {!isLoading && total > 0 && (
                <div className="mb-5">
                    <div
                        className="h-1.5 rounded-full overflow-hidden"
                        style={{ background: 'rgba(255,255,255,0.06)' }}
                        role="progressbar"
                        aria-valuenow={completedToday}
                        aria-valuemin={0}
                        aria-valuemax={total}
                        aria-label={`${completedToday} of ${total} habits completed today`}
                    >
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${total > 0 ? (completedToday / total) * 100 : 0}%` }}
                            transition={{ duration: 0.6, ease: 'easeOut' }}
                            className="h-full rounded-full"
                            style={{ background: 'linear-gradient(90deg, var(--primary), var(--accent))' }}
                        />
                    </div>
                </div>
            )}

            {/* Content */}
            {isLoading ? (
                <div aria-busy="true" aria-label="Loading habits...">
                    {[1, 2, 3].map((i) => <HabitCardSkeleton key={i} />)}
                </div>
            ) : !habits?.length ? (
                <EmptyState
                    title="No habits yet"
                    description="Create your first habit and start building momentum. Every great journey begins with a single step."
                    actionLabel="Create your first habit"
                    onAction={openCreate}
                    icon={<CheckSquare className="w-7 h-7" style={{ color: 'var(--primary-light)' }} />}
                />
            ) : (
                <DragDropList
                    habits={habits || []}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onArchive={handleArchive}
                    onComplete={handleComplete}
                    onChange={handleReorder}
                />
            )}
        </>
    );
}
