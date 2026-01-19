import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import { SessionProvider } from '@/components/providers/session-provider';
import { Toaster } from '@/components/ui/sonner';
import './globals.css';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
});

const jetbrainsMono = JetBrains_Mono({
  variable: '--font-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Meta Campaign Manager',
  description: 'Gerencie suas campanhas do Meta com inteligência artificial',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased`}>
        <SessionProvider>
          {children}
          <Toaster />
        </SessionProvider>
      </body>
    </html>
  );
}
