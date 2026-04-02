"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Camera,
  Check,
  Globe,
  Instagram,
  KeyRound,
  Loader2,
  PenLine,
  Twitter,
  User,
} from "lucide-react";
import { AppNav } from "@/components/layout/AppNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/lib/auth/context";
import { uploadAvatarImage } from "@/lib/supabase/storage";
import { GENRES } from "@/lib/data/mockData";
import { cn } from "@/lib/utils";

const WRITING_STYLE_TAGS = [
  "Literary", "Fast-paced", "Character-driven", "Plot-driven",
  "Lyrical Prose", "Dark Themes", "Hopeful", "Multiple POVs",
  "First Person", "Slow Burn", "Introspective", "Cinematic",
];

function SaveButton({ saving, saved }: { saving: boolean; saved: boolean }) {
  return (
    <Button type="submit" size="sm" disabled={saving} className="min-w-[90px]">
      {saving ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      ) : saved ? (
        <>
          <Check className="w-3.5 h-3.5" />
          Saved
        </>
      ) : (
        "Save"
      )}
    </Button>
  );
}

function SectionCard({ title, description, children }: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-parchment-deep bg-parchment overflow-hidden">
      <div className="px-6 pt-5 pb-4 border-b border-parchment-deep">
        <h2 className="font-serif text-base font-semibold text-ink">{title}</h2>
        {description && (
          <p className="text-xs text-ink-faint mt-0.5">{description}</p>
        )}
      </div>
      <div className="p-6">{children}</div>
    </section>
  );
}

