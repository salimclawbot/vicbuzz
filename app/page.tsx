import { listings } from "@/lib/listings";
import AppShell from "@/components/AppShell";
import eventsData from "@/lib/events-data.json";
import type { LiveEvent } from "@/lib/events";

export default function Home() {
  return (
    <>
      <AppShell listings={listings} initialEvents={eventsData as LiveEvent[]} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: "VicBuzz",
            url: "https://vicbuzz.com.au",
            description:
              "Discover 761 family-friendly spots across Victoria",
            potentialAction: {
              "@type": "SearchAction",
              target:
                "https://vicbuzz.com.au/?q={search_term_string}",
              "query-input": "required name=search_term_string",
            },
          }),
        }}
      />
    </>
  );
}
