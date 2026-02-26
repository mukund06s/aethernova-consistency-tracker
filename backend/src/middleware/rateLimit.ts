import rateLimit from 'express-rate-limit';

export const globalRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
    standardHeaders: 'draft-7', // draft-6: `RateLimit-*` headers; draft-7: combined `RateLimit` header
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    message: {
        success: false,
        message: 'Too many requests from this IP, please try again after 15 minutes',
    },
    skip: () => process.env.NODE_ENV === 'development',
});

export const authRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes window (was 1 hour)
    limit: 50, // 50 attempts per 15 min — blocks brute-force but allows normal use
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: {
        success: false,
        message: 'Too many authentication attempts, please try again after 15 minutes',
    },
    skip: () => process.env.NODE_ENV === 'development',
});
