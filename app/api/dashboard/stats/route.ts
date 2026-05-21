import { NextResponse } from "next/server";
import { StatusAbsensi, StatusSiswa } from "@prisma/client";
import { endOfDay, startOfDay, subDays } from "date-fns";
import { jsonError, requireUser } from "@/lib/api";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const { response } = await requireUser();
  if (response) return response;

  try {
    const today = new Date();
    const todayWhere = {
      tanggal: { gte: startOfDay(today), lte: endOfDay(today) }
    };
    const siswaWhere = {
      status: StatusSiswa.AKTIF
    };

    const [totalSiswa, hadirHariIni, tidakHadir, recentRaw, kelas] = await Promise.all([
      prisma.siswa.count({ where: siswaWhere }),
      prisma.absensi.count({ where: { ...todayWhere, status: StatusAbsensi.HADIR } }),
      prisma.absensi.count({ where: { ...todayWhere, status: { not: StatusAbsensi.HADIR } } }),
      prisma.absensi.findMany({
        where: {
          tanggal: { gte: startOfDay(subDays(today, 7)), lte: endOfDay(today) }
        },
        include: {
          siswa: { select: { id: true, nis: true, nama: true } },
          kelas: { select: { id: true, nama: true } }
        },
        orderBy: [{ tanggal: "desc" }, { updatedAt: "desc" }, { siswa: { nama: "asc" } }],
        take: 500
      }),
      prisma.kelas.findMany({
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
    type RecentItem = (typeof recentRaw)[number];
    const recentBuckets = new Map<string, RecentItem[]>();
    recentRaw.forEach((item) => {
      const bucket = recentBuckets.get(item.kelas.id) ?? [];
      if (bucket.length < 2) {
        bucket.push(item);
        recentBuckets.set(item.kelas.id, bucket);
      }
    });
    const bucketsByClass = kelas
      .map((item) => recentBuckets.get(item.id) ?? [])
      .filter((items) => items.length > 0);
    const recent = [0, 1]
      .flatMap((index) => bucketsByClass.flatMap((items) => (items[index] ? [items[index]] : [])))
      .slice(0, 12);

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
