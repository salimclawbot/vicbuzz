import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "List Your Family-Friendly Venue or Event",
  description: "List your family-friendly venue or event on VicBuzz — reach thousands of Victorian parents searching for things to do with their kids.",
  openGraph: {
    title: "List Your Family-Friendly Venue or Event | VicBuzz",
    description: "List your family-friendly venue or event on VicBuzz — reach thousands of Victorian parents.",
    type: "website",
    url: "https://vicbuzz.com.au/submit",
  },
  twitter: {
    card: "summary",
    title: "List Your Venue on VicBuzz",
    description: "Reach thousands of Victorian parents searching for things to do with their kids.",
  },
  alternates: {
    canonical: "https://vicbuzz.com.au/submit",
  },
};

export default function SubmitPage() {
  return (
    <div className="min-h-screen bg-[#FEFEFE]">
      
      <div className="max-w-lg mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-[#2D2D2D]">
          List Your Family-Friendly Venue or Event 🐝
        </h1>
        <p className="text-sm text-[#6B7280] mt-1">
          Reach thousands of Victorian parents searching for things to do with their kids
        </p>

        <form className="mt-6 space-y-4" action="https://formsubmit.co/info@vicbuzz.com.au" method="POST">
          <input type="hidden" name="_subject" value="New VicBuzz Venue Submission" />
          <input type="hidden" name="_captcha" value="false" />
          <input type="hidden" name="_template" value="box" />

          <div>
            <label className="block text-xs font-semibold text-[#374151] mb-1">Venue or Event Name</label>
            <input
              type="text"
              name="name"
              required
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B6B]"
              placeholder="e.g. Yarra Ranges Science Museum"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#374151] mb-1">Suburb</label>
            <input
              type="text"
              name="suburb"
              required
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B6B]"
              placeholder="e.g. Lilydale"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#374151] mb-1">Category</label>
            <select
              name="category"
              required
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B6B]"
            >
              <option value="">Select a category</option>
              <option value="playground">Playground</option>
              <option value="cafe">Cafe / Restaurant</option>
              <option value="park">Park / Reserve</option>
              <option value="market">Market</option>
              <option value="museum">Museum / Gallery</option>
              <option value="beach">Beach / Foreshore</option>
              <option value="event">Event</option>
              <option value="activity">Activity Centre</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#374151] mb-1">Entry Cost</label>
            <select
              name="price"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B6B]"
            >
              <option value="Free">Free</option>
              <option value="Under $10">Under $10</option>
              <option value="$10-$20">$10-$20</option>
              <option value="$20-$30">$20-$30</option>
              <option value="$30+">$30+</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#374151] mb-1">Your Email</label>
            <input
              type="email"
              name="email"
              required
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B6B]"
              placeholder="your@email.com"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#374151] mb-1">Description (what makes it great for families?)</label>
            <textarea
              name="description"
              rows={4}
              required
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B6B]"
              placeholder="Tell us what families will love about this place..."
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-[#FF6B6B] text-white font-semibold py-3 hover:bg-[#ff5252] transition-colors"
          >
            Submit Listing
          </button>

          <p className="text-xs text-[#9CA3AF] text-center">
            We review all submissions and add them to VicBuzz within 48 hours.
          </p>
        </form>
      </div>
    </div>
  );
}
