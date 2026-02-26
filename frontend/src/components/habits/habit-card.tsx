'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Edit2, Trash2, GripVertical, Flame, ChevronRight, Archive, ArchiveRestore, Snowflake } from 'lucide-react';
import Link from 'next/link';
import { Habit } from '@/lib/types';
import { cn, getCategoryInfo, getCategoryClass, getStreakEmoji, isCompletedToday, getTodayString } from '@/lib/utils';
import { completionsApi, habitsApi } from '@/lib/api';
import { useSWRConfig } from 'swr';
import { toast } from 'sonner';
import { useAuth, ApiError } from '@/contexts/auth-context';
import { useCompletionFeedback } from '@/hooks/useCompletionFeedback';

interface HabitCardProps {
    habit: Habit;
    onEdit: (habit: Habit) => void;
    onDelete: (id: string) => void;
    onArchive?: (id: string) => void;
    onComplete: (habitId: string, newStreak: number) => void;
    dragHandleProps?: Record<string, unknown>;
    isDragging?: boolean;
}

export default function HabitCard({
    habit,
    onEdit,
    onDelete,
    onArchive,
    onComplete,
    dragHandleProps,
    isDragging,
}: HabitCardProps) {
    const { user } = useAuth();
    const { mutate: globalMutate } = useSWRConfig();
    const { triggerFeedback } = useCompletionFeedback();
    const [completing, setCompleting] = useState(false);
    const [localCompletions, setLocalCompletions] = useState(habit.completions || []);
    const [localStreak, setLocalStreak] = useState(habit.currentStreak || 0);

    const categoryInfo = getCategoryInfo(habit.category);
    const completedToday = isCompletedToday(localCompletions);
    const isFrozen = !!(habit.isFrozen && habit.frozenUntil && new Date(habit.frozenUntil) > new Date());
    const today = getTodayString();

    const handleFreeze = async (days: number) => {
        try {
            await habitsApi.freeze(habit.id, days);
            toast.success(`Habit frozen for ${days} days! ❄️`);
            globalMutate(['habits', false]);
            globalMutate('dashboard-stats');
        } catch {
            toast.error('Failed to freeze habit.');
        }
    };

    const handleUnfreeze = async () => {
        try {
            await habitsApi.unfreeze(habit.id);
            toast.success('Habit unfrozen!');
            globalMutate(['habits', false]);
            globalMutate('dashboard-stats');
        } catch {
            toast.error('Failed to unfreeze habit.');
        }
    };

    const handleComplete = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (completing || completedToday || isFrozen) return;

        setCompleting(true);
        try {
            const res = await completionsApi.complete(habit.id);
            // Optimistic update
            setLocalCompletions([...localCompletions, { date: today } as typeof localCompletions[0]]);
            setLocalStreak(res.currentStreak);
            onComplete(habit.id, res.currentStreak);
            globalMutate('dashboard-stats');

            // Trigger confetti and sound feedback
            triggerFeedback(e);

            toast.success(`✅ ${habit.title} completed! Streak: ${res.currentStreak} 🔥`);
        } catch (err) {
            if (err instanceof ApiError && err.statusCode === 409) {
                toast.info("You've already completed this today!");
            } else {
                toast.error('Failed to mark as complete. Try again.');
            }
        } finally {
            setCompleting(false);
        }
    };

    const handleArchive = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        try {
            await habitsApi.archive(habit.id);
            toast.success(habit.archived ? 'Habit restored!' : 'Habit archived!');
            if (onArchive) onArchive(habit.id);
            globalMutate('dashboard-stats');
        } catch {
            toast.error('Failed to change archive status.');
        }
    };

    const handleDelete = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (confirm(`Delete "${habit.title}"? This cannot be undone.`)) {
            onDelete(habit.id);
        }
    };

    const handleEdit = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        onEdit(habit);
    };

    return (
        <motion.article
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96 }}
            whileHover={{ y: isDragging ? 0 : -6, scale: isDragging ? 1.03 : 1.02 }}
            transition={{ type: 'spring', stiffness: 400, damping: 17, bounce: 0, ease: [0.16, 1, 0.3, 1] }}
            className={cn(
                'glass glass-hover rounded-2xl p-5 mb-4 group relative',
                isDragging && 'shadow-[0_0_25px_rgba(99,102,241,0.5)] ring-2 ring-primary/50 rotate-1 z-50 cursor-grabbing bg-foreground/[0.05]',
                !isDragging && 'cursor-default transition-all',
                isFrozen && 'bg-blue-500/[0.05] border-blue-500/20 shadow-[0_0_20px_rgba(59,130,246,0.1)]'
            )}
            style={{
                border: isFrozen ? '1px solid rgba(59,130,246,0.2)' : completedToday ? '1px solid rgba(0,229,186,0.2)' : '1px solid var(--card-border)',
                background: isFrozen ? 'rgba(59, 130, 246, 0.03)' : completedToday ? 'rgba(0, 229, 186, 0.03)' : 'var(--card)',
            }}
            aria-label={`${habit.title}${completedToday ? ', completed today' : ''}`}
        >
            {isFrozen && (
                <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-blue-500/20 border border-blue-500/30 text-[10px] font-bold text-blue-500 dark:text-blue-400 z-10 animate-in fade-in zoom-in duration-300">
                    <Snowflake className="w-3 h-3" />
                    FROZEN
                </div>
            )}

            {/* Top accent line if completed */}
            {completedToday && !isFrozen && (
                <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    className="absolute top-0 left-0 right-0 h-0.5 bg-accent origin-left rounded-t-2xl"
                />
            )}

            <div className="flex items-start gap-4">
                {/* Checkbox / Completion Indicator */}
                <div className="flex flex-col items-center gap-2 flex-shrink-0">
                    <button
                        onClick={handleComplete}
                        disabled={completing || completedToday || isFrozen}
                        className={cn(
                            "w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 relative overflow-hidden group/btn",
                            completedToday
                                ? "bg-accent text-white shadow-[0_0_15px_var(--accent-glow)]"
                                : isFrozen
                                    ? "bg-blue-500/30 text-blue-500 dark:text-blue-400 border border-blue-500/40 cursor-not-allowed"
                                    : "bg-foreground/[0.05] hover:bg-foreground/[0.1] text-foreground/40 hover:text-foreground"
                        )}
                        aria-label={completedToday ? 'Completed' : 'Mark as complete'}
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
                            ) : isFrozen ? (
                                <Snowflake className="w-6 h-6 animate-pulse" />
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

                    {/* Drag handle */}
                    <div
                        {...dragHandleProps}
                        className="p-1.5 cursor-grab active:cursor-grabbing opacity-20 hover:opacity-100 transition-opacity rounded-md hover:bg-foreground/[0.05]"
                        aria-label="Drag to reorder"
                        role="button"
                        tabIndex={0}
                    >
                        <GripVertical className="w-3.5 h-3.5" />
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 pt-1">
                    <div className="flex items-center gap-2 mb-1.5">
                        <span className={cn('cat-badge', getCategoryClass(habit.category))}>
                            {categoryInfo.emoji} {categoryInfo.label}
                        </span>
                    </div>

                    <h3 className={cn(
                        "text-lg font-display font-bold truncate transition-all duration-300",
                        (completedToday || isFrozen) ? "text-foreground/40 line-through decoration-foreground/20" : "text-foreground"
                    )}>
                        {habit.title}
                    </h3>

                    {habit.description && (
                        <p className="text-xs truncate mt-1 text-foreground/60 font-medium">
                            {habit.description}
                        </p>
                    )}

                    <div className="flex items-center gap-4 mt-3">
                        <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-foreground/[0.03] border border-foreground/[0.05]">
                            <Flame className={cn("w-3.5 h-3.5 transition-colors", localStreak > 0 ? "text-orange-500" : "text-foreground/20")} />
                            <span className="text-[10px] font-bold uppercase tracking-wider text-foreground/70">
                                {localStreak} Day Streak
                            </span>
                            {localStreak > 0 && <span className="text-xs">{getStreakEmoji(localStreak)}</span>}
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="relative group/freeze">
                        {isFrozen ? (
                            <button
                                onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleUnfreeze(); }}
                                className="p-2 rounded-xl bg-blue-500/20 text-blue-500 dark:text-blue-400 hover:bg-blue-500/30 transition-colors"
                                title="Unfreeze early"
                                aria-label="Unfreeze early"
                            >
                                <Snowflake className="w-4 h-4 animate-pulse" />
                            </button>
                        ) : (
                            <div className="p-2 rounded-xl hover:bg-foreground/[0.05] text-foreground/40 hover:text-foreground transition-colors cursor-default">
                                <Snowflake className="w-4 h-4" />
                                <div className="absolute bottom-full right-0 mb-2 opacity-0 group-hover/freeze:opacity-100 transition-opacity pointer-events-none">
                                    <div className="glass p-2 rounded-xl border border-foreground/[0.05] shadow-2xl flex flex-col gap-1 min-w-[100px]">
                                        <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1 px-2">{habit.freezesAvailable} left</p>
                                        {[1, 2, 3].map(d => (
                                            <button
                                                key={d}
                                                onClick={(e) => { e.stopPropagation(); e.preventDefault(); handleFreeze(d); }}
                                                className="text-[10px] font-bold py-1 px-3 rounded-lg hover:bg-primary/[0.1] text-left transition-colors pointer-events-auto text-foreground"
                                            >
                                                {d} Day{d > 1 ? 's' : ''}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                    <button
                        onClick={handleEdit}
                        className="p-2 rounded-xl hover:bg-foreground/[0.05] transition-colors text-foreground/40 hover:text-foreground"
                        aria-label="Edit"
                    >
                        <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                        onClick={handleArchive}
                        className="p-2 rounded-xl hover:bg-foreground/[0.05] transition-colors text-foreground/40 hover:text-foreground"
                        title={habit.archived ? "Restore" : "Archive"}
                        aria-label={habit.archived ? "Restore" : "Archive"}
                    >
                        {habit.archived ? <ArchiveRestore className="w-4 h-4" /> : <Archive className="w-4 h-4" />}
                    </button>
                    <button
                        onClick={handleDelete}
                        className="p-2 rounded-xl hover:bg-red-500/10 transition-colors text-foreground/40 hover:text-red-500"
                        aria-label="Delete"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                    <Link
                        href={`/habits/${habit.id}`}
                        className="p-2 rounded-xl hover:bg-foreground/[0.05] transition-colors text-foreground/40 hover:text-foreground"
                        aria-label="View details"
                    >
                        <ChevronRight className="w-4 h-4" />
                    </Link>
                </div>
            </div>

            {/* Optional Note Expandable */}
            <AnimatePresence>
                {completedToday && !isDragging && !isFrozen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="pt-3 mt-3 border-t border-foreground/[0.05]">
                            <form
                                onSubmit={async (e) => {
                                    e.preventDefault();
                                    const form = e.currentTarget;
                                    const note = (form.elements.namedItem('note') as HTMLInputElement).value;

                                    try {
                                        await completionsApi.updateNote(habit.id, today, note);
                                        // Update local state to reflect the note save
                                        const noteIndex = localCompletions.findIndex(c => c.date === today);
                                        if (noteIndex !== -1) {
                                            const newCompletions = [...localCompletions];
                                            newCompletions[noteIndex] = { ...newCompletions[noteIndex], notes: note };
                                            setLocalCompletions(newCompletions);
                                        }
                                        globalMutate('dashboard-stats');
                                        toast.success('Reflection saved!');
                                    } catch {
                                        toast.error('Failed to save reflection.');
                                    }
                                }}
                                className="flex gap-2"
                            >
                                <input
                                    name="note"
                                    placeholder="Add a reflection note..."
                                    className="flex-1 text-xs bg-foreground/[0.03] text-foreground border border-foreground/[0.05] rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary transition-all placeholder:text-muted-foreground"
                                    defaultValue={localCompletions.find(c => c.date === today)?.notes || ''}
                                />
                                <button
                                    type="submit"
                                    className="text-[10px] uppercase tracking-wider font-bold px-3 py-1.5 rounded-lg bg-foreground/[0.05] hover:bg-foreground/[0.1] text-foreground transition-colors"
                                >
                                    Save
                                </button>
                            </form>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.article>
    );
}
