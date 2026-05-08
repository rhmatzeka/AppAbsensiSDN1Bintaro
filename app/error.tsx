"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

const chunkReloadKey = "app-absensi-chunk-reload";

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  const isChunkError = /loading chunk|chunkloaderror|failed to fetch dynamically imported module/i.test(error.message);

  useEffect(() => {
    if (!isChunkError) {
      sessionStorage.removeItem(chunkReloadKey);
      return;
    }

    if (sessionStorage.getItem(chunkReloadKey) === "1") return;

    sessionStorage.setItem(chunkReloadKey, "1");
    window.location.reload();
  }, [isChunkError]);

  const message = isChunkError
    ? "Aplikasi baru saja diperbarui. Muat ulang halaman untuk mengambil versi terbaru."
    : error.message;

  return (
    <div className="grid min-h-screen place-items-center bg-[#0A0A0A] p-4">
      <div className="w-full max-w-md rounded-xl bg-[#FAFAFA] p-6 shadow-subtle">
        <h1 className="text-lg font-semibold text-neutral-950">Terjadi kesalahan</h1>
        <p className="mt-2 text-sm text-neutral-500">{message}</p>
        <Button className="mt-5" onClick={() => (isChunkError ? window.location.reload() : reset())}>
          {isChunkError ? "Muat ulang" : "Coba lagi"}
        </Button>
      </div>
    </div>
  );
}
