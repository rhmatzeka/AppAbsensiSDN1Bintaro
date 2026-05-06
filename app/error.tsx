"use client";

import { Button } from "@/components/ui/button";

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="grid min-h-screen place-items-center bg-[#0A0A0A] p-4">
      <div className="w-full max-w-md rounded-xl bg-[#FAFAFA] p-6 shadow-subtle">
        <h1 className="text-lg font-semibold text-neutral-950">Terjadi kesalahan</h1>
        <p className="mt-2 text-sm text-neutral-500">{error.message}</p>
        <Button className="mt-5" onClick={reset}>
          Coba lagi
        </Button>
      </div>
    </div>
  );
}
