'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import AmbientBackground from '@/components/AmbientBackground';
import ThemeToggle from '@/components/layout/theme-toggle';

export default function LandingPage() {
    const { user, loading } = useAuth();
    const router = useRouter();

    // Redirect logged-in users away from the public landing page
    useEffect(() => {
        if (!loading && user) {
            router.replace('/dashboard');
        }
    }, [user, loading, router]);

    // Show nothing while checking auth (avoids flash of landing page for logged-in users)
    if (loading || user) return null;

    return (
        <div className="relative min-h-screen overflow-hidden flex flex-col">
            <AmbientBackground />

            <div className="relative z-10 flex flex-col min-h-screen">
                {/* Header / Nav */}
                <header className="fixed top-0 w-full z-50 px-6 py-4">
                    <nav className="max-w-7xl mx-auto flex items-center justify-between glass px-6 py-3 rounded-2xl">
                        <div className="flex items-center gap-2.5">
                            <div
                                className="w-8 h-8 rounded-lg flex items-center justify-center bg-primary shadow-lg shadow-primary-glow"
                                aria-hidden="true"
                            >
                                <Sparkles className="w-4 h-4 text-white" />
                            </div>
                            <span className="font-bold text-lg font-display tracking-tight">AetherNova</span>
                        </div>

                        <div className="flex items-center gap-4">
                            <ThemeToggle />
                            <Link href="/login" className="text-sm font-medium text-foreground opacity-70 hover:opacity-100 transition-opacity">
                                Sign In
                            </Link>
                            <Link href="/register" className="btn-premium btn-premium-primary text-xs !py-2 px-4">
                                Get Started
                            </Link>
                        </div>
                    </nav>
                </header>

                <main className="flex-1 flex flex-col pt-32 pb-20 px-6 relative">
                    {/* Hero Section */}
                    <section className="max-w-4xl mx-auto relative w-full text-center">
                        <motion.div
                            initial="hidden"
                            animate="visible"
                            variants={{
                                hidden: { opacity: 0, y: 30 },
                                visible: {
                                    opacity: 1,
                                    y: 0,
                                    transition: {
                                        staggerChildren: 0.15,
                                        duration: 1,
                                        ease: [0.16, 1, 0.3, 1]
                                    }
                                }
                            }}
                        >
                            <motion.div
                                variants={{ hidden: { opacity: 0, scale: 0.9 }, visible: { opacity: 1, scale: 1 } }}
                                className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold uppercase tracking-widest mb-8"
                            >
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                                </span>
                                Experience the New standard of habit tracking
                            </motion.div>

                            <motion.h1
                                variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                                className="text-6xl md:text-8xl font-display font-bold tracking-tight mb-8 leading-[1.05] drop-shadow-[0_0_20px_rgba(255,255,255,0.05)]"
                            >
                                Build Consistency <br />
                                <span className="gradient-text">That Compounds.</span>
                            </motion.h1>

                            <motion.p
                                aria-label="Description"
                                variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                                className="text-xl md:text-2xl text-foreground/60 max-w-2xl mx-auto mb-16 leading-relaxed"
                            >
                                AetherNova helps you design a high-performance life through beautiful,
                                minimalist habit tracking and deep activity insights.
                            </motion.p>

                            <motion.div
                                variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                                className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-24"
                            >
                                <Link href="/register" className="btn-premium btn-premium-primary h-16 px-10 text-lg w-full sm:w-auto shadow-[0_0_20px_rgba(108,99,255,0.3)]">
                                    Get Started Free
                                    <ArrowRight className="w-5 h-5 ml-1.5" />
                                </Link>
                            </motion.div>
                        </motion.div>
                    </section>

                    {/* Product Preview Card */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 50 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ duration: 1, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
                        className="relative w-full max-w-5xl mx-auto"
                    >
                        <div className="relative rounded-3xl overflow-hidden glass p-5 md:p-8 shadow-2xl group animate-float" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>

                            {/* Mock top bar */}
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, var(--primary), var(--accent))' }}>
                                        <Sparkles className="w-3.5 h-3.5 text-white" />
                                    </div>
                                    <span className="text-sm font-bold font-display opacity-80">AetherNova</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider" style={{ background: 'rgba(0,229,186,0.1)', color: 'var(--accent)', border: '1px solid rgba(0,229,186,0.2)' }}>
                                        🔥 12 Day Streak
                                    </div>
                                    <div className="w-7 h-7 rounded-full" style={{ background: 'linear-gradient(135deg, var(--primary), var(--accent))' }} />
                                </div>
                            </div>

                            {/* Mock stat cards */}
                            <div className="grid grid-cols-3 gap-3 mb-6">
                                {[
                                    { label: 'Total Habits', value: '8', sub: '↑ 2 this week', color: 'var(--primary)' },
                                    { label: 'Best Streak', value: '21', sub: '🏆 Personal best', color: 'var(--accent)' },
                                    { label: 'Completed Today', value: '5/8', sub: '62% done', color: '#a78bfa' },
                                ].map((stat, i) => (
                                    <div key={i} className="rounded-2xl p-4 relative overflow-hidden" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                                        <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl" style={{ background: stat.color, opacity: 0.6 }} />
                                        <p className="text-[10px] uppercase tracking-widest font-bold opacity-40 mb-2">{stat.label}</p>
                                        <p className="text-2xl font-display font-bold" style={{ color: stat.color }}>{stat.value}</p>
                                        <p className="text-[10px] opacity-40 mt-1 font-medium">{stat.sub}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Mock habit rows */}
                            <div className="space-y-2 mb-6">
                                <p className="text-[10px] uppercase tracking-widest font-bold opacity-30 mb-3">Today&apos;s Habits</p>
                                {[
                                    { title: 'Morning Meditation', cat: 'Mindfulness', catColor: 'rgba(168,85,247,0.15)', catText: '#c084fc', streak: 12, done: true },
                                    { title: 'Read 30 Minutes', cat: 'Learning', catColor: 'rgba(59,130,246,0.15)', catText: '#60a5fa', streak: 7, done: true },
                                    { title: 'Evening Run', cat: 'Fitness', catColor: 'rgba(249,115,22,0.15)', catText: '#fb923c', streak: 4, done: false },
                                ].map((habit, i) => (
                                    <div key={i} className="flex items-center gap-3 p-3 rounded-xl transition-colors hover:translate-y-[-2px] duration-300 ease-out" style={{ background: habit.done ? 'rgba(0,229,186,0.03)' : 'rgba(255,255,255,0.02)', border: `1px solid ${habit.done ? 'rgba(0,229,186,0.15)' : 'rgba(255,255,255,0.05)'}` }}>
                                        {/* Checkbox */}
                                        <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-sm" style={{ background: habit.done ? 'var(--accent)' : 'rgba(255,255,255,0.05)', border: habit.done ? 'none' : '1px solid rgba(255,255,255,0.1)' }}>
                                            {habit.done ? '✓' : ''}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-0.5">
                                                <p className="text-sm font-semibold truncate" style={{ opacity: habit.done ? 0.4 : 1, textDecoration: habit.done ? 'line-through' : 'none' }}>{habit.title}</p>
                                                <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold flex-shrink-0" style={{ background: habit.catColor, color: habit.catText }}>{habit.cat}</span>
                                            </div>
                                            <p className="text-[10px] opacity-30 font-medium">🔥 {habit.streak} day streak</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Daily progress bar */}
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-[10px] uppercase tracking-widest font-bold opacity-30">Daily Progress</span>
                                    <span className="text-[10px] font-bold" style={{ color: 'var(--accent)' }}>62%</span>
                                </div>
                                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                                    <div className="h-full rounded-full w-[62%]" style={{ background: 'linear-gradient(90deg, var(--primary), var(--accent))' }} />
                                </div>
                            </div>

                            {/* Overlay Shine */}
                            <div className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-transparent via-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                        </div>

                        {/* Shadow Blur */}
                        <div className="absolute -inset-4 z-[-1] bg-primary/20 blur-[80px] rounded-full opacity-30" />
                    </motion.div>
                </main>

                <footer className="py-12 px-6 border-t border-white/5 relative">
                    <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-2 opacity-50">
                            <Sparkles className="w-4 h-4" />
                            <span className="text-sm font-semibold">AetherNova &copy; 2026</span>
                        </div>
                        <div className="flex gap-8 text-xs font-medium opacity-50">
                            <a href="#" className="hover:opacity-100 transition-opacity">Privacy</a>
                            <a href="#" className="hover:opacity-100 transition-opacity">Terms</a>
                            <a href="#" className="hover:opacity-100 transition-opacity">Changelog</a>
                        </div>
                    </div>
                </footer>

                <style jsx>{`
                    @keyframes float {
                        0%, 100% { transform: translateY(0); }
                        50% { transform: translateY(-10px); }
                    }
                    .animate-float {
                        animation: float 6s ease-in-out infinite;
                    }
                `}</style>
            </div>
        </div>
    );
}
