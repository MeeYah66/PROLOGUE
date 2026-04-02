"use client";

import Link from "next/link";
import { ArrowLeft, Download, Menu } from "lucide-react";
import { useState } from "react";
import { AppNav } from "@/components/layout/AppNav";
import { ExportCenter } from "@/components/export/ExportCenter";

function ExportTopBar({ onOpenNav }: { onOpenNav: () => void }) {
  return (
    <div className="sticky top-0 z-30 h-12 px-3 md:px-6 bg-parchment/95 backdrop-blur-sm border-b border-parchment-deep">
      <div className="h-full max-w-5xl mx-auto flex items-center">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            onClick={onOpenNav}
            aria-label="Open navigation"
            className="md:hidden w-8 h-8 flex items-center justify-center rounded-full border border-parchment-deep text-ink-faint hover:text-ink hover:border-ink-faint transition-all"
          >
            <Menu className="w-3.5 h-3.5" strokeWidth={1.8} />
          </button>

          <Link
            href="/library"
            className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-lg text-sm text-ink-faint hover:text-ink hover:bg-parchment-warm transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back
          </Link>

          <span className="h-4 w-px bg-parchment-deep/90 mx-0.5" />
          <p className="text-[10px] sm:text-[11px] font-sans uppercase tracking-[0.17em] font-semibold text-amber-label">
            Export Center
          </p>
        </div>
      </div>
    </div>
  );
}

export default function ExportPage() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="flex min-h-screen" style={{ background: "var(--page-gradient)" }}>
      <AppNav mobileOpen={mobileNavOpen} onMobileClose={() => setMobileNavOpen(false)} />

      <main className="flex-1 md:ml-48 pb-12">
        <ExportTopBar onOpenNav={() => setMobileNavOpen(true)} />

        <div className="max-w-5xl mx-auto px-4 md:px-8 pt-8">
          <div className="max-w-[780px] mb-7">
            <h1 className="font-serif text-[2rem] md:text-[2.25rem] leading-tight font-semibold text-ink tracking-tight text-balance">
              Export, print, and share your manuscripts.
            </h1>
            <p className="text-sm text-ink-muted mt-3 max-w-[700px] leading-relaxed">
              Choose a manuscript and export it in the format you need. The flow is built for quick handoff to readers, editors, and publishers.
            </p>
          </div>

          <div className="rounded-2xl border border-parchment-deep bg-parchment p-5 md:p-6">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-8 h-8 rounded-lg bg-parchment-warm border border-parchment-deep flex items-center justify-center">
                <Download className="w-4 h-4 text-ink-muted" />
              </div>
              <p className="text-sm font-medium text-ink">Manuscript Export</p>
            </div>
            <ExportCenter />
          </div>
        </div>
      </main>
    </div>
  );
}

