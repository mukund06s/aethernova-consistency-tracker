"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateCurrentStreak = calculateCurrentStreak;
exports.calculateLongestStreak = calculateLongestStreak;
const express_1 = require("express");
const zod_1 = require("zod");
const prisma_1 = require("../lib/prisma");
const auth_1 = require("../middleware/auth");
const validate_1 = require("../middleware/validate");
const router = (0, express_1.Router)();
const createHabitSchema = zod_1.z.object({
    title: zod_1.z.string().min(1, 'Title is required').max(200, 'Title too long'),
    description: zod_1.z.string().max(500, 'Description too long').optional(),
    category: zod_1.z
        .enum(['health', 'fitness', 'learning', 'mindfulness', 'productivity', 'social', 'creativity', 'finance', 'general'])
        .default('general'),
});
const updateHabitSchema = createHabitSchema.partial();
const reorderSchema = zod_1.z.object({
    habits: zod_1.z.array(zod_1.z.object({
        id: zod_1.z.string(),
        order: zod_1.z.number().int().min(0),
    })),
});
// All routes require auth
router.use(auth_1.authenticate);
// GET /api/habits – list user's habits
router.get('/', async (req, res, next) => {
    try {
        const { archived = 'false' } = req.query;
        const habits = await prisma_1.prisma.habit.findMany({
            where: {
                userId: req.userId,
                archived: archived === 'true'
            },
            orderBy: { order: 'asc' },
            include: {
                completions: {
                    orderBy: { date: 'desc' },
                    take: 30,
                },
            },
        });
        // Calculate current streak per habit
        const habitsWithStreaks = habits.map((habit) => {
            const dates = habit.completions.map((c) => c.date);
            const streak = calculateCurrentStreak(dates);
            return { ...habit, currentStreak: streak };
        });
        res.json({ success: true, data: { habits: habitsWithStreaks } });
    }
    catch (error) {
        next(error);
    }
});
// POST /api/habits – create habit
router.post('/', (0, validate_1.validate)(createHabitSchema), async (req, res, next) => {
    try {
        const count = await prisma_1.prisma.habit.count({ where: { userId: req.userId } });
        const habit = await prisma_1.prisma.habit.create({
            data: {
                ...req.body,
                userId: req.userId,
                order: count,
            },
        });
        res.status(201).json({
            success: true,
            message: 'Habit created!',
            data: { habit: { ...habit, currentStreak: 0 } },
        });
    }
    catch (error) {
        next(error);
    }
});
// GET /api/habits/:id – get single habit with full history
router.get('/:id', async (req, res, next) => {
    try {
        const habitId = String(req.params.id);
        const habit = await prisma_1.prisma.habit.findFirst({
            where: { id: habitId, userId: req.userId },
            include: {
                completions: {
                    orderBy: { date: 'desc' },
                },
            },
        });
        if (!habit) {
            res.status(404).json({ success: false, message: 'Habit not found.' });
            return;
        }
        const dates = habit.completions.map((c) => c.date);
        const streak = calculateCurrentStreak(dates);
        const longestStreak = calculateLongestStreak(dates);
        res.json({
            success: true,
            data: { habit: { ...habit, currentStreak: streak, longestStreak } },
        });
    }
    catch (error) {
        next(error);
    }
});
// PUT /api/habits/:id – update habit
router.put('/:id', (0, validate_1.validate)(updateHabitSchema), async (req, res, next) => {
    try {
        const habitId = String(req.params.id);
        const existing = await prisma_1.prisma.habit.findFirst({
            where: { id: habitId, userId: req.userId },
        });
        if (!existing) {
            res.status(404).json({ success: false, message: 'Habit not found.' });
            return;
        }
        const habit = await prisma_1.prisma.habit.update({
            where: { id: habitId },
            data: req.body,
        });
        res.json({ success: true, message: 'Habit updated!', data: { habit } });
    }
    catch (error) {
        next(error);
    }
});
// DELETE /api/habits/:id – delete habit
router.delete('/:id', async (req, res, next) => {
    try {
        const habitId = String(req.params.id);
        const existing = await prisma_1.prisma.habit.findFirst({
            where: { id: habitId, userId: req.userId },
        });
        if (!existing) {
            res.status(404).json({ success: false, message: 'Habit not found.' });
            return;
        }
        await prisma_1.prisma.habit.delete({ where: { id: habitId } });
        res.json({ success: true, message: 'Habit deleted.' });
    }
    catch (error) {
        next(error);
    }
});
// POST /api/habits/:id/freeze – freeze habit
const freezeSchema = zod_1.z.object({ days: zod_1.z.enum(['1', '2', '3']).optional() });
router.post('/:id/freeze', (0, validate_1.validate)(freezeSchema), async (req, res, next) => {
    try {
        const habitId = String(req.params.id);
        const days = parseInt(req.body.days || '1');
        // ... rest of the endpoint ...
        const habit = await prisma_1.prisma.habit.findFirst({
            where: { id: habitId, userId: req.userId },
        });
        if (!habit) {
            res.status(404).json({ success: false, message: 'Habit not found.' });
            return;
        }
        if (habit.freezesAvailable <= 0) {
            res.status(400).json({ success: false, message: 'No freezes available.' });
            return;
        }
        const frozenUntil = new Date();
        frozenUntil.setDate(frozenUntil.getDate() + days);
        frozenUntil.setHours(23, 59, 59, 999);
        const updated = await prisma_1.prisma.habit.update({
            where: { id: habitId },
            data: {
                isFrozen: true,
                frozenUntil,
                freezesAvailable: { decrement: 1 },
            },
        });
        res.json({ success: true, message: `Habit frozen for ${days} days.`, data: { habit: updated } });
    }
    catch (error) {
        next(error);
    }
});
// DELETE /api/habits/:id/freeze – unfreeze habit early
router.delete('/:id/freeze', async (req, res, next) => {
    try {
        const habitId = String(req.params.id);
        const habit = await prisma_1.prisma.habit.findFirst({
            where: { id: habitId, userId: req.userId },
        });
        if (!habit) {
            res.status(404).json({ success: false, message: 'Habit not found.' });
            return;
        }
        const updated = await prisma_1.prisma.habit.update({
            where: { id: habitId },
            data: {
                isFrozen: false,
                frozenUntil: null,
            },
        });
        res.json({ success: true, message: 'Habit unfrozen.', data: { habit: updated } });
    }
    catch (error) {
        next(error);
    }
});
// PATCH /api/habits/:id/archive – archive/unarchive habit
router.patch('/:id/archive', async (req, res, next) => {
    try {
        const habitId = String(req.params.id);
        const habit = await prisma_1.prisma.habit.findFirst({
            where: { id: habitId, userId: req.userId },
        });
        if (!habit) {
            res.status(404).json({ success: false, message: 'Habit not found.' });
            return;
        }
        const updated = await prisma_1.prisma.habit.update({
            where: { id: habitId },
            data: { archived: !habit.archived },
        });
        res.json({
            success: true,
            message: updated.archived ? 'Habit archived.' : 'Habit restored.',
            data: { habit: updated },
        });
    }
    catch (error) {
        next(error);
    }
});
// PATCH /api/habits/reorder/batch – reorder habits via drag-drop
router.patch('/reorder/batch', (0, validate_1.validate)(reorderSchema), async (req, res, next) => {
    try {
        const { habits } = req.body;
        const habitIds = habits.map((h) => h.id);
        const ownedHabits = await prisma_1.prisma.habit.findMany({
            where: { id: { in: habitIds }, userId: req.userId },
            select: { id: true },
        });
        if (ownedHabits.length !== habitIds.length) {
            res.status(403).json({ success: false, message: 'Unauthorized to reorder these habits.' });
            return;
        }
        const updates = habits.map((h) => prisma_1.prisma.habit.update({ where: { id: h.id }, data: { order: h.order } }));
        await prisma_1.prisma.$transaction(updates);
        res.json({ success: true, message: 'Habits reordered.' });
    }
    catch (error) {
        next(error);
    }
});
// ── Helper: streak calculation ──────────────────────────────────────────────
function calculateCurrentStreak(dates, habit) {
    if (!dates.length && (!habit || !habit.isFrozen))
        return 0;
    const today = getLocalDate();
    const yesterday = offsetDate(today, -1);
    const sortedDates = [...new Set(dates)].sort().reverse();
    // If frozen and today is within frozen period, streak remains active
    if (habit?.isFrozen && habit.frozenUntil) {
        const now = new Date();
        const frozenUntil = new Date(habit.frozenUntil);
        if (now <= frozenUntil) {
            // Treat as if completed today/yesterday to keep going
            // We'll calculate from the last actual completion
        }
        else {
            // Frozen period passed, should be reset if not completed since
            // but the cron or some logic should probably handle isFrozen=false
        }
    }
    const startDate = sortedDates[0] === today || sortedDates[0] === yesterday ? sortedDates[0] : null;
    // special case: if frozen today, streak is maintained even if no completion today/yesterday
    let current = startDate || (habit?.isFrozen ? today : null);
    if (!current)
        return 0;
    let streak = 0;
    let dateIdx = 0;
    // Iterate backwards from 'current' (today or yesterday)
    let checkDate = current;
    while (true) {
        if (dateIdx < sortedDates.length && sortedDates[dateIdx] === checkDate) {
            streak++;
            dateIdx++;
            checkDate = offsetDate(checkDate, -1);
        }
        else if (habit?.isFrozen && habit.frozenUntil) {
            const untilStr = habit.frozenUntil instanceof Date
                ? habit.frozenUntil.toISOString().split('T')[0]
                : String(habit.frozenUntil).split('T')[0];
            // If checkDate is within 3 days of frozenUntil and isFrozen is active
            if (checkDate <= untilStr && checkDate >= offsetDate(untilStr, -3)) {
                streak++;
                checkDate = offsetDate(checkDate, -1);
                // Skip actual completion if it exists on this date
                if (dateIdx < sortedDates.length && sortedDates[dateIdx] === checkDate) {
                    dateIdx++;
                }
                continue;
            }
            break;
        }
        else {
            break;
        }
        if (streak > 3650)
            break; // emergency break
    }
    return streak;
}
function calculateLongestStreak(dates) {
    if (!dates.length)
        return 0;
    const sorted = [...new Set(dates)].sort();
    let longest = 1;
    let current = 1;
    for (let i = 1; i < sorted.length; i++) {
        const prev = new Date(sorted[i - 1]);
        const curr = new Date(sorted[i]);
        const diff = (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24);
        if (diff === 1) {
            current++;
            longest = Math.max(longest, current);
        }
        else {
            current = 1;
        }
    }
    return longest;
}
function getLocalDate() {
    return new Date().toISOString().split('T')[0];
}
function offsetDate(dateStr, days) {
    const d = new Date(dateStr);
    d.setDate(d.getDate() + days);
    return d.toISOString().split('T')[0];
}
exports.default = router;
//# sourceMappingURL=habits.js.map