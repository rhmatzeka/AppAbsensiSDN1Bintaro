"use client";

import { useSession } from "next-auth/react";
import { Download, Edit2, Plus, Printer, RotateCcw, Trash2 } from "lucide-react";
import { FormEvent, useMemo, useState } from "react";
import { PageShell } from "@/components/layout/page-shell";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, Td, Th } from "@/components/ui/table";
import { useToast } from "@/components/ui/toast";
import { useKegiatan } from "@/hooks/useKegiatan";
import { useKelas } from "@/hooks/useKelas";
import { useUsers } from "@/hooks/useUsers";
import { formatDate, toDateInputValue } from "@/lib/utils";
import type { KegiatanGuruRow } from "@/types";

type FormState = {
  id?: string;
  tanggal: string;
  jamMulai: string;
  jamSelesai: string;
  guruId: string;
  kelasId: string;
  materi: string;
  kegiatan: string;
  catatan: string;
};

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

export default function KegiatanPage() {
  const { data: session } = useSession();
  const { showToast } = useToast();
  const isAdmin = session?.user.role === "ADMIN";
  const [page, setPage] = useState(1);
  const [guruId, setGuruId] = useState("");
  const [kelasId, setKelasId] = useState("");
  const [tanggalAwal, setTanggalAwal] = useState(currentWeek.start);
  const [tanggalAkhir, setTanggalAkhir] = useState(currentWeek.end);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<FormState>(() => emptyForm(session?.user.kelasId ?? ""));
  const { data: kelas } = useKelas();
  const { data: users } = useUsers(Boolean(isAdmin));
  const { data, isLoading, mutate } = useKegiatan({ page, limit: 20, guruId, kelasId, tanggalAwal, tanggalAkhir });

  const guruOptions = useMemo(() => (users ?? []).filter((user) => user.role === "GURU"), [users]);
  const visibleKelas = useMemo(() => {
    if (isAdmin) return kelas ?? [];
    return (kelas ?? []).filter((item) => item.id === session?.user.kelasId);
  }, [isAdmin, kelas, session?.user.kelasId]);
  const summary = useMemo(() => {
    const rows = data?.items ?? [];
    return {
      total: data?.total ?? 0,
      guru: new Set(rows.map((item) => item.user.id)).size,
      kelas: new Set(rows.map((item) => item.kelas.id)).size
    };
  }, [data]);

  function resetFilters() {
    setGuruId("");
    setKelasId("");
    setTanggalAwal(currentWeek.start);
    setTanggalAkhir(currentWeek.end);
    setPage(1);
  }

  function openCreate() {
    setForm(emptyForm(session?.user.kelasId ?? ""));
    setOpen(true);
  }

  function openEdit(item: KegiatanGuruRow) {
    setForm({
      id: item.id,
      tanggal: item.tanggal.slice(0, 10),
      jamMulai: item.jamMulai ?? "",
      jamSelesai: item.jamSelesai ?? "",
      guruId: item.user.id,
      kelasId: item.kelas.id,
      materi: item.materi,
      kegiatan: item.kegiatan,
      catatan: item.catatan ?? ""
    });
    setOpen(true);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    const response = await fetch(form.id ? `/api/kegiatan/${form.id}` : "/api/kegiatan", {
      method: form.id ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });
    setSaving(false);

    if (!response.ok) {
      const error = (await response.json().catch(() => ({ message: "Gagal menyimpan kegiatan" }))) as { message?: string };
      showToast(error.message ?? "Gagal menyimpan kegiatan", "error");
      return;
    }

    setOpen(false);
    await mutate();
    showToast("Kegiatan guru berhasil disimpan");
  }

  async function remove(id: string) {
    if (!window.confirm("Hapus kegiatan ini?")) return;
    const response = await fetch(`/api/kegiatan/${id}`, { method: "DELETE" });
    if (!response.ok) {
      showToast("Gagal menghapus kegiatan", "error");
      return;
    }
    await mutate();
    showToast("Kegiatan guru berhasil dihapus");
  }

  function exportCsv() {
    const header = ["Tanggal", "Jam Mulai", "Jam Selesai", "Guru", "Kelas", "Materi", "Kegiatan", "Catatan"];
    const rows = (data?.items ?? []).map((item) => [
      formatDate(item.tanggal, "d MMM yyyy"),
      item.jamMulai ?? "",
      item.jamSelesai ?? "",
      item.user.name,
      item.kelas.nama,
      item.materi,
      item.kegiatan,
      item.catatan ?? ""
    ]);
    const csv = [header, ...rows].map((row) => row.map((value) => `"${String(value).replaceAll("\"", "\"\"")}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `rekap-kegiatan-${tanggalAwal}-sd-${tanggalAkhir}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <PageShell
      title="Kegiatan Guru"
      description="Rekap materi dan kegiatan mengajar harian untuk kebutuhan monitoring kepala sekolah."
      action={
        <>
          <Button type="button" variant="secondary" onClick={() => window.print()}>
            <Printer className="h-4 w-4" />
            Print
          </Button>
          <Button type="button" variant="secondary" onClick={exportCsv} disabled={!data?.items.length}>
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
          <Button type="button" onClick={openCreate}>
            <Plus className="h-4 w-4" />
            Tambah Kegiatan
          </Button>
        </>
      }
    >
      <div className="no-print rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-subtle">
        <div className="grid gap-4 lg:grid-cols-[1fr_1fr_160px_160px_auto]">
          {isAdmin ? (
            <label>
              <span className="mb-2 block text-sm font-semibold text-neutral-700">Guru</span>
              <Select value={guruId} onChange={(event) => { setGuruId(event.target.value); setPage(1); }}>
                <option value="">Semua guru</option>
                {guruOptions.map((user) => (
                  <option key={user.id} value={user.id}>{user.name}</option>
                ))}
              </Select>
            </label>
          ) : null}
          <label>
            <span className="mb-2 block text-sm font-semibold text-neutral-700">Kelas</span>
            <Select value={kelasId} onChange={(event) => { setKelasId(event.target.value); setPage(1); }}>
              <option value="">Semua kelas</option>
              {visibleKelas.map((item) => (
                <option key={item.id} value={item.id}>{item.nama}</option>
              ))}
            </Select>
          </label>
          <label>
            <span className="mb-2 block text-sm font-semibold text-neutral-700">Tanggal Awal</span>
            <Input type="date" value={tanggalAwal} onChange={(event) => { setTanggalAwal(event.target.value); setPage(1); }} />
          </label>
          <label>
            <span className="mb-2 block text-sm font-semibold text-neutral-700">Tanggal Akhir</span>
            <Input type="date" value={tanggalAkhir} onChange={(event) => { setTanggalAkhir(event.target.value); setPage(1); }} />
          </label>
          <div className="flex items-end">
            <Button type="button" variant="secondary" className="w-full" onClick={resetFilters}>
              <RotateCcw className="h-4 w-4" />
              Reset
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        <Summary label="Total Kegiatan" value={summary.total} />
        <Summary label="Guru Terlibat" value={summary.guru} />
        <Summary label="Kelas" value={summary.kelas} />
      </div>

      {isLoading ? (
        <Skeleton className="h-96" />
      ) : !data?.items.length ? (
        <EmptyState title="Belum ada kegiatan" description="Tambahkan jurnal kegiatan mengajar atau ubah filter tanggal." />
      ) : (
        <Table>
          <thead>
            <tr>
              <Th>Tanggal</Th>
              <Th>Guru</Th>
              <Th>Kelas</Th>
              <Th>Materi</Th>
              <Th>Kegiatan</Th>
              <Th>Catatan</Th>
              <Th>Aksi</Th>
            </tr>
          </thead>
          <tbody>
            {data.items.map((item) => (
              <tr key={item.id} className="transition-colors hover:bg-orange-50/30">
                <Td>
                  <p className="font-semibold text-neutral-800">{formatDate(item.tanggal, "d MMM yyyy")}</p>
                  <p className="mt-0.5 text-xs text-neutral-400">{[item.jamMulai, item.jamSelesai].filter(Boolean).join(" - ") || "-"}</p>
                </Td>
                <Td>
                  <p className="font-semibold text-neutral-800">{item.user.name}</p>
                  <p className="mt-0.5 font-mono text-xs text-neutral-400">{item.user.email}</p>
                </Td>
                <Td>{item.kelas.nama}</Td>
                <Td className="font-semibold text-neutral-800">{item.materi}</Td>
                <Td className="max-w-md whitespace-normal leading-6 text-neutral-600">{item.kegiatan}</Td>
                <Td className="max-w-xs whitespace-normal text-neutral-500">{item.catatan ?? "-"}</Td>
                <Td>
                  <div className="flex gap-2">
                    <button type="button" className="grid h-9 w-9 place-items-center rounded-lg border border-neutral-200 text-neutral-500 hover:bg-neutral-50 hover:text-neutral-900" onClick={() => openEdit(item)} aria-label="Edit kegiatan">
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button type="button" className="grid h-9 w-9 place-items-center rounded-lg border border-neutral-200 text-neutral-500 hover:border-red-100 hover:bg-red-50 hover:text-[#F43F5E]" onClick={() => void remove(item.id)} aria-label="Hapus kegiatan">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      <div className="flex items-center justify-between">
        <p className="text-sm text-neutral-500">
          Total <span className="font-semibold text-neutral-700">{data?.total ?? 0}</span> kegiatan
        </p>
        <div className="flex gap-2">
          <Button type="button" variant="secondary" disabled={page <= 1} onClick={() => setPage((value) => value - 1)}>
            Sebelumnya
          </Button>
          <Button type="button" variant="secondary" disabled={page >= (data?.pages ?? 1)} onClick={() => setPage((value) => value + 1)}>
            Berikutnya
          </Button>
        </div>
      </div>

      <Modal open={open} title={form.id ? "Edit Kegiatan Guru" : "Tambah Kegiatan Guru"} onClose={() => setOpen(false)} className="max-w-3xl">
        <form onSubmit={submit} className="grid gap-4 md:grid-cols-2">
          {isAdmin ? (
            <label>
              <span className="mb-2 block text-sm font-semibold text-neutral-700">Guru</span>
              <Select required value={form.guruId} onChange={(event) => setForm((current) => ({ ...current, guruId: event.target.value }))}>
                <option value="">Pilih guru</option>
                {guruOptions.map((user) => (
                  <option key={user.id} value={user.id}>{user.name}</option>
                ))}
              </Select>
            </label>
          ) : null}
          <label>
            <span className="mb-2 block text-sm font-semibold text-neutral-700">Kelas</span>
            <Select required value={form.kelasId} onChange={(event) => setForm((current) => ({ ...current, kelasId: event.target.value }))}>
              <option value="">Pilih kelas</option>
              {visibleKelas.map((item) => (
                <option key={item.id} value={item.id}>{item.nama}</option>
              ))}
            </Select>
          </label>
          <label>
            <span className="mb-2 block text-sm font-semibold text-neutral-700">Tanggal</span>
            <Input required type="date" value={form.tanggal} onChange={(event) => setForm((current) => ({ ...current, tanggal: event.target.value }))} />
          </label>
          <label>
            <span className="mb-2 block text-sm font-semibold text-neutral-700">Jam Mulai</span>
            <Input type="time" value={form.jamMulai} onChange={(event) => setForm((current) => ({ ...current, jamMulai: event.target.value }))} />
          </label>
          <label>
            <span className="mb-2 block text-sm font-semibold text-neutral-700">Jam Selesai</span>
            <Input type="time" value={form.jamSelesai} onChange={(event) => setForm((current) => ({ ...current, jamSelesai: event.target.value }))} />
          </label>
          <label className="md:col-span-2">
            <span className="mb-2 block text-sm font-semibold text-neutral-700">Materi</span>
            <Input required value={form.materi} onChange={(event) => setForm((current) => ({ ...current, materi: event.target.value }))} placeholder="Contoh: Pecahan sederhana" />
          </label>
          <label className="md:col-span-2">
            <span className="mb-2 block text-sm font-semibold text-neutral-700">Kegiatan Pembelajaran</span>
            <textarea
              required
              value={form.kegiatan}
              onChange={(event) => setForm((current) => ({ ...current, kegiatan: event.target.value }))}
              className="min-h-28 w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-800 shadow-sm outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-400/15"
              placeholder="Contoh: Apersepsi, penjelasan materi, diskusi kelompok, dan latihan soal."
            />
          </label>
          <label className="md:col-span-2">
            <span className="mb-2 block text-sm font-semibold text-neutral-700">Catatan</span>
            <textarea
              value={form.catatan}
              onChange={(event) => setForm((current) => ({ ...current, catatan: event.target.value }))}
              className="min-h-20 w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-800 shadow-sm outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-400/15"
              placeholder="Opsional"
            />
          </label>
          <div className="flex justify-end gap-2 pt-2 md:col-span-2">
            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>Batal</Button>
            <Button type="submit" loading={saving}>Simpan</Button>
          </div>
        </form>
      </Modal>
    </PageShell>
  );
}

function emptyForm(kelasId: string): FormState {
  return {
    tanggal: toDateInputValue(new Date()),
    jamMulai: "",
    jamSelesai: "",
    guruId: "",
    kelasId,
    materi: "",
    kegiatan: "",
    catatan: ""
  };
}

function Summary({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-neutral-200/80 bg-white p-4 shadow-subtle">
      <p className="text-xs font-bold uppercase text-neutral-400">{label}</p>
      <p className="mt-2 text-2xl font-black text-neutral-900">{value}</p>
    </div>
  );
}
