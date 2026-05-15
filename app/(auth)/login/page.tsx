"use client";

import { signIn } from "next-auth/react";
import { Eye, EyeOff } from "lucide-react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";
import schoolBackground from "@/components/asset/background.jpeg";
import logoSdnBintaro from "@/components/asset/logosd-removebg-preview.png";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
      callbackUrl: searchParams.get("callbackUrl") ?? "/dashboard"
    });
    setLoading(false);

    if (result?.error) {
      showToast("Email atau password tidak valid", "error");
      return;
    }

    router.push(result?.url ?? "/dashboard");
    router.refresh();
  }

  return (
    <main className="relative isolate grid min-h-[100dvh] overflow-hidden px-4 py-4 sm:place-items-center">
      <Image
        src={schoolBackground}
        alt="Gedung SDN Bintaro 01"
        fill
        priority
        sizes="100vw"
        className="absolute inset-0 -z-30 object-cover object-[center_top] saturate-110 sm:object-center"
      />
      <div className="absolute inset-0 -z-20 bg-[linear-gradient(135deg,rgba(8,13,23,0.34)_0%,rgba(8,13,23,0.18)_46%,rgba(8,13,23,0.58)_100%)]" />
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.10)_0%,rgba(15,23,42,0.12)_48%,rgba(15,23,42,0.48)_100%)]" />
      <div className="grid min-h-0 place-items-center overflow-y-auto">
        <div className="w-full max-w-[420px] animate-slide-up">
          {/* Login card */}
          <form onSubmit={onSubmit} className="rounded-2xl border border-white/55 bg-white/94 p-6 shadow-card backdrop-blur-xl sm:p-8">
            {/* Header */}
            <div className="mb-8 text-center">
              <Image src={logoSdnBintaro} alt="Logo SDN Bintaro 01" width={80} height={80} className="mx-auto h-20 w-20 object-contain" priority />
              <h1 className="mt-5 text-xl font-bold text-neutral-900">Masuk ke Absensi</h1>
              <p className="mt-1.5 text-sm text-neutral-500">SDN Bintaro 01 Sistem Kehadiran Siswa</p>
            </div>

            {/* Fields */}
            <div className="space-y-4">
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-neutral-700">Email</span>
                <Input type="email" required value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" placeholder="nama@sekolah.sch.id" />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-neutral-700">Password</span>
                <div className="relative">
                  <Input type={showPassword ? "text" : "password"} required value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" className="pr-11" placeholder="Masukkan password" />
                  <button type="button" className="absolute right-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-lg text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-600" onClick={() => setShowPassword((value) => !value)} aria-label="Toggle password">
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </label>
            </div>

            <Button type="submit" className="mt-7 w-full h-12 text-[15px]" loading={loading}>
              Masuk
            </Button>
          </form>

          {/* Footer */}
          <p className="mt-6 text-center text-xs font-medium text-white/80 [text-shadow:0_1px_10px_rgba(0,0,0,0.45)]">
            © 2026 SDN Bintaro 01. Aplikasi Absensi Siswa.
          </p>
        </div>
      </div>
    </main>
  );
}
