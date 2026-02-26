'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';

interface UIContextValue {
    shortcutsOpen: boolean;
    setShortcutsOpen: (open: boolean) => void;
    newHabitOpen: boolean;
    setNewHabitOpen: (open: boolean) => void;
    weeklyReviewOpen: boolean;
    setWeeklyReviewOpen: (open: boolean) => void;
    toggleShortcuts: () => void;
    toggleNewHabit: () => void;
    toggleWeeklyReview: () => void;
}

const UIContext = createContext<UIContextValue | null>(null);

export function UIProvider({ children }: { children: React.ReactNode }) {
    const [shortcutsOpen, setShortcutsOpen] = useState(false);
    const [newHabitOpen, setNewHabitOpen] = useState(false);
    const [weeklyReviewOpen, setWeeklyReviewOpen] = useState(false);

    const toggleShortcuts = useCallback(() => setShortcutsOpen((prev) => !prev), []);
    const toggleNewHabit = useCallback(() => setNewHabitOpen((prev) => !prev), []);
    const toggleWeeklyReview = useCallback(() => setWeeklyReviewOpen((prev) => !prev), []);

    return (
        <UIContext.Provider value={{
            shortcutsOpen,
            setShortcutsOpen,
            newHabitOpen,
            setNewHabitOpen,
            weeklyReviewOpen,
            setWeeklyReviewOpen,
            toggleShortcuts,
            toggleNewHabit,
            toggleWeeklyReview
        }}>
            {children}
        </UIContext.Provider>
    );
}

export function useUI() {
    const ctx = useContext(UIContext);
    if (!ctx) throw new Error('useUI must be used within UIProvider');
    return ctx;
}
