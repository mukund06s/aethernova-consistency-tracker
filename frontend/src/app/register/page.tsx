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
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
});

type RegisterForm = z.infer<typeof schema>;

export default function RegisterPage() {
    const { register: registerUser } = useAuth();
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const {
        register,
        handleSubmit,
        setError,
        formState: { errors },
    } = useForm<RegisterForm>({ resolver: zodResolver(schema) });

    const onSubmit = async (data: RegisterForm) => {
        setIsLoading(true);
        try {
            await registerUser(data.name, data.email, data.password);
            toast.success("Account created! Let's build some habits 🚀");
        } catch (err) {
            if (err instanceof ApiError) {
                if (err.errors?.name) setError('name', { message: err.errors.name });
                if (err.errors?.email) setError('email', { message: err.errors.email });
                if (err.errors?.password) setError('password', { message: err.errors.password });
                toast.error(err.message);
            } else {
                toast.error('Failed to create account. Please try again.');
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
                        className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-[0_0_30px_rgba(0,213,168,0.3)]"
                        style={{ background: 'linear-gradient(135deg, var(--primary), var(--accent))' }}
                    >
                        <Sparkles className="w-7 h-7 text-white" aria-hidden="true" />
                    </div>
                    <h1 className="text-4xl font-display font-black tracking-tight gradient-text">Start your journey</h1>
                    <p className="mt-3 text-base opacity-50 font-medium">
                        Build habits that last a lifetime
                    </p>
                </div>

                {/* Glass Card */}
                <div className="glass rounded-3xl p-8">
                    <form onSubmit={handleSubmit(onSubmit)} noValidate aria-label="Registration form">
                        {/* Name */}
                        <div className="mb-5">
                            <label htmlFor="name" className="block text-xs font-bold uppercase tracking-widest opacity-40 mb-2.5">
                                Full name
                            </label>
                            <input
                                {...register('name')}
                                id="name"
                                type="text"
                                autoComplete="name"
                                autoFocus
                                placeholder="Alex Johnson"
                                className="w-full px-5 py-4 rounded-2xl text-base transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary bg-white/5 border border-white/10 hover:border-white/20"
                                style={{
                                    borderColor: errors.name ? 'rgba(239,68,68,0.4)' : undefined,
                                }}
                                aria-invalid={!!errors.name}
                                aria-describedby={errors.name ? 'name-error' : undefined}
                            />
                            {errors.name && (
                                <p id="name-error" className="mt-2 text-xs font-semibold text-red-400" role="alert">
                                    {errors.name.message}
                                </p>
                            )}
                        </div>

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
                                    autoComplete="new-password"
                                    placeholder="Min. 8 characters"
                                    className="w-full px-5 py-4 pr-12 rounded-2xl text-base transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary bg-white/5 border border-white/10 hover:border-white/20"
                                    style={{
                                        borderColor: errors.password ? 'rgba(239,68,68,0.4)' : undefined,
                                    }}
                                    aria-invalid={!!errors.password}
                                    aria-describedby={errors.password ? 'password-error' : 'password-hint'}
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
                            {errors.password ? (
                                <p id="password-error" className="mt-2 text-xs font-semibold text-red-400" role="alert">
                                    {errors.password.message}
                                </p>
                            ) : (
                                <p id="password-hint" className="mt-2 text-xs opacity-40">
                                    Minimum 8 characters
                                </p>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="btn-premium btn-premium-primary w-full flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                            aria-busy={isLoading}
                            style={{ height: '52px' }}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                                    <span>Creating account…</span>
                                </>
                            ) : (
                                <span>Create Account</span>
                            )}
                        </button>
                    </form>

                    <p className="mt-8 text-center text-base opacity-50 font-medium">
                        Already have an account?{' '}
                        <Link
                            href="/login"
                            className="font-bold hover:opacity-100 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded gradient-text"
                        >
                            Sign in
                        </Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
