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

type SiswaForm = {
  id?: string;
  nis: string;
  nama: string;
  jenisKelamin: Gender;
  tanggalLahir: string;
  alamat: string;
  foto: string;
  kelasId: string;
};

const emptyForm: SiswaForm = {
  nis: "",
  nama: "",
  jenisKelamin: "LAKI_LAKI",
  tanggalLahir: "",
  alamat: "",
  foto: "",
  kelasId: ""
};

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

  function openCreate() {
    setForm({ ...emptyForm, kelasId: kelasOptions[0]?.id ?? "" });
    setOpen(true);
  }

  function openEdit(siswa: SiswaRow) {
    setForm({
      id: siswa.id,
      nis: siswa.nis,
      nama: siswa.nama,
      jenisKelamin: siswa.jenisKelamin,
      tanggalLahir: siswa.tanggalLahir?.slice(0, 10) ?? "",
      alamat: siswa.alamat ?? "",
      foto: siswa.foto ?? "",
      kelasId: siswa.kelasId
    });
    setOpen(true);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.nis.trim() || !form.nama.trim() || !form.kelasId) {
      showToast("NIS, nama, dan kelas wajib diisi", "error");
      return;
    }

    setSaving(true);
    const response = await fetch(form.id ? `/api/siswa/${form.id}` : "/api/siswa", {
      method: form.id ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });
    setSaving(false);

    if (!response.ok) {
      const error = (await response.json().catch(() => ({ message: "Gagal menyimpan siswa" }))) as { message?: string };
      showToast(error.message ?? "Gagal menyimpan siswa", "error");
      return;
    }

    setOpen(false);
    await mutate();
    showToast("Data siswa berhasil disimpan");
  }

  async function remove(id: string) {
    if (!window.confirm("Hapus siswa ini?")) return;
    const response = await fetch(`/api/siswa/${id}`, { method: "DELETE" });
    if (!response.ok) {
      showToast("Gagal menghapus siswa", "error");
      return;
    }
    await mutate();
    showToast("Siswa berhasil dihapus");
  }

  function parseCsv(text: string) {
    const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
    const [, ...body] = lines;
    const parsed = body.map((line) => {
      const [nis, nama, jenisKelamin, kelasNama, alamat] = line.split(",").map((part) => part.trim());
      const kelasMatch = kelasOptions.find((item) => item.nama.toLowerCase() === kelasNama?.toLowerCase());
      const gender: Gender = jenisKelamin === "PEREMPUAN" ? "PEREMPUAN" : "LAKI_LAKI";
      return {
        ...emptyForm,
        nis: nis ?? "",
        nama: nama ?? "",
        jenisKelamin: gender,
        kelasId: kelasMatch?.id ?? kelasOptions[0]?.id ?? "",
        alamat: alamat ?? ""
      };
    });
    setCsvPreview(parsed.filter((item) => item.nis && item.nama));
  }

  async function importCsv() {
    if (!csvPreview.length) return;
    const response = await fetch("/api/siswa", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: csvPreview })
    });
    if (!response.ok) {
      showToast("Import CSV gagal", "error");
      return;
    }
    setCsvPreview([]);
    await mutate();
    showToast("Import CSV berhasil");
  }

  const startItem = useMemo(() => ((data?.page ?? 1) - 1) * 10 + 1, [data?.page]);

  return (
    <PageShell
      title="Manajemen Siswa"
      description="Kelola data siswa, filter berdasarkan kelas, dan import CSV."
      action={isAdmin ? (
        <Button type="button" onClick={openCreate}>
          <Plus className="h-4 w-4" />
          Tambah Siswa
        </Button>
      ) : null}
    >
      <div className="grid gap-3 lg:grid-cols-[1fr_240px_220px]">
        <label className="relative block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
          <Input className="pl-9" placeholder="Cari nama atau NIS" value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} />
        </label>
        <Select value={kelasId} onChange={(event) => { setKelasId(event.target.value); setPage(1); }}>
          <option value="">Semua kelas</option>
          {kelasOptions.map((item) => (
            <option key={item.id} value={item.id}>
              {item.nama}
            </option>
          ))}
        </Select>
        {isAdmin ? (
          <label className="inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-xl border border-neutral-200 bg-white px-4 text-sm font-medium text-neutral-700 hover:bg-neutral-50">
            <Upload className="h-4 w-4" />
            Import CSV
            <input
              type="file"
              accept=".csv,text/csv"
              className="sr-only"
              onChange={async (event) => {
                const file = event.target.files?.[0];
                if (file) parseCsv(await file.text());
                event.target.value = "";
              }}
            />
          </label>
        ) : null}
      </div>

      {csvPreview.length ? (
        <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-subtle">
          <div className="mb-3 flex items-center justify-between gap-3">
            <p className="text-sm font-medium text-neutral-950">Preview CSV: {csvPreview.length} siswa</p>
            <Button type="button" onClick={importCsv}>Simpan Import</Button>
          </div>
          <p className="text-xs text-neutral-500">Format: nis,nama,jenisKelamin,kelas,alamat</p>
        </div>
      ) : null}

      {isLoading ? (
        <Skeleton className="h-80" />
      ) : !data?.items.length ? (
        <EmptyState title="Data siswa kosong" description="Tambahkan siswa atau ubah filter pencarian." />
      ) : (
        <Table>
          <thead>
            <tr>
              <Th>No</Th>
              <Th>NIS</Th>
              <Th>Nama</Th>
              <Th>Kelas</Th>
              <Th>Jenis Kelamin</Th>
              <Th>Aksi</Th>
            </tr>
          </thead>
          <tbody>
            {data.items.map((siswa, index) => (
              <tr key={siswa.id} className={index % 2 === 0 ? "bg-white hover:bg-neutral-50" : "bg-neutral-50/60 hover:bg-neutral-100"}>
                <Td>{startItem + index}</Td>
                <Td className="font-mono text-xs">{siswa.nis}</Td>
                <Td className="font-medium text-neutral-950">{siswa.nama}</Td>
                <Td>{siswa.kelas.nama}</Td>
                <Td>{siswa.jenisKelamin === "LAKI_LAKI" ? "Laki-laki" : "Perempuan"}</Td>
                <Td>
                  <div className="flex items-center gap-2">
                    <Link href={`/siswa/${siswa.id}`} className="grid h-9 w-9 place-items-center rounded-lg text-neutral-500 hover:bg-neutral-100" aria-label="Detail siswa">
                      <Eye className="h-4 w-4" />
                    </Link>
                    {isAdmin ? (
                      <>
                        <button className="grid h-9 w-9 place-items-center rounded-lg text-neutral-500 hover:bg-neutral-100" onClick={() => openEdit(siswa)} aria-label="Edit siswa">
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button className="grid h-9 w-9 place-items-center rounded-lg text-[#E05252] hover:bg-red-50" onClick={() => void remove(siswa.id)} aria-label="Hapus siswa">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </>
                    ) : null}
                  </div>
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      <div className="flex items-center justify-between">
        <p className="text-sm text-neutral-500">Total {data?.total ?? 0} siswa</p>
        <div className="flex gap-2">
          <Button type="button" variant="secondary" disabled={page <= 1} onClick={() => setPage((value) => value - 1)}>Sebelumnya</Button>
          <Button type="button" variant="secondary" disabled={page >= (data?.pages ?? 1)} onClick={() => setPage((value) => value + 1)}>Berikutnya</Button>
        </div>
      </div>

      <Modal open={open} title={form.id ? "Edit Siswa" : "Tambah Siswa"} onClose={() => setOpen(false)}>
        <form onSubmit={submit} className="grid gap-4 md:grid-cols-2">
          <label>
            <span className="mb-1.5 block text-sm font-medium text-neutral-700">NIS</span>
            <Input required value={form.nis} onChange={(event) => setForm((current) => ({ ...current, nis: event.target.value }))} />
          </label>
          <label>
            <span className="mb-1.5 block text-sm font-medium text-neutral-700">Nama</span>
            <Input required value={form.nama} onChange={(event) => setForm((current) => ({ ...current, nama: event.target.value }))} />
          </label>
          <label>
            <span className="mb-1.5 block text-sm font-medium text-neutral-700">Kelas</span>
            <Select required value={form.kelasId} onChange={(event) => setForm((current) => ({ ...current, kelasId: event.target.value }))}>
              <option value="">Pilih kelas</option>
              {kelasOptions.map((item) => (
                <option key={item.id} value={item.id}>{item.nama}</option>
              ))}
            </Select>
          </label>
          <label>
            <span className="mb-1.5 block text-sm font-medium text-neutral-700">Jenis Kelamin</span>
            <Select value={form.jenisKelamin} onChange={(event) => setForm((current) => ({ ...current, jenisKelamin: event.target.value as Gender }))}>
              <option value="LAKI_LAKI">Laki-laki</option>
              <option value="PEREMPUAN">Perempuan</option>
            </Select>
          </label>
          <label>
            <span className="mb-1.5 block text-sm font-medium text-neutral-700">Tanggal Lahir</span>
            <Input type="date" value={form.tanggalLahir} onChange={(event) => setForm((current) => ({ ...current, tanggalLahir: event.target.value }))} />
          </label>
          <label>
            <span className="mb-1.5 block text-sm font-medium text-neutral-700">Foto URL</span>
            <Input value={form.foto} onChange={(event) => setForm((current) => ({ ...current, foto: event.target.value }))} />
          </label>
          <label className="md:col-span-2">
            <span className="mb-1.5 block text-sm font-medium text-neutral-700">Alamat</span>
            <Textarea value={form.alamat} onChange={(event) => setForm((current) => ({ ...current, alamat: event.target.value }))} />
          </label>
          <div className="md:col-span-2 flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>Batal</Button>
            <Button type="submit" loading={saving}>Simpan</Button>
          </div>
        </form>
      </Modal>
    </PageShell>
  );
}
