import { listings } from "@/lib/listings";
import AppShell from "@/components/AppShell";
import eventsData from "@/lib/events-data.json";
import type { LiveEvent } from "@/lib/events";
import { getPublishedArticles } from "@/lib/blog-articles";
import { getThisWeekendEvents } from "@/lib/events";
import Link from "next/link";
import NewsletterCapture from "@/components/NewsletterCapture";

const allEvents = eventsData as LiveEvent[];
const weekendEvents = getThisWeekendEvents(allEvents).slice(0, 3);
const recentArticles = getPublishedArticles().slice(0, 3);

export default function Home() {
  return (
    <>
      <AppShell listings={listings} initialEvents={allEvents} />
      <NewsletterCapture />

      {/* What's On This Weekend Banner */}
      {weekendEvents.length > 0 && (
        <section className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] px-4 py-8">
          <div className="max-w-5xl mx-auto">
            <p className="text-xs font-semibold uppercase tracking-widest text-white/80 mb-3">This Weekend</p>
            <h2 className="text-2xl font-bold text-white mb-5 [font-family:var(--font-serif)]">What's on in Victoria this weekend</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {weekendEvents.map(event => (
                <a key={event.id} href={event.ticketUrl || event.url} target="_blank" rel="noopener noreferrer"
                  className="flex gap-3 bg-white/20 backdrop-blur-sm rounded-2xl p-4 border border-white/30 hover:bg-white/30 transition-all hover:-translate-y-0.5">
                  <div className="text-2xl">📅</div>
                  <div className="min-w-0">
                    <p className="text-xs text-white/80 font-semibold uppercase">{event.category}</p>
                    <p className="text-sm font-semibold text-white mt-0.5 line-clamp-2">{event.name}</p>
                    <p className="text-xs text-white/70 mt-1">
                      {new Date(event.startDate).toLocaleDateString("en-AU", { weekday: "short", day: "numeric", month: "short" })}
                      {event.suburb ? ` · ${event.suburb}` : ""}
                    </p>
                  </div>
                </a>
              ))}
            </div>
            <Link href="/events" className="inline-block mt-5 text-sm text-white/90 hover:text-white font-semibold">
              See all events →
            </Link>
          </div>
        </section>
      )}

      {/* Latest Guides section */}
      {recentArticles.length > 0 && (
        <section className="px-4 py-10 bg-[var(--color-bg)]">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center justify-between mb-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-primary)]">Latest</p>
                <h2 className="text-2xl font-bold text-[var(--color-text-strong)] mt-0.5 [font-family:var(--font-serif)]">Recent Guides</h2>
              </div>
              <Link href="/blog" className="text-xs text-[var(--color-primary)] font-semibold hover:underline">View all →</Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {recentArticles.map(article => (
                <Link key={article.slug} href={`/blog/${article.slug}`}
                  className="group rounded-2xl border border-[var(--color-border)] bg-white overflow-hidden hover:shadow-lg transition-all hover:-translate-y-1">
                  <div className="h-36 w-full bg-gradient-to-br from-[var(--color-primary-soft)] to-[var(--color-secondary-soft)] flex items-center justify-center">
                    <span className="text-4xl">📍</span>
                  </div>
                  <div className="p-3">
                    <p className="text-xs font-semibold text-[var(--color-primary)] uppercase tracking-wide">{article.category}</p>
                    <h3 className="text-sm font-bold text-[var(--color-text-strong)] mt-1 line-clamp-2">{article.title}</h3>
                    <p className="text-xs text-[var(--color-text-muted)] mt-1 line-clamp-2">{article.description}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: "VicBuzz",
            url: "https://vicbuzz.com.au",
            description: "Discover 761 family-friendly spots across Victoria",
            potentialAction: {
              "@type": "SearchAction",
              "target": "https://vicbuzz.com.au/?q={search_term_string}",
              "query-input": "required name=search_term_string",
            },
          }),
        }}
      />
    </>
  );
}
