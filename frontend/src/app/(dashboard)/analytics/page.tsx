'use client';

import { useMemo } from 'react';
import useSWR from 'swr';
import { motion } from 'framer-motion';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, Cell, PieChart, Pie
} from 'recharts';
import { statsApi } from '@/lib/api';
import { Trophy, TrendingUp, PieChart as PieIcon, Calendar, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { getCategoryInfo } from '@/lib/utils';

export default function AnalyticsPage() {
    const { data: stats, error, isLoading } = useSWR('analytics', () => statsApi.analytics());

    const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316'];

    const chartData = useMemo(() => {
        if (!stats) return [];
        return stats.progression.map(p => ({
            ...p,
            displayDate: new Date(p.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        }));
    }, [stats]);

    if (isLoading) return <AnalyticsSkeleton />;

    return (
        <div className="max-w-6xl mx-auto px-4 py-6">
            <div className="mb-6 flex items-center gap-3">
                <Link href="/dashboard" className="p-2 hover:bg-white/5 rounded-xl transition-colors">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="text-2xl font-display font-bold tracking-tight">Insights & <span className="gradient-text">Analytics</span></h1>
                    <p className="text-muted-foreground text-[10px] uppercase tracking-wider font-bold opacity-50">Deep dive into your habits and momentum.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass p-4 rounded-xl border border-white/5"
                >
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 rounded-xl bg-primary/10 text-primary">
                            <Trophy className="w-5 h-5" />
                        </div>
                        <h3 className="font-bold text-sm uppercase tracking-wider text-white/40">Best Day</h3>
                    </div>
                    <p className="text-3xl font-display font-bold">{stats?.bestDay || 'N/A'}</p>
                    <p className="text-xs text-muted-foreground mt-1">Historically your most productive day.</p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="glass p-4 rounded-xl border border-white/5"
                >
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                            <TrendingUp className="w-5 h-5" />
                        </div>
                        <h3 className="font-bold text-sm uppercase tracking-wider text-white/40">Consistency</h3>
                    </div>
                    <p className="text-3xl font-display font-bold">
                        {stats ? Math.round(stats.progression.reduce((acc, curr) => acc + curr.rate, 0) / (stats.progression.length || 1)) : 0}%
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">Average completion rate this fortnight.</p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="glass p-4 rounded-xl border border-white/5"
                >
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
                            <PieIcon className="w-5 h-5" />
                        </div>
                        <h3 className="font-bold text-sm uppercase tracking-wider text-white/40">Top Category</h3>
                    </div>
                    <p className="text-3xl font-display font-bold">
                        {getCategoryInfo((([...(stats?.categoryStats || [])].sort((a, b) => b.count - a.count)[0]?.category || 'general')) as import('@/lib/types').HabitCategory).label}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">Where you're focusing most of your energy.</p>
                </motion.div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Progression Chart */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="glass p-4 rounded-xl border border-white/5 min-h-[300px]"
                >
                    <h2 className="text-base font-display font-bold mb-6">Completion Progression</h2>
                    <div className="h-[240px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData}>
                                <defs>
                                    <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                                <XAxis
                                    dataKey="displayDate"
                                    stroke="#ffffff30"
                                    fontSize={10}
                                    tickLine={false}
                                    axisLine={false}
                                    dy={10}
                                />
                                <YAxis
                                    stroke="#ffffff30"
                                    fontSize={10}
                                    tickLine={false}
                                    axisLine={false}
                                    unit="%"
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#1a1a1a',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: '16px',
                                        fontSize: '12px'
                                    }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="rate"
                                    stroke="#6366f1"
                                    strokeWidth={4}
                                    dot={{ r: 4, fill: '#6366f1', strokeWidth: 2, stroke: '#fff' }}
                                    activeDot={{ r: 6, strokeWidth: 0 }}
                                    animationDuration={1500}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* Category Distribution Chart */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="glass p-4 rounded-xl border border-white/5 min-h-[300px]"
                >
                    <h2 className="text-base font-display font-bold mb-6">Category Success Rates</h2>
                    <div className="h-[240px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={stats?.categoryStats}>
                                <XAxis
                                    dataKey="category"
                                    stroke="#ffffff30"
                                    fontSize={10}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(val) => getCategoryInfo(val as import('@/lib/types').HabitCategory).label.slice(0, 3)}
                                />
                                <Tooltip
                                    formatter={(value) => [`${value}% Success Rate`]}
                                    contentStyle={{
                                        backgroundColor: '#1a1a1a',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: '16px',
                                        fontSize: '12px'
                                    }}
                                />
                                <Bar dataKey="rate" radius={[8, 8, 0, 0]} animationDuration={1200}>
                                    {stats?.categoryStats.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}

function AnalyticsSkeleton() {
    return (
        <div className="max-w-6xl mx-auto px-4 py-8 animate-pulse">
            <div className="h-8 w-64 bg-white/5 rounded-xl mb-6" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {[1, 2, 3].map(i => <div key={i} className="h-24 bg-white/5 rounded-xl" />)}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {[1, 2].map(i => <div key={i} className="h-[300px] bg-white/5 rounded-xl" />)}
            </div>
        </div>
    );
}
