"use client";

import { useSession } from "next-auth/react";
import { BookOpenText, Save, CheckCircle2, LockKeyhole, UsersRound } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { PageShell } from "@/components/layout/page-shell";
import { SummaryCard } from "@/components/absensi/summary-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, Td, Th } from "@/components/ui/table";
import { useToast } from "@/components/ui/toast";
import { useAbsensi } from "@/hooks/useAbsensi";
import { useKegiatan } from "@/hooks/useKegiatan";
import { useKelas } from "@/hooks/useKelas";
import { useSiswa } from "@/hooks/useSiswa";
import { cn, toDateInputValue } from "@/lib/utils";
import { ATTENDANCE_STATUSES, type AttendanceStatus } from "@/types";

type FormRow = {
  siswaId: string;
  kelasId: string;
  status: AttendanceStatus;
  keterangan: string;
};

type KegiatanForm = {
  id?: string;
  jamMulai: string;
  jamSelesai: string;
  materi: string;
  kegiatan: string;
  catatan: string;
};

const statuses = ATTENDANCE_STATUSES;
const emptyKegiatan: KegiatanForm = { jamMulai: "", jamSelesai: "", materi: "", kegiatan: "", catatan: "" };
const statusSelectStyles: Record<AttendanceStatus, string> = {
  HADIR: "border-emerald-200 bg-emerald-50 text-emerald-700 hover:border-emerald-300 focus:border-emerald-400 focus:ring-emerald-400/20",
  SAKIT: "border-sky-200 bg-sky-50 text-sky-700 hover:border-sky-300 focus:border-sky-400 focus:ring-sky-400/20",
  IZIN: "border-amber-200 bg-amber-50 text-amber-700 hover:border-amber-300 focus:border-amber-400 focus:ring-amber-400/20",
  ALPHA: "border-rose-200 bg-rose-50 text-rose-700 hover:border-rose-300 focus:border-rose-400 focus:ring-rose-400/20"
};

const statusOptionStyles: Record<AttendanceStatus, string> = {
  HADIR: "data-[active=true]:bg-emerald-50 data-[active=true]:text-emerald-700",
  SAKIT: "data-[active=true]:bg-sky-50 data-[active=true]:text-sky-700",
  IZIN: "data-[active=true]:bg-amber-50 data-[active=true]:text-amber-700",
  ALPHA: "data-[active=true]:bg-rose-50 data-[active=true]:text-rose-700"
};

