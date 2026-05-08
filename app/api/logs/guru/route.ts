import { NextResponse, type NextRequest } from "next/server";
import { Prisma, Role } from "@prisma/client";
import { endOfDay, startOfDay } from "date-fns";
import { jsonError, requireAdmin, requireUser } from "@/lib/api";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const { user, response } = await requireUser();
  if (response) return response;
  const forbidden = requireAdmin(user.role);
  if (forbidden) return forbidden;

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, Number(searchParams.get("page") ?? "1"));
  const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit") ?? "20")));
  const guruId = searchParams.get("guruId")?.trim();
  const kelasId = searchParams.get("kelasId")?.trim();
  const tanggal = searchParams.get("tanggal")?.trim();

  const where: Prisma.AbsensiWhereInput = {
    user: { role: Role.GURU }
  };
  if (guruId) where.userId = guruId;
  if (kelasId) where.kelasId = kelasId;
  if (tanggal) {
    const value = new Date(tanggal);
    where.tanggal = { gte: startOfDay(value), lte: endOfDay(value) };
  }

  try {
    const [items, total] = await Promise.all([
      prisma.absensi.findMany({
        where,
        include: {
          user: { select: { id: true, name: true, email: true } },
          siswa: { select: { id: true, nis: true, nama: true } },
          kelas: { select: { id: true, nama: true } }
        },
        orderBy: [{ updatedAt: "desc" }, { tanggal: "desc" }],
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.absensi.count({ where })
    ]);

    return NextResponse.json({ items, total, page, pages: Math.ceil(total / limit) });
  } catch (error) {
    return jsonError(error);
  }
}
