"use client";

import { Suspense } from "react";
import { SessionProvider } from "next-auth/react";
import { NavigationFeedback } from "@/components/ui/navigation-feedback";
import { ToastProvider } from "@/components/ui/toast";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ToastProvider>
        {children}
        <Suspense fallback={null}>
          <NavigationFeedback />
        </Suspense>
      </ToastProvider>
    </SessionProvider>
  );
}
