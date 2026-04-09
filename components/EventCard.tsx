"use client";

import Image from "next/image";
import type { LiveEvent } from "@/lib/events";
import ShareButton from "./ShareButton";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const categoryIcons: Record<string, string> = {
  music: "🎵",
  theatre: "🎭",
  comedy: "😂",
  festival: "🎡",
  sport: "⚽",
  arts: "🎨",
  event: "📅",
  family: "👨👩👧",
};

const categoryEmoji: Record<string, string> = {
  event: "✨",
  food: "🍽️",
  music: "🎵",
  comedy: "😂",
  arts: "🎨",
  sport: "🏆",
  festival: "🎪",
  family: "👨👩👧",
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
  if (endDate && endDate !== startDate) return `${start} → ${fmt(endDate)}`;
  return start;
}

function downloadICS(event: LiveEvent) {
  const formatDT = (dt: string) => dt.replace(/[-:]/g, "").slice(0, 15) + "Z";
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
  const emoji = categoryEmoji[event.category] || categoryIcons[event.category] || "✨";

  return (
    <Card className={isPick ? "border-2 border-[var(--color-primary)]" : ""}>
      <div className="relative aspect-video overflow-hidden rounded-t-2xl">
        {hasImage ? (
          <Image src={event.image} alt={event.name} fill className="object-cover" unoptimized />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-[var(--color-primary-soft)] text-4xl">{emoji}</div>
        )}
        <Badge className="absolute left-3 top-3 bg-[var(--color-text-strong)] text-white">{formatDateBadge(event.startDate, event.endDate)}</Badge>
        {isPick && <Badge className="absolute right-3 top-3 bg-[var(--color-primary)] text-white">PICK</Badge>}
        {isFree && <Badge className="absolute bottom-3 left-3 bg-[#dcfce7] text-[#166534]">FREE</Badge>}
      </div>
      <CardContent className="p-4">
        <Badge variant="secondary">{emoji} {event.category}</Badge>
        <h3 className="mt-1.5 line-clamp-2 text-lg font-semibold text-[var(--color-text-strong)]">{event.name}</h3>
        <p className="mt-1 text-sm text-[var(--color-text-muted)]">📍 {event.venue}</p>
        {event.suburb && <span className="text-xs text-[var(--color-text-muted)]">📍 {event.suburb}</span>}
        {distanceKm !== undefined && (
          <span className="block text-xs font-semibold text-[var(--color-primary)]">
            📍 {distanceKm < 1 ? `${Math.round(distanceKm * 1000)}m away` : `${distanceKm.toFixed(1)}km away`}
          </span>
        )}
        <p className={`mt-1 text-sm font-semibold ${isFree ? "text-[#166534]" : "text-[var(--color-text-strong)]"}`}>{isFree ? "FREE" : event.price}</p>

        <div className="mt-3 flex items-center justify-between gap-2">
          {event.ticketUrl || event.url ? (
            <a href={event.ticketUrl || event.url} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold text-[var(--color-primary)] hover:text-[var(--color-primary-strong)]">
              {(event.ticketUrl || event.url || "").includes("google.com/search") ? "Search Online 🔍" : event.ticketUrl ? "Get Tickets →" : "Learn More →"}
            </a>
          ) : (
            <span className="text-xs text-[var(--color-text-muted)]">No link available</span>
          )}
          <div className="flex items-center gap-1">
            {event.startDate && (
              <Button type="button" variant="ghost" size="icon" onClick={() => downloadICS(event)} className="h-8 w-8 text-base" aria-label="Add to calendar" title="Add to calendar">
                📅
              </Button>
            )}
            <ShareButton title={event.name} text={`${event.name}, ${event.suburb} | vicbuzz.com.au`} url="https://vicbuzz.com.au" />
            <Button type="button" variant="ghost" size="icon" onClick={() => onToggleSave(event.id)} className="h-8 w-8 text-base" aria-label={isSaved ? "Remove from saved" : "Save"}>
              {isSaved ? "❤️" : "🤍"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
