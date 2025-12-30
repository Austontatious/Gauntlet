import * as React from 'react';
import { cn } from '@/lib/utils';

const Label = React.forwardRef<HTMLLabelElement, React.ComponentProps<'label'>>(
  ({ className, ...props }, ref) => (
    <label
      ref={ref}
      className={cn(
        'text-[0.95rem] font-semibold leading-[1.4] text-[color:var(--muted)]',
        className,
      )}
      {...props}
    />
  ),
);

Label.displayName = 'Label';

export { Label };
