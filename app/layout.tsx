import type { Metadata, Viewport } from 'next'
import localFont from 'next/font/local'
import { Analytics } from '@vercel/analytics/next'
import 'tw-animate-css'
import './globals.css'
import SessionManager from '@/components/SessionManager'

const geSsTwo = localFont({
  src: '../public/fonts/GE_SS_Two_Bold.otf',
  variable: '--font-ge-ss-two',
  display: 'swap',
  preload: true,
  weight: '700',
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#F08784',
};

export const metadata: Metadata = {
  title: 'هابي مومنتس | منصة إدارة الفعاليات والدعوات',
  description: 'هابي مومنتس هي منصة كويتية متكاملة لتصميم دعوات التهنئة الإلكترونية وإدارة الفعاليات وتتبع حضور الضيوف بأسلوب عصري وأنيق.',
  generator: 'v0.app'
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link rel="preconnect" href="https://res.cloudinary.com" />
        <link rel="preconnect" href="https://va.vercel-scripts.com" />
        {/* Preload the LCP image for faster discovery */}
        <link rel="preload" href="/herosection1.png" as="image" fetchpriority="high" />
      </head>
      <body className={geSsTwo.className}>
        <SessionManager>
          {children}
        </SessionManager>
        <Analytics />
      </body>
    </html>
  )
}
