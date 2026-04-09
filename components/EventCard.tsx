"use client";

import Image from "next/image";
import type { LiveEvent } from "@/lib/events";
import ShareButton from "./ShareButton";

// Neutral gray pill for all categories
const categoryColorClass = "bg-[#F3F4F6] text-[#374151]";
const categoryIcons: Record<string, string> = {
  music: "🎵",
  theatre: "🎭",
  comedy: "😂",
  festival: "🎡",
  sport: "⚽",
  arts: "🎨",
  event: "📅",
  family: "👨‍👩‍👧",
};

function getCategoryIcon(cat: string): string {
  return categoryIcons[cat?.toLowerCase()] ?? "📍";
}


const categoryEmoji: Record<string, string> = {
  event: "✨",
  food: "🍽️",
  music: "🎵",
  comedy: "😂",
  arts: "🎨",
  sport: "🏆",
  festival: "🎪",
  family: "👨‍👩‍👧",
  theatre: "🎭",
};

function formatDateBadge(startDate: string, endDate?: string): string {
  const fmt = (d: string) => {
    const date = new Date(d);
    const day = date.getDate();
    const month = date.toLocaleString("en-AU", { month: "short" });
    return `${day} ${month}`;
  };
  if (!startDate) return "Ongoing";
  const start = fmt(startDate);
  if (endDate && endDate !== startDate) {
    return `${start} → ${fmt(endDate)}`;
  }
  return start;
}

function downloadICS(event: LiveEvent) {
  const formatDT = (dt: string) =>
    dt.replace(/[-:]/g, "").replace("T", "T").slice(0, 15) + "Z";
  const start = event.startDate ? formatDT(event.startDate) : "";
  const end = event.endDate ? formatDT(event.endDate) : start;
  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//VicBuzz//EN",
    "BEGIN:VEVENT",
    `DTSTART:${start}`,
    `DTEND:${end}`,
    `SUMMARY:${event.name}`,
    `DESCRIPTION:${event.description?.replace(/\n/g, "\\n").slice(0, 200) ?? ""}`,
    `LOCATION:${event.venue || event.suburb}`,
    `URL:${event.url || event.ticketUrl || "https://vicbuzz.com.au"}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
  const blob = new Blob([ics], { type: "text/calendar" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `${event.name.replace(/[^a-z0-9]/gi, "-").toLowerCase()}.ics`;
  a.click();
}

export default function EventCard({
  event,
  isSaved,
  onToggleSave,
  distanceKm,
  isPick,
}: {
  event: LiveEvent;
  isSaved: boolean;
  onToggleSave: (id: string) => void;
  distanceKm?: number;
  isPick?: boolean;
}) {
  const isFree = !event.price || event.price.toLowerCase() === "free";
  const hasImage = event.image && event.image.startsWith("http");
  const categoryFallback: Record<string, string> = {
    festival: "/images/events/event-festival.png",
    music: "/images/events/event-music.png",
    food: "/images/events/event-food.png",
    comedy: "/images/events/event-comedy.png",
    arts: "/images/events/event-arts.png",
    sport: "/images/events/event-sport.png",
    theatre: "/images/events/event-theatre.png",
    family: "/images/events/event-family.png",
    event: "/images/events/event-family.png",
  };
  const imageSrc = hasImage ? event.image : (categoryFallback[event.category] ?? "/images/events/event-family.png");
  const emoji = categoryEmoji[event.category] || "✨";
  const colorClass = categoryColorClass;

  return (
    <div
      className={`bg-white rounded-2xl shadow-sm hover:shadow-md overflow-hidden transition-all hover:-translate-y-0.5 ${
        isPick ? "border-[#FF6B6B] border-2" : "border border-[#F3F4F6]"
      }`}
    >
      <div className="relative aspect-video">
        {hasImage ? (
          <Image
            src={event.image}
            alt={event.name}
            fill
            className="object-cover"
            unoptimized
          />
        ) : (
          <div className="w-full h-full bg-[#FFF7F7] flex items-center justify-center text-4xl">
            {emoji}
          </div>
        )}
        <span className="absolute top-3 left-3 bg-[#1A1A2E] text-white text-xs font-bold px-2 py-1 rounded-lg">
          {formatDateBadge(event.startDate, event.endDate)}
        </span>
        {isPick && (
          <span className="absolute top-3 right-3 bg-[#FF6B6B] text-white text-xs font-bold px-2 py-1 rounded-lg">
            PICK
          </span>
        )}
        {isFree && (
          <span className="absolute bottom-3 left-3 bg-[#DCFCE7] text-[#166534] font-bold text-xs px-2 py-0.5 rounded-full">
            FREE
          </span>
        )}
      </div>
      <div className="p-4">
        <span
          className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full ${colorClass}`}
        >
          {emoji} {event.category}
        </span>
        <h3 className="font-semibold text-[#1A1A2E] text-lg leading-tight mt-1.5 line-clamp-2">
          {event.name}
        </h3>
        <p className="text-sm text-[#6B7280] mt-1">📍 {event.venue}</p>
        {event.suburb && (
          <span className="text-xs text-[#6B7280]">📍 {event.suburb}</span>
        )}
        {distanceKm !== undefined && (
          <span className="text-xs text-[#FF6B6B] font-semibold">
            📍{" "}
            {distanceKm < 1
              ? `${Math.round(distanceKm * 1000)}m away`
              : `${distanceKm.toFixed(1)}km away`}
          </span>
        )}
        <p
          className={`font-semibold text-sm mt-1 ${
            isFree ? "text-[#166534]" : "text-[#1A1A2E]"
          }`}
        >
          {isFree ? "FREE" : event.price}
        </p>
        <div className="flex items-center justify-between mt-3">
          {event.ticketUrl || event.url ? (
            <a
              href={event.ticketUrl || event.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#FF6B6B] text-xs font-semibold hover:text-[#e55a5a] transition-colors"
            >
              {(event.ticketUrl || event.url || "").includes(
                "google.com/search"
              )
                ? "Search Online 🔍"
                : event.ticketUrl
                ? "Get Tickets →"
                : "Learn More →"}
            </a>
          ) : (
            <span className="text-[#9CA3AF] text-xs">No link available</span>
          )}
          <div className="flex items-center gap-1">
            {event.startDate && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  downloadICS(event);
                }}
                className="text-lg min-w-[32px] min-h-[32px] flex items-center justify-center"
                aria-label="Add to calendar"
                title="Add to calendar"
              >
                📅
              </button>
            )}
            <ShareButton
              title={event.name}
              text={`${event.name} — ${event.suburb} | vicbuzz.com.au`}
              url="https://vicbuzz.com.au"
            />
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleSave(event.id);
              }}
              className="text-lg"
              aria-label={isSaved ? "Remove from saved" : "Save"}
            >
              {isSaved ? "❤️" : "🤍"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
