"use client";

import { useSession } from "next-auth/react";
import { ArrowRight, GraduationCap, Save, Search, UsersRound } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { PageShell } from "@/components/layout/page-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, Td, Th } from "@/components/ui/table";
import { useToast } from "@/components/ui/toast";
import { useApi } from "@/hooks/useApi";
import { cn } from "@/lib/utils";
import type { ClassHistoryStatus } from "@/types";

type KelasOption = {
  id: string;
  nama: string;
  tingkat: string;
  tahunAjar: string;
};

type PromotionAction = Exclude<ClassHistoryStatus, "AKTIF">;

type PromotionStudent = {
  id: string;
  nis: string;
  nama: string;
  kelasId: string;
  kelas: KelasOption;
  suggestedAction: PromotionAction;
  suggestedKelasId: string | null;
};

type PromotionPreview = {
  tahunAjar: string[];
  kelas: KelasOption[];
  sourceClasses?: KelasOption[];
  targetClasses?: KelasOption[];
  siswa: PromotionStudent[];
};

type RowState = {
  action: PromotionAction;
  targetKelasId: string;
  catatan: string;
};

const actions: PromotionAction[] = ["NAIK", "TINGGAL", "LULUS", "PINDAH", "KELUAR"];

const actionLabels: Record<PromotionAction, string> = {
  NAIK: "Naik",
  TINGGAL: "Tinggal",
  LULUS: "Lulus",
  PINDAH: "Pindah",
  KELUAR: "Keluar"
};

const actionStyles: Record<PromotionAction, string> = {
  NAIK: "bg-emerald-50 text-emerald-700 border border-emerald-200/70",
  TINGGAL: "bg-amber-50 text-amber-700 border border-amber-200/70",
  LULUS: "bg-sky-50 text-sky-700 border border-sky-200/70",
  PINDAH: "bg-violet-50 text-violet-700 border border-violet-200/70",
  KELUAR: "bg-rose-50 text-rose-700 border border-rose-200/70"
};

function needsTarget(action: PromotionAction) {
  return action === "NAIK" || action === "TINGGAL";
}

function buildUrl(tahunAjarAsal: string, tahunAjarBaru: string) {
  if (!tahunAjarAsal || !tahunAjarBaru) return "/api/kenaikan-kelas";
  const params = new URLSearchParams({ tahunAjarAsal, tahunAjarBaru });
  return `/api/kenaikan-kelas?${params.toString()}`;
}

