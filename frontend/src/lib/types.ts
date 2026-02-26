// ── TypeScript Types ──────────────────────────────────────────────────────

export interface User {
    id: string;
    name: string;
    email: string;
    reminderTime?: string;
    confettiEnabled: boolean;
    soundEnabled: boolean;
    createdAt: string;
}

export type HabitCategory =
    | 'health'
    | 'fitness'
    | 'learning'
    | 'mindfulness'
    | 'productivity'
    | 'social'
    | 'creativity'
    | 'finance'
    | 'general';

export interface Habit {
    id: string;
    userId: string;
    title: string;
    description?: string;
    category: HabitCategory;
    order: number;
    archived: boolean;
    freezesAvailable: number;
    frozenUntil?: string | null;
    isFrozen: boolean;
    createdAt: string;
    updatedAt: string;
    currentStreak?: number;
    longestStreak?: number;
    completions?: HabitCompletion[];
}

export interface HabitCompletion {
    id: string;
    habitId: string;
    userId: string;
    date: string; // "YYYY-MM-DD"
    notes?: string;
    completedAt: string;
}

export interface DashboardStats {
    totalHabits: number;
    currentStreak: number;
    longestStreak: number;
    overallCompletionRate: number;
    weeklyData: WeeklyDataPoint[];
    heatmap: HeatmapPoint[];
}

export interface WeeklyDataPoint {
    date: string;
    day: string;
    completed: number;
    total: number;
    rate: number;
}

export interface HeatmapPoint {
    date: string;
    completed: number;
    total: number;
    intensity: number; // 0–1
}

export interface HabitStats {
    currentStreak: number;
    longestStreak: number;
    totalCompletions: number;
    completionRate: number;
    daysSinceCreated: number;
}

export interface AnalyticsData {
    categoryStats: {
        category: string;
        count: number;
        rate: number;
    }[];
    progression: {
        date: string;
        rate: number;
    }[];
    bestDay: string;
}

export interface WeeklyReviewData {
    hasHabits: boolean;
    weekRange: { start: string; end: string };
    completionRate: number;
    bestHabit: { title: string; completions: number; streak: number; color: string } | null;
    perfectHabits: { id: string; title: string; color: string }[];
    needsAttentionHabits: { id: string; title: string; missedDays: number; color: string }[];
    totalHabits: number;
    totalCompletions: number;
}

export interface Quote {
    text: string;
    author: string;
    date?: string;
}

export interface ApiResponse<T = unknown> {
    success: boolean;
    message?: string;
    data?: T;
    errors?: Record<string, string>;
}

export interface PaginationMeta {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export type Milestone = 7 | 21 | 30;
