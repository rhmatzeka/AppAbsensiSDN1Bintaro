import { DashboardChrome } from "@/components/layout/dashboard-chrome";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      <DashboardChrome>{children}</DashboardChrome>
    </div>
  );
}
