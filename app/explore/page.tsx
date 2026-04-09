import { listings } from "@/lib/listings";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Explore Victoria | VicBuzz",
  description:
    "Browse family-friendly spots across Victoria by suburb. Parks, playgrounds, cafes, markets and more.",
  openGraph: {
    title: "Explore Victoria | VicBuzz",
    description: "Browse family-friendly spots across Victoria by suburb. Parks, playgrounds, cafes, markets and more.",
    type: "website",
    url: "https://vicbuzz.com.au/explore",
  },
  twitter: {
    card: "summary_large_image",
    title: "Explore Victoria | VicBuzz",
    description: "Browse family-friendly spots across Victoria by suburb. Parks, playgrounds, cafes, markets and more.",
  },
  alternates: {
    canonical: "https://vicbuzz.com.au/explore",
  },
};

function slugify(s: string) {
  return s.toLowerCase().replace(/\s+/g, "-");
}

export default function ExplorePage() {
  const suburbCounts = new Map<string, number>();
  listings.forEach((l) => {
    if (l.suburb) {
      suburbCounts.set(l.suburb, (suburbCounts.get(l.suburb) || 0) + 1);
    }
  });

  const suburbs = [...suburbCounts.entries()].sort((a, b) =>
    a[0].localeCompare(b[0])
  );

  const grouped = new Map<string, typeof suburbs>();
  suburbs.forEach(([name, count]) => {
    const letter = name.charAt(0).toUpperCase();
    if (!grouped.has(letter)) grouped.set(letter, []);
    grouped.get(letter)!.push([name, count]);
  });

  const letters = [...grouped.keys()].sort();

  return (
    <div className="min-h-screen bg-[#FEFEFE]">
      <header className="sticky top-0 z-50 bg-white border-b border-gray-100 px-4 py-3">
        <div className="max-w-5xl mx-auto flex items-center gap-4">
          <Link
            href="/"
            className="text-[#2D2D2D] font-semibold text-sm"
          >
            ← Back to VicBuzz
          </Link>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold text-[#2D2D2D]">
          Family Activities Across Victoria
        </h1>
        <p className="text-sm text-gray-500 mt-1 mb-6">
          Browse 322 Victorian suburbs — parks, playgrounds, markets and more
        </p>

        {letters.map((letter) => (
          <div key={letter} className="mb-6">
            <h2 className="text-lg font-bold text-[#FF6B6B] mb-2 border-b border-gray-200 pb-1">
              {letter}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {grouped.get(letter)!.map(([name, count]) => (
                <Link
                  key={name}
                  href={`/explore/${slugify(name)}`}
                  className="bg-white rounded-xl border border-[#F0F0F0] p-3 hover:border-[#FF6B6B] hover:bg-[#FFF5F5] hover:shadow-md transition-all"
                >
                  <p className="font-semibold text-[#2D2D2D] text-sm">
                    {name}
                  </p>
                  <p className="text-xs text-gray-500">
                    <span className="inline-block bg-[#FF6B6B] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full mr-1">{count}</span>
                    {count === 1 ? "spot" : "spots"}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
