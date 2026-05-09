import { useApi } from "@/hooks/useApi";
import type { UserRow } from "@/types";

export function useUsers(enabled = true) {
  return useApi<UserRow[]>(enabled ? "/api/users" : null);
}
