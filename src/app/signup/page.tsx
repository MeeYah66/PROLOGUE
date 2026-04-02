"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Eye, EyeOff, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth/context";
import { BrandLogo, BrandMark } from "@/components/brand/BrandLogo";

const INPUT =
  "w-full h-11 px-3.5 rounded-[12px] border border-ink/12 bg-[#f6f3ec]/92 text-[15px] text-ink placeholder:text-ink-faint/90 shadow-[inset_0_1px_0_rgba(255,255,255,0.45)] focus:outline-none focus:border-gold/65 focus:ring-2 focus:ring-gold/10 transition-all duration-200";

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
      <div className="relative min-h-screen overflow-hidden bg-[#f2efe8]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_14%_8%,rgba(232,201,122,0.16),transparent_38%),radial-gradient(circle_at_84%_82%,rgba(201,168,76,0.13),transparent_42%)]" />
        <div className="pointer-events-none absolute inset-0 opacity-[0.32] bg-[repeating-linear-gradient(to_bottom,rgba(56,45,30,0.045)_0px,rgba(56,45,30,0.045)_1px,transparent_1px,transparent_34px)]" />
        <div className="pointer-events-none absolute inset-y-0 left-[8.5%] hidden w-px bg-gradient-to-b from-transparent via-[#b08f4f]/42 to-transparent lg:block" />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage: "radial-gradient(rgba(78,62,38,0.45) 0.5px, transparent 0.5px)",
            backgroundSize: "3px 3px",
          }}
        />
        <div className="pointer-events-none absolute inset-0 opacity-35 bg-[radial-gradient(circle_at_50%_18%,rgba(255,255,255,0.5),transparent_58%)]" />

        <div className="relative mx-auto flex min-h-screen max-w-5xl flex-col px-5 py-7 sm:px-8">
          <BrandLogo className="w-fit" />

          <div className="mx-auto my-auto w-full max-w-[460px]">
            <section className="rounded-[26px] border border-white/70 bg-white/52 px-6 py-8 shadow-[0_22px_50px_-28px_rgba(26,20,8,0.4)] backdrop-blur-xl sm:px-8">
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
    <div className="relative min-h-screen overflow-hidden bg-[#f2efe8]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_14%_8%,rgba(232,201,122,0.16),transparent_38%),radial-gradient(circle_at_84%_82%,rgba(201,168,76,0.13),transparent_42%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.34] bg-[repeating-linear-gradient(to_bottom,rgba(56,45,30,0.05)_0px,rgba(56,45,30,0.05)_1px,transparent_1px,transparent_34px)]" />
      <div className="pointer-events-none absolute inset-y-0 left-[8.5%] hidden w-px bg-gradient-to-b from-transparent via-[#b08f4f]/45 to-transparent lg:block" />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage: "radial-gradient(rgba(78,62,38,0.45) 0.5px, transparent 0.5px)",
          backgroundSize: "3px 3px",
        }}
      />
      <div className="pointer-events-none absolute inset-0 opacity-35 bg-[radial-gradient(circle_at_50%_18%,rgba(255,255,255,0.5),transparent_58%)]" />
      <div className="pointer-events-none absolute inset-0 overflow-hidden quill-motion">
        <svg
          className="absolute inset-0 h-full w-full opacity-60"
          viewBox="0 0 1440 900"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="signupInk" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgba(156,122,46,0.18)" />
              <stop offset="45%" stopColor="rgba(176,142,62,0.34)" />
              <stop offset="100%" stopColor="rgba(138,109,44,0.15)" />
            </linearGradient>
          </defs>

          <path
            id="quillPath"
            d="M-120 560 C 190 420, 420 720, 730 522 S 1260 412, 1540 606"
            fill="none"
            stroke="url(#signupInk)"
            strokeWidth="2.1"
            strokeLinecap="round"
            className="animate-ink-trace"
          />
          <path
            d="M-110 568 C 202 430, 430 716, 736 530 S 1250 420, 1530 614"
            fill="none"
            stroke="rgba(255,255,255,0.28)"
            strokeWidth="1"
            strokeLinecap="round"
            className="animate-ink-fade"
          />

          <g className="animate-quill-float">
            <animateMotion dur="17s" repeatCount="indefinite" rotate="auto">
              <mpath href="#quillPath" />
            </animateMotion>
            <path
              d="M2 10 C 2 4 7 1 12 1 C 16 1 18 3 19 7 C 20 10 19 13 16 16 L9 23 L2 10 Z"
              fill="rgba(48,39,25,0.85)"
            />
            <path
              d="M10 21 L15 26 L8 27 Z"
              fill="rgba(148,118,53,0.95)"
            />
          </g>
        </svg>
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col px-5 py-7 sm:px-8">
        <header className="flex items-center justify-between">
          <BrandLogo className="gap-2.5" />
          <span className="hidden rounded-full border border-ink/10 bg-white/70 px-4 py-1.5 text-xs font-medium text-ink-muted backdrop-blur-sm sm:inline-flex">
            Novel Writing Studio
          </span>
        </header>

        <main className="mx-auto my-auto w-full max-w-[500px]">
          <section className="rounded-[26px] border border-white/75 bg-white/56 px-6 py-7 shadow-[0_34px_66px_-34px_rgba(26,20,8,0.46)] backdrop-blur-xl sm:px-8 sm:py-8">
            <div className="mb-6 text-center">
              <div className="mx-auto mb-4 inline-flex items-center gap-2 rounded-[10px] border border-gold/35 bg-[#f6f2e8]/88 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-amber-label shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]">
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
        .animate-ink-trace {
          stroke-dasharray: 10 14;
          animation: signupInkTrace 17s linear infinite;
        }

        .animate-ink-fade {
          animation: signupInkFade 17s ease-in-out infinite;
        }

        .animate-quill-float {
          animation: signupQuillTilt 3.2s ease-in-out infinite;
          transform-origin: center;
        }

        @keyframes signupInkTrace {
          0% {
            opacity: 0.06;
            stroke-dashoffset: 620;
          }
          28% {
            opacity: 0.38;
          }
          78% {
            opacity: 0.24;
          }
          100% {
            opacity: 0.05;
            stroke-dashoffset: 0;
          }
        }

        @keyframes signupInkFade {
          0%,
          100% {
            opacity: 0.04;
          }
          45% {
            opacity: 0.24;
          }
          72% {
            opacity: 0.14;
          }
        }

        @keyframes signupQuillTilt {
          0%,
          100% {
            transform: translateY(-1px) rotate(-3deg);
          }
          50% {
            transform: translateY(2px) rotate(2deg);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .animate-ink-trace,
          .animate-ink-fade,
          .animate-quill-float {
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
