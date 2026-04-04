"use client";

import { useCallback, useEffect, useState } from "react";

export type EditorFontSize = "small" | "medium" | "large";

export interface WritingSettings {
  editorFontSize: EditorFontSize;
  autoSave: boolean;
  spellcheck: boolean;
  dailyWordGoalEnabled: boolean;
  sessionTimer: boolean;
}

const STORAGE_PREFIX = "prologue_writing_settings";
const SETTINGS_EVENT = "prologue:writing-settings-updated";

const DEFAULT_SETTINGS: WritingSettings = {
  editorFontSize: "medium",
  autoSave: true,
  spellcheck: true,
  dailyWordGoalEnabled: true,
  sessionTimer: false,
};

function storageKey(userId?: string): string | null {
  if (!userId) return null;
  return `${STORAGE_PREFIX}_${userId}`;
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function sanitizeSettings(value: unknown): WritingSettings {
  if (!isObject(value)) return DEFAULT_SETTINGS;

  const fontSize = value.editorFontSize;
  const safeFontSize: EditorFontSize =
    fontSize === "small" || fontSize === "medium" || fontSize === "large"
      ? fontSize
      : DEFAULT_SETTINGS.editorFontSize;

  return {
    editorFontSize: safeFontSize,
    autoSave:
      typeof value.autoSave === "boolean"
        ? value.autoSave
        : DEFAULT_SETTINGS.autoSave,
    spellcheck:
      typeof value.spellcheck === "boolean"
        ? value.spellcheck
        : DEFAULT_SETTINGS.spellcheck,
    dailyWordGoalEnabled:
      typeof value.dailyWordGoalEnabled === "boolean"
        ? value.dailyWordGoalEnabled
        : DEFAULT_SETTINGS.dailyWordGoalEnabled,
    sessionTimer:
      typeof value.sessionTimer === "boolean"
        ? value.sessionTimer
        : DEFAULT_SETTINGS.sessionTimer,
  };
}

export function readWritingSettings(userId?: string): WritingSettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  const key = storageKey(userId);
  if (!key) return DEFAULT_SETTINGS;

  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return DEFAULT_SETTINGS;
    return sanitizeSettings(JSON.parse(raw));
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function writeWritingSettings(
  userId: string | undefined,
  settings: WritingSettings
): void {
  if (typeof window === "undefined") return;
  const key = storageKey(userId);
  if (!key) return;

  try {
    window.localStorage.setItem(key, JSON.stringify(settings));
    window.dispatchEvent(
      new CustomEvent(SETTINGS_EVENT, { detail: { userId: userId ?? null } })
    );
  } catch {
    // ignore storage failures
  }
}

export function useWritingSettings(userId?: string) {
  const [settings, setSettings] = useState<WritingSettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    if (typeof window === "undefined") return;

    setSettings(readWritingSettings(userId));

    const onStorage = (event: StorageEvent) => {
      const key = storageKey(userId);
      if (!key) return;
      if (event.key !== key) return;
      setSettings(readWritingSettings(userId));
    };

    const onCustomUpdate = () => {
      setSettings(readWritingSettings(userId));
    };

    window.addEventListener("storage", onStorage);
    window.addEventListener(SETTINGS_EVENT, onCustomUpdate);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(SETTINGS_EVENT, onCustomUpdate);
    };
  }, [userId]);

  const updateSettings = useCallback(
    (patch: Partial<WritingSettings>) => {
      const next = { ...readWritingSettings(userId), ...patch };
      writeWritingSettings(userId, next);
      setSettings(next);
    },
    [userId]
  );

  return { settings, updateSettings };
}
