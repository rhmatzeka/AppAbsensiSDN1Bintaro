"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { CalendarPlus } from "lucide-react";
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
        <Link href="/absensi" className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#F97316] px-4 py-2 text-sm font-medium text-white shadow-sm outline-none hover:bg-[#ea580c] focus-visible:ring-2 focus-visible:ring-[#F97316] focus-visible:ring-offset-2 sm:w-auto">
          <CalendarPlus className="h-4 w-4" />
          Input Absensi Hari Ini
        </Link>
      }
    >
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[1, 2, 3, 4].map((item) => (
            <Skeleton key={item} className="h-28" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard label="Total Siswa" value={data?.cards.totalSiswa ?? 0} />
          <SummaryCard label="Hadir Hari Ini" value={data?.cards.hadirHariIni ?? 0} />
          <SummaryCard label="Tidak Hadir" value={data?.cards.tidakHadir ?? 0} />
          <SummaryCard label="Persentase Kehadiran" value={`${data?.cards.persentase ?? 0}%`} />
        </div>
      )}

      <div className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
        <section className="min-w-0 rounded-xl border border-neutral-200 bg-white p-4 shadow-subtle">
          <div className="mb-4">
            <h2 className="text-base font-semibold text-neutral-950">Kehadiran per Kelas</h2>
            <p className="text-sm text-neutral-500">Akumulasi 7 hari terakhir.</p>
          </div>
          <div className="h-72 min-w-0 sm:h-80">
            <AttendanceChart data={data?.chart ?? []} />
          </div>
        </section>

        <section className="min-w-0">
          <h2 className="mb-3 text-base font-semibold text-neutral-950">Absensi Terbaru</h2>
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
              {(data?.recent ?? []).map((item, index) => (
                <tr key={item.id} className={index % 2 === 0 ? "bg-white hover:bg-neutral-50" : "bg-neutral-50/60 hover:bg-neutral-100"}>
                  <Td>{item.siswa.nama}</Td>
                  <Td>{item.kelas.nama}</Td>
                  <Td>
                    <StatusBadge status={item.status} />
                  </Td>
                  <Td>{formatDate(item.tanggal, "d MMM yyyy")}</Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </section>
      </div>
    </PageShell>
  );
}

function SummaryCard({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-subtle sm:p-5">
      <p className="text-sm text-neutral-500">{label}</p>
      <p className="mt-3 text-3xl font-semibold leading-none text-neutral-950">{value}</p>
    </div>
  );
}
