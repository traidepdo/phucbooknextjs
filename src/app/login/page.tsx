"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { KeyRound, Lock, Mail, Loader2, ArrowLeft } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fromPath = searchParams?.get("from");
    if (fromPath) {
      setMessage("You must sign in to access that page.");
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Something went wrong");
      }

      // Successful login
      router.refresh();
      if (data.user.role === "ADMIN") {
        router.push("/admin");
      } else {
        router.push("/dashboard");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-panel" style={{ width: "100%", maxWidth: "420px" }}>
      <div style={{ textAlign: "center", marginBottom: "2rem" }}>
        <div style={{ 
          display: "inline-flex", 
          padding: "1rem", 
          borderRadius: "50%", 
          background: "var(--primary-glow)",
          color: "var(--primary)",
          marginBottom: "1rem"
        }}>
          <KeyRound size={32} />
        </div>
        <h2 style={{ fontSize: "1.75rem", fontWeight: 700 }}>Welcome Back</h2>
        <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginTop: "0.25rem" }}>
          Sign in to access your secure console
        </p>
      </div>

      {message && (
        <div style={{ 
          background: "rgba(99, 102, 241, 0.1)", 
          color: "#818cf8", 
          padding: "0.75rem 1rem", 
          borderRadius: "8px", 
          fontSize: "0.85rem",
          marginBottom: "1.25rem",
          border: "1px solid rgba(99, 102, 241, 0.2)"
        }}>
          {message}
        </div>
      )}

      {error && (
        <div style={{ 
          background: "var(--error-bg)", 
          color: "var(--error)", 
          padding: "0.75rem 1rem", 
          borderRadius: "8px", 
          fontSize: "0.85rem",
          marginBottom: "1.25rem",
          border: "1px solid rgba(239, 68, 68, 0.2)"
        }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label" htmlFor="email">Email Address</label>
          <div style={{ position: "relative" }}>
            <Mail size={16} style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
            <input
              id="email"
              type="email"
              className="form-input"
              style={{ paddingLeft: "2.75rem" }}
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="form-group" style={{ marginBottom: "1.75rem" }}>
          <label className="form-label" htmlFor="password">Password</label>
          <div style={{ position: "relative" }}>
            <Lock size={16} style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
            <input
              id="password"
              type="password"
              className="form-input"
              style={{ paddingLeft: "2.75rem" }}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
        </div>

        <button type="submit" className="btn btn-primary" style={{ width: "100%", height: "46px" }} disabled={loading}>
          {loading ? <Loader2 size={18} className="animate-spin" style={{ animation: "spin 1s linear infinite" }} /> : "Sign In"}
        </button>
      </form>

      <p style={{ textAlign: "center", marginTop: "1.5rem", fontSize: "0.875rem", color: "var(--text-muted)" }}>
        Don't have an account?{" "}
        <Link href="/register" style={{ color: "var(--primary)", fontWeight: 500 }}>
          Sign up
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="main-wrapper">
      <Link href="/" className="btn btn-secondary" style={{ position: "absolute", top: "2rem", left: "2rem" }}>
        <ArrowLeft size={16} /> Back
      </Link>

      <Suspense fallback={
        <div className="glass-panel" style={{ width: "100%", maxWidth: "420px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "300px" }}>
          <Loader2 size={24} className="animate-spin" style={{ animation: "spin 1s linear infinite", color: "var(--primary)" }} />
          <p style={{ marginTop: "1rem", color: "var(--text-muted)", fontSize: "0.9rem" }}>Loading security console...</p>
        </div>
      }>
        <LoginForm />
      </Suspense>

      <style jsx global>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
