"use client";

import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/lib/auth/context";
import { ThemeProvider } from "@/lib/theme";
import { AmbientProvider } from "@/lib/ambient";
import { ToastProvider } from "@/lib/toast/context";
import type { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <AmbientProvider>
        <AuthProvider>
          <ToastProvider>
            <TooltipProvider delayDuration={400}>
              {children}
            </TooltipProvider>
          </ToastProvider>
        </AuthProvider>
      </AmbientProvider>
    </ThemeProvider>
  );
}