export default function ProfilePage() {
  const router = useRouter();
  const { user, updateProfile, updatePassword } = useAuth();

  // Redirect if not logged in
  useEffect(() => {
    if (user === null) router.push("/signin");
  }, [user, router]);

  // ── Identity state ──────────────────────────────────────────────────────
  const [name, setName]               = useState(user?.name ?? "");
  const [bio, setBio]                 = useState(user?.bio ?? "");
  const [website, setWebsite]         = useState(user?.website ?? "");
  const [twitter, setTwitter]         = useState(user?.twitterHandle ?? "");
  const [instagram, setInstagram]     = useState(user?.instagramHandle ?? "");
  const [identitySaving, setIdentitySaving] = useState(false);
  const [identitySaved,  setIdentitySaved]  = useState(false);

  // ── Avatar ──────────────────────────────────────────────────────────────
  const fileRef                   = useRef<HTMLInputElement>(null);
  const [avatarPreview, setAvatarPreview] = useState(user?.avatarUrl ?? "");
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarError, setAvatarError]         = useState("");

  // ── Writing preferences state ───────────────────────────────────────────
  const [selectedGenres, setSelectedGenres] = useState<string[]>(user?.genrePreferences ?? []);
  const [styleTags, setStyleTags]           = useState<string[]>([]);
  const [prefsSaving, setPrefsSaving] = useState(false);
  const [prefsSaved,  setPrefsSaved]  = useState(false);

  // ── Goals state ─────────────────────────────────────────────────────────
  const [dailyGoal, setDailyGoal] = useState(user?.dailyWordGoal ?? 500);
  const [goalSaving, setGoalSaving] = useState(false);
  const [goalSaved,  setGoalSaved]  = useState(false);

  // ── Password state ──────────────────────────────────────────────────────
  const [currentPass, setCurrentPass] = useState("");
  const [newPass,     setNewPass]     = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [passSaving,  setPassSaving]  = useState(false);
  const [passSaved,   setPassSaved]   = useState(false);
  const [passError,   setPassError]   = useState("");

  if (!user) return null;

  const memberSince = new Date(user.createdAt).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  // ── Handlers ─────────────────────────────────────────────────────────────

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setAvatarError("Image must be under 5 MB.");
      return;
    }
    setAvatarError("");
    setAvatarUploading(true);
    try {
      const url = await uploadAvatarImage(file);
      await updateProfile({ avatarUrl: url });
      setAvatarPreview(url);
    } catch (err) {
      setAvatarError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setAvatarUploading(false);
    }
  }

  async function handleIdentitySave(e: React.FormEvent) {
    e.preventDefault();
    setIdentitySaving(true);
    try {
      await updateProfile({ name: name.trim(), bio, website, twitterHandle: twitter, instagramHandle: instagram });
      setIdentitySaved(true);
      setTimeout(() => setIdentitySaved(false), 2500);
    } finally {
      setIdentitySaving(false);
    }
  }

  async function handlePrefsSave(e: React.FormEvent) {
    e.preventDefault();
    setPrefsSaving(true);
    try {
      await updateProfile({ genrePreferences: selectedGenres });
      setPrefsSaved(true);
      setTimeout(() => setPrefsSaved(false), 2500);
    } finally {
      setPrefsSaving(false);
    }
  }

  async function handleGoalSave(e: React.FormEvent) {
    e.preventDefault();
    setGoalSaving(true);
    try {
      await updateProfile({ dailyWordGoal: dailyGoal });
      setGoalSaved(true);
      setTimeout(() => setGoalSaved(false), 2500);
    } finally {
      setGoalSaving(false);
    }
  }

  async function handlePasswordSave(e: React.FormEvent) {
    e.preventDefault();
    setPassError("");
    if (newPass.length < 8) {
      setPassError("New password must be at least 8 characters.");
      return;
    }
    if (newPass !== confirmPass) {
      setPassError("Passwords do not match.");
      return;
    }
    setPassSaving(true);
    try {
      await updatePassword(newPass);
      setPassSaved(true);
      setCurrentPass("");
      setNewPass("");
      setConfirmPass("");
      setTimeout(() => setPassSaved(false), 2500);
    } catch (err) {
      setPassError(err instanceof Error ? err.message : "Failed to update password.");
    } finally {
      setPassSaving(false);
    }
  }

  function toggleGenre(g: string) {
    setSelectedGenres((prev) =>
      prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g]
    );
  }

  function toggleStyle(tag: string) {
    setStyleTags((prev) =>
      prev.includes(tag) ? prev.filter((x) => x !== tag) : [...prev, tag]
    );
  }

  return (
    <div className="flex min-h-screen bg-parchment">
      <AppNav />
      <main className="flex-1 ml-48">

        {/* Header */}
        <div className="border-b border-parchment-deep px-8 py-6">
          <div className="max-w-2xl mx-auto">
            <h1 className="font-serif text-2xl font-semibold text-ink">Profile</h1>
            <p className="text-sm text-ink-faint mt-1">
              Your writer identity and preferences
            </p>
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-8 py-8 space-y-6">

          {/* ── Avatar hero ──────────────────────────────────────────────── */}
          <div className="flex items-center gap-5 p-5 rounded-xl border border-parchment-deep bg-parchment">
            <div className="relative shrink-0">
              <div className="w-20 h-20 rounded-full overflow-hidden bg-ink flex items-center justify-center">
                {avatarPreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="font-serif text-2xl font-semibold text-amber-label">
                    {user.name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)}
                  </span>
                )}
              </div>
              <button
                onClick={() => fileRef.current?.click()}
                disabled={avatarUploading}
                className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-ink border-2 border-parchment flex items-center justify-center hover:bg-ink-soft transition-colors"
              >
                {avatarUploading
                  ? <Loader2 className="w-3 h-3 text-parchment animate-spin" />
                  : <Camera className="w-3 h-3 text-parchment" />
                }
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleAvatarChange}
              />
            </div>
            <div>
              <p className="font-serif text-lg font-semibold text-ink">{user.name}</p>
              <p className="text-sm text-ink-faint">{user.email}</p>
              <p className="text-xs text-ink-faint mt-1">Member since {memberSince}</p>
              {avatarError && <p className="text-xs text-red-500 mt-1">{avatarError}</p>}
              <button
                onClick={() => fileRef.current?.click()}
                className="text-xs text-ink-muted underline underline-offset-2 hover:text-ink transition-colors mt-1"
              >
                Change photo
              </button>
            </div>
          </div>

          {/* ── Identity ─────────────────────────────────────────────────── */}
          <SectionCard
            title="Your Identity"
            description="How you appear across your books and workspace"
          >
            <form onSubmit={handleIdentitySave} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="pen-name">
                  <span className="flex items-center gap-1.5">
                    <PenLine className="w-3.5 h-3.5" />
                    Pen Name
                  </span>
                </Label>
                <Input
                  id="pen-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your writing name"
                  className="font-serif"
                />
                <p className="text-xs text-ink-faint">
                  This appears as the author name on your books.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">About the Author</Label>
                <Textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="A short bio — who you are, what you write, what drives your stories..."
                  rows={3}
                  className="resize-none"
                />
                <p className="text-xs text-ink-faint">
                  {bio.length}/300 characters
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="website">
                  <span className="flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5" />
                    Website
                  </span>
                </Label>
                <Input
                  id="website"
                  type="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://yoursite.com"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="twitter">
                    <span className="flex items-center gap-1.5">
                      <Twitter className="w-3.5 h-3.5" />
                      X / Twitter
                    </span>
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint text-sm">@</span>
                    <Input
                      id="twitter"
                      value={twitter}
                      onChange={(e) => setTwitter(e.target.value.replace(/^@/, ""))}
                      placeholder="handle"
                      className="pl-7"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="instagram">
                    <span className="flex items-center gap-1.5">
                      <Instagram className="w-3.5 h-3.5" />
                      Instagram
                    </span>
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint text-sm">@</span>
                    <Input
                      id="instagram"
                      value={instagram}
                      onChange={(e) => setInstagram(e.target.value.replace(/^@/, ""))}
                      placeholder="handle"
                      className="pl-7"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <SaveButton saving={identitySaving} saved={identitySaved} />
              </div>
            </form>
          </SectionCard>

          {/* ── Writing preferences ───────────────────────────────────────── */}
          <SectionCard
            title="What You Write"
            description="Select the genres and styles that define your work"
          >
            <form onSubmit={handlePrefsSave} className="space-y-5">
              <div className="space-y-2.5">
                <Label>Genres</Label>
                <div className="flex flex-wrap gap-2">
                  {GENRES.map((g) => (
                    <button
                      type="button"
                      key={g}
                      onClick={() => toggleGenre(g)}
                      className={cn(
                        "px-3 py-1.5 rounded-full text-xs font-medium border transition-all",
                        selectedGenres.includes(g)
                          ? "bg-ink text-parchment border-ink"
                          : "bg-transparent text-ink-muted border-parchment-deep hover:border-ink-faint hover:text-ink"
                      )}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2.5">
                <Label>Writing Style</Label>
                <div className="flex flex-wrap gap-2">
                  {WRITING_STYLE_TAGS.map((tag) => (
                    <button
                      type="button"
                      key={tag}
                      onClick={() => toggleStyle(tag)}
                      className={cn(
                        "px-3 py-1.5 rounded-full text-xs font-medium border transition-all",
                        styleTags.includes(tag)
                          ? "bg-gold/10 text-gold-dark border-gold/40"
                          : "bg-transparent text-ink-muted border-parchment-deep hover:border-ink-faint hover:text-ink"
                      )}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-ink-faint">
                  Style tags help define your voice as a writer.
                </p>
              </div>

              <div className="flex justify-end pt-1">
                <SaveButton saving={prefsSaving} saved={prefsSaved} />
              </div>
            </form>
          </SectionCard>

          {/* ── Goals & Habits ────────────────────────────────────────────── */}
          <SectionCard
            title="Goals & Habits"
            description="Set your daily writing intention"
          >
            <form onSubmit={handleGoalSave} className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="daily-goal">Daily Word Goal</Label>
                  <span className="text-sm font-medium text-ink tabular-nums">
                    {dailyGoal.toLocaleString()} words
                  </span>
                </div>
                <input
                  id="daily-goal"
                  type="range"
                  min={100}
                  max={5000}
                  step={50}
                  value={dailyGoal}
                  onChange={(e) => setDailyGoal(Number(e.target.value))}
                  className="w-full accent-gold"
                />
                <div className="flex justify-between text-xs text-ink-faint">
                  <span>100 words</span>
                  <span>2,500</span>
                  <span>5,000 words</span>
                </div>
              </div>

              <div className="rounded-lg bg-parchment-warm px-4 py-3">
                <p className="text-xs text-ink-muted leading-relaxed">
                  <span className="font-medium text-ink">
                    {dailyGoal >= 2000 ? "Ambitious writer" : dailyGoal >= 1000 ? "Dedicated writer" : dailyGoal >= 500 ? "Steady writer" : "Gentle habit"}
                    .
                  </span>{" "}
                  At {dailyGoal.toLocaleString()} words/day you&apos;ll finish an 80,000-word novel in{" "}
                  <span className="font-medium text-ink">
                    {Math.ceil(80000 / dailyGoal)} days
                  </span>
                  .
                </p>
              </div>

              <div className="flex justify-end">
                <SaveButton saving={goalSaving} saved={goalSaved} />
              </div>
            </form>
          </SectionCard>

          {/* ── Account ──────────────────────────────────────────────────── */}
          <SectionCard
            title="Account"
            description="Email address and security"
          >
            <div className="space-y-5">
              {/* Email — read-only */}
              <div className="space-y-2">
                <Label>
                  <span className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5" />
                    Email Address
                  </span>
                </Label>
                <div className="flex items-center h-10 px-4 rounded-xl bg-parchment-warm border border-parchment-deep text-sm text-ink-muted">
                  {user.email}
                </div>
                <p className="text-xs text-ink-faint">
                  Email changes require contacting support.
                </p>
              </div>

              <div className="border-t border-parchment-deep pt-5">
                <form onSubmit={handlePasswordSave} className="space-y-3">
                  <div className="flex items-center gap-2 mb-3">
                    <KeyRound className="w-3.5 h-3.5 text-ink-muted" />
                    <p className="text-sm font-medium text-ink">Change Password</p>
                  </div>

                  <Input
                    type="password"
                    placeholder="Current password"
                    value={currentPass}
                    onChange={(e) => setCurrentPass(e.target.value)}
                    autoComplete="current-password"
                  />
                  <Input
                    type="password"
                    placeholder="New password (min 8 characters)"
                    value={newPass}
                    onChange={(e) => setNewPass(e.target.value)}
                    autoComplete="new-password"
                  />
                  <Input
                    type="password"
                    placeholder="Confirm new password"
                    value={confirmPass}
                    onChange={(e) => setConfirmPass(e.target.value)}
                    autoComplete="new-password"
                  />

                  {passError && (
                    <p className="text-xs text-red-500">{passError}</p>
                  )}

                  <div className="flex justify-end">
                    <SaveButton saving={passSaving} saved={passSaved} />
                  </div>
                </form>
              </div>
            </div>
          </SectionCard>

        </div>
      </main>
    </div>
  );
}
