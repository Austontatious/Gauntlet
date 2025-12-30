import Link from 'next/link';
import { Nav } from '@/components/Nav';

type AppShellProps = {
  theme: 'arena' | 'console';
  children: React.ReactNode;
};

export function AppShell({ theme, children }: AppShellProps) {
  return (
    <div data-theme={theme} className="app-shell">
      <div className="app-shell__content">
        <header className="px-6 pt-6 md:px-12">
          <nav
            className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4"
            aria-label="Primary"
          >
            <Link
              href="/"
              className="inline-flex h-10 items-center px-2 text-lg font-semibold uppercase tracking-[0.2em] text-[color:var(--text)]"
            >
              Gauntlet
            </Link>
            <Nav />
          </nav>
        </header>
        {children}
        <footer className="px-6 pb-10 pt-20 text-center text-xs text-[color:var(--muted)] md:px-12">
          Gauntlet v0.1 -- vibe coding meets audit-grade engineering.
        </footer>
      </div>
    </div>
  );
}
