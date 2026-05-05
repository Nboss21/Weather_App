"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import WeatherMap from "../components/WeatherMap";
import { API_URL } from "../lib/api";

// ─── Types ────────────────────────────────────────────────────────────────────
interface WeatherRecord {
  id: number;
  locationQuery: string;
  locationName: string;
  latitude: number;
  longitude: number;
  startDate: string;
  endDate: string;
  weatherData: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

interface RecordDetail extends WeatherRecord {
  weatherData: any; // parsed when fetching detail
  context: {
    wikipediaSummary: string;
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric", month: "short", day: "numeric",
  });
}

function getWeatherEmoji(weatherData: string) {
  try {
    const d = JSON.parse(weatherData);
    const code = d?.current?.weather_code ?? d?.daily?.weather_code?.[0];
    if (code === 0) return "☀️";
    if (code <= 3) return "🌤️";
    if (code <= 48) return "🌫️";
    if (code <= 67) return "🌧️";
    if (code <= 77) return "❄️";
    if (code <= 82) return "🌦️";
    return "⛈️";
  } catch { return "🌡️"; }
}

function getAvgTemp(weatherData: string) {
  try {
    const d = JSON.parse(weatherData);
    const maxArr: number[] = d?.daily?.temperature_2m_max ?? [];
    const minArr: number[] = d?.daily?.temperature_2m_min ?? [];
    if (!maxArr.length) return null;
    const avg = maxArr.reduce((a, b) => a + b, 0) / maxArr.length;
    const avgMin = minArr.reduce((a, b) => a + b, 0) / minArr.length;
    return { high: Math.round(avg), low: Math.round(avgMin) };
  } catch { return null; }
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const glass = {
  background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.1)",
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  borderRadius: 20,
};

const btn = (color: string, bg: string) => ({
  padding: "7px 14px", borderRadius: 8, border: "none", cursor: "pointer",
  fontSize: 12, fontWeight: 600, color, background: bg, transition: "opacity 0.2s",
  letterSpacing: "0.02em",
});

