"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = void 0;
const prisma_1 = __importDefault(require("./prisma"));
/**
 * NotificationService
 *
 * This service handles daily reminder notifications based on user preferences.
 * In a production environment, this would integrate with an email provider (Postmark/SendGrid)
 * or a push notification service.
 */
exports.NotificationService = {
    /**
     * In a real app, this would be called by a cron job every minute
     */
    async checkAndSendReminders() {
        const now = new Date();
        const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
        console.log(`[NotificationService] Checking reminders for ${currentTime}...`);
        const usersToRemind = await prisma_1.default.user.findMany({
            where: {
                reminderTime: currentTime,
            },
            select: {
                id: true,
                email: true,
                name: true
            }
        });
        for (const user of usersToRemind) {
            console.log(`[NotificationService] 📧 Sending reminder to ${user.name} (${user.email})`);
            // integration logic here...
        }
        return usersToRemind.length;
    }
};
//# sourceMappingURL=notifications.js.map