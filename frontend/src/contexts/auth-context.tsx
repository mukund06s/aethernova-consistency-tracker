'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useSWRConfig } from 'swr';
import { authApi, ApiError } from '@/lib/api';
import { User } from '@/lib/types';

interface AuthContextValue {
    user: User | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (name: string, email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    refreshUser: () => Promise<void>;
    setUser: (user: User | null) => void;
    deleteAccount: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const { mutate: globalMutate } = useSWRConfig();
    const router = useRouter();

    const refreshUser = useCallback(async () => {
        try {
            const data = await authApi.me();
            setUser(data.user);
        } catch {
            setUser(null);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        refreshUser();
    }, [refreshUser]);

    const login = async (email: string, password: string) => {
        const data = await authApi.login({ email, password });
        setUser(data.user);
        router.replace('/dashboard'); // replace so Back from dashboard doesn't go to /login
    };

    const register = async (name: string, email: string, password: string) => {
        const data = await authApi.register({ name, email, password });
        setUser(data.user);
        router.replace('/dashboard'); // replace so Back from dashboard doesn't go to /register
    };

    const logout = async () => {
        try {
            await authApi.logout();
        } catch (error) {
            console.error('Logout API error:', error);
        } finally {
            // ── Cleanup ──────────────────────────────────────────────────────
            localStorage.clear();

            // Clear all SWR cache
            // SWR 2.x doesn't have a built-in "clear all", but we can mutate all keys
            // or just rely on the fact that we are redirecting and state is being reset.
            // A common pattern is to use a cache provider and clear it, but here we can:
            globalMutate(() => true, undefined, { revalidate: false });

            setUser(null);
            router.push('/');
        }
    };

    const deleteAccount = async () => {
        try {
            await authApi.deleteAccount();
        } catch (err) {
            throw err;
        } finally {
            localStorage.clear();
            globalMutate(() => true, undefined, { revalidate: false });
            setUser(null);
            router.push('/');
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser, setUser, deleteAccount }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth(): AuthContextValue {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
}

export { ApiError };
