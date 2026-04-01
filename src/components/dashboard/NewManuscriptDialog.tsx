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
  cta: string;
  icon: ElementType;
  onSelect: () => void;
  className?: string;
}

function ChoiceCard({
  title,
  description,
  cta,
  icon: Icon,
  onSelect,
  className,
}: ChoiceCardProps) {
  return (
    <button
      onClick={onSelect}
      className={cn(
        "text-left rounded-xl border border-parchment-deep bg-white p-4 hover:border-gold/45 hover:bg-parchment-warm/50 transition-all",
        className
      )}
    >
      <div className="w-9 h-9 rounded-full bg-parchment-warm border border-parchment-deep flex items-center justify-center mb-3">
        <Icon className="w-4 h-4 text-ink-muted" />
      </div>
      <p className="font-serif text-lg font-semibold text-ink mb-1.5 leading-snug">{title}</p>
      <p className="text-sm text-ink-muted leading-relaxed mb-4">{description}</p>
      <span className="inline-flex items-center gap-1.5 text-sm font-medium text-ink">
        {cta}
        <ArrowRight className="w-3.5 h-3.5" />
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
          <DialogTitle>Bring your next chapter to life</DialogTitle>
          <DialogDescription className="text-sm leading-relaxed">
            Start a fresh manuscript, or bring in pages you have already written and continue in
            Prologue.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <ChoiceCard
            title="Start from scratch"
            description="Open a blank manuscript and begin writing from the first line."
            cta="Create new manuscript"
            icon={Feather}
            onSelect={() => goTo("/books/new")}
          />
          <ChoiceCard
            title="Import existing manuscript"
            description="Upload .docx, .txt, or .pdf and continue your story inside the studio."
            cta="Import manuscript"
            icon={FileUp}
            onSelect={() => goTo("/import")}
          />
        </div>

        <div className="rounded-xl border border-parchment-deep bg-parchment-warm/45 p-3.5 flex items-start justify-between gap-3 mt-1">
          <p className="text-xs text-ink-muted leading-relaxed">
            Import keeps your draft editable. You can rename, reorder, merge, and split detected
            chapters before creating the manuscript.
          </p>
          <Button size="sm" variant="outline" className="shrink-0 h-8" onClick={() => goTo("/import")}>
            Import now
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
