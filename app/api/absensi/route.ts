import { NextResponse, type NextRequest } from "next/server";
import { Prisma, Role, StatusAbsensi } from "@prisma/client";
import { endOfDay, startOfDay } from "date-fns";
import { jsonError, readJson, requireUser } from "@/lib/api";
import { prisma } from "@/lib/prisma";

type AbsensiPayload = {
  tanggal?: string;
  items?: {
    siswaId: string;
    kelasId: string;
    status: StatusAbsensi;
    keterangan?: string | null;
  }[];
};

export async function GET(request: NextRequest) {
  const { user, response } = await requireUser();
  if (response) return response;

  const { searchParams } = new URL(request.url);
  const kelasId = searchParams.get("kelasId")?.trim();
  const siswaId = searchParams.get("siswaId")?.trim();
  const tanggal = searchParams.get("tanggal")?.trim();

  const where: Prisma.AbsensiWhereInput = {};
  if (kelasId) where.kelasId = kelasId;
  if (!kelasId && user.role === Role.GURU) where.kelasId = user.kelasId ?? "__none__";
  if (siswaId) where.siswaId = siswaId;
  if (tanggal) {
    const value = new Date(tanggal);
    where.tanggal = { gte: startOfDay(value), lte: endOfDay(value) };
  }

  try {
    const items = await prisma.absensi.findMany({
      where,
      include: {
        siswa: { select: { id: true, nis: true, nama: true } },
        kelas: { select: { id: true, nama: true } }
      },
      orderBy: [{ tanggal: "desc" }, { siswa: { nama: "asc" } }],
      take: siswaId ? 180 : 500
    });
    return NextResponse.json(items);
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: NextRequest) {
  const { user, response } = await requireUser();
  if (response) return response;

  try {
    const body = await readJson<AbsensiPayload>(request);
    if (!body.tanggal || !body.items?.length) {
      return NextResponse.json({ message: "Tanggal dan data absensi wajib diisi" }, { status: 400 });
    }

    const tanggal = new Date(body.tanggal);

    await prisma.$transaction(
      body.items.map((item) =>
        prisma.absensi.upsert({
          where: { siswaId_tanggal: { siswaId: item.siswaId, tanggal } },
          create: {
            tanggal,
            siswaId: item.siswaId,
            kelasId: item.kelasId,
            status: item.status,
            keterangan: item.keterangan?.trim() || null,
            userId: user.id
          },
          update: {
            status: item.status,
            keterangan: item.keterangan?.trim() || null,
            kelasId: item.kelasId,
            userId: user.id
          }
        })
      )
    );

    return NextResponse.json({ ok: true });
  } catch (error) {
    return jsonError(error);
  }
}
