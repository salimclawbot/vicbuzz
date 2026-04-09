"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

export default function NewsletterCapture() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubmitted(true);
  };

  return (
    <section className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] px-4 py-10">
      <Card className="mx-auto max-w-xl border-white/40 bg-white/20 shadow-none backdrop-blur-sm">
        <CardContent className="pt-6 text-center text-white">
          {submitted ? (
            <>
              <span className="text-3xl">🎉</span>
              <h3 className="mt-2 text-xl font-bold">You&apos;re in!</h3>
              <p className="mt-1 text-sm opacity-90">We&apos;ll send the best family activities in Victoria every week.</p>
            </>
          ) : (
            <>
              <p className="text-sm font-semibold uppercase tracking-widest opacity-90">Free weekly guide</p>
              <h2 className="mt-1 text-2xl font-bold">Get the Family Guide to Victoria delivered weekly</h2>
              <p className="mt-2 text-sm opacity-90">Playgrounds, markets, free events, school holiday ideas, all in one email.</p>
              <form onSubmit={handleSubmit} className="mx-auto mt-5 flex max-w-md gap-2">
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  className="bg-white text-[var(--color-text-strong)]"
                />
                <Button type="submit" variant="outline" className="border-white bg-white text-[var(--color-text-strong)] hover:bg-white/90">
                  Subscribe
                </Button>
              </form>
              <p className="mt-3 text-xs opacity-70">No spam. Unsubscribe any time.</p>
            </>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
