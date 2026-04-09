import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer className="bg-[var(--color-muted-surface)] text-[var(--color-text-strong)] mt-16 border-t border-[var(--color-border)]">
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-[var(--color-primary)] mb-3">VicBuzz</p>
            <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">Victoria's family activity guide. Discover playgrounds, cafes, markets, parks and free things to do with kids.</p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-[var(--color-primary)] mb-3">Explore</p>
            <div className="space-y-1.5">
              <Link href="/events" className="block text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text-strong)]">What's On</Link>
              <Link href="/explore" className="block text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text-strong)]">Suburbs</Link>
              <Link href="/blog" className="block text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text-strong)]">Guides</Link>
            </div>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-[var(--color-primary)] mb-3">List</p>
            <div className="space-y-1.5">
              <Link href="/submit" className="block text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text-strong)]">Submit a Spot</Link>
              <Link href="/claim" className="block text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text-strong)]">Claim Your Listing</Link>
            </div>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-[var(--color-primary)] mb-3">About</p>
            <div className="space-y-1.5">
              <Link href="/privacy" className="block text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text-strong)]">Privacy</Link>
              <Link href="/terms" className="block text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text-strong)]">Terms</Link>
            </div>
          </div>
        </div>
        <div className="border-t border-[var(--color-border)] mt-8 pt-6 flex items-center justify-between">
          <p className="text-xs text-[var(--color-text-muted)]">© 2026 VicBuzz. Made for Victorian families.</p>
          <span className="text-sm">🐝</span>
        </div>
      </div>
    </footer>
  );
}
