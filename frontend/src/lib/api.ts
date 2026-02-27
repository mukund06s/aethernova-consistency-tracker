import { ApiResponse } from './types';

const API_URL = process.env.NODE_ENV === 'production' ? '' : (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000');

class ApiError extends Error {
    constructor(
        public statusCode: number,
        message: string,
        public errors?: Record<string, string>
    ) {
        super(message);
        this.name = 'ApiError';
    }
}

async function request<T>(
    path: string,
    options: RequestInit = {}
): Promise<T> {
    const url = `${API_URL}/api${path}`;

    const response = await fetch(url, {
        ...options,
        credentials: 'include', // send httpOnly cookies
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
    });

    let data: ApiResponse<T>;
    try {
        data = await response.json();
    } catch {
        throw new ApiError(response.status, 'Invalid server response.');
    }

    if (!response.ok || !data.success) {
        throw new ApiError(
            response.status,
            data.message || 'Something went wrong.',
            data.errors
        );
    }

    return data.data as T;
}

// ── Auth ────────────────────────────────────────────────────────────────────

export const authApi = {
    register: (data: { name: string; email: string; password: string }) =>
        request<{ user: import('./types').User }>('/auth/register', {
            method: 'POST',
            body: JSON.stringify(data),
        }),

    login: (data: { email: string; password: string }) =>
        request<{ user: import('./types').User }>('/auth/login', {
            method: 'POST',
            body: JSON.stringify(data),
        }),

    logout: () =>
        request<null>('/auth/logout', { method: 'POST' }),

    me: () =>
        request<{ user: import('./types').User }>('/auth/me'),

    updateSettings: (data: { name?: string; reminderTime?: string; confettiEnabled?: boolean; soundEnabled?: boolean }) =>
        request<{ user: import('./types').User }>('/auth/settings', {
            method: 'PATCH',
            body: JSON.stringify(data),
        }),

    deleteAccount: () =>
        request<null>('/auth/account', { method: 'DELETE' }),
};

// ── Habits ──────────────────────────────────────────────────────────────────

export const habitsApi = {
    list: (showArchived = false) =>
        request<{ habits: import('./types').Habit[] }>(`/habits?archived=${showArchived}`),

    get: (id: string) =>
        request<{ habit: import('./types').Habit }>(`/habits/${id}`),

    create: (data: { title: string; description?: string; category?: string }) =>
        request<{ habit: import('./types').Habit }>('/habits', {
            method: 'POST',
            body: JSON.stringify(data),
        }),

    update: (id: string, data: { title?: string; description?: string; category?: string }) =>
        request<{ habit: import('./types').Habit }>(`/habits/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        }),

    delete: (id: string) =>
        request<null>(`/habits/${id}`, { method: 'DELETE' }),

    reorder: (habits: { id: string; order: number }[]) =>
        request<null>('/habits/reorder/batch', {
            method: 'PATCH',
            body: JSON.stringify({ habits }),
        }),

    archive: (id: string) =>
        request<{ habit: import('./types').Habit }>(`/habits/${id}/archive`, {
            method: 'PATCH',
        }),

    freeze: (id: string, days: number) =>
        request<{ habit: import('./types').Habit }>(`/habits/${id}/freeze`, {
            method: 'POST',
            body: JSON.stringify({ days: String(days) }),
        }),

    unfreeze: (id: string) =>
        request<{ habit: import('./types').Habit }>(`/habits/${id}/freeze`, {
            method: 'DELETE',
        }),
};

// ── Completions ─────────────────────────────────────────────────────────────

export const completionsApi = {
    complete: (habitId: string, notes?: string) =>
        request<{ completion: import('./types').HabitCompletion; currentStreak: number; longestStreak: number }>(
            `/completions/${habitId}`,
            { method: 'POST', body: JSON.stringify({ notes }) }
        ),

    undo: (habitId: string, date: string) =>
        request<null>(`/completions/${habitId}/${date}`, { method: 'DELETE' }),

    updateNote: (habitId: string, date: string, notes: string) =>
        request<{ completion: import('./types').HabitCompletion }>(`/completions/${habitId}/${date}`, {
            method: 'PATCH',
            body: JSON.stringify({ notes }),
        }),

    history: (habitId: string, page = 1, limit = 50) =>
        request<{
            completions: import('./types').HabitCompletion[];
            pagination: import('./types').PaginationMeta;
        }>(`/completions/${habitId}?page=${page}&limit=${limit}`),
};

// ── Stats ───────────────────────────────────────────────────────────────────

export const statsApi = {
    dashboard: () =>
        request<import('./types').DashboardStats>('/stats'),

    habit: (id: string) =>
        request<import('./types').HabitStats>(`/stats/habit/${id}`),

    analytics: () =>
        request<import('./types').AnalyticsData>('/stats/analytics'),

    weeklyReview: () =>
        request<import('./types').WeeklyReviewData>('/stats/weekly-review'),
};

// ── Quotes ──────────────────────────────────────────────────────────────────

export const quotesApi = {
    today: () =>
        request<{ quote: import('./types').Quote }>('/quotes/today'),

    random: () =>
        request<{ quote: import('./types').Quote }>('/quotes/random'),
};

export { ApiError };
export default { authApi, habitsApi, completionsApi, statsApi, quotesApi };
