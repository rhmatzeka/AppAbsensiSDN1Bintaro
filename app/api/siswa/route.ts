import { NextResponse, type NextRequest } from "next/server";
import { JenisKelamin, Prisma, Role, StatusSiswa } from "@prisma/client";
import { jsonError, readJson, requireAdmin, requireUser } from "@/lib/api";
import { prisma } from "@/lib/prisma";

type SiswaPayload = {
  nis?: string;
  nama?: string;
  jenisKelamin?: JenisKelamin;
  tanggalLahir?: string | null;
  alamat?: string | null;
  foto?: string | null;
  status?: StatusSiswa;
  kelasId?: string;
  items?: SiswaPayload[];
};

export async function GET(request: NextRequest) {
  const { user, response } = await requireUser();
  if (response) return response;

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, Number(searchParams.get("page") ?? "1"));
  const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit") ?? "10")));
  const search = searchParams.get("search")?.trim();
  const kelasId = searchParams.get("kelasId")?.trim();

  const where: Prisma.SiswaWhereInput = { status: StatusSiswa.AKTIF };
  if (user.role === Role.GURU) where.kelasId = user.kelasId ?? "__none__";
  if (kelasId && user.role === Role.ADMIN) where.kelasId = kelasId;
  if (search) {
    where.OR = [
      { nama: { contains: search, mode: "insensitive" } },
      { nis: { contains: search, mode: "insensitive" } }
    ];
  }

  try {
    const [items, total] = await Promise.all([
      prisma.siswa.findMany({
        where,
        include: { kelas: { select: { id: true, nama: true } } },
        orderBy: { nama: "asc" },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.siswa.count({ where })
    ]);

    return NextResponse.json({ items, total, page, pages: Math.ceil(total / limit) });
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
    const body = await readJson<SiswaPayload>(request);
    const items = body.items ?? [body];

    for (const item of items) {
      if (!item.nis || !item.nama || !item.jenisKelamin || !item.kelasId) {
        return NextResponse.json({ message: "NIS, nama, jenis kelamin, dan kelas wajib diisi" }, { status: 400 });
      }
    }

    if (items.length > 1) {
      await prisma.siswa.createMany({
        data: items.map((item) => ({
          nis: item.nis?.trim() ?? "",
          nama: item.nama?.trim() ?? "",
          jenisKelamin: item.jenisKelamin ?? JenisKelamin.LAKI_LAKI,
          tanggalLahir: item.tanggalLahir ? new Date(item.tanggalLahir) : null,
          alamat: item.alamat?.trim() || null,
          foto: item.foto?.trim() || null,
          status: item.status ?? StatusSiswa.AKTIF,
          kelasId: item.kelasId ?? ""
        })),
        skipDuplicates: true
      });
      return NextResponse.json({ ok: true }, { status: 201 });
    }

    const item = items[0];
    const siswa = await prisma.siswa.create({
      data: {
        nis: item.nis?.trim() ?? "",
        nama: item.nama?.trim() ?? "",
        jenisKelamin: item.jenisKelamin ?? JenisKelamin.LAKI_LAKI,
        tanggalLahir: item.tanggalLahir ? new Date(item.tanggalLahir) : null,
        alamat: item.alamat?.trim() || null,
        foto: item.foto?.trim() || null,
        status: item.status ?? StatusSiswa.AKTIF,
        kelasId: item.kelasId ?? ""
      }
    });

    return NextResponse.json(siswa, { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}
