'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Quote, RefreshCw } from 'lucide-react';
import { quotesApi } from '@/lib/api';
import type { Quote as QuoteType } from '@/lib/types';
import { toast } from 'sonner';

export default function DailyQuote() {
    const [quote, setQuote] = useState<QuoteType | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchQuote = async (random = false) => {
        try {
            const res = random ? await quotesApi.random() : await quotesApi.today();
            setQuote(res.quote);
        } catch {
            toast.error('Failed to load quote.');
        }
    };

    useEffect(() => {
        fetchQuote().finally(() => setLoading(false));
    }, []);

    const handleRefresh = async () => {
        setRefreshing(true);
        await fetchQuote(true);
        setRefreshing(false);
    };

    return (
        <div
            className="rounded-xl p-4 relative overflow-hidden"
            style={{
                background: 'linear-gradient(135deg, rgba(108,99,255,0.12) 0%, rgba(0,212,170,0.08) 100%)',
                border: '1px solid rgba(108,99,255,0.2)',
            }}
            aria-label="Daily motivational quote"
        >
            {/* Decorative quote mark */}
            <Quote
                className="absolute top-4 right-4 w-16 h-16 opacity-5"
                aria-hidden="true"
            />

            <div className="flex items-start gap-3">
                <div
                    className="w-1 rounded-full flex-shrink-0 mt-1"
                    style={{ height: '3rem', background: 'linear-gradient(180deg, var(--primary), var(--accent))' }}
                    aria-hidden="true"
                />

                <div className="flex-1 min-w-0">
                    {loading ? (
                        <div aria-busy="true" aria-label="Loading quote...">
                            <div className="skeleton h-4 rounded mb-2" style={{ width: '90%' }} />
                            <div className="skeleton h-4 rounded mb-3" style={{ width: '70%' }} />
                            <div className="skeleton h-3 rounded" style={{ width: '30%' }} />
                        </div>
                    ) : (
                        <AnimatePresence mode="wait">
                            {quote && (
                                <motion.div
                                    key={quote.text}
                                    initial={{ opacity: 0, y: 6 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -6 }}
                                    transition={{ duration: 0.35, ease: 'easeOut' }}
                                >
                                    <blockquote aria-live="polite">
                                        <p className="text-sm leading-relaxed font-medium mb-2">
                                            &ldquo;{quote.text}&rdquo;
                                        </p>
                                        <footer>
                                            <cite
                                                className="text-xs font-medium not-italic"
                                                style={{ color: 'var(--accent)' }}
                                            >
                                                — {quote.author}
                                            </cite>
                                        </footer>
                                    </blockquote>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    )}
                </div>

                {/* Refresh button */}
                <button
                    onClick={handleRefresh}
                    disabled={refreshing || loading}
                    className="p-1.5 rounded-lg hover:bg-foreground/[0.05] transition-all flex-shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 disabled:opacity-40"
                    aria-label="Get a different quote"
                    title="Refresh quote"
                >
                    <RefreshCw
                        className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`}
                        style={{ color: 'var(--muted-foreground)' }}
                        aria-hidden="true"
                    />
                </button>
            </div>
        </div>
    );
}
