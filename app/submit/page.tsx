import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "List Your Family-Friendly Venue or Event",
  description: "List your family-friendly venue or event on VicBuzz — reach thousands of Victorian parents searching for things to do with their kids.",
};

export default function SubmitPage() {
  return (
    <div className="min-h-screen bg-[#FEFEFE]">
      <header className="sticky top-0 z-50 bg-white border-b border-gray-100 px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center">
          <Link
            href="/"
            className="text-[#2D2D2D] font-semibold text-sm"
          >
            ← Back to VicBuzz
          </Link>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-[#2D2D2D]">
          List Your Family-Friendly Venue or Event 🐝
        </h1>
        <p className="text-sm text-[#6B7280] mt-1">
          Reach thousands of Victorian parents searching for things to do with their kids
        </p>

        <form
          action="https://formsubmit.co/dclbloggerx@gmail.com"
          method="POST"
          className="mt-6 space-y-4"
        >
          <input type="hidden" name="_subject" value="VicBuzz Family Venue/Event Submission" />
          <input type="hidden" name="_captcha" value="false" />
          <input
            type="hidden"
            name="_next"
            value="https://vicbuzz.com.au/submit?success=true"
          />

          <div>
            <label className="block text-sm font-medium text-[#2D2D2D] mb-1">
              Event / Spot Name
            </label>
            <input
              type="text"
              name="name"
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#FF6B6B] focus:ring-1 focus:ring-[#FF6B6B]"
              placeholder="e.g. Birrarung Marr Playground"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#2D2D2D] mb-1">
              Type
            </label>
            <select
              name="type"
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#FF6B6B] focus:ring-1 focus:ring-[#FF6B6B] bg-white"
            >
              <option value="">Select a type</option>
              <option value="kids">Kids & Family</option>
              <option value="food">Food & Drink</option>
              <option value="markets">Markets</option>
              <option value="music">Music & Arts</option>
              <option value="workshops">Workshops</option>
              <option value="sports">Sports & Outdoors</option>
              <option value="community">Community</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#2D2D2D] mb-1">
              Suburb
            </label>
            <input
              type="text"
              name="suburb"
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#FF6B6B] focus:ring-1 focus:ring-[#FF6B6B]"
              placeholder="e.g. Southbank"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#2D2D2D] mb-1">
              Description
            </label>
            <textarea
              name="description"
              rows={4}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#FF6B6B] focus:ring-1 focus:ring-[#FF6B6B] resize-none"
              placeholder="Tell us about this spot..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#2D2D2D] mb-1">
              Contact Email
            </label>
            <input
              type="email"
              name="email"
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#FF6B6B] focus:ring-1 focus:ring-[#FF6B6B]"
              placeholder="you@example.com"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-[#FF6B6B] text-white py-3 rounded-xl font-bold text-sm hover:bg-[#e55a5a] transition-colors"
          >
            Submit Listing →
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">Own a business listed on VicBuzz?</p>
          <Link
            href="/claim"
            className="text-sm font-semibold text-[#2D2D2D] hover:text-[#FF6B6B] transition-colors"
          >
            Claim Your Listing →
          </Link>
        </div>
      </div>
    </div>
  );
}
