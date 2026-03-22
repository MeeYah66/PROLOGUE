"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "./types";

// ─── Helpers ───────────────────────────────────────────────────────────────

function getRedirectUrl(): string {
  return window.location.origin + "/auth/callback";
}

function mapUser(sbUser: NonNullable<Awaited<ReturnType<ReturnType<typeof createClient>["auth"]["getUser"]>>["data"]["user"]>): User {
  const meta = sbUser.user_metadata ?? {};
  return {
    id:                 sbUser.id,
    email:              sbUser.email!,
    name:               meta.name ?? sbUser.email!.split("@")[0],
    avatarUrl:          meta.avatarUrl ?? undefined,
    bio:                meta.bio ?? undefined,
    website:            meta.website ?? undefined,
    twitterHandle:      meta.twitterHandle ?? undefined,
    instagramHandle:    meta.instagramHandle ?? undefined,
    genrePreferences:   meta.genrePreferences ?? [],
    dailyWordGoal:      meta.dailyWordGoal ?? 500,
    createdAt:          sbUser.created_at,
  };
}

// ─── Context ───────────────────────────────────────────────────────────────

interface ProfileUpdates {
  name?: string;
  avatarUrl?: string;
  bio?: string;
  website?: string;
  twitterHandle?: string;
  instagramHandle?: string;
  genrePreferences?: string[];
  dailyWordGoal?: number;
}

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  signUp:          (name: string, email: string, password: string) => Promise<void>;
  signIn:          (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut:         () => void;
  updateProfile:   (updates: ProfileUpdates) => Promise<void>;
  updatePassword:  (newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// ─── Provider ──────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser]       = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ? mapUser(session.user) : null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ? mapUser(session.user) : null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function signUp(name: string, email: string, password: string): Promise<void> {
    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    });
    if (error) throw new Error(error.message);
  }

  async function signIn(email: string, password: string): Promise<void> {
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message);
  }

  async function signInWithGoogle(): Promise<void> {
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: getRedirectUrl() },
    });
    if (error) throw new Error(error.message);
  }

  function signOut(): void {
    const supabase = createClient();
    supabase.auth.signOut().then(() => {
      window.location.href = "/signup";
    });
  }

  async function updateProfile(updates: ProfileUpdates): Promise<void> {
    const supabase = createClient();
    const { data, error } = await supabase.auth.updateUser({ data: updates });
    if (error) throw new Error(error.message);
    if (data.user) setUser(mapUser(data.user));
  }

  async function updatePassword(newPassword: string): Promise<void> {
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw new Error(error.message);
  }

  return (
    <AuthContext.Provider value={{ user, loading, signUp, signIn, signInWithGoogle, signOut, updateProfile, updatePassword }}>
      {children}
    </AuthContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}
