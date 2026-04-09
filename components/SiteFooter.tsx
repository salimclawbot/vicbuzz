import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer className="bg-[#1A1A2E] text-white mt-16">
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-amber-400 mb-3">VicBuzz</p>
            <p className="text-xs text-white/60 leading-relaxed">Victoria's family activity guide. Discover playgrounds, cafes, markets, parks and free things to do with kids.</p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-amber-400 mb-3">Explore</p>
            <div className="space-y-1.5">
              <Link href="/events" className="block text-xs text-white/70 hover:text-white">What's On</Link>
              <Link href="/explore" className="block text-xs text-white/70 hover:text-white">Suburbs</Link>
              <Link href="/blog" className="block text-xs text-white/70 hover:text-white">Guides</Link>
            </div>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-amber-400 mb-3">List</p>
            <div className="space-y-1.5">
              <Link href="/submit" className="block text-xs text-white/70 hover:text-white">Submit a Spot</Link>
              <Link href="/claim" className="block text-xs text-white/70 hover:text-white">Claim Your Listing</Link>
            </div>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-amber-400 mb-3">About</p>
            <div className="space-y-1.5">
              <Link href="/privacy" className="block text-xs text-white/70 hover:text-white">Privacy</Link>
              <Link href="/terms" className="block text-xs text-white/70 hover:text-white">Terms</Link>
            </div>
          </div>
        </div>
        <div className="border-t border-white/10 mt-8 pt-6 flex items-center justify-between">
          <p className="text-xs text-white/40">© 2026 VicBuzz. Made for Victorian families.</p>
          <span className="text-sm">🐝</span>
        </div>
      </div>
    </footer>
  );
}