// ─── Component ────────────────────────────────────────────────────────────────
export default function HistoryPage() {
  const [records, setRecords] = useState<WeatherRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Detail / Wikipedia modal
  const [detail, setDetail] = useState<RecordDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Edit modal
  const [editRecord, setEditRecord] = useState<WeatherRecord | null>(null);
  const [editNotes, setEditNotes] = useState("");
  const [editStartDate, setEditStartDate] = useState("");
  const [editEndDate, setEditEndDate] = useState("");
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  // Delete confirmation
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  // ── Fetch all records ────────────────────────────────────────────────────────
  const loadRecords = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("skycast_token");
      const res = await fetch(`${API_URL}/records`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      if (res.status === 401 || res.status === 403) throw new Error("Unauthorized: Please log in.");
      if (!res.ok) throw new Error("Failed to load records");
      const data = await res.json();
      setRecords(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("skycast_token");
    if (!token) {
      router.push("/auth?redirect=/history");
    } else {
      loadRecords();
    }
  }, [loadRecords, router]);

  // ── Fetch single record (with Wikipedia) ─────────────────────────────────────
  const openDetail = async (id: number) => {
    setDetailLoading(true);
    try {
      const token = localStorage.getItem("skycast_token");
      const res = await fetch(`${API_URL}/records/${id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      if (!res.ok) throw new Error("Failed to fetch record detail");
      const data = await res.json();
      setDetail(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setDetailLoading(false);
    }
  };

  // ── Open edit modal ──────────────────────────────────────────────────────────
  const openEdit = (r: WeatherRecord) => {
    setEditRecord(r);
    setEditNotes(r.notes ?? "");
    setEditStartDate(r.startDate);
    setEditEndDate(r.endDate);
    setEditError(null);
  };

  // ── Save update ──────────────────────────────────────────────────────────────
  const saveEdit = async () => {
    if (!editRecord) return;
    if (new Date(editStartDate) > new Date(editEndDate)) {
      setEditError("Start date cannot be after end date.");
      return;
    }
    setEditSaving(true);
    setEditError(null);
    try {
      const token = localStorage.getItem("skycast_token");
      const res = await fetch(`${API_URL}/records/${editRecord.id}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          notes: editNotes,
          startDate: editStartDate,
          endDate: editEndDate,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Update failed");
      setEditRecord(null);
      loadRecords();
    } catch (e) {
      setEditError(e instanceof Error ? e.message : "Update failed");
    } finally {
      setEditSaving(false);
    }
  };

  // ── Delete ──────────────────────────────────────────────────────────────────
  const confirmDelete = async () => {
    if (deleteId == null) return;
    setDeleting(true);
    try {
      const token = localStorage.getItem("skycast_token");
      const res = await fetch(`${API_URL}/records/${deleteId}`, { 
        method: "DELETE",
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      if (!res.ok) throw new Error("Delete failed");
      setDeleteId(null);
      loadRecords();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Delete failed");
      setDeleteId(null);
    } finally {
      setDeleting(false);
    }
  };

  // ── Export ──────────────────────────────────────────────────────────────────
  const exportData = async (format: string) => {
    try {
      const token = localStorage.getItem("skycast_token");
      const res = await fetch(`${API_URL}/export/${format}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `weather_records.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (e) {
      setError("Failed to download export");
    }
  };

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: "100vh", position: "relative" }}>
      {/* Background */}
      <div style={{
        position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none",
        background: "radial-gradient(ellipse 130% 80% at 50% -5%, #1a3a5c 0%, #0b1120 65%)",
      }} />
      <div style={{
        position: "fixed", top: -120, left: -100, zIndex: 0, pointerEvents: "none",
        width: 480, height: 480, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(56,189,248,0.18), transparent 70%)",
        filter: "blur(40px)",
      }} />
      <div style={{
        position: "fixed", bottom: -140, right: -80, zIndex: 0, pointerEvents: "none",
        width: 420, height: 420, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(99,102,241,0.16), transparent 70%)",
        filter: "blur(40px)",
      }} />

      <main style={{ position: "relative", zIndex: 1, padding: "32px 16px 64px", maxWidth: 800, margin: "0 auto" }}>
        {/* Page title */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: "white", margin: 0 }}>
            Weather{" "}
            <span style={{
              background: "linear-gradient(90deg,#38bdf8,#818cf8)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            }}>History</span>
          </h1>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginTop: 6 }}>
            All saved weather queries — view, update, delete, or export.
          </p>
        </div>

        {/* ── Export Bar ──────────────────────────────────────────────────────── */}
        <div style={{ ...glass, padding: "16px 20px", marginBottom: 24, display: "flex", flexWrap: "wrap", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.5)", letterSpacing: "0.08em", textTransform: "uppercase", marginRight: 4 }}>
            Export All:
          </span>
          {[["JSON", "#22c55e", "rgba(34,197,94,0.15)"], ["CSV", "#3b82f6", "rgba(59,130,246,0.15)"], ["XML", "#f59e0b", "rgba(245,158,11,0.15)"], ["Markdown", "#a78bfa", "rgba(167,139,250,0.15)"]].map(([label, color, bg]) => (
            <button key={label} onClick={() => exportData(label.toLowerCase())}
              style={{ ...btn(color, bg), border: `1px solid ${color}40` }}>
              ↓ {label}
            </button>
          ))}
          <button onClick={loadRecords} style={{ ...btn("rgba(255,255,255,0.7)", "rgba(255,255,255,0.07)"), marginLeft: "auto", border: "1px solid rgba(255,255,255,0.1)" }}>
            ↺ Refresh
          </button>
        </div>

        {/* ── Error ───────────────────────────────────────────────────────────── */}
        {error && (
          <div style={{ padding: "12px 16px", borderRadius: 12, marginBottom: 20, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)", color: "#fca5a5", fontSize: 13 }}>
            ⚠️ {error}
          </div>
        )}

        {/* ── Loading ─────────────────────────────────────────────────────────── */}
        {loading && (
          <div style={{ textAlign: "center", padding: "60px 0", color: "rgba(255,255,255,0.4)", fontSize: 14 }}>
            Loading records…
          </div>
        )}

        {/* ── Empty State ─────────────────────────────────────────────────────── */}
        {!loading && records.length === 0 && !error && (
          <div style={{ ...glass, padding: 40, textAlign: "center" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>
            <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 14 }}>No weather records yet.</p>
            <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 12, marginTop: 4 }}>
              Search for a location on the home page to get started.
            </p>
          </div>
        )}

        {/* ── Records List ────────────────────────────────────────────────────── */}
        {!loading && records.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {records.map(r => {
              const temps = getAvgTemp(r.weatherData);
              const emoji = getWeatherEmoji(r.weatherData);
              return (
                <div key={r.id} style={{ ...glass, padding: "18px 20px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
                    {/* Emoji + location */}
                    <div style={{ fontSize: 32, flexShrink: 0 }}>{emoji}</div>
                    <div style={{ flex: 1, minWidth: 180 }}>
                      <div style={{ fontWeight: 700, fontSize: 15, color: "white" }}>
                        {r.locationName}
                      </div>
                      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>
                        Query: <span style={{ color: "rgba(255,255,255,0.6)" }}>{r.locationQuery}</span>
                        {" · "}
                        {fmtDate(r.startDate)} → {fmtDate(r.endDate)}
                      </div>
                      {r.notes && (
                        <div style={{ fontSize: 11, color: "rgba(167,139,250,0.7)", marginTop: 4, fontStyle: "italic" }}>
                          📝 {r.notes}
                        </div>
                      )}
                    </div>

                    {/* Temp summary */}
                    {temps && (
                      <div style={{ textAlign: "center", flexShrink: 0 }}>
                        <div style={{ fontSize: 18, fontWeight: 800, color: "#38bdf8" }}>{temps.high}°</div>
                        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>{temps.low}° lo</div>
                      </div>
                    )}

                    {/* Action buttons */}
                    <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                      <button
                        onClick={() => openDetail(r.id)}
                        title="View Wikipedia context"
                        style={{ ...btn("#38bdf8", "rgba(56,189,248,0.1)"), border: "1px solid rgba(56,189,248,0.25)" }}>
                        🌐 Detail
                      </button>
                      <button
                        onClick={() => openEdit(r)}
                        title="Edit record"
                        style={{ ...btn("#a78bfa", "rgba(167,139,250,0.1)"), border: "1px solid rgba(167,139,250,0.25)" }}>
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => setDeleteId(r.id)}
                        title="Delete record"
                        style={{ ...btn("#f87171", "rgba(239,68,68,0.1)"), border: "1px solid rgba(239,68,68,0.25)" }}>
                        🗑 Delete
                      </button>
                    </div>
                  </div>

                  <div style={{ marginTop: 10, fontSize: 10, color: "rgba(255,255,255,0.2)" }}>
                    Saved {new Date(r.createdAt).toLocaleString()} · ID #{r.id} · {r.latitude.toFixed(3)}, {r.longitude.toFixed(3)}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* ════ DETAIL MODAL ════════════════════════════════════════════════════ */}
      {(detailLoading || detail) && (
        <div onClick={() => { setDetail(null); }} style={{
          position: "fixed", inset: 0, zIndex: 50,
          background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)",
          display: "flex", alignItems: "center", justifyContent: "center", padding: 16,
        }}>
          <div onClick={e => e.stopPropagation()} style={{
            ...glass, maxWidth: 560, width: "100%", padding: 28,
            maxHeight: "85vh", overflowY: "auto",
          }}>
            {detailLoading ? (
              <div style={{ textAlign: "center", padding: "40px 0", color: "rgba(255,255,255,0.5)" }}>Loading…</div>
            ) : detail ? (
              <>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18 }}>
                  <h2 style={{ fontSize: 18, fontWeight: 800, color: "white", margin: 0 }}>
                    {detail.locationName}
                  </h2>
                  <button onClick={() => setDetail(null)} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.5)", fontSize: 20, cursor: "pointer", padding: 0 }}>✕</button>
                </div>

                {/* Wikipedia Summary */}
                <div style={{ background: "rgba(56,189,248,0.07)", border: "1px solid rgba(56,189,248,0.2)", borderRadius: 12, padding: 14, marginBottom: 18 }}>
                  <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(56,189,248,0.6)", marginBottom: 8 }}>
                    Wikipedia
                  </p>
                  <p style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", lineHeight: 1.65, margin: 0 }}>
                    {detail.context?.wikipediaSummary || "No Wikipedia summary available for this location."}
                  </p>
                </div>

                {/* Current conditions */}
                {detail.weatherData?.current && (
                  <div style={{ marginBottom: 16 }}>
                    <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)", marginBottom: 10 }}>Current Conditions</p>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                      {[
                        ["🌡️ Temperature", `${Math.round(detail.weatherData.current.temperature_2m)}°C`],
                        ["🤔 Feels Like", `${Math.round(detail.weatherData.current.apparent_temperature)}°C`],
                        ["💧 Humidity", `${detail.weatherData.current.relative_humidity_2m}%`],
                        ["💨 Wind", `${Math.round(detail.weatherData.current.wind_speed_10m)} km/h`],
                      ].map(([label, val]) => (
                        <div key={label} style={{ background: "rgba(255,255,255,0.04)", borderRadius: 10, padding: "10px 14px" }}>
                          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>{label}</div>
                          <div style={{ fontSize: 16, fontWeight: 700, color: "white", marginTop: 2 }}>{val}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Date range */}
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", borderTop: "1px solid rgba(255,255,255,0.07)", paddingTop: 12 }}>
                  📅 {fmtDate(detail.startDate)} → {fmtDate(detail.endDate)} · 
                  🗺️ {detail.latitude.toFixed(4)}, {detail.longitude.toFixed(4)}
                  {detail.notes && (
                    <div style={{ marginTop: 6, color: "rgba(167,139,250,0.6)", fontStyle: "italic" }}>
                      📝 {detail.notes}
                    </div>
                  )}
                </div>

                {/* Map Integration */}
                <div style={{ marginTop: 20 }}>
                   <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)", marginBottom: 10 }}>Location Map</p>
                   <WeatherMap latitude={detail.latitude} longitude={detail.longitude} locationName={detail.locationName} />
                </div>
              </>
            ) : null}
          </div>
        </div>
      )}

      {/* ════ EDIT MODAL ══════════════════════════════════════════════════════ */}
      {editRecord && (
        <div onClick={() => setEditRecord(null)} style={{
          position: "fixed", inset: 0, zIndex: 50,
          background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)",
          display: "flex", alignItems: "center", justifyContent: "center", padding: 16,
        }}>
          <div onClick={e => e.stopPropagation()} style={{ ...glass, maxWidth: 440, width: "100%", padding: 28 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h2 style={{ fontSize: 17, fontWeight: 800, color: "white", margin: 0 }}>Edit Record</h2>
              <button onClick={() => setEditRecord(null)} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.5)", fontSize: 20, cursor: "pointer" }}>✕</button>
            </div>

            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 18 }}>
              <strong style={{ color: "rgba(255,255,255,0.7)" }}>{editRecord.locationName}</strong> · ID #{editRecord.id}
            </p>

            <label style={labelStyle}>Start Date</label>
            <input type="date" value={editStartDate} onChange={e => setEditStartDate(e.target.value)} style={inputStyle} />

            <label style={labelStyle}>End Date</label>
            <input type="date" value={editEndDate} onChange={e => setEditEndDate(e.target.value)} style={inputStyle} />

            <label style={labelStyle}>Notes</label>
            <textarea
              value={editNotes}
              onChange={e => setEditNotes(e.target.value)}
              rows={3}
              placeholder="Optional notes…"
              style={{ ...inputStyle, resize: "vertical", height: "auto" }}
            />

            {editError && (
              <div style={{ fontSize: 12, color: "#f87171", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)", borderRadius: 8, padding: "8px 12px", marginBottom: 14 }}>
                ⚠️ {editError}
              </div>
            )}

            <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
              <button
                onClick={saveEdit}
                disabled={editSaving}
                style={{ ...btn("white", "rgba(56,189,248,0.2)"), border: "1px solid rgba(56,189,248,0.3)", flex: 1, padding: "10px 0", fontSize: 13, opacity: editSaving ? 0.6 : 1 }}>
                {editSaving ? "Saving…" : "Save Changes"}
              </button>
              <button onClick={() => setEditRecord(null)} style={{ ...btn("rgba(255,255,255,0.6)", "rgba(255,255,255,0.07)"), border: "1px solid rgba(255,255,255,0.1)", padding: "10px 16px" }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ════ DELETE CONFIRM MODAL ════════════════════════════════════════════ */}
      {deleteId != null && (
        <div onClick={() => setDeleteId(null)} style={{
          position: "fixed", inset: 0, zIndex: 50,
          background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)",
          display: "flex", alignItems: "center", justifyContent: "center", padding: 16,
        }}>
          <div onClick={e => e.stopPropagation()} style={{ ...glass, maxWidth: 360, width: "100%", padding: 28, textAlign: "center" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🗑️</div>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: "white", margin: "0 0 8px" }}>Delete Record?</h2>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", marginBottom: 22 }}>
              This action cannot be undone. Record #{deleteId} will be permanently removed.
            </p>
            <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
              <button
                onClick={confirmDelete}
                disabled={deleting}
                style={{ ...btn("white", "rgba(239,68,68,0.25)"), border: "1px solid rgba(239,68,68,0.4)", padding: "10px 24px", opacity: deleting ? 0.6 : 1 }}>
                {deleting ? "Deleting…" : "Yes, Delete"}
              </button>
              <button onClick={() => setDeleteId(null)} style={{ ...btn("rgba(255,255,255,0.7)", "rgba(255,255,255,0.07)"), border: "1px solid rgba(255,255,255,0.1)", padding: "10px 24px" }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Form field styles ────────────────────────────────────────────────────────
const labelStyle: React.CSSProperties = {
  display: "block", fontSize: 11, fontWeight: 600,
  color: "rgba(255,255,255,0.45)", letterSpacing: "0.06em",
  textTransform: "uppercase", marginBottom: 6, marginTop: 14,
};

const inputStyle: React.CSSProperties = {
  width: "100%", boxSizing: "border-box",
  padding: "10px 14px", borderRadius: 10,
  background: "rgba(255,255,255,0.07)",
  border: "1px solid rgba(255,255,255,0.12)",
  color: "white", fontSize: 14,
  outline: "none",
};
