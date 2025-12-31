'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const links = [
  { href: '/challenges', label: 'Challenges' },
  { href: '/leaderboard', label: 'Leaderboard' },
  { href: '/admin/submissions', label: 'Admin' },
];

function isActivePath(pathname: string, href: string) {
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Nav() {
  const pathname = usePathname();

  return (
    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] md:gap-3">
      {links.map((link) => {
        const isActive = pathname ? isActivePath(pathname, link.href) : false;
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={isActive ? 'page' : undefined}
            className={cn(
              'inline-flex h-10 items-center justify-center rounded-full border border-transparent px-4 text-[color:var(--muted)] transition hover:border-[color:var(--border-2)] hover:text-[color:var(--text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--bg)]',
              isActive &&
                'border-[color:var(--accent)] text-[color:var(--text)] shadow-[0_0_18px_var(--glow-accent)]',
            )}
          >
            {link.label}
          </Link>
        );
      })}
    </div>
  );
}
