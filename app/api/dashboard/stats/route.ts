import { NextResponse } from "next/server";
import { Role, StatusAbsensi, StatusSiswa } from "@prisma/client";
import { endOfDay, startOfDay, subDays } from "date-fns";
import { jsonError, requireUser } from "@/lib/api";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const { user, response } = await requireUser();
  if (response) return response;

  try {
    const today = new Date();
    const todayWhere = {
      tanggal: { gte: startOfDay(today), lte: endOfDay(today) },
      ...(user.role === Role.GURU ? { kelasId: user.kelasId ?? "__none__" } : {})
    };
    const siswaWhere = {
      status: StatusSiswa.AKTIF,
      ...(user.role === Role.GURU ? { kelasId: user.kelasId ?? "__none__" } : {})
    };

    const [totalSiswa, hadirHariIni, tidakHadir, recent, kelas] = await Promise.all([
      prisma.siswa.count({ where: siswaWhere }),
      prisma.absensi.count({ where: { ...todayWhere, status: StatusAbsensi.HADIR } }),
      prisma.absensi.count({ where: { ...todayWhere, status: { not: StatusAbsensi.HADIR } } }),
      prisma.absensi.findMany({
        where: {
          tanggal: { gte: startOfDay(subDays(today, 7)), lte: endOfDay(today) },
          ...(user.role === Role.GURU ? { kelasId: user.kelasId ?? "__none__" } : {})
        },
        include: {
          siswa: { select: { id: true, nis: true, nama: true } },
          kelas: { select: { id: true, nama: true } }
        },
        orderBy: { tanggal: "desc" },
        take: 12
      }),
      prisma.kelas.findMany({
        where: user.role === Role.GURU ? { id: user.kelasId ?? "__none__" } : {},
        include: {
          absensi: {
            where: { tanggal: { gte: startOfDay(subDays(today, 7)), lte: endOfDay(today) } },
            select: { status: true }
          }
        },
        orderBy: { nama: "asc" }
      })
    ]);

    const totalHariIni = hadirHariIni + tidakHadir;
    const chart = kelas.map((item) => ({
      kelas: item.nama,
      hadir: item.absensi.filter((absensi) => absensi.status === StatusAbsensi.HADIR).length,
      tidakHadir: item.absensi.filter((absensi) => absensi.status !== StatusAbsensi.HADIR).length
    }));

    return NextResponse.json({
      cards: {
        totalSiswa,
        hadirHariIni,
        tidakHadir,
        persentase: totalHariIni === 0 ? 0 : Math.round((hadirHariIni / totalHariIni) * 100)
      },
      recent,
      chart
    });
  } catch (error) {
    return jsonError(error);
  }
}
