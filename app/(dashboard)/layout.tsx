import { redirect } from "next/navigation";
import { DashboardChrome } from "@/components/layout/dashboard-chrome";
import { auth } from "@/lib/auth";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      <DashboardChrome>{children}</DashboardChrome>
    </div>
  );
}
