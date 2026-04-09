"use client";

import { useState, useEffect } from "react";

export default function NewsletterBar() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    try {
      if (localStorage.getItem("vicbuzz_newsletter_done") === "1") {
        setHidden(true);
      }
    } catch {}
  }, []);

  if (hidden) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch("https://formsubmit.co/ajax/dclbloggerx@gmail.com", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          _subject: "VicBuzz Newsletter Signup",
          message: email,
        }),
      });
    } catch {}
    setSubmitted(true);
    localStorage.setItem("vicbuzz_newsletter_done", "1");
  };

  return (
    <div className="rounded-3xl p-6 text-center mb-6 border border-white/40 shadow-sm" style={{background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%)'}}>
      {submitted ? (
        <p className="font-bold text-white text-lg">
          🐝 You are in! Check your inbox this Friday.
        </p>
      ) : (
        <>
          <h3 className="text-xl font-bold text-white [font-family:var(--font-serif)]">
            Get This Week&apos;s Family Activities in Your Inbox 🐝
          </h3>
          <p className="text-sm text-white/90 mt-1">
            Free weekly digest for Victorian parents. Parks, events, free activities — delivered every Friday.
          </p>
          <form
            onSubmit={handleSubmit}
            className="mt-3 flex flex-col sm:flex-row gap-2 max-w-md mx-auto"
          >
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email"
              className="flex-1 px-4 py-3 rounded-full text-sm border-0 focus:outline-none focus:ring-2 focus:ring-white"
            />
            <button
              type="submit"
              className="bg-white text-[var(--color-primary)] px-6 py-3 rounded-full font-semibold text-sm hover:bg-gray-50 transition-colors"
            >
              Subscribe Free 🐝
            </button>
          </form>
        </>
      )}
    </div>
  );
}
