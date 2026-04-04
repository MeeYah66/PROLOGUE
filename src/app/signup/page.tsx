"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Eye, EyeOff, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth/context";
import { BrandLogo, BrandMark } from "@/components/brand/BrandLogo";

const INPUT =
  "auth-input w-full h-11 px-3.5 rounded-[12px] border text-[15px] transition-all duration-200 focus:outline-none";

export default function SignupPage() {
  const { signUp } = useAuth();
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
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
      <div className="auth-page relative min-h-screen overflow-hidden">
        <div className="auth-glow pointer-events-none absolute inset-0" />
        <div className="auth-lines pointer-events-none absolute inset-0" />
        <div className="auth-rule pointer-events-none absolute inset-y-0 left-7 w-[1.5px] sm:left-[8.5%]" />
        <div className="auth-grain pointer-events-none absolute inset-0" />
        <div className="auth-wash-1 pointer-events-none absolute inset-0" />
        <div className="auth-wash-2 pointer-events-none absolute inset-0" />

        <div className="relative mx-auto flex min-h-screen max-w-5xl flex-col px-5 py-7 sm:px-8">
          <BrandLogo className="w-fit" />

          <div className="mx-auto my-auto w-full max-w-[460px]">
            <section className="auth-card rounded-[26px] px-6 py-8 sm:px-8">
              <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/70 bg-white/80 shadow-[0_8px_20px_-14px_rgba(26,20,8,0.35)]">
                <BrandMark className="h-8 w-6" />
              </div>
              <h1 className="text-center font-serif text-3xl font-semibold text-ink">Check your inbox</h1>
              <p className="mt-3 text-center text-sm leading-relaxed text-ink-muted">
                We sent a confirmation link to{" "}
                <span className="font-medium text-ink">{email}</span>.
                Confirm your email to open your writing studio.
              </p>
              <button
                onClick={() => router.push("/signin")}
                className="mt-7 inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-ink px-4 text-sm font-medium text-parchment transition-all duration-200 hover:bg-ink-soft"
              >
                Continue to Sign In
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </section>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page relative min-h-screen overflow-hidden">
      <div className="auth-glow pointer-events-none absolute inset-0" />
      <div className="auth-lines pointer-events-none absolute inset-0" />
      <div className="auth-rule pointer-events-none absolute inset-y-0 left-7 w-[1.5px] sm:left-[8.5%]" />
      <div className="auth-grain pointer-events-none absolute inset-0" />
      <div className="auth-wash-1 pointer-events-none absolute inset-0" />
      <div className="auth-wash-2 pointer-events-none absolute inset-0" />
      <div className="pointer-events-none absolute inset-0 overflow-hidden quill-motion">
        <svg
          className="absolute inset-0 h-full w-full opacity-60"
          viewBox="0 0 1440 900"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="signupInk" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgba(144,111,43,0.18)" />
              <stop offset="52%" stopColor="rgba(168,132,52,0.45)" />
              <stop offset="100%" stopColor="rgba(132,103,38,0.2)" />
            </linearGradient>
          </defs>

          <path
            d="M130 248 C 420 246, 860 250, 1240 247"
            fill="none"
            stroke="url(#signupInk)"
            strokeWidth="1.75"
            strokeLinecap="round"
            className="writing-line writing-line-a"
          />
          <path
            d="M140 380 C 430 378, 850 382, 1220 380"
            fill="none"
            stroke="url(#signupInk)"
            strokeWidth="1.75"
            strokeLinecap="round"
            className="writing-line writing-line-b"
          />
          <path
            d="M150 512 C 440 510, 830 513, 1180 510"
            fill="none"
            stroke="url(#signupInk)"
            strokeWidth="1.75"
            strokeLinecap="round"
            className="writing-line writing-line-c"
          />

          <g className="animate-quill-write">
            <path
              d="M2 10 C 2 4 7 1 12 1 C 16 1 18 3 19 7 C 20 10 19 13 16 16 L9 23 L2 10 Z"
              fill="rgba(45,36,23,0.88)"
            />
            <path
              d="M10 21 L15 26 L8 27 Z"
              fill="rgba(151,118,47,0.95)"
            />
          </g>
        </svg>
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col px-5 py-7 sm:px-8">
        <header className="flex items-center justify-between">
          <BrandLogo className="gap-2.5" />
          <span className="auth-top-chip hidden rounded-full px-4 py-1.5 text-xs font-medium text-ink-muted backdrop-blur-sm sm:inline-flex">
            Novel Writing Studio
          </span>
        </header>

        <main className="mx-auto my-auto w-full max-w-[500px]">
          <section className="auth-card rounded-[26px] px-6 py-7 sm:px-8 sm:py-8">
            <div className="mb-6 text-center">
              <div className="auth-pill mx-auto mb-4 inline-flex items-center gap-2 rounded-[10px] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-amber-label">
                <Sparkles className="h-3 w-3 text-gold/90" />
                Writing Studio Setup
              </div>
              <h1 className="font-serif text-[2.1rem] font-semibold leading-[1.08] tracking-tight text-ink sm:text-[2.35rem]">
                Create your Prologue account
              </h1>
              <p className="mx-auto mt-2 max-w-sm text-[13px] leading-relaxed text-ink-muted">
                Build your private writing space and start shaping your story, chapter by chapter.
              </p>
              <p className="mx-auto mt-2 max-w-sm font-serif text-[13px] italic leading-relaxed text-[#6e614d]">
                Every great manuscript begins with a single quiet page.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <input
                type="text"
                placeholder="Your pen name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoFocus
                className={INPUT}
              />
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className={INPUT}
              />

              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  placeholder="Password (minimum 6 characters)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className={cn(INPUT, "pr-11")}
                />
                <button
                  type="button"
                  onClick={() => setShowPass((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-faint transition-colors hover:text-ink"
                  tabIndex={-1}
                >
                  {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
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

              {error && <p className="px-1 text-xs text-red-500">{error}</p>}

              <button
                type="submit"
                disabled={!canSubmit}
                className={cn(
                  "mt-1 inline-flex h-11 w-full items-center justify-center gap-2 rounded-[12px] bg-ink px-4 text-sm font-medium text-parchment transition-all duration-200",
                  "hover:bg-ink-soft active:scale-[0.995] disabled:cursor-not-allowed disabled:opacity-45"
                )}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    Setting up your studio...
                  </span>
                ) : (
                  <>
                    Create account
                    <ArrowRight className="h-3.5 w-3.5" />
                  </>
                )}
              </button>
            </form>

            <p className="mt-5 text-center text-[12px] text-ink-faint">
              Already have an account?{" "}
              <Link href="/signin" className="font-medium text-ink-muted underline-offset-2 transition-colors hover:text-ink hover:underline">
                Sign in
              </Link>
            </p>
          </section>
        </main>
      </div>
      <style jsx>{`
        .writing-line {
          stroke-dasharray: 1300;
          stroke-dashoffset: 1300;
          opacity: 0;
        }

        .writing-line-a {
          animation: signupWriteLineA 18s linear infinite;
        }

        .writing-line-b {
          animation: signupWriteLineB 18s linear infinite;
        }

        .writing-line-c {
          animation: signupWriteLineC 18s linear infinite;
        }

        .animate-quill-write {
          animation: signupQuillWrite 18s linear infinite;
          transform-origin: center;
        }

        @keyframes signupWriteLineA {
          0% {
            stroke-dashoffset: 1300;
            opacity: 0;
          }
          2% {
            opacity: 0.42;
          }
          30% {
            stroke-dashoffset: 0;
            opacity: 0.38;
          }
          92% {
            stroke-dashoffset: 0;
            opacity: 0.08;
          }
          100% {
            stroke-dashoffset: 1300;
            opacity: 0;
          }
        }

        @keyframes signupWriteLineB {
          0%,
          32% {
            stroke-dashoffset: 1300;
            opacity: 0;
          }
          35% {
            opacity: 0.4;
          }
          62% {
            stroke-dashoffset: 0;
            opacity: 0.36;
          }
          92% {
            stroke-dashoffset: 0;
            opacity: 0.08;
          }
          100% {
            stroke-dashoffset: 1300;
            opacity: 0;
          }
        }

        @keyframes signupWriteLineC {
          0%,
          66% {
            stroke-dashoffset: 1300;
            opacity: 0;
          }
          70% {
            opacity: 0.38;
          }
          96% {
            stroke-dashoffset: 0;
            opacity: 0.34;
          }
          100% {
            stroke-dashoffset: 1300;
            opacity: 0;
          }
        }

        @keyframes signupQuillWrite {
          0% {
            transform: translate(130px, 248px) rotate(11deg);
          }
          28% {
            transform: translate(1240px, 248px) rotate(-5deg);
          }
          33% {
            transform: translate(1260px, 228px) rotate(-11deg);
          }
          38% {
            transform: translate(140px, 382px) rotate(10deg);
          }
          62% {
            transform: translate(1220px, 382px) rotate(-5deg);
          }
          67% {
            transform: translate(1240px, 362px) rotate(-10deg);
          }
          72% {
            transform: translate(150px, 512px) rotate(10deg);
          }
          96% {
            transform: translate(1180px, 512px) rotate(-4deg);
          }
          100% {
            transform: translate(1205px, 496px) rotate(-9deg);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .writing-line-a,
          .writing-line-b,
          .writing-line-c,
          .animate-quill-write {
            animation: none !important;
          }

          .quill-motion {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}
