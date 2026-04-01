"use client";

import { useRouter } from "next/navigation";
import { ArrowRight, Feather, FileUp } from "lucide-react";
import type { ElementType } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface NewManuscriptDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ChoiceCardProps {
  title: string;
  description: string;
  microcopy?: string;
  cta: string;
  icon: ElementType;
  onSelect: () => void;
  primary?: boolean;
  className?: string;
}

function ChoiceCard({
  title,
  description,
  microcopy,
  cta,
  icon: Icon,
  onSelect,
  primary = false,
  className,
}: ChoiceCardProps) {
  return (
    <button
      type="button"
      autoFocus={primary}
      onClick={onSelect}
      className={cn(
        "group text-left rounded-2xl border p-5 sm:p-6 transition-all duration-250 ease-out relative overflow-hidden",
        "hover:-translate-y-0.5 hover:shadow-[0_16px_28px_rgba(30,22,10,0.08)]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/45 focus-visible:ring-offset-2 focus-visible:ring-offset-parchment",
        primary
          ? "border-gold/35 bg-white shadow-[0_10px_22px_rgba(32,22,8,0.06)] sm:scale-[1.015]"
          : "border-parchment-deep/70 bg-parchment-warm/35 hover:bg-parchment-warm/55 hover:border-gold/30",
        className
      )}
    >
      <span
        className={cn(
          "pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300",
          primary
            ? "bg-gradient-to-br from-gold/10 via-transparent to-transparent group-hover:opacity-100"
            : "bg-gradient-to-br from-parchment-warm/40 via-transparent to-transparent group-hover:opacity-100"
        )}
      />

      <div
        className={cn(
          "relative z-[1] w-11 h-11 rounded-xl border flex items-center justify-center mb-4 transition-colors",
          primary
            ? "bg-parchment-warm border-gold/35 text-gold-dark"
            : "bg-white/85 border-parchment-deep text-ink-muted group-hover:text-ink"
        )}
      >
        <Icon className="w-[1.1rem] h-[1.1rem]" />
      </div>

      <p className="relative z-[1] font-serif text-[1.88rem] font-semibold text-ink mb-2 leading-snug">
        {title}
      </p>
      <p className="relative z-[1] text-[0.99rem] text-ink-muted leading-relaxed mb-3.5">{description}</p>
      {microcopy && (
        <p className="relative z-[1] text-xs text-ink-faint leading-relaxed mb-4">
          {microcopy}
        </p>
      )}

      <span className="relative z-[1] inline-flex items-center gap-1.5 text-sm font-medium text-ink">
        {cta}
        <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
      </span>
    </button>
  );
}

export function NewManuscriptDialog({ open, onOpenChange }: NewManuscriptDialogProps) {
  const router = useRouter();

  function goTo(path: string) {
    onOpenChange(false);
    router.push(path);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-7 sm:p-8">
        <DialogHeader className="mb-2">
          <p className="text-[11px] uppercase tracking-[0.17em] text-amber-label font-semibold mb-1">
            New manuscript
          </p>
          <DialogTitle>How would you like to begin?</DialogTitle>
          <DialogDescription className="text-sm leading-relaxed">
            Start something new, or continue a story you&apos;ve already begun.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4.5 mt-2">
          <ChoiceCard
            title="Start from scratch"
            description="Open a blank manuscript and begin writing from the first line."
            cta="Create new manuscript"
            icon={Feather}
            primary
            onSelect={() => goTo("/books/new")}
          />
          <ChoiceCard
            title="Import existing manuscript"
            description="Upload .docx, .txt, or .pdf and continue your story inside the studio."
            microcopy="Keep your existing structure and refine chapters once imported."
            cta="Import manuscript"
            icon={FileUp}
            onSelect={() => goTo("/import")}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
