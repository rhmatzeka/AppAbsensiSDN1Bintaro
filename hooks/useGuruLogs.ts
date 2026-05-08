import { useMemo } from "react";
import { useApi } from "@/hooks/useApi";
import type { GuruLogRow, PaginatedResponse } from "@/types";

type GuruLogQuery = {
  page?: number;
  limit?: number;
  guruId?: string;
  kelasId?: string;
  tanggal?: string;
};

export function useGuruLogs(query: GuruLogQuery = {}) {
  const url = useMemo(() => {
    const params = new URLSearchParams();
    if (query.page) params.set("page", String(query.page));
    if (query.limit) params.set("limit", String(query.limit));
    if (query.guruId) params.set("guruId", query.guruId);
    if (query.kelasId) params.set("kelasId", query.kelasId);
    if (query.tanggal) params.set("tanggal", query.tanggal);
    return `/api/logs/guru?${params.toString()}`;
  }, [query.guruId, query.kelasId, query.limit, query.page, query.tanggal]);

  return useApi<PaginatedResponse<GuruLogRow>>(url);
}
