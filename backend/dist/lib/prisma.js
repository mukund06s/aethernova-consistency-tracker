"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectWithRetry = connectWithRetry;
const client_1 = require("@prisma/client");
const prismaClientSingleton = () => {
    return new client_1.PrismaClient({
        log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    });
};
const globalForPrisma = globalThis;
const prisma = globalForPrisma.prisma ?? prismaClientSingleton();
exports.default = prisma;
if (process.env.NODE_ENV !== 'production')
    globalForPrisma.prisma = prisma;
/**
 * Robust Connection Check with Retry Logic
 */
async function connectWithRetry(retries = 5, delay = 5000) {
    for (let i = 0; i < retries; i++) {
        try {
            await prisma.$connect();
            console.log('✅ Database connection established');
            return true;
        }
        catch (error) {
            console.error(`❌ Connection attempt ${i + 1} failed:`, error);
            if (i < retries - 1) {
                console.log(`Retrying in ${delay / 1000}s...`);
                await new Promise((res) => setTimeout(res, delay));
            }
        }
    }
    return false;
}
//# sourceMappingURL=prisma.js.map