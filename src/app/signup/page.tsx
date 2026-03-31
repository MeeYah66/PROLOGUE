"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Feather, Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth/context";

// Shared input style — warm tint bg, softened border, gold focus glow
const INPUT =
  "w-full h-12 px-4 rounded-xl border border-parchment-deep/70 bg-parchment/50 text-sm text-ink placeholder:text-ink-faint focus:outline-none focus:border-gold/40 focus:ring-2 focus:ring-gold/10 transition-all duration-200";

export default function SignupPage() {
  const { signUp } = useAuth();
  const router     = useRouter();
  const [name, setName]         = useState("");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm]   = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password) return;
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await signUp(name, email, password);
      setConfirmed(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setLoading(false);
    }
  }

  const canSubmit =
    name.trim().length > 0 &&
    email.trim().length > 0 &&
    password.length >= 6 &&
    confirm.length > 0 &&
    !loading;

  if (confirmed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-parchment px-6">
        <div className="w-full max-w-[360px] text-center">
          <div className="w-12 h-12 rounded-full bg-parchment-warm flex items-center justify-center mx-auto mb-6">
            <Feather className="w-5 h-5 text-ink-muted" strokeWidth={1.5} />
          </div>
          <h1 className="font-serif text-2xl font-semibold text-ink mb-3">Check your email</h1>
          <p className="text-sm text-ink-muted leading-relaxed mb-6">
            We sent a confirmation link to <span className="text-ink font-medium">{email}</span>.
            Click it to activate your account, then sign in.
          </p>
          <button
            onClick={() => router.push("/signin")}
            className="w-full h-11 rounded-xl bg-ink text-parchment text-sm font-medium hover:bg-ink-soft transition-all duration-200"
          >
            Go to Sign In
          </button>
        </div>
      </div>
    );
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
              Write the story<br />only you can tell.
            </h1>
            <p className="text-sm text-ink-muted leading-relaxed">
              A private writing studio built for novelists,<br className="hidden sm:block" /> romantics, and serious storytellers.
            </p>
          </div>

          {/* Signup form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              placeholder="Your name or pen name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoFocus
              className={INPUT}
            />
            <input
              type="email"
              placeholder="Your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className={INPUT}
            />
            <div className="relative">
              <input
                type={showPass ? "text" : "password"}
                placeholder="Password (min 6 characters)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className={cn(INPUT, "pr-10")}
              />
              <button
                type="button"
                onClick={() => setShowPass((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-faint hover:text-ink transition-colors duration-200"
                tabIndex={-1}
              >
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <input
              type={showPass ? "text" : "password"}
              placeholder="Confirm password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              className={INPUT}
            />

            {error && (
              <p className="text-xs text-red-500 px-1">{error}</p>
            )}

            <button
              type="submit"
              disabled={!canSubmit}
              className={cn(
                "w-full h-11 rounded-xl bg-ink text-parchment text-sm font-medium flex items-center justify-center gap-2 transition-all duration-200",
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
                  Creating your studio…
                </span>
              ) : (
                <>
                  Begin Writing
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          {/* Sign in link */}
          <p className="mt-6 text-center text-xs text-ink-faint">
            Already have an account?{" "}
            <Link href="/signin" className="text-ink-muted underline-offset-2 hover:underline hover:text-ink transition-colors duration-200">
              Sign in
            </Link>
          </p>

          {/* Legal */}
          <p className="mt-8 text-center text-[10px] text-ink-faint/60 leading-relaxed max-w-[280px] mx-auto">
            By creating an account, you agree to Prologue's{" "}
            <span className="underline underline-offset-2 cursor-pointer hover:text-ink-faint transition-colors duration-200">Terms</span>
            {" "}and{" "}
            <span className="underline underline-offset-2 cursor-pointer hover:text-ink-faint transition-colors duration-200">Privacy Policy</span>.
          </p>
        </div>
      </div>

      {/* ── RIGHT — immersive visual panel ─────────────────────────────────── */}
      <div className="hidden md:flex flex-1 relative overflow-hidden">

        {/* Background image */}
        <div className="absolute inset-0 z-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBVl1eegQCwkzrn7F1r8u6mfYfX86Pi6gRTrMLaQx-H6wZwTkT7v2DXWkshAIbQsBfH6SpwIKxbTIQFhvr1G_N9GwHrABAwI0edq9Lco95VQ9GDzPke7dwa9lGy3eRn7zpo_zeSF994FmD5OZ1_uRbyMccHl-5f2JCpO_vtEcrK9IfaZRKOtDsFSkzIgRYk1nJ1hXFJA0C61DzvxO9bT0pxg73RMQBSRUll3fVrQuxyWjFgAyQrBZfQiVaGJNL2-Wj3DCMJ6ajMFEUb"
            alt="Quiet library atmosphere"
            className="w-full h-full object-cover"
          />
          {/* Ambient tint */}
          <div
            className="absolute inset-0"
            style={{
              background: "linear-gradient(to top right, rgba(45,52,51,0.72) 0%, rgba(45,52,51,0.22) 50%, transparent 100%)",
            }}
          />
          {/* Bottom gradient — anchors the quote text against any image variation */}
          <div
            className="absolute inset-0"
            style={{
              background: "linear-gradient(to top, rgba(8,10,10,0.68) 0%, rgba(8,10,10,0.28) 38%, transparent 62%)",
            }}
          />
        </div>

        {/* Quote — bottom */}
        <div className="relative z-10 h-full flex flex-col justify-end p-16 pointer-events-none">
          <div className="max-w-xl space-y-5">
            <div className="w-12 h-px bg-white/30" />
            <blockquote className="font-serif italic text-4xl lg:text-5xl leading-tight font-light text-white/70">
              "Every story begins with a single page, waiting for the weight of your thoughts."
            </blockquote>
            <p className="font-sans text-sm uppercase tracking-[0.2em] text-white/50">
              The Silent Manuscript
            </p>
          </div>
        </div>

      </div>

      {/* ── MOBILE atmospheric header (shown instead of right panel) ─────── */}
      <div
        className="md:hidden w-full h-48 relative overflow-hidden order-first"
        style={{ backgroundColor: "#100e0c" }}
      >
        <div
          className="absolute inset-0"
          style={{
            background: "radial-gradient(ellipse 100% 80% at 50% 60%, rgba(60,42,24,0.7) 0%, transparent 70%)",
          }}
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
          <Feather
            className="w-7 h-7"
            style={{ color: "rgba(200,155,80,0.5)" }}
            strokeWidth={1}
          />
          <p className="font-serif italic text-sm text-parchment/60 tracking-wide">
            Every story begins with a single page.
          </p>
        </div>
      </div>

    </div>
  );
}
