"use client";

interface Props {
  title: string;
}

export default function ShareButtons({ title }: Props) {
  const url = typeof window !== "undefined" ? window.location.href : "";

  return (
    <div className="mt-8 pt-6 border-t border-gray-200">
      <p className="text-xs font-semibold uppercase tracking-widest text-[#FF6B6B] mb-3">Share this guide</p>
      <div className="flex gap-2 flex-wrap">
        <button onClick={() => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`, "_blank")}
          className="flex items-center gap-1.5 px-4 py-2 bg-[#1A1A2E] text-white rounded-lg text-xs font-semibold hover:bg-[#2D2D2D] transition-colors">
          X Share
        </button>
        <button onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, "_blank")}
          className="flex items-center gap-1.5 px-4 py-2 bg-[#1877F2] text-white rounded-lg text-xs font-semibold hover:bg-[#166fe5] transition-colors">
          f Share
        </button>
        <button onClick={() => navigator.clipboard?.writeText(url)}
          className="flex items-center gap-1.5 px-4 py-2 bg-gray-100 text-[#374151] rounded-lg text-xs font-semibold hover:bg-gray-200 transition-colors">
          📋 Copy link
        </button>
      </div>
    </div>
  );
}
