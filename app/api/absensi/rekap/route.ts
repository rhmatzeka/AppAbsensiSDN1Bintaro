import { NextResponse, type NextRequest } from "next/server";
import { Role, StatusAbsensi } from "@prisma/client";
import { endOfMonth, startOfMonth } from "date-fns";
import { jsonError, requireUser } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import type { RekapRow } from "@/types";

export async function GET(request: NextRequest) {
  const { user, response } = await requireUser();
  if (response) return response;

  const { searchParams } = new URL(request.url);
  const kelasId = searchParams.get("kelasId")?.trim();
  const month = Number(searchParams.get("bulan") ?? new Date().getMonth() + 1);
  const year = Number(searchParams.get("tahun") ?? new Date().getFullYear());
  const start = startOfMonth(new Date(year, month - 1, 1));
  const end = endOfMonth(start);

  try {
    const effectiveKelasId = user.role === Role.GURU ? user.kelasId ?? "__none__" : kelasId || undefined;
    const siswa = await prisma.siswa.findMany({
      where: effectiveKelasId ? { kelasId: effectiveKelasId } : {},
      include: {
        kelas: { select: { nama: true } },
        absensi: {
          where: { tanggal: { gte: start, lte: end } },
          select: { status: true }
        }
      },
      orderBy: { nama: "asc" }
    });

    const rows: RekapRow[] = siswa.map((item) => {
      const counts: Record<StatusAbsensi, number> = {
        HADIR: 0,
        SAKIT: 0,
        IZIN: 0,
        ALPHA: 0
      };
      item.absensi.forEach((absensi) => {
        counts[absensi.status] += 1;
      });
      const total = counts.HADIR + counts.SAKIT + counts.IZIN + counts.ALPHA;
      const persentase = total === 0 ? 0 : Math.round((counts.HADIR / total) * 100);
      return {
        siswaId: item.id,
        nis: item.nis,
        nama: item.nama,
        kelas: item.kelas.nama,
        ...counts,
        persentase
      };
    });

    return NextResponse.json(rows);
  } catch (error) {
    return jsonError(error);
  }
}
