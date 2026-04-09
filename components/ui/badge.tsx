import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors", {
  variants: {
    variant: {
      default: "bg-[var(--color-primary-soft)] text-[var(--color-primary-strong)]",
      secondary: "bg-[var(--color-secondary-soft)] text-[var(--color-text-strong)]",
      outline: "border border-[var(--color-border)] text-[var(--color-text-muted)]"
    }
  },
  defaultVariants: { variant: "default" }
});

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
