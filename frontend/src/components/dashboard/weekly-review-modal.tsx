'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Trophy, TrendingUp, Zap, Share2 } from 'lucide-react';
import useSWR from 'swr';
import { statsApi } from '@/lib/api';
import { CheckSquare as CheckIcon } from 'lucide-react';
import { toast } from 'sonner';

interface WeeklyReviewModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function WeeklyReviewModal({ isOpen, onClose }: WeeklyReviewModalProps) {
    const { data: weeklyReview, isLoading } = useSWR(
        isOpen ? 'weekly-review' : null,
        () => statsApi.weeklyReview()
    );

    const handleShare = () => {
        toast.info('Sharing to social media... (Feature coming soon!)');
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100]"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 30 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 30 }}
                        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg z-[101] px-4"
                    >
                        <div className="glass glass-hover rounded-[2rem] p-10 shadow-2xl border border-foreground/[0.05] text-center relative overflow-hidden">
                            {/* Background glows */}
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-accent to-primary opacity-50" />
                            <div className="absolute -top-20 -right-20 w-64 h-64 bg-primary/10 blur-[100px] rounded-full" />
                            <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-accent/10 blur-[100px] rounded-full" />

                            <button onClick={onClose} className="absolute top-6 right-6 p-2 hover:bg-foreground/[0.05] rounded-full transition-colors text-foreground/40 hover:text-foreground">
                                <X className="w-5 h-5" />
                            </button>

                            {isLoading ? (
                                <div className="space-y-6">
                                    <div className="flex flex-col items-center gap-2">
                                        <div className="h-8 w-48 skeleton" />
                                        <div className="h-4 w-64 skeleton" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        {[1, 2, 3, 4].map(i => <div key={i} className="h-24 rounded-2xl skeleton" />)}
                                    </div>
                                    <div className="h-20 rounded-2xl skeleton" />
                                </div>
                            ) : weeklyReview?.hasHabits === false ? (
                                <div className="py-10 flex flex-col items-center">
                                    <div className="text-5xl mb-6 text-foreground/20">◈</div>
                                    <h2 className="text-xl font-bold text-foreground mb-2">No habits yet</h2>
                                    <p className="text-sm text-foreground/50 mb-8 max-w-[280px] mx-auto">
                                        Start tracking habits this week to see your review next Monday
                                    </p>
                                    <button
                                        onClick={onClose}
                                        className="w-full py-4 rounded-2xl bg-primary text-white font-bold hover:bg-primary/90 transition-all active:scale-95 shadow-lg shadow-primary/20"
                                    >
                                        Add My First Habit →
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <motion.div
                                        initial={{ scale: 0.8, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        transition={{ delay: 0.2, type: "spring" }}
                                        className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-primary to-accent shadow-lg shadow-primary/20 mb-8"
                                    >
                                        <Trophy className="w-10 h-10 text-white" />
                                    </motion.div>

                                    <h2 className="text-3xl font-display font-bold text-foreground mb-2">Weekly Momentum!</h2>
                                    <p className="text-muted-foreground mb-8">{weeklyReview?.weekRange.start} – {weeklyReview?.weekRange.end}</p>

                                    <div className="grid grid-cols-2 gap-4 mb-10">
                                        {[
                                            {
                                                label: 'Completions',
                                                value: weeklyReview?.totalCompletions,
                                                icon: CheckIcon,
                                                color: weeklyReview?.totalCompletions === 0 ? 'text-red-500' : 'text-emerald-500'
                                            },
                                            {
                                                label: 'Success Rate',
                                                value: `${weeklyReview?.completionRate}%`,
                                                icon: TrendingUp,
                                                color: weeklyReview?.totalCompletions === 0 || (weeklyReview?.completionRate && weeklyReview.completionRate < 30) ? 'text-red-500' : 'text-primary'
                                            },
                                            {
                                                label: 'Best Habit',
                                                value: weeklyReview?.bestHabit?.title || 'None',
                                                icon: Trophy,
                                                color: 'text-amber-500'
                                            },
                                            {
                                                label: 'Best Streak',
                                                value: `${weeklyReview?.bestHabit?.streak || 0}d`,
                                                icon: Zap,
                                                color: 'text-rose-500'
                                            }
                                        ].map((item, idx) => (
                                            <div key={idx} className="bg-foreground/[0.03] border border-foreground/[0.05] rounded-2xl p-4 sm:p-5 flex flex-col items-center justify-center min-w-0">
                                                <span className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground mb-2 text-center">{item.label}</span>
                                                <span className={`text-xl md:text-2xl font-display font-bold truncate max-w-full px-1 ${item.color}`}>
                                                    {item.label === 'Best Habit' && weeklyReview?.totalCompletions === 0 ? 'No completions' : item.value}
                                                </span>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="bg-primary/[0.03] border border-primary/10 rounded-2xl p-6 mb-10">
                                        <p className="text-xs font-bold text-primary uppercase tracking-widest mb-3">Perfect This Week</p>
                                        <div className="flex flex-wrap justify-center gap-2">
                                            {weeklyReview?.perfectHabits.length ? weeklyReview.perfectHabits.map(h => (
                                                <div key={h.id} className="px-3 py-1.5 rounded-full text-[10px] font-bold bg-foreground/[0.04] border border-foreground/[0.08] text-foreground flex items-center gap-1.5">
                                                    <div className="w-1.5 h-1.5 rounded-full shadow-sm" style={{ backgroundColor: h.color }} />
                                                    {h.title}
                                                </div>
                                            )) : (
                                                <p className="text-sm text-muted-foreground italic">No perfect habits last week.</p>
                                            )}
                                        </div>
                                    </div>

                                    {weeklyReview?.needsAttentionHabits.length ? (
                                        <div className="bg-red-500/[0.03] border border-red-500/10 rounded-2xl p-6 mb-10">
                                            <p className="text-xs font-bold text-red-500 uppercase tracking-widest mb-3">Needs Attention</p>
                                            <div className="flex flex-wrap justify-center gap-2">
                                                {weeklyReview.needsAttentionHabits.map(h => (
                                                    <div key={h.id} className="px-3 py-1.5 rounded-full text-[10px] font-bold bg-foreground/[0.04] border border-red-500/20 text-foreground">
                                                        {h.title} <span className="text-red-500 ml-1">({h.missedDays} missed)</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ) : null}

                                    <div className="flex flex-col sm:flex-row gap-4">
                                        <button
                                            onClick={handleShare}
                                            className="flex-1 py-4 rounded-2xl bg-foreground text-background font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-all active:scale-95 disabled:opacity-50"
                                            disabled={weeklyReview?.totalCompletions === 0}
                                        >
                                            <Share2 className="w-5 h-5" />
                                            Share Progress
                                        </button>
                                        <button
                                            onClick={onClose}
                                            className="flex-1 py-4 rounded-2xl bg-foreground/[0.05] hover:bg-foreground/[0.1] text-foreground font-bold transition-colors border border-foreground/[0.05]"
                                        >
                                            Keep Going →
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
