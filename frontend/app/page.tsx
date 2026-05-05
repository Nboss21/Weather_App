"use client";

import { useState, useCallback } from "react";
import LocationSearch from "./components/LocationSearch";
import WeatherCard from "./components/WeatherCard";
import ForecastStrip from "./components/ForecastStrip";
import { fetchWeatherByQuery, fetchWeatherByCoords, WeatherResult } from "./lib/weather";

// ── error message mapping ────────────────────────────────────────────────────
function toUserMessage(err: unknown): string {
  const msg = err instanceof Error ? err.message : "UNKNOWN";
  if (msg === "LOCATION_NOT_FOUND")
    return "Location not found. Please check the spelling or try a different format.";
  if (msg === "API_ERROR")
    return "Unable to fetch weather data. Please try again later.";
  return msg;
}

// ── component ────────────────────────────────────────────────────────────────
export default function HomePage() {
  const [result, setResult]           = useState<WeatherResult | null>(null);
  const [isLoading, setIsLoading]     = useState(false);
  const [isGeoLoading, setIsGeoLoading] = useState(false);
  const [error, setError]             = useState<string | null>(null);

  const handleSearch = useCallback(async (query: string) => {
    setIsLoading(true);
    setError(null);
    try {
      setResult(await fetchWeatherByQuery(query));
    } catch (e) {
      setError(toUserMessage(e));
      setResult(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleGeoLocate = useCallback(() => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser. Please search manually.");
      return;
    }
    setIsGeoLoading(true);
    setError(null);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          setResult(await fetchWeatherByCoords(pos.coords.latitude, pos.coords.longitude));
        } catch (e) {
          setError(toUserMessage(e));
          setResult(null);
        } finally {
          setIsGeoLoading(false);
        }
      },
      (err) => {
        setIsGeoLoading(false);
        setError(
          err.code === 1
            ? "Location access denied. Please allow location permission or search manually."
            : "Unable to retrieve your location. Please try searching instead."
        );
      },
      { timeout: 10000 }
    );
  }, []);

  const busy = isLoading || isGeoLoading;

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>

      {/* ── Background ── */}
      <div style={{
        position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none",
        background: "radial-gradient(ellipse 130% 80% at 50% -5%, #1a3a5c 0%, #0b1120 65%)",
      }} />
      <div className="orb" style={{
        position: "fixed", top: -120, left: -100, zIndex: 0, pointerEvents: "none",
        width: 480, height: 480, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(56,189,248,0.22), transparent 70%)",
        filter: "blur(40px)",
      }} />
      <div className="orb2" style={{
        position: "fixed", bottom: -140, right: -80, zIndex: 0, pointerEvents: "none",
        width: 420, height: 420, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(99,102,241,0.2), transparent 70%)",
        filter: "blur(40px)",
      }} />

      {/* ══ MAIN ════════════════════════════════════════════════════════════ */}
      <main style={{
        position: "relative", zIndex: 1, flex: 1,
        display: "flex", flexDirection: "column", alignItems: "center",
        padding: "36px 16px 48px",
      }}>
        <div style={{ width: "100%", maxWidth: 540, display: "flex", flexDirection: "column", gap: 20 }}>

          {/* ── Search Section ── */}
          <section aria-label="Location search">
            <div className="anim-down" style={{
              borderRadius: 24, padding: 24,
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
              backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)",
              boxShadow: "0 20px 60px rgba(0,0,0,0.35)",
            }}>
              <p style={{
                fontSize: 10, fontWeight: 700, letterSpacing: "0.12em",
                textTransform: "uppercase", color: "rgba(56,189,248,0.7)", marginBottom: 16,
              }}>
                Search Location
              </p>
              <LocationSearch
                onSearch={handleSearch}
                onGeoLocate={handleGeoLocate}
                isLoading={isLoading}
                isGeoLoading={isGeoLoading}
              />
            </div>
          </section>

          {/* ── Error Banner ── */}
          {error && (
            <div className="anim-up" role="alert" style={{
              padding: "14px 16px", borderRadius: 14,
              background: "rgba(239,68,68,0.1)",
              border: "1px solid rgba(239,68,68,0.25)",
              display: "flex", alignItems: "flex-start", gap: 10,
            }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth={1.8}
                strokeLinecap="round" strokeLinejoin="round" width={17} height={17}
                style={{ marginTop: 1, flexShrink: 0 }}>
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <circle cx="12" cy="16" r="0.6" fill="#f87171" />
              </svg>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 13, color: "#fca5a5", lineHeight: 1.5 }}>{error}</p>
                <p style={{ fontSize: 11, color: "rgba(252,165,165,0.6)", marginTop: 4 }}>
                  Try searching again or use a different location format.
                </p>
              </div>
            </div>
          )}

          {/* ── Loading placeholder ── */}
          {busy && (
            <div style={{ display: "flex", justifyContent: "center", padding: "24px 0" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, color: "rgba(255,255,255,0.45)", fontSize: 14 }}>
                <svg className="spin" viewBox="0 0 24 24" fill="none" width={20} height={20}>
                  <circle cx="12" cy="12" r="10" stroke="rgba(56,189,248,0.25)" strokeWidth="3" />
                  <path d="M12 2a10 10 0 0 1 10 10" stroke="#38bdf8" strokeWidth="3" strokeLinecap="round" />
                </svg>
                {isGeoLoading ? "Detecting your location…" : "Fetching weather…"}
              </div>
            </div>
          )}

          {/* ── Severe Weather Alerts ── */}
          {result?.alerts && result.alerts.length > 0 && !busy && (
            <section aria-label="Weather Alerts" className="anim-down">
              <div style={{
                borderRadius: 16, padding: "16px 20px",
                background: "rgba(220,38,38,0.15)",
                border: "1px solid rgba(220,38,38,0.4)",
                display: "flex", flexDirection: "column", gap: 8,
                animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite"
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 20 }}>⚠️</span>
                  <h3 style={{ fontSize: 14, fontWeight: 700, color: "#fca5a5", margin: 0, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    Severe Weather Alert
                  </h3>
                </div>
                {result.alerts.map((a, i) => (
                  <div key={i} style={{ paddingLeft: 28 }}>
                    <p style={{ fontSize: 13, color: "white", fontWeight: 600, margin: "0 0 4px" }}>{a.event}</p>
                    <p style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", margin: 0 }}>{a.headline}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ── Current Weather ── */}
          {result && !busy && (
            <section aria-label="Current weather" className="anim-up">
              <WeatherCard weather={result.current} />
            </section>
          )}

          {/* ── 5-Day Forecast ── */}
          {result && !busy && (
            <section aria-label="5-day forecast" className="anim-up2">
              <div style={{
                borderRadius: 24, padding: 24,
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.09)",
                backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
              }}>
                <ForecastStrip days={result.forecast} />
              </div>
            </section>
          )}

          {/* ── Empty state hints ── */}
          {!result && !busy && !error && (
            <div className="anim-up2" style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 8, paddingTop: 4 }}>
              {[["City", "Tokyo"], ["Zip", "90210"], ["Postal", "EC1A 1BB"], ["GPS", "40.71,−74.00"], ["Landmark", "Big Ben"]].map(([label, ex]) => (
                <div key={label} style={{
                  padding: "5px 12px", borderRadius: 999, fontSize: 11,
                  background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)",
                  display: "flex", gap: 6, alignItems: "center",
                }}>
                  <span style={{ color: "rgba(255,255,255,0.35)" }}>{label}</span>
                  <span style={{ color: "rgba(255,255,255,0.18)" }}>·</span>
                  <span style={{ color: "rgba(255,255,255,0.6)", fontFamily: "monospace" }}>{ex}</span>
                </div>
              ))}
            </div>
          )}

        </div>
      </main>

      {/* ══ FOOTER ══════════════════════════════════════════════════════════ */}
      <footer style={{
        position: "relative", zIndex: 1,
        borderTop: "1px solid rgba(255,255,255,0.06)",
        padding: "14px 24px",
        display: "flex", alignItems: "center", justifyContent: "center",
        gap: 6,
      }}>
        <svg viewBox="0 0 64 64" fill="none" width={14} height={14}>
          <circle cx="38" cy="22" r="10" fill="#fbbf24" opacity="0.7" />
          <path d="M14 42a10 10 0 0 1 0-20h1a14 14 0 0 1 27.4-3A8 8 0 1 1 50 42H14z" fill="white" opacity="0.5" />
        </svg>
        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.2)" }}>
          Skycast · Powered by{" "}
          <a href="https://open-meteo.com" target="_blank" rel="noreferrer"
            style={{ color: "rgba(56,189,248,0.5)", textDecoration: "none" }}>
            Open-Meteo
          </a>
        </span>
      </footer>

    </div>
  );
}
