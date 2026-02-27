import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';

import prisma, { connectWithRetry } from './lib/prisma';

import authRoutes from './routes/auth';
import habitRoutes from './routes/habits';
import completionRoutes from './routes/completions';
import statsRoutes from './routes/stats';
import quoteRoutes from './routes/quotes';
import { errorHandler } from './middleware/errorHandler';
import { notFound } from './middleware/notFound';
import { globalRateLimiter, authRateLimiter } from './middleware/rateLimit';

dotenv.config();

const app = express();
app.set('trust proxy', 1);
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

// CORS – allow frontend origin with credentials
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Global rate limiter
app.use('/api', globalRateLimiter);

// Health check
app.get('/health', async (_req, res) => {
    try {
        await prisma.$queryRaw`SELECT 1`;
        res.json({
            status: 'ok',
            db: 'connected',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(503).json({
            status: 'error',
            db: 'disconnected',
            timestamp: new Date().toISOString()
        });
    }
});

// Cache middleware for static-like content
const cacheOneHour = (_req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (process.env.NODE_ENV === 'production') {
        res.set('Cache-Control', 'public, max-age=3600'); // 1 hour
    }
    next();
};

// API routes
app.use('/api/auth', authRateLimiter, authRoutes);
app.use('/api/habits', habitRoutes);
app.use('/api/completions', completionRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/quotes/today', cacheOneHour); // Cache the daily quote
app.use('/api/quotes', quoteRoutes);

// Error handling
app.use(notFound);
app.use(errorHandler);

app.listen(PORT, async () => {
    console.log(`🚀 AetherNova API running on http://localhost:${PORT}`);
    console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);

    // Non-blocking connection check
    await connectWithRetry();
});

export default app;
