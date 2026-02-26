"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const errorHandler = (err, _req, res, _next) => {
    const statusCode = err.statusCode || err.status || 500;
    const message = process.env.NODE_ENV === 'production' && statusCode === 500
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
exports.errorHandler = errorHandler;
//# sourceMappingURL=errorHandler.js.map