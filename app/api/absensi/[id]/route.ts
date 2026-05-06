import { NextResponse, type NextRequest } from "next/server";
import { Role } from "@prisma/client";
import { jsonError, requireUser } from "@/lib/api";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  const { user, response } = await requireUser();
  if (response) return response;
  const { id } = await params;

  try {
    const item = await prisma.absensi.findUnique({
      where: { id },
      include: {
        siswa: { select: { id: true, nis: true, nama: true } },
        kelas: { select: { id: true, nama: true } },
        user: { select: { id: true, name: true } }
      }
    });
    if (!item) return NextResponse.json({ message: "Absensi tidak ditemukan" }, { status: 404 });
    if (user.role === Role.GURU && item.kelasId !== user.kelasId) {
      return NextResponse.json({ message: "Akses absensi ditolak" }, { status: 403 });
    }
    return NextResponse.json(item);
  } catch (error) {
    return jsonError(error);
  }
}
