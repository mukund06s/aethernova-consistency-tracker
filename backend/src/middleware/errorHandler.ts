import { Request, Response, NextFunction } from 'express';

export const errorHandler = (
    err: Error & { statusCode?: number; status?: number; errors?: Record<string, string> },
    _req: Request,
    res: Response,
    _next: NextFunction
): void => {
    const statusCode = err.statusCode || err.status || 500;
    const message =
        process.env.NODE_ENV === 'production' && statusCode === 500
            ? 'An unexpected error occurred. Please try again.'
            : err.message || 'Internal server error';

    console.error(`[Error] ${statusCode}: ${err.message}`);
    if (process.env.NODE_ENV === 'development') {
        console.error(err.stack);
    }

    res.status(statusCode).json({
        success: false,
        message,
        ...(err.errors ? { errors: err.errors } : {}),
    });
};
