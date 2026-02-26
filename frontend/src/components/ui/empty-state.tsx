import React from 'react';
import { motion } from 'framer-motion';
import { Plus, Sparkles } from 'lucide-react';

interface EmptyStateProps {
    title: string;
    description: string;
    actionLabel?: string;
    onAction?: () => void;
    icon?: React.ReactNode;
}

export function EmptyState({
    title,
    description,
    actionLabel,
    onAction,
    icon,
}: EmptyStateProps) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center justify-center py-16 px-4 text-center"
            aria-label="Empty state"
        >
            <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5"
                style={{
                    background: 'linear-gradient(135deg, rgba(108,99,255,0.15), rgba(0,212,170,0.1))',
                    border: '1px solid rgba(108,99,255,0.2)',
                }}
                aria-hidden="true"
            >
                {icon || <Sparkles className="w-7 h-7" style={{ color: 'var(--primary-light)' }} />}
            </div>
            <h3 className="text-base font-semibold mb-2">{title}</h3>
            <p className="text-sm mb-6 max-w-xs leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
                {description}
            </p>
            {actionLabel && onAction && (
                <button
                    onClick={onAction}
                    className="btn-primary flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
                    aria-label={actionLabel}
                >
                    <Plus className="w-4 h-4" aria-hidden="true" />
                    {actionLabel}
                </button>
            )}
        </motion.div>
    );
}
