'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface ShortcutsHelpModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const SHORTCUTS = [
    { key: 'N', desc: 'Open New Habit Modal' },
    { key: 'W', desc: 'Open Weekly Review' },
    { key: 'D', desc: 'Navigate to Dashboard' },
    { key: 'H', desc: 'Navigate to Habits Page' },
    { key: 'S', desc: 'Navigate to Settings' },
    { key: 'Esc', desc: 'Close any Modal / Blur Input' },
    { key: '1-5', desc: 'Toggle first 5 visible habits' },
    { key: '?', desc: 'Show this Help Modal' },
];

export default function ShortcutsHelpModal({ isOpen, onClose }: ShortcutsHelpModalProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100]"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md z-[101] px-4"
                    >
                        <div className="glass glass-hover rounded-3xl p-8 shadow-2xl border border-foreground/[0.05]">
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-2xl font-display font-bold text-foreground flex items-center gap-2">
                                    Keyboard Shortcuts
                                    <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">Power User</span>
                                </h2>
                                <button onClick={onClose} className="p-2 hover:bg-foreground/[0.05] rounded-xl transition-colors">
                                    <X className="w-5 h-5 text-foreground/60" />
                                </button>
                            </div>

                            <div className="grid grid-cols-1 gap-4">
                                {SHORTCUTS.map((s, idx) => (
                                    <div key={idx} className="flex items-center justify-between group">
                                        <span className="text-sm font-medium text-foreground/60 group-hover:text-foreground transition-colors">{s.desc}</span>
                                        <kbd className="px-3 py-1.5 rounded-lg bg-foreground/[0.05] border border-foreground/[0.05] text-xs font-mono font-bold text-primary shadow-sm shadow-primary/5">
                                            {s.key}
                                        </kbd>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-8 pt-6 border-t border-foreground/[0.05] flex justify-center">
                                <button
                                    onClick={onClose}
                                    className="px-6 py-2.5 rounded-xl bg-foreground/[0.05] hover:bg-foreground/[0.1] text-sm font-bold transition-all text-foreground/80 hover:text-foreground"
                                >
                                    Got it, thanks!
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
