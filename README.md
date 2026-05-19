# App Absensi SDN Bintaro 01

Aplikasi absensi siswa berbasis web untuk mengelola data kelas, siswa, input absensi harian, rekap bulanan, dan laporan kehadiran.

## Tech Stack

- Next.js 15 App Router
- React 19
- TypeScript
- PostgreSQL
- Prisma ORM
- NextAuth.js v5 credentials provider
- Tailwind CSS v4
- Bun

## Fitur

- Login admin dan guru
- Dashboard statistik kehadiran
- Input absensi per kelas dan tanggal
- Bulk action set semua siswa hadir
- Manajemen siswa dengan pencarian, filter kelas, pagination, modal tambah/edit, hapus, dan import CSV
- Detail siswa dengan statistik, kalender bulanan, dan riwayat absensi
- Manajemen kelas
- Laporan mingguan dan bulanan per siswa
- Export laporan ke CSV
- Print-friendly report
- Catatan tema/materi pembelajaran dari input absensi tampil menyatu di laporan
- Role access: admin mengelola semua data, guru dibatasi pada kelas yang ditugaskan

## Setup Lokal

Install dependency:

```bash
bun install
```

Salin file environment:

```bash
cp .env.example .env
```

Contoh `.env` untuk PostgreSQL lokal:

```env
DATABASE_URL="postgresql://absensi:absensi123@localhost:5432/absensi_db"
NEXTAUTH_SECRET="local-development-secret-change-before-production"
AUTH_SECRET="local-development-secret-change-before-production"
NEXTAUTH_URL="http://localhost:3000"
```

Jalankan PostgreSQL dengan Docker:

```bash
docker run --name absensi-postgres \
  -e POSTGRES_USER=absensi \
  -e POSTGRES_PASSWORD=absensi123 \
  -e POSTGRES_DB=absensi_db \
  -p 5432:5432 \
  -d postgres:16-alpine
```

Jalankan migration dan seed:

```bash
bun prisma migrate dev --name init
bun prisma db seed
```

Jalankan aplikasi:

```bash
bun run dev
```

Buka:

```txt
http://localhost:3000
```

## Akun Demo

Admin:

```txt
admin@sekolah.sch.id
admin123
```

Guru:

```txt
guru@sekolah.sch.id
guru123
```

## Script

```bash
bun run dev
bun run build
bun run lint
bun prisma generate
bun prisma migrate dev
bun prisma db seed
```

## Deployment

Aplikasi siap deploy ke Vercel.

Tambahkan environment variable berikut di Vercel:

```env
DATABASE_URL="postgresql://..."
NEXTAUTH_SECRET="..."
AUTH_SECRET="..."
NEXTAUTH_URL="https://domain-vercel.vercel.app"
```

Gunakan PostgreSQL dari Neon, Supabase, Vercel Postgres, atau provider PostgreSQL lain. Jalankan migration ke database production sebelum digunakan.

## Cloudflare

Untuk menambahkan proteksi Cloudflare pada domain `absensisdnbintaro01.com`, domain harus dikelola dari dashboard Cloudflare terlebih dahulu.

Langkah ringkas:

1. Tambahkan `absensisdnbintaro01.com` di Cloudflare.
2. Salin nameserver yang diberikan Cloudflare.
3. Di Domainesia, ganti nameserver dari `ns1.vercel-dns.com` dan `ns2.vercel-dns.com` ke nameserver Cloudflare.
4. Di DNS Cloudflare, arahkan domain ke Vercel:

```txt
Type   Name   Value
A      @      76.76.21.21
CNAME  www    cname.vercel-dns-0.com
```

Jika Vercel menampilkan target CNAME khusus di dashboard, gunakan nilai dari Vercel tersebut.

5. Aktifkan proxy Cloudflare pada record web traffic (`A` dan `CNAME`) agar statusnya `Proxied`.
6. Di Vercel, pastikan domain `absensisdnbintaro01.com` dan `www.absensisdnbintaro01.com` tetap terdaftar di project.
7. Di Vercel Environment Variables, gunakan domain production:

```env
NEXTAUTH_URL="https://absensisdnbintaro01.com"
AUTH_URL="https://absensisdnbintaro01.com"
AUTH_TRUST_HOST="true"
```

Catatan: setelah mengganti nameserver, propagasi DNS bisa memakan waktu hingga 24 jam.
