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
        "hover:shadow-[inset_0_0_0_1px_rgba(201,168,76,0.18)]",
        isPrimary
          ? "bg-parchment-warm/82 shadow-[inset_0_0_0_1px_rgba(201,168,76,0.24)]"
          : "bg-parchment/50 hover:bg-parchment-warm/62",
        className
      )}
    >
      <div
        className={cn(
          "w-9 h-9 rounded-lg border flex items-center justify-center mb-3.5 transition-colors",
          isPrimary
            ? "bg-parchment border-gold/35 text-gold-dark"
            : "bg-parchment-warm/82 border-parchment-deep text-ink-muted group-hover:text-ink"
        )}
      >
        <Icon className="w-4 h-4" />
      </div>

      <div className="flex items-center gap-2 mb-1.5">
        <p className="font-serif text-[1.28rem] font-semibold text-ink leading-[1.2] tracking-tight">{title}</p>
        {isPrimary && (
          <span className="inline-flex h-5 items-center rounded-full bg-gold/12 px-2 text-[9px] uppercase tracking-[0.16em] text-amber-label font-semibold">
            Recommended
          </span>
        )}
      </div>

      <p className="text-sm text-ink-muted leading-relaxed mb-2.5">{description}</p>
      {microcopy && (
        <p className="text-[13px] text-ink-faint leading-relaxed mb-4">
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
            "w-full h-9 text-sm justify-center gap-1.5 rounded-lg",
            isPrimary
              ? "bg-ink text-parchment hover:bg-ink-soft"
              : "bg-parchment border-parchment-deep hover:border-gold/35 hover:bg-parchment-warm"
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
          <DialogHeader className="space-y-1.5">
            <p className="text-[10px] uppercase tracking-[0.14em] text-amber-label font-semibold">
              New manuscript
            </p>
            <DialogTitle className="font-serif text-2xl font-semibold leading-tight tracking-tight text-ink">
              How would you like to begin?
            </DialogTitle>
            <DialogDescription className="text-sm leading-relaxed max-w-[63ch] text-ink-muted">
              Start something new, or continue a story you&apos;ve already begun.
            </DialogDescription>
          </DialogHeader>

          <div className="my-4 h-px bg-parchment-deep/85" />

          <div className="rounded-2xl border border-parchment-deep/90 bg-parchment-warm/35 overflow-hidden">
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
