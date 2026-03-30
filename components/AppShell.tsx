"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import dynamic from "next/dynamic";
import type { Listing } from "@/lib/listings";
import { regionLabels } from "@/lib/listings";
import type { LiveEvent } from "@/lib/events";
import { getCurrentMonthEvents } from "@/lib/events";
import { SUBURB_COORDS } from "@/lib/suburb-coords";
import ListingCard from "./ListingCard";
import EventCard from "./EventCard";
import SuburbPicker from "./SuburbPicker";
import NewsletterBar from "./NewsletterBar";
import Image from "next/image";
import Link from "next/link";
import { getPublishedArticles } from "@/lib/blog-articles";

const MapView = dynamic(() => import("./MapView"), { ssr: false });

type Tab = "weekend" | "search" | "explore" | "saved";

// Unified chip styles — no per-category pastels
const chipSelected = "bg-white border-2 border-[#FF6B6B] text-[#FF6B6B] font-bold";
const chipUnselected = "bg-white border border-[#E5E7EB] text-[#374151]";

const spotFilters = [
  { key: "all", emoji: "🐝", label: "All" },
  { key: "free", emoji: "💛", label: "Free" },
  { key: "outdoors", emoji: "🌳", label: "Outdoors" },
  { key: "playground", emoji: "🛝", label: "Playgrounds" },
  { key: "rainy", emoji: "🌧️", label: "Rainy Day" },
  { key: "under5", emoji: "👶", label: "Under 5s" },
  { key: "birthday", emoji: "🎂", label: "Birthday" },
  { key: "markets", emoji: "🛒", label: "Markets" },
  { key: "nature", emoji: "🏕️", label: "Nature" },
];

// (eventFilterColors removed — using unified chip styles)

const eventFilters = [
  { key: "all", emoji: "🐝", label: "All" },
  { key: "family", emoji: "👨‍👩‍👧", label: "Family" },
  { key: "free", emoji: "💛", label: "Free" },
  { key: "food", emoji: "🍽️", label: "Food" },
  { key: "festival", emoji: "🎪", label: "Festival" },
  { key: "music", emoji: "🎵", label: "Music" },
  { key: "sport", emoji: "🏆", label: "Sport" },
  { key: "arts", emoji: "🎨", label: "Arts" },
];

const categoryPriority: Record<string, number> = {
  festival: 5,
  music: 4,
  food: 3,
  comedy: 3,
  arts: 2,
  sport: 2,
  theatre: 2,
  family: 1,
  event: 1,
};

function getDistanceKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function EmptyState() {
  return (
    <div className="text-center py-16">
      <div className="text-6xl mb-4">🐝</div>
      <p className="font-bold text-[#1A1A2E] text-lg">No results here</p>
      <p className="text-[#6B7280] text-sm mt-1">
        Try a different suburb or category
      </p>
    </div>
  );
}

