"use client";

import { ThemeProvider } from "./theme-provider";
import { AuthProvider } from "./auth-provider";
import { QueryProvider } from "./query-provider";
import { PresenceProvider } from "./presence-provider";

import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";

export function Providers({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider>
      <QueryProvider>
        <AuthProvider>
          <PresenceProvider>
            <TooltipProvider delay={200}>
              {children}
              <Toaster
                position="top-right"
                richColors
              />
            </TooltipProvider>
          </PresenceProvider>
        </AuthProvider>
      </QueryProvider>
    </ThemeProvider>
  );
}