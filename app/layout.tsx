import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

// Import font Inter dari Google Fonts untuk tampilan yang modern
const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Todo App — Manajemen Tugas',
  description:
    'Aplikasi manajemen tugas (todo list) fullstack dengan Next.js dan Laravel. Login untuk mulai mengelola tugas Anda.',
};

/**
 * Root layout yang membungkus seluruh aplikasi Next.js.
 * Menyediakan font global dan struktur HTML dasar.
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
