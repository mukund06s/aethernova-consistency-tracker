"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Curated motivational quotes for habits & productivity
const QUOTES = [
    { text: "We are what we repeatedly do. Excellence, then, is not an act, but a habit.", author: "Aristotle" },
    { text: "Small daily improvements over time lead to stunning results.", author: "Robin Sharma" },
    { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
    { text: "Success is the sum of small efforts repeated day in and day out.", author: "Robert Collier" },
    { text: "Motivation is what gets you started. Habit is what keeps you going.", author: "Jim Ryun" },
    { text: "You don't rise to the level of your goals, you fall to the level of your systems.", author: "James Clear" },
    { text: "The chains of habit are too light to be felt until they are too heavy to be broken.", author: "Warren Buffett" },
    { text: "First forget inspiration. Habit is more dependable.", author: "Octavia Butler" },
    { text: "A year from now you may wish you had started today.", author: "Karen Lamb" },
    { text: "Each day is a new beginning. Take a deep breath and start again.", author: "Unknown" },
    { text: "Progress, not perfection, is the goal.", author: "Joyce Meyer" },
    { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
    { text: "Discipline is choosing between what you want now and what you want most.", author: "Abraham Lincoln" },
    { text: "Every action you take is a vote for the type of person you wish to become.", author: "James Clear" },
    { text: "Consistency is the key to achieving and maintaining momentum.", author: "Darren Hardy" },
    { text: "Your future is created by what you do today, not tomorrow.", author: "Robert Kiyosaki" },
    { text: "It does not matter how slowly you go as long as you do not stop.", author: "Confucius" },
    { text: "The best time to plant a tree was 20 years ago. The second best time is now.", author: "Chinese Proverb" },
    { text: "Hard work beats talent when talent fails to work hard.", author: "Kevin Durant" },
    { text: "Energy and persistence conquer all things.", author: "Benjamin Franklin" },
    { text: "The journey of a thousand miles begins with one step.", author: "Lao Tzu" },
    { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
    { text: "What you do every day matters more than what you do once in a while.", author: "Gretchen Rubin" },
    { text: "Be consistent. The real key to success in any area.", author: "Dwayne Johnson" },
    { text: "Make it so easy you can't say no. Even a 2-min version counts.", author: "James Clear" },
    { text: "Don't count the days, make the days count.", author: "Muhammad Ali" },
    { text: "The difference between who you are and who you want to be is what you do.", author: "Unknown" },
    { text: "Show up, do the work, then let it go. Repeat.", author: "Unknown" },
    { text: "Action is the foundational key to all success.", author: "Pablo Picasso" },
    { text: "Take care of your body. It's the only place you have to live.", author: "Jim Rohn" },
];
// Deterministic daily quote by date seed
function getDailyQuote(dateStr) {
    // Hash date string to pick quote
    let hash = 0;
    for (let i = 0; i < dateStr.length; i++) {
        hash = (hash * 31 + dateStr.charCodeAt(i)) >>> 0;
    }
    return QUOTES[hash % QUOTES.length];
}
// GET /api/quotes/today – deterministic daily quote (no auth required)
router.get('/today', async (_req, res, next) => {
    try {
        const today = new Date().toISOString().split('T')[0];
        const quote = getDailyQuote(today);
        res.json({
            success: true,
            data: { quote: { ...quote, date: today } },
        });
    }
    catch (error) {
        next(error);
    }
});
// GET /api/quotes/random – random quote for refresh
router.get('/random', auth_1.authenticate, (_req, res, next) => {
    try {
        const quote = QUOTES[Math.floor(Math.random() * QUOTES.length)];
        res.json({ success: true, data: { quote } });
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
//# sourceMappingURL=quotes.js.map