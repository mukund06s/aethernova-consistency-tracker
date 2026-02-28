'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
    theme: Theme;
    toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setTheme] = useState<Theme>(() => {
        if (typeof window === 'undefined') return 'dark';
        const savedTheme = localStorage.getItem('theme') as Theme | null;
        if (savedTheme) return savedTheme;
        if (window.matchMedia('(prefers-color-scheme: light)').matches) return 'light';
        return 'dark';
    });
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        const handle = setTimeout(() => setMounted(true), 0);
        return () => clearTimeout(handle);
    }, []);

    useEffect(() => {
        if (!mounted) return;

        const root = window.document.documentElement;
        root.classList.remove('light', 'dark');
        root.classList.add(theme);
        localStorage.setItem('theme', theme);
    }, [theme, mounted]);

    const toggleTheme = () => {
        setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}
