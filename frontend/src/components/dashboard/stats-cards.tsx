'use client';

import { motion } from 'framer-motion';
import { Flame, TrendingUp, CheckCircle2, BarChart2 } from 'lucide-react';
import { DashboardStats } from '@/lib/types';
import { getStreakEmoji, formatPercent } from '@/lib/utils';
import { StatCardSkeleton } from '@/components/ui/skeleton';

interface StatsCardsProps {
    stats: DashboardStats | null;
    loading: boolean;
}

interface StatCardProps {
    label: string;
    value: string;
    sub?: string;
    icon: React.ElementType;
    gradient: string;
    accent: string;
    index: number;
}

function StatCard({
    label,
    value,
    sub,
    icon: Icon,
    gradient,
    accent,
    index,
}: StatCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="glass glass-hover rounded-2xl p-6 relative overflow-hidden group shadow-sm hover:shadow-card transition-shadow"
        >
            {/* Top accent line */}
            <div
                className="absolute top-0 left-0 right-0 h-0.5 opacity-40 dark:opacity-40 opacity-20"
                style={{ background: accent }}
            />

            <div className="flex items-start justify-between mb-4">
                <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
                        {label}
                    </p>
                    <div className="flex items-baseline gap-1">
                        <h3 className="text-3xl font-display font-bold leading-tight tracking-tight text-foreground">
                            {value}
                        </h3>
                    </div>
                </div>
                <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 duration-500 shadow-lg"
                    style={{ background: gradient }}
                    aria-hidden="true"
                >
                    <Icon className="w-5 h-5 text-white" />
                </div>
            </div>

            {sub && (
                <div className="flex items-center gap-1.5 mt-auto">
                    <span className="text-xs font-medium text-muted-foreground">
                        {sub}
                    </span>
                </div>
            )}

            {/* Background interactive gradient blur */}
            <div
                className="absolute -bottom-4 -right-4 w-20 h-20 blur-3xl rounded-full opacity-0 group-hover:opacity-10 dark:group-hover:opacity-20 transition-opacity duration-700 pointer-events-none"
                style={{ background: accent }}
            />
        </motion.div>
    );
}

export default function StatsCards({ stats, loading }: StatsCardsProps) {
    if (loading) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {[1, 2, 3, 4].map((i) => <StatCardSkeleton key={i} />)}
            </div>
        );
    }

    if (!stats) return null;

    const cards = [
        {
            label: 'Current Streak',
            value: `${stats.currentStreak}d`,
            sub: `Best: ${stats.longestStreak} days`,
            icon: Flame,
            gradient: 'linear-gradient(135deg, #f97316, #ef4444)',
            accent: '#f97316',
        },
        {
            label: 'Completion Rate',
            value: formatPercent(stats.overallCompletionRate),
            sub: 'L30 Activity',
            icon: TrendingUp,
            gradient: 'linear-gradient(135deg, var(--primary), #5848d8)',
            accent: 'var(--primary)',
        },
        {
            label: 'Total Habits',
            value: String(stats.totalHabits),
            sub: 'Daily Actions',
            icon: CheckCircle2,
            gradient: 'linear-gradient(135deg, var(--accent), #00b388)',
            accent: 'var(--accent)',
        },
        {
            label: 'Consistency',
            value: `${stats.longestStreak}d`,
            sub: stats.longestStreak >= 7 ? 'Elite Level' : 'Developing',
            icon: BarChart2,
            gradient: 'linear-gradient(135deg, #8b5cf6, #6c63ff)',
            accent: '#8b5cf6',
        },
    ];

    return (
        <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
            aria-label="Dashboard statistics"
        >
            {cards.map((card, i) => (
                <StatCard key={card.label} {...card} index={i} />
            ))}
        </div>
    );
}
