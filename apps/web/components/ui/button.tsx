import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-xl text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--bg)] disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default:
          'bg-[color:var(--primary)] text-[color:var(--bg)] shadow-[0_0_22px_var(--glow-primary)] hover:bg-[color:var(--primary-2)] hover:shadow-[0_0_28px_var(--glow-primary)]',
        secondary:
          'border border-[color:var(--border)] bg-[color:var(--panel-2)] text-[color:var(--text)] hover:border-[color:var(--border-2)] hover:text-[color:var(--text)] hover:shadow-[0_0_18px_var(--glow-accent)]',
        outline:
          'border border-[color:var(--border-2)] text-[color:var(--text)] hover:border-[color:var(--primary)] hover:text-[color:var(--primary)]',
        ghost:
          'text-[color:var(--muted)] hover:text-[color:var(--text)] hover:bg-[color:var(--panel)]',
      },
      size: {
        sm: 'h-9 px-4',
        md: 'h-11 px-6',
        lg: 'h-12 px-8 text-base',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size }), className)}
        ref={ref}
        {...props}
      />
    );
  },
);

Button.displayName = 'Button';

export { Button, buttonVariants };
