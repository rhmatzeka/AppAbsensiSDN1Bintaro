import { NextResponse, type NextRequest } from "next/server";
import { Prisma, Role } from "@prisma/client";
import { endOfDay, startOfDay } from "date-fns";
import { jsonError, readJson, requireUser } from "@/lib/api";
import { prisma } from "@/lib/prisma";

type KegiatanPayload = {
  tanggal?: string;
  jamMulai?: string | null;
  jamSelesai?: string | null;
  guruId?: string | null;
  kelasId?: string;
  materi?: string;
  kegiatan?: string;
  catatan?: string | null;
};

function dateFromInput(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function cleanTime(value?: string | null) {
  const trimmed = value?.trim();
  return trimmed || null;
}

const includeKegiatan = {
  user: { select: { id: true, name: true, email: true } },
  kelas: { select: { id: true, nama: true } }
} as const;

export async function GET(request: NextRequest) {
  const { user, response } = await requireUser();
  if (response) return response;

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, Number(searchParams.get("page") ?? "1"));
  const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit") ?? "20")));
  const guruId = searchParams.get("guruId")?.trim();
  const kelasId = searchParams.get("kelasId")?.trim();
  const tanggal = searchParams.get("tanggal")?.trim();
  const tanggalAwal = searchParams.get("tanggalAwal")?.trim();
  const tanggalAkhir = searchParams.get("tanggalAkhir")?.trim();

  const where: Prisma.KegiatanGuruWhereInput = {};
  if (user.role === Role.GURU) where.userId = user.id;
  if (user.role === Role.ADMIN && guruId) where.userId = guruId;
  if (kelasId) where.kelasId = kelasId;
  if (tanggal) {
    const value = dateFromInput(tanggal);
    where.tanggal = { gte: startOfDay(value), lte: endOfDay(value) };
  } else if (tanggalAwal || tanggalAkhir) {
    where.tanggal = {
      ...(tanggalAwal ? { gte: startOfDay(dateFromInput(tanggalAwal)) } : {}),
      ...(tanggalAkhir ? { lte: endOfDay(dateFromInput(tanggalAkhir)) } : {})
    };
  }

  try {
    const [items, total] = await Promise.all([
      prisma.kegiatanGuru.findMany({
        where,
        include: includeKegiatan,
        orderBy: [{ tanggal: "desc" }, { createdAt: "desc" }],
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.kegiatanGuru.count({ where })
    ]);

    return NextResponse.json({ items, total, page, pages: Math.ceil(total / limit) });
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: NextRequest) {
  const { user, response } = await requireUser();
  if (response) return response;

  try {
    const body = await readJson<KegiatanPayload>(request);
    const tanggal = body.tanggal?.trim();
    const kelasId = body.kelasId?.trim();
    const materi = body.materi?.trim();
    const kegiatan = body.kegiatan?.trim();

    if (!tanggal || !kelasId || !materi || !kegiatan) {
      return NextResponse.json({ message: "Tanggal, kelas, materi, dan kegiatan wajib diisi" }, { status: 400 });
    }
    if (user.role === Role.GURU && kelasId !== user.kelasId) {
      return NextResponse.json({ message: "Guru hanya bisa mencatat kegiatan untuk kelas yang ditugaskan" }, { status: 403 });
    }
    const targetUserId = user.role === Role.ADMIN ? body.guruId?.trim() || user.id : user.id;
    if (!targetUserId) {
      return NextResponse.json({ message: "Guru wajib dipilih" }, { status: 400 });
    }
    if (user.role === Role.ADMIN && targetUserId !== user.id) {
      const targetUser = await prisma.user.findUnique({ where: { id: targetUserId }, select: { role: true } });
      if (!targetUser || targetUser.role !== Role.GURU) {
        return NextResponse.json({ message: "Pilih akun guru yang valid" }, { status: 400 });
      }
    }

    const created = await prisma.kegiatanGuru.create({
      data: {
        tanggal: dateFromInput(tanggal),
        jamMulai: cleanTime(body.jamMulai),
        jamSelesai: cleanTime(body.jamSelesai),
        materi,
        kegiatan,
        catatan: body.catatan?.trim() || null,
        kelasId,
        userId: targetUserId
      },
      include: includeKegiatan
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    return jsonError(error, "Gagal menyimpan kegiatan guru");
  }
}