export default function KenaikanKelasPage() {
  const { data: session } = useSession();
  const { showToast } = useToast();
  const [tahunAjarAsal, setTahunAjarAsal] = useState("");
  const [tahunAjarBaru, setTahunAjarBaru] = useState("");
  const [search, setSearch] = useState("");
  const [rows, setRows] = useState<Record<string, RowState>>({});
  const [saving, setSaving] = useState(false);
  const isAdmin = session?.user.role === "ADMIN";
  const url = isAdmin ? buildUrl(tahunAjarAsal, tahunAjarBaru) : null;
  const { data, isLoading, mutate } = useApi<PromotionPreview>(url);
  const tahunAjar = useMemo(() => data?.tahunAjar ?? [], [data?.tahunAjar]);
  const targetClasses = useMemo(() => data?.targetClasses ?? [], [data?.targetClasses]);
  const students = useMemo(() => data?.siswa ?? [], [data?.siswa]);
  const filteredStudents = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return students;

    return students.filter((siswa) => {
      const row = rows[siswa.id];
      const actionLabel = row?.action ? actionLabels[row.action].toLowerCase() : "";
      return [siswa.nis, siswa.nama, siswa.kelas.nama, actionLabel].some((value) => value.toLowerCase().includes(keyword));
    });
  }, [rows, search, students]);

  useEffect(() => {
    if (!tahunAjar.length) return;
    if (!tahunAjarAsal) setTahunAjarAsal(tahunAjar.at(-2) ?? tahunAjar.at(-1) ?? "");
    if (!tahunAjarBaru) setTahunAjarBaru(tahunAjar.at(-1) ?? "");
  }, [tahunAjar, tahunAjarAsal, tahunAjarBaru]);

  useEffect(() => {
    setRows((current) => {
      const next: Record<string, RowState> = {};
      for (const siswa of students) {
        const action = actions.includes(siswa.suggestedAction) ? siswa.suggestedAction : "NAIK";
        next[siswa.id] = current[siswa.id] ?? {
          action,
          targetKelasId: siswa.suggestedKelasId ?? "",
          catatan: ""
        };
      }
      return next;
    });
  }, [students]);

  const summary = useMemo(() => {
    return actions.reduce<Record<PromotionAction, number>>((accumulator, action) => {
      accumulator[action] = students.filter((siswa) => rows[siswa.id]?.action === action).length;
      return accumulator;
    }, { NAIK: 0, TINGGAL: 0, LULUS: 0, PINDAH: 0, KELUAR: 0 });
  }, [rows, students]);

  function updateRow(siswaId: string, patch: Partial<RowState>) {
    setRows((current) => ({
      ...current,
      [siswaId]: { ...current[siswaId], ...patch }
    }));
  }

  async function submit() {
    if (!tahunAjarAsal || !tahunAjarBaru) {
      showToast("Pilih tahun ajaran asal dan tujuan", "error");
      return;
    }
    if (tahunAjarAsal === tahunAjarBaru) {
      showToast("Tahun ajaran asal dan tujuan tidak boleh sama", "error");
      return;
    }
    const incomplete = students.find((siswa) => {
      const row = rows[siswa.id];
      return row && needsTarget(row.action) && !row.targetKelasId;
    });
    if (incomplete) {
      showToast(`Kelas tujuan untuk ${incomplete.nama} belum dipilih`, "error");
      return;
    }

    setSaving(true);
    const response = await fetch("/api/kenaikan-kelas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tahunAjarAsal,
        tahunAjarBaru,
        items: students.map((siswa) => ({
          siswaId: siswa.id,
          action: rows[siswa.id]?.action ?? "NAIK",
          targetKelasId: rows[siswa.id]?.targetKelasId || null,
          catatan: rows[siswa.id]?.catatan || null
        }))
      })
    });
    setSaving(false);

    if (!response.ok) {
      const error = (await response.json().catch(() => ({ message: "Gagal memproses kenaikan kelas" }))) as { message?: string };
      showToast(error.message ?? "Gagal memproses kenaikan kelas", "error");
      return;
    }

    showToast("Kenaikan kelas berhasil diproses");
    await mutate();
  }

  if (!isAdmin) {
    return (
      <PageShell title="Kenaikan Kelas" description="Halaman ini hanya tersedia untuk admin.">
        <EmptyState title="Akses ditolak" description="Gunakan akun admin untuk memproses tahun ajaran baru." />
      </PageShell>
    );
  }

  return (
    <PageShell
      title="Kenaikan Kelas"
      description="Pindahkan siswa ke tahun ajaran baru, tandai siswa tinggal kelas, lulus, pindah, atau keluar."
      action={
        <Button type="button" onClick={submit} loading={saving} disabled={!students.length}>
          <Save className="h-4 w-4" />
          Proses
        </Button>
      }
    >
      <div className="rounded-2xl border border-neutral-200/80 bg-white p-4 shadow-subtle sm:p-5">
        <div className="grid gap-4 md:grid-cols-[1fr_auto_1fr] md:items-end">
          <label>
            <span className="mb-2 block text-sm font-semibold text-neutral-700">Tahun Ajaran Asal</span>
            <Select value={tahunAjarAsal} onChange={(event) => setTahunAjarAsal(event.target.value)}>
              <option value="">Pilih tahun asal</option>
              {tahunAjar.map((tahun) => (
                <option key={tahun} value={tahun}>{tahun}</option>
              ))}
            </Select>
          </label>
          <div className="hidden h-11 w-11 place-items-center rounded-xl bg-orange-50 text-orange-600 md:grid">
            <ArrowRight className="h-5 w-5" />
          </div>
          <label>
            <span className="mb-2 block text-sm font-semibold text-neutral-700">Tahun Ajaran Tujuan</span>
            <Select value={tahunAjarBaru} onChange={(event) => setTahunAjarBaru(event.target.value)}>
              <option value="">Pilih tahun tujuan</option>
              {tahunAjar.map((tahun) => (
                <option key={tahun} value={tahun}>{tahun}</option>
              ))}
            </Select>
          </label>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
        <div className="rounded-2xl border border-neutral-200/80 bg-white p-4 shadow-subtle">
          <UsersRound className="mb-3 h-5 w-5 text-orange-500" />
          <p className="text-xs font-bold uppercase text-neutral-400">Siswa</p>
          <p className="mt-1 text-2xl font-bold text-neutral-950">{students.length}</p>
        </div>
        {actions.map((action) => (
          <div key={action} className="rounded-2xl border border-neutral-200/80 bg-white p-4 shadow-subtle">
            <Badge className={cn("mb-3", actionStyles[action])}>{actionLabels[action]}</Badge>
            <p className="text-xs font-bold uppercase text-neutral-400">Total</p>
            <p className="mt-1 text-2xl font-bold text-neutral-950">{summary[action]}</p>
          </div>
        ))}
      </div>

      {tahunAjarAsal && tahunAjarBaru && tahunAjarAsal === tahunAjarBaru ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
          Tahun ajaran asal dan tujuan harus berbeda.
        </div>
      ) : null}

      {students.length ? (
        <div className="grid gap-3 lg:grid-cols-[1fr_auto] lg:items-center">
          <label className="relative block">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
            <Input
              className="pl-10"
              placeholder="Cari NIS, nama, kelas, atau keputusan"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </label>
          <p className="text-sm font-medium text-neutral-500">
            {filteredStudents.length} dari {students.length} siswa
          </p>
        </div>
      ) : null}

      {isLoading ? (
        <Skeleton className="h-96" />
      ) : !tahunAjar.length ? (
        <EmptyState title="Tahun ajaran belum ada" description="Buat data kelas terlebih dahulu sebelum memproses kenaikan kelas." />
      ) : !targetClasses.length && tahunAjarBaru ? (
        <EmptyState title="Kelas tujuan belum ada" description="Buat kelas untuk tahun ajaran tujuan di menu Kelas." />
      ) : !students.length ? (
        <EmptyState title="Tidak ada siswa aktif" description="Pilih tahun ajaran asal yang masih memiliki siswa aktif." />
      ) : !filteredStudents.length ? (
        <EmptyState title="Siswa tidak ditemukan" description="Ubah kata kunci pencarian untuk melihat data siswa." />
      ) : (
        <Table className="min-w-[980px]">
          <thead>
            <tr>
              <Th>NIS</Th>
              <Th>Nama</Th>
              <Th>Kelas Asal</Th>
              <Th>Keputusan</Th>
              <Th>Kelas Tujuan</Th>
              <Th>Catatan</Th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.map((siswa) => {
              const row = rows[siswa.id] ?? { action: "NAIK", targetKelasId: "", catatan: "" };
              const terminal = !needsTarget(row.action);
              return (
                <tr key={siswa.id} className="transition-colors hover:bg-orange-50/30">
                  <Td className="font-mono text-xs text-neutral-500">{siswa.nis}</Td>
                  <Td className="font-semibold text-neutral-800">{siswa.nama}</Td>
                  <Td>
                    <div className="inline-flex items-center gap-2 rounded-full bg-neutral-50 px-3 py-1.5 text-xs font-semibold text-neutral-600">
                      <GraduationCap className="h-3.5 w-3.5 text-neutral-400" />
                      {siswa.kelas.nama}
                    </div>
                  </Td>
                  <Td className="w-44">
                    <Select
                      value={row.action}
                      onChange={(event) => {
                        const action = event.target.value as PromotionAction;
                        updateRow(siswa.id, { action, targetKelasId: needsTarget(action) ? row.targetKelasId : "" });
                      }}
                    >
                      {actions.map((action) => (
                        <option key={action} value={action}>{actionLabels[action]}</option>
                      ))}
                    </Select>
                  </Td>
                  <Td className="w-56">
                    <Select
                      value={row.targetKelasId}
                      disabled={terminal}
                      onChange={(event) => updateRow(siswa.id, { targetKelasId: event.target.value })}
                    >
                      <option value="">{terminal ? "-" : "Pilih kelas"}</option>
                      {targetClasses.map((kelas) => (
                        <option key={kelas.id} value={kelas.id}>{kelas.nama}</option>
                      ))}
                    </Select>
                  </Td>
                  <Td className="min-w-64">
                    <Input
                      value={row.catatan}
                      onChange={(event) => updateRow(siswa.id, { catatan: event.target.value })}
                      placeholder="Opsional"
                    />
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
