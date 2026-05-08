import Image from "next/image";
import logoSdnBintaro from "@/components/asset/logosd-removebg-preview.png";

export function LoadingPanel({ compact = false }: { compact?: boolean }) {
  return (
    <div className="grid min-h-[60vh] place-items-center px-4">
      <div className="flex animate-fade-in flex-col items-center text-center">
        <div className="relative grid h-24 w-24 place-items-center">
          <div className="absolute inset-0 rounded-full border-4 border-orange-100" />
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-orange-500 motion-safe:animate-spin" />
          <Image src={logoSdnBintaro} alt="Logo SDN Bintaro 01" width={56} height={56} className="h-14 w-14 object-contain" priority />
        </div>
        <p className="mt-5 text-sm font-bold text-neutral-900">Memuat data</p>
        <p className="mt-1 max-w-xs text-sm leading-relaxed text-neutral-500">
          {compact ? "Mengambil data terbaru." : "Sebentar, sistem sedang menyiapkan tampilan."}
        </p>
        {compact ? null : (
          <div className="mt-5 flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-orange-500 motion-safe:animate-bounce" />
            <span className="h-2 w-2 rounded-full bg-orange-400 motion-safe:animate-bounce [animation-delay:120ms]" />
            <span className="h-2 w-2 rounded-full bg-orange-300 motion-safe:animate-bounce [animation-delay:240ms]" />
          </div>
        )}
      </div>
    </div>
  );
}
