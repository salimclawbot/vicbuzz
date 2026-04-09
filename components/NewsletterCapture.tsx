"use client";

import { useState } from "react";

export default function NewsletterCapture() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    // FormSubmit will handle the rest
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <section className="bg-gradient-to-r from-[#FF6B6B] to-[#FFB347] px-4 py-10">
        <div className="max-w-xl mx-auto text-center text-white">
          <span className="text-3xl">🎉</span>
          <h3 className="text-xl font-bold mt-2">You're in!</h3>
          <p className="text-sm opacity-90 mt-1">We'll send you the best family activities in Victoria every week.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-gradient-to-r from-[#FF6B6B] to-[#FFB347] px-4 py-10">
      <div className="max-w-xl mx-auto text-center text-white">
        <p className="text-sm font-semibold uppercase tracking-widest opacity-90">Free weekly guide</p>
        <h2 className="text-2xl font-bold mt-1">Get the Family Guide to Victoria delivered weekly</h2>
        <p className="text-sm opacity-90 mt-2">Playgrounds, markets, free events, school holiday ideas — all in one email.</p>
        <form onSubmit={handleSubmit} className="mt-5 flex gap-2 max-w-md mx-auto">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            required
            className="flex-1 px-4 py-3 rounded-lg text-[#2D2D2D] text-sm focus:outline-none focus:ring-2 focus:ring-white"
          />
          <button
            type="submit"
            className="px-5 py-3 bg-[#1A1A2E] text-white rounded-lg font-semibold text-sm hover:bg-[#2D2D2D] transition-colors whitespace-nowrap"
          >
            Subscribe
          </button>
        </form>
        <p className="text-xs opacity-70 mt-3">No spam. Unsubscribe any time.</p>
      </div>
    </section>
  );
}
