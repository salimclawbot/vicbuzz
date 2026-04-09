"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export default function SiteHeader({ transparent = false }: { transparent?: boolean }) {
  const pathname = usePathname();

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/events", label: "Events" },
    { href: "/explore", label: "Explore" },
    { href: "/blog", label: "Guides" },
    { href: "/submit", label: "List a Spot" },
  ];

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b border-[var(--color-border)]",
        transparent ? "bg-white/90 backdrop-blur-sm" : "bg-white"
      )}
    >
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="flex flex-shrink-0 items-center gap-1.5">
          <span className="text-xl">🐝</span>
          <span className="text-base font-bold text-[var(--color-text-strong)]">VicBuzz</span>
        </Link>

        <nav className="no-scrollbar flex items-center gap-1 overflow-x-auto">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                buttonVariants({ size: "sm", variant: isActive(href) ? "default" : "ghost" }),
                "h-8 px-3 text-xs"
              )}
            >
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
