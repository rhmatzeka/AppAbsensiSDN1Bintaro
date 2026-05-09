"use client";

import { useSession } from "next-auth/react";
import { BookOpenText, Save, CheckCircle2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { PageShell } from "@/components/layout/page-shell";
import { SummaryCard } from "@/components/absensi/summary-card";
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
import { toDateInputValue } from "@/lib/utils";
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
  const { data: siswaData, isLoading: loadingSiswa, mutate: refreshSiswa } = useSiswa({ kelasId, limit: 100 });
  const { data: existing, mutate: refreshAbsensi } = useAbsensi({ kelasId, tanggal });
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
    if (kelas?.[0]) setKelasId(kelas[0].id);
  }, [kelas, kelasId, session?.user]);

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
        <div className="grid gap-4 md:grid-cols-4">
          <label className="block md:col-span-2">
            <span className="mb-2 block text-sm font-semibold text-neutral-700">Kelas</span>
            <Select value={kelasId} onChange={(event) => setKelasId(event.target.value)}>
              {(kelas ?? []).map((item) => (
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
      {loadingSiswa ? (
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
                    <Select value={row?.status ?? "HADIR"} onChange={(event) => updateRow(siswa.id, { status: event.target.value as AttendanceStatus })} className="min-h-9 py-1.5 text-xs font-semibold">
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
