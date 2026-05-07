"use client";

import { useParams } from "next/navigation";
import { PageShell } from "@/components/layout/page-shell";
import { StatusBadge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, Td, Th } from "@/components/ui/table";
import { useAbsensi } from "@/hooks/useAbsensi";
import { useKelas } from "@/hooks/useKelas";
import { formatDate } from "@/lib/utils";

export default function DetailAbsensiKelasPage() {
  const params = useParams<{ id: string }>();
  const { data: kelas } = useKelas();
  const { data, isLoading } = useAbsensi({ kelasId: params.id });
  const current = kelas?.find((item) => item.id === params.id);

  return (
    <PageShell title={`Detail Absensi ${current?.nama ?? ""}`} description="Riwayat absensi kelas terbaru.">
      {isLoading ? (
        <Skeleton className="h-72" />
      ) : (
        <Table>
          <thead>
            <tr>
              <Th>Tanggal</Th>
              <Th>NIS</Th>
              <Th>Nama</Th>
              <Th>Status</Th>
              <Th>Keterangan</Th>
            </tr>
          </thead>
          <tbody>
            {(data ?? []).map((item) => (
              <tr key={item.id} className="transition-colors hover:bg-orange-50/30">
                <Td className="text-neutral-500 text-xs">{formatDate(item.tanggal, "d MMM yyyy")}</Td>
                <Td className="font-mono text-xs text-neutral-500">{item.siswa.nis}</Td>
                <Td className="font-medium text-neutral-800">{item.siswa.nama}</Td>
                <Td>
                  <StatusBadge status={item.status} />
                </Td>
                <Td className="text-neutral-500">{item.keterangan ?? "-"}</Td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </PageShell>
  );
}
