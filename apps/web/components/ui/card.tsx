import * as React from 'react';
import { cn } from '@/lib/utils';

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'rounded-3xl border border-[color:var(--border)] bg-[color:var(--panel)] p-6 shadow-[0_20px_50px_-40px_rgba(0,0,0,0.7)] backdrop-blur transition',
        className,
      )}
      {...props}
    />
  );
}
