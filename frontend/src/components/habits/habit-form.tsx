'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2 } from 'lucide-react';
import { Habit, HabitCategory } from '@/lib/types';
import { CATEGORIES, cn } from '@/lib/utils';
import { habitsApi, ApiError } from '@/lib/api';
import { toast } from 'sonner';

const schema = z.object({
    title: z.string().min(1, 'Title is required').max(200, 'Title is too long'),
    description: z.string().max(500, 'Description too long').optional(),
    category: z.enum([
        'health', 'fitness', 'learning', 'mindfulness',
        'productivity', 'social', 'creativity', 'finance', 'general',
    ] as const),
});

type HabitFormData = z.infer<typeof schema>;

interface HabitFormProps {
    habit?: Habit | null;
    open: boolean;
    onClose: () => void;
    onSaved: (habit: Habit) => void;
}

export default function HabitForm({ habit, open, onClose, onSaved }: HabitFormProps) {
    const isEditing = !!habit;

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
        watch,
    } = useForm<HabitFormData>({
        resolver: zodResolver(schema),
        defaultValues: { title: '', description: '', category: 'general' },
    });

    useEffect(() => {
        if (open && habit) {
            reset({ title: habit.title, description: habit.description || '', category: habit.category });
        } else if (open && !habit) {
            reset({ title: '', description: '', category: 'general' });
        }
    }, [open, habit, reset]);

    const selectedCategory = watch('category') as HabitCategory;

    const onSubmit = async (data: HabitFormData) => {
        try {
            let saved: Habit;
            if (isEditing && habit) {
                const res = await habitsApi.update(habit.id, data);
                saved = res.habit;
                toast.success('Habit updated!');
            } else {
                const res = await habitsApi.create(data);
                saved = res.habit;
                toast.success('Habit created! 🎉');
            }
            onSaved(saved);
            onClose();
        } catch (err) {
            if (err instanceof ApiError) {
                toast.error(err.message);
            } else {
                toast.error('Failed to save habit. Please try again.');
            }
        }
    };

    // Close on Escape
    useEffect(() => {
        const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
        if (open) window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [open, onClose]);

    return (
        <AnimatePresence>
            {open && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
                        onClick={onClose}
                        aria-hidden="true"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.94, y: 16 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.94, y: 16 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 touch-none"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="habit-form-title"
                    >
                        <div
                            className="w-full max-w-md rounded-xl p-6 shadow-2xl glass border border-white/10 relative overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Decorative background glow */}
                            <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/10 blur-[80px] rounded-full pointer-events-none" />

                            {/* Header */}
                            <div className="flex items-center justify-between mb-8">
                                <h2 id="habit-form-title" className="text-xl font-display font-bold tracking-tight text-foreground">
                                    {isEditing ? 'Edit' : 'New'} <span className="gradient-text">Habit</span>
                                </h2>
                                <button
                                    onClick={onClose}
                                    className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-foreground/[0.05] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                                    aria-label="Close dialog"
                                >
                                    <X className="w-5 h-5 text-foreground/40 hover:text-foreground transition-opacity" aria-hidden="true" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit(onSubmit)} noValidate className="relative">
                                {/* Title */}
                                <div className="mb-6">
                                    <label htmlFor="habit-title" className="block text-[10px] font-bold uppercase tracking-widest text-foreground/50 mb-2 px-1">
                                        Action Title
                                    </label>
                                    <input
                                        {...register('title')}
                                        id="habit-title"
                                        type="text"
                                        autoFocus
                                        placeholder="What will you achieve today?"
                                        className="w-full px-3.5 py-2.5 rounded-xl text-sm transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary bg-foreground/[0.03] border border-foreground/[0.05] hover:border-foreground/[0.1] text-foreground"
                                        style={{
                                            borderColor: errors.title ? 'rgba(239, 68, 68, 0.4)' : undefined,
                                        }}
                                        aria-invalid={!!errors.title}
                                        aria-describedby={errors.title ? 'title-error' : undefined}
                                    />
                                    {errors.title && (
                                        <p id="title-error" className="mt-2 text-xs font-semibold text-red-500 px-1" role="alert">
                                            {errors.title.message}
                                        </p>
                                    )}
                                </div>

                                {/* Description */}
                                <div className="mb-6">
                                    <label htmlFor="habit-desc" className="block text-[10px] font-bold uppercase tracking-widest text-foreground/50 mb-2 px-1">
                                        Purpose (Optional)
                                    </label>
                                    <textarea
                                        {...register('description')}
                                        id="habit-desc"
                                        rows={2}
                                        placeholder="Add a reason or secondary goal..."
                                        className="w-full px-3.5 py-2.5 rounded-xl text-xs resize-none transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary bg-foreground/[0.03] border border-foreground/[0.05] hover:border-foreground/[0.1] text-foreground"
                                    />
                                </div>

                                {/* Category Selection */}
                                <div className="mb-10">
                                    <label className="block text-[10px] font-bold uppercase tracking-widest text-foreground/50 mb-3 px-1">Intensity Domain</label>
                                    <div className="grid grid-cols-3 gap-2" role="group" aria-label="Target domain">
                                        {CATEGORIES.map(({ value, label, emoji }) => (
                                            <label
                                                key={value}
                                                className={cn(
                                                    "flex flex-col items-center justify-center p-3 rounded-2xl transition-all cursor-pointer border relative overflow-hidden group/cat",
                                                    selectedCategory === value
                                                        ? cn("cat-" + value + " border-transparent")
                                                        : "bg-foreground/[0.02] border-foreground/[0.05] text-foreground/40 hover:bg-foreground/[0.04] hover:text-foreground"
                                                )}
                                            >
                                                <input
                                                    {...register('category')}
                                                    type="radio"
                                                    value={value}
                                                    className="sr-only"
                                                />
                                                <span className="text-lg mb-1 transition-transform group-hover/cat:scale-110">{emoji}</span>
                                                <span className="text-[10px] font-bold uppercase tracking-tight">{label}</span>
                                                {selectedCategory === value && (
                                                    <motion.div
                                                        layoutId="active-cat-glow"
                                                        className="absolute inset-0 z-[-1] opacity-20 bg-current blur-xl"
                                                    />
                                                )}
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-4">
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="flex-1 h-12 rounded-2xl text-sm font-bold uppercase tracking-widest text-foreground/40 hover:text-foreground hover:bg-foreground/[0.05] transition-all"
                                    >
                                        Dismiss
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="flex-3 btn-premium btn-premium-primary h-12 flex items-center justify-center gap-2"
                                        aria-busy={isSubmitting}
                                    >
                                        {isSubmitting ? (
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                        ) : (
                                            <>
                                                <span>{isEditing ? 'Confirm Update' : 'Initialize Habit'}</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
