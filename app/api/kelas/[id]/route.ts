import { NextResponse, type NextRequest } from "next/server";
import { StatusSiswa } from "@prisma/client";
import { jsonError, readJson, requireUser } from "@/lib/api";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };
type KelasPayload = {
  nama?: string;
  tingkat?: string;
  jurusan?: string | null;
  tahunAjar?: string;
};

export async function GET(_request: NextRequest, { params }: Params) {
  const { response } = await requireUser();
  if (response) return response;
  const { id } = await params;

  try {
    const kelas = await prisma.kelas.findUnique({
      where: { id },
      include: {
        siswa: { where: { status: StatusSiswa.AKTIF }, orderBy: { nama: "asc" } },
        _count: { select: { siswa: { where: { status: StatusSiswa.AKTIF } } } }
      }
    });
    if (!kelas) return NextResponse.json({ message: "Kelas tidak ditemukan" }, { status: 404 });
    return NextResponse.json(kelas);
  } catch (error) {
    return jsonError(error);
  }
}

export async function PUT(request: NextRequest, { params }: Params) {
  const { response } = await requireUser();
  if (response) return response;
  const { id } = await params;

  try {
    const body = await readJson<KelasPayload>(request);
    const kelas = await prisma.kelas.update({
      where: { id },
      data: {
        nama: body.nama?.trim(),
        tingkat: body.tingkat?.trim(),
        jurusan: body.jurusan?.trim() || null,
        tahunAjar: body.tahunAjar?.trim()
      }
    });
    return NextResponse.json(kelas);
  } catch (error) {
    return jsonError(error);
  }
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  const { response } = await requireUser();
  if (response) return response;
  const { id } = await params;

  try {
    await prisma.kelas.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return jsonError(error, "Kelas masih memiliki data terkait");
  }
}
