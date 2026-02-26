'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { motion, AnimatePresence } from 'framer-motion';
import { statsApi } from '@/lib/api';
import { useAuth } from '@/contexts/auth-context';
import StatsCards from '@/components/dashboard/stats-cards';
import DailyQuote from '@/components/dashboard/daily-quote';
import WeeklyChart from '@/components/dashboard/weekly-chart';
import HeatmapGrid from '@/components/dashboard/heatmap-grid';
import SettingsCard from '@/components/dashboard/settings-card';
import { ErrorState } from '@/components/ui/error-state';
import { Skeleton } from '@/components/ui/skeleton';
import { useUI } from '@/contexts/ui-context';
import { Trophy } from 'lucide-react';

const fetchDashboardStats = () => statsApi.dashboard();

export default function DashboardPage() {
    const { user } = useAuth();
    const { toggleWeeklyReview } = useUI();
    const [selectedDate, setSelectedDate] = useState<import('@/lib/types').HeatmapPoint | null>(null);

    const {
        data: stats,
        error,
        isLoading,
        mutate,
    } = useSWR('dashboard-stats', fetchDashboardStats, {
        revalidateOnFocus: false,
        dedupingInterval: 30_000, // re-fetch at most every 30 s
    });

    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening';

    if (error) {
        return <ErrorState message="Failed to load dashboard." onRetry={() => mutate()} />;
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
        >
            {/* Page header */}
            <motion.div
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="mb-8 flex items-end justify-between"
            >
                <div>
                    <h1 className="text-3xl font-display font-bold tracking-tight">
                        Good{' '}
                        <span className="gradient-text">{greeting}</span>
                        {user?.name ? `, ${user.name.split(' ')[0]}` : ''} 👋
                    </h1>
                    <p className="text-sm mt-1 text-muted-foreground">
                        {new Date().toLocaleDateString('en-US', {
                            weekday: 'long',
                            month: 'long',
                            day: 'numeric',
                        })}
                    </p>
                </div>
                <button
                    onClick={toggleWeeklyReview}
                    className="px-5 py-2.5 rounded-2xl bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-2 group"
                >
                    <Trophy className="w-4 h-4 group-hover:animate-bounce" />
                    Weekly Review
                </button>
            </motion.div>

            {/* Stats Cards */}
            <StatsCards stats={stats ?? null} loading={isLoading} />

            {/* Daily Quote */}
            <div className="mb-8">
                <DailyQuote />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* Weekly Chart */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1, duration: 0.4 }}
                    className="lg:col-span-2 rounded-2xl glass p-6"
                >
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-base font-semibold font-display">Weekly Activity</h2>
                        <div className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] uppercase tracking-wider font-bold opacity-60">
                            Last 7 Days
                        </div>
                    </div>
                    {isLoading ? (
                        <Skeleton className="h-64 rounded-xl" />
                    ) : (
                        <div className="h-64">
                            <WeeklyChart data={stats?.weeklyData ?? []} />
                        </div>
                    )}
                </motion.div>

                {/* Settings & Reminders */}
                <motion.div
                    id="settings"
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.4 }}
                    className="lg:col-span-1 scroll-mt-8"
                >
                    <SettingsCard />
                </motion.div>
            </div>

            {/* 90-day Heatmap */}
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.4 }}
                className="rounded-2xl glass p-6"
            >
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-base font-semibold font-display">Consistency Map</h2>
                        <p className="text-xs opacity-50 mt-0.5">Your activity over the last 90 days</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-accent pulse-glow" />
                        <span className="text-xs font-medium opacity-70">Live Tracking</span>
                    </div>
                </div>
                {isLoading ? (
                    <Skeleton className="h-32 rounded-xl" />
                ) : (
                    <>
                        <HeatmapGrid data={stats?.heatmap ?? []} onCellClick={setSelectedDate} />

                        <AnimatePresence>
                            {selectedDate && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="pt-6 mt-6 border-t border-white/5"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div
                                                className="w-12 h-12 rounded-xl flex flex-col items-center justify-center border border-white/10"
                                                style={{ background: 'rgba(255,255,255,0.03)' }}
                                            >
                                                <span className="text-[10px] font-bold opacity-40 uppercase">{new Date(selectedDate.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short' })}</span>
                                                <span className="text-lg font-display font-bold leading-none">{new Date(selectedDate.date + 'T00:00:00').getDate()}</span>
                                            </div>
                                            <div>
                                                <p className="text-xs font-semibold opacity-50">
                                                    {new Date(selectedDate.date + 'T00:00:00').toLocaleDateString('en-US', {
                                                        weekday: 'long',
                                                        year: 'numeric'
                                                    })}
                                                </p>
                                                <p className="text-base font-bold text-foreground">
                                                    {selectedDate.completed} of {selectedDate.total} habits completed
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => setSelectedDate(null)}
                                            className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-bold transition-colors"
                                        >
                                            Close
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </>
                )}
            </motion.div>
        </motion.div>
    );
}
