"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const zod_1 = require("zod");
const prisma_1 = require("../lib/prisma");
const validate_1 = require("../middleware/validate");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
const registerSchema = zod_1.z.object({
    name: zod_1.z.string().min(2, 'Name must be at least 2 characters').max(100),
    email: zod_1.z.string().email('Please enter a valid email address'),
    password: zod_1.z
        .string()
        .min(8, 'Password must be at least 8 characters')
        .max(100, 'Password is too long'),
});
const loginSchema = zod_1.z.object({
    email: zod_1.z.string().email('Please enter a valid email address'),
    password: zod_1.z.string().min(1, 'Password is required'),
});
const settingsSchema = zod_1.z.object({
    name: zod_1.z.string().min(2).max(100).optional(),
    reminderTime: zod_1.z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)').optional(),
});
const setCookieToken = (res, userId, email) => {
    const token = jsonwebtoken_1.default.sign({ userId, email }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    });
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
router.post('/register', (0, validate_1.validate)(registerSchema), async (req, res, next) => {
    try {
        const { name, email, password } = req.body;
        const existing = await prisma_1.prisma.user.findUnique({ where: { email } });
        if (existing) {
            res.status(409).json({
                success: false,
                message: 'An account with this email already exists.',
                errors: { email: 'Email is already registered' },
            });
            return;
        }
        const passwordHash = await bcryptjs_1.default.hash(password, 12);
        const user = await prisma_1.prisma.user.create({
            data: { name, email, passwordHash },
            select: { id: true, name: true, email: true, reminderTime: true, createdAt: true },
        });
        setCookieToken(res, user.id, user.email);
        res.status(201).json({
            success: true,
            message: 'Account created successfully!',
            data: { user },
        });
    }
    catch (error) {
        next(error);
    }
});
// POST /api/auth/login
router.post('/login', (0, validate_1.validate)(loginSchema), async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const user = await prisma_1.prisma.user.findUnique({ where: { email } });
        if (!user) {
            res.status(401).json({
                success: false,
                message: 'Invalid email or password.',
            });
            return;
        }
        const isValid = await bcryptjs_1.default.compare(password, user.passwordHash);
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
                user: { id: user.id, name: user.name, email: user.email, reminderTime: user.reminderTime, createdAt: user.createdAt },
            },
        });
    }
    catch (error) {
        next(error);
    }
});
// POST /api/auth/logout
router.post('/logout', (_req, res) => {
    res.clearCookie('token', { path: '/' });
    res.json({ success: true, message: 'Logged out successfully.' });
});
// GET /api/auth/me
router.get('/me', auth_1.authenticate, async (req, res, next) => {
    try {
        const user = await prisma_1.prisma.user.findUnique({
            where: { id: req.userId },
            select: { id: true, name: true, email: true, reminderTime: true, createdAt: true },
        });
        if (!user) {
            res.status(404).json({ success: false, message: 'User not found.' });
            return;
        }
        res.json({ success: true, data: { user } });
    }
    catch (error) {
        next(error);
    }
});
// PATCH /api/auth/settings – update user settings (reminders)
router.patch('/settings', auth_1.authenticate, (0, validate_1.validate)(settingsSchema), async (req, res, next) => {
    try {
        const user = await prisma_1.prisma.user.update({
            where: { id: req.userId },
            data: req.body,
            select: { id: true, name: true, email: true, reminderTime: true, createdAt: true },
        });
        res.json({
            success: true,
            message: 'Settings updated successfully!',
            data: { user },
        });
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
//# sourceMappingURL=auth.js.map