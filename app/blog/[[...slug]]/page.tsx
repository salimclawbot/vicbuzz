import Link from "next/link";
import ShareButtons from "@/components/ShareButtons";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import VicBuzzEmbed from "@/components/VicBuzzEmbed";
import { BlogImage } from "@/components/BlogImage";
import ArticleListingGrid from "@/components/ArticleListingGrid";
import { blogArticles, getArticleBySlug, getPublishedArticles } from "@/lib/blog-articles";

type Props = { params: Promise<{ slug?: string[] }> };

function parseMarkdown(content: string) {
  // Strip frontmatter
  if (content.trimStart().startsWith("---")) {
    const trimmed = content.trimStart();
    const secondFence = trimmed.indexOf("---", 3);
    if (secondFence !== -1) {
      content = trimmed.slice(secondFence + 3);
    }
  }

  const lines = content.split("\n");
  const blocks: Array<{ type: "h1" | "h2" | "h3" | "p" | "li" | "link" | "bold" | "skip" | "html" | "img"; text: string; id?: string; html?: string; href?: string }> = [];
  const toc: Array<{ id: string; text: string }> = [];

  // HTML block tags that should be collected as multi-line raw HTML
  const htmlBlockOpeners = /^<(video|div|style|section|table|ul|ol)\b/i;
  let htmlBuffer: string[] | null = null;
  let htmlCloseTag = "";
  // HTML comment tracking
  let inComment = false;

  for (let idx = 0; idx < lines.length; idx++) {
    const raw = lines[idx];
    const line = raw.trim();

    // Handle multi-line HTML comment blocks
    if (inComment) {
      if (line.includes("-->")) {
        inComment = false;
      }
      continue;
    }
    if (/^<!--/.test(line)) {
      if (!line.includes("-->")) {
        inComment = true;
      }
      // Single-line or start of multi-line comment — skip either way
      continue;
    }

    // Collecting multi-line HTML block
    if (htmlBuffer !== null) {
      htmlBuffer.push(raw);
      if (line.includes(htmlCloseTag) || (line === "" && htmlBuffer.length > 1)) {
        if (line === "") htmlBuffer.pop(); // remove trailing blank
        blocks.push({ type: "html", text: "", html: htmlBuffer.join("\n") });
        htmlBuffer = null;
        htmlCloseTag = "";
      }
      continue;
    }

    if (!line) continue;

    // Detect multi-line HTML block openers
    const blockMatch = line.match(htmlBlockOpeners);
    if (blockMatch) {
      const tag = blockMatch[1].toLowerCase();
      const closeTag = `</${tag}`;
      // Check if it closes on the same line
      if (line.includes(closeTag + ">")) {
        blocks.push({ type: "html", text: "", html: line });
      } else {
        htmlBuffer = [raw];
        htmlCloseTag = closeTag;
      }
      continue;
    }

    // Skip raw HTML: script, figure, figcaption (existing behavior)
    if (line.startsWith("<") && (line.startsWith("<script") || line.includes("<figcaption") || line.includes("</figcaption"))) {
      blocks.push({ type: "skip", text: "" });
      continue;
    }

    // Single-line raw HTML passthrough (e.g. <img, <figure, <a, <br, etc.)
    if (line.startsWith("<") && !line.startsWith("<script")) {
      // figure/img tags — pass through as html
      blocks.push({ type: "html", text: "", html: line });
      continue;
    }

    // Skip JSON-LD schema blocks
    if (line.includes("@context") || line.includes("@type") || line.includes("schema.org") || line === "}" || line === "{" || line.startsWith('"') && line.endsWith('",') && line.includes('": "')) {
      blocks.push({ type: "skip", text: "" });
      continue;
    }

    // Skip horizontal rules
    if (line === "---" || line === "***" || line === "___") continue;

    // Headings
    if (line.startsWith("### ")) {
      const text = stripMarkdown(line.replace(/^###\s+/, ""));
      const id = text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      blocks.push({ type: "h3", text, id });
      continue;
    }
    if (line.startsWith("## ")) {
      const text = stripMarkdown(line.replace(/^##\s+/, ""));
      const id = text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      blocks.push({ type: "h2", text, id });
      toc.push({ id, text });
      continue;
    }
    if (line.startsWith("# ")) {
      const text = stripMarkdown(line.replace(/^#\s+/, ""));
      blocks.push({ type: "h1", text });
      continue;
    }

    // Markdown images: ![alt](src)
    const imgMatch = line.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
    if (imgMatch) {
      blocks.push({ type: "img", text: imgMatch[1], html: imgMatch[2] });
      continue;
    }

    // Lists - handle markdown links inside list items
    if (line.startsWith("- ") || line.startsWith("* ") || /^\d+\.\s/.test(line)) {
      const raw2 = line.replace(/^[-*]\s+/, "").replace(/^\d+\.\s+/, "");
      const linkMatch = raw2.match(/\[([^\]]+)\]\(([^)]+)\)/);
      if (linkMatch) {
        blocks.push({ type: "link", text: linkMatch[1], href: linkMatch[2] });
      } else {
        const text = stripMarkdown(raw2);
        if (text) blocks.push({ type: "li", text });
      }
      continue;
    }

    // Bold standalone line
    if (line.startsWith("**") && line.endsWith("**") && line.length > 4) {
      blocks.push({ type: "bold", text: line.replace(/\*\*/g, "") });
      continue;
    }

    // Regular paragraph - strip markdown formatting
    const text = stripMarkdown(line);
    if (text) blocks.push({ type: "p", text });
  }

  return { blocks, toc };
}

function stripMarkdown(text: string): string {
  // Remove markdown links [text](url) -> text
  text = text.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");
  // Remove image tags (inline images in paragraphs — standalone ones handled as img blocks)
  text = text.replace(/!\[([^\]]*)\]\([^)]+\)/g, "$1");
  // Remove bold/italic
  text = text.replace(/\*\*([^*]+)\*\*/g, "$1");
  text = text.replace(/\*([^*]+)\*/g, "$1");
  text = text.replace(/__([^_]+)__/g, "$1");
  text = text.replace(/_([^_]+)_/g, "$1");
  // Remove inline code
  text = text.replace(/`([^`]+)`/g, "$1");
  // Remove raw HTML tags
  text = text.replace(/<[^>]+>/g, "");
  return text.trim();
}

function detectSuburb(slug: string): string | null {
  const suburbs = ["frankston","berwick","narre-warren","dandenong","geelong","ballarat","mornington","yarra-valley","bendigo","ballarat","warragul","pakenham","cranbourne","frankston","cheltenham","moorabbin","mentone","mordialloc","carrum","seaford"];
  for (const s of suburbs) {
    if (slug.includes(s)) return s.replace(/-/g, " ");
  }
  return null;
}

function detectCategory(slug: string): string | null {
  if (slug.includes("playground")) return "kids";
  if (slug.includes("beach")) return "kids";
  if (slug.includes("cafe")) return "food";
  if (slug.includes("market")) return "markets";
  if (slug.includes("brewery") || slug.includes("breweries")) return "food";
  if (slug.includes("school-holiday") || slug.includes("family-days") || slug.includes("toddler")) return "kids";
  if (slug.includes("indoor")) return "kids";
  if (slug.includes("birthday")) return "kids";
  return null;
}

function getPexelsKeyword(slug: string): string {
  if (slug.includes("playground")) return "playground children melbourne";
  if (slug.includes("beach")) return "beach victoria australia family";
  if (slug.includes("cafe")) return "family cafe children australia";
  if (slug.includes("market")) return "farmers market australia";
  if (slug.includes("brewery")) return "brewery outdoor australia";
  if (slug.includes("frankston")) return "frankston beach melbourne";
  if (slug.includes("berwick")) return "parkland children melbourne";
  if (slug.includes("geelong")) return "geelong waterfront victoria";
  if (slug.includes("mornington")) return "mornington peninsula beach";
  if (slug.includes("yarra")) return "yarra valley victoria";
  if (slug.includes("ballarat")) return "ballarat victoria historic";
  if (slug.includes("dandenong")) return "dandenong ranges victoria";
  if (slug.includes("toddler")) return "toddler children park australia";
  if (slug.includes("school-holiday")) return "school holiday children victoria";
  if (slug.includes("family")) return "family activities melbourne australia";
  return "melbourne victoria family";
}

export async function generateStaticParams() {
  return [
    { slug: [] },
    ...blogArticles.map((a) => ({ slug: [a.slug] })),
  ];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  if (!slug || slug.length === 0) {
    return {
      title: "VicBuzz Guides | Family Activity Articles Victoria",
      description: "Browse VicBuzz guides for family activities, free events, and things to do across Victoria.",
    };
  }
  const article = getArticleBySlug(slug[0]);
  if (!article) return {};
  return {
    title: `${article.title} | VicBuzz`,
    description: article.description,
    alternates: { canonical: `https://vicbuzz.com.au/blog/${slug[0]}` },
    openGraph: {
      title: article.title,
      description: article.description,
      type: "article",
      url: `https://vicbuzz.com.au/blog/${slug[0]}`,
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: article.description,
    },
  };
}

