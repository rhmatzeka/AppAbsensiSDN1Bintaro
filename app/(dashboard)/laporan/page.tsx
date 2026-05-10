"use client";

import { CalendarDays, Download, Printer } from "lucide-react";
import { useMemo, useState } from "react";
import { PageShell } from "@/components/layout/page-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, Td, Th } from "@/components/ui/table";
import { useApi } from "@/hooks/useApi";
import { useKegiatan } from "@/hooks/useKegiatan";
import { useKelas } from "@/hooks/useKelas";
import { cn, formatDate, toDateInputValue } from "@/lib/utils";
import type { RekapRow } from "@/types";

const BULAN = ["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];
type Periode = "bulanan" | "mingguan";

function weekRange(date: Date) {
  const day = date.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const start = new Date(date);
  start.setDate(date.getDate() + diffToMonday);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return { start: toDateInputValue(start), end: toDateInputValue(end) };
}

const currentWeek = weekRange(new Date());

export default function LaporanPage() {
  const today = new Date();
  const [periode, setPeriode] = useState<Periode>("bulanan");
  const [kelasId, setKelasId] = useState("");
  const [bulan, setBulan] = useState(today.getMonth() + 1);
  const [tahun, setTahun] = useState(today.getFullYear());
  const [tanggalAwal, setTanggalAwal] = useState(currentWeek.start);
  const [tanggalAkhir, setTanggalAkhir] = useState(currentWeek.end);
  const { data: kelas } = useKelas();
  const selectedKelasName = useMemo(() => kelas?.find((item) => item.id === kelasId)?.nama ?? "Semua kelas", [kelas, kelasId]);
  const periodRange = useMemo(() => {
    if (periode === "mingguan") return { start: tanggalAwal, end: tanggalAkhir };
    return {
      start: toDateInputValue(new Date(tahun, bulan - 1, 1)),
      end: toDateInputValue(new Date(tahun, bulan, 0))
    };
  }, [bulan, periode, tanggalAkhir, tanggalAwal, tahun]);
  const url = useMemo(() => {
    const p = new URLSearchParams({ periode });
    if (periode === "mingguan") {
      p.set("tanggalAwal", tanggalAwal);
      p.set("tanggalAkhir", tanggalAkhir);
    } else {
      p.set("bulan", String(bulan));
      p.set("tahun", String(tahun));
    }
    if (kelasId) p.set("kelasId", kelasId);
    return `/api/absensi/rekap?${p.toString()}`;
  }, [bulan, kelasId, periode, tanggalAkhir, tanggalAwal, tahun]);
  const { data, isLoading } = useApi<RekapRow[]>(url);
  const { data: kegiatanData, isLoading: loadingKegiatan } = useKegiatan({
    page: 1,
    limit: 500,
    kelasId,
    tanggalAwal: periodRange.start,
    tanggalAkhir: periodRange.end
  });
  const periodLabel = periode === "mingguan"
    ? `${tanggalAwal} sampai ${tanggalAkhir}`
    : `${BULAN[bulan - 1]} ${tahun}`;
  const attendanceTotals = useMemo(() => {
    return (data ?? []).reduce(
      (totals, item) => ({
        hadir: totals.hadir + item.HADIR,
        sakit: totals.sakit + item.SAKIT,
        izin: totals.izin + item.IZIN,
        alpha: totals.alpha + item.ALPHA
      }),
      { hadir: 0, sakit: 0, izin: 0, alpha: 0 }
    );
  }, [data]);

  function exportCsv() {
    const header = ["NIS", "Nama", "Kelas", "Hadir", "Sakit", "Izin", "Alpha", "Persentase"];
    const rows = (data ?? []).map((i) => [i.nis, i.nama, i.kelas, i.HADIR, i.SAKIT, i.IZIN, i.ALPHA, `${i.persentase}%`]);
    const kegiatanHeader = ["Tanggal", "Kelas", "Pengisi", "Jam", "Tema / Materi", "Kegiatan", "Catatan"];
    const kegiatanRows = (kegiatanData?.items ?? []).map((item) => [
      formatDate(item.tanggal, "d MMM yyyy"),
      item.kelas.nama,
      item.user.name,
      [item.jamMulai, item.jamSelesai].filter(Boolean).join(" - "),
      item.materi,
      item.kegiatan,
      item.catatan ?? ""
    ]);
    const csvRows = [
      ["Rekap Absensi"],
      header,
      ...rows,
      [],
      ["Materi Pembelajaran"],
      kegiatanHeader,
      ...kegiatanRows
    ];
    const csv = csvRows.map((r) => r.map((v) => `"${String(v).replaceAll("\"", "\"\"")}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const u = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = u;
    a.download = periode === "mingguan"
      ? `rekap-absensi-mingguan-${tanggalAwal}-sd-${tanggalAkhir}.csv`
      : `rekap-absensi-${tahun}-${String(bulan).padStart(2, "0")}.csv`;
    a.click();
    URL.revokeObjectURL(u);
  }

  return (
    <PageShell
      title="Laporan Absensi"
      description={`Rekap absensi ${periode} per siswa: ${periodLabel}.`}
      action={
        <div className="no-print flex w-full flex-wrap items-center gap-2 sm:w-auto">
          <Button type="button" variant="secondary" onClick={() => window.print()} disabled={isLoading || loadingKegiatan}>
            <Printer className="h-4 w-4" />Print
          </Button>
          <Button type="button" onClick={exportCsv} disabled={!data?.length && !kegiatanData?.items.length}>
            <Download className="h-4 w-4" />Export CSV
          </Button>
        </div>
      }
    >
      <section className="print-only">
        <div className="print-report-header">
          <h2>Laporan Absensi dan Kegiatan Guru</h2>
          <p>Periode: {periodLabel}</p>
          <p>Kelas: {selectedKelasName}</p>
        </div>
        <div className="print-report-summary">
          <span>Total siswa: {data?.length ?? 0}</span>
          <span>Kegiatan: {kegiatanData?.items.length ?? 0}</span>
          <span>Hadir: {attendanceTotals.hadir}</span>
          <span>Sakit: {attendanceTotals.sakit}</span>
          <span>Izin: {attendanceTotals.izin}</span>
          <span>Alpha: {attendanceTotals.alpha}</span>
        </div>
      </section>

      {/* Filters */}
      <div className="no-print rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-subtle">
        <div className="mb-4 inline-flex rounded-xl border border-neutral-200 bg-neutral-50 p-1">
          {(["bulanan", "mingguan"] as const).map((item) => (
            <button
              key={item}
              type="button"
              className={cn(
                "inline-flex min-h-9 items-center gap-2 rounded-lg px-3 text-sm font-bold capitalize transition-colors",
                periode === item ? "bg-white text-orange-700 shadow-sm" : "text-neutral-500 hover:text-neutral-900"
              )}
              onClick={() => setPeriode(item)}
            >
              {item === "mingguan" ? <CalendarDays className="h-4 w-4" /> : null}
              {item}
            </button>
          ))}
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <label>
            <span className="mb-2 block text-sm font-semibold text-neutral-700">Kelas</span>
            <Select value={kelasId} onChange={(e) => setKelasId(e.target.value)}>
              <option value="">Semua kelas</option>
              {(kelas ?? []).map((i) => <option key={i.id} value={i.id}>{i.nama}</option>)}
            </Select>
          </label>
          {periode === "bulanan" ? (
            <>
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
            </>
          ) : (
            <>
              <label>
                <span className="mb-2 block text-sm font-semibold text-neutral-700">Tanggal Awal</span>
                <Input type="date" value={tanggalAwal} onChange={(e) => setTanggalAwal(e.target.value)} />
              </label>
              <label>
                <span className="mb-2 block text-sm font-semibold text-neutral-700">Tanggal Akhir</span>
                <Input type="date" value={tanggalAkhir} onChange={(e) => setTanggalAkhir(e.target.value)} />
              </label>
            </>
          )}
        </div>
      </div>

      <section className="print-section rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-subtle">
        <div className="mb-4">
          <h2 className="text-base font-bold text-neutral-900">Rekap Kegiatan Guru</h2>
          <p className="mt-0.5 text-sm text-neutral-500">Tema, materi, dan kegiatan yang dicatat pada periode ini.</p>
        </div>
        {loadingKegiatan ? (
          <Skeleton className="h-32" />
        ) : !kegiatanData?.items.length ? (
          <div className="rounded-xl border border-dashed border-neutral-200 p-5 text-sm text-neutral-500">
            Belum ada materi pembelajaran yang dicatat untuk periode ini.
          </div>
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>Tanggal</Th>
                <Th>Kelas</Th>
                <Th>Pengisi</Th>
                <Th>Jam</Th>
                <Th>Tema / Materi</Th>
                <Th>Kegiatan</Th>
                <Th>Catatan</Th>
              </tr>
            </thead>
            <tbody>
              {kegiatanData.items.map((item) => (
                <tr key={item.id} className="transition-colors hover:bg-orange-50/30">
                  <Td className="text-xs text-neutral-500">{formatDate(item.tanggal, "d MMM yyyy")}</Td>
                  <Td><span className="inline-flex rounded-lg bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-600">{item.kelas.nama}</span></Td>
                  <Td className="font-semibold text-neutral-800">{item.user.name}</Td>
                  <Td className="text-xs text-neutral-500">{[item.jamMulai, item.jamSelesai].filter(Boolean).join(" - ") || "-"}</Td>
                  <Td className="font-semibold text-neutral-800">{item.materi}</Td>
                  <Td className="max-w-md whitespace-normal leading-6 text-neutral-600">{item.kegiatan}</Td>
                  <Td className="max-w-xs whitespace-normal text-neutral-500">{item.catatan ?? "-"}</Td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </section>

      {/* Table */}
      <section className="print-section">
        <div className="print-only print-section-title">Rekap Absensi Siswa</div>
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
      </section>
    </PageShell>
  );
}
