import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { HabitCategory, Milestone } from './types';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

// ── Date helpers ────────────────────────────────────────────────────────────

export function getTodayString(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

export function formatDate(dateStr: string): string {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function formatDateShort(dateStr: string): string {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function isToday(dateStr: string): boolean {
    return dateStr === getTodayString();
}

export function getRelativeTime(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return formatDate(dateStr);
}

// ── Streak helpers ───────────────────────────────────────────────────────────

export const MILESTONES: Milestone[] = [7, 21, 30];

export function getMilestone(streak: number): Milestone | null {
    if (streak === 30) return 30;
    if (streak === 21) return 21;
    if (streak === 7) return 7;
    return null;
}

export function getMilestoneMessage(milestone: Milestone): string {
    const messages: Record<Milestone, string> = {
        7: "🔥 One week streak! You're building momentum!",
        21: "⚡ 21-day streak! You've formed a habit!",
        30: "🏆 30-day streak! You're unstoppable!",
    };
    return messages[milestone];
}

export function getStreakEmoji(streak: number): string {
    if (streak >= 30) return '🏆';
    if (streak >= 21) return '⚡';
    if (streak >= 14) return '💎';
    if (streak >= 7) return '🔥';
    if (streak >= 3) return '✨';
    return '🌱';
}

// ── Category helpers ─────────────────────────────────────────────────────────

export const CATEGORIES: { value: HabitCategory; label: string; emoji: string }[] = [
    { value: 'health', label: 'Health', emoji: '💚' },
    { value: 'fitness', label: 'Fitness', emoji: '💪' },
    { value: 'learning', label: 'Learning', emoji: '📚' },
    { value: 'mindfulness', label: 'Mindfulness', emoji: '🧘' },
    { value: 'productivity', label: 'Productivity', emoji: '⚡' },
    { value: 'social', label: 'Social', emoji: '🤝' },
    { value: 'creativity', label: 'Creativity', emoji: '🎨' },
    { value: 'finance', label: 'Finance', emoji: '💰' },
    { value: 'general', label: 'General', emoji: '⭐' },
];

export function getCategoryInfo(category: HabitCategory) {
    return CATEGORIES.find((c) => c.value === category) || CATEGORIES[8];
}

export function getCategoryClass(category: HabitCategory): string {
    return `cat-${category}`;
}

// ── Completion check ─────────────────────────────────────────────────────────

export function isCompletedToday(completions: { date: string }[]): boolean {
    const today = getTodayString();
    return completions.some((c) => c.date === today);
}

// ── Heatmap intensity to color ───────────────────────────────────────────────

export function intensityToColor(intensity: number): string {
    if (intensity === 0) return 'color-mix(in srgb, var(--foreground), transparent 95%)'; // empty
    if (intensity <= 0.33) return 'rgba(99, 102, 241, 0.3)'; // habit color is indigo (#6366f1)
    if (intensity <= 0.66) return 'rgba(99, 102, 241, 0.6)';
    if (intensity < 1) return 'rgba(99, 102, 241, 0.85)';
    return 'rgba(99, 102, 241, 1)'; // 100%
}

// ── Number formatting ─────────────────────────────────────────────────────────

export function formatPercent(n: number): string {
    return `${Math.round(n)}%`;
}
