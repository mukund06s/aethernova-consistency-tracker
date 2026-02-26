"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = require("../lib/prisma");
const auth_1 = require("../middleware/auth");
const habits_1 = require("./habits");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
// GET /api/stats – dashboard stats
router.get('/', async (req, res, next) => {
    try {
        const userId = req.userId;
        // Fetch all habits with their completions
        const habits = await prisma_1.prisma.habit.findMany({
            where: { userId },
            include: {
                completions: {
                    select: { date: true },
                    orderBy: { date: 'desc' },
                },
            },
        });
        if (!habits.length) {
            res.json({
                success: true,
                data: {
                    totalHabits: 0,
                    currentStreak: 0,
                    longestStreak: 0,
                    overallCompletionRate: 0,
                    weeklyData: getWeeklyTemplate(),
                    heatmap: [],
                },
            });
            return;
        }
        // ── Overall completion rate ──────────────────────────────────────────
        const today = new Date();
        const totalHabits = habits.length;
        // Count completions in the last 30 days
        const thirtyDaysAgo = new Date(today);
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29);
        const startStr = getLocalDateString(thirtyDaysAgo);
        const todayStr = getLocalDateString(today);
        const possibleSlots = 30 * totalHabits;
        const totalCompletions = await prisma_1.prisma.habitCompletion.count({
            where: { userId, date: { gte: startStr, lte: todayStr } },
        });
        const overallCompletionRate = possibleSlots > 0
            ? Math.round((totalCompletions / possibleSlots) * 100)
            : 0;
        // ── Streaks (best current across all habits) ─────────────────────────
        let bestCurrentStreak = 0;
        let bestLongestStreak = 0;
        for (const habit of habits) {
            const dates = habit.completions.map((c) => c.date);
            bestCurrentStreak = Math.max(bestCurrentStreak, (0, habits_1.calculateCurrentStreak)(dates));
            bestLongestStreak = Math.max(bestLongestStreak, (0, habits_1.calculateLongestStreak)(dates));
        }
        // ── Weekly data (last 7 days) ────────────────────────────────────────
        const weeklyData = await buildWeeklyData(userId, totalHabits);
        // ── 90-day heatmap ───────────────────────────────────────────────────
        const heatmap = await buildHeatmap(userId, totalHabits);
        res.json({
            success: true,
            data: {
                totalHabits,
                currentStreak: bestCurrentStreak,
                longestStreak: bestLongestStreak,
                overallCompletionRate,
                weeklyData,
                heatmap,
            },
        });
    }
    catch (error) {
        next(error);
    }
});
// GET /api/stats/habit/:id – per-habit stats
router.get('/habit/:id', async (req, res, next) => {
    try {
        const id = String(req.params.id);
        // Verify habit belongs to user
        const habit = await prisma_1.prisma.habit.findFirst({
            where: { id, userId: req.userId },
        });
        if (!habit) {
            res.status(404).json({ success: false, message: 'Habit not found.' });
            return;
        }
        // Fetch completions separately for clean type inference
        const completionRecords = await prisma_1.prisma.habitCompletion.findMany({
            where: { habitId: id },
            select: { date: true },
            orderBy: { date: 'asc' },
        });
        const dates = completionRecords.map((c) => c.date);
        const currentStreak = (0, habits_1.calculateCurrentStreak)(dates);
        const longestStreak = (0, habits_1.calculateLongestStreak)(dates);
        const totalCompletions = dates.length;
        // Days since created
        const daysSinceCreated = Math.max(1, Math.floor((Date.now() - new Date(habit.createdAt).getTime()) / (1000 * 60 * 60 * 24)) + 1);
        const completionRate = Math.round((totalCompletions / daysSinceCreated) * 100);
        res.json({
            success: true,
            data: { currentStreak, longestStreak, totalCompletions, completionRate, daysSinceCreated },
        });
    }
    catch (error) {
        next(error);
    }
});
// Helper to get YYYY-MM-DD in local time
function getLocalDateString(d) {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}
// ── Helpers ────────────────────────────────────────────────────────────────
function getWeeklyTemplate() {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date();
    return Array.from({ length: 7 }, (_, i) => {
        const d = new Date(today);
        d.setDate(d.getDate() - (6 - i));
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const dateStr = `${year}-${month}-${day}`;
        return {
            date: dateStr,
            day: days[d.getDay()],
            completed: 0,
            total: 0,
            rate: 0,
        };
    });
}
async function buildWeeklyData(userId, totalHabits) {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date();
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    const completions = await prisma_1.prisma.habitCompletion.findMany({
        where: {
            userId,
            date: {
                gte: getLocalDateString(sevenDaysAgo),
                lte: getLocalDateString(today),
            },
        },
        select: { date: true },
    });
    const countByDate = {};
    completions.forEach((c) => {
        countByDate[c.date] = (countByDate[c.date] || 0) + 1;
    });
    return Array.from({ length: 7 }, (_, i) => {
        const d = new Date(today);
        d.setDate(d.getDate() - (6 - i));
        const dateStr = getLocalDateString(d);
        const completed = countByDate[dateStr] || 0;
        return {
            date: dateStr,
            day: days[d.getDay()],
            completed,
            total: totalHabits,
            rate: totalHabits > 0 ? Math.round((completed / totalHabits) * 100) : 0,
        };
    });
}
async function buildHeatmap(userId, totalHabits) {
    const today = new Date();
    const ninetyDaysAgo = new Date(today);
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 89);
    const completions = await prisma_1.prisma.habitCompletion.findMany({
        where: {
            userId,
            date: {
                gte: getLocalDateString(ninetyDaysAgo),
                lte: getLocalDateString(today),
            },
        },
        select: { date: true },
    });
    const countByDate = {};
    completions.forEach((c) => {
        countByDate[c.date] = (countByDate[c.date] || 0) + 1;
    });
    return Array.from({ length: 90 }, (_, i) => {
        const d = new Date(today);
        d.setDate(d.getDate() - (89 - i));
        const dateStr = getLocalDateString(d);
        const completed = countByDate[dateStr] || 0;
        const intensity = totalHabits > 0 ? completed / totalHabits : 0;
        return { date: dateStr, completed, total: totalHabits, intensity };
    });
}
exports.default = router;
//# sourceMappingURL=stats.js.map