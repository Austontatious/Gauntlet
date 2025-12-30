import * as React from 'react';
import { cn } from '@/lib/utils';

export function Badge({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border border-[color:var(--border-2)] bg-[color:var(--panel-2)] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-[color:var(--muted)] shadow-[0_0_12px_rgba(0,0,0,0.25)] font-mono',
        className,
      )}
      {...props}
    />
  );
}
