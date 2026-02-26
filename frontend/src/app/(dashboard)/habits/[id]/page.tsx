'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Check, X, CalendarDays } from 'lucide-react';
import Link from 'next/link';
import { habitsApi, completionsApi, statsApi } from '@/lib/api';
import { HabitStats, HabitCompletion } from '@/lib/types';
import { formatDate, formatDateShort, getCategoryInfo, getStreakEmoji, getTodayString, isCompletedToday, cn } from '@/lib/utils';
import { ErrorState } from '@/components/ui/error-state';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { ApiError } from '@/contexts/auth-context';
import useSWR from 'swr';

import React from 'react';

interface HabitDetailPageProps {
    params: Promise<{ id: string }>;
}

export default function HabitDetailPage({ params }: HabitDetailPageProps) {
    const { id } = React.use(params);
    const [completing, setCompleting] = useState(false);

    const {
        data: habitData,
        error: habitError,
        isLoading: habitLoading,
        mutate: mutateHabit,
    } = useSWR(`habit-${id}`, () => habitsApi.get(id).then((r) => r.habit));

    const {
        data: stats,
        isLoading: statsLoading,
        mutate: mutateStats,
    } = useSWR(`habit-stats-${id}`, () => statsApi.habit(id));

    const {
        data: completionsData,
        isLoading: completionsLoading,
        mutate: mutateCompletions,
    } = useSWR(`completions-${id}`, () =>
        completionsApi.history(id).then((r) => ({ completions: r.completions, pagination: r.pagination }))
    );

    const refreshAll = useCallback(() => {
        mutateHabit();
        mutateStats();
        mutateCompletions();
    }, [mutateHabit, mutateStats, mutateCompletions]);

    const handleComplete = async () => {
        if (completing) return;
        setCompleting(true);
        try {
            const res = await completionsApi.complete(id);
            toast.success(`Completed! Streak: ${res.currentStreak} days 🔥`);
            refreshAll();
        } catch (err) {
            if (err instanceof ApiError && err.statusCode === 409) {
                toast.info("Already completed today!");
            } else {
                toast.error('Failed to mark complete.');
            }
        } finally {
            setCompleting(false);
        }
    };

    const handleUndo = async (completion: HabitCompletion) => {
        try {
            await completionsApi.undo(id, completion.date);
            toast.success('Completion removed.');
            refreshAll();
        } catch {
            toast.error('Failed to undo completion.');
        }
    };

    if (habitError) {
        return <ErrorState message="Habit not found." onRetry={refreshAll} />;
    }

    const categoryInfo = habitData ? getCategoryInfo(habitData.category) : null;
    const completedToday = habitData?.completions ? isCompletedToday(habitData.completions) : false;
    const today = getTodayString();

    return (
        <div>
            {/* Back link */}
            <Link
                href="/habits"
                className="inline-flex items-center gap-1.5 text-sm mb-5 hover:opacity-70 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 rounded"
                style={{ color: 'var(--muted-foreground)' }}
                aria-label="Back to all habits"
            >
                <ArrowLeft className="w-4 h-4" aria-hidden="true" />
                All habits
            </Link>

            {habitLoading ? (
                <div aria-busy="true">
                    <Skeleton className="h-8 rounded mb-2" style={{ width: '50%' }} />
                    <Skeleton className="h-4 rounded mb-6" style={{ width: '30%' }} />
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                        {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-20 rounded-xl" />)}
                    </div>
                </div>
            ) : habitData ? (
                <>
                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: -12 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-start justify-between mb-6"
                    >
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-xl">{categoryInfo?.emoji}</span>
                                <h1 className="text-2xl font-bold">{habitData.title}</h1>
                            </div>
                            {habitData.description && (
                                <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                                    {habitData.description}
                                </p>
                            )}
                            <p className="text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>
                                Started {formatDate(habitData.createdAt)}
                            </p>
                        </div>

                        <div className="flex flex-col items-end">
                            <button
                                onClick={handleComplete}
                                disabled={completing || completedToday}
                                className={cn(
                                    "w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 relative overflow-hidden group/btn",
                                    completedToday
                                        ? "bg-accent text-white shadow-[0_0_15px_var(--accent-glow)]"
                                        : "bg-white/5 hover:bg-white/10 text-white/40 hover:text-white"
                                )}
                                aria-pressed={completedToday}
                                aria-label={completedToday ? 'Already completed today' : 'Mark habit complete for today'}
                            >
                                <AnimatePresence mode="wait">
                                    {completing ? (
                                        <motion.div
                                            key="loading"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"
                                        />
                                    ) : completedToday ? (
                                        <motion.div
                                            key="check"
                                            initial={{ scale: 0.5, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            transition={{ type: "spring", stiffness: 400, damping: 10 }}
                                        >
                                            <Check className="w-6 h-6 stroke-[3]" />
                                        </motion.div>
                                    ) : (
                                        <motion.div
                                            key="idle"
                                            initial={{ scale: 0.8 }}
                                            whileHover={{ scale: 1.1 }}
                                            className="group-hover/btn:scale-110 transition-transform"
                                        >
                                            <Check className="w-6 h-6" />
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </button>
                            <span className="text-[10px] font-bold uppercase tracking-widest mt-2 opacity-50">
                                {completedToday ? 'Done Today' : 'Mark Done'}
                            </span>

                            <AnimatePresence>
                                {completedToday && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="overflow-hidden mt-3"
                                    >
                                        <form
                                            onSubmit={async (e) => {
                                                e.preventDefault();
                                                const note = (e.currentTarget.elements.namedItem('note') as HTMLInputElement).value;
                                                if (!note) return;
                                                try {
                                                    await completionsApi.complete(id, note);
                                                    toast.success('Note saved!');
                                                    refreshAll();
                                                } catch {
                                                    toast.error('Failed to save note.');
                                                }
                                            }}
                                            className="flex gap-2"
                                        >
                                            <input
                                                name="note"
                                                placeholder="Add reflection..."
                                                className="text-xs bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-accent w-40 sm:w-60"
                                                defaultValue={completionsData?.completions.find(c => c.date === today)?.notes || ''}
                                            />
                                            <button
                                                type="submit"
                                                className="text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded bg-white/10 hover:bg-white/20 transition-colors"
                                            >
                                                Save
                                            </button>
                                        </form>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>

                    {/* Stats row */}
                    {statsLoading ? (
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6" aria-busy="true">
                            {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-20 rounded-xl" />)}
                        </div>
                    ) : stats && (
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                            {[
                                { label: 'Current Streak', value: `${stats.currentStreak}d ${getStreakEmoji(stats.currentStreak)}` },
                                { label: 'Longest Streak', value: `${stats.longestStreak}d` },
                                { label: 'Total Completions', value: String(stats.totalCompletions) },
                                { label: 'Completion Rate', value: `${stats.completionRate}%` },
                            ].map(({ label, value }) => (
                                <motion.div
                                    key={label}
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 }}
                                    className="rounded-2xl p-5 text-center glass glass-hover"
                                    style={{ border: '1px solid var(--card-border)' }}
                                >
                                    <p className="text-[10px] font-bold uppercase tracking-widest opacity-50 mb-1">{label}</p>
                                    <p className="text-2xl font-display font-bold">{value}</p>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </>
            ) : null}

            {/* Completion history */}
            <div
                className="rounded-xl p-5"
                style={{ background: 'var(--card)', border: '1px solid var(--card-border)' }}
            >
                <div className="flex items-center gap-2 mb-4">
                    <CalendarDays className="w-4 h-4" style={{ color: 'var(--primary-light)' }} aria-hidden="true" />
                    <h2 className="text-sm font-semibold">Completion History</h2>
                </div>

                {completionsLoading ? (
                    <div aria-busy="true">
                        {[1, 2, 3, 4, 5].map(i => (
                            <Skeleton key={i} className="h-10 rounded-lg mb-2" />
                        ))}
                    </div>
                ) : !completionsData?.completions?.length ? (
                    <p className="text-sm py-6 text-center" style={{ color: 'var(--muted-foreground)' }}>
                        No completions yet. Start today!
                    </p>
                ) : (
                    <ul aria-label="Completion history" className="space-y-2">
                        {completionsData.completions.map((completion) => (
                            <motion.li
                                key={completion.id}
                                initial={{ opacity: 0, x: -8 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="flex items-center justify-between py-2.5 px-3 rounded-lg"
                                style={{ background: 'var(--muted)', border: '1px solid rgba(255,255,255,0.04)' }}
                            >
                                <div className="flex items-center gap-2.5">
                                    <div
                                        className="w-2 h-2 rounded-full flex-shrink-0"
                                        style={{ background: 'var(--accent)' }}
                                        aria-hidden="true"
                                    />
                                    <div>
                                        <p className="text-sm font-medium">{formatDateShort(completion.date)}</p>
                                        {completion.notes && (
                                            <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{completion.notes}</p>
                                        )}
                                    </div>
                                </div>
                                {completion.date === today && (
                                    <button
                                        onClick={() => handleUndo(completion)}
                                        className="p-1 rounded hover:bg-red-500/10 hover:text-red-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 text-xs"
                                        style={{ color: 'var(--muted-foreground)' }}
                                        aria-label={`Undo completion for ${formatDate(completion.date)}`}
                                    >
                                        <X className="w-3.5 h-3.5" aria-hidden="true" />
                                    </button>
                                )}
                            </motion.li>
                        ))}
                    </ul>
                )}

                {completionsData?.pagination && completionsData.pagination.totalPages > 1 && (
                    <p className="text-xs mt-3 text-center" style={{ color: 'var(--muted-foreground)' }}>
                        Showing {completionsData.completions.length} of {completionsData.pagination.total} completions
                    </p>
                )}
            </div>
        </div>
    );
}
