"use client";
import { useState, useRef, useEffect, useCallback } from "react";

interface Props {
  suburbs: string[];
  value: string;
  onChange: (suburb: string) => void;
  label?: string;
}

export default function SuburbPicker({ suburbs, value, onChange, label = "All suburbs" }: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});
  const btnRef = useRef<HTMLButtonElement>(null);

  const filtered = query
    ? suburbs.filter(s => s.toLowerCase().includes(query.toLowerCase()))
    : suburbs;

  const display = value === "all" ? `📍 ${label}` : `📍 ${value}`;

  const updatePosition = useCallback(() => {
    if (!btnRef.current) return;
    const rect = btnRef.current.getBoundingClientRect();
    setDropdownStyle({
      position: "fixed",
      top: rect.bottom + 4,
      left: rect.left,
      width: rect.width,
      zIndex: 9999,
    });
  }, []);

  useEffect(() => {
    if (open) updatePosition();
  }, [open, updatePosition]);

  useEffect(() => {
    function handleClose(e: MouseEvent) {
      const target = e.target as Element;
      if (!target.closest("[data-suburb-picker]")) {
        setOpen(false);
        setQuery("");
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClose);
      window.addEventListener("scroll", () => { setOpen(false); setQuery(""); }, { passive: true });
    }
    return () => document.removeEventListener("mousedown", handleClose);
  }, [open]);

  return (
    <div data-suburb-picker className="relative w-full">
      <button
        ref={btnRef}
        onClick={() => { setOpen(!open); if (!open) updatePosition(); }}
        className={`w-full flex items-center justify-between text-sm border rounded-xl px-3 py-2 bg-white transition-all ${
          value !== "all"
            ? "border-[var(--color-primary)] text-[var(--color-text-strong)] font-semibold bg-[var(--color-primary-soft)]"
            : "border-gray-200 text-gray-600"
        }`}
      >
        <span className="truncate">{display}</span>
        <span className="text-gray-400 text-xs ml-2 shrink-0">{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div
          data-suburb-picker
          style={dropdownStyle}
          className="bg-white border border-gray-200 rounded-2xl shadow-2xl overflow-hidden"
        >
          <div className="p-2 border-b border-gray-100">
            <input
              autoFocus
              type="text"
              placeholder="Search suburb..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="w-full text-sm px-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:border-[var(--color-primary)]"
            />
          </div>
          <div className="max-h-60 overflow-y-auto">
            <button
              onClick={() => { onChange("all"); setOpen(false); setQuery(""); }}
              className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                value === "all" ? "font-bold text-[var(--color-text-strong)] bg-[var(--color-primary-soft)]" : "text-gray-700 hover:bg-[var(--color-primary-soft)]"
              }`}
            >
              📍 {label}
            </button>
            {filtered.length === 0 && (
              <p className="px-4 py-3 text-sm text-gray-400 text-center">No suburbs found</p>
            )}
            {filtered.map(s => (
              <button
                key={s}
                onClick={() => { onChange(s); setOpen(false); setQuery(""); }}
                className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                  value === s ? "font-bold text-[var(--color-text-strong)] bg-[var(--color-primary-soft)]" : "text-gray-700 hover:bg-[var(--color-primary-soft)]"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
