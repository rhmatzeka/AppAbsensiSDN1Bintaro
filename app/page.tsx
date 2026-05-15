import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BarChart3, CalendarCheck, CheckCircle2, ClipboardCheck, FileSpreadsheet, GraduationCap, LogIn, Users } from "lucide-react";
import schoolBackground from "@/components/asset/background.jpeg";
import logoSdnBintaro from "@/components/asset/logosd-removebg-preview.png";

const features = [
  {
    title: "Absensi harian",
    description: "Guru dapat mengisi kehadiran siswa per kelas dan tanggal dengan status hadir, sakit, izin, atau alpha.",
    icon: CalendarCheck
  },
  {
    title: "Data siswa rapi",
    description: "Admin mengelola siswa, kelas, dan import CSV dalam satu sistem yang mudah dicari.",
    icon: Users
  },
  {
    title: "Laporan bulanan",
    description: "Rekap kehadiran siap dicetak atau diekspor untuk kebutuhan administrasi sekolah.",
    icon: BarChart3
  }
];

const stats = [
  { value: "6", label: "Tingkat kelas" },
  { value: "72+", label: "Data siswa demo" },
  { value: "4", label: "Status absensi" }
];

const workflow = [
  {
    title: "Siapkan data",
    description: "Admin mengatur kelas, siswa, dan akses guru agar data awal sekolah tersusun rapi.",
    icon: Users
  },
  {
    title: "Input absensi",
    description: "Guru memilih kelas dan tanggal, lalu menyimpan status kehadiran semua siswa.",
    icon: ClipboardCheck
  },
  {
    title: "Unduh laporan",
    description: "Rekap bulanan bisa dibaca di dashboard, dicetak, atau diekspor menjadi CSV.",
    icon: FileSpreadsheet
  }
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#F8F9FC] text-neutral-900">
      <header className="sticky top-0 z-30 border-b border-neutral-200/70 bg-white/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <Link href="/" className="flex min-w-0 items-center gap-3">
            <Image src={logoSdnBintaro} alt="Logo SDN Bintaro 01" width={44} height={44} className="h-11 w-11 shrink-0 object-contain" priority />
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-neutral-950">SDN Bintaro 01</p>
              <p className="truncate text-xs font-medium text-neutral-500">Sistem Kehadiran Siswa</p>
            </div>
          </Link>

          <nav className="hidden items-center gap-6 text-sm font-semibold text-neutral-500 md:flex">
            <a href="#profil" className="hover:text-neutral-900">Profil</a>
            <a href="#fitur" className="hover:text-neutral-900">Fitur</a>
            <a href="#alur" className="hover:text-neutral-900">Alur</a>
          </nav>

          <Link
            href="/login"
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-gradient-to-b from-orange-400 to-orange-500 px-4 text-sm font-bold text-white shadow-sm hover:from-orange-500 hover:to-orange-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2"
          >
            Login
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </header>

      <section id="profil" className="relative isolate min-h-[calc(100vh-73px)] overflow-hidden border-b border-neutral-200/70">
        <Image
          src={schoolBackground}
          alt="Gedung SDN Bintaro 01"
          fill
          priority
          sizes="100vw"
          className="absolute inset-0 -z-20 object-cover object-center"
        />
        <div className="absolute inset-0 -z-10 bg-neutral-950/60" />
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(15,23,42,0.82)_0%,rgba(15,23,42,0.68)_42%,rgba(15,23,42,0.38)_100%)]" />
        <div className="mx-auto grid min-h-[calc(100vh-73px)] max-w-7xl items-center gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(420px,0.85fr)] lg:px-8 lg:py-14">
          <div className="max-w-[680px]">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-orange-200 bg-white px-3 py-1.5 text-xs font-bold uppercase tracking-widest text-orange-700 shadow-sm">
              <GraduationCap className="h-4 w-4" />
              Profil Sekolah
            </div>
            <h1 className="text-4xl font-black leading-[1.05] tracking-normal text-white sm:text-5xl lg:text-[64px]">
              Absensi Digital SDN Bintaro 01
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-white/85 sm:text-lg">
              Sistem kehadiran siswa untuk membantu admin dan guru mengelola absensi harian, data kelas, rekap bulanan, dan laporan sekolah dalam satu dashboard.
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {[
                ["Admin", "Kelola data sekolah"],
                ["Guru", "Input absensi kelas"],
                ["Laporan", "Cetak dan export CSV"]
              ].map(([title, text]) => (
                <div key={title} className="rounded-xl border border-white/30 bg-white/90 p-3 shadow-sm backdrop-blur">
                  <p className="text-sm font-black text-neutral-950">{title}</p>
                  <p className="mt-1 text-xs font-semibold leading-5 text-neutral-500">{text}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/login"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-gradient-to-b from-orange-400 to-orange-500 px-6 text-sm font-bold text-white shadow-sm hover:from-orange-500 hover:to-orange-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2"
              >
                Masuk ke Aplikasi
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="#fitur"
                className="inline-flex min-h-12 items-center justify-center rounded-xl border border-white/50 bg-white/90 px-6 text-sm font-bold text-neutral-800 shadow-sm backdrop-blur hover:bg-white"
              >
                Lihat Fitur
              </a>
            </div>
          </div>

          <div className="rounded-2xl border border-white/30 bg-white/90 p-4 shadow-card backdrop-blur-md">
            <div className="rounded-xl bg-white/75 p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Image src={logoSdnBintaro} alt="Logo SDN Bintaro 01" width={48} height={48} className="h-12 w-12 shrink-0 object-contain" />
                  <div>
                    <p className="text-sm font-bold text-neutral-950">Dashboard Absensi</p>
                    <p className="text-xs text-neutral-500">Ringkasan hari ini</p>
                  </div>
                </div>
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">Aktif</span>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                {stats.map((item) => (
                  <div key={item.label} className="rounded-xl border border-neutral-200 bg-white p-3">
                    <p className="text-2xl font-black text-neutral-950">{item.value}</p>
                    <p className="mt-1 text-xs font-semibold text-neutral-500">{item.label}</p>
                  </div>
                ))}
              </div>

              <div className="mt-4 space-y-3">
                {["Input absensi per kelas", "Pantau siswa tidak hadir", "Cetak rekap bulanan"].map((item) => (
                  <div key={item} className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-white px-3 py-2.5">
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
                    <span className="text-sm font-semibold text-neutral-700">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="fitur" className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-widest text-orange-600">Fitur utama</p>
            <h2 className="mt-3 text-3xl font-black text-neutral-950">Dibuat untuk kebutuhan operasional sekolah.</h2>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <article key={feature.title} className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
                  <div className="grid h-11 w-11 place-items-center rounded-xl bg-orange-50 text-orange-600">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-5 text-lg font-black text-neutral-950">{feature.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-neutral-600">{feature.description}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section id="alur" className="bg-[#F8F9FC]">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr] lg:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-orange-600">Alur penggunaan</p>
              <h2 className="mt-3 text-3xl font-black leading-tight text-neutral-950 sm:text-4xl">
                Dari data siswa sampai laporan bulanan.
              </h2>
            </div>
            <p className="max-w-2xl text-base leading-7 text-neutral-600 lg:justify-self-end">
              Proses dibuat singkat supaya guru bisa fokus mengajar, sementara admin tetap mendapatkan data kehadiran yang siap direkap.
            </p>
          </div>

          <div className="mt-9 grid gap-4 lg:grid-cols-3">
            {workflow.map((item, index) => {
              const Icon = item.icon;
              return (
                <article key={item.title} className="relative overflow-hidden rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
                  <div className="flex items-center justify-between gap-4">
                    <div className="grid h-12 w-12 place-items-center rounded-xl bg-orange-50 text-orange-600">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="text-5xl font-black leading-none text-orange-100">{index + 1}</span>
                  </div>
                  <h3 className="mt-5 text-lg font-black text-neutral-950">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-neutral-600">{item.description}</p>
                </article>
              );
            })}
          </div>

          <div className="mt-5 rounded-2xl border border-orange-100 bg-orange-50/70 p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-black text-orange-900">Siap digunakan untuk operasional sekolah</p>
                <p className="mt-1 text-sm leading-6 text-orange-800/80">Masuk sebagai admin atau guru untuk mulai mengelola absensi.</p>
              </div>
              <Link href="/login" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-orange-500 px-5 text-sm font-bold text-white shadow-sm hover:bg-orange-600">
                Buka Dashboard
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-neutral-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1.1fr_0.75fr_0.75fr_0.9fr] lg:px-8">
          <div>
            <div className="flex items-center gap-3">
              <Image src={logoSdnBintaro} alt="Logo SDN Bintaro 01" width={48} height={48} className="h-12 w-12 shrink-0 object-contain" />
              <div>
                <p className="text-base font-black text-neutral-950">SDN Bintaro 01</p>
                <p className="text-sm font-medium text-neutral-500">Sistem Kehadiran Siswa</p>
              </div>
            </div>
            <p className="mt-4 max-w-sm text-sm leading-6 text-neutral-600">
              Platform absensi digital untuk membantu sekolah mengelola kehadiran, data siswa, dan laporan dengan lebih tertata.
            </p>
          </div>

          <div>
            <p className="text-sm font-black text-neutral-950">Navigasi</p>
            <div className="mt-4 grid gap-3 text-sm font-semibold text-neutral-500">
              <a href="#profil" className="hover:text-orange-600">Profil</a>
              <a href="#fitur" className="hover:text-orange-600">Fitur</a>
              <a href="#alur" className="hover:text-orange-600">Alur</a>
            </div>
          </div>

          <div>
            <p className="text-sm font-black text-neutral-950">Aplikasi</p>
            <div className="mt-4 grid gap-3 text-sm font-semibold text-neutral-500">
              <span>Dashboard</span>
              <span>Manajemen Siswa</span>
              <span>Laporan Absensi</span>
            </div>
          </div>

          <div className="rounded-2xl border border-neutral-200 bg-[#F8F9FC] p-4">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-white text-orange-600 shadow-sm">
              <LogIn className="h-5 w-5" />
            </div>
            <p className="mt-4 text-sm font-black text-neutral-950">Masuk ke sistem</p>
            <p className="mt-1 text-sm leading-6 text-neutral-600">Akses dashboard admin dan guru melalui halaman login.</p>
            <Link href="/login" className="mt-4 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-xl bg-neutral-950 px-4 text-sm font-bold text-white hover:bg-neutral-800">
              Login
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        <div className="border-t border-neutral-100">
          <div className="mx-auto flex max-w-7xl px-4 py-4 text-xs font-medium text-neutral-500 sm:px-6 lg:px-8">
            <p>(c) 2026 SDN Bintaro 01. Aplikasi Absensi Siswa.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
