import type { Metadata } from 'next'
import localFont from 'next/font/local'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import SessionManager from '@/components/SessionManager'

const geSsTwo = localFont({
  src: '../public/fonts/GE_SS_Two_Bold.otf',
  variable: '--font-ge-ss-two',
  display: 'swap',
  weight: '700',
});

export const metadata: Metadata = {
  title: 'منصة إدارة الفعاليات والدعوات',
  description: 'منصة متكاملة لإدارة الفعاليات والدعوات وتتبع حضور الضيوف',
  generator: 'v0.app'
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl">
      <body className={geSsTwo.className}>
        <SessionManager>
          {children}
        </SessionManager>
        <Analytics />
      </body>
    </html>
  )
}
