"use client";

import { eachDayOfInterval, endOfMonth, format, startOfMonth } from "date-fns";
import Image from "next/image";
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

type SiswaDetail = { id: string; nis: string; nama: string; jenisKelamin: string; alamat: string | null; foto: string | null; kelas: { id: string; nama: string } };

const statusBg: Record<AttendanceStatus, string> = {
  HADIR: "bg-emerald-500 text-white",
  SAKIT: "bg-sky-400 text-white",
  IZIN: "bg-amber-400 text-neutral-950",
  ALPHA: "bg-rose-500 text-white"
};

export default function DetailSiswaPage() {
  const params = useParams<{ id: string }>();
  const [month, setMonth] = useState(format(new Date(), "yyyy-MM"));
  const { data: siswa, isLoading } = useApi<SiswaDetail>(`/api/siswa/${params.id}`);
  const { data: absensi } = useAbsensi({ siswaId: params.id });

  const filtered = useMemo(() => (absensi ?? []).filter((i) => i.tanggal.startsWith(month)), [absensi, month]);
  const counts = useMemo(() => {
    const r: Record<AttendanceStatus, number> = { HADIR: 0, SAKIT: 0, IZIN: 0, ALPHA: 0 };
    filtered.forEach((i) => { r[i.status] += 1; });
    return r;
  }, [filtered]);
  const total = counts.HADIR + counts.SAKIT + counts.IZIN + counts.ALPHA;
  const pct = total === 0 ? 0 : Math.round((counts.HADIR / total) * 100);

  const calendarDays = useMemo(() => {
    const [y, m] = month.split("-").map(Number);
    return eachDayOfInterval({ start: startOfMonth(new Date(y, m - 1, 1)), end: endOfMonth(new Date(y, m - 1, 1)) });
  }, [month]);

  const byDate = useMemo(() => {
    const map = new Map<string, AttendanceStatus>();
    filtered.forEach((i) => map.set(i.tanggal.slice(0, 10), i.status));
    return map;
  }, [filtered]);

  if (isLoading) return <Skeleton className="h-96" />;

  return (
    <PageShell title={siswa?.nama ?? "Detail Siswa"} description="Profil siswa dan riwayat absensi.">
      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <section className="rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-subtle">
          {siswa?.foto ? (
            <Image src={siswa.foto} alt={`Foto ${siswa.nama}`} width={96} height={96} unoptimized className="h-24 w-24 rounded-2xl object-cover shadow-sm" />
          ) : (
            <div className="grid h-20 w-20 place-items-center rounded-2xl bg-gradient-to-br from-orange-400 to-orange-500 text-2xl font-bold text-white shadow-sm">
              {getInitials(siswa?.nama ?? "S")}
            </div>
          )}
          <h2 className="mt-5 text-xl font-bold text-neutral-900">{siswa?.nama}</h2>
          <p className="mt-1 font-mono text-sm text-neutral-400">{siswa?.nis}</p>
          <div className="mt-4 space-y-2.5 text-sm text-neutral-500">
            <p><span className="font-semibold text-neutral-600">Kelas:</span> {siswa?.kelas.nama}</p>
            <p><span className="font-semibold text-neutral-600">Alamat:</span> {siswa?.alamat ?? "-"}</p>
          </div>
        </section>

        <section className="space-y-4">
          <div className="grid grid-cols-5 gap-2 sm:gap-4">
            <SummaryCard label="Hadir" value={counts.HADIR} color="green" />
            <SummaryCard label="Sakit" value={counts.SAKIT} color="blue" />
            <SummaryCard label="Izin" value={counts.IZIN} color="amber" />
            <SummaryCard label="Alpha" value={counts.ALPHA} color="red" />
            <SummaryCard label="Kehadiran" mobileLabel="% Hadir" value={`${pct}%`} color="orange" />
          </div>

          <label className="block max-w-xs">
            <span className="mb-2 block text-sm font-semibold text-neutral-700">Bulan</span>
            <Input type="month" value={month} onChange={(e) => setMonth(e.target.value)} />
          </label>

          <div className="grid grid-cols-7 gap-2 rounded-2xl border border-neutral-200/80 bg-white p-4 shadow-subtle">
            {calendarDays.map((day) => {
              const key = format(day, "yyyy-MM-dd");
              const status = byDate.get(key);
              return (
                <div key={key} className={`grid aspect-square place-items-center rounded-xl text-xs font-semibold transition-transform hover:scale-105 ${status ? statusBg[status] : "bg-neutral-100 text-neutral-400"}`} title={status ?? "Tidak ada data"}>
                  {format(day, "d")}
                </div>
              );
            })}
          </div>
        </section>
      </div>

      <section>
        <h2 className="mb-3 text-base font-bold text-neutral-900">Riwayat Absensi</h2>
        <Table>
          <thead><tr><Th>Tanggal</Th><Th>Status</Th><Th>Keterangan</Th></tr></thead>
          <tbody>
            {filtered.map((i) => (
              <tr key={i.id} className="transition-colors hover:bg-orange-50/30">
                <Td className="text-neutral-500">{formatDate(i.tanggal, "EEEE, d MMM yyyy")}</Td>
                <Td><StatusBadge status={i.status} /></Td>
                <Td className="text-neutral-500">{i.keterangan ?? "-"}</Td>
              </tr>
            ))}
          </tbody>
        </Table>
      </section>
    </PageShell>
  );
}
