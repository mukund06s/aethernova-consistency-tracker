/**
 * NotificationService
 *
 * This service handles daily reminder notifications based on user preferences.
 * In a production environment, this would integrate with an email provider (Postmark/SendGrid)
 * or a push notification service.
 */
export declare const NotificationService: {
    /**
     * In a real app, this would be called by a cron job every minute
     */
    checkAndSendReminders(): Promise<number>;
};
//# sourceMappingURL=notifications.d.ts.map