import * as React from "react";
import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      className={cn(
        "flex h-10 w-full rounded-full border border-[var(--color-border)] bg-white px-4 py-2 text-sm text-[var(--color-text-strong)] placeholder:text-[var(--color-text-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]",
        className
      )}
      {...props}
    />
  );
}

export { Input };
