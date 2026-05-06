import Image from "next/image";
import logoSdnBintaro from "@/components/asset/logosd-removebg-preview.png";
import { Skeleton } from "@/components/ui/skeleton";

export function LoadingPanel({ compact = false }: { compact?: boolean }) {
  return (
    <div className="grid min-h-[55vh] place-items-center">
      <div className="w-full max-w-3xl rounded-xl border border-neutral-200 bg-white p-5 shadow-subtle">
        <div className="flex items-center gap-4">
          <Image src={logoSdnBintaro} alt="Logo SDN 1 Bintaro" width={56} height={56} className="h-14 w-14 shrink-0 object-contain motion-safe:animate-pulse" priority />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-neutral-950">Memuat data</p>
            <p className="mt-1 text-sm text-neutral-500">Sebentar, sistem sedang menyiapkan tampilan.</p>
          </div>
        </div>
        {compact ? null : (
          <div className="mt-6 space-y-3">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <div className="grid gap-3 pt-2 sm:grid-cols-3">
              <Skeleton className="h-20" />
              <Skeleton className="h-20" />
              <Skeleton className="h-20" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
