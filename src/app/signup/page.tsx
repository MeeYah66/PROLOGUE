"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Eye, EyeOff, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth/context";
import { BrandLogo, BrandMark } from "@/components/brand/BrandLogo";

const INPUT =
  "w-full h-12 px-4 rounded-full border border-white/70 bg-white/78 text-sm text-ink placeholder:text-ink-faint focus:outline-none focus:border-gold/55 focus:ring-4 focus:ring-gold/10 transition-all duration-200";

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
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_8%,rgba(232,201,122,0.18),transparent_38%),radial-gradient(circle_at_82%_88%,rgba(201,168,76,0.17),transparent_36%)]" />

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
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_16%_10%,rgba(232,201,122,0.22),transparent_34%),radial-gradient(circle_at_82%_78%,rgba(201,168,76,0.2),transparent_40%)]" />

      <div
        className="pointer-events-none absolute -top-40 right-[-260px] h-[520px] w-[940px] rounded-[999px] border-[52px] border-gold/70 blur-[2px]"
        style={{ transform: "rotate(-23deg)" }}
      />
      <div
        className="pointer-events-none absolute -bottom-36 left-[-290px] h-[500px] w-[930px] rounded-[999px] border-[50px] border-gold/65 blur-[2px]"
        style={{ transform: "rotate(16deg)" }}
      />

      <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col px-5 py-7 sm:px-8">
        <header className="flex items-center justify-between">
          <BrandLogo className="gap-2.5" />
          <span className="hidden rounded-full border border-ink/10 bg-white/70 px-4 py-1.5 text-xs font-medium text-ink-muted backdrop-blur-sm sm:inline-flex">
            Novel Writing Studio
          </span>
        </header>

        <main className="mx-auto my-auto w-full max-w-[500px]">
          <section className="rounded-[26px] border border-white/70 bg-white/52 px-6 py-7 shadow-[0_30px_60px_-30px_rgba(26,20,8,0.45)] backdrop-blur-xl sm:px-8 sm:py-8">
            <div className="mb-6 text-center">
              <div className="mx-auto mb-4 inline-flex items-center gap-2 rounded-full border border-gold/30 bg-white/72 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.14em] text-amber-label">
                <Sparkles className="h-3 w-3" />
                Start Your Manuscript
              </div>
              <h1 className="font-serif text-[2rem] font-semibold leading-[1.12] tracking-tight text-ink sm:text-[2.2rem]">
                Create your Prologue account
              </h1>
              <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-ink-muted">
                Build your private writing space and start shaping your story, chapter by chapter.
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
                  "mt-1 inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-ink px-4 text-sm font-medium text-parchment transition-all duration-200",
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

            <p className="mt-5 text-center text-xs text-ink-faint">
              Already have an account?{" "}
              <Link href="/signin" className="font-medium text-ink-muted underline-offset-2 transition-colors hover:text-ink hover:underline">
                Sign in
              </Link>
            </p>
          </section>
        </main>
      </div>
    </div>
  );
}

