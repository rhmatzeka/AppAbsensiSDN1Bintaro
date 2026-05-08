"use client";

import { useSession } from "next-auth/react";
import { RotateCcw } from "lucide-react";
import { useMemo, useState } from "react";
import { PageShell } from "@/components/layout/page-shell";
import { StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, Td, Th } from "@/components/ui/table";
import { useGuruLogs } from "@/hooks/useGuruLogs";
import { useKelas } from "@/hooks/useKelas";
import { useUsers } from "@/hooks/useUsers";
import { formatDate, toDateInputValue } from "@/lib/utils";

export default function LogGuruPage() {
  const { data: session } = useSession();
  const isAdmin = session?.user.role === "ADMIN";
  const today = toDateInputValue(new Date());
  const [page, setPage] = useState(1);
  const [guruId, setGuruId] = useState("");
  const [kelasId, setKelasId] = useState("");
  const [tanggal, setTanggal] = useState("");
  const { data: users } = useUsers();
  const { data: kelas } = useKelas();
  const { data, isLoading } = useGuruLogs({ page, limit: 20, guruId, kelasId, tanggal });
  const guruOptions = useMemo(() => (users ?? []).filter((user) => user.role === "GURU"), [users]);

  function resetFilters() {
    setGuruId("");
    setKelasId("");
    setTanggal("");
    setPage(1);
  }

  if (!isAdmin) {
    return (
      <PageShell title="Log Guru" description="Halaman ini hanya tersedia untuk admin.">
        <EmptyState title="Akses ditolak" description="Gunakan akun admin untuk melihat aktivitas guru." />
      </PageShell>
    );
  }

  return (
    <PageShell title="Log Guru" description="Pantau riwayat input dan perubahan absensi yang dilakukan oleh guru.">
      <div className="rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-subtle">
        <div className="grid gap-4 lg:grid-cols-[1fr_1fr_180px_auto]">
          <label>
            <span className="mb-2 block text-sm font-semibold text-neutral-700">Guru</span>
            <Select value={guruId} onChange={(event) => { setGuruId(event.target.value); setPage(1); }}>
              <option value="">Semua guru</option>
              {guruOptions.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
            </Select>
          </label>
          <label>
            <span className="mb-2 block text-sm font-semibold text-neutral-700">Kelas</span>
            <Select value={kelasId} onChange={(event) => { setKelasId(event.target.value); setPage(1); }}>
              <option value="">Semua kelas</option>
              {(kelas ?? []).map((item) => (
                <option key={item.id} value={item.id}>
                  {item.nama}
                </option>
              ))}
            </Select>
          </label>
          <label>
            <span className="mb-2 block text-sm font-semibold text-neutral-700">Tanggal Absensi</span>
            <Input type="date" value={tanggal} max={today} onChange={(event) => { setTanggal(event.target.value); setPage(1); }} />
          </label>
          <div className="flex items-end">
            <Button type="button" variant="secondary" className="w-full" onClick={resetFilters}>
              <RotateCcw className="h-4 w-4" />
              Reset
            </Button>
          </div>
        </div>
      </div>

      {isLoading ? (
        <Skeleton className="h-96" />
      ) : !data?.items.length ? (
        <EmptyState title="Log belum ada" description="Belum ada aktivitas absensi guru sesuai filter." />
      ) : (
        <Table>
          <thead>
            <tr>
              <Th>Waktu Update</Th>
              <Th>Guru</Th>
              <Th>Siswa</Th>
              <Th>Kelas</Th>
              <Th>Tanggal Absensi</Th>
              <Th>Status</Th>
              <Th>Keterangan</Th>
            </tr>
          </thead>
          <tbody>
            {data.items.map((item) => (
              <tr key={item.id} className="transition-colors hover:bg-orange-50/30">
                <Td className="text-xs text-neutral-500">{formatDate(item.updatedAt, "d MMM yyyy HH:mm")}</Td>
                <Td>
                  <p className="font-semibold text-neutral-800">{item.user.name}</p>
                  <p className="mt-0.5 font-mono text-xs text-neutral-400">{item.user.email}</p>
                </Td>
                <Td>
                  <p className="font-semibold text-neutral-800">{item.siswa.nama}</p>
                  <p className="mt-0.5 font-mono text-xs text-neutral-400">{item.siswa.nis}</p>
                </Td>
                <Td>{item.kelas.nama}</Td>
                <Td className="text-xs text-neutral-500">{formatDate(item.tanggal, "d MMM yyyy")}</Td>
                <Td>
                  <StatusBadge status={item.status} />
                </Td>
                <Td>{item.keterangan ?? "-"}</Td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      <div className="flex items-center justify-between">
        <p className="text-sm text-neutral-500">
          Total <span className="font-semibold text-neutral-700">{data?.total ?? 0}</span> log
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
    </PageShell>
  );
}
