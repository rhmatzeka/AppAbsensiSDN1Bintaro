import { NextResponse, type NextRequest } from "next/server";
import { Role, StatusAbsensi, StatusSiswa } from "@prisma/client";
import { endOfDay, endOfMonth, startOfDay, startOfMonth } from "date-fns";
import { jsonError, requireUser } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import type { RekapRow } from "@/types";

function dateFromInput(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export async function GET(request: NextRequest) {
  const { user, response } = await requireUser();
  if (response) return response;

  const { searchParams } = new URL(request.url);
  const kelasId = searchParams.get("kelasId")?.trim();
  const periode = searchParams.get("periode")?.trim() ?? "bulanan";
  const month = Number(searchParams.get("bulan") ?? new Date().getMonth() + 1);
  const year = Number(searchParams.get("tahun") ?? new Date().getFullYear());
  const tanggalAwal = searchParams.get("tanggalAwal")?.trim();
  const tanggalAkhir = searchParams.get("tanggalAkhir")?.trim();
  const start = periode === "mingguan" && tanggalAwal ? startOfDay(dateFromInput(tanggalAwal)) : startOfMonth(new Date(year, month - 1, 1));
  const end = periode === "mingguan" && tanggalAkhir ? endOfDay(dateFromInput(tanggalAkhir)) : endOfMonth(start);

  if (periode === "mingguan" && (!tanggalAwal || !tanggalAkhir)) {
    return NextResponse.json({ message: "Tanggal awal dan akhir wajib diisi untuk rekap mingguan" }, { status: 400 });
  }
  if (start > end) {
    return NextResponse.json({ message: "Tanggal awal tidak boleh lebih besar dari tanggal akhir" }, { status: 400 });
  }

  try {
    const effectiveKelasId = user.role === Role.GURU ? user.kelasId ?? "__none__" : kelasId || undefined;
    const siswa = await prisma.siswa.findMany({
      where: { status: StatusSiswa.AKTIF, ...(effectiveKelasId ? { kelasId: effectiveKelasId } : {}) },
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
