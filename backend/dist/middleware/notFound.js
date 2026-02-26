"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notFound = void 0;
const notFound = (_req, res, _next) => {
    res.status(404).json({
        success: false,
        message: 'The requested endpoint does not exist.',
    });
};
exports.notFound = notFound;
//# sourceMappingURL=notFound.js.map