"use client";

import { useState } from "react";
import { useAuth } from "./AuthProvider";
import { Shield, ArrowRight, X } from "lucide-react";
import { toast } from "sonner";
import { GoogleLogin } from "@react-oauth/google";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: "login" | "signup";
}

export default function AuthModal({
  isOpen,
  onClose,
  defaultMode = "login",
}: AuthModalProps) {
  const { login, signup, loginWithGoogle } = useAuth();
  const [mode, setMode] = useState<"login" | "signup">(defaultMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "login") {
        await login(email, password);
        toast.success("Welcome back!");
      } else {
        await signup(email, password);
        toast.success("Account created successfully!");
      }
    } catch (err: any) {
      toast.error(
        err.response?.data?.error ||
          `${mode === "login" ? "Login" : "Sign up"} failed`,
      );
    }
    setLoading(false);
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    setLoading(true);
    try {
      if (credentialResponse.credential) {
        await loginWithGoogle(credentialResponse.credential);
        toast.success("Welcome back with Google!");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Google Login failed");
    }
    setLoading(false);
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.6)",
        backdropFilter: "blur(5px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        zIndex: 100,
        fontFamily: "inherit",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="fade-in"
        style={{
          position: "relative",
          width: "100%",
          maxWidth: "400px",
          backgroundColor: "#0a0a0a",
          border: "1px solid #222",
          borderRadius: "16px",
          padding: "40px 32px",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "16px",
            right: "16px",
            background: "none",
            border: "none",
            color: "#666",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "4px",
            borderRadius: "50%",
            transition: "all 0.2s",
          }}
          className="hover:bg-zinc-900 hover:text-white"
        >
          <X size={20} />
        </button>

        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <div
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "12px",
              backgroundColor: "#fff",
              color: "#000",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "24px",
            }}
          >
            <Shield size={28} />
          </div>
          <h1
            style={{ fontSize: "30px", fontWeight: 700, marginBottom: "8px" }}
          >
            {mode === "login" ? "Welcome Back" : "Create Account"}
          </h1>
          <p style={{ color: "#888", fontSize: "14px" }}>
            {mode === "login"
              ? "Sign in to continue to AutoAudit"
              : "Sign up to get started"}
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ marginBottom: "24px" }}>
          <div style={{ marginBottom: "16px" }}>
            <label
              style={{
                display: "block",
                fontSize: "14px",
                fontWeight: 500,
                color: "#aaa",
                marginBottom: "8px",
              }}
            >
              Email
            </label>
            <input
              type="email"
              style={{
                width: "100%",
                padding: "12px",
                backgroundColor: "#000",
                border: "1px solid #222",
                borderRadius: "8px",
                color: "#fff",
                outline: "none",
              }}
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div style={{ marginBottom: "24px" }}>
            <label
              style={{
                display: "block",
                fontSize: "14px",
                fontWeight: 500,
                color: "#aaa",
                marginBottom: "8px",
              }}
            >
              Password
            </label>
            <input
              type="password"
              style={{
                width: "100%",
                padding: "12px",
                backgroundColor: "#000",
                border: "1px solid #222",
                borderRadius: "8px",
                color: "#fff",
                outline: "none",
              }}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              backgroundColor: "#fff",
              color: "#000",
              fontWeight: 600,
              padding: "12px",
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              border: "none",
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? (
              <span className="spinner border-black border-t-transparent" />
            ) : (
              <>
                {mode === "login" ? "Sign In" : "Sign Up"}{" "}
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <div style={{ position: "relative", marginBottom: "24px" }}>
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: "flex",
              alignItems: "center",
            }}
          >
            <div style={{ width: "100%", borderTop: "1px solid #222" }}></div>
          </div>
          <div
            style={{
              position: "relative",
              display: "flex",
              justifyContent: "center",
              fontSize: "14px",
            }}
          >
            <span
              style={{
                padding: "0 12px",
                backgroundColor: "#0a0a0a",
                color: "#666",
              }}
            >
              Or continue with
            </span>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginBottom: "32px",
          }}
        >
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => {
              toast.error("Google Login Failed");
            }}
            theme="filled_black"
            shape="rectangular"
            text={mode === "login" ? "signin_with" : "signup_with"}
            size="large"
          />
        </div>

        <p style={{ textAlign: "center", fontSize: "14px", color: "#888" }}>
          {mode === "login"
            ? "Don't have an account? "
            : "Already have an account? "}
          <button
            type="button"
            onClick={() => setMode(mode === "login" ? "signup" : "login")}
            style={{
              color: "#fff",
              fontWeight: 500,
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 0,
            }}
          >
            {mode === "login" ? "Sign Up" : "Sign In"}
          </button>
        </p>
      </div>
    </div>
  );
}
