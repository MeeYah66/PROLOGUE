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
  ctaLabel: string;
  tone?: "primary" | "secondary";
  icon: ElementType;
  onSelect: () => void;
  className?: string;
}

function ChoiceCard({
  title,
  description,
  microcopy,
  ctaLabel,
  tone = "secondary",
  icon: Icon,
  onSelect,
  className,
}: ChoiceCardProps) {
  const isPrimary = tone === "primary";

  return (
    <article
      className={cn(
        "group relative h-full min-h-[236px] text-left flex flex-col p-5 sm:p-6 transition-all duration-200",
        "hover:shadow-[inset_0_0_0_1px_rgba(201,168,76,0.22)]",
        isPrimary ? "bg-white/95 hover:bg-white" : "bg-parchment/35 hover:bg-parchment/60",
        className
      )}
    >
      <div
        className={cn(
          "w-9 h-9 rounded-lg border flex items-center justify-center mb-3.5 transition-colors",
          isPrimary
            ? "bg-parchment-warm border-gold/35 text-gold-dark"
            : "bg-white/85 border-parchment-deep text-ink-muted group-hover:text-ink"
        )}
      >
        <Icon className="w-4 h-4" />
      </div>

      <div className="flex items-center gap-2 mb-1.5">
        <p className="font-serif text-[1.22rem] font-semibold text-ink leading-[1.2]">{title}</p>
        {isPrimary && (
          <span className="inline-flex h-5 items-center rounded-full bg-gold/14 px-2 text-[10px] uppercase tracking-[0.12em] text-amber-label font-semibold">
            Recommended
          </span>
        )}
      </div>

      <p className="text-[0.9rem] text-ink-muted leading-relaxed mb-2.5">{description}</p>
      {microcopy && (
        <p className="text-xs text-ink-faint leading-relaxed mb-4">
          {microcopy}
        </p>
      )}

      <div className="mt-auto pt-3">
        <Button
          type="button"
          autoFocus={isPrimary}
          onClick={onSelect}
          variant={isPrimary ? "default" : "outline"}
          className={cn(
            "w-full h-9 text-[0.9rem] justify-center gap-1.5",
            isPrimary
              ? "bg-ink text-parchment hover:bg-ink-soft"
              : "bg-white/80 border-parchment-deep hover:border-gold/35 hover:bg-white"
          )}
        >
          {ctaLabel}
          <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
        </Button>
      </div>
    </article>
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
      <DialogContent className="max-w-[760px] p-0 overflow-hidden">
        <div className="p-6 sm:p-7">
          <DialogHeader className="space-y-1">
            <p className="text-[11px] uppercase tracking-[0.17em] text-amber-label font-semibold">
              New manuscript
            </p>
            <DialogTitle className="text-[1.44rem] leading-tight">
              How would you like to begin?
            </DialogTitle>
            <DialogDescription className="text-[0.92rem] leading-relaxed max-w-[63ch]">
              Start something new, or continue a story you&apos;ve already begun.
            </DialogDescription>
          </DialogHeader>

          <div className="my-4 h-px bg-parchment-deep" />

          <div className="rounded-2xl border border-parchment-deep bg-parchment-warm/35 overflow-hidden">
            <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-parchment-deep/85">
              <ChoiceCard
                title="Start from scratch"
                description="Open a blank manuscript and begin from the very first line."
                ctaLabel="Create manuscript"
                icon={Feather}
                tone="primary"
                onSelect={() => goTo("/books/new")}
              />
              <ChoiceCard
                title="Import existing manuscript"
                description="Bring in .docx, .txt, or .pdf and continue writing in your studio."
                microcopy="Your structure comes in editable so you can refine chapters before publishing."
                ctaLabel="Import manuscript"
                icon={FileUp}
                onSelect={() => goTo("/import")}
              />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
