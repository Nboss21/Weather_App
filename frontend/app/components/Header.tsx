"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<{name: string} | null>(null);

  useEffect(() => {
    const checkAuth = () => {
      const u = localStorage.getItem("skycast_user");
      if (u) setUser(JSON.parse(u));
      else setUser(null);
    };
    checkAuth();
    window.addEventListener("auth-change", checkAuth);
    return () => window.removeEventListener("auth-change", checkAuth);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("skycast_token");
    localStorage.removeItem("skycast_user");
    window.dispatchEvent(new Event("auth-change"));
    router.push("/auth");
  };

  return (
    <header style={{
      position: "relative", zIndex: 10,
      borderBottom: "1px solid rgba(255,255,255,0.07)",
      background: "rgba(11,17,32,0.6)",
      backdropFilter: "blur(16px)",
      WebkitBackdropFilter: "blur(16px)",
      padding: "14px 24px",
      display: "flex", alignItems: "center", justifyContent: "space-between",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          background: "rgba(56,189,248,0.15)",
          border: "1px solid rgba(56,189,248,0.2)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <svg viewBox="0 0 64 64" fill="none" width={22} height={22}>
            <circle cx="38" cy="22" r="10" fill="#fbbf24" />
            <path d="M14 42a10 10 0 0 1 0-20h1a14 14 0 0 1 27.4-3A8 8 0 1 1 50 42H14z" fill="white" opacity="0.92" />
          </svg>
        </div>
        <Link href="/" style={{ textDecoration: "none" }}>
          <span style={{ fontSize: 18, fontWeight: 800, color: "white", letterSpacing: "-0.3px" }}>
            Sky<span style={{
              background: "linear-gradient(90deg,#38bdf8,#818cf8)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            }}>cast</span>
          </span>
        </Link>
      </div>
      
      {/* Navigation */}
      <nav style={{ display: "flex", gap: 20 }}>
        <Link href="/" style={{
          fontSize: 14,
          fontWeight: pathname === "/" ? 600 : 400,
          color: pathname === "/" ? "white" : "rgba(255,255,255,0.6)",
          textDecoration: "none",
          transition: "color 0.2s"
        }}>
          Search
        </Link>
        <Link href="/history" style={{
          fontSize: 14,
          fontWeight: pathname === "/history" ? 600 : 400,
          color: pathname === "/history" ? "white" : "rgba(255,255,255,0.6)",
          textDecoration: "none",
          transition: "color 0.2s"
        }}>
          History
        </Link>
        {user ? (
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginLeft: 16, paddingLeft: 16, borderLeft: "1px solid rgba(255,255,255,0.1)" }}>
            <span style={{ fontSize: 13, color: "rgba(255,255,255,0.8)" }}>{user.name}</span>
            <button onClick={handleLogout} style={{ background: "none", border: "none", color: "#f87171", fontSize: 13, cursor: "pointer", fontWeight: 600 }}>
              Logout
            </button>
          </div>
        ) : (
          <Link href="/auth" style={{
            fontSize: 14, fontWeight: 600, color: "#38bdf8", textDecoration: "none",
            marginLeft: 16, paddingLeft: 16, borderLeft: "1px solid rgba(255,255,255,0.1)"
          }}>
            Login
          </Link>
        )}
      </nav>
    </header>
  );
}
