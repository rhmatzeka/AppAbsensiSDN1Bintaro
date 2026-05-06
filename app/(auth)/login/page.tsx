"use client";

import { signIn } from "next-auth/react";
import { Eye, EyeOff } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";
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
    <main className="grid min-h-screen place-items-center bg-[#0A0A0A] p-4">
      <form onSubmit={onSubmit} className="w-full max-w-md rounded-xl bg-[#FAFAFA] p-6 shadow-subtle">
        <div className="mb-7 text-center">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-xl bg-[#0A0A0A] text-lg font-semibold text-white">AS</div>
          <h1 className="mt-5 text-2xl font-semibold text-neutral-950">Masuk ke Absensi</h1>
          <p className="mt-1 text-sm text-neutral-500">Gunakan akun sekolah untuk melanjutkan.</p>
        </div>

        <div className="space-y-4">
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-neutral-700">Email</span>
            <Input type="email" required value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-neutral-700">Password</span>
            <div className="relative">
              <Input type={showPassword ? "text" : "password"} required value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" className="pr-11" />
              <button type="button" className="absolute right-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-lg text-neutral-500 hover:bg-neutral-100" onClick={() => setShowPassword((value) => !value)} aria-label="Toggle password">
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </label>
        </div>

        <Button type="submit" className="mt-6 w-full" loading={loading}>
          Masuk
        </Button>
      </form>
    </main>
  );
}
