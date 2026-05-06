import { NextResponse, type NextRequest } from "next/server";
import { Role } from "@prisma/client";
import { jsonError, readJson, requireAdmin, requireUser } from "@/lib/api";
import { prisma } from "@/lib/prisma";

type KelasPayload = {
  nama?: string;
  tingkat?: string;
  jurusan?: string | null;
  tahunAjar?: string;
};

export async function GET() {
  const { user, response } = await requireUser();
  if (response) return response;

  try {
    const where = user.role === Role.GURU && user.kelasId ? { id: user.kelasId } : {};
    const kelas = await prisma.kelas.findMany({
      where,
      include: { _count: { select: { siswa: true } } },
      orderBy: [{ tingkat: "asc" }, { nama: "asc" }]
    });

    return NextResponse.json(
      kelas.map((item) => ({
        id: item.id,
        nama: item.nama,
        tingkat: item.tingkat,
        jurusan: item.jurusan,
        tahunAjar: item.tahunAjar,
        jumlahSiswa: item._count.siswa
      }))
    );
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: NextRequest) {
  const { user, response } = await requireUser();
  if (response) return response;
  const forbidden = requireAdmin(user.role);
  if (forbidden) return forbidden;

  try {
    const body = await readJson<KelasPayload>(request);
    if (!body.nama || !body.tingkat || !body.tahunAjar) {
      return NextResponse.json({ message: "Nama, tingkat, dan tahun ajar wajib diisi" }, { status: 400 });
    }

    const kelas = await prisma.kelas.create({
      data: {
        nama: body.nama.trim(),
        tingkat: body.tingkat.trim(),
        jurusan: body.jurusan?.trim() || null,
        tahunAjar: body.tahunAjar.trim()
      }
    });

    return NextResponse.json(kelas, { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}
