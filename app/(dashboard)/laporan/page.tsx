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

export default function LaporanPage() {
  const today = new Date();
  const [kelasId, setKelasId] = useState("");
  const [bulan, setBulan] = useState(today.getMonth() + 1);
  const [tahun, setTahun] = useState(today.getFullYear());
  const { data: kelas } = useKelas();
  const url = useMemo(() => {
    const params = new URLSearchParams({ bulan: String(bulan), tahun: String(tahun) });
    if (kelasId) params.set("kelasId", kelasId);
    return `/api/absensi/rekap?${params.toString()}`;
  }, [bulan, kelasId, tahun]);
  const { data, isLoading } = useApi<RekapRow[]>(url);

  function exportCsv() {
    const header = ["NIS", "Nama", "Kelas", "Hadir", "Sakit", "Izin", "Alpha", "Persentase"];
    const rows = (data ?? []).map((item) => [item.nis, item.nama, item.kelas, item.HADIR, item.SAKIT, item.IZIN, item.ALPHA, `${item.persentase}%`]);
    const csv = [header, ...rows].map((row) => row.map((value) => `"${String(value).replaceAll("\"", "\"\"")}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const urlObject = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = urlObject;
    anchor.download = `rekap-absensi-${tahun}-${String(bulan).padStart(2, "0")}.csv`;
    anchor.click();
    URL.revokeObjectURL(urlObject);
  }

  return (
    <PageShell
      title="Laporan Absensi"
      description="Rekap absensi bulanan per siswa."
      action={
        <>
          <Button type="button" variant="secondary" onClick={() => window.print()}>
            <Printer className="h-4 w-4" />
            Print
          </Button>
          <Button type="button" onClick={exportCsv} disabled={!data?.length}>
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        </>
      }
    >
      <div className="no-print grid gap-3 md:grid-cols-4">
        <label>
          <span className="mb-1.5 block text-sm font-medium text-neutral-700">Kelas</span>
          <Select value={kelasId} onChange={(event) => setKelasId(event.target.value)}>
            <option value="">Semua kelas</option>
            {(kelas ?? []).map((item) => (
              <option key={item.id} value={item.id}>{item.nama}</option>
            ))}
          </Select>
        </label>
        <label>
          <span className="mb-1.5 block text-sm font-medium text-neutral-700">Bulan</span>
          <Select value={bulan} onChange={(event) => setBulan(Number(event.target.value))}>
            {Array.from({ length: 12 }, (_, index) => index + 1).map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </Select>
        </label>
        <label>
          <span className="mb-1.5 block text-sm font-medium text-neutral-700">Tahun</span>
          <Input type="number" value={tahun} onChange={(event) => setTahun(Number(event.target.value))} />
        </label>
      </div>

      {isLoading ? (
        <Skeleton className="h-96" />
      ) : (
        <Table>
          <thead>
            <tr>
              <Th>NIS</Th>
              <Th>Nama</Th>
              <Th>Kelas</Th>
              <Th>Hadir</Th>
              <Th>Sakit</Th>
              <Th>Izin</Th>
              <Th>Alpha</Th>
              <Th>% Kehadiran</Th>
            </tr>
          </thead>
          <tbody>
            {(data ?? []).map((item, index) => (
              <tr key={item.siswaId} className={`${item.persentase < 75 ? "bg-red-50 hover:bg-red-100" : index % 2 === 0 ? "bg-white hover:bg-neutral-50" : "bg-neutral-50/60 hover:bg-neutral-100"}`}>
                <Td className="font-mono text-xs">{item.nis}</Td>
                <Td className="font-medium text-neutral-950">{item.nama}</Td>
                <Td>{item.kelas}</Td>
                <Td>{item.HADIR}</Td>
                <Td>{item.SAKIT}</Td>
                <Td>{item.IZIN}</Td>
                <Td>{item.ALPHA}</Td>
                <Td className={item.persentase < 75 ? "font-semibold text-[#E05252]" : "font-semibold text-[#4CAF81]"}>{item.persentase}%</Td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </PageShell>
  );
}
