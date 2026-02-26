"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const dotenv_1 = __importDefault(require("dotenv"));
const auth_1 = __importDefault(require("./routes/auth"));
const habits_1 = __importDefault(require("./routes/habits"));
const completions_1 = __importDefault(require("./routes/completions"));
const stats_1 = __importDefault(require("./routes/stats"));
const quotes_1 = __importDefault(require("./routes/quotes"));
const errorHandler_1 = require("./middleware/errorHandler");
const notFound_1 = require("./middleware/notFound");
const rateLimit_1 = require("./middleware/rateLimit");
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
// Security middleware
app.use((0, helmet_1.default)({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
}));
// CORS – allow frontend origin with credentials
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, cookie_parser_1.default)());
// Global rate limiter
app.use('/api', rateLimit_1.globalRateLimiter);
// Health check
app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
// Cache middleware for static-like content
const cacheOneHour = (_req, res, next) => {
    if (process.env.NODE_ENV === 'production') {
        res.set('Cache-Control', 'public, max-age=3600'); // 1 hour
    }
    next();
};
// API routes
app.use('/api/auth', rateLimit_1.authRateLimiter, auth_1.default);
app.use('/api/habits', habits_1.default);
app.use('/api/completions', completions_1.default);
app.use('/api/stats', stats_1.default);
app.use('/api/quotes/today', cacheOneHour); // Cache the daily quote
app.use('/api/quotes', quotes_1.default);
// Error handling
app.use(notFound_1.notFound);
app.use(errorHandler_1.errorHandler);
app.listen(PORT, () => {
    console.log(`🚀 AetherNova API running on http://localhost:${PORT}`);
    console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
});
exports.default = app;
//# sourceMappingURL=index.js.map