import { useMemo } from "react";
import { useApi } from "@/hooks/useApi";
import type { KegiatanGuruRow, PaginatedResponse } from "@/types";

type KegiatanQuery = {
  enabled?: boolean;
  page?: number;
  limit?: number;
  guruId?: string;
  kelasId?: string;
  tanggal?: string;
  tanggalAwal?: string;
  tanggalAkhir?: string;
};

export function useKegiatan(query: KegiatanQuery = {}) {
  const url = useMemo(() => {
    if (query.enabled === false) return null;
    const params = new URLSearchParams();
    if (query.page) params.set("page", String(query.page));
    if (query.limit) params.set("limit", String(query.limit));
    if (query.guruId) params.set("guruId", query.guruId);
    if (query.kelasId) params.set("kelasId", query.kelasId);
    if (query.tanggal) params.set("tanggal", query.tanggal);
    if (query.tanggalAwal) params.set("tanggalAwal", query.tanggalAwal);
    if (query.tanggalAkhir) params.set("tanggalAkhir", query.tanggalAkhir);
    return `/api/kegiatan?${params.toString()}`;
  }, [query.enabled, query.guruId, query.kelasId, query.limit, query.page, query.tanggal, query.tanggalAkhir, query.tanggalAwal]);

  return useApi<PaginatedResponse<KegiatanGuruRow>>(url);
}
