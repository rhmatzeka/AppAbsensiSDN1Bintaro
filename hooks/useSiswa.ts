import { useMemo } from "react";
import type { SWRConfiguration } from "swr";
import { useApi } from "@/hooks/useApi";
import type { PaginatedResponse, SiswaRow } from "@/types";

type SiswaQuery = {
  page?: number;
  limit?: number;
  search?: string;
  kelasId?: string;
};

export function useSiswa(query: SiswaQuery = {}, options?: SWRConfiguration<PaginatedResponse<SiswaRow>>) {
  const url = useMemo(() => {
    const params = new URLSearchParams();
    params.set("page", String(query.page ?? 1));
    params.set("limit", String(query.limit ?? 10));
    if (query.search) params.set("search", query.search);
    if (query.kelasId) params.set("kelasId", query.kelasId);
    return `/api/siswa?${params.toString()}`;
  }, [query.kelasId, query.limit, query.page, query.search]);

  return useApi<PaginatedResponse<SiswaRow>>(url, options);
}
