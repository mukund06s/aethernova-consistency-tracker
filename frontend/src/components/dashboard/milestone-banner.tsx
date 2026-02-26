'use client';

import { useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Trophy, X, Flame, Zap } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import type { Milestone } from '@/lib/types';
import { getMilestoneMessage } from '@/lib/utils';

interface MilestoneBannerProps {
    milestone: Milestone | null;
    onClose: () => void;
}

const MILESTONE_ICONS: Record<Milestone, React.ReactNode> = {
    7: <Flame className="w-6 h-6 text-orange-400" aria-hidden="true" />,
    21: <Zap className="w-6 h-6 text-yellow-400" aria-hidden="true" />,
    30: <Trophy className="w-6 h-6 text-yellow-300" aria-hidden="true" />,
};

const MILESTONE_COLORS: Record<Milestone, string> = {
    7: 'rgba(249,115,22,0.15)',
    21: 'rgba(234,179,8,0.15)',
    30: 'rgba(250,204,21,0.2)',
};

export default function MilestoneBanner({ milestone, onClose }: MilestoneBannerProps) {
    const { user } = useAuth();
    const firedRef = useRef(false);

    const fireConfetti = useCallback(() => {
        if (firedRef.current || !user?.confettiEnabled) return;
        firedRef.current = true;

        // Respect reduced motion preference
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

        // Max 80 particles per spec
        const count = milestone === 30 ? 80 : milestone === 21 ? 60 : 40;
        const colors =
            milestone === 30
                ? ['#FFD700', '#FFA500', '#FF6B00', '#6c63ff']
                : milestone === 21
                    ? ['#6c63ff', '#00d4aa', '#8A85FF']
                    : ['#00d4aa', '#6c63ff', '#fff'];

        void confetti({
            particleCount: Math.floor(count / 2),
            angle: 60,
            spread: 55,
            origin: { x: 0 },
            colors,
            gravity: 0.8,
        });

        void confetti({
            particleCount: Math.floor(count / 2),
            angle: 120,
            spread: 55,
            origin: { x: 1 },
            colors,
            gravity: 0.8,
        });
    }, [milestone]);

    useEffect(() => {
        if (milestone) {
            firedRef.current = false;
            const timeout = setTimeout(fireConfetti, 300);
            return () => clearTimeout(timeout);
        }
    }, [milestone, fireConfetti]);

    return (
        <AnimatePresence>
            {milestone && (
                <motion.div
                    initial={{ opacity: 0, y: -20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20, scale: 0.95 }}
                    transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                    className="fixed top-4 left-1/2 -translate-x-1/2 z-50 max-w-sm w-full mx-auto px-4"
                    role="alert"
                    aria-live="assertive"
                    aria-atomic="true"
                >
                    <div
                        className="rounded-2xl px-5 py-4 flex items-center gap-3 shadow-2xl"
                        style={{
                            background: MILESTONE_COLORS[milestone],
                            border: '1px solid rgba(255,255,255,0.15)',
                            backdropFilter: 'blur(20px)',
                            boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
                        }}
                    >
                        <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                            style={{ background: 'rgba(255,255,255,0.1)' }}
                        >
                            {MILESTONE_ICONS[milestone]}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="font-bold text-sm leading-tight">
                                {milestone}-Day Milestone! 🎉
                            </p>
                            <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.75)' }}>
                                {getMilestoneMessage(milestone)}
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-1 rounded-lg hover:bg-white/10 transition-colors flex-shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
                            aria-label="Dismiss milestone celebration"
                        >
                            <X className="w-4 h-4" aria-hidden="true" />
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
