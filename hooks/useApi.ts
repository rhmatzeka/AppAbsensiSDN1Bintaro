import useSWR, { type SWRConfiguration } from "swr";

export async function fetcher<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) {
    const data = (await response.json().catch(() => ({ message: "Request gagal" }))) as { message?: string };
    throw new Error(data.message ?? "Request gagal");
  }
  return (await response.json()) as T;
}

export function useApi<T>(url: string | null, options?: SWRConfiguration<T>) {
  return useSWR<T>(url, fetcher<T>, {
    keepPreviousData: true,
    revalidateOnFocus: false,
    ...options
  });
}
