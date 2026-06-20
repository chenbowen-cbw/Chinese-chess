import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import './globals.css';

export const metadata: Metadata = {
  title: '中国象棋 Xiangqi',
  description: 'Chinese Chess — local PVP, with AI and online play coming soon.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="zh">
      <body>{children}</body>
    </html>
  );
}
