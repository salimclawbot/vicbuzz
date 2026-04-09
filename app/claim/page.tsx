"use client";

import { useState } from "react";
import Link from "next/link";

const tiers = [
  {
    name: "Free",
    price: "$0",
    desc: "Get found by local families",
    features: ["Listed on VicBuzz", "Suburb page inclusion", "Basic profile visible to parents"],
  },
  {
    name: "Featured",
    price: "$29/mo",
    desc: "Stand out to families near you",
    features: [
      "Everything in Free",
      "⭐ Featured badge",
      "Priority placement for parents searching",
      "Photo gallery (up to 5)",
    ],
    popular: true,
  },
  {
    name: "Premium",
    price: "$79/mo",
    desc: "Maximum visibility to families",
    features: [
      "Everything in Featured",
      "🏆 Premium badge",
      "Top of category for parents",
      "Unlimited photos",
      "Family event promotion",
      "Analytics — see how many parents find you",
    ],
  },
];

export default function ClaimPage() {
  const [selectedTier, setSelectedTier] = useState("Featured");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const obj: Record<string, string> = {};
    data.forEach((v, k) => (obj[k] = v as string));

    try {
      await fetch("https://formsubmit.co/ajax/dclbloggerx@gmail.com", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          ...obj,
          _subject: `VicBuzz Claim — ${selectedTier}`,
        }),
      });
    } catch {}
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <header className="sticky top-0 z-50 bg-white border-b border-gray-100 px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center">
          <Link
            href="/"
            className="text-[var(--color-text-strong)] font-semibold text-sm"
          >
            ← Back to VicBuzz
          </Link>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-[var(--color-text-strong)] text-center">
          Is Your Family Venue Listed on VicBuzz? 🐝
        </h1>
        <p className="text-sm text-gray-500 text-center mt-1 mb-8">
          Thousands of Victorian parents search VicBuzz every week for parks, playgrounds, kids activities and family events near them.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          {tiers.map((tier) => (
            <button
              key={tier.name}
              onClick={() => setSelectedTier(tier.name)}
              className={`relative bg-white rounded-2xl border-2 p-6 text-left transition-all ${
                selectedTier === tier.name
                  ? tier.name === "Featured"
                    ? "border-[var(--color-primary)] shadow-lg shadow-[var(--color-primary)]/20"
                    : tier.name === "Premium"
                    ? "border-[var(--color-secondary)] shadow-lg"
                    : "border-[var(--color-primary)] shadow-lg"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              {tier.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[var(--color-primary)] text-white text-xs font-bold px-3 py-1 rounded-full">
                  POPULAR
                </span>
              )}
              <h3 className="text-lg font-bold text-[var(--color-text-strong)]">{tier.name}</h3>
              <p className="text-2xl font-extrabold text-[var(--color-text-strong)] mt-1">
                {tier.price}
              </p>
              <p className="text-sm text-gray-500 mt-1">{tier.desc}</p>
              <ul className="mt-4 space-y-2">
                {tier.features.map((f) => (
                  <li key={f} className="text-sm text-gray-600 flex items-start gap-2">
                    <span className="text-[#4ECDC4]">✓</span> {f}
                  </li>
                ))}
              </ul>
            </button>
          ))}
        </div>

        {submitted ? (
          <div className="text-center py-12">
            <div className="text-5xl mb-3">🐝</div>
            <p className="text-lg font-bold text-[var(--color-text-strong)]">
              Request submitted!
            </p>
            <p className="text-sm text-gray-500 mt-1">
              We&apos;ll be in touch within 24 hours.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="max-w-lg mx-auto space-y-4">
            <h2 className="text-lg font-bold text-[var(--color-text-strong)]">
              Your Details
            </h2>
            <input type="hidden" name="tier" value={selectedTier} />
            {[
              { name: "business_name", label: "Business Name", type: "text" },
              { name: "suburb", label: "Suburb", type: "text" },
              { name: "contact_name", label: "Contact Name", type: "text" },
              { name: "email", label: "Email", type: "email" },
              { name: "phone", label: "Phone", type: "tel" },
            ].map((field) => (
              <div key={field.name}>
                <label className="block text-sm font-medium text-[var(--color-text-strong)] mb-1">
                  {field.label}
                </label>
                <input
                  type={field.type}
                  name={field.name}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)]"
                />
              </div>
            ))}
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-strong)] mb-1">
                Selected Tier
              </label>
              <div className="flex gap-3">
                {tiers.map((t) => (
                  <label
                    key={t.name}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm cursor-pointer ${
                      selectedTier === t.name
                        ? "border-[var(--color-primary)] bg-[var(--color-primary-soft)] font-semibold"
                        : "border-gray-200"
                    }`}
                  >
                    <input
                      type="radio"
                      name="tier_radio"
                      value={t.name}
                      checked={selectedTier === t.name}
                      onChange={() => setSelectedTier(t.name)}
                      className="sr-only"
                    />
                    {t.name}
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-strong)] mb-1">
                Message
              </label>
              <textarea
                name="message"
                rows={3}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] resize-none"
                placeholder="Tell us about your business..."
              />
            </div>
            <button
              type="submit"
              className="w-full bg-[var(--color-primary)] text-white py-3 rounded-xl font-bold text-sm hover:bg-[var(--color-primary-strong)] transition-colors"
            >
              Submit Claim Request →
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
