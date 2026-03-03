import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const geist = Geist({ subsets: ["latin"] });
const geistMono = Geist_Mono({ subsets: ["latin"] });

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
      <body className={geist.className}>{children}</body>
      <Analytics />
    </html>
  )
}
