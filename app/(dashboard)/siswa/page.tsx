"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { Edit2, Eye, Plus, Search, Trash2, Upload } from "lucide-react";
import { FormEvent, useMemo, useState } from "react";
import { PageShell } from "@/components/layout/page-shell";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Input, Textarea } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, Td, Th } from "@/components/ui/table";
import { useToast } from "@/components/ui/toast";
import { useKelas } from "@/hooks/useKelas";
import { useSiswa } from "@/hooks/useSiswa";
import type { Gender, SiswaRow } from "@/types";

type SiswaForm = { id?: string; nis: string; nama: string; jenisKelamin: Gender; tanggalLahir: string; alamat: string; foto: string; kelasId: string };
const emptyForm: SiswaForm = { nis: "", nama: "", jenisKelamin: "LAKI_LAKI", tanggalLahir: "", alamat: "", foto: "", kelasId: "" };

export default function SiswaPage() {
  const { showToast } = useToast();
  const { data: session } = useSession();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [kelasId, setKelasId] = useState("");
  const [form, setForm] = useState<SiswaForm>(emptyForm);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [csvPreview, setCsvPreview] = useState<SiswaForm[]>([]);
  const { data: kelas } = useKelas();
  const { data, isLoading, mutate } = useSiswa({ page, search, kelasId });
  const kelasOptions = kelas ?? [];
  const isAdmin = session?.user.role === "ADMIN";

  function openCreate() { setForm({ ...emptyForm, kelasId: kelasOptions[0]?.id ?? "" }); setOpen(true); }
  function openEdit(s: SiswaRow) { setForm({ id: s.id, nis: s.nis, nama: s.nama, jenisKelamin: s.jenisKelamin, tanggalLahir: s.tanggalLahir?.slice(0, 10) ?? "", alamat: s.alamat ?? "", foto: s.foto ?? "", kelasId: s.kelasId }); setOpen(true); }

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!form.nis.trim() || !form.nama.trim() || !form.kelasId) { showToast("NIS, nama, dan kelas wajib diisi", "error"); return; }
    setSaving(true);
    const r = await fetch(form.id ? `/api/siswa/${form.id}` : "/api/siswa", { method: form.id ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    setSaving(false);
    if (!r.ok) { const err = (await r.json().catch(() => ({ message: "Gagal menyimpan siswa" }))) as { message?: string }; showToast(err.message ?? "Gagal menyimpan siswa", "error"); return; }
    setOpen(false); await mutate(); showToast("Data siswa berhasil disimpan");
  }

  async function remove(id: string) {
    if (!window.confirm("Hapus siswa ini?")) return;
    const r = await fetch(`/api/siswa/${id}`, { method: "DELETE" });
    if (!r.ok) { showToast("Gagal menghapus siswa", "error"); return; }
    await mutate(); showToast("Siswa berhasil dihapus");
  }

  function parseCsv(text: string) {
    const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    const [, ...body] = lines;
    const parsed = body.map((line) => {
      const [nis, nama, jk, kn, alamat] = line.split(",").map((p) => p.trim());
      const km = kelasOptions.find((i) => i.nama.toLowerCase() === kn?.toLowerCase());
      return { ...emptyForm, nis: nis ?? "", nama: nama ?? "", jenisKelamin: (jk === "PEREMPUAN" ? "PEREMPUAN" : "LAKI_LAKI") as Gender, kelasId: km?.id ?? kelasOptions[0]?.id ?? "", alamat: alamat ?? "" };
    });
    setCsvPreview(parsed.filter((i) => i.nis && i.nama));
  }

  async function importCsv() {
    if (!csvPreview.length) return;
    const r = await fetch("/api/siswa", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ items: csvPreview }) });
    if (!r.ok) { showToast("Import CSV gagal", "error"); return; }
    setCsvPreview([]); await mutate(); showToast("Import CSV berhasil");
  }

  const startItem = useMemo(() => ((data?.page ?? 1) - 1) * 10 + 1, [data?.page]);

  return (
    <PageShell title="Manajemen Siswa" description="Kelola data siswa, filter berdasarkan kelas, dan import CSV." action={isAdmin ? <Button type="button" onClick={openCreate}><Plus className="h-4 w-4" />Tambah Siswa</Button> : null}>
      <div className="grid gap-3 lg:grid-cols-[1fr_240px_220px]">
        <label className="relative block"><Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" /><Input className="pl-10" placeholder="Cari nama atau NIS" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} /></label>
        <Select value={kelasId} onChange={(e) => { setKelasId(e.target.value); setPage(1); }}><option value="">Semua kelas</option>{kelasOptions.map((i) => <option key={i.id} value={i.id}>{i.nama}</option>)}</Select>
        {isAdmin ? <label className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-xl border border-neutral-200 bg-white px-4 text-sm font-semibold text-neutral-600 hover:bg-neutral-50 hover:border-neutral-300"><Upload className="h-4 w-4" />Import CSV<input type="file" accept=".csv,text/csv" className="sr-only" onChange={async (e) => { const f = e.target.files?.[0]; if (f) parseCsv(await f.text()); e.target.value = ""; }} /></label> : null}
      </div>

      {csvPreview.length ? <div className="rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-subtle"><div className="mb-3 flex items-center justify-between gap-3"><p className="text-sm font-bold text-neutral-800">Preview CSV: {csvPreview.length} siswa</p><Button type="button" onClick={importCsv}>Simpan Import</Button></div><p className="text-xs text-neutral-500">Format: nis,nama,jenisKelamin,kelas,alamat</p></div> : null}

      {isLoading ? <Skeleton className="h-80" /> : !data?.items.length ? <EmptyState title="Data siswa kosong" description="Tambahkan siswa atau ubah filter pencarian." /> : (
        <Table><thead><tr><Th>No</Th><Th>NIS</Th><Th>Nama</Th><Th>Kelas</Th><Th>Jenis Kelamin</Th><Th>Aksi</Th></tr></thead><tbody>
          {data.items.map((s, i) => (
            <tr key={s.id} className="transition-colors hover:bg-orange-50/30">
              <Td className="text-neutral-400 text-xs w-12">{startItem + i}</Td>
              <Td className="font-mono text-xs text-neutral-500">{s.nis}</Td>
              <Td className="font-semibold text-neutral-800">{s.nama}</Td>
              <Td><span className="inline-flex rounded-lg bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-600">{s.kelas.nama}</span></Td>
              <Td className="text-neutral-500">{s.jenisKelamin === "LAKI_LAKI" ? "Laki-laki" : "Perempuan"}</Td>
              <Td><div className="flex items-center gap-1">
                <Link href={`/siswa/${s.id}`} className="grid h-8 w-8 place-items-center rounded-lg text-neutral-400 hover:bg-sky-50 hover:text-sky-600" aria-label="Detail"><Eye className="h-4 w-4" /></Link>
                {isAdmin ? <><button className="grid h-8 w-8 place-items-center rounded-lg text-neutral-400 hover:bg-amber-50 hover:text-amber-600" onClick={() => openEdit(s)} aria-label="Edit"><Edit2 className="h-4 w-4" /></button><button className="grid h-8 w-8 place-items-center rounded-lg text-neutral-400 hover:bg-rose-50 hover:text-rose-600" onClick={() => void remove(s.id)} aria-label="Hapus"><Trash2 className="h-4 w-4" /></button></> : null}
              </div></Td>
            </tr>))}
        </tbody></Table>)}

      <div className="flex items-center justify-between"><p className="text-sm text-neutral-500">Total <span className="font-semibold text-neutral-700">{data?.total ?? 0}</span> siswa</p><div className="flex gap-2"><Button type="button" variant="secondary" disabled={page <= 1} onClick={() => setPage((v) => v - 1)}>Sebelumnya</Button><Button type="button" variant="secondary" disabled={page >= (data?.pages ?? 1)} onClick={() => setPage((v) => v + 1)}>Berikutnya</Button></div></div>

      <Modal open={open} title={form.id ? "Edit Siswa" : "Tambah Siswa"} onClose={() => setOpen(false)}>
        <form onSubmit={submit} className="grid gap-4 md:grid-cols-2">
          <label><span className="mb-2 block text-sm font-semibold text-neutral-700">NIS</span><Input required value={form.nis} onChange={(e) => setForm((c) => ({ ...c, nis: e.target.value }))} /></label>
          <label><span className="mb-2 block text-sm font-semibold text-neutral-700">Nama</span><Input required value={form.nama} onChange={(e) => setForm((c) => ({ ...c, nama: e.target.value }))} /></label>
          <label><span className="mb-2 block text-sm font-semibold text-neutral-700">Kelas</span><Select required value={form.kelasId} onChange={(e) => setForm((c) => ({ ...c, kelasId: e.target.value }))}><option value="">Pilih kelas</option>{kelasOptions.map((i) => <option key={i.id} value={i.id}>{i.nama}</option>)}</Select></label>
          <label><span className="mb-2 block text-sm font-semibold text-neutral-700">Jenis Kelamin</span><Select value={form.jenisKelamin} onChange={(e) => setForm((c) => ({ ...c, jenisKelamin: e.target.value as Gender }))}><option value="LAKI_LAKI">Laki-laki</option><option value="PEREMPUAN">Perempuan</option></Select></label>
          <label><span className="mb-2 block text-sm font-semibold text-neutral-700">Tanggal Lahir</span><Input type="date" value={form.tanggalLahir} onChange={(e) => setForm((c) => ({ ...c, tanggalLahir: e.target.value }))} /></label>
          <label><span className="mb-2 block text-sm font-semibold text-neutral-700">Foto URL</span><Input value={form.foto} onChange={(e) => setForm((c) => ({ ...c, foto: e.target.value }))} /></label>
          <label className="md:col-span-2"><span className="mb-2 block text-sm font-semibold text-neutral-700">Alamat</span><Textarea value={form.alamat} onChange={(e) => setForm((c) => ({ ...c, alamat: e.target.value }))} /></label>
          <div className="md:col-span-2 flex justify-end gap-2 pt-2"><Button type="button" variant="secondary" onClick={() => setOpen(false)}>Batal</Button><Button type="submit" loading={saving}>Simpan</Button></div>
        </form>
      </Modal>
    </PageShell>
  );
}