export default function AppShell({
  listings,
  initialEvents,
}: {
  listings: Listing[];
  initialEvents?: LiveEvent[];
}) {
  const [activeTab, setActiveTab] = useState<Tab>("weekend");
  const [selectedType, setSelectedType] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [showDetail, setShowDetail] = useState<string | null>(null);
  const [showSearchBar, setShowSearchBar] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [selectedSuburb, setSelectedSuburb] = useState<string>("all");
  const [liveEvents, setLiveEvents] = useState<LiveEvent[]>(
    initialEvents ?? getCurrentMonthEvents()
  );
  const [eventsLoading, setEventsLoading] = useState(false);
  const [lastFetched, setLastFetched] = useState<string>("");
  const [viewMode, setViewMode] = useState<"list" | "map">("list");

  useEffect(() => {
    const cached = sessionStorage.getItem("vicbuzz_events");
    const cachedTime = sessionStorage.getItem("vicbuzz_events_time");
    const CACHE_MS = 6 * 60 * 60 * 1000;

    if (cached && cachedTime && Date.now() - parseInt(cachedTime) < CACHE_MS) {
      setLiveEvents(JSON.parse(cached));
      setLastFetched(
        new Date(parseInt(cachedTime)).toLocaleTimeString("en-AU")
      );
      return;
    }

    setEventsLoading(true);
    fetch("/api/events")
      .then((r) => r.json())
      .then((data) => {
        if (data.events?.length > 0) {
          setLiveEvents(data.events);
          sessionStorage.setItem(
            "vicbuzz_events",
            JSON.stringify(data.events)
          );
          sessionStorage.setItem(
            "vicbuzz_events_time",
            Date.now().toString()
          );
          setLastFetched(new Date().toLocaleTimeString("en-AU"));
        }
      })
      .catch(() => {})
      .finally(() => setEventsLoading(false));
  }, []);

  const monthEvents = useMemo(() => {
    const now = new Date();
    const month = now.getMonth();
    const year = now.getFullYear();
    const nextMonth = new Date(year, month + 1, 1);

    return liveEvents
      .filter((e) => {
        if (!e.startDate) return true;
        const start = new Date(e.startDate);
        const end = e.endDate ? new Date(e.endDate) : start;
        return end >= now || (start >= now && start < nextMonth);
      })
      .sort((a, b) =>
        (a.startDate || "z").localeCompare(b.startDate || "z")
      );
  }, [liveEvents]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("vicbuzz-saved");
      if (saved) setSavedIds(new Set(JSON.parse(saved)));
    } catch {}
  }, []);

  useEffect(() => {
    if (savedIds.size > 0) {
      localStorage.setItem("vicbuzz-saved", JSON.stringify([...savedIds]));
    } else {
      localStorage.removeItem("vicbuzz-saved");
    }
  }, [savedIds]);

  const toggleSave = (id: string) => {
    setSavedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  useEffect(() => {
    setSelectedType("all");
    setSelectedSuburb("all");
    setViewMode("list");
  }, [activeTab]);

  const handleGetLocation = () => {
    if (userLocation) {
      setUserLocation(null);
      setSelectedSuburb("all");
      return;
    }
    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
        setLocationLoading(false);
      },
      () => setLocationLoading(false),
      { timeout: 8000 }
    );
  };

  const filteredEvents = useMemo(() => {
    let results = monthEvents.filter((e) => {
      if (selectedSuburb !== "all" && e.suburb !== selectedSuburb) return false;
      if (selectedType === "all") return true;
      if (selectedType === "free") {
        const price = (e.price || "").toLowerCase();
        return price === "free" || price.includes("free");
      }
      return e.category === selectedType;
    });

    if (userLocation) {
      results = results
        .filter((e) => e.lat && e.lng)
        .sort((a, b) => {
          const distA = getDistanceKm(
            userLocation.lat,
            userLocation.lng,
            a.lat,
            a.lng
          );
          const distB = getDistanceKm(
            userLocation.lat,
            userLocation.lng,
            b.lat,
            b.lng
          );
          return distA - distB;
        });
    }

    return results;
  }, [monthEvents, selectedType, selectedSuburb, userLocation]);

  const filteredListings = useMemo(() => {
    let results = listings.filter((l) => {
      if (selectedSuburb !== "all" && l.suburb !== selectedSuburb) return false;
      if (selectedType === "all") return true;
      const cat = l.category?.toLowerCase() || "";
      const name = l.title?.toLowerCase() || "";
      const price = l.price?.toLowerCase() || "";
      switch (selectedType) {
        case "free":
          return price === "free" || name.includes("free") || cat.includes("free");
        case "outdoors":
          return /park|outdoor|garden|beach|trail/.test(cat);
        case "playground":
          return cat === "playground" || cat === "park" || name.includes("playground");
        case "rainy":
          return /museum|gallery|indoor|library|cinema/.test(cat);
        case "under5":
          return /toddler|baby|under 5|early childhood/.test(cat) || /toddler|baby|under 5|early childhood/.test(name);
        case "birthday":
          return /birthday|party|function/.test(cat) || /birthday|party|function/.test(name);
        case "markets":
          return cat === "markets" || name.includes("market");
        case "nature":
          return /nature|wildlife|farm|botanic/.test(cat);
        default:
          return l.category === selectedType;
      }
    });

    if (userLocation) {
      results = [...results].sort((a, b) => {
        const coordsA = SUBURB_COORDS[a.suburb];
        const coordsB = SUBURB_COORDS[b.suburb];
        if (!coordsA && !coordsB) return 0;
        if (!coordsA) return 1;
        if (!coordsB) return -1;
        const distA = getDistanceKm(
          userLocation.lat,
          userLocation.lng,
          coordsA.lat,
          coordsA.lng
        );
        const distB = getDistanceKm(
          userLocation.lat,
          userLocation.lng,
          coordsB.lat,
          coordsB.lng
        );
        return distA - distB;
      });
    }

    return results;
  }, [listings, selectedType, selectedSuburb, userLocation]);

  const editorPicks = useMemo(() => {
    const now = new Date();
    const twoWeeks = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
    return monthEvents
      .filter((e) => {
        if (!e.startDate) return false;
        const start = new Date(e.startDate);
        return start >= now && start <= twoWeeks;
      })
      .sort(
        (a, b) =>
          (categoryPriority[b.category] || 0) -
          (categoryPriority[a.category] || 0)
      )
      .slice(0, 4);
  }, [monthEvents]);

  const searchEvents = useMemo(() => {
    if (!searchQuery) return [];
    const q = searchQuery.toLowerCase();
    return monthEvents.filter(
      (e) =>
        e.name.toLowerCase().includes(q) ||
        e.venue.toLowerCase().includes(q) ||
        e.description.toLowerCase().includes(q) ||
        e.category.toLowerCase().includes(q)
    );
  }, [monthEvents, searchQuery]);

  const searchListings = useMemo(() => {
    if (!searchQuery) return [];
    const q = searchQuery.toLowerCase();
    return listings.filter(
      (l) =>
        l.title.toLowerCase().includes(q) ||
        l.suburb.toLowerCase().includes(q) ||
        l.description.toLowerCase().includes(q) ||
        l.category.toLowerCase().includes(q)
    );
  }, [listings, searchQuery]);

  const savedListings = useMemo(
    () => listings.filter((l) => savedIds.has(l.id)),
    [listings, savedIds]
  );

  const savedEvents = useMemo(
    () => monthEvents.filter((e) => savedIds.has(e.id)),
    [monthEvents, savedIds]
  );

  const detailListing = showDetail
    ? listings.find((l) => l.id === showDetail)
    : null;

  const recentGuides = useMemo(() => getPublishedArticles().slice(0, 3), []);

  if (detailListing) {
    const isFree =
      !detailListing.price ||
      detailListing.price.toLowerCase() === "free";
    const hasImage =
      detailListing.image && detailListing.image.startsWith("http");
    return (
      <div className="min-h-screen bg-white">
        <div className="sticky top-0 z-50 bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => setShowDetail(null)}
            className="text-[#1A1A2E] font-semibold text-sm flex items-center gap-1"
          >
            ← Back
          </button>
          <button
            onClick={() => toggleSave(detailListing.id)}
            className="text-2xl"
          >
            {savedIds.has(detailListing.id) ? "❤️" : "🤍"}
          </button>
        </div>
        <div className="relative aspect-video bg-[#FFF7F7]">
          {hasImage ? (
            <Image
              src={detailListing.image}
              alt={detailListing.title}
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
          <h1 className="text-2xl font-bold text-[#1A1A2E]">
            {detailListing.title}
          </h1>
          <div className="flex flex-wrap gap-2 mt-3">
            <span className="bg-gray-100 text-[#6B7280] text-xs px-3 py-1 rounded-full">
              📍 {detailListing.suburb}
            </span>
            <span className="bg-gray-100 text-[#6B7280] text-xs px-3 py-1 rounded-full">
              🗺️{" "}
              {regionLabels[detailListing.region] || detailListing.region}
            </span>
            {isFree && (
              <span className="bg-[#DCFCE7] text-[#166534] text-xs font-bold px-3 py-1 rounded-full">
                FREE
              </span>
            )}
          </div>
          {detailListing.description && (
            <p className="text-[#1A1A2E] mt-4 leading-relaxed">
              {detailListing.description}
            </p>
          )}
          <div className="flex flex-wrap gap-2 mt-4 text-sm text-[#6B7280]">
            {["markets", "sports", "music"].includes(
              detailListing.category
            ) && (
              <span className="bg-gray-50 px-3 py-1 rounded-full">
                🌿 Outdoor
              </span>
            )}
            {["food", "workshops"].includes(detailListing.category) && (
              <span className="bg-gray-50 px-3 py-1 rounded-full">
                🏠 Indoor
              </span>
            )}
            <span className="bg-gray-50 px-3 py-1 rounded-full">
              {detailListing.category === "kids"
                ? "🧒 Kids"
                : "👨‍👩‍👧 All Ages"}
            </span>
          </div>
          <div className="flex gap-3 mt-6">
            {detailListing.url && (
              <a
                href={detailListing.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 bg-[#FF6B6B] text-white text-center py-3 rounded-xl font-semibold text-sm hover:bg-[#e55a5a] transition-colors"
              >
                Get Directions →
              </a>
            )}
            <button
              onClick={() => {
                if (navigator.share) {
                  navigator.share({
                    title: detailListing.title,
                    url: `/listing/${detailListing.id}`,
                  });
                } else {
                  navigator.clipboard.writeText(
                    `${window.location.origin}/listing/${detailListing.id}`
                  );
                }
              }}
              className="px-4 py-3 border border-gray-200 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors"
            >
              Share
            </button>
          </div>
        </div>
      </div>
    );
  }

  const activeFilters =
    activeTab === "weekend" ? eventFilters : spotFilters;

  const ViewToggle = () => (
    <div className="flex rounded-lg overflow-hidden">
      <button
        onClick={() => setViewMode("list")}
        className={`px-3 py-1 text-xs font-medium ${
          viewMode === "list"
            ? "bg-[#FF6B6B] text-white"
            : "bg-white text-[#6B7280] border border-[#E5E7EB]"
        }`}
      >
        List
      </button>
      <button
        onClick={() => setViewMode("map")}
        className={`px-3 py-1 text-xs font-medium ${
          viewMode === "map"
            ? "bg-[#FF6B6B] text-white"
            : "bg-white text-[#6B7280] border border-[#E5E7EB]"
        }`}
      >
        Map
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FEFEFE] pb-20">
      {/* HEADER */}
      <header className="sticky top-0 z-50 bg-white border-b border-[#F3F4F6] px-4 py-3">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-5">
            <h1 className="text-xl font-extrabold text-[#1A1A2E]">
              Vic<span>🐝</span>Buzz
            </h1>
            <nav className="hidden md:flex items-center gap-4 text-sm font-semibold text-[#6B7280]">
              <Link href="/" className="hover:text-[#FF6B6B]">Home</Link>
              <Link href="/explore" className="hover:text-[#FF6B6B]">Explore</Link>
              <Link href="/blog" className="hover:text-[#FF6B6B]">Guides</Link>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleGetLocation}
              className={`flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-full border transition-all ${
                userLocation
                  ? "bg-[#FF6B6B] text-white border-[#FF6B6B]"
                  : "bg-white text-gray-600 border-gray-200"
              }`}
            >
              {locationLoading
                ? "..."
                : userLocation
                ? "📍 Near Me"
                : "📍 Location"}
            </button>
            <button
              onClick={() => {
                setShowSearchBar(!showSearchBar);
                if (!showSearchBar) {
                  setTimeout(
                    () => searchInputRef.current?.focus(),
                    100
                  );
                }
              }}
              className="text-lg"
            >
              🔍
            </button>
            <button
              onClick={() => setActiveTab("saved")}
              className="relative text-lg"
            >
              ❤️
              {savedIds.size > 0 && (
                <span className="absolute -top-1 -right-2 bg-[#FF6B6B] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {savedIds.size}
                </span>
              )}
            </button>
          </div>
        </div>
        {showSearchBar && (
          <div className="max-w-5xl mx-auto mt-2">
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search events, spots, suburbs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-[#E5E7EB] text-sm text-[#374151] placeholder-[#9CA3AF] focus:outline-none focus:border-[#FF6B6B] focus:ring-1 focus:ring-[#FF6B6B]"
            />
          </div>
        )}
      </header>

      {/* FILTER CHIPS */}
      {(activeTab === "weekend" || activeTab === "explore") && (
        <div className="sticky top-[57px] z-40 bg-white border-b border-gray-100 px-4 py-2">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center justify-between gap-2">
              <div className="flex gap-2 overflow-x-auto no-scrollbar flex-1">
                {activeFilters.map((f) => (
                  <button
                    key={f.key}
                    onClick={() => setSelectedType(f.key)}
                    className={`flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                      selectedType === f.key ? chipSelected : chipUnselected
                    }`}
                  >
                    {f.emoji} {f.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-end mt-2">
              <ViewToggle />
            </div>
          </div>
        </div>
      )}

      {/* Suburb filter */}
      {(activeTab === "weekend" || activeTab === "explore") && (
        <div className="px-4 pb-2 max-w-5xl mx-auto">
          <SuburbPicker
            suburbs={
              activeTab === "weekend"
                ? [
                    ...new Set(
                      monthEvents
                        .map((e) => e.suburb)
                        .filter(Boolean)
                    ),
                  ].sort()
                : [
                    ...new Set(
                      listings
                        .map((l) => l.suburb)
                        .filter(Boolean)
                    ),
                  ].sort()
            }
            value={selectedSuburb}
            onChange={setSelectedSuburb}
            label={
              activeTab === "weekend"
                ? "All Melbourne"
                : "All Victoria"
            }
          />
        </div>
      )}

      {/* CONTENT */}
      <main className="max-w-5xl mx-auto px-4 pt-4">
        {/* ==================== WEEKEND TAB ==================== */}
        {activeTab === "weekend" && (
          <>
            {/* Hero tagline */}
            <div className="rounded-2xl p-6 mb-6 text-center" style={{background: 'linear-gradient(135deg, #FFF5F5 0%, #F0FFFE 100%)'}}>
              <h2 className="text-lg font-bold text-[#1A1A2E]">Victoria&apos;s Best Family Activities</h2>
              <p className="text-sm text-[#6B7280] mt-1">Parks, events, markets and free things to do with kids</p>
            </div>

            {/* Editor's Picks */}
            {editorPicks.length > 0 && viewMode === "list" && (
              <section className="mb-6">
                <h2 className="text-lg font-bold text-[#1A1A2E] mb-3">
                  🌟 Editor&apos;s Picks
                </h2>
                <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
                  {editorPicks.map((e) => (
                    <div key={e.id} className="flex-shrink-0 w-72">
                      <EventCard
                        event={e}
                        isSaved={savedIds.has(e.id)}
                        onToggleSave={toggleSave}
                        isPick
                        distanceKm={
                          userLocation && e.lat
                            ? getDistanceKm(
                                userLocation.lat,
                                userLocation.lng,
                                e.lat,
                                e.lng
                              )
                            : undefined
                        }
                      />
                    </div>
                  ))}
                </div>
              </section>
            )}

            <section className="mb-6">
              <h2 className="text-lg font-bold text-[#1A1A2E]">
                📅 What&apos;s On This Month
              </h2>
              <p className="text-sm text-[#6B7280] mt-0.5">
                {filteredEvents.length} events happening in Melbourne
                this month
              </p>
              <p className="text-xs text-[#9CA3AF] mt-0.5">
                {eventsLoading
                  ? "Refreshing events..."
                  : lastFetched
                  ? `Updated ${lastFetched}`
                  : "Updated daily from What's On Melbourne"}
              </p>

              {viewMode === "map" ? (
                <div className="mt-3">
                  <MapView
                    items={filteredEvents.map((e) => ({
                      id: e.id,
                      name: e.name,
                      lat: e.lat,
                      lng: e.lng,
                      category: e.category,
                      suburb: e.suburb,
                    }))}
                    type="events"
                  />
                </div>
              ) : filteredEvents.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-3">
                  {filteredEvents.map((e) => (
                    <EventCard
                      key={e.id}
                      event={e}
                      isSaved={savedIds.has(e.id)}
                      onToggleSave={toggleSave}
                      distanceKm={
                        userLocation && e.lat
                          ? getDistanceKm(
                              userLocation.lat,
                              userLocation.lng,
                              e.lat,
                              e.lng
                            )
                          : undefined
                      }
                    />
                  ))}
                </div>
              ) : selectedSuburb !== "all" ? (
                <div className="mt-3">
                  <div className="bg-[#FFF5F5] border border-[#FF6B6B]/20 rounded-2xl p-4 mb-6 text-center">
                    <p className="text-2xl mb-1">🐝</p>
                    <p className="font-bold text-[#1A1A2E]">
                      No events in {selectedSuburb} right now
                    </p>
                    <p className="text-sm text-[#6B7280] mt-1">
                      Events are mainly in Melbourne CBD — but here are
                      spots to explore near you!
                    </p>
                    <button
                      onClick={() => {
                        setActiveTab("explore");
                      }}
                      className="mt-3 text-sm font-semibold text-white bg-[#FF6B6B] px-4 py-2 rounded-full"
                    >
                      Browse all spots in {selectedSuburb} →
                    </button>
                  </div>
                  {(() => {
                    const nearbySpots = listings.filter(
                      (l) => l.suburb === selectedSuburb
                    );
                    return nearbySpots.length > 0 ? (
                      <>
                        <h3 className="font-bold text-[#1A1A2E] text-lg mb-3">
                          📍 Things to do in {selectedSuburb}
                          <span className="ml-2 text-sm bg-[#FF6B6B] text-white px-2 py-0.5 rounded-full font-semibold">
                            {nearbySpots.length}
                          </span>
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {nearbySpots.slice(0, 6).map((l) => (
                            <ListingCard
                              key={l.id}
                              listing={l}
                              onSelect={setShowDetail}
                              isSaved={savedIds.has(l.id)}
                              onToggleSave={toggleSave}
                            />
                          ))}
                        </div>
                        {nearbySpots.length > 6 && (
                          <button
                            onClick={() =>
                              setActiveTab("explore")
                            }
                            className="mt-4 w-full py-3 text-sm font-semibold text-[#FF6B6B] border-2 border-[#FF6B6B] rounded-2xl hover:bg-[#FFF5F5] transition-colors"
                          >
                            See all {nearbySpots.length} spots in{" "}
                            {selectedSuburb} →
                          </button>
                        )}
                      </>
                    ) : (
                      <p className="text-center text-[#9CA3AF] py-8">
                        No spots found in {selectedSuburb} either. Try
                        a nearby suburb!
                      </p>
                    );
                  })()}
                </div>
              ) : (
                <EmptyState />
              )}
            </section>

            {recentGuides.length > 0 && (
              <section className="mb-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-[#1A1A2E]">📚 Latest guides</h3>
                  <Link href="/blog" className="text-sm font-semibold text-[#FF6B6B]">View all →</Link>
                </div>
                <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3">
                  {recentGuides.map((guide) => (
                    <Link key={guide.slug} href={`/blog/${guide.slug}`} className="rounded-2xl border border-[#F0F0F0] bg-white p-4 hover:border-[#FF6B6B] hover:shadow-sm transition-all">
                      <p className="text-xs font-semibold uppercase tracking-wide text-[#FF6B6B]">Guide</p>
                      <p className="mt-1 text-sm font-bold text-[#1A1A2E]">{guide.title}</p>
                      <p className="mt-2 text-xs text-[#6B7280]">{guide.publishDate} · {guide.readTime}</p>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            <NewsletterBar />
          </>
        )}

        {/* ==================== SEARCH TAB ==================== */}
        {activeTab === "search" && (
          <section>
            <input
              type="text"
              autoFocus
              placeholder="Search events, spots, suburbs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-[#E5E7EB] text-sm text-[#374151] placeholder-[#9CA3AF] focus:outline-none focus:border-[#FF6B6B] focus:ring-1 focus:ring-[#FF6B6B] mb-4"
            />
            {searchQuery &&
              searchEvents.length === 0 &&
              searchListings.length === 0 && (
                <EmptyState />
              )}

            {searchEvents.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <h3 className="text-base font-bold text-[#1A1A2E]">
                    🎫 Events
                  </h3>
                  <span className="bg-[#FF6B6B] text-white text-xs font-bold px-2 py-0.5 rounded-full">
                    {searchEvents.length}
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {searchEvents.slice(0, 20).map((e) => (
                    <EventCard
                      key={e.id}
                      event={e}
                      isSaved={savedIds.has(e.id)}
                      onToggleSave={toggleSave}
                    />
                  ))}
                </div>
              </div>
            )}

            {searchListings.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <h3 className="text-base font-bold text-[#1A1A2E]">
                    📍 Spots
                  </h3>
                  <span className="bg-[#FF6B6B] text-white text-xs font-bold px-2 py-0.5 rounded-full">
                    {searchListings.length}
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {searchListings.slice(0, 50).map((l) => (
                    <ListingCard
                      key={l.id}
                      listing={l}
                      onSelect={setShowDetail}
                      isSaved={savedIds.has(l.id)}
                      onToggleSave={toggleSave}
                    />
                  ))}
                </div>
              </div>
            )}

            {!searchQuery && (
              <div className="text-center py-12">
                <p className="text-4xl mb-2">🔍</p>
                <p className="text-[#6B7280]">
                  Search events and spots
                </p>
                <p className="text-sm text-[#6B7280] mt-1">
                  Try &quot;market&quot;, &quot;playground&quot;, or a
                  suburb name
                </p>
              </div>
            )}
          </section>
        )}

        {/* ==================== EXPLORE TAB ==================== */}
        {activeTab === "explore" && (
          <section>
            <h2 className="text-lg font-bold text-[#1A1A2E]">
              🗺️ Explore Victoria
            </h2>
            <p className="text-sm text-[#6B7280] mt-0.5 mb-4">
              1,200+ family spots across Victoria
            </p>

            {viewMode === "map" ? (
              <MapView
                items={filteredListings.map((l) => ({
                  id: l.id,
                  name: l.title,
                  lat: SUBURB_COORDS[l.suburb]?.lat || 0,
                  lng: SUBURB_COORDS[l.suburb]?.lng || 0,
                  category: l.category,
                  suburb: l.suburb,
                }))}
                type="listings"
              />
            ) : (
              <>
                <div className="flex items-center gap-2 mb-3">
                  <h3 className="text-base font-bold text-[#1A1A2E]">
                    ✨ All Spots
                  </h3>
                  <span className="bg-[#FF6B6B] text-white text-xs font-bold px-2 py-0.5 rounded-full">
                    {filteredListings.length}
                  </span>
                </div>
                {filteredListings.length === 0 ? (
                  <EmptyState />
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                    {filteredListings.map((l) => (
                      <ListingCard
                        key={l.id}
                        listing={l}
                        onSelect={setShowDetail}
                        isSaved={savedIds.has(l.id)}
                        onToggleSave={toggleSave}
                      />
                    ))}
                  </div>
                )}

                <h3 className="text-base font-bold text-[#1A1A2E] mb-3">
                  🗺️ Explore by Region
                </h3>
                <div className="rounded-2xl overflow-hidden border border-[#F3F4F6] mb-6 flex items-center justify-center" style={{height: 160, background: 'linear-gradient(135deg, #FFF5F5 0%, #F0FFFE 100%)'}}>
                  <div className="text-center">
                    <p className="text-4xl mb-2">🗺️🐝</p>
                    <p className="text-sm font-medium text-[#1A1A2E]">Tap a region below to explore</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
                  {Object.entries(regionLabels).map(
                    ([key, label]) => {
                      const count = listings.filter(
                        (l) => l.region === key
                      ).length;
                      return (
                        <button
                          key={key}
                          onClick={() => {
                            setSearchQuery(key);
                            setActiveTab("search");
                          }}
                          className="bg-white rounded-xl border border-[#F0F0F0] p-4 text-left hover:border-[#FF6B6B] hover:shadow-md transition-all"
                        >
                          <p className="text-2xl mb-1">📍</p>
                          <p className="font-bold text-[#1A1A2E] text-sm">
                            {label}
                          </p>
                          <p className="text-xs text-[#6B7280]">
                            {count} spots
                          </p>
                        </button>
                      );
                    }
                  )}
                </div>
              </>
            )}

            <NewsletterBar />
          </section>
        )}

        {/* ==================== SAVED TAB ==================== */}
        {activeTab === "saved" && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-[#1A1A2E]">
                ❤️ Saved
              </h2>
              {savedIds.size > 0 && (
                <button
                  onClick={() => {
                    setSavedIds(new Set());
                    localStorage.removeItem("vicbuzz-saved");
                  }}
                  className="text-xs text-[#6B7280] hover:text-red-500 transition-colors"
                >
                  Clear all
                </button>
              )}
            </div>
            {savedEvents.length === 0 &&
            savedListings.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-5xl mb-3">🐝</p>
                <p className="text-[#6B7280] font-medium">
                  You haven&apos;t saved anything yet
                </p>
                <p className="text-sm text-[#6B7280] mt-1">
                  Tap the heart on any event or spot to save it here
                </p>
              </div>
            ) : (
              <>
                {savedEvents.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-base font-bold text-[#1A1A2E] mb-3">
                      🎫 Saved Events
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {savedEvents.map((e) => (
                        <EventCard
                          key={e.id}
                          event={e}
                          isSaved={true}
                          onToggleSave={toggleSave}
                        />
                      ))}
                    </div>
                  </div>
                )}
                {savedListings.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-base font-bold text-[#1A1A2E] mb-3">
                      📍 Saved Spots
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {savedListings.map((l) => (
                        <ListingCard
                          key={l.id}
                          listing={l}
                          onSelect={setShowDetail}
                          isSaved={true}
                          onToggleSave={toggleSave}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </section>
        )}
      </main>

      {/* FOOTER */}
      <footer className="max-w-5xl mx-auto px-4 py-6 text-center text-xs text-[#9CA3AF] border-t border-gray-100 mt-8 mb-16">
        <div className="flex justify-center gap-4 mb-2">
          <Link
            href="/claim"
            className="text-[#1A1A2E] font-semibold hover:text-[#FF6B6B]"
          >
            Claim Your Listing
          </Link>
          <Link
            href="/submit"
            className="text-[#1A1A2E] font-semibold hover:text-[#FF6B6B]"
          >
            Submit a Spot
          </Link>
          <Link
            href="/explore"
            className="text-[#1A1A2E] font-semibold hover:text-[#FF6B6B]"
          >
            Explore by Suburb
          </Link>
        </div>
        <p>© 2026 VicBuzz. Family fun across Victoria.</p>
      </footer>

      {/* BOTTOM NAV */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#F3F4F6] z-50 pb-[env(safe-area-inset-bottom)]">
        <div className="max-w-5xl mx-auto flex">
          {(
            [
              { key: "weekend" as Tab, icon: "📅", label: "Weekend" },
              { key: "search" as Tab, icon: "🔍", label: "Search" },
              {
                key: "explore" as Tab,
                icon: "🗺️",
                label: "Explore",
              },
              { key: "saved" as Tab, icon: "❤️", label: "Saved" },
            ] as const
          ).map((tab) => (
            <button
              key={tab.key}
              onClick={() => {
                setActiveTab(tab.key);
                if (tab.key === "search") {
                  setShowSearchBar(false);
                }
              }}
              className={`flex-1 flex flex-col items-center py-2 text-xs font-medium transition-colors ${
                activeTab === tab.key
                  ? "text-[#FF6B6B]"
                  : "text-[#9CA3AF]"
              }`}
            >
              <span className="text-xl relative">
                {tab.icon}
                {tab.key === "saved" && savedIds.size > 0 && (
                  <span className="absolute -top-1 -right-2 bg-[#FF6B6B] text-white text-[8px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center">
                    {savedIds.size}
                  </span>
                )}
              </span>
              <span className="mt-0.5">{tab.label}</span>
            </button>
          ))}
          <Link href="/blog" className="flex-1 flex flex-col items-center py-2 text-xs font-medium text-[#9CA3AF]">
            <span className="text-xl">📚</span>
            <span className="mt-0.5">Guides</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}
