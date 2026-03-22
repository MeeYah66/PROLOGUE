"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Feather, Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth/context";

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
      router.push("/");
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
          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="text"
              placeholder="Your name or pen name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoFocus
              className="w-full h-11 px-4 rounded-xl border border-parchment-deep bg-white text-sm text-ink placeholder:text-ink-faint focus:outline-none focus:border-ink/30 focus:ring-2 focus:ring-ink/8 transition-all"
            />
            <input
              type="email"
              placeholder="Your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full h-11 px-4 rounded-xl border border-parchment-deep bg-white text-sm text-ink placeholder:text-ink-faint focus:outline-none focus:border-ink/30 focus:ring-2 focus:ring-ink/8 transition-all"
            />
            <div className="relative">
              <input
                type={showPass ? "text" : "password"}
                placeholder="Password (min 6 characters)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
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
            <input
              type={showPass ? "text" : "password"}
              placeholder="Confirm password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              className="w-full h-11 px-4 rounded-xl border border-parchment-deep bg-white text-sm text-ink placeholder:text-ink-faint focus:outline-none focus:border-ink/30 focus:ring-2 focus:ring-ink/8 transition-all"
            />

            {error && (
              <p className="text-xs text-red-500 px-1">{error}</p>
            )}

            <button
              type="submit"
              disabled={!canSubmit}
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
            <Link href="/signin" className="text-ink-muted underline-offset-2 hover:underline hover:text-ink transition-colors">
              Sign in
            </Link>
          </p>

          {/* Legal */}
          <p className="mt-8 text-center text-[10px] text-ink-faint/60 leading-relaxed max-w-[280px] mx-auto">
            By creating an account, you agree to Prologue's{" "}
            <span className="underline underline-offset-2 cursor-pointer hover:text-ink-faint transition-colors">Terms</span>
            {" "}and{" "}
            <span className="underline underline-offset-2 cursor-pointer hover:text-ink-faint transition-colors">Privacy Policy</span>.
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
          {/* Dark gradient — bottom-left heavy, fades to transparent top-right */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to top right, rgba(45,52,51,0.72) 0%, rgba(45,52,51,0.22) 50%, transparent 100%)",
            }}
          />
          {/* Subtle tint overlay */}
          <div
            className="absolute inset-0"
            style={{ backgroundColor: "rgba(77,99,95,0.08)", mixBlendMode: "multiply" }}
          />
        </div>

        {/* Quote — bottom */}
        <div className="relative z-10 h-full flex flex-col justify-end p-16 pointer-events-none">
          <div className="max-w-xl space-y-5">
            <div className="w-12 h-px bg-white/40" />
            <blockquote className="font-serif italic text-4xl lg:text-5xl leading-tight font-light text-white">
              "Every story begins with a single page, waiting for the weight of your thoughts."
            </blockquote>
            <p className="font-sans text-sm uppercase tracking-[0.2em] text-white/60">
              The Silent Manuscript
            </p>
          </div>
        </div>

        {/* Glass chip — top right */}
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
            Focus Mode Active
          </span>
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
            background:
              "radial-gradient(ellipse 100% 80% at 50% 60%, rgba(60,42,24,0.7) 0%, transparent 70%)",
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
