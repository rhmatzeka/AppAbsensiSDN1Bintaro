"use client";

import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";

export function DashboardChrome({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex min-h-screen max-w-[1600px] bg-[#F8F9FC]">
      <Sidebar />
      <div className="min-w-0 flex-1">
        <Header />
        <main className="pb-6 pl-4 pr-4 pt-5 sm:p-5 md:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
