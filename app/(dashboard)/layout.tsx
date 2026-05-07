import { DashboardChrome } from "@/components/layout/dashboard-chrome";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#F8F9FC]">
      <DashboardChrome>{children}</DashboardChrome>
    </div>
  );
}
