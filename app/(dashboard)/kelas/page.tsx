"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { Edit2, Plus, Trash2, Users } from "lucide-react";
import { FormEvent, useState } from "react";
import { PageShell } from "@/components/layout/page-shell";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, Td, Th } from "@/components/ui/table";
import { useToast } from "@/components/ui/toast";
import { useApi } from "@/hooks/useApi";
import { useKelas } from "@/hooks/useKelas";
import type { KelasSummary, SiswaRow } from "@/types";

type KelasDetail = KelasSummary & {
  siswa: SiswaRow[];
};

type KelasForm = {
  id?: string;
  nama: string;
  tingkat: string;
  jurusan: string;
  tahunAjar: string;
};

const emptyForm: KelasForm = {
  nama: "",
  tingkat: "",
  jurusan: "",
  tahunAjar: "2024/2025"
};

export default function KelasPage() {
  const { showToast } = useToast();
  const { data: session } = useSession();
  const { data, isLoading, mutate } = useKelas();
  const [selectedId, setSelectedId] = useState("");
  const [form, setForm] = useState<KelasForm>(emptyForm);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const { data: selected } = useApi<KelasDetail>(selectedId ? `/api/kelas/${selectedId}` : null);
  const isAdmin = session?.user.role === "ADMIN";

  function openCreate() {
    setForm(emptyForm);
    setOpen(true);
  }

  function openEdit(item: KelasSummary) {
    setForm({
      id: item.id,
      nama: item.nama,
      tingkat: item.tingkat,
      jurusan: item.jurusan ?? "",
      tahunAjar: item.tahunAjar
    });
    setOpen(true);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    const response = await fetch(form.id ? `/api/kelas/${form.id}` : "/api/kelas", {
      method: form.id ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });
    setSaving(false);

    if (!response.ok) {
      const error = (await response.json().catch(() => ({ message: "Gagal menyimpan kelas" }))) as { message?: string };
      showToast(error.message ?? "Gagal menyimpan kelas", "error");
      return;
    }

    setOpen(false);
    await mutate();
    showToast("Kelas berhasil disimpan");
  }

  async function remove(id: string) {
    if (!window.confirm("Hapus kelas ini?")) return;
    const response = await fetch(`/api/kelas/${id}`, { method: "DELETE" });
    if (!response.ok) {
      showToast("Kelas tidak dapat dihapus karena masih memiliki data terkait", "error");
      return;
    }
    if (selectedId === id) setSelectedId("");
    await mutate();
    showToast("Kelas berhasil dihapus");
  }

  return (
    <PageShell
      title="Manajemen Kelas"
      description="Kelola kelas dan lihat daftar siswa per kelas."
      action={isAdmin ? (
        <Button type="button" onClick={openCreate}>
          <Plus className="h-4 w-4" />
          Tambah Kelas
        </Button>
      ) : null}
    >
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((item) => <Skeleton key={item} className="h-40" />)}
        </div>
      ) : !data?.length ? (
        <EmptyState title="Belum ada kelas" description="Tambahkan kelas terlebih dahulu." />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {data.map((item) => (
            <button key={item.id} type="button" onClick={() => setSelectedId(item.id)} className="rounded-xl border border-neutral-200 bg-white p-5 text-left shadow-subtle outline-none hover:border-[#5C6BC0] focus-visible:ring-2 focus-visible:ring-[#5C6BC0]">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-neutral-950">{item.nama}</h2>
                  <p className="mt-1 text-sm text-neutral-500">{item.tahunAjar}</p>
                </div>
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#5C6BC0]/10 text-[#5C6BC0]">
                  <Users className="h-5 w-5" />
                </div>
              </div>
              <p className="mt-5 text-sm text-neutral-600">{item.jumlahSiswa} siswa</p>
              {isAdmin ? (
                <div className="mt-4 flex gap-2">
                  <Button type="button" variant="secondary" className="h-9 px-3" onClick={(event) => { event.stopPropagation(); openEdit(item); }}>
                    <Edit2 className="h-4 w-4" />
                    Edit
                  </Button>
                  <Button type="button" variant="danger" className="h-9 px-3" onClick={(event) => { event.stopPropagation(); void remove(item.id); }}>
                    <Trash2 className="h-4 w-4" />
                    Hapus
                  </Button>
                </div>
              ) : null}
            </button>
          ))}
        </div>
      )}

      {selected ? (
        <section className="rounded-xl border border-neutral-200 bg-white p-4 shadow-subtle">
          <div className="mb-4 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-semibold text-neutral-950">Siswa {selected.nama}</h2>
              <p className="text-sm text-neutral-500">{selected.siswa.length} siswa terdaftar</p>
            </div>
            <Link href={`/absensi/${selected.id}`} className="rounded-xl bg-[#5C6BC0] px-4 py-2 text-sm font-medium text-white hover:bg-[#4d59aa]">
              Detail Absensi
            </Link>
          </div>
          <Table>
            <thead>
              <tr>
                <Th>NIS</Th>
                <Th>Nama</Th>
                <Th>Jenis Kelamin</Th>
              </tr>
            </thead>
            <tbody>
              {selected.siswa.map((siswa, index) => (
                <tr key={siswa.id} className={index % 2 === 0 ? "bg-white hover:bg-neutral-50" : "bg-neutral-50/60 hover:bg-neutral-100"}>
                  <Td className="font-mono text-xs">{siswa.nis}</Td>
                  <Td>{siswa.nama}</Td>
                  <Td>{siswa.jenisKelamin === "LAKI_LAKI" ? "Laki-laki" : "Perempuan"}</Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </section>
      ) : null}

      <Modal open={open} title={form.id ? "Edit Kelas" : "Tambah Kelas"} onClose={() => setOpen(false)}>
        <form onSubmit={submit} className="grid gap-4 md:grid-cols-2">
          <label>
            <span className="mb-1.5 block text-sm font-medium text-neutral-700">Nama Kelas</span>
            <Input required value={form.nama} onChange={(event) => setForm((current) => ({ ...current, nama: event.target.value }))} />
          </label>
          <label>
            <span className="mb-1.5 block text-sm font-medium text-neutral-700">Tingkat</span>
            <Input required value={form.tingkat} onChange={(event) => setForm((current) => ({ ...current, tingkat: event.target.value }))} />
          </label>
          <label>
            <span className="mb-1.5 block text-sm font-medium text-neutral-700">Jurusan</span>
            <Input value={form.jurusan} onChange={(event) => setForm((current) => ({ ...current, jurusan: event.target.value }))} />
          </label>
          <label>
            <span className="mb-1.5 block text-sm font-medium text-neutral-700">Tahun Ajar</span>
            <Input required value={form.tahunAjar} onChange={(event) => setForm((current) => ({ ...current, tahunAjar: event.target.value }))} />
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
