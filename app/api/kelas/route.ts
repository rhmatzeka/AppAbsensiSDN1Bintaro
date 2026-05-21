import { NextResponse, type NextRequest } from "next/server";
import { StatusSiswa } from "@prisma/client";
import { jsonError, readJson, requireUser } from "@/lib/api";
import { prisma } from "@/lib/prisma";

type KelasPayload = {
  nama?: string;
  tingkat?: string;
  jurusan?: string | null;
  tahunAjar?: string;
};

export async function GET() {
  const { response } = await requireUser();
  if (response) return response;

  try {
    const kelas = await prisma.kelas.findMany({
      include: { _count: { select: { siswa: { where: { status: StatusSiswa.AKTIF } } } } },
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
  const { response } = await requireUser();
  if (response) return response;

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
