"use client";

import Link from "next/link";
import { Check, ChevronDown, Edit2, Plus, Trash2 } from "lucide-react";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { PageShell } from "@/components/layout/page-shell";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { LoadingPanel } from "@/components/ui/loading-panel";
import { Modal } from "@/components/ui/modal";
import { Table, Td, Th } from "@/components/ui/table";
import { useToast } from "@/components/ui/toast";
import { useApi } from "@/hooks/useApi";
import { useKelas } from "@/hooks/useKelas";
import type { KelasSummary, SiswaRow } from "@/types";

type KelasDetail = KelasSummary & { siswa: SiswaRow[] };
type KelasForm = { id?: string; nama: string; tingkat: string; jurusan: string; tahunAjar: string };
const emptyForm: KelasForm = { nama: "", tingkat: "", jurusan: "", tahunAjar: "2025/2026" };

export default function KelasPage() {
  const { showToast } = useToast();
  const { data, isLoading, mutate } = useKelas();
  const [selectedId, setSelectedId] = useState("");
  const [form, setForm] = useState<KelasForm>(emptyForm);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const { data: selected } = useApi<KelasDetail>(selectedId ? `/api/kelas/${selectedId}` : null);
  const totalSiswa = useMemo(() => (data ?? []).reduce((total, item) => total + item.jumlahSiswa, 0), [data]);
  const selectedSummary = useMemo(() => (data ?? []).find((item) => item.id === selectedId), [data, selectedId]);
  const selectedReady = selected?.id === selectedId;

  function openCreate() { setForm(emptyForm); setOpen(true); }
  function openEdit(item: KelasSummary) { setForm({ id: item.id, nama: item.nama, tingkat: item.tingkat, jurusan: item.jurusan ?? "", tahunAjar: item.tahunAjar }); setOpen(true); }

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    const r = await fetch(form.id ? `/api/kelas/${form.id}` : "/api/kelas", { method: form.id ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    setSaving(false);
    if (!r.ok) { const err = (await r.json().catch(() => ({ message: "Gagal menyimpan kelas" }))) as { message?: string }; showToast(err.message ?? "Gagal menyimpan kelas", "error"); return; }
    setOpen(false); await mutate(); showToast("Kelas berhasil disimpan");
  }

  async function remove(id: string) {
    if (!window.confirm("Hapus kelas ini?")) return;
    const r = await fetch(`/api/kelas/${id}`, { method: "DELETE" });
    if (!r.ok) { showToast("Kelas tidak dapat dihapus karena masih memiliki data terkait", "error"); return; }
    if (selectedId === id) setSelectedId("");
    await mutate(); showToast("Kelas berhasil dihapus");
  }

  return (
    <PageShell title="Manajemen Kelas" description="Kelola kelas dan lihat daftar siswa per kelas." action={<Button type="button" onClick={openCreate}><Plus className="h-4 w-4" />Tambah Kelas</Button>}>
      {isLoading ? (
        <LoadingPanel compact />
      ) : !data?.length ? (
        <EmptyState title="Belum ada kelas" description="Tambahkan kelas terlebih dahulu." />
      ) : (
        <div className="space-y-5">
          <section className="rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-subtle">
            <div className="grid gap-4 lg:grid-cols-[minmax(260px,420px)_1fr_auto] lg:items-end">
              <label className="block">
                <span className="mb-2 block text-sm font-bold text-neutral-900">Pilih Kelas</span>
                <KelasDropdown items={data} value={selectedId} onChange={setSelectedId} />
              </label>

              <div className="text-sm text-neutral-500">
                <p>{data.length} kelas tersedia · {totalSiswa} siswa terdaftar</p>
                <p className="mt-1">Pilih salah satu kelas dari dropdown untuk membuka daftar siswanya.</p>
              </div>

              {selectedReady && selectedSummary ? (
                <div className="flex flex-wrap gap-2 lg:justify-end">
                  <Link href={`/absensi/${selected.id}`} className="inline-flex min-h-10 items-center justify-center rounded-xl bg-gradient-to-b from-orange-400 to-orange-500 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:from-orange-500 hover:to-orange-600">
                    Detail Absensi
                  </Link>
                  <button
                    type="button"
                    className="grid h-10 w-10 place-items-center rounded-xl border border-neutral-200 text-neutral-500 transition-colors hover:bg-neutral-50 hover:text-neutral-900"
                    onClick={() => openEdit(selectedSummary)}
                    aria-label={`Edit kelas ${selected.nama}`}
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    className="grid h-10 w-10 place-items-center rounded-xl border border-neutral-200 text-neutral-500 transition-colors hover:border-red-100 hover:bg-red-50 hover:text-[#F43F5E]"
                    onClick={() => void remove(selected.id)}
                    aria-label={`Hapus kelas ${selected.nama}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ) : null}
            </div>
          </section>

          {selectedId && !selectedReady ? (
            <LoadingPanel compact />
          ) : selected ? (
            <section className="overflow-hidden rounded-2xl border border-neutral-200/80 bg-white shadow-subtle">
              <div className="flex flex-col justify-between gap-3 border-b border-neutral-100 px-5 py-4 sm:flex-row sm:items-center">
                <div>
                  <h2 className="text-xl font-bold text-neutral-900">Siswa Kelas {selected.nama}</h2>
                  <p className="mt-1 text-sm text-neutral-500">
                    {selected.siswa.length} siswa · Tingkat {selected.tingkat} · {selected.tahunAjar}
                  </p>
                </div>
                <span className="text-sm text-neutral-500">Jurusan: {selected.jurusan || "-"}</span>
              </div>

              <div className="p-5">
                <Table>
                  <thead><tr><Th>NIS</Th><Th>Nama</Th><Th>Jenis Kelamin</Th></tr></thead>
                  <tbody>
                    {selected.siswa.map((s, index) => (
                      <tr key={s.id} className={index % 2 === 0 ? "bg-white hover:bg-neutral-50" : "bg-neutral-50/60 hover:bg-neutral-100"}>
                        <Td className="font-mono text-xs text-neutral-500">{s.nis}</Td>
                        <Td className="font-medium text-neutral-800">{s.nama}</Td>
                        <Td className="text-neutral-500">{s.jenisKelamin === "LAKI_LAKI" ? "Laki-laki" : "Perempuan"}</Td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </section>
          ) : (
            <div className="rounded-2xl border border-dashed border-neutral-300 bg-white/70 p-8">
              <EmptyState title="Belum ada kelas dipilih" description="Pilih kelas dari dropdown untuk menampilkan daftar siswa." />
            </div>
          )}
        </div>
      )}

      <Modal open={open} title={form.id ? "Edit Kelas" : "Tambah Kelas"} onClose={() => setOpen(false)}>
        <form onSubmit={submit} className="grid gap-4 md:grid-cols-2">
          <label><span className="mb-2 block text-sm font-semibold text-neutral-700">Nama Kelas</span><Input required value={form.nama} onChange={(e) => setForm((c) => ({ ...c, nama: e.target.value }))} /></label>
          <label><span className="mb-2 block text-sm font-semibold text-neutral-700">Tingkat</span><Input required value={form.tingkat} onChange={(e) => setForm((c) => ({ ...c, tingkat: e.target.value }))} /></label>
          <label><span className="mb-2 block text-sm font-semibold text-neutral-700">Jurusan</span><Input value={form.jurusan} onChange={(e) => setForm((c) => ({ ...c, jurusan: e.target.value }))} /></label>
          <label><span className="mb-2 block text-sm font-semibold text-neutral-700">Tahun Ajar</span><Input required value={form.tahunAjar} onChange={(e) => setForm((c) => ({ ...c, tahunAjar: e.target.value }))} /></label>
          <div className="md:col-span-2 flex justify-end gap-2 pt-2"><Button type="button" variant="secondary" onClick={() => setOpen(false)}>Batal</Button><Button type="submit" loading={saving}>Simpan</Button></div>
        </form>
      </Modal>
    </PageShell>
  );
}

function KelasDropdown({ items, value, onChange }: { items: KelasSummary[]; value: string; onChange: (value: string) => void }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const selected = items.find((item) => item.id === value);

  useEffect(() => {
    function onPointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }

    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, []);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        className="flex min-h-12 w-full items-center justify-between gap-3 rounded-xl border border-neutral-200 bg-white px-4 py-3 text-left text-sm shadow-sm outline-none transition-colors hover:border-orange-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-400/15"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <span className="min-w-0">
          <span className={selected ? "block truncate font-bold text-neutral-900" : "block truncate font-medium text-neutral-400"}>
            {selected ? `Kelas ${selected.nama}` : "Pilih kelas untuk melihat siswa"}
          </span>
          {selected ? (
            <span className="mt-0.5 block truncate text-xs text-neutral-500">
              Tingkat {selected.tingkat} · {selected.jumlahSiswa} siswa · {selected.tahunAjar}
            </span>
          ) : null}
        </span>
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-orange-50 text-orange-600">
          <ChevronDown className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} />
        </span>
      </button>

      {open ? (
        <div className="absolute left-0 right-0 z-30 mt-2 overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-card">
          <div className="max-h-72 overflow-y-auto p-2" role="listbox">
            <button
              type="button"
              className={`flex w-full items-center justify-between rounded-xl px-3 py-3 text-left text-sm transition-colors ${!value ? "bg-orange-50 text-orange-700" : "text-neutral-500 hover:bg-neutral-50"}`}
              onClick={() => { onChange(""); setOpen(false); }}
              role="option"
              aria-selected={!value}
            >
              <span>
                <span className="block font-semibold">Pilih kelas untuk melihat siswa</span>
                <span className="mt-0.5 block text-xs text-neutral-400">Belum ada kelas dipilih</span>
              </span>
              {!value ? <Check className="h-4 w-4" /> : null}
            </button>

            {items.map((item) => {
              const active = value === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  className={`mt-1 flex w-full items-center justify-between gap-3 rounded-xl px-3 py-3 text-left text-sm transition-colors ${active ? "bg-orange-50 text-orange-700" : "text-neutral-700 hover:bg-neutral-50"}`}
                  onClick={() => { onChange(item.id); setOpen(false); }}
                  role="option"
                  aria-selected={active}
                >
                  <span className="min-w-0">
                    <span className={`block truncate font-bold ${active ? "text-orange-700" : "text-neutral-900"}`}>Kelas {item.nama}</span>
                    <span className="mt-0.5 block truncate text-xs text-neutral-500">
                      Tingkat {item.tingkat} · {item.jumlahSiswa} siswa · {item.tahunAjar}
                    </span>
                  </span>
                  {active ? <Check className="h-4 w-4 shrink-0" /> : null}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}
