"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Feather, Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth/context";

// ─── Google icon (inline SVG — no external dep) ───────────────────────────
function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}

export default function SignInPage() {
  const { signIn, signInWithGoogle } = useAuth();
  const router                        = useRouter();
  const [email, setEmail]            = useState("");
  const [password, setPassword]      = useState("");
  const [showPass, setShowPass]      = useState(false);
  const [error, setError]            = useState("");
  const [loading, setLoading]        = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password) return;
    setError("");
    setLoading(true);
    try {
      await signIn(email, password);
      router.push("/");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setError("");
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
      // Page will redirect via OAuth
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setGoogleLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-parchment">

      {/* ── LEFT — auth area ──────────────────────────────────────────────── */}
      <div className="flex-1 md:flex-none md:w-[46%] flex flex-col justify-center px-8 sm:px-12 lg:px-16 py-16 min-h-screen md:min-h-0 bg-parchment">
        <div className="w-full max-w-[360px] mx-auto">

          {/* Logo */}
          <div className="flex items-center gap-2.5 mb-12">
            <div className="w-7 h-7 rounded-lg bg-ink flex items-center justify-center shrink-0">
              <Feather className="w-3.5 h-3.5 text-parchment" strokeWidth={1.5} />
            </div>
            <span className="font-serif text-base font-semibold text-ink tracking-tight">Prologue</span>
          </div>

          {/* Headline */}
          <div className="mb-9">
            <h1 className="font-serif text-[2rem] font-semibold text-ink leading-[1.18] tracking-tight mb-3">
              Welcome back.
            </h1>
            <p className="text-sm text-ink-muted leading-relaxed">
              Your manuscripts are waiting.<br className="hidden sm:block" /> Sign in to continue your story.
            </p>
          </div>

          {/* Google SSO */}
          <div className="space-y-2.5 mb-6">
            <button
              type="button"
              onClick={handleGoogle}
              disabled={googleLoading}
              className={cn(
                "w-full flex items-center justify-center gap-3 h-11 rounded-xl border border-parchment-deep bg-white text-ink text-sm font-medium transition-all",
                "hover:bg-parchment-warm hover:border-ink/20 active:scale-[0.99]",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            >
              {googleLoading ? (
                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
              ) : (
                <GoogleIcon className="w-4 h-4 shrink-0" />
              )}
              Continue with Google
            </button>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-parchment-deep" />
            <span className="text-[11px] text-ink-faint font-sans tracking-wider uppercase">sign in</span>
            <div className="flex-1 h-px bg-parchment-deep" />
          </div>

          {/* Sign in form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="email"
              placeholder="Your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
              className="w-full h-11 px-4 rounded-xl border border-parchment-deep bg-white text-sm text-ink placeholder:text-ink-faint focus:outline-none focus:border-ink/30 focus:ring-2 focus:ring-ink/8 transition-all"
            />
            <div className="relative">
              <input
                type={showPass ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full h-11 px-4 pr-10 rounded-xl border border-parchment-deep bg-white text-sm text-ink placeholder:text-ink-faint focus:outline-none focus:border-ink/30 focus:ring-2 focus:ring-ink/8 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPass((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-faint hover:text-ink transition-colors"
                tabIndex={-1}
              >
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {error && (
              <p className="text-xs text-red-500 px-1">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading || !email.trim() || !password}
              className={cn(
                "w-full h-11 rounded-xl bg-ink text-parchment text-sm font-medium flex items-center justify-center gap-2 transition-all",
                "hover:bg-ink-soft active:scale-[0.99]",
                "disabled:opacity-40 disabled:cursor-not-allowed"
              )}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Signing in…
                </span>
              ) : (
                <>
                  Continue to Studio
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          {/* Sign up link */}
          <p className="mt-6 text-center text-xs text-ink-faint">
            New to Prologue?{" "}
            <Link href="/signup" className="text-ink-muted underline-offset-2 hover:underline hover:text-ink transition-colors">
              Create an account
            </Link>
          </p>
        </div>
      </div>

      {/* ── RIGHT — immersive visual panel ─────────────────────────────────── */}
      <div className="hidden md:flex flex-1 relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBVl1eegQCwkzrn7F1r8u6mfYfX86Pi6gRTrMLaQx-H6wZwTkT7v2DXWkshAIbQsBfH6SpwIKxbTIQFhvr1G_N9GwHrABAwI0edq9Lco95VQ9GDzPke7dwa9lGy3eRn7zpo_zeSF994FmD5OZ1_uRbyMccHl-5f2JCpO_vtEcrK9IfaZRKOtDsFSkzIgRYk1nJ1hXFJA0C61DzvxO9bT0pxg73RMQBSRUll3fVrQuxyWjFgAyQrBZfQiVaGJNL2-Wj3DCMJ6ajMFEUb"
            alt="Quiet library atmosphere"
            className="w-full h-full object-cover"
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to top right, rgba(45,52,51,0.72) 0%, rgba(45,52,51,0.22) 50%, transparent 100%)",
            }}
          />
        </div>

        <div className="relative z-10 h-full flex flex-col justify-end p-16 pointer-events-none">
          <div className="max-w-xl space-y-5">
            <div className="w-12 h-px bg-white/40" />
            <blockquote className="font-serif italic text-4xl lg:text-5xl leading-tight font-light text-white">
              "The page remembers every word you left on it."
            </blockquote>
            <p className="font-sans text-sm uppercase tracking-[0.2em] text-white/60">
              Prologue Studio
            </p>
          </div>
        </div>

        <div
          className="absolute top-10 right-10 z-10 px-5 py-2.5 rounded-full flex items-center gap-2.5 border border-white/10"
          style={{
            background: "rgba(255,255,255,0.82)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
          }}
        >
          <span className="w-2 h-2 rounded-full bg-[#4d635f]" />
          <span className="font-sans text-[0.62rem] uppercase tracking-widest text-[#5a6060] font-medium">
            Your Studio Awaits
          </span>
        </div>
      </div>

      {/* ── MOBILE header ─────────────────────────────────────────────────── */}
      <div
        className="md:hidden w-full h-48 relative overflow-hidden order-first"
        style={{ backgroundColor: "#100e0c" }}
      >
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 100% 80% at 50% 60%, rgba(60,42,24,0.7) 0%, transparent 70%)",
          }}
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
          <Feather className="w-7 h-7" style={{ color: "rgba(200,155,80,0.5)" }} strokeWidth={1} />
          <p className="font-serif italic text-sm text-parchment/60 tracking-wide">
            Welcome back to your story.
          </p>
        </div>
      </div>

    </div>
  );
}
