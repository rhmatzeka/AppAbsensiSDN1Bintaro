"use client";

import { eachDayOfInterval, endOfMonth, format, startOfMonth } from "date-fns";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";
import { PageShell } from "@/components/layout/page-shell";
import { SummaryCard } from "@/components/absensi/summary-card";
import { StatusBadge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, Td, Th } from "@/components/ui/table";
import { useAbsensi } from "@/hooks/useAbsensi";
import { useApi } from "@/hooks/useApi";
import { formatDate, getInitials } from "@/lib/utils";
import type { AttendanceStatus } from "@/types";

type SiswaDetail = {
  id: string;
  nis: string;
  nama: string;
  jenisKelamin: string;
  alamat: string | null;
  foto: string | null;
  kelas: { id: string; nama: string };
};

const statusBg: Record<AttendanceStatus, string> = {
  HADIR: "bg-[#4CAF81] text-white",
  SAKIT: "bg-amber-400 text-neutral-950",
  IZIN: "bg-blue-500 text-white",
  ALPHA: "bg-[#E05252] text-white"
};

export default function DetailSiswaPage() {
  const params = useParams<{ id: string }>();
  const [month, setMonth] = useState(format(new Date(), "yyyy-MM"));
  const { data: siswa, isLoading } = useApi<SiswaDetail>(`/api/siswa/${params.id}`);
  const { data: absensi } = useAbsensi({ siswaId: params.id });

  const filtered = useMemo(() => (absensi ?? []).filter((item) => item.tanggal.startsWith(month)), [absensi, month]);
  const counts = useMemo(() => {
    const result: Record<AttendanceStatus, number> = { HADIR: 0, SAKIT: 0, IZIN: 0, ALPHA: 0 };
    filtered.forEach((item) => {
      result[item.status] += 1;
    });
    return result;
  }, [filtered]);
  const total = counts.HADIR + counts.SAKIT + counts.IZIN + counts.ALPHA;
  const percentage = total === 0 ? 0 : Math.round((counts.HADIR / total) * 100);

  const calendarDays = useMemo(() => {
    const [year, monthIndex] = month.split("-").map(Number);
    return eachDayOfInterval({ start: startOfMonth(new Date(year, monthIndex - 1, 1)), end: endOfMonth(new Date(year, monthIndex - 1, 1)) });
  }, [month]);

  const byDate = useMemo(() => {
    const map = new Map<string, AttendanceStatus>();
    filtered.forEach((item) => map.set(item.tanggal.slice(0, 10), item.status));
    return map;
  }, [filtered]);

  if (isLoading) {
    return <Skeleton className="h-96" />;
  }

  return (
    <PageShell title={siswa?.nama ?? "Detail Siswa"} description="Profil siswa dan riwayat absensi.">
      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <section className="rounded-xl border border-neutral-200 bg-white p-5 shadow-subtle">
          <div className="grid h-24 w-24 place-items-center rounded-xl bg-[#0A0A0A] text-2xl font-semibold text-white">
            {getInitials(siswa?.nama ?? "S")}
          </div>
          <h2 className="mt-5 text-xl font-semibold text-neutral-950">{siswa?.nama}</h2>
          <p className="mt-1 font-mono text-sm text-neutral-500">{siswa?.nis}</p>
          <div className="mt-4 space-y-2 text-sm text-neutral-600">
            <p>Kelas: {siswa?.kelas.nama}</p>
            <p>Alamat: {siswa?.alamat ?? "-"}</p>
          </div>
        </section>

        <section className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-5">
            <SummaryCard label="Hadir" value={counts.HADIR} />
            <SummaryCard label="Sakit" value={counts.SAKIT} />
            <SummaryCard label="Izin" value={counts.IZIN} />
            <SummaryCard label="Alpha" value={counts.ALPHA} />
            <SummaryCard label="Kehadiran" value={`${percentage}%`} />
          </div>

          <label className="block max-w-xs">
            <span className="mb-1.5 block text-sm font-medium text-neutral-700">Bulan</span>
            <Input type="month" value={month} onChange={(event) => setMonth(event.target.value)} />
          </label>

          <div className="grid grid-cols-7 gap-2 rounded-xl border border-neutral-200 bg-white p-4 shadow-subtle">
            {calendarDays.map((day) => {
              const key = format(day, "yyyy-MM-dd");
              const status = byDate.get(key);
              return (
                <div key={key} className={`grid aspect-square place-items-center rounded-xl text-xs font-medium ${status ? statusBg[status] : "bg-neutral-100 text-neutral-500"}`} title={status ?? "Tidak ada data"}>
                  {format(day, "d")}
                </div>
              );
            })}
          </div>
        </section>
      </div>

      <section>
        <h2 className="mb-3 text-base font-semibold text-neutral-950">Riwayat Absensi</h2>
        <Table>
          <thead>
            <tr>
              <Th>Tanggal</Th>
              <Th>Status</Th>
              <Th>Keterangan</Th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((item, index) => (
              <tr key={item.id} className={index % 2 === 0 ? "bg-white hover:bg-neutral-50" : "bg-neutral-50/60 hover:bg-neutral-100"}>
                <Td>{formatDate(item.tanggal, "EEEE, d MMM yyyy")}</Td>
                <Td>
                  <StatusBadge status={item.status} />
                </Td>
                <Td>{item.keterangan ?? "-"}</Td>
              </tr>
            ))}
          </tbody>
        </Table>
      </section>
    </PageShell>
  );
}
