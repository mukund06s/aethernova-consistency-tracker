'use client';

import { useCallback } from 'react';
import confetti from 'canvas-confetti';
import { useAuth } from '@/contexts/auth-context';

export function useCompletionFeedback() {
    const { user } = useAuth();

    const triggerConfetti = useCallback((x?: number, y?: number) => {
        if (!user?.confettiEnabled) return;

        const origin = x !== undefined && y !== undefined
            ? { x: x / window.innerWidth, y: y / window.innerHeight }
            : { y: 0.6 };

        confetti({
            particleCount: 120,
            spread: 80,
            origin,
            colors: ['#6366f1', '#10b981', '#ffffff', '#fbbf24'],
        });
    }, [user?.confettiEnabled]);

    const playSound = useCallback(() => {
        if (!user?.soundEnabled) return;

        try {
            const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
            const oscillator = audioCtx.createOscillator();
            const gainNode = audioCtx.createGain();

            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5

            gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
            gainNode.gain.linearRampToValueAtTime(0.3, audioCtx.currentTime + 0.01); // Attack
            gainNode.gain.linearRampToValueAtTime(0.1, audioCtx.currentTime + 0.1); // Decay
            gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime + 0.3); // Sustain
            gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.4); // Release

            oscillator.connect(gainNode);
            gainNode.connect(audioCtx.destination);

            oscillator.start();
            oscillator.stop(audioCtx.currentTime + 0.4);

            // Close context after playback to save resources
            setTimeout(() => {
                audioCtx.close();
            }, 500);
        } catch (error) {
            console.error('Failed to play completion sound:', error);
        }
    }, [user?.soundEnabled]);

    const triggerFeedback = useCallback((event?: React.MouseEvent | { clientX: number, clientY: number }) => {
        if (event) {
            triggerConfetti(event.clientX, event.clientY);
        } else {
            triggerConfetti();
        }
        playSound();
    }, [triggerConfetti, playSound]);

    return { triggerFeedback };
}
