"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const prisma_1 = __importDefault(require("../lib/prisma"));
const auth_1 = require("../middleware/auth");
const validate_1 = require("../middleware/validate");
const habits_1 = require("./habits");
const router = (0, express_1.Router)();
const completeSchema = zod_1.z.object({
    notes: zod_1.z.string().max(500, 'Notes too long').optional(),
});
const MOTIVATIONAL_MESSAGES = [
    '🎉 Habit marked complete!',
    '🚀 You are on a roll!',
    '🌟 Great job staying consistent!',
    '💪 Strength comes from discipline!',
    '🔥 You are unstoppable today!',
    '✨ Another step towards your best self!',
    '🏆 Level up! Keep it going!',
];
function getRandomMotivation() {
    return MOTIVATIONAL_MESSAGES[Math.floor(Math.random() * MOTIVATIONAL_MESSAGES.length)];
}
// All routes require auth
router.use(auth_1.authenticate);
// POST /api/completions/:habitId – mark habit complete for today
router.post('/:habitId', (0, validate_1.validate)(completeSchema), async (req, res, next) => {
    try {
        const habitId = String(req.params.habitId);
        const { notes } = req.body;
        // Verify habit belongs to user
        const habit = await prisma_1.default.habit.findFirst({
            where: { id: habitId, userId: req.userId },
        });
        if (!habit) {
            res.status(404).json({ success: false, message: 'Habit not found.' });
            return;
        }
        const today = new Date().toISOString().split('T')[0];
        // Check if already completed today (unique constraint guard)
        const existing = await prisma_1.default.habitCompletion.findUnique({
            where: { habitId_date: { habitId, date: today } },
        });
        if (existing) {
            res.status(409).json({
                success: false,
                message: "You've already completed this habit today. Great job!",
            });
            return;
        }
        const completion = await prisma_1.default.habitCompletion.create({
            data: {
                habitId,
                userId: req.userId,
                date: today,
                notes: notes || null,
            },
        });
        // Calculate new streak after completion
        const allCompletions = await prisma_1.default.habitCompletion.findMany({
            where: { habitId },
            select: { date: true },
            orderBy: { date: 'desc' },
        });
        const dates = allCompletions.map((c) => c.date);
        const currentStreak = (0, habits_1.calculateCurrentStreak)(dates);
        const longestStreak = (0, habits_1.calculateLongestStreak)(dates);
        res.status(201).json({
            success: true,
            message: getRandomMotivation(),
            data: { completion, currentStreak, longestStreak },
        });
    }
    catch (error) {
        next(error);
    }
});
// DELETE /api/completions/:habitId/:date – undo completion for a date
router.delete('/:habitId/:date', async (req, res, next) => {
    try {
        const habitId = String(req.params.habitId);
        const date = String(req.params.date);
        const habit = await prisma_1.default.habit.findFirst({
            where: { id: habitId, userId: req.userId },
        });
        if (!habit) {
            res.status(404).json({ success: false, message: 'Habit not found.' });
            return;
        }
        const completion = await prisma_1.default.habitCompletion.findUnique({
            where: { habitId_date: { habitId, date } },
        });
        if (!completion) {
            res.status(404).json({ success: false, message: 'Completion not found.' });
            return;
        }
        await prisma_1.default.habitCompletion.delete({
            where: { habitId_date: { habitId, date } },
        });
        res.json({ success: true, message: 'Completion removed.' });
    }
    catch (error) {
        next(error);
    }
});
// GET /api/completions/:habitId – paginated completion history
router.get('/:habitId', async (req, res, next) => {
    try {
        const habitId = String(req.params.habitId);
        const { page = '1', limit = '50' } = req.query;
        const habit = await prisma_1.default.habit.findFirst({
            where: { id: habitId, userId: req.userId },
        });
        if (!habit) {
            res.status(404).json({ success: false, message: 'Habit not found.' });
            return;
        }
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;
        const [completions, total] = await Promise.all([
            prisma_1.default.habitCompletion.findMany({
                where: { habitId },
                orderBy: { date: 'desc' },
                skip,
                take: limitNum,
            }),
            prisma_1.default.habitCompletion.count({ where: { habitId } }),
        ]);
        res.json({
            success: true,
            data: {
                completions,
                pagination: {
                    total,
                    page: pageNum,
                    limit: limitNum,
                    totalPages: Math.ceil(total / limitNum),
                },
            },
        });
    }
    catch (error) {
        next(error);
    }
});
// PATCH /api/completions/:habitId/:date – update notes for a completion
router.patch('/:habitId/:date', (0, validate_1.validate)(completeSchema), async (req, res, next) => {
    try {
        const habitId = String(req.params.habitId);
        const date = String(req.params.date);
        const { notes } = req.body;
        // Verify habit belongs to user
        const habit = await prisma_1.default.habit.findFirst({
            where: { id: habitId, userId: req.userId },
        });
        if (!habit) {
            res.status(404).json({ success: false, message: 'Habit not found.' });
            return;
        }
        const completion = await prisma_1.default.habitCompletion.update({
            where: { habitId_date: { habitId, date } },
            data: { notes: notes || null },
        });
        res.json({
            success: true,
            message: 'Note updated successfully!',
            data: { completion },
        });
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
//# sourceMappingURL=completions.js.map