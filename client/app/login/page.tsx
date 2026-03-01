"use client";

import { useState } from "react";
import { useAuth } from "../components/AuthProvider";
import { Shield, ArrowRight } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { GoogleLogin } from "@react-oauth/google";

export default function LoginPage() {
  const { login, loginWithGoogle } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success("Welcome back!");
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Login failed");
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
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', backgroundColor: '#000', fontFamily: 'inherit' }}>
      <div className="fade-in" style={{ width: '100%', maxWidth: '400px', backgroundColor: '#0a0a0a', border: '1px solid #222', borderRadius: '16px', padding: '40px 32px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '12px', backgroundColor: '#fff', color: '#000', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
            <Shield size={28} />
          </div>
          <h1 style={{ fontSize: '30px', fontWeight: 700, marginBottom: '8px' }}>Welcome Back</h1>
          <p style={{ color: '#888', fontSize: '14px' }}>Sign in to continue to AutoAudit</p>
        </div>

        <form onSubmit={handleSubmit} style={{ marginBottom: '24px' }}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#aaa', marginBottom: '8px' }}>Email</label>
            <input
              id="login-email"
              type="email"
              style={{ width: '100%', padding: '12px', backgroundColor: '#000', border: '1px solid #222', borderRadius: '8px', color: '#fff', outline: 'none' }}
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#aaa', marginBottom: '8px' }}>Password</label>
            <input
              id="login-password"
              type="password"
              style={{ width: '100%', padding: '12px', backgroundColor: '#000', border: '1px solid #222', borderRadius: '8px', color: '#fff', outline: 'none' }}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            id="login-submit"
            type="submit"
            disabled={loading}
            style={{ width: '100%', backgroundColor: '#fff', color: '#000', fontWeight: 600, padding: '12px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}
          >
            {loading ? <span className="spinner border-black border-t-transparent" /> : <>Sign In <ArrowRight size={18} /></>}
          </button>
        </form>

        <div style={{ position: 'relative', marginBottom: '24px' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center' }}>
            <div style={{ width: '100%', borderTop: '1px solid #222' }}></div>
          </div>
          <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', fontSize: '14px' }}>
            <span style={{ padding: '0 12px', backgroundColor: '#0a0a0a', color: '#666' }}>Or continue with</span>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '32px' }}>
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => {
              toast.error("Google Login Failed");
            }}
            theme="filled_black"
            shape="rectangular"
            text="signin_with"
            size="large"
          />
        </div>

        <p style={{ textAlign: 'center', fontSize: '14px', color: '#888' }}>
          Don&apos;t have an account?{" "}
          <Link href="/signup" style={{ color: '#fff', fontWeight: 500, textDecoration: 'none' }}>
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}
