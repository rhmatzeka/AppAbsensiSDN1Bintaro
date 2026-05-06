"use client";

import { Header } from "@/components/layout/header";
import { MobileBottomNav, Sidebar } from "@/components/layout/sidebar";

export function DashboardChrome({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex min-h-screen max-w-[1600px] bg-[#FAFAFA]">
      <Sidebar />
      <div className="min-w-0 flex-1">
        <Header />
        <main className="pb-24 pl-4 pr-4 pt-5 sm:p-5 md:p-6">{children}</main>
      </div>
      <MobileBottomNav />
    </div>
  );
}
