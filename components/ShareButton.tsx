"use client";

import { useState } from "react";

export default function ShareButton({
  title,
  text,
  url,
}: {
  title: string;
  text?: string;
  url: string;
}) {
  const [showToast, setShowToast] = useState(false);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
      } catch {}
    } else {
      await navigator.clipboard.writeText(url);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);
    }
  };

  return (
    <>
      <button
        onClick={(e) => {
          e.stopPropagation();
          handleShare();
        }}
        className="text-lg min-w-[32px] min-h-[32px] flex items-center justify-center"
        aria-label="Share"
        title="Share"
      >
        📤
      </button>
      {showToast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-[#2D2D2D] text-white text-sm font-medium px-4 py-2 rounded-xl shadow-lg z-[9999] animate-pulse">
          Link copied! ✓
        </div>
      )}
    </>
  );
}
