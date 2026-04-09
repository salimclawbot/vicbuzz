import { listings, regionLabels } from "@/lib/listings";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";

export async function generateStaticParams() {
  return listings.map((l) => ({ id: l.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const listing = listings.find((l) => l.id === id);
  if (!listing) return { title: "Not Found" };
  return {
    title: listing.title,
    description: listing.description || `${listing.title} in ${listing.suburb}, Victoria`,
  };
}

export default async function ListingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const listing = listings.find((l) => l.id === id);

  if (!listing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-4xl mb-3">🐝</p>
          <p className="text-[var(--color-text-muted)]">Listing not found</p>
          <Link href="/" className="text-[var(--color-primary)] font-semibold mt-2 inline-block">
            ← Back to VicBuzz
          </Link>
        </div>
      </div>
    );
  }

  const isFree = !listing.price || listing.price.toLowerCase() === "free";
  const hasImage = listing.image && listing.image.startsWith("http");

  return (
    <div className="min-h-screen bg-white">
      
      <div className="relative aspect-video bg-[var(--color-primary)]/10 max-w-4xl mx-auto">
        {hasImage ? (
          <Image
            src={listing.image}
            alt={listing.title}
            fill
            className="object-cover"
            unoptimized
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-6xl">
            🐝
          </div>
        )}
      </div>

      <div className="p-5 max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-[var(--color-text-strong)]">{listing.title}</h1>
        <div className="flex flex-wrap gap-2 mt-3">
          <span className="bg-gray-100 text-[var(--color-text-muted)] text-xs px-3 py-1 rounded-full">
            📍 {listing.suburb}
          </span>
          <span className="bg-gray-100 text-[var(--color-text-muted)] text-xs px-3 py-1 rounded-full">
            🗺️ {regionLabels[listing.region] || listing.region}
          </span>
          {isFree && (
            <span className="bg-[#A8E6CF] text-[#2D7A5A] text-xs font-bold px-3 py-1 rounded-full">
              FREE
            </span>
          )}
        </div>
        {listing.description && (
          <p className="text-[var(--color-text-strong)] mt-4 leading-relaxed">
            {listing.description}
          </p>
        )}
        <div className="flex gap-3 mt-6">
          {listing.url && (
            <a
              href={listing.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 bg-[var(--color-primary)] text-white text-center py-3 rounded-xl font-semibold text-sm hover:bg-[var(--color-primary-strong)] transition-colors"
            >
              Get Directions →
            </a>
          )}
        </div>
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Event",
            name: listing.title,
            description: listing.description,
            location: {
              "@type": "Place",
              name: listing.suburb,
              address: {
                "@type": "PostalAddress",
                addressLocality: listing.suburb,
                addressRegion: "VIC",
                addressCountry: "AU",
              },
            },
            isAccessibleForFree: isFree,
          }),
        }}
      />
    </div>
  );
}
