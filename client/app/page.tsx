"use client";

import { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import AuthModal from "./components/AuthModal";
import { Command } from "lucide-react";

function HomeContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const authParam = searchParams.get("auth");
  const isAuthOpen = authParam === "login" || authParam === "signup";
  const authMode: "login" | "signup" = authParam === "signup" ? "signup" : "login";

  const handleClose = () => {
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.delete("auth");
    const newPath =
      window.location.pathname +
      (newParams.toString() ? `?${newParams.toString()}` : "");
    router.replace(newPath);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#000",
        color: "#fff",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        fontFamily: "inherit",
      }}
    >
      <nav
        style={{
          width: "100%",
          maxWidth: "1000px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "20px 24px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
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
          <span
            style={{
              fontWeight: 600,
              fontSize: "18px",
              letterSpacing: "-0.02em",
            }}
          >
            AutoAudit
          </span>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "24px",
            fontSize: "14px",
          }}
        >
          <button
            onClick={() => router.push("/dashboard")}
            style={{
              backgroundColor: "#fff",
              color: "#000",
              border: "none",
              cursor: "pointer",
              padding: "8px 16px",
              borderRadius: "6px",
              fontWeight: 500,
              transition: "background-color 0.2s",
            }}
            className="hover:bg-gray-200"
          >
            Get Started
          </button>
        </div>
      </nav>

      <main
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          padding: "60px 24px",
          width: "100%",
          maxWidth: "800px",
          zIndex: 10,
          position: "relative",
        }}
      >
        <h1
          style={{
            fontSize: "clamp(48px, 8vw, 84px)",
            fontWeight: 700,
            letterSpacing: "-0.04em",
            lineHeight: 1.05,
            marginBottom: "24px",
          }}
        >
          White-Glove AI for
          <br />
          <span style={{ color: "#555" }}>Compliance Audits</span>
        </h1>

        <p
          style={{
            color: "#888",
            fontSize: "clamp(16px, 2vw, 20px)",
            lineHeight: 1.6,
            maxWidth: "600px",
            marginBottom: "40px",
          }}
        >
          Upload your company&apos;s reference documents and industry
          questionnaires. Our AI agents automate the audit matching process with
          verified citations and zero hallucination.
        </p>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            marginBottom: "80px",
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          <button
            onClick={() => router.push("/dashboard")}
            style={{
              backgroundColor: "#fff",
              color: "#000",
              border: "none",
              cursor: "pointer",
              padding: "12px 24px",
              borderRadius: "8px",
              fontWeight: 500,
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
            }}
            className="hover:bg-gray-200 transition-colors"
          >
            Start Auditing <span style={{ fontSize: "18px" }}>→</span>
          </button>
        </div>
      </main>

      <div
        style={{
          position: "fixed",
          top: "20%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "80vw",
          height: "60vh",
          background:
            "radial-gradient(circle, rgba(255,255,255,0.03) 0%, transparent 60%)",
          zIndex: 0,
          pointerEvents: "none",
        }}
      ></div>

      {isAuthOpen && (
        <AuthModal
          isOpen={isAuthOpen}
          onClose={handleClose}
          defaultMode={authMode}
        />
      )}
    </div>
  );
}

export default function Home() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            minHeight: "100vh",
            backgroundColor: "#000",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div className="spinner"></div>
        </div>
      }
    >
      <HomeContent />
    </Suspense>
  );
}
