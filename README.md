# SDN Bintaro 01 Attendance App

A web app that helps teachers at SDN Bintaro 01 (an elementary school) take daily attendance, keep student records, and print attendance reports.

**Live site:** https://absensisdnbintaro01.com

## Features

- **Two roles**: admins manage everything, teachers only see the classes assigned to them
- **Dashboard** with attendance statistics
- **Daily attendance** per class and date, with a one-click "mark everyone present"
- **Lesson notes**: the topic taught that day is saved with the attendance and shows up in reports
- **Student management**: search, filter by class, pages, add/edit/delete, and CSV import
- **Student profile** with statistics, a monthly calendar, and full attendance history
- **Class management**
- **Weekly and monthly reports** per student, exportable to CSV and printable

## Tech stack

Next.js 15 (App Router), React 19, TypeScript, PostgreSQL, Prisma, NextAuth.js v5, Tailwind CSS v4, Bun

## Getting started

You need [Bun](https://bun.sh) and PostgreSQL (or Docker).

1. Install dependencies:

   ```bash
   bun install
   ```

2. Start a local PostgreSQL database with Docker (skip this if you already have one):

   ```bash
   docker run --name absensi-postgres \
     -e POSTGRES_USER=absensi \
     -e POSTGRES_PASSWORD=absensi123 \
     -e POSTGRES_DB=absensi_db \
     -p 5432:5432 \
     -d postgres:16-alpine
   ```

3. Copy the environment file and fill it in:

   ```bash
   cp .env.example .env
   ```

   ```env
   DATABASE_URL="postgresql://absensi:absensi123@localhost:5432/absensi_db"
   NEXTAUTH_SECRET="any-long-random-string"
   AUTH_SECRET="any-long-random-string"
   NEXTAUTH_URL="http://localhost:3000"
   ```

4. Create the tables and add demo data:

   ```bash
   bun prisma migrate dev --name init
   bun prisma db seed
   ```

5. Start the app and open http://localhost:3000:

   ```bash
   bun run dev
   ```

### Demo accounts (local only)

The seed script creates these accounts. Change or remove them before using a real database.

| Role | Email | Password |
| --- | --- | --- |
| Admin | `admin@sekolah.sch.id` | `admin123` |
| Teacher | `guru@sekolah.sch.id` | `guru123` |

## Useful commands

```bash
bun run dev                # start the dev server
bun run build              # production build
bun run lint               # check code style
bun prisma migrate dev     # apply database changes
bun prisma db seed         # add demo data
```

## Deploying to Vercel

1. Create a PostgreSQL database (Neon, Supabase, Vercel Postgres, etc.) and run the migrations against it.
2. Add these environment variables in Vercel:

   ```env
   DATABASE_URL="postgresql://..."
   NEXTAUTH_SECRET="..."
   AUTH_SECRET="..."
   NEXTAUTH_URL="https://your-domain.com"
   AUTH_URL="https://your-domain.com"
   AUTH_TRUST_HOST="true"
   ```

3. Use your real custom domain in `NEXTAUTH_URL` and `AUTH_URL`, not the `*.vercel.app` one, then redeploy.

You can also import `vercel-domain.env` from this repo into Vercel to set the Auth.js domain values.

### Optional: Cloudflare in front of Vercel

1. Add the domain to Cloudflare and switch the domain's nameservers (at your registrar) to the ones Cloudflare gives you.
2. In Cloudflare DNS, point the domain to Vercel and turn the proxy on (orange cloud):

   ```txt
   Type   Name   Value
   A      @      76.76.21.21
   CNAME  www    cname.vercel-dns-0.com
   ```

   If Vercel shows a different CNAME target for your project, use that one.
3. Keep both `example.com` and `www.example.com` added to the project in Vercel.

DNS changes can take up to 24 hours to spread.
