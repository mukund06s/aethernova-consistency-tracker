'use client';

import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/contexts/theme-context';
import { motion } from 'framer-motion';

export default function ThemeToggle() {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className="p-2.5 rounded-xl bg-foreground/[0.03] hover:bg-foreground/[0.08] border border-foreground/[0.05] text-foreground transition-all duration-300 relative group overflow-hidden"
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
            <motion.div
                initial={false}
                animate={{
                    y: theme === 'dark' ? 0 : 40,
                    opacity: theme === 'dark' ? 1 : 0
                }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            >
                <Moon className="w-5 h-5 text-indigo-400 group-hover:text-indigo-300 transition-colors" />
            </motion.div>

            <motion.div
                className="absolute inset-0 flex items-center justify-center"
                initial={false}
                animate={{
                    y: theme === 'light' ? 0 : -40,
                    opacity: theme === 'light' ? 1 : 0
                }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            >
                <Sun className="w-5 h-5 text-amber-400 group-hover:text-amber-300 transition-colors" />
            </motion.div>
        </button>
    );
}
