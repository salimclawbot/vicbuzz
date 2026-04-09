"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import type { LiveEvent } from "@/lib/events";
import { getUpcomingEvents, getThisWeekendEvents, getEventsThisWeek } from "@/lib/events";
import eventsData from "@/lib/events-data.json";

const allEvents = eventsData as LiveEvent[];

const categoryIcons: Record<string, string> = {
  music: "🎵", theatre: "🎭", comedy: "😂", festival: "🎡",
  sport: "⚽", arts: "🎨", event: "📅", family: "👨‍👩‍👧",
};

function getIcon(cat: string) {
  return categoryIcons[cat?.toLowerCase()] ?? "📍";
}

const categories = ["all", "music", "theatre", "comedy", "festival", "sport", "arts", "event"];

export default function EventsPage() {
  const [filter, setFilter] = useState<"week" | "weekend" | "all">("week");
  const [category, setCategory] = useState("all");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    let evs = allEvents;
    if (filter === "week") evs = getEventsThisWeek(evs);
    else if (filter === "weekend") evs = getThisWeekendEvents(evs);
    else evs = getUpcomingEvents(evs);
    if (category !== "all") evs = evs.filter(e => e.category === category);
    if (search) evs = evs.filter(e => e.name.toLowerCase().includes(search.toLowerCase()));
    return evs;
  }, [filter, category, search]);

  const formatDate = (d: string) => new Date(d).toLocaleDateString("en-AU", { weekday: "short", day: "numeric", month: "short" });
  const formatTime = (d: string) => new Date(d).toLocaleTimeString("en-AU", { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="min-h-screen bg-[#FEFEFE]">
      <header className="sticky top-0 z-50 bg-white border-b border-gray-100 px-4 py-3">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-[#2D2D2D] font-semibold text-sm">← Back to VicBuzz</Link>
          <span className="text-xs font-semibold text-[#FF6B6B]">{filtered.length} events</span>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold text-[#1A1A2E]">What's On in Victoria</h1>
        <p className="text-sm text-[#6B7280] mt-1">Family-friendly events across Victoria</p>

        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search events..."
          className="w-full mt-4 px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B6B]"
        />

        <div className="flex gap-2 mt-4">
          {( [["week","This Week"], ["weekend","This Weekend"], ["all","All Upcoming"]] as const).map(([f, label]) => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-colors ${filter === f ? "bg-[#FF6B6B] text-white" : "bg-gray-100 text-[#6B7280]"}`}>
              {label}
            </button>
          ))}
        </div>

        <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
          {categories.map(cat => (
            <button key={cat} onClick={() => setCategory(cat)}
              className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${category === cat ? "bg-[#1A1A2E] text-white" : "bg-gray-100 text-[#6B7280]"}`}>
              {cat === "all" ? "All" : `${getIcon(cat)} ${cat}`}
            </button>
          ))}
        </div>

        <div className="mt-5 space-y-3">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-[#6B7280]">
              <p className="text-4xl">🔍</p>
              <p className="mt-2 text-sm">No events found.</p>
              <button onClick={() => { setFilter("week"); setCategory("all"); setSearch(""); }}
                className="mt-3 text-xs text-[#FF6B6B] font-semibold">Clear filters</button>
            </div>
          ) : filtered.map(event => (
            <a key={event.id} href={event.ticketUrl || event.url} target="_blank" rel="noopener noreferrer"
              className="flex gap-3 rounded-xl border border-[#E5E7EB] bg-white p-3 hover:shadow-lg hover:-translate-y-0.5 transition-all block">
              {event.image ? (
                <div className="relative h-20 w-20 flex-shrink-0 rounded-lg overflow-hidden">
                  <Image src={event.image} alt={event.name} fill className="object-cover" sizes="80px" />
                </div>
              ) : (
                <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#FF6B6B]/10 to-[#FFB347]/10 text-2xl">
                  {getIcon(event.category)}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-xs text-[#FF6B6B] font-semibold uppercase tracking-wide">{event.category}</p>
                <h3 className="text-sm font-semibold text-[#1A1A2E] mt-0.5 line-clamp-2">{event.name}</h3>
                <p className="text-xs text-[#6B7280] mt-1">{formatDate(event.startDate)} · {formatTime(event.startDate)}</p>
                {event.suburb && <p className="text-xs text-[#6B7280]">📍 {event.suburb}</p>}
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
