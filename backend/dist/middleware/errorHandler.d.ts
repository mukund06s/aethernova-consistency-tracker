import { Request, Response, NextFunction } from 'express';
export declare const errorHandler: (err: Error & {
    statusCode?: number;
    status?: number;
    errors?: Record<string, string>;
}, _req: Request, res: Response, _next: NextFunction) => void;
//# sourceMappingURL=errorHandler.d.ts.map