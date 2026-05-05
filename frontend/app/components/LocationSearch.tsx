"use client";

import { useState, useRef, FormEvent } from "react";

interface Props {
  onSearch: (location: string) => void;
  onGeoLocate: () => void;
  isLoading: boolean;
  isGeoLoading: boolean;
}

const HINTS = ["Tokyo", "10001", "40.7128,-74.0060", "Eiffel Tower", "EC1A 1BB", "Sydney"];

export default function LocationSearch({ onSearch, onGeoLocate, isLoading, isGeoLoading }: Props) {
  const [query, setQuery] = useState("");
  const [hintIdx, setHintIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) { inputRef.current?.focus(); return; }
    onSearch(q);
  };

  return (
    <div className="w-full flex flex-col gap-3">
      {/* Search row */}
      <form onSubmit={handleSubmit} className="flex w-full" aria-label="Weather location search">
        {/* Input wrapper */}
        <div className="relative flex-1 min-w-0">
          <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}
              strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-sky-400">
              <path d="M21 10c0 6.627-9 13-9 13S3 16.627 3 10a9 9 0 1 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
          </span>
          <input
            ref={inputRef}
            id="location-input"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Tab" && !query) {
                e.preventDefault();
                const next = (hintIdx + 1) % HINTS.length;
                setHintIdx(next);
                setQuery(HINTS[next]);
              }
            }}
            placeholder={`Try "${HINTS[hintIdx]}"`}
            autoComplete="off"
            spellCheck={false}
            disabled={isLoading || isGeoLoading}
            style={{
              width: "100%",
              height: 52,
              paddingLeft: 36,
              paddingRight: 16,
              borderRadius: "12px 0 0 12px",
              background: "rgba(255,255,255,0.07)",
              border: "1px solid rgba(255,255,255,0.14)",
              borderRight: "none",
              color: "white",
              fontSize: 15,
              fontWeight: 500,
              outline: "none",
              transition: "background 0.2s, border-color 0.2s",
            }}
            onFocus={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.11)";
              e.currentTarget.style.borderColor = "rgba(56,189,248,0.5)";
            }}
            onBlur={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.07)";
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.14)";
            }}
          />
        </div>

        {/* Search button */}
        <button
          id="search-button"
          type="submit"
          disabled={isLoading || isGeoLoading}
          style={{
            height: 52,
            padding: "0 24px",
            borderRadius: "0 12px 12px 0",
            background: "linear-gradient(135deg, #0ea5e9, #3b82f6)",
            border: "none",
            color: "white",
            fontWeight: 600,
            fontSize: 14,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 6,
            whiteSpace: "nowrap",
            transition: "opacity 0.2s, transform 0.1s",
            opacity: isLoading || isGeoLoading ? 0.6 : 1,
          }}
          onMouseOver={(e) => { if (!isLoading && !isGeoLoading) e.currentTarget.style.opacity = "0.85"; }}
          onMouseOut={(e) => { if (!isLoading && !isGeoLoading) e.currentTarget.style.opacity = "1"; }}
          onMouseDown={(e) => { e.currentTarget.style.transform = "scale(0.97)"; }}
          onMouseUp={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
        >
          {isLoading ? (
            <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="3" strokeOpacity="0.3" />
              <path d="M12 2a10 10 0 0 1 10 10" stroke="white" strokeWidth="3" strokeLinecap="round" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2}
              strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
          )}
          {isLoading ? "Searching…" : "Search"}
        </button>
      </form>

      {/* Use My Location button */}
      <button
        id="geolocate-button"
        type="button"
        onClick={onGeoLocate}
        disabled={isLoading || isGeoLoading}
        style={{
          width: "100%",
          height: 44,
          borderRadius: 12,
          background: "rgba(255,255,255,0.05)",
          border: "1px solid rgba(255,255,255,0.12)",
          color: "rgba(255,255,255,0.75)",
          fontWeight: 500,
          fontSize: 14,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          transition: "background 0.2s, border-color 0.2s, opacity 0.2s",
          opacity: isLoading || isGeoLoading ? 0.6 : 1,
        }}
        onMouseOver={(e) => { if (!isLoading && !isGeoLoading) { e.currentTarget.style.background = "rgba(255,255,255,0.09)"; e.currentTarget.style.borderColor = "rgba(56,189,248,0.3)"; } }}
        onMouseOut={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)"; }}
      >
        {isGeoLoading ? (
          <svg className="animate-spin w-4 h-4 text-sky-400" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.3" />
            <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}
            strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-sky-400">
            <circle cx="12" cy="12" r="3" />
            <path d="M12 2v3m0 14v3M2 12h3m14 0h3" />
            <path d="M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z" strokeOpacity="0.4" />
          </svg>
        )}
        <span>{isGeoLoading ? "Detecting location…" : "Use My Current Location"}</span>
      </button>

      {/* Format hints */}
      <p style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", textAlign: "center" }}>
        City · Zip / Postal Code · GPS coordinates · Landmark &nbsp;
        <kbd style={{ padding: "1px 5px", borderRadius: 4, background: "rgba(255,255,255,0.08)", fontFamily: "monospace", fontSize: 10 }}>Tab</kbd>
        {" "}for examples
      </p>
    </div>
  );
}
