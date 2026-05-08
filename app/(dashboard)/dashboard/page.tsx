"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { CalendarPlus, Users, UserCheck, UserX, TrendingUp } from "lucide-react";
import { PageShell } from "@/components/layout/page-shell";
import { StatusBadge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, Td, Th } from "@/components/ui/table";
import { useApi } from "@/hooks/useApi";
import { formatDate } from "@/lib/utils";
import type { AbsensiRow } from "@/types";

const AttendanceChart = dynamic(() => import("@/components/dashboard/attendance-chart").then((mod) => mod.AttendanceChart), {
  ssr: false,
  loading: () => <Skeleton className="h-full w-full" />
});

type DashboardStats = {
  cards: {
    totalSiswa: number;
    hadirHariIni: number;
    tidakHadir: number;
    persentase: number;
  };
  recent: AbsensiRow[];
  chart: {
    kelas: string;
    hadir: number;
    tidakHadir: number;
  }[];
};

export default function DashboardPage() {
  const { data, isLoading } = useApi<DashboardStats>("/api/dashboard/stats");

  return (
    <PageShell
      title="Dashboard"
      description={`Ringkasan absensi ${formatDate(new Date())}`}
      action={
        <Link href="/absensi" className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-b from-orange-400 to-orange-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm outline-none transition-all hover:from-orange-500 hover:to-orange-600 hover:shadow-md focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2 active:scale-[0.98] sm:w-auto">
          <CalendarPlus className="h-4 w-4" />
          Input Absensi Hari Ini
        </Link>
      }
    >
      {/* Stat Cards */}
      {isLoading ? (
        <div className="grid grid-cols-4 gap-2 sm:gap-4">
          {[1, 2, 3, 4].map((item) => (
            <Skeleton key={item} className="h-24 sm:h-28" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-2 sm:gap-4">
          <StatCard
            label="Total Siswa"
            mobileLabel="Siswa"
            value={data?.cards.totalSiswa ?? 0}
            icon={<Users className="h-5 w-5" />}
            color="blue"
            delay="stagger-1"
          />
          <StatCard
            label="Hadir Hari Ini"
            mobileLabel="Hadir"
            value={data?.cards.hadirHariIni ?? 0}
            icon={<UserCheck className="h-5 w-5" />}
            color="green"
            delay="stagger-2"
          />
          <StatCard
            label="Tidak Hadir"
            mobileLabel="Absen"
            value={data?.cards.tidakHadir ?? 0}
            icon={<UserX className="h-5 w-5" />}
            color="red"
            delay="stagger-3"
          />
          <StatCard
            label="Persentase Kehadiran"
            mobileLabel="% Hadir"
            value={`${data?.cards.persentase ?? 0}%`}
            icon={<TrendingUp className="h-5 w-5" />}
            color="orange"
            delay="stagger-4"
          />
        </div>
      )}

      {/* Chart & Recent */}
      <div className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
        <section className="min-w-0 rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-subtle">
          <div className="mb-5">
            <h2 className="text-base font-bold text-neutral-900">Kehadiran per Kelas</h2>
            <p className="mt-0.5 text-sm text-neutral-500">Akumulasi 7 hari terakhir.</p>
          </div>
          <div className="h-72 min-w-0 sm:h-80">
            <AttendanceChart data={data?.chart ?? []} />
          </div>
        </section>

        <section className="min-w-0">
          <h2 className="mb-3 text-base font-bold text-neutral-900">Absensi Terbaru</h2>
          <Table>
            <thead>
              <tr>
                <Th>Nama</Th>
                <Th>Kelas</Th>
                <Th>Status</Th>
                <Th>Tanggal</Th>
              </tr>
            </thead>
            <tbody>
              {(data?.recent ?? []).map((item) => (
                <tr key={item.id} className="transition-colors hover:bg-orange-50/30">
                  <Td className="font-medium text-neutral-800">{item.siswa.nama}</Td>
                  <Td>{item.kelas.nama}</Td>
                  <Td>
                    <StatusBadge status={item.status} />
                  </Td>
                  <Td className="text-neutral-400 text-xs">{formatDate(item.tanggal, "d MMM yyyy")}</Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </section>
      </div>
    </PageShell>
  );
}

function StatCard({ label, mobileLabel, value, icon, color, delay }: { label: string; mobileLabel: string; value: number | string; icon: React.ReactNode; color: "blue" | "green" | "red" | "orange"; delay?: string }) {
  const colors = {
    blue: { bg: "bg-sky-50", text: "text-sky-600", accent: "from-sky-500/10" },
    green: { bg: "bg-emerald-50", text: "text-emerald-600", accent: "from-emerald-500/10" },
    red: { bg: "bg-rose-50", text: "text-rose-600", accent: "from-rose-500/10" },
    orange: { bg: "bg-orange-50", text: "text-orange-600", accent: "from-orange-500/10" }
  };
  const c = colors[color];

  return (
    <div className={`card-interactive relative min-h-24 overflow-hidden rounded-2xl border border-neutral-200/80 bg-white p-2 shadow-subtle animate-fade-in sm:min-h-28 sm:p-5 ${delay ?? ""}`}>
      <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${c.accent} to-transparent`} />
      <div className="flex h-full flex-col items-center justify-between gap-1.5 text-center sm:items-stretch sm:gap-3 sm:text-left">
        <div className={`grid h-8 w-8 shrink-0 place-items-center rounded-xl sm:h-11 sm:w-11 sm:self-end ${c.bg} ${c.text}`}>
          {icon}
        </div>
        <p className="w-full min-w-0 text-[9px] font-bold uppercase leading-3 text-neutral-400 sm:text-xs sm:leading-4">
            <span className="sm:hidden">{mobileLabel}</span>
            <span className="hidden sm:inline">{label}</span>
        </p>
        <p className="w-full whitespace-nowrap text-[22px] font-black leading-none text-neutral-900 sm:text-3xl">{value}</p>
      </div>
    </div>
  );
}
