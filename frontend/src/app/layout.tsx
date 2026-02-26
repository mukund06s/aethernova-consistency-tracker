import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/contexts/auth-context';
import { Toaster } from 'sonner';
import NotificationService from '@/components/layout/notification-service';
import ShortcutHandler from '@/components/layout/shortcut-handler';
import AmbientBackground from '@/components/AmbientBackground';
import { ThemeProvider } from '@/contexts/theme-context';
import { UIProvider } from '@/contexts/ui-context';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'AetherNova – Build Better Habits',
    template: '%s | AetherNova',
  },
  description:
    'AetherNova is a premium habit tracker that helps you build consistent habits, track streaks, and celebrate milestones.',
  keywords: ['habit tracker', 'productivity', 'streaks', 'goals', 'mindfulness'],
  authors: [{ name: 'AetherNova' }],
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="antialiased font-sans bg-[#080812]">
        <ThemeProvider>
          <AmbientBackground />
          <div className="relative z-10 min-h-screen">
            <AuthProvider>
              <UIProvider>
                <NotificationService />
                <ShortcutHandler />
                {children}
                <Toaster
                  position="bottom-right"
                  theme="dark"
                  richColors
                  toastOptions={{
                    style: {
                      background: 'rgba(18, 18, 26, 0.95)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      backdropFilter: 'blur(20px)',
                    },
                  }}
                />
              </UIProvider>
            </AuthProvider>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
