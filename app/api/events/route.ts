import { NextResponse } from "next/server";

export const revalidate = 21600; // 6 hours

async function scrapeWhatsonMelbourne(): Promise<ReturnType<typeof normalizeEvent>[]> {
  const nav_items = new Set(["family-and-kids","entertainment","free","this-weekend",
    "major-events","festivals","exhibitions","concerts-and-gigs","theatre","comedy",
    "film","sport","aboriginal-melbourne","walks","attractions-and-sights","dining-events"]);

  const pages = [
    "/things-to-do", "/things-to-do/festivals", "/things-to-do/family-and-kids",
    "/things-to-do/exhibitions", "/things-to-do/free", "/things-to-do/this-weekend",
    "/things-to-do/entertainment/concerts-and-gigs", "/things-to-do/entertainment/theatre",
    "/things-to-do/entertainment/comedy", "/things-to-do/entertainment/sport",
    "/eat-and-drink/dining-events", "/things-to-do/major-events",
  ];

  const slugs = new Set<string>();
  const base = "https://whatson.melbourne.vic.gov.au";

  // Collect slugs from all category pages
  await Promise.all(pages.map(async (path) => {
    try {
      const html = await fetch(`${base}${path}`, {
        headers: { "User-Agent": "Mozilla/5.0 (compatible; VicBuzz/1.0)" },
        next: { revalidate: 21600 }
      }).then(r => r.text());
      const matches = html.matchAll(/href="\/things-to-do\/([^/"]+)"/g);
      for (const m of matches) {
        const slug = m[1];
        if (!nav_items.has(slug) && !slug.includes("/") && slug.length > 4) {
          slugs.add(slug);
        }
      }
    } catch { /* skip failed pages */ }
  }));

  // Scrape each event page
  const events: NonNullable<ReturnType<typeof normalizeEvent>>[] = [];
  const chunks = Array.from(slugs);

  // Process in batches of 20 concurrent
  for (let i = 0; i < chunks.length; i += 20) {
    const batch = chunks.slice(i, i + 20);
    const results = await Promise.all(batch.map(async (slug) => {
      try {
        const url = `${base}/things-to-do/${slug}`;
        const html = await fetch(url, {
          headers: { "User-Agent": "Mozilla/5.0 (compatible; VicBuzz/1.0)" },
          next: { revalidate: 21600 }
        }).then(r => r.text());

        // Extract JSON-LD
        const jldPattern = /<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g;
        let jldMatch;
        while ((jldMatch = jldPattern.exec(html)) !== null) {
          const m = jldMatch;
          try {
            let d = JSON.parse(m[1].trim());
            if (Array.isArray(d)) d = d[0];
            const t = d?.["@type"] ?? "";
            if (["Event","MusicEvent","Festival","SportsEvent","ExhibitionEvent","TheaterEvent"].includes(t) || d?.startDate) {
              const imgMatch = html.match(/og:image[^>]*content="([^"]+)"/);
              if (imgMatch && !d.image) d.image = imgMatch[1];
              d.slug = slug;
              return normalizeEvent(d);
            }
          } catch { /* skip bad JSON */ }
        }
      } catch { /* skip failed fetches */ }
      return null;
    }));
    events.push(...results.filter((r): r is NonNullable<typeof r> => r !== null));
  }

  return events;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeEvent(e: any) {
  const name = e?.name?.trim() ?? "";
  if (!name) return null;

  const loc = Array.isArray(e.location) ? e.location[0] : (e.location ?? {});
  const addr = typeof loc?.address === "object" ? loc.address : {};
  const suburb = addr?.addressLocality ?? "";
  const postcode = addr?.postalCode ?? "";

  const POSTCODE_COORDS: Record<string, [number, number]> = {
    "3000": [-37.8136, 144.9631], "3002": [-37.8155, 144.9771],
    "3004": [-37.828, 144.969], "3006": [-37.821, 144.954],
    "3008": [-37.829, 144.930], "3031": [-37.7997, 144.9289],
    "3051": [-37.7936, 144.9419], "3065": [-37.802, 144.982],
    "3066": [-37.81, 144.990], "3068": [-37.815, 145.010],
    "3121": [-37.82, 145.030], "3141": [-37.846, 144.988],
    "3182": [-37.866, 145.005], "3205": [-37.840, 144.968],
  };
  const [lat, lng] = POSTCODE_COORDS[postcode] ?? [-37.8136, 144.9631];

  const offers = Array.isArray(e.offers) ? e.offers : (e.offers ? [e.offers] : []);
  const offer = offers[0] ?? {};
  const price = offer?.price && String(offer.price) !== "0" ? `$${offer.price}` : "Free";
  const ticketUrl = offer?.url ?? e.url ?? `https://whatson.melbourne.vic.gov.au/things-to-do/${e.slug}`;

  const tl = `${name} ${e.description ?? ""}`.toLowerCase();
  let cat = "event";
  if (/comedy|comedian/.test(tl)) cat = "comedy";
  else if (/concert|music|band|jazz|gig|orchestra/.test(tl)) cat = "music";
  else if (/exhibition|gallery|museum|portrait/.test(tl)) cat = "arts";
  else if (/festival|carnival/.test(tl)) cat = "festival";
  else if (/afl|football|cricket|sport|cycling/.test(tl)) cat = "sport";
  else if (/kids|children|family|toddler/.test(tl)) cat = "family";
  else if (/theatre|theater|dance|opera|ballet/.test(tl)) cat = "theatre";
  else if (/food|wine|dining|restaurant|cooking/.test(tl)) cat = "food";

  return {
    id: e.slug ?? name.toLowerCase().replace(/[^a-z0-9]/g, "-").slice(0, 60),
    name,
    description: (e.description ?? "").slice(0, 500),
    startDate: e.startDate ?? "",
    endDate: e.endDate ?? "",
    venue: loc?.name ?? "",
    suburb,
    address: [addr?.streetAddress, suburb].filter(Boolean).join(", "),
    postcode,
    lat, lng,
    image: typeof e.image === "string" ? e.image : (Array.isArray(e.image) ? e.image[0] : ""),
    price,
    ticketUrl,
    url: `https://whatson.melbourne.vic.gov.au/things-to-do/${e.slug}`,
    category: cat,
    source: "whatsonmelbourne",
  };
}

