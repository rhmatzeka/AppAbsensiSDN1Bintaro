import { NextResponse, type NextRequest } from "next/server";
import { Role } from "@prisma/client";
import { jsonError, readJson, requireUser } from "@/lib/api";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };
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

async function canAccessKegiatan(id: string, user: { id: string; role: Role }): Promise<{ ok: true } | { ok: false; response: NextResponse }> {
  const kegiatan = await prisma.kegiatanGuru.findUnique({ where: { id }, select: { userId: true } });
  if (!kegiatan) return { ok: false, response: NextResponse.json({ message: "Kegiatan tidak ditemukan" }, { status: 404 }) };
  if (user.role === Role.GURU && kegiatan.userId !== user.id) {
    return { ok: false, response: NextResponse.json({ message: "Tidak boleh mengubah kegiatan guru lain" }, { status: 403 }) };
  }
  return { ok: true };
}

export async function PUT(request: NextRequest, { params }: Params) {
  const { user, response } = await requireUser();
  if (response) return response;
  const { id } = await params;
  const access = await canAccessKegiatan(id, user);
  if (!access.ok) return access.response;

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

    const updated = await prisma.kegiatanGuru.update({
      where: { id },
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
      include: {
        user: { select: { id: true, name: true, email: true } },
        kelas: { select: { id: true, nama: true } }
      }
    });

    return NextResponse.json(updated);
  } catch (error) {
    return jsonError(error, "Gagal memperbarui kegiatan guru");
  }
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  const { user, response } = await requireUser();
  if (response) return response;
  const { id } = await params;
  const access = await canAccessKegiatan(id, user);
  if (!access.ok) return access.response;

  try {
    await prisma.kegiatanGuru.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return jsonError(error, "Gagal menghapus kegiatan guru");
  }
}
