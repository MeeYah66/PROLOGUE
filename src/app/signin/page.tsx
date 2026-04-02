"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Eye, EyeOff, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth/context";
import { BrandLogo } from "@/components/brand/BrandLogo";

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

const INPUT =
  "w-full h-11 px-3.5 rounded-[12px] border border-ink/12 bg-[#f6f3ec]/92 text-[15px] text-ink placeholder:text-ink-faint/90 shadow-[inset_0_1px_0_rgba(255,255,255,0.45)] focus:outline-none focus:border-gold/65 focus:ring-2 focus:ring-gold/10 transition-all duration-200";

export default function SignInPage() {
  const { signIn, signInWithGoogle } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
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
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setGoogleLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f2efe8]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_14%_8%,rgba(232,201,122,0.16),transparent_38%),radial-gradient(circle_at_84%_82%,rgba(201,168,76,0.13),transparent_42%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.46] bg-[repeating-linear-gradient(to_bottom,rgba(56,45,30,0.085)_0px,rgba(56,45,30,0.085)_1px,transparent_1px,transparent_30px)]" />
      <div className="pointer-events-none absolute inset-y-0 left-7 w-[1.5px] bg-gradient-to-b from-transparent via-[#b08f4f]/62 to-transparent sm:left-[8.5%]" />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.16]"
        style={{
          backgroundImage: "radial-gradient(rgba(78,62,38,0.6) 0.55px, transparent 0.55px)",
          backgroundSize: "2.8px 2.8px",
        }}
      />
      <div className="pointer-events-none absolute inset-0 opacity-45 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.44)_0%,rgba(243,236,224,0.22)_45%,rgba(232,223,206,0.28)_100%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-35 bg-[radial-gradient(circle_at_50%_18%,rgba(255,255,255,0.5),transparent_58%)]" />
      <div className="pointer-events-none absolute inset-0 overflow-hidden quill-motion">
        <svg
          className="absolute inset-0 h-full w-full opacity-60"
          viewBox="0 0 1440 900"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="signinInk" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgba(144,111,43,0.18)" />
              <stop offset="52%" stopColor="rgba(168,132,52,0.45)" />
              <stop offset="100%" stopColor="rgba(132,103,38,0.2)" />
            </linearGradient>
          </defs>

          <path
            d="M130 248 C 420 246, 860 250, 1240 247"
            fill="none"
            stroke="url(#signinInk)"
            strokeWidth="1.75"
            strokeLinecap="round"
            className="writing-line writing-line-a"
          />
          <path
            d="M140 380 C 430 378, 850 382, 1220 380"
            fill="none"
            stroke="url(#signinInk)"
            strokeWidth="1.75"
            strokeLinecap="round"
            className="writing-line writing-line-b"
          />
          <path
            d="M150 512 C 440 510, 830 513, 1180 510"
            fill="none"
            stroke="url(#signinInk)"
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
          <span className="hidden rounded-full border border-ink/10 bg-white/70 px-4 py-1.5 text-xs font-medium text-ink-muted backdrop-blur-sm sm:inline-flex">
            Novel Writing Studio
          </span>
        </header>

        <main className="mx-auto my-auto w-full max-w-[500px]">
          <section className="rounded-[26px] border border-white/75 bg-white/56 px-6 py-7 shadow-[0_34px_66px_-34px_rgba(26,20,8,0.46)] backdrop-blur-xl sm:px-8 sm:py-8">
            <div className="mb-6 text-center">
              <div className="mx-auto mb-4 inline-flex items-center gap-2 rounded-[10px] border border-gold/35 bg-[#f6f2e8]/88 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-amber-label shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]">
                <Sparkles className="h-3 w-3 text-gold/90" />
                Resume Writing Session
              </div>
              <h1 className="font-serif text-[2.1rem] font-semibold leading-[1.08] tracking-tight text-ink sm:text-[2.35rem]">
                Welcome back to Prologue
              </h1>
              <p className="mx-auto mt-2 max-w-sm text-[13px] leading-relaxed text-ink-muted">
                Sign in to continue shaping your manuscript, one clean page at a time.
              </p>
              <p className="mx-auto mt-2 max-w-sm font-serif text-[13px] italic leading-relaxed text-[#6e614d]">
                Your story has been waiting for you.
              </p>
            </div>

            <div className="mb-4">
              <button
                type="button"
                onClick={handleGoogle}
                disabled={googleLoading}
                className={cn(
                  "inline-flex h-11 w-full items-center justify-center gap-2 rounded-[12px] border border-ink/12 bg-[#f6f3ec]/92 px-4 text-sm font-medium text-ink transition-all duration-200",
                  "hover:border-ink/20 hover:bg-[#f8f4ec] active:scale-[0.995]",
                  "disabled:cursor-not-allowed disabled:opacity-50"
                )}
              >
                {googleLoading ? (
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                ) : (
                  <GoogleIcon className="h-4 w-4 shrink-0" />
                )}
                Continue with Google
              </button>
            </div>

            <div className="mb-4 flex items-center gap-3">
              <div className="h-px flex-1 bg-ink/10" />
              <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-faint">or sign in with email</span>
              <div className="h-px flex-1 bg-ink/10" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
                className={INPUT}
              />

              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
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

              {error && <p className="px-1 text-xs text-red-500">{error}</p>}

              <button
                type="submit"
                disabled={loading || !email.trim() || !password}
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
                    Signing in...
                  </span>
                ) : (
                  <>
                    Continue to Studio
                    <ArrowRight className="h-3.5 w-3.5" />
                  </>
                )}
              </button>
            </form>

            <p className="mt-5 text-center text-[12px] text-ink-faint">
              New to Prologue?{" "}
              <Link href="/signup" className="font-medium text-ink-muted underline-offset-2 transition-colors hover:text-ink hover:underline">
                Create an account
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
          animation: signinWriteLineA 18s linear infinite;
        }

        .writing-line-b {
          animation: signinWriteLineB 18s linear infinite;
        }

        .writing-line-c {
          animation: signinWriteLineC 18s linear infinite;
        }

        .animate-quill-write {
          animation: signinQuillWrite 18s linear infinite;
          transform-origin: center;
        }

        @keyframes signinWriteLineA {
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

        @keyframes signinWriteLineB {
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

        @keyframes signinWriteLineC {
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

        @keyframes signinQuillWrite {
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