async function fetchPredictHQ(): Promise<any[]> {
  const key = process.env.PREDICTHQ_API_KEY;
  if (!key) return [];

  const today = new Date().toISOString().split("T")[0];
  const end = new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

  const events: any[] = [];
  let url: string | null = `https://api.predicthq.com/v1/events/?within=150km@-37.8136,144.9631&active.gte=${today}&active.lte=${end}&limit=100&sort=start&category=concerts,festivals,sports,community,expos,performing-arts`;

  let page = 0;
  while (url && page < 10) {
    try {
      const res: Response = await fetch(url, {
        headers: { Authorization: `Bearer ${key}`, Accept: "application/json" },
        next: { revalidate: 21600 },
      });
      const data = await res.json();
      events.push(...(data.results ?? []));
      url = data.next ?? null;
      page++;
    } catch { break; }
  }
  return events;
}

function getSuburbFromCoords(lat: number, lng: number): string {
  const regions: [[number, number], string][] = [
    [[-37.82, 144.96], "Melbourne CBD"],
    [[-37.80, 144.97], "Carlton / Fitzroy"],
    [[-37.81, 145.00], "Richmond / Collingwood"],
    [[-37.84, 145.01], "South Yarra / Prahran"],
    [[-37.86, 145.01], "St Kilda"],
    [[-37.79, 144.93], "Footscray"],
    [[-37.75, 145.00], "Brunswick"],
    [[-38.15, 144.36], "Geelong"],
    [[-37.95, 145.15], "Dandenong"],
    [[-38.05, 145.13], "Frankston"],
    [[-38.22, 145.20], "Mornington"],
    [[-37.83, 145.24], "Ringwood"],
    [[-37.82, 145.04], "Hawthorn / Camberwell"],
    [[-37.89, 145.07], "Glen Waverley"],
    [[-37.90, 144.92], "Oakleigh"],
    [[-37.55, 144.66], "Melton"],
    [[-37.75, 144.77], "Werribee"],
    [[-37.55, 143.85], "Ballarat"],
    [[-36.76, 144.28], "Bendigo"],
    [[-38.34, 146.31], "Traralgon"],
    [[-38.20, 146.35], "Moe"],
    [[-38.12, 145.93], "Korumburra"],
  ];
  let best = "Melbourne";
  let bestDist = 999;
  for (const [[rlat, rlng], name] of regions) {
    const d = Math.hypot(lat - rlat, lng - rlng);
    if (d < bestDist) { bestDist = d; best = name; }
  }
  return best;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizePHQ(e: any) {
  const geo = e?.geo?.geometry?.coordinates ?? [];
  const lng = geo[0] ?? 144.9631;
  const lat = geo[1] ?? -37.8136;

  const suburb = getSuburbFromCoords(lat, lng);

  const catMap: Record<string, string> = {
    concerts: "music", festivals: "festival", sports: "sport",
    "performing-arts": "theatre", expos: "event", community: "event",
  };

  const tl = `${e.title ?? ""} ${e.description ?? ""}`.toLowerCase();
  let cat = catMap[e.category ?? ""] ?? "event";
  if (/comedy|comedian/.test(tl)) cat = "comedy";
  else if (/food|wine|dining|cook/.test(tl)) cat = "food";
  else if (/kids|children|family/.test(tl)) cat = "family";
  else if (/art|gallery|museum/.test(tl)) cat = "arts";

  const name = e.title ?? "";
  const geoAddr = e?.geo?.address ?? {};
  const propSuburb = geoAddr.locality || suburb;
  const postcode = geoAddr.postcode ?? "";
  const formattedAddress = geoAddr.formatted_address ?? propSuburb;

  // Venue from entities
  let venue = "";
  for (const ent of e.entities ?? []) {
    if (ent.type === "venue") { venue = ent.name ?? ""; break; }
  }

  // Google search fallback URL — always works
  const searchQuery = encodeURIComponent(`${name} ${propSuburb} Victoria tickets`);
  const googleUrl = `https://www.google.com/search?q=${searchQuery}`;

  return {
    id: `phq-${e.id}`,
    name,
    description: (e.description ?? "").replace(/^Sourced from predicthq\.com\s*[-–]?\s*/i, "").slice(0, 500),
    startDate: e.start_local ?? e.start ?? "",
    endDate: e.end_local ?? e.end ?? "",
    venue,
    suburb: propSuburb,
    address: formattedAddress,
    postcode,
    lat, lng,
    image: "",
    price: "Free",
    ticketUrl: googleUrl,
    url: googleUrl,
    category: cat,
    source: "predicthq",
  };
}

function isFamilyFriendly(event: { name?: string; description?: string; venue?: string; category?: string; startDate?: string }): boolean {
  const name = (event.name ?? "").toLowerCase();
  const desc = (event.description ?? "").toLowerCase();
  const combined = name + " " + desc;
  const venue = (event.venue ?? "").toLowerCase();
  const category = (event.category ?? "").toLowerCase();

  const blockKeywords = [
    "18+", "18 +", "over 18", "adults only",
    "nightclub", "night club", "club night", "late night", "after party", "afterparty",
    "cocktail class", "cocktail making", "gin masterclass", "whisky tasting", "wine tasting", "beer tasting",
    "brewery tour", "distillery",
    "karaoke bar", "strip", "burlesque",
    "comedy club", "stand-up", "stand up comedy",
    "rsl", "returned service",
    "bingo night", "poker night", "trivia night",
    "yoga class", "meditation class", "sound bath", "kundalini", "ecstatic dance",
    "conference", "symposium", "agm", "annual general meeting", "workshop for", "professional development",
    "property manager", "real estate", "financial", "investment seminar",
    "dating", "singles night", "mingle",
    "presentation night", "cricket club presentation", "football club presentation",
    "corporate", "networking event", "business summit",
    "horse clinic", "equestrian clinic", "dressage clinic",
    "warehouse sale", "jewellery show", "art karat",
    "retirement village", "aged care", "seniors",
  ];

  const blockVenueKeywords = [
    "revolver", "nightclub", "inflation", "club x", "sooki lounge",
    "bar for now", "glamorama", "170 russell",
  ];

  if (event.startDate) {
    const hour = new Date(event.startDate).getHours();
    if (hour >= 21) return false;
  }

  for (const kw of blockKeywords) {
    if (combined.includes(kw)) return false;
  }

  for (const kw of blockVenueKeywords) {
    if (venue.includes(kw)) return false;
  }

  const familyKeywords = [
    "kids", "children", "child", "family", "families", "toddler", "baby", "babies",
    "playground", "park", "market", "festival", "carnival", "fair",
    "school holiday", "school fair", "school fete",
    "zoo", "farm", "wildlife", "nature", "botanic", "garden",
    "museum", "gallery", "exhibition", "science",
    "show", "performance", "circus", "magic", "puppet",
    "sport", "afl", "cricket", "football", "swimming", "cycling", "run", "walk",
    "library", "storytime", "story time", "rhymetime", "rhyme time",
    "easter", "christmas", "halloween", "holiday",
    "community", "neighbourhood", "local event", "council event",
    "free", "outdoor", "beach", "picnic",
    "food festival", "food fair", "night market", "makers market", "farmers market",
    "expo", "open day", "fete",
  ];

  for (const kw of familyKeywords) {
    if (combined.includes(kw)) return true;
  }

  if (["family", "festival", "sport"].includes(category)) return true;

  if (event.startDate) {
    const hour = new Date(event.startDate).getHours();
    if (hour >= 0 && hour < 18) return true;
  }

  return true;
}

export async function GET() {
  try {
    const [whatsonEvents, phqRaw] = await Promise.all([
      scrapeWhatsonMelbourne().catch(() => [] as any[]),
      fetchPredictHQ().catch(() => [] as any[]),
    ]);

    // Merge — deduplicate by name
    const allNames = new Set(whatsonEvents.map((e: any) => e.name));
    const phqEvents = phqRaw.map(normalizePHQ).filter(e => e && e.name && !allNames.has(e.name));

    const events = [...whatsonEvents, ...phqEvents]
      .filter(Boolean)
      .filter(isFamilyFriendly)
      .sort((a: any, b: any) => (a.startDate ?? "z").localeCompare(b.startDate ?? "z"));

    return NextResponse.json({
      events,
      count: events.length,
      fetchedAt: new Date().toISOString(),
      sources: ["whatsonmelbourne", "predicthq"]
    }, {
      headers: {
        "Cache-Control": "s-maxage=21600, stale-while-revalidate=86400"
      }
    });
  } catch {
    // Fallback to static data
    const staticEvents = await import("@/lib/events-data.json");
    return NextResponse.json({ events: staticEvents.default, count: staticEvents.default.length, fetchedAt: "static", sources: [] });
  }
}
