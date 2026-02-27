import { PrismaClient } from '@prisma/client';
declare const prisma: PrismaClient<{
    log: ("query" | "warn" | "error")[];
}, never, import("@prisma/client/runtime/library").DefaultArgs>;
export default prisma;
/**
 * Robust Connection Check with Retry Logic
 */
export declare function connectWithRetry(retries?: number, delay?: number): Promise<boolean>;
//# sourceMappingURL=prisma.d.ts.map