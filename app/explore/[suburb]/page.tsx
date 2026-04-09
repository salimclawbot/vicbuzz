import { listings } from "@/lib/listings";
import eventsData from "@/lib/events-data.json";
import type { LiveEvent } from "@/lib/events";
import type { Metadata } from "next";
import Link from "next/link";
import SuburbClient from "./SuburbClient";

function slugify(s: string) {
  return s.toLowerCase().replace(/\s+/g, "-");
}

function unslugify(s: string) {
  return s
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export function generateStaticParams() {
  const suburbs = [...new Set(listings.map((l) => l.suburb).filter(Boolean))];
  return suburbs.map((s) => ({ suburb: slugify(s) }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ suburb: string }>;
}): Promise<Metadata> {
  const { suburb } = await params;
  const name = unslugify(suburb);
  const count = listings.filter(
    (l) => slugify(l.suburb) === suburb
  ).length;
  return {
    title: `Kids Activities in ${name}, Victoria | VicBuzz`,
    description: `Find family-friendly parks, playgrounds, events and free activities in ${name}. Updated weekly by VicBuzz — Victoria's family activity guide.`,
  };
}

export default async function SuburbPage({
  params,
}: {
  params: Promise<{ suburb: string }>;
}) {
  const { suburb } = await params;
  const name = unslugify(suburb);
  const suburbListings = listings.filter(
    (l) => slugify(l.suburb) === suburb
  );
  const allEvents = eventsData as LiveEvent[];
  const suburbEvents = allEvents.filter(
    (e) => e.suburb && slugify(e.suburb) === suburb
  );

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `Family Activities in ${name}`,
    numberOfItems: suburbListings.length,
    itemListElement: suburbListings.map((l, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: l.title,
      url: `https://vicbuzz.com.au/listing/${l.id}`,
    })),
  };

  return (
    <div className="min-h-screen bg-[#FEFEFE]">
      
      <div className="max-w-5xl mx-auto px-4 py-6">
        <nav className="text-sm text-gray-500 mb-4">
          <Link href="/" className="hover:text-[#FF6B6B]">
            Home
          </Link>
          {" > "}
          <Link href="/explore" className="hover:text-[#FF6B6B]">
            Explore
          </Link>
          {" > "}
          <span className="text-[#2D2D2D] font-medium">{name}</span>
        </nav>

        <h1 className="text-2xl font-bold text-[#2D2D2D]">
          Family Activities in {name}
        </h1>
        <p className="text-sm text-gray-500 mt-1 mb-6">
          Parks, playgrounds and things to do with kids in {name}, Victoria
        </p>

        <SuburbClient listings={suburbListings} events={suburbEvents} />
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </div>
  );
}
