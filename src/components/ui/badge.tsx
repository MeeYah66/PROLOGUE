import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-parchment-deep text-ink-muted",
        draft: "bg-amber-50 text-amber-700 border border-amber-200",
        revised: "bg-blue-50 text-blue-700 border border-blue-200",
        final: "bg-emerald-50 text-emerald-700 border border-emerald-200",
        ongoing: "bg-gold/10 text-gold-dark border border-gold/30",
        completed: "bg-sage/10 text-sage-dark border border-sage/30",
        genre: "bg-parchment-warm text-ink-soft border border-parchment-deep",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
