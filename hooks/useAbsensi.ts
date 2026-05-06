import { useMemo } from "react";
import { useApi } from "@/hooks/useApi";
import type { AbsensiRow } from "@/types";

type AbsensiQuery = {
  kelasId?: string;
  siswaId?: string;
  tanggal?: string;
};

export function useAbsensi(query: AbsensiQuery = {}) {
  const url = useMemo(() => {
    const params = new URLSearchParams();
    if (query.kelasId) params.set("kelasId", query.kelasId);
    if (query.siswaId) params.set("siswaId", query.siswaId);
    if (query.tanggal) params.set("tanggal", query.tanggal);
    return `/api/absensi?${params.toString()}`;
  }, [query.kelasId, query.siswaId, query.tanggal]);

  return useApi<AbsensiRow[]>(url);
}
