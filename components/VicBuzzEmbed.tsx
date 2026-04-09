import Link from "next/link";
import Image from "next/image";
import { listings } from "@/lib/listings";

type Props = {
  suburb?: string;
  category?: string;
  title?: string;
};

const categoryEmoji: Record<string, string> = {
  kids: "🧒",
  food: "🍽️",
  markets: "🛒",
  music: "🎵",
  workshops: "🧠",
  community: "🤝",
  sports: "🏆",
  outdoors: "🌳",
  playground: "🛝",
};

function slugify(value: string) {
  return value.toLowerCase().replace(/\s+/g, "-");
}

export default function VicBuzzEmbed({ suburb, category, title }: Props) {
  const normalizedSuburb = suburb?.trim().toLowerCase();
  const normalizedCategory = category?.trim().toLowerCase();

  const filtered = listings.filter((item) => {
    if (normalizedSuburb) {
      return item.suburb.toLowerCase() === normalizedSuburb;
    }
    if (normalizedCategory) {
      return item.category.toLowerCase().includes(normalizedCategory);
    }
    return true;
  });

  const results = filtered.slice(0, 6);

  if (!results.length) {
    return null;
  }

  const ctaHref = normalizedSuburb
    ? `/explore/${slugify(normalizedSuburb)}`
    : normalizedCategory
    ? `/?category=${encodeURIComponent(normalizedCategory)}`
    : "/explore";

  return (
    <section className="mt-10 rounded-2xl border border-amber-200/30 bg-gradient-to-br from-amber-50 to-orange-50 p-4 sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-base font-bold text-[var(--color-text-strong)]">
          {title || "More activities on VicBuzz"}
        </h3>
        <span className="rounded-full bg-amber-500 px-2.5 py-1 text-xs font-bold text-black">
          {filtered.length}
        </span>
      </div>

      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {results.map((item) => (
          <Link
            key={item.id}
            href={item.url || `/listing/${item.id}`}
            className="flex items-center gap-2 rounded-xl border border-white bg-white/90 p-2.5 transition hover:shadow-sm"
          >
            <div className="h-[50px] w-[50px] overflow-hidden rounded-lg bg-[var(--color-primary-soft)]">
              {item.image ? (
                <Image
                  src={item.image}
                  alt={item.title}
                  width={50}
                  height={50}
                  className="h-full w-full object-cover"
                  unoptimized
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-xl">🐝</div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-[var(--color-text-strong)]">{item.title}</p>
              <div className="mt-0.5 flex items-center gap-2 text-xs text-[var(--color-text-muted)]">
                <span className="rounded-full bg-[var(--color-primary-soft)] px-2 py-0.5">{item.suburb}</span>
                <span>{categoryEmoji[item.category] || "🐝"}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-3">
        <Link
          href={ctaHref}
          className="inline-flex items-center rounded-full border border-amber-400 bg-amber-300 px-4 py-2 text-sm font-bold text-black hover:bg-amber-200"
        >
          See all {filtered.length} activities →
        </Link>
      </div>
    </section>
  );
}
