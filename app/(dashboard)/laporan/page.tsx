"use client";

import { Download, Printer } from "lucide-react";
import { useMemo, useState } from "react";
import { PageShell } from "@/components/layout/page-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, Td, Th } from "@/components/ui/table";
import { useApi } from "@/hooks/useApi";
import { useKelas } from "@/hooks/useKelas";
import type { RekapRow } from "@/types";

const BULAN = ["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];

export default function LaporanPage() {
  const today = new Date();
  const [kelasId, setKelasId] = useState("");
  const [bulan, setBulan] = useState(today.getMonth() + 1);
  const [tahun, setTahun] = useState(today.getFullYear());
  const { data: kelas } = useKelas();
  const url = useMemo(() => {
    const p = new URLSearchParams({ bulan: String(bulan), tahun: String(tahun) });
    if (kelasId) p.set("kelasId", kelasId);
    return `/api/absensi/rekap?${p.toString()}`;
  }, [bulan, kelasId, tahun]);
  const { data, isLoading } = useApi<RekapRow[]>(url);

  function exportCsv() {
    const header = ["NIS", "Nama", "Kelas", "Hadir", "Sakit", "Izin", "Alpha", "Persentase"];
    const rows = (data ?? []).map((i) => [i.nis, i.nama, i.kelas, i.HADIR, i.SAKIT, i.IZIN, i.ALPHA, `${i.persentase}%`]);
    const csv = [header, ...rows].map((r) => r.map((v) => `"${String(v).replaceAll("\"", "\"\"")}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const u = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = u; a.download = `rekap-absensi-${tahun}-${String(bulan).padStart(2, "0")}.csv`; a.click();
    URL.revokeObjectURL(u);
  }

  return (
    <PageShell
      title="Laporan Absensi"
      description="Rekap absensi bulanan per siswa."
      action={
        <>
          <Button type="button" variant="secondary" onClick={() => window.print()}>
            <Printer className="h-4 w-4" />Print
          </Button>
          <Button type="button" onClick={exportCsv} disabled={!data?.length}>
            <Download className="h-4 w-4" />Export CSV
          </Button>
        </>
      }
    >
      {/* Filters */}
      <div className="no-print rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-subtle">
        <div className="grid gap-4 md:grid-cols-3">
          <label>
            <span className="mb-2 block text-sm font-semibold text-neutral-700">Kelas</span>
            <Select value={kelasId} onChange={(e) => setKelasId(e.target.value)}>
              <option value="">Semua kelas</option>
              {(kelas ?? []).map((i) => <option key={i.id} value={i.id}>{i.nama}</option>)}
            </Select>
          </label>
          <label>
            <span className="mb-2 block text-sm font-semibold text-neutral-700">Bulan</span>
            <Select value={bulan} onChange={(e) => setBulan(Number(e.target.value))}>
              {BULAN.map((n, i) => <option key={i + 1} value={i + 1}>{n}</option>)}
            </Select>
          </label>
          <label>
            <span className="mb-2 block text-sm font-semibold text-neutral-700">Tahun</span>
            <Input type="number" value={tahun} onChange={(e) => setTahun(Number(e.target.value))} />
          </label>
        </div>
      </div>

      {/* Table */}
      {isLoading ? <Skeleton className="h-96" /> : (
        <Table>
          <thead>
            <tr>
              <Th>NIS</Th><Th>Nama</Th><Th>Kelas</Th><Th>Hadir</Th><Th>Sakit</Th><Th>Izin</Th><Th>Alpha</Th><Th>% Kehadiran</Th>
            </tr>
          </thead>
          <tbody>
            {(data ?? []).map((i) => (
              <tr key={i.siswaId} className={`transition-colors ${i.persentase < 75 ? "bg-rose-50/50 hover:bg-rose-50" : "hover:bg-orange-50/30"}`}>
                <Td className="font-mono text-xs text-neutral-500">{i.nis}</Td>
                <Td className="font-semibold text-neutral-800">{i.nama}</Td>
                <Td><span className="inline-flex rounded-lg bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-600">{i.kelas}</span></Td>
                <Td className="font-medium text-emerald-600">{i.HADIR}</Td>
                <Td className="font-medium text-sky-600">{i.SAKIT}</Td>
                <Td className="font-medium text-amber-600">{i.IZIN}</Td>
                <Td className="font-medium text-rose-600">{i.ALPHA}</Td>
                <Td>
                  <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${
                    i.persentase < 75 ? "bg-rose-100 text-rose-700" : "bg-emerald-50 text-emerald-700"
                  }`}>
                    {i.persentase}%
                  </span>
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </PageShell>
  );
}
