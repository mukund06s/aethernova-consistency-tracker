"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = __importDefault(require("../lib/prisma"));
const authenticate = async (req, res, next) => {
    try {
        const token = req.cookies?.token || req.headers.authorization?.replace('Bearer ', '');
        if (!token) {
            res.status(401).json({
                success: false,
                message: 'Authentication required. Please log in.',
            });
            return;
        }
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        // Verify user still exists in DB
        const user = await prisma_1.default.user.findUnique({
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
    }
    catch (error) {
        if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
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
exports.authenticate = authenticate;
//# sourceMappingURL=auth.js.map