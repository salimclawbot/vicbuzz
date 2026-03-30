import { listings } from "@/lib/listings";
import { getPublishedArticles } from "@/lib/blog-articles";
import type { MetadataRoute } from "next";

function slugify(s: string) {
  return s.toLowerCase().replace(/\s+/g, "-");
}

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://vicbuzz.com.au";

  const listingUrls = listings.map((l) => ({
    url: `${base}/listing/${l.id}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  const suburbs = [...new Set(listings.map((l) => l.suburb).filter(Boolean))];
  const suburbUrls = suburbs.map((s) => ({
    url: `${base}/explore/${slugify(s)}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  const publishedArticles = getPublishedArticles();
  const blogUrls = publishedArticles.map((article) => ({
    url: `${base}/blog/${article.slug}`,
    lastModified: new Date(article.publishDate),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  return [
    {
      url: base,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${base}/explore`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${base}/blog`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.85,
    },
    {
      url: `${base}/submit`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${base}/claim`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    ...suburbUrls,
    ...blogUrls,
    ...listingUrls,
  ];
}
