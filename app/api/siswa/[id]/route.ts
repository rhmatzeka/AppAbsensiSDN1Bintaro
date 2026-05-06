import { NextResponse, type NextRequest } from "next/server";
import { JenisKelamin, Role } from "@prisma/client";
import { jsonError, readJson, requireAdmin, requireUser } from "@/lib/api";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };
type SiswaPayload = {
  nis?: string;
  nama?: string;
  jenisKelamin?: JenisKelamin;
  tanggalLahir?: string | null;
  alamat?: string | null;
  foto?: string | null;
  kelasId?: string;
};

export async function GET(_request: NextRequest, { params }: Params) {
  const { user, response } = await requireUser();
  if (response) return response;
  const { id } = await params;

  try {
    const siswa = await prisma.siswa.findUnique({
      where: { id },
      include: {
        kelas: { select: { id: true, nama: true } },
        absensi: { orderBy: { tanggal: "desc" }, take: 120 }
      }
    });
    if (!siswa) return NextResponse.json({ message: "Siswa tidak ditemukan" }, { status: 404 });
    if (user.role === Role.GURU && siswa.kelasId !== user.kelasId) {
      return NextResponse.json({ message: "Akses siswa ditolak" }, { status: 403 });
    }
    return NextResponse.json(siswa);
  } catch (error) {
    return jsonError(error);
  }
}

export async function PUT(request: NextRequest, { params }: Params) {
  const { user, response } = await requireUser();
  if (response) return response;
  const forbidden = requireAdmin(user.role);
  if (forbidden) return forbidden;
  const { id } = await params;

  try {
    const body = await readJson<SiswaPayload>(request);
    const siswa = await prisma.siswa.update({
      where: { id },
      data: {
        nis: body.nis?.trim(),
        nama: body.nama?.trim(),
        jenisKelamin: body.jenisKelamin,
        tanggalLahir: body.tanggalLahir ? new Date(body.tanggalLahir) : undefined,
        alamat: body.alamat?.trim() || null,
        foto: body.foto?.trim() || null,
        kelasId: body.kelasId
      }
    });
    return NextResponse.json(siswa);
  } catch (error) {
    return jsonError(error);
  }
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  const { user, response } = await requireUser();
  if (response) return response;
  const forbidden = requireAdmin(user.role);
  if (forbidden) return forbidden;
  const { id } = await params;

  try {
    await prisma.siswa.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return jsonError(error);
  }
}
