"use client";

import {
  Download,
  FileText,
  Share2,
  Printer,
  Moon,
  Sun,
  Type,
  BookMarked,
  Feather,
  Clock,
  Target,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AppNav } from "@/components/layout/AppNav";
import { cn } from "@/lib/utils";
import { useTheme } from "@/lib/theme";
import { useAuth } from "@/lib/auth/context";
import { useWritingSettings } from "@/lib/writing-settings";
import { useToast } from "@/lib/toast/context";

function SettingRow({
  icon: Icon,
  title,
  description,
  action,
  badge,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  action?: React.ReactNode;
  badge?: string;
}) {
  return (
    <div className="flex items-center justify-between py-4 gap-4">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-8 h-8 rounded-lg bg-parchment-warm flex items-center justify-center shrink-0">
          <Icon className="w-4 h-4 text-ink-muted" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium text-ink">{title}</p>
            {badge && (
              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-gold/10 text-gold-dark border border-gold/20">
                {badge}
              </span>
            )}
          </div>
          <p className="text-xs text-ink-faint mt-0.5">{description}</p>
        </div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

function ToggleSetting({
  icon: Icon,
  title,
  description,
  checked,
  onToggle,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="flex items-center justify-between py-4 gap-4">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-8 h-8 rounded-lg bg-parchment-warm flex items-center justify-center shrink-0">
          <Icon className="w-4 h-4 text-ink-muted" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-ink">{title}</p>
          <p className="text-xs text-ink-faint mt-0.5">{description}</p>
        </div>
      </div>
      <button
        type="button"
        onClick={onToggle}
        aria-pressed={checked}
        className={cn(
          "rounded-full relative transition-colors shrink-0",
          checked ? "bg-gold" : "bg-parchment-deep"
        )}
        style={{ height: "22px", minWidth: "40px" }}
      >
        <div
          className={cn(
            "toggle-knob absolute top-0.5 w-4 h-4 rounded-full shadow-sm transition-transform",
            checked ? "translate-x-5" : "translate-x-0.5"
          )}
        />
      </button>
    </div>
  );
}

export default function SettingsPage() {
  const { user } = useAuth();
  const { settings, updateSettings } = useWritingSettings(user?.id);
  const { theme, toggle: toggleTheme } = useTheme();
  const { toast } = useToast();

  function handleFontSizeChange(size: "small" | "medium" | "large") {
    if (settings.editorFontSize === size) return;

    updateSettings({ editorFontSize: size });
    toast({
      variant: "success",
      title: `Editor font set to ${size}`,
      description: "Your writing editor now uses this text size.",
    });
  }

  function handleAutoSaveToggle() {
    const next = !settings.autoSave;
    updateSettings({ autoSave: next });
    toast({
      variant: "success",
      title: next ? "Auto-save enabled" : "Auto-save paused",
      description: next
        ? "Changes will save automatically while you write."
        : "Remember to save manually while this is off.",
    });
  }

  function handleThemeToggle() {
    const nextTheme = theme === "dark" ? "light" : "dark";
    toggleTheme();
    toast({
      variant: "success",
      title: nextTheme === "dark" ? "Dark mode enabled" : "Light mode enabled",
      description: "Your appearance preference has been updated.",
    });
  }

  function handleSpellcheckToggle() {
    const next = !settings.spellcheck;
    updateSettings({ spellcheck: next });
    toast({
      variant: "success",
      title: next ? "Spellcheck enabled" : "Spellcheck disabled",
      description: next
        ? "Misspelled words will be highlighted as you type."
        : "Spellcheck highlights are now hidden.",
    });
  }

  function handleDailyGoalToggle() {
    const next = !settings.dailyWordGoalEnabled;
    updateSettings({ dailyWordGoalEnabled: next });
    toast({
      variant: "success",
      title: next ? "Daily Goal enabled" : "Daily Goal hidden",
      description: next
        ? "Your dashboard will show daily goal progress."
        : "Daily goal tracking is hidden until you turn it back on.",
    });
  }

  function handleSessionTimerToggle() {
    const next = !settings.sessionTimer;
    updateSettings({ sessionTimer: next });
    toast({
      variant: "success",
      title: next ? "Session Timer enabled" : "Session Timer hidden",
      description: next
        ? "Writing sessions now display a live timer."
        : "Session timer is now turned off.",
    });
  }

  return (
    <div className="flex min-h-screen bg-parchment">
      <AppNav />
      <main className="flex-1 md:ml-48">
        {/* Header */}
        <div className="border-b border-parchment-deep px-8 py-6">
          <div className="max-w-2xl mx-auto">
            <h1 className="font-serif text-2xl font-semibold text-ink">Settings</h1>
            <p className="text-sm text-ink-faint mt-1">
              Preferences, export options, and writing tools
            </p>
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-8 py-8 space-y-8">
          {/* Export */}
          <section>
            <h2 className="font-serif text-base font-semibold text-ink mb-1">Export & Share</h2>
            <p className="text-xs text-ink-faint mb-4">
              Export your manuscript in various formats for publishing or sharing.
            </p>
            <div className="rounded-xl border border-parchment-deep bg-parchment divide-y divide-parchment-deep">
              <SettingRow
                icon={FileText}
                title="Export as PDF"
                description="Generate a beautifully formatted PDF of your complete manuscript"
                badge="Coming Soon"
                action={
                  <Button variant="outline" size="sm" className="text-xs opacity-60 cursor-not-allowed" disabled>
                    <Download className="w-3.5 h-3.5" />
                    Export PDF
                  </Button>
                }
              />
              <SettingRow
                icon={BookMarked}
                title="Export Manuscript"
                description="Export as a clean .docx file formatted for submission"
                badge="Coming Soon"
                action={
                  <Button variant="outline" size="sm" className="text-xs opacity-60 cursor-not-allowed" disabled>
                    <Download className="w-3.5 h-3.5" />
                    Export .docx
                  </Button>
                }
              />
              <SettingRow
                icon={Printer}
                title="Print Preview"
                description="Preview how your manuscript looks before printing"
                badge="Coming Soon"
                action={
                  <Button variant="outline" size="sm" className="text-xs opacity-60 cursor-not-allowed" disabled>
                    <Printer className="w-3.5 h-3.5" />
                    Print
                  </Button>
                }
              />
              <SettingRow
                icon={Share2}
                title="Share Preview Link"
                description="Generate a shareable link to your book preview for beta readers"
                badge="Coming Soon"
                action={
                  <Button variant="outline" size="sm" className="text-xs opacity-60 cursor-not-allowed" disabled>
                    <Share2 className="w-3.5 h-3.5" />
                    Share
                  </Button>
                }
              />
            </div>
          </section>

          {/* Editor Preferences */}
          <section>
            <h2 className="font-serif text-base font-semibold text-ink mb-1">Editor Preferences</h2>
            <p className="text-xs text-ink-faint mb-4">
              Customise your writing environment.
            </p>
            <div className="rounded-xl border border-parchment-deep bg-parchment divide-y divide-parchment-deep">
              <div className="py-4 px-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-parchment-warm flex items-center justify-center">
                    <Type className="w-4 h-4 text-ink-muted" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-ink">Editor Font Size</p>
                    <p className="text-xs text-ink-faint mt-0.5">Adjust the size of text in the writing editor</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 bg-parchment-warm rounded-lg p-1">
                  {(["small", "medium", "large"] as const).map((size) => (
                    <button
                      key={size}
                      onClick={() => handleFontSizeChange(size)}
                      className={cn(
                        "px-2.5 py-1 rounded-md text-xs transition-all capitalize",
                        settings.editorFontSize === size ? "bg-parchment text-ink shadow-sm font-medium" : "text-ink-muted hover:text-ink"
                      )}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              <div className="px-4">
                <ToggleSetting
                  icon={Feather}
                  title="Auto-save"
                  description="Automatically save your writing every few seconds"
                  checked={settings.autoSave}
                  onToggle={handleAutoSaveToggle}
                />
              </div>
              <div className="px-4">
                <ToggleSetting
                  icon={theme === "dark" ? Sun : Moon}
                  title="Dark Mode"
                  description="Switch to a dark theme for night-time writing"
                  checked={theme === "dark"}
                  onToggle={handleThemeToggle}
                />
              </div>
              <div className="px-4">
                <ToggleSetting
                  icon={Sparkles}
                  title="Spellcheck"
                  description="Highlight misspelled words as you type"
                  checked={settings.spellcheck}
                  onToggle={handleSpellcheckToggle}
                />
              </div>
            </div>
          </section>

          {/* Writing Tools */}
          <section>
            <h2 className="font-serif text-base font-semibold text-ink mb-1">Writing Tools</h2>
            <p className="text-xs text-ink-faint mb-4">
              Track your writing habits and progress.
            </p>
            <div className="rounded-xl border border-parchment-deep bg-parchment divide-y divide-parchment-deep">
              <div className="px-4">
                <ToggleSetting
                  icon={Target}
                  title="Daily Word Goal"
                  description="Show or hide daily goal tracking on your dashboard"
                  checked={settings.dailyWordGoalEnabled}
                  onToggle={handleDailyGoalToggle}
                />
              </div>
              <div className="px-4">
                <ToggleSetting
                  icon={Clock}
                  title="Session Timer"
                  description="Show a timer to track how long you write each session"
                  checked={settings.sessionTimer}
                  onToggle={handleSessionTimerToggle}
                />
              </div>
            </div>
          </section>

          {/* About */}
          <section>
            <div className="rounded-xl border border-parchment-deep bg-parchment p-5">
              <div className="flex items-center gap-2 mb-3">
                <BookMarked className="w-4 h-4 text-ink-muted" />
                <h2 className="font-serif text-base font-semibold text-ink">About Prologue</h2>
              </div>
              <p className="text-sm text-ink-muted leading-relaxed">
                Prologue is a premium novel-writing studio built for serious fiction authors.
                Every decision in this product is made with the writer's experience in mind.
              </p>
              <div className="flex items-center gap-4 mt-4 pt-4 border-t border-parchment-deep">
                <span className="text-xs text-ink-faint">Version 0.1.0</span>
                <span className="text-xs text-ink-faint">·</span>
                <span className="text-xs text-ink-faint">Made for writers</span>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
