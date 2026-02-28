'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard,
    CheckSquare,
    BarChart3,
    Settings,
    LogOut,
    Sparkles,
    Menu,
    X,
    ChevronRight,
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import ThemeToggle from './theme-toggle';

const NAV_ITEMS = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/habits', label: 'My Habits', icon: CheckSquare },
    { href: '/analytics', label: 'Analytics', icon: BarChart3 },
    { href: '/dashboard#settings', label: 'Settings', icon: Settings },
];

interface NavContentProps {
    pathname: string;
    user: import('@/lib/types').User | null;
    logout: () => Promise<void>;
    setMobileOpen: (open: boolean) => void;
}

const NavContent = ({ pathname, user, logout, setMobileOpen }: NavContentProps) => {
    const router = useRouter();

    const handleLogout = async () => {
        try {
            await logout();
            toast.success('Logged out. See you soon!');
        } catch {
            toast.error('Logout failed. Please try again.');
        }
    };

    return (
        <div className="flex flex-col h-full py-6 px-4">
            {/* Logo */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2.5 px-3">
                    <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ background: 'linear-gradient(135deg, var(--primary), var(--accent))' }}
                        aria-hidden="true"
                    >
                        <Sparkles className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-bold text-lg gradient-text">AetherNova</span>
                </div>
                <ThemeToggle />
            </div>

            {/* Nav links */}
            <nav aria-label="Main navigation" className="flex-1 space-y-1">
                {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
                    const isActive = pathname === href || (href !== '/' && pathname.startsWith(href));
                    return (
                        <Link
                            key={href}
                            href={href}
                            onClick={() => setMobileOpen(false)}
                            className={cn(
                                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                                'focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none',
                                isActive
                                    ? 'text-primary'
                                    : 'text-foreground/60 hover:text-foreground hover:bg-foreground/[0.05]'
                            )}
                            style={
                                isActive
                                    ? {
                                        background: 'var(--primary-glow)',
                                        color: 'var(--primary)',
                                        boxShadow: '0 2px 8px var(--primary-glow)',
                                    }
                                    : {}
                            }
                            aria-current={isActive ? 'page' : undefined}
                        >
                            <Icon className="w-4 h-4" aria-hidden="true" />
                            <span>{label}</span>
                            {isActive && (
                                <motion.div
                                    layoutId="nav-indicator"
                                    className="ml-auto w-1.5 h-1.5 rounded-full"
                                    style={{ background: 'var(--primary)' }}
                                />
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* User section */}
            <div className="mt-auto">
                <button
                    onClick={() => {
                        router.push('/dashboard#settings');
                        setMobileOpen(false);
                    }}
                    className="w-full text-left px-3 py-3 rounded-xl mb-2 group/user relative overflow-hidden transition-all hover:bg-foreground/[0.03] border border-foreground/[0.05] hover:border-foreground/[0.1]"
                    aria-label="View profile settings"
                >
                    <p className="text-sm font-semibold text-foreground truncate group-hover/user:text-primary transition-colors">
                        {user?.name}
                    </p>
                    <p className="text-[10px] truncate text-foreground/40 font-medium">
                        {user?.email}
                    </p>
                    <div className="absolute top-1/2 right-2 -translate-y-1/2 opacity-0 group-hover/user:opacity-100 transition-opacity">
                        <ChevronRight className="w-3 h-3 text-primary" />
                    </div>
                </button>
                <button
                    onClick={handleLogout}
                    className={cn(
                        'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
                        'hover:bg-red-500/10 hover:text-red-500',
                        'focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:outline-none',
                        'text-foreground/60'
                    )}
                    aria-label="Log out"
                >
                    <LogOut className="w-4 h-4" aria-hidden="true" />
                    <span>Log out</span>
                </button>
            </div>
        </div>
    );
};

export default function Sidebar() {
    const pathname = usePathname();
    const { user, logout } = useAuth();
    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <>
            {/* Mobile hamburger */}
            <button
                className={cn(
                    'fixed top-4 left-4 z-50 p-2 rounded-lg lg:hidden',
                    'focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none'
                )}
                style={{ background: 'var(--card)', border: '1px solid var(--card-border)' }}
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-label={mobileOpen ? 'Close navigation' : 'Open navigation'}
                aria-expanded={mobileOpen}
                aria-controls="sidebar-nav"
            >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* Mobile overlay */}
            <AnimatePresence>
                {mobileOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 z-40 bg-black/60 lg:hidden"
                        onClick={() => setMobileOpen(false)}
                        aria-hidden="true"
                    />
                )}
            </AnimatePresence>

            {/* Mobile sidebar */}
            <AnimatePresence>
                {mobileOpen && (
                    <motion.aside
                        id="sidebar-nav"
                        initial={{ x: '-100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '-100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed top-0 left-0 h-full z-50 w-64 lg:hidden glass shadow-2xl"
                        style={{ borderRight: '1px solid var(--card-border)' }}
                        aria-label="Mobile sidebar navigation"
                    >
                        <NavContent pathname={pathname} user={user} logout={logout} setMobileOpen={setMobileOpen} />
                    </motion.aside>
                )}
            </AnimatePresence>

            {/* Desktop sidebar */}
            <aside
                className="hidden lg:flex lg:flex-col w-64 min-h-screen sticky top-0"
                style={{ background: 'var(--card)', borderRight: '1px solid var(--card-border)' }}
                aria-label="Sidebar navigation"
            >
                <NavContent pathname={pathname} user={user} logout={logout} setMobileOpen={setMobileOpen} />
            </aside>
        </>
    );
}
