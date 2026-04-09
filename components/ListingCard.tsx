"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import type { Listing } from "@/lib/listings";
import ShareButton from "./ShareButton";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const typeEmoji: Record<string, string> = {
  kids: "🛝",
  markets: "🛒",
  food: "🏠",
  music: "🌿",
  sports: "🌿",
  workshops: "🏠",
  community: "🏛️",
};

const envTag = (listing: Listing) => {
  const cat = listing.category;
  if (["markets", "sports", "music"].includes(cat)) return "🌿 Outdoor";
  if (["food", "workshops"].includes(cat)) return "🏠 Indoor";
  if (cat === "kids") return "🛝 Playground";
  return null;
};

const ageTag = (listing: Listing) => {
  if (listing.category === "kids") return "🧒 Kids";
  return "👨‍👩‍👧 All Ages";
};

function slugify(s: string) {
  return s.toLowerCase().replace(/\s+/g, "-");
}

export default function ListingCard({
  listing,
  onSelect,
  isSaved,
  onToggleSave,
  distanceKm,
}: {
  listing: Listing;
  onSelect: (id: string) => void;
  isSaved: boolean;
  onToggleSave: (id: string) => void;
  distanceKm?: number;
}) {
  const isFree = !listing.price || listing.price.toLowerCase() === "free";
  const hasImage = listing.image && listing.image.startsWith("http");
  const emoji = typeEmoji[listing.category] || "📌";

  const [rating, setRating] = useState<number>(0);
  const [hasRated, setHasRated] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("vicbuzz_ratings");
      if (stored) {
        const ratings: Record<string, number> = JSON.parse(stored);
        if (ratings[listing.id]) {
          setRating(ratings[listing.id]);
          setHasRated(true);
        }
      }
    } catch {}
  }, [listing.id]);

  const handleRate = (stars: number) => {
    setRating(stars);
    setHasRated(true);
    try {
      const stored = localStorage.getItem("vicbuzz_ratings");
      const ratings: Record<string, number> = stored ? JSON.parse(stored) : {};
      ratings[listing.id] = stars;
      localStorage.setItem("vicbuzz_ratings", JSON.stringify(ratings));
    } catch {}
  };

  return (
    <Card
      className="cursor-pointer overflow-hidden transition-all hover:-translate-y-0.5 hover:shadow-md"
      onClick={() => onSelect(listing.id)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onSelect(listing.id); } }}
    >
      <div
        className="relative aspect-video cursor-pointer"
        onClick={() => onSelect(listing.id)}
      >
        {hasImage ? (
          <Image
            src={listing.image}
            alt={listing.title}
            fill
            className="object-cover"
            unoptimized
          />
        ) : (
          <div className="w-full h-full bg-[var(--color-primary-soft)] flex items-center justify-center text-4xl">
            {emoji}
          </div>
        )}
        <div className="absolute top-3 left-3 flex gap-1.5">
          {isFree && (
            <Badge className="bg-[#dcfce7] text-[#166534]">FREE</Badge>
          )}
          <Badge variant="secondary">{emoji}</Badge>
        </div>
      </div>
      <CardContent className="p-3">
        <p className="text-xs text-[var(--color-text-muted)]">
          📍 {listing.suburb} · {listing.region}
        </p>
        {distanceKm !== undefined && (
          <span className="text-xs text-[var(--color-primary)] font-semibold">
            📍{" "}
            {distanceKm < 1
              ? `${Math.round(distanceKm * 1000)}m away`
              : `${distanceKm.toFixed(1)}km away`}
          </span>
        )}
        <h3
          className="font-semibold text-[var(--color-text-strong)] text-sm leading-tight mt-0.5 line-clamp-2 cursor-pointer"
          onClick={() => onSelect(listing.id)}
        >
          {listing.title}
        </h3>
        {listing.description && (
          <p className="text-xs text-[var(--color-text-muted)] mt-1 line-clamp-2">
            {listing.description}
          </p>
        )}
        <div className="flex items-center gap-2 mt-2 text-xs text-[var(--color-text-muted)]">
          {envTag(listing) && <span>{envTag(listing)}</span>}
          <span>{ageTag(listing)}</span>
        </div>
        <div className="flex items-center gap-1 mt-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={(e) => {
                e.stopPropagation();
                handleRate(star);
              }}
              className="text-sm min-w-[32px] min-h-[32px] flex items-center justify-center"
              aria-label={`Rate ${star} stars`}
            >
              {star <= rating ? "⭐" : "☆"}
            </button>
          ))}
          {hasRated && (
            <span className="text-xs text-[var(--color-text-muted)] ml-1">You rated this ⭐</span>
          )}
        </div>
        <div className="flex items-center justify-between mt-2">
          <Button
            type="button"
            onClick={() => onSelect(listing.id)}
            variant="ghost"
            className="h-auto p-0 text-xs text-[var(--color-primary)] hover:bg-transparent hover:text-[var(--color-primary-strong)]"
          >
            Details →
          </Button>
          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
            <ShareButton
              title={listing.title}
              url={`https://vicbuzz.com.au/explore/${slugify(listing.suburb)}`}
            />
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleSave(listing.id);
              }}
              className="text-lg"
              aria-label={isSaved ? "Remove from saved" : "Save"}
            >
              {isSaved ? "❤️" : "🤍"}
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
