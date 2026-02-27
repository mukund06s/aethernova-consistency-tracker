import prisma from './prisma';

/**
 * NotificationService
 * 
 * This service handles daily reminder notifications based on user preferences.
 * In a production environment, this would integrate with an email provider (Postmark/SendGrid)
 * or a push notification service.
 */
export const NotificationService = {
    /**
     * In a real app, this would be called by a cron job every minute
     */
    async checkAndSendReminders() {
        const now = new Date();
        const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

        console.log(`[NotificationService] Checking reminders for ${currentTime}...`);

        const usersToRemind = await prisma.user.findMany({
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