export default function AbsensiPage() {
  const { data: session } = useSession();
  const { showToast } = useToast();
  const canFillKegiatan = Boolean(session?.user);
  const [kelasId, setKelasId] = useState("");
  const [tanggal, setTanggal] = useState(toDateInputValue(new Date()));
  const [rows, setRows] = useState<FormRow[]>([]);
  const [kegiatanForm, setKegiatanForm] = useState<KegiatanForm>(emptyKegiatan);
  const [saving, setSaving] = useState(false);
  const { data: kelas } = useKelas();
  const isGuru = session?.user.role === "GURU";
  const visibleKelas = useMemo(() => {
    if (!kelas) return [];
    if (!isGuru) return kelas;
    return kelas.filter((item) => item.id === session?.user.kelasId);
  }, [isGuru, kelas, session?.user.kelasId]);
  const selectedKelas = useMemo(() => visibleKelas.find((item) => item.id === kelasId), [kelasId, visibleKelas]);
  const { data: siswaData, isLoading: loadingSiswa, isValidating: validatingSiswa, mutate: refreshSiswa } = useSiswa({ kelasId, limit: 100 }, { keepPreviousData: false });
  const { data: existing, mutate: refreshAbsensi } = useAbsensi({ kelasId, tanggal }, { keepPreviousData: false });
  const { data: existingKegiatan, mutate: refreshKegiatan } = useKegiatan({
    enabled: Boolean(canFillKegiatan && kelasId && tanggal),
    guruId: session?.user.id,
    kelasId,
    tanggal,
    limit: 1
  });

  useEffect(() => {
    if (!session?.user || kelasId) return;
    if (session.user.role === "GURU" && session.user.kelasId) {
      setKelasId(session.user.kelasId);
      return;
    }
    if (visibleKelas[0]) setKelasId(visibleKelas[0].id);
  }, [kelasId, session?.user, visibleKelas]);

  useEffect(() => {
    if (!isGuru || !session?.user.kelasId || kelasId === session.user.kelasId) return;
    setKelasId(session.user.kelasId);
  }, [isGuru, kelasId, session?.user.kelasId]);

  useEffect(() => {
    const siswa = siswaData?.items ?? [];
    setRows(
      siswa.map((item) => {
        const found = existing?.find((absensi) => absensi.siswa.id === item.id);
        return {
          siswaId: item.id,
          kelasId: item.kelasId,
          status: found?.status ?? "HADIR",
          keterangan: found?.keterangan ?? ""
        };
      })
    );
  }, [existing, siswaData]);

  useEffect(() => {
    const found = existingKegiatan?.items[0];
    setKegiatanForm(
      found
        ? {
            id: found.id,
            jamMulai: found.jamMulai ?? "",
            jamSelesai: found.jamSelesai ?? "",
            materi: found.materi,
            kegiatan: found.kegiatan,
            catatan: found.catatan ?? ""
          }
        : emptyKegiatan
    );
  }, [existingKegiatan]);

  const summary = useMemo(() => {
    return statuses.reduce<Record<AttendanceStatus, number>>(
      (accumulator, status) => {
        accumulator[status] = rows.filter((row) => row.status === status).length;
        return accumulator;
      },
      { HADIR: 0, SAKIT: 0, IZIN: 0, ALPHA: 0 }
    );
  }, [rows]);

  function updateRow(siswaId: string, patch: Partial<FormRow>) {
    setRows((current) => current.map((row) => (row.siswaId === siswaId ? { ...row, ...patch } : row)));
  }

  async function save() {
    if (!kelasId || rows.length === 0) return;
    const hasKegiatan = canFillKegiatan && Object.entries(kegiatanForm)
      .filter(([key]) => key !== "id")
      .some(([, value]) => value.trim());

    if (hasKegiatan && !kegiatanForm.materi.trim()) {
      showToast("Tema atau materi wajib diisi jika ingin menyimpan kegiatan guru", "error");
      return;
    }

    setSaving(true);
    const response = await fetch("/api/absensi", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tanggal, items: rows })
    });

    if (!response.ok) {
      setSaving(false);
      const data = (await response.json().catch(() => ({ message: "Gagal menyimpan absensi" }))) as { message?: string };
      showToast(data.message ?? "Gagal menyimpan absensi", "error");
      return;
    }

    if (hasKegiatan) {
      const kegiatanResponse = await fetch(kegiatanForm.id ? `/api/kegiatan/${kegiatanForm.id}` : "/api/kegiatan", {
        method: kegiatanForm.id ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tanggal,
          guruId: session?.user.id,
          kelasId,
          jamMulai: kegiatanForm.jamMulai,
          jamSelesai: kegiatanForm.jamSelesai,
          materi: kegiatanForm.materi,
          kegiatan: kegiatanForm.kegiatan.trim() || `Mengajar materi ${kegiatanForm.materi.trim()}`,
          catatan: kegiatanForm.catatan
        })
      });

      if (!kegiatanResponse.ok) {
        setSaving(false);
        const data = (await kegiatanResponse.json().catch(() => ({ message: "Gagal menyimpan kegiatan guru" }))) as { message?: string };
        await Promise.all([refreshAbsensi(), refreshSiswa()]);
        showToast(`Absensi tersimpan, tetapi kegiatan gagal: ${data.message ?? "Gagal menyimpan kegiatan guru"}`, "error");
        return;
      }
    }

    setSaving(false);
    await Promise.all([refreshAbsensi(), refreshSiswa(), refreshKegiatan()]);
    showToast(hasKegiatan ? "Absensi dan kegiatan guru berhasil disimpan" : "Absensi berhasil disimpan");
  }

  return (
    <PageShell
      title="Input Absensi"
      description="Pilih kelas dan tanggal, lalu simpan absensi semua siswa sekaligus."
      action={
        <Button type="button" onClick={save} loading={saving} disabled={!rows.length} className="h-11">
          <Save className="h-4 w-4" />
          Simpan Absensi
        </Button>
      }
    >
      {/* Filters */}
      <div className="rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-subtle">
        <div className="mb-5 flex flex-col gap-3 border-b border-neutral-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-base font-bold text-neutral-900">Pengaturan Absensi</h2>
              {isGuru ? (
                <Badge className="gap-1 border border-orange-200 bg-orange-50 text-orange-700">
                  <LockKeyhole className="h-3.5 w-3.5" />
                  Kelas tugas
                </Badge>
              ) : null}
            </div>
            <p className="mt-1 text-sm text-neutral-500">
              {selectedKelas ? `${selectedKelas.nama} - ${selectedKelas.jumlahSiswa} siswa aktif` : "Pilih kelas untuk memuat daftar siswa."}
            </p>
          </div>
          <div className="inline-flex w-fit items-center gap-2 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm font-semibold text-neutral-600">
            <UsersRound className="h-4 w-4 text-orange-500" />
            {rows.length} siswa dimuat
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-[minmax(0,1.45fr)_minmax(220px,0.7fr)_minmax(220px,0.75fr)]">
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-neutral-700">Kelas</span>
            <Select value={kelasId} onChange={(event) => setKelasId(event.target.value)} disabled={isGuru || visibleKelas.length <= 1}>
              {visibleKelas.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.nama}
                </option>
              ))}
            </Select>
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-neutral-700">Tanggal</span>
            <Input type="date" value={tanggal} onChange={(event) => setTanggal(event.target.value)} />
          </label>
          <div className="flex items-end">
            <Button type="button" variant="secondary" className="w-full h-11" onClick={() => setRows((current) => current.map((row) => ({ ...row, status: "HADIR", keterangan: "" })))}>
              <CheckCircle2 className="h-4 w-4" />
              Set Semua Hadir
            </Button>
          </div>
        </div>
      </div>

      {canFillKegiatan ? (
        <section className="rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-subtle">
          <div className="mb-4 flex items-start gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-orange-50 text-orange-600">
              <BookOpenText className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-neutral-900">Materi Pembelajaran Hari Ini</h2>
              <p className="mt-0.5 text-sm text-neutral-500">Isi tema atau materi saat menyimpan absensi agar tercatat di laporan.</p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-4">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-neutral-700">Jam Mulai</span>
              <Input type="time" value={kegiatanForm.jamMulai} onChange={(event) => setKegiatanForm((current) => ({ ...current, jamMulai: event.target.value }))} />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-neutral-700">Jam Selesai</span>
              <Input type="time" value={kegiatanForm.jamSelesai} onChange={(event) => setKegiatanForm((current) => ({ ...current, jamSelesai: event.target.value }))} />
            </label>
            <label className="block md:col-span-2">
              <span className="mb-2 block text-sm font-semibold text-neutral-700">Tema / Materi</span>
              <Input value={kegiatanForm.materi} onChange={(event) => setKegiatanForm((current) => ({ ...current, materi: event.target.value }))} placeholder="Contoh: Tema 4 Subtema 2 - Hidup Bersih" />
            </label>
            <label className="block md:col-span-2">
              <span className="mb-2 block text-sm font-semibold text-neutral-700">Kegiatan Pembelajaran</span>
              <textarea
                value={kegiatanForm.kegiatan}
                onChange={(event) => setKegiatanForm((current) => ({ ...current, kegiatan: event.target.value }))}
                className="min-h-24 w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-800 shadow-sm outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-400/15"
                placeholder="Contoh: Apersepsi, membaca materi, diskusi kelompok, dan latihan soal."
              />
            </label>
            <label className="block md:col-span-2">
              <span className="mb-2 block text-sm font-semibold text-neutral-700">Catatan Tambahan</span>
              <textarea
                value={kegiatanForm.catatan}
                onChange={(event) => setKegiatanForm((current) => ({ ...current, catatan: event.target.value }))}
                className="min-h-24 w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-800 shadow-sm outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-400/15"
                placeholder="Opsional, misalnya kendala pembelajaran atau tindak lanjut."
              />
            </label>
          </div>
        </section>
      ) : null}

      {/* Summary */}
      <div className="grid grid-cols-4 gap-2 sm:gap-4">
        <SummaryCard label="Hadir" value={summary.HADIR} color="green" />
        <SummaryCard label="Sakit" value={summary.SAKIT} color="blue" />
        <SummaryCard label="Izin" value={summary.IZIN} color="amber" />
        <SummaryCard label="Alpha" value={summary.ALPHA} color="red" />
      </div>

      {/* Table */}
      {loadingSiswa || validatingSiswa ? (
        <Skeleton className="h-72" />
      ) : rows.length === 0 ? (
        <EmptyState title="Belum ada siswa" description="Pilih kelas yang memiliki data siswa." />
      ) : (
        <Table>
          <thead>
            <tr>
              <Th>No</Th>
              <Th>NIS</Th>
              <Th>Nama</Th>
              <Th>Status</Th>
              <Th>Keterangan</Th>
            </tr>
          </thead>
          <tbody>
            {(siswaData?.items ?? []).map((siswa, index) => {
              const row = rows.find((item) => item.siswaId === siswa.id);
              return (
                <tr key={siswa.id} className="transition-colors hover:bg-orange-50/30">
                  <Td className="text-neutral-400 text-xs w-12">{index + 1}</Td>
                  <Td className="font-mono text-xs text-neutral-500">{siswa.nis}</Td>
                  <Td className="font-semibold text-neutral-800">{siswa.nama}</Td>
                  <Td className="w-36">
                    <Select
                      value={row?.status ?? "HADIR"}
                      onChange={(event) => updateRow(siswa.id, { status: event.target.value as AttendanceStatus })}
                      className={cn("min-h-10 rounded-full px-4 py-2 text-xs font-bold shadow-sm", statusSelectStyles[row?.status ?? "HADIR"])}
                      optionClassName={(option, active) =>
                        cn(statusOptionStyles[option.value as AttendanceStatus], active && "font-bold")
                      }
                    >
                      {statuses.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </Select>
                  </Td>
                  <Td>
                    <Input value={row?.keterangan ?? ""} onChange={(event) => updateRow(siswa.id, { keterangan: event.target.value })} placeholder="Opsional" className="min-h-9 py-1.5 text-xs" />
                  </Td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      )}
    </PageShell>
  );
}
