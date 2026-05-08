import { useApi } from "@/hooks/useApi";
import type { UserRow } from "@/types";

export function useUsers() {
  return useApi<UserRow[]>("/api/users");
}
