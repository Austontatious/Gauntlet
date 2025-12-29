import type { Metadata } from 'next';
import { JetBrains_Mono, Space_Grotesk } from 'next/font/google';
import Link from 'next/link';
import './globals.css';

const spaceGrotesk = Space_Grotesk({
  variable: '--font-space-grotesk',
  subsets: ['latin'],
});

const jetBrainsMono = JetBrains_Mono({
  variable: '--font-jetbrains-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Gauntlet',
  description: 'A competitive coding arena for vibe coding vs pro dev.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${spaceGrotesk.variable} ${jetBrainsMono.variable} antialiased`}
      >
        <div className="min-h-screen bg-grid">
          <header className="px-6 py-6 md:px-12">
            <nav className="mx-auto flex max-w-6xl items-center justify-between">
              <Link href="/" className="text-xl font-semibold tracking-tight text-slate-900">
                Gauntlet
              </Link>
              <div className="flex items-center gap-4 text-sm font-semibold text-slate-600">
                <Link href="/challenges" className="hover:text-slate-900">
                  Challenges
                </Link>
                <Link
                  href="/challenges/challenge-001/leaderboard"
                  className="hover:text-slate-900"
                >
                  Leaderboard
                </Link>
                <Link href="/admin/submissions" className="hover:text-slate-900">
                  Admin
                </Link>
              </div>
            </nav>
          </header>
          {children}
          <footer className="px-6 pb-10 pt-20 text-center text-xs text-slate-500 md:px-12">
            Gauntlet v0.1 -- vibe coding meets audit-grade engineering.
          </footer>
        </div>
      </body>
    </html>
  );
}
