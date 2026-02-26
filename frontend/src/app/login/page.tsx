'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { useAuth, ApiError } from '@/contexts/auth-context';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Sparkles, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const schema = z.object({
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(1, 'Password is required'),
});

type LoginForm = z.infer<typeof schema>;

export default function LoginPage() {
    const { login } = useAuth();
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const {
        register,
        handleSubmit,
        setError,
        formState: { errors },
    } = useForm<LoginForm>({ resolver: zodResolver(schema) });

    const onSubmit = async (data: LoginForm) => {
        setIsLoading(true);
        try {
            await login(data.email, data.password);
            toast.success('Welcome back! 🎉');
        } catch (err) {
            if (err instanceof ApiError) {
                if (err.errors?.email) setError('email', { message: err.errors.email });
                if (err.errors?.password) setError('password', { message: err.errors.password });
                toast.error(err.message);
            } else {
                toast.error('Failed to log in. Please try again.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-transparent">
            <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, ease: 'easeOut' }}
                className="w-full max-w-md"
            >
                {/* Logo/Brand */}
                <div className="text-center mb-8">
                    <div
                        className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-[0_0_30px_rgba(108,99,255,0.4)]"
                        style={{ background: 'linear-gradient(135deg, var(--primary), var(--accent))' }}
                    >
                        <Sparkles className="w-7 h-7 text-white" aria-hidden="true" />
                    </div>
                    <h1 className="text-4xl font-display font-black tracking-tight gradient-text">Welcome back</h1>
                    <p className="mt-3 text-base opacity-50 font-medium">
                        Sign in to continue your streak
                    </p>
                </div>

                {/* Glass Card */}
                <div className="glass rounded-3xl p-8">
                    <form onSubmit={handleSubmit(onSubmit)} noValidate aria-label="Login form">
                        {/* Email */}
                        <div className="mb-5">
                            <label htmlFor="email" className="block text-xs font-bold uppercase tracking-widest opacity-40 mb-2.5">
                                Email address
                            </label>
                            <input
                                {...register('email')}
                                id="email"
                                type="email"
                                autoComplete="email"
                                autoFocus
                                placeholder="you@example.com"
                                className="w-full px-5 py-4 rounded-2xl text-base transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary bg-white/5 border border-white/10 hover:border-white/20"
                                style={{
                                    borderColor: errors.email ? 'rgba(239,68,68,0.4)' : undefined,
                                }}
                                aria-invalid={!!errors.email}
                                aria-describedby={errors.email ? 'email-error' : undefined}
                            />
                            {errors.email && (
                                <p id="email-error" className="mt-2 text-xs font-semibold text-red-400" role="alert">
                                    {errors.email.message}
                                </p>
                            )}
                        </div>

                        {/* Password */}
                        <div className="mb-8">
                            <label htmlFor="password" className="block text-xs font-bold uppercase tracking-widest opacity-40 mb-2.5">
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    {...register('password')}
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    autoComplete="current-password"
                                    placeholder="••••••••"
                                    className="w-full px-5 py-4 pr-12 rounded-2xl text-base transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary bg-white/5 border border-white/10 hover:border-white/20"
                                    style={{
                                        borderColor: errors.password ? 'rgba(239,68,68,0.4)' : undefined,
                                    }}
                                    aria-invalid={!!errors.password}
                                    aria-describedby={errors.password ? 'password-error' : undefined}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 rounded-lg hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                                >
                                    {showPassword
                                        ? <EyeOff className="w-4 h-4 opacity-40" />
                                        : <Eye className="w-4 h-4 opacity-40" />
                                    }
                                </button>
                            </div>
                            {errors.password && (
                                <p id="password-error" className="mt-2 text-xs font-semibold text-red-400" role="alert">
                                    {errors.password.message}
                                </p>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="btn-premium btn-premium-primary w-full h-13 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                            aria-busy={isLoading}
                            aria-live="polite"
                            style={{ height: '52px' }}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                                    <span>Signing in…</span>
                                </>
                            ) : (
                                <span>Sign In</span>
                            )}
                        </button>
                    </form>

                    <p className="mt-8 text-center text-base opacity-50 font-medium">
                        Don&apos;t have an account?{' '}
                        <Link
                            href="/register"
                            className="font-bold hover:opacity-100 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded gradient-text"
                        >
                            Sign up free
                        </Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
