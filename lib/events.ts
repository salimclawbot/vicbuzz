import eventsData from "./events-data.json";

export interface LiveEvent {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  venue: string;
  suburb: string;
  address: string;
  postcode: string;
  lat: number;
  lng: number;
  image: string;
  price: string;
  ticketUrl: string;
  url: string;
  category: string;
  source: string;
}

export const liveEvents: LiveEvent[] = eventsData as LiveEvent[];

function isFamilyFriendly(event: LiveEvent): boolean {
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

export function getCurrentMonthEvents(): LiveEvent[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return liveEvents
    .filter((e) => {
      if (!e.startDate) return true;
      const start = new Date(e.startDate);
      const end = e.endDate ? new Date(e.endDate) : start;
      end.setHours(23, 59, 59, 999);
      const today = new Date(); today.setHours(0,0,0,0);
      return end >= today;
    })
    .filter(isFamilyFriendly)
    .sort((a, b) => (a.startDate || "z").localeCompare(b.startDate || "z"));
}

export function getEventsByCategory(cat: string): LiveEvent[] {
  return liveEvents.filter((e) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const end = e.endDate ? new Date(e.endDate) : (e.startDate ? new Date(e.startDate) : null);
    if (end) { end.setHours(23, 59, 59, 999); if (end < today) return false; }
    return e.category === cat;
  });
}
