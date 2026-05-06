import { useApi } from "@/hooks/useApi";
import type { KelasSummary } from "@/types";

export function useKelas() {
  return useApi<KelasSummary[]>("/api/kelas");
}
