import { Router, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { validate } from '../middleware/validate';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

const registerSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').max(100),
    email: z.string().email('Please enter a valid email address'),
    password: z
        .string()
        .min(8, 'Password must be at least 8 characters')
        .max(100, 'Password is too long'),
});

const loginSchema = z.object({
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(1, 'Password is required'),
});

const settingsSchema = z.object({
    name: z.string().min(2).max(100).optional(),
    reminderTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)').optional(),
    confettiEnabled: z.boolean().optional(),
    soundEnabled: z.boolean().optional(),
});

const setCookieToken = (res: Response, userId: string, email: string) => {
    const token = jwt.sign({ userId, email }, process.env.JWT_SECRET!, {
        expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    } as jwt.SignOptions);

    const isProduction = process.env.NODE_ENV === 'production';
    res.cookie('token', token, {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'none' : 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        path: '/',
    });

    return token;
};

// POST /api/auth/register
router.post('/register', validate(registerSchema), async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { name, email, password } = req.body;

        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing) {
            res.status(409).json({
                success: false,
                message: 'An account with this email already exists.',
                errors: { email: 'Email is already registered' },
            });
            return;
        }

        const passwordHash = await bcrypt.hash(password, 12);
        const user = await prisma.user.create({
            data: { name, email, passwordHash },
            select: { id: true, name: true, email: true, reminderTime: true, confettiEnabled: true, soundEnabled: true, createdAt: true },
        });

        setCookieToken(res, user.id, user.email);

        res.status(201).json({
            success: true,
            message: 'Account created successfully!',
            data: { user },
        });
    } catch (error) {
        next(error);
    }
});

// POST /api/auth/login
router.post('/login', validate(loginSchema), async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { email, password } = req.body;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            res.status(401).json({
                success: false,
                message: 'Invalid email or password.',
            });
            return;
        }

        const isValid = await bcrypt.compare(password, user.passwordHash);
        if (!isValid) {
            res.status(401).json({
                success: false,
                message: 'Invalid email or password.',
            });
            return;
        }

        setCookieToken(res, user.id, user.email);

        res.json({
            success: true,
            message: 'Welcome back!',
            data: {
                user: { id: user.id, name: user.name, email: user.email, reminderTime: user.reminderTime, confettiEnabled: user.confettiEnabled, soundEnabled: user.soundEnabled, createdAt: user.createdAt },
            },
        });
    } catch (error) {
        console.error('LOGIN_ROUTE_ERROR:', error);
        next(error);
    }
});

// POST /api/auth/logout
router.post('/logout', (_req, res: Response) => {
    res.clearCookie('token', { path: '/' });
    res.json({ success: true, message: 'Logged out successfully.' });
});

// GET /api/auth/me
router.get('/me', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.userId },
            select: { id: true, name: true, email: true, reminderTime: true, confettiEnabled: true, soundEnabled: true, createdAt: true },
        });

        if (!user) {
            res.status(404).json({ success: false, message: 'User not found.' });
            return;
        }

        res.json({ success: true, data: { user } });
    } catch (error) {
        next(error);
    }
});

// PATCH /api/auth/settings – update user settings (reminders)
router.patch('/settings', authenticate, validate(settingsSchema), async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const user = await prisma.user.update({
            where: { id: req.userId },
            data: req.body,
            select: { id: true, name: true, email: true, reminderTime: true, confettiEnabled: true, soundEnabled: true, createdAt: true },
        });

        res.json({
            success: true,
            message: 'Settings updated successfully!',
            data: { user },
        });
    } catch (error) {
        next(error);
    }
});

// DELETE /api/auth/account – delete user account
router.delete('/account', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        await prisma.user.delete({
            where: { id: req.userId },
        });

        res.clearCookie('token', { path: '/' });
        res.json({
            success: true,
            message: 'Account deleted successfully. We hope to see you again!',
        });
    } catch (error) {
        next(error);
    }
});

export default router;
