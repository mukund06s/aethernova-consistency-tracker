"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = void 0;
const zod_1 = require("zod");
const validate = (schema) => (req, res, next) => {
    try {
        req.body = schema.parse(req.body);
        next();
    }
    catch (error) {
        if (error instanceof zod_1.ZodError) {
            const errors = {};
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
exports.validate = validate;
//# sourceMappingURL=validate.js.map