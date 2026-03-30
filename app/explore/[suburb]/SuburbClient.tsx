"use client";

import { useState, useEffect } from "react";
import ListingCard from "@/components/ListingCard";
import EventCard from "@/components/EventCard";
import type { Listing } from "@/lib/listings";
import type { LiveEvent } from "@/lib/events";

export default function SuburbClient({
  listings,
  events,
}: {
  listings: Listing[];
  events: LiveEvent[];
}) {
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    try {
      const saved = localStorage.getItem("vicbuzz-saved");
      if (saved) setSavedIds(new Set(JSON.parse(saved)));
    } catch {}
  }, []);

  const toggleSave = (id: string) => {
    setSavedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      localStorage.setItem("vicbuzz-saved", JSON.stringify([...next]));
      return next;
    });
  };

  return (
    <>
      {listings.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">🐝</div>
          <p className="font-bold text-[#2D2D2D] text-lg">No results here</p>
          <p className="text-gray-500 text-sm mt-1">
            Try a different suburb or category
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {listings.map((l) => (
            <ListingCard
              key={l.id}
              listing={l}
              onSelect={() => {
                window.location.href = `/listing/${l.id}`;
              }}
              isSaved={savedIds.has(l.id)}
              onToggleSave={toggleSave}
            />
          ))}
        </div>
      )}

      {events.length > 0 && (
        <section className="mt-8">
          <h2 className="text-lg font-bold text-[#2D2D2D] mb-4">
            Events in this area
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {events.map((e) => (
              <EventCard
                key={e.id}
                event={e}
                isSaved={savedIds.has(e.id)}
                onToggleSave={toggleSave}
              />
            ))}
          </div>
        </section>
      )}
    </>
  );
}
