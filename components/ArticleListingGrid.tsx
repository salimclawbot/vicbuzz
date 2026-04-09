import Link from "next/link";
import { listings } from "@/lib/listings";

interface Props {
  suburb?: string;
  category?: string;
  title?: string;
  limit?: number;
}

export default function ArticleListingGrid({ suburb, category, title, limit = 6 }: Props) {
  // Try suburb first, fall back to category, then just take anything with images
  let filtered = listings.filter((l) => l.image && l.image.startsWith("http"));
  
  if (suburb) {
    const suburbFiltered = filtered.filter((l) =>
      l.suburb?.toLowerCase().includes(suburb.toLowerCase()) ||
      l.title?.toLowerCase().includes(suburb.toLowerCase()) ||
      l.region?.toLowerCase().includes(suburb.toLowerCase())
    );
    if (suburbFiltered.length >= 3) filtered = suburbFiltered;
  }
  
  if (category && filtered.length < 6) {
    const catFiltered = listings.filter((l) =>
      l.image && l.image.startsWith("http") &&
      l.category?.toLowerCase().includes(category.toLowerCase())
    );
    if (catFiltered.length >= 3) filtered = [...filtered, ...catFiltered];
  }

  // Shuffle deterministically based on title to get variety
  const shuffled = filtered.sort((a, b) => a.id.localeCompare(b.id));
  const shown = shuffled.slice(0, limit);

  if (shown.length === 0) return null;

  return (
    <div className="my-6 not-prose">
      {title && (
        <div className="flex items-center gap-2 mb-3">
          <span className="text-amber-500 text-sm">📍</span>
          <p className="text-xs font-bold uppercase tracking-widest text-[var(--color-primary)]">{title}</p>
        </div>
      )}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {shown.map((listing) => (
          <Link
            key={listing.id}
            href={`/listing/${listing.id}`}
            className="group rounded-xl overflow-hidden border border-[var(--color-border)] bg-white shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5"
          >
            <div className="relative h-28 w-full bg-amber-50 overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={listing.image!}
                alt={listing.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                loading="lazy"
              />
              {listing.price === "Free" && (
                <span className="absolute top-2 left-2 bg-emerald-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">Free</span>
              )}
            </div>
            <div className="p-2.5">
              <p className="text-xs font-semibold text-[var(--color-text-strong)] leading-snug line-clamp-2">{listing.title}</p>
              {listing.suburb && <p className="text-[10px] text-[var(--color-text-muted)] mt-0.5">📍 {listing.suburb}</p>}
            </div>
          </Link>
        ))}
      </div>
      <div className="mt-3 text-right">
        <Link href={suburb ? `/explore/${suburb.toLowerCase().replace(/ /g, "-")}` : "/"} className="text-xs text-[var(--color-primary)] hover:underline font-medium">
          See all activities {suburb ? `in ${suburb}` : "on VicBuzz"} →
        </Link>
      </div>
    </div>
  );
}
