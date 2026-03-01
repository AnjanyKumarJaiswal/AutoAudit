"use client";

import { useAuth } from "./AuthProvider";
import { Shield, LogOut, LayoutDashboard } from "lucide-react";
import Link from "next/link";

export default function Navbar() {
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <nav
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        background: "rgba(10, 10, 15, 0.8)",
        backdropFilter: "blur(20px)",
        borderBottom: "1px solid var(--color-border)",
        padding: "0 24px",
        height: "64px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <Link
        href="/dashboard"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          textDecoration: "none",
          color: "var(--color-text-primary)",
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: "linear-gradient(135deg, var(--color-accent), #a855f7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Shield size={20} color="white" />
        </div>
        <span style={{ fontSize: 18, fontWeight: 700, letterSpacing: "-0.02em" }}>
          AutoAudit
        </span>
      </Link>

      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        <Link
          href="/dashboard"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            color: "var(--color-text-secondary)",
            textDecoration: "none",
            fontSize: 14,
            fontWeight: 500,
            transition: "color 0.2s",
          }}
        >
          <LayoutDashboard size={16} />
          Dashboard
        </Link>

        <div
          style={{
            width: 1,
            height: 24,
            background: "var(--color-border)",
          }}
        />

        <span style={{ fontSize: 13, color: "var(--color-text-muted)" }}>
          {user.email}
        </span>

        <button
          onClick={logout}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            background: "transparent",
            border: "1px solid var(--color-border)",
            color: "var(--color-text-secondary)",
            padding: "6px 14px",
            borderRadius: 8,
            cursor: "pointer",
            fontSize: 13,
            fontWeight: 500,
            transition: "all 0.2s",
          }}
        >
          <LogOut size={14} />
          Logout
        </button>
      </div>
    </nav>
  );
}
