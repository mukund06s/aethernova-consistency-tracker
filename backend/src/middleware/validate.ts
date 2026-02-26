import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

export const validate =
    (schema: ZodSchema) =>
        (req: Request, res: Response, next: NextFunction): void => {
            try {
                req.body = schema.parse(req.body);
                next();
            } catch (error) {
                if (error instanceof ZodError) {
                    const errors: Record<string, string> = {};
                    error.errors.forEach((err) => {
                        const field = err.path.join('.');
                        errors[field] = err.message;
                    });
                    res.status(400).json({
                        success: false,
                        message: 'Validation failed. Please check your input.',
                        errors,
                    });
                    return;
                }
                next(error);
            }
        };
