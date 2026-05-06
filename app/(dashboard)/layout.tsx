import { redirect } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { auth } from "@/lib/auth";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      <div className="mx-auto flex min-h-screen max-w-[1600px] bg-[#FAFAFA]">
        <Sidebar />
        <div className="min-w-0 flex-1">
          <Header />
          <main className="p-4 md:p-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
