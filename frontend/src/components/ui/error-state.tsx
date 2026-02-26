import { motion } from 'framer-motion';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorStateProps {
    message?: string;
    onRetry?: () => void;
}

export function ErrorState({
    message = 'Something went wrong. Please try again.',
    onRetry,
}: ErrorStateProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-16 px-4 text-center"
            role="alert"
            aria-live="assertive"
        >
            <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
                style={{ background: 'rgba(255, 77, 109, 0.12)', border: '1px solid rgba(255, 77, 109, 0.2)' }}
                aria-hidden="true"
            >
                <AlertTriangle className="w-7 h-7" style={{ color: 'var(--danger)' }} />
            </div>
            <h3 className="text-base font-semibold mb-1.5">Oops! Something went wrong</h3>
            <p className="text-sm mb-5 max-w-xs" style={{ color: 'var(--muted-foreground)' }}>
                {message}
            </p>
            {onRetry && (
                <button
                    onClick={onRetry}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
                    style={{ background: 'rgba(255,77,109,0.15)', color: 'var(--danger)', border: '1px solid rgba(255,77,109,0.2)' }}
                >
                    <RefreshCw className="w-4 h-4" aria-hidden="true" />
                    Try again
                </button>
            )}
        </motion.div>
    );
}
