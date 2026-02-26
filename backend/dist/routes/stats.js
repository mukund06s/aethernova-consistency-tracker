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
// GET /api/stats/analytics – detailed analytics for charts
router.get('/analytics', async (req, res, next) => {
    try {
        const userId = req.userId;
        const habits = await prisma_1.prisma.habit.findMany({ where: { userId } });
        if (!habits.length) {
            res.json({ success: true, data: { categoryStats: [], progression: [], bestDay: 'None' } });
            return;
        }
        // 1. Category Distribution & Success Rate
        const categoryStats = await Promise.all(['health', 'fitness', 'learning', 'mindfulness', 'productivity', 'social', 'creativity', 'finance', 'general'].map(async (cat) => {
            const catHabits = habits.filter(h => h.category === cat);
            if (!catHabits.length)
                return null;
            const habitIds = catHabits.map(h => h.id);
            const totalPossible = catHabits.length * 30; // Last 30 days
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            const completions = await prisma_1.prisma.habitCompletion.count({
                where: {
                    habitId: { in: habitIds },
                    date: { gte: getLocalDateString(thirtyDaysAgo) }
                }
            });
            return {
                category: cat,
                count: catHabits.length,
                rate: totalPossible > 0 ? Math.round((completions / totalPossible) * 100) : 0
            };
        }));
        // 2. Progression (Completion Rate Over Time - Last 14 Days)
        const progression = await Promise.all(Array.from({ length: 14 }, (_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - (13 - i));
            return getLocalDateString(d);
        }).map(async (dateStr) => {
            const completed = await prisma_1.prisma.habitCompletion.count({
                where: { userId, date: dateStr }
            });
            return {
                date: dateStr,
                rate: habits.length > 0 ? Math.round((completed / habits.length) * 100) : 0
            };
        }));
        // 3. Best Day of Week
        const allCompletions = await prisma_1.prisma.habitCompletion.findMany({
            where: { userId },
            select: { date: true }
        });
        const dayCounts = {};
        const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        allCompletions.forEach(c => {
            const dayName = dayNames[new Date(c.date).getDay()];
            dayCounts[dayName] = (dayCounts[dayName] || 0) + 1;
        });
        let bestDay = 'None';
        let maxCount = 0;
        Object.entries(dayCounts).forEach(([day, count]) => {
            if (count > maxCount) {
                maxCount = count;
                bestDay = day;
            }
        });
        res.json({
            success: true,
            data: {
                categoryStats: categoryStats.filter(Boolean),
                progression,
                bestDay
            }
        });
    }
    catch (error) {
        next(error);
    }
});
// GET /api/stats/weekly-review – summary for the previous complete week (Mon-Sun)
router.get('/weekly-review', async (req, res, next) => {
    try {
        const userId = req.userId;
        // QUERY 1: Get ALL active habits for this user
        const allHabits = await prisma_1.prisma.habit.findMany({
            where: {
                userId,
                archived: false
            }
        });
        // If user truly has no habits at all
        if (allHabits.length === 0) {
            return res.json({
                success: true,
                data: { hasHabits: false }
            });
        }
        // Calculate last week range (Mon-Sun)
        const today = new Date();
        const currentDay = today.getDay(); // 0=Sun, 1=Mon...
        const lastMonday = new Date(today);
        const daysToLastMonday = currentDay === 0 ? 6 : currentDay - 1;
        lastMonday.setDate(today.getDate() - daysToLastMonday - 7);
        lastMonday.setHours(0, 0, 0, 0);
        const lastSunday = new Date(lastMonday);
        lastSunday.setDate(lastMonday.getDate() + 6);
        lastSunday.setHours(23, 59, 59, 999);
        const startStr = getLocalDateString(lastMonday);
        const endStr = getLocalDateString(lastSunday);
        // QUERY 2: Get last week's completions
        const completions = await prisma_1.prisma.habitCompletion.findMany({
            where: {
                userId,
                date: { gte: startStr, lte: endStr }
            }
        });
        const totalHabits = allHabits.length;
        const totalPossibleCompletions = totalHabits * 7;
        const totalActualCompletions = completions.length;
        const completionRate = totalPossibleCompletions > 0
            ? Math.round((totalActualCompletions / totalPossibleCompletions) * 100)
            : 0;
        const completionsByHabit = {};
        allHabits.forEach(habit => {
            completionsByHabit[habit.id] = completions.filter(c => c.habitId === habit.id);
        });
        const habitsWithCount = allHabits.map(h => ({
            ...h,
            count: completionsByHabit[h.id].length,
            color: getCategoryColor(h.category)
        }));
        habitsWithCount.sort((a, b) => b.count - a.count);
        const bestHabit = habitsWithCount[0];
        const perfectHabits = allHabits
            .filter(h => completionsByHabit[h.id].length >= 7)
            .map(h => ({ id: h.id, title: h.title, color: getCategoryColor(h.category) }));
        const needsAttentionHabits = allHabits
            .filter(h => completionsByHabit[h.id].length <= 4)
            .map(h => ({
            id: h.id,
            title: h.title,
            missedDays: 7 - completionsByHabit[h.id].length,
            completions: completionsByHabit[h.id].length,
            color: getCategoryColor(h.category)
        }));
        const formatDate = (d) => d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
        const weekRange = {
            start: formatDate(lastMonday),
            end: formatDate(lastSunday)
        };
        res.json({
            success: true,
            data: {
                hasHabits: true,
                weekRange,
                completionRate,
                totalHabits,
                totalCompletions: totalActualCompletions,
                bestHabit: bestHabit.count > 0 ? {
                    title: bestHabit.title,
                    completions: bestHabit.count,
                    color: bestHabit.color,
                    streak: 0 // streak calculation can be added if needed, but keeping it simple for now as per user snippet
                } : null,
                perfectHabits,
                needsAttentionHabits
            }
        });
    }
    catch (error) {
        next(error);
    }
});
function getCategoryColor(cat) {
    const colors = {
        health: '#10b981', fitness: '#10b981', learning: '#6366f1',
        mindfulness: '#8b5cf6', productivity: '#f59e0b', social: '#ec4899',
        creativity: '#f97316', finance: '#06b6d4', general: '#6366f1'
    };
    return colors[cat] || '#6366f1';
}
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