
import type { Metadata } from 'next';
import './globals.css';
import { WarehouseProvider } from './lib/store';
import { Toaster } from '@/components/ui/toaster';

export const metadata: Metadata = {
  title: 'A-E Storage Ecosystem | نظام إدارة المخازن والديون',
  description: 'نظام ذكي وشامل لإدارة المخزون، الديون، والمصاريف',
  manifest: '/manifest.json',
  themeColor: '#336699',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Noto+Kufi+Arabic:wght@100..900&display=swap" rel="stylesheet" />
        <link rel="icon" href="https://picsum.photos/seed/ae-icon/32/32" />
      </head>
      <body className="font-sans antialiased bg-background text-foreground" style={{ fontFamily: "'Noto Kufi Arabic', 'Inter', sans-serif" }}>
        <WarehouseProvider>
          {children}
          <Toaster />
        </WarehouseProvider>
      </body>
    </html>
  );
}
