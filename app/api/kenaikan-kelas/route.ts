import { NextResponse, type NextRequest } from "next/server";
import { StatusRiwayatKelas, StatusSiswa } from "@prisma/client";
import { jsonError, readJson, requireAdmin, requireUser } from "@/lib/api";
import { prisma } from "@/lib/prisma";

type PromotionItem = {
  siswaId: string;
  action: StatusRiwayatKelas;
  targetKelasId?: string | null;
  catatan?: string | null;
};

type PromotionPayload = {
  tahunAjarAsal?: string;
  tahunAjarBaru?: string;
  items?: PromotionItem[];
};

const validActions = new Set(Object.values(StatusRiwayatKelas));

function levelNumber(value: string) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function suggestedTarget(source: { nama: string; tingkat: string }, targets: { id: string; nama: string; tingkat: string }[]) {
  const currentLevel = levelNumber(source.tingkat);
  if (currentLevel === null || currentLevel >= 6) return null;

  const nextLevel = String(currentLevel + 1);
  const expectedName = source.nama.replace(source.tingkat, nextLevel);
  return targets.find((kelas) => kelas.nama.toLowerCase() === expectedName.toLowerCase()) ?? targets.find((kelas) => kelas.tingkat === nextLevel) ?? null;
}

export async function GET(request: NextRequest) {
  const { user, response } = await requireUser();
  if (response) return response;
  const forbidden = requireAdmin(user.role);
  if (forbidden) return forbidden;

  const { searchParams } = new URL(request.url);
  const tahunAjarAsal = searchParams.get("tahunAjarAsal")?.trim();
  const tahunAjarBaru = searchParams.get("tahunAjarBaru")?.trim();

  try {
    const kelas = await prisma.kelas.findMany({
      select: { id: true, nama: true, tingkat: true, tahunAjar: true },
      orderBy: [{ tahunAjar: "asc" }, { tingkat: "asc" }, { nama: "asc" }]
    });
    const tahunAjar = [...new Set(kelas.map((item) => item.tahunAjar))];

    if (!tahunAjarAsal || !tahunAjarBaru) {
      return NextResponse.json({ tahunAjar, kelas, siswa: [] });
    }

    const sourceClasses = kelas.filter((item) => item.tahunAjar === tahunAjarAsal);
    const targetClasses = kelas.filter((item) => item.tahunAjar === tahunAjarBaru);
    const sourceClassIds = sourceClasses.map((item) => item.id);
    const siswa = await prisma.siswa.findMany({
      where: { status: StatusSiswa.AKTIF, kelasId: { in: sourceClassIds.length ? sourceClassIds : ["__none__"] } },
      select: {
        id: true,
        nis: true,
        nama: true,
        kelasId: true,
        kelas: { select: { id: true, nama: true, tingkat: true, tahunAjar: true } }
      },
      orderBy: [{ kelas: { tingkat: "asc" } }, { kelas: { nama: "asc" } }, { nama: "asc" }]
    });

    return NextResponse.json({
      tahunAjar,
      kelas,
      sourceClasses,
      targetClasses,
      siswa: siswa.map((item) => {
        const target = suggestedTarget(item.kelas, targetClasses);
        const level = levelNumber(item.kelas.tingkat);
        return {
          ...item,
          suggestedAction: level !== null && level >= 6 ? StatusRiwayatKelas.LULUS : target ? StatusRiwayatKelas.NAIK : StatusRiwayatKelas.TINGGAL,
          suggestedKelasId: target?.id ?? null
        };
      })
    });
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
    const body = await readJson<PromotionPayload>(request);
    const tahunAjarAsal = body.tahunAjarAsal?.trim();
    const tahunAjarBaru = body.tahunAjarBaru?.trim();
    const items = body.items ?? [];

    if (!tahunAjarBaru || !items.length) {
      return NextResponse.json({ message: "Tahun ajaran baru dan data siswa wajib diisi" }, { status: 400 });
    }
    if (tahunAjarAsal && tahunAjarAsal === tahunAjarBaru) {
      return NextResponse.json({ message: "Tahun ajaran asal dan tujuan tidak boleh sama" }, { status: 400 });
    }
    const invalidAction = items.find((item) => !validActions.has(item.action));
    if (invalidAction) {
      return NextResponse.json({ message: "Status kenaikan kelas tidak valid" }, { status: 400 });
    }

    const siswaIds = items.map((item) => item.siswaId);
    const targetKelasIds = [...new Set(items.map((item) => item.targetKelasId?.trim()).filter(Boolean) as string[])];
    const targetKelas = targetKelasIds.length
      ? await prisma.kelas.findMany({ where: { id: { in: targetKelasIds } }, select: { id: true, tahunAjar: true } })
      : [];
    const validTargetIds = new Set(targetKelas.filter((kelas) => kelas.tahunAjar === tahunAjarBaru).map((kelas) => kelas.id));
    const invalidTarget = targetKelasIds.find((id) => !validTargetIds.has(id));
    if (invalidTarget) {
      return NextResponse.json({ message: "Kelas tujuan harus berasal dari tahun ajaran baru" }, { status: 400 });
    }

    const siswa = await prisma.siswa.findMany({
      where: { id: { in: siswaIds } },
      select: { id: true, kelasId: true }
    });
    const siswaById = new Map(siswa.map((item) => [item.id, item]));

    await prisma.$transaction(
      items.flatMap((item) => {
        const current = siswaById.get(item.siswaId);
        if (!current) return [];

        const action = item.action;
        const targetKelasId = item.targetKelasId?.trim() || null;
        const needsTarget = action === StatusRiwayatKelas.NAIK || action === StatusRiwayatKelas.TINGGAL || action === StatusRiwayatKelas.AKTIF;

        if (needsTarget && !targetKelasId) {
          throw new Error("Kelas tujuan wajib dipilih untuk siswa aktif");
        }

        const nextStatus =
          action === StatusRiwayatKelas.LULUS ? StatusSiswa.LULUS :
          action === StatusRiwayatKelas.PINDAH ? StatusSiswa.PINDAH :
          action === StatusRiwayatKelas.KELUAR ? StatusSiswa.KELUAR :
          StatusSiswa.AKTIF;

        return [
          prisma.siswa.update({
            where: { id: item.siswaId },
            data: {
              status: nextStatus,
              ...(needsTarget && targetKelasId ? { kelasId: targetKelasId } : {})
            }
          }),
          prisma.riwayatKelasSiswa.create({
            data: {
              siswaId: item.siswaId,
              kelasId: targetKelasId ?? current.kelasId,
              tahunAjar: tahunAjarBaru,
              status: action,
              catatan: item.catatan?.trim() || null
            }
          })
        ];
      })
    );

    return NextResponse.json({ ok: true, processed: items.length });
  } catch (error) {
    return jsonError(error, "Gagal memproses kenaikan kelas");
  }
}