export default async function BlogPage({ params }: Props) {
  const { slug } = await params;

  // Blog index
  if (!slug || slug.length === 0) {
    const articles = getPublishedArticles();
    return (
      <main className="min-h-screen bg-[#FEFEFE] px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="rounded-2xl bg-[#1A1A2E] p-6 text-white sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-300">VicBuzz Guides</p>
            <h1 className="mt-2 text-3xl font-bold sm:text-4xl">Family activity guides for Victoria</h1>
            <p className="mt-3 max-w-2xl text-sm text-white/80 sm:text-base">
              Practical local guides to help families find great things to do every week across Victoria.
            </p>
          </div>
          <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {articles.map((article) => (
              <article key={article.slug} className="rounded-2xl border border-[#EFEFEF] bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
                <p className="text-xs font-semibold uppercase tracking-wide text-[#FF6B6B]">{article.category}</p>
                <h2 className="mt-2 text-xl font-bold text-[#1A1A2E]">
                  <Link href={`/blog/${article.slug}`} className="hover:text-[#FF6B6B]">{article.title}</Link>
                </h2>
                <p className="mt-2 text-sm text-[#6B7280]">{article.description}</p>
                <div className="mt-4 flex items-center justify-between text-xs text-[#6B7280]">
                  <span>{article.readTime}</span>
                  <span>{article.publishDate}</span>
                </div>
                <div className="mt-4">
                  <Link href={`/blog/${article.slug}`} className="inline-flex items-center rounded-full bg-amber-300 px-3.5 py-1.5 text-xs font-bold text-black hover:bg-amber-200">
                    Read guide →
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </main>
    );
  }

  // Article page
  const article = getArticleBySlug(slug[0]);
  if (!article) notFound();

  // Fetch Pexels hero image
  let heroImage: string | null = null;
  try {
    const keyword = getPexelsKeyword(article.slug);
    const pexelsRes = await fetch(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(keyword)}&per_page=3&orientation=landscape`,
      { headers: { Authorization: "zA3efQ6HDMgeAvKslMe1KsMHy6QN62pr77VVhwDfiBDCJnMgFZCAnsUI" }, next: { revalidate: 86400 } }
    );
    if (pexelsRes.ok) {
      const data = await pexelsRes.json();
      if (data.photos?.[0]) heroImage = data.photos[0].src.large2x || data.photos[0].src.large;
    }
  } catch {}

  // Strip any raw schema JSON that Pen may have included in article content
  const cleanContent = article.content
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/```json[\s\S]*?```/g, "")
    .replace(/```[\s\S]*?```/g, "");
  const { blocks, toc } = parseMarkdown(cleanContent);
  const suburb = detectSuburb(article.slug);
  const category = detectCategory(article.slug);

  const blogPostingSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: article.title,
    description: article.description,
    datePublished: article.publishDate,
    dateModified: article.date,
    author: { "@type": "Organization", name: "VicBuzz Team" },
    publisher: { "@type": "Organization", name: "VicBuzz", url: "https://vicbuzz.com.au" },
    mainEntityOfPage: `https://vicbuzz.com.au/blog/${slug[0]}`,
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: article.faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <main className="min-h-screen bg-[#FEFEFE]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(blogPostingSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      {/* Hero */}
      <div className="bg-[#1A1A2E] px-4 pt-8 pb-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <nav className="text-xs text-white/50 mb-4">
            <Link href="/" className="hover:text-white">Home</Link>
            <span className="mx-2">/</span>
            <Link href="/blog" className="hover:text-white">Guides</Link>
            <span className="mx-2">/</span>
            <span className="text-white/80">{article.title}</span>
          </nav>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-300 mb-3">{article.category}</p>
          <h1 className="text-2xl sm:text-4xl font-bold text-white leading-tight">{article.title}</h1>
          <div className="mt-4 flex items-center gap-4 text-sm text-white/60">
            <span>{article.author}</span>
            <span>·</span>
            <span>{article.readTime}</span>
            <span>·</span>
            <span>{article.publishDate}</span>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Hero Image */}
        {heroImage && (
          <div className="relative w-full h-56 sm:h-72 overflow-hidden rounded-2xl mb-6">
            <img src={heroImage} alt={article.title} className="w-full h-full object-cover" loading="eager" />
          </div>
        )}

        {/* TOC */}
        {toc.length > 0 && (
          <nav className="mb-8 rounded-2xl border border-amber-200 bg-amber-50 p-5">
            <p className="text-xs font-bold uppercase tracking-wider text-amber-700 mb-3">In this guide</p>
            <ol className="space-y-1.5">
              {toc.map((item, i) => (
                <li key={item.id}>
                  <a href={`#${item.id}`} className="text-sm text-amber-800 hover:text-amber-600 flex gap-2">
                    <span className="text-amber-400 font-bold">{i + 1}.</span>
                    {item.text}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        )}

        {/* Content */}
        <div className="prose prose-lg max-w-none">
          {(() => {
            let h2Count = 0;
            let listingOffset = 0;
            return blocks.map((block, i) => {
              if (block.type === "skip") return null;
              if (block.type === "html") return <div key={i} dangerouslySetInnerHTML={{ __html: block.html! }} />;
              if (block.type === "img") return <BlogImage key={i} src={block.html!} alt={block.text} loading="lazy" />;
              if (block.type === "h1") return <h1 key={i} className="text-3xl font-bold text-[#1A1A2E] mt-8 mb-4">{block.text}</h1>;
              if (block.type === "h2") {
                h2Count++;
                listingOffset += 3; // rotate through different listings each section
                // Show grid after every H2 except the first (TOC/intro)
                const showGrid = h2Count > 1;
                const gridTitle = suburb
                  ? h2Count % 2 === 0 ? `More to do in ${suburb.charAt(0).toUpperCase() + suburb.slice(1)}` : `Popular spots in ${suburb.charAt(0).toUpperCase() + suburb.slice(1)}`
                  : h2Count % 2 === 0 ? "Explore on VicBuzz" : "Popular activities";
                return (
                  <div key={i}>
                    <h2 id={block.id} className="text-2xl font-bold text-[#1A1A2E] mt-10 mb-4 scroll-mt-20">{block.text}</h2>
                    {showGrid && (
                      <ArticleListingGrid
                        suburb={suburb || undefined}
                        category={category || undefined}
                        title={gridTitle}
                        limit={6}
                      />
                    )}
                  </div>
                );
              }
              if (block.type === "h3") return <h3 key={i} id={block.id} className="text-xl font-semibold text-[#1A1A2E] mt-6 mb-3">{block.text}</h3>;
              if (block.type === "bold") return <p key={i} className="font-semibold text-[#1A1A2E] my-3">{block.text}</p>;
              if (block.type === "link") return <li key={i} className="text-[#374151] ml-4 my-1 list-disc"><a href={block.href} className="text-amber-700 hover:underline">{block.text}</a></li>;
              if (block.type === "li") return <li key={i} className="text-[#374151] ml-4 my-1 list-disc">{block.text}</li>;
              return <p key={i} className="text-[#374151] leading-relaxed my-3">{block.text}</p>;
            });
          })()}
        </div>

        {/* Embed */}
        <div className="mt-12">
          <VicBuzzEmbed suburb={suburb || undefined} title={suburb ? `Explore ${suburb.charAt(0).toUpperCase() + suburb.slice(1)}` : "Find activities near you"} />
        </div>

        {/* FAQs */}
        {article.faqs.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-[#1A1A2E] mb-6">Frequently Asked Questions</h2><ShareButtons title={article.title} />

        
            <div className="space-y-4">
              {article.faqs.map((faq, i) => (
                <div key={i} className="rounded-xl border border-[#EFEFEF] bg-white p-5">
                  <p className="font-semibold text-[#1A1A2E]">{faq.q}</p>
                  <p className="mt-2 text-sm text-[#6B7280]">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Back */}
        <div className="mt-10 pt-8 border-t border-[#EFEFEF]">
          <Link href="/blog" className="text-sm text-[#FF6B6B] hover:underline">← Back to all guides</Link>
        </div>
      </div>
    </main>
  );
}
