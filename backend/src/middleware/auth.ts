import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma';

export interface AuthRequest extends Request {
    userId?: string;
    userName?: string;
}

interface JwtPayload {
    userId: string;
    email: string;
}

export const authenticate = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const token = req.cookies?.token || req.headers.authorization?.replace('Bearer ', '');

        if (!token) {
            res.status(401).json({
                success: false,
                message: 'Authentication required. Please log in.',
            });
            return;
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;

        // Verify user still exists in DB
        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
            select: { id: true, name: true },
        });

        if (!user) {
            res.status(401).json({
                success: false,
                message: 'User account not found. Please log in again.',
            });
            return;
        }

        req.userId = decoded.userId;
        req.userName = user.name;
        next();
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            res.status(401).json({
                success: false,
                message: 'Session expired. Please log in again.',
            });
            return;
        }
        res.status(401).json({
            success: false,
            message: 'Invalid authentication token.',
        });
    }
};
