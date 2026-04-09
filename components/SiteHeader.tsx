"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function SiteHeader({ transparent = false }: { transparent?: boolean }) {
  const pathname = usePathname();

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/events", label: "Events" },
    { href: "/explore", label: "Explore" },
    { href: "/blog", label: "Guides" },
    { href: "/submit", label: "List a Spot" },
  ];

  return (
    <header className={`sticky top-0 z-50 border-b border-gray-100 ${transparent ? "bg-white/90 backdrop-blur-sm" : "bg-white"}`}>
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-1.5 flex-shrink-0">
          <span className="text-xl">🐝</span>
          <span className="font-bold text-[#1A1A2E] text-base">VicBuzz</span>
        </Link>

        <nav className="flex items-center gap-1 overflow-x-auto">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                isActive(href)
                  ? "bg-[#FF6B6B] text-white"
                  : "text-[#6B7280] hover:text-[#1A1A2E] hover:bg-gray-50"
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
