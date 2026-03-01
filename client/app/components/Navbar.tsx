"use client";

import { useAuth } from "./AuthProvider";
import {
  Command,
  LogOut,
  LayoutDashboard,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

export default function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  useEffect(() => {
    document.body.style.setProperty(
      "--sidebar-width",
      isCollapsed ? "80px" : "260px",
    );
    return () => {
      document.body.style.setProperty("--sidebar-width", "0px");
    };
  }, [isCollapsed]);

  if (!user) return null;

  const NAV_LINKS = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  ];

  const getInitials = (name?: string, email?: string) => {
    if (name) return name.substring(0, 2).toUpperCase();
    if (email) return email.substring(0, 2).toUpperCase();
    return "AA";
  };

  const displayName = user.name || user.email.split("@")[0];

  return (
    <nav
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        bottom: 0,
        width: isCollapsed ? "80px" : "260px",
        zIndex: 50,
        background: "#000000",
        borderRight: "1px solid var(--color-border)",
        display: "flex",
        flexDirection: "column",
        transition: "width 0.3s ease",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: isCollapsed ? "center" : "space-between",
          padding: isCollapsed ? "24px 0" : "24px",
          height: "80px",
          borderBottom: "1px solid var(--color-border)",
        }}
      >
        <Link
          href="/dashboard"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            textDecoration: "none",
            color: "var(--color-text-primary)",
            overflow: "hidden",
            whiteSpace: "nowrap",
          }}
          title="AutoAudit Dashboard"
        >
          <div
            style={{
              minWidth: "32px",
              height: "32px",
              borderRadius: "8px",
              background: "#ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Command size={18} color="black" />
          </div>
          {!isCollapsed && (
            <span
              style={{
                fontSize: "16px",
                fontWeight: 700,
                letterSpacing: "-0.02em",
              }}
            >
              AutoAudit
            </span>
          )}
        </Link>

        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          style={{
            background: "none",
            border: "none",
            color: "var(--color-text-muted)",
            cursor: "pointer",
            display: isCollapsed ? "none" : "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "4px",
            borderRadius: "6px",
            transition: "all 0.2s",
          }}
          className="hover:bg-zinc-900 hover:text-white"
        >
          <ChevronLeft size={18} />
        </button>
      </div>

      {isCollapsed && (
        <button
          onClick={() => setIsCollapsed(false)}
          style={{
            position: "absolute",
            top: "24px",
            right: "-12px",
            background: "#000",
            border: "1px solid var(--color-border)",
            color: "var(--color-text-muted)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "4px",
            borderRadius: "50%",
            zIndex: 60,
          }}
        >
          <ChevronRight size={14} />
        </button>
      )}

      <div
        style={{
          flex: 1,
          padding: "24px 12px",
          display: "flex",
          flexDirection: "column",
          gap: "8px",
          overflowY: "auto",
          overflowX: "hidden",
        }}
      >
        {NAV_LINKS.map((link) => {
          const isActive = pathname.startsWith(link.href);
          return (
            <Link
              key={link.name}
              href={link.href}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: isCollapsed ? "center" : "flex-start",
                gap: "12px",
                padding: isCollapsed ? "12px 0" : "10px 12px",
                borderRadius: "8px",
                color: isActive ? "#ffffff" : "var(--color-text-secondary)",
                background: isActive
                  ? "rgba(255,255,255, 0.05)"
                  : "transparent",
                textDecoration: "none",
                fontSize: "14px",
                fontWeight: 500,
                transition: "all 0.2s",
                whiteSpace: "nowrap",
              }}
              className="hover:bg-white/5 hover:text-white"
              title={isCollapsed ? link.name : undefined}
            >
              <link.icon
                size={18}
                color={isActive ? "white" : "currentColor"}
                style={{ minWidth: "18px" }}
              />
              {!isCollapsed && <span>{link.name}</span>}
            </Link>
          );
        })}
      </div>

      <div
        style={{
          padding: "12px",
          borderTop: "1px solid var(--color-border)",
          position: "relative",
        }}
      >
        {showProfileMenu && (
          <div
            style={{
              position: "absolute",
              bottom: "70px",
              left: "12px",
              right: isCollapsed ? "auto" : "12px",
              width: isCollapsed ? "160px" : "auto",
              background: "#0a0a0a",
              border: "1px solid var(--color-border)",
              borderRadius: "10px",
              padding: "6px",
              boxShadow: "0 10px 30px rgba(0,0,0,0.8)",
              zIndex: 100,
            }}
          >
            <button
              onClick={() => {
                setShowProfileMenu(false);
                logout();
              }}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                background: "transparent",
                border: "none",
                color: "var(--color-danger)",
                padding: "8px",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "13px",
                fontWeight: 500,
                textAlign: "left",
              }}
              className="hover:bg-white/5"
            >
              <LogOut size={14} />
              Sign Out
            </button>
          </div>
        )}

        <button
          onClick={() => setShowProfileMenu(!showProfileMenu)}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: isCollapsed ? "center" : "flex-start",
            gap: "10px",
            background: showProfileMenu
              ? "rgba(255,255,255,0.05)"
              : "transparent",
            border: "none",
            padding: isCollapsed ? "8px 0" : "8px 10px",
            borderRadius: "8px",
            cursor: "pointer",
            transition: "background 0.2s",
          }}
          className="hover:bg-white/5"
        >
          {user.picture ? (
            <img
              src={user.picture}
              alt={displayName}
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                objectFit: "cover",
                minWidth: "36px",
              }}
            />
          ) : (
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                background: "#ffffff",
                color: "black",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "14px",
                fontWeight: 600,
                minWidth: "36px",
              }}
            >
              {getInitials(user.name, user.email)}
            </div>
          )}

          {!isCollapsed && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                overflow: "hidden",
              }}
            >
              <span
                style={{
                  fontSize: "14px",
                  fontWeight: 600,
                  color: "var(--color-text-primary)",
                  whiteSpace: "nowrap",
                  textOverflow: "ellipsis",
                  overflow: "hidden",
                  maxWidth: "160px",
                }}
              >
                {displayName}
              </span>
              <span
                style={{
                  fontSize: "12px",
                  color: "var(--color-text-muted)",
                  whiteSpace: "nowrap",
                  textOverflow: "ellipsis",
                  overflow: "hidden",
                  maxWidth: "160px",
                }}
              >
                {user.email}
              </span>
            </div>
          )}
        </button>
      </div>

      {showProfileMenu && (
        <div
          style={{ position: "fixed", inset: 0, zIndex: 90 }}
          onClick={() => setShowProfileMenu(false)}
        />
      )}
    </nav>
  );
}
