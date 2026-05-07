"use client";

import { signIn } from "next-auth/react";
import { Eye, EyeOff } from "lucide-react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";
import logoSdnBintaro from "@/components/asset/logosd-removebg-preview.png";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast } = useToast();
  const [email, setEmail] = useState("admin@sekolah.sch.id");
  const [password, setPassword] = useState("admin123");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
      callbackUrl: searchParams.get("callbackUrl") ?? "/"
    });
    setLoading(false);

    if (result?.error) {
      showToast("Email atau password tidak valid", "error");
      return;
    }

    router.push(result?.url ?? "/");
    router.refresh();
  }

  return (
    <main className="login-bg grid min-h-[100dvh] overflow-hidden px-4 py-4 sm:place-items-center">
      <div className="grid min-h-0 place-items-center overflow-y-auto">
        <div className="w-full max-w-[420px] animate-slide-up">
          {/* Login card */}
          <form onSubmit={onSubmit} className="rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-card sm:p-8">
            {/* Header */}
            <div className="mb-8 text-center">
              <div className="mx-auto grid h-20 w-20 place-items-center rounded-2xl bg-orange-50 shadow-sm">
                <Image src={logoSdnBintaro} alt="Logo SDN 1 Bintaro" width={56} height={56} className="h-14 w-14 object-contain" priority />
              </div>
              <h1 className="mt-5 text-xl font-bold text-neutral-900">Masuk ke Absensi</h1>
              <p className="mt-1.5 text-sm text-neutral-500">SDN 1 Bintaro — Sistem Kehadiran Siswa</p>
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
          <p className="mt-6 text-center text-xs text-neutral-400">
            © 2024 SDN 1 Bintaro. Aplikasi Absensi Siswa.
          </p>
        </div>
      </div>
    </main>
  );
}
