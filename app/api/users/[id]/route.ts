import { NextResponse, type NextRequest } from "next/server";
import { Role } from "@prisma/client";
import bcrypt from "bcryptjs";
import { jsonError, readJson, requireAdmin, requireUser } from "@/lib/api";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };
type UserPayload = {
  name?: string;
  email?: string;
  password?: string;
  role?: Role;
  kelasId?: string | null;
};

const selectUser = {
  id: true,
  name: true,
  email: true,
  role: true,
  kelasId: true,
  createdAt: true,
  kelas: { select: { id: true, nama: true } }
} as const;

export async function PUT(request: NextRequest, { params }: Params) {
  const { user, response } = await requireUser();
  if (response) return response;
  const forbidden = requireAdmin(user.role);
  if (forbidden) return forbidden;
  const { id } = await params;

  try {
    const body = await readJson<UserPayload>(request);
    const name = body.name?.trim();
    const email = body.email?.toLowerCase().trim();
    const role = body.role;
    const password = body.password?.trim();

    if (!name || !email || !role) {
      return NextResponse.json({ message: "Nama, email, dan role wajib diisi" }, { status: 400 });
    }
    if (password && password.length < 6) {
      return NextResponse.json({ message: "Password minimal 6 karakter" }, { status: 400 });
    }
    if (role === Role.GURU && !body.kelasId) {
      return NextResponse.json({ message: "Guru wajib ditugaskan ke kelas" }, { status: 400 });
    }

    const updated = await prisma.user.update({
      where: { id },
      data: {
        name,
        email,
        role,
        kelasId: role === Role.GURU ? body.kelasId : null,
        ...(password ? { password: await bcrypt.hash(password, 12) } : {})
      },
      select: selectUser
    });

    return NextResponse.json(updated);
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

  if (id === user.id) {
    return NextResponse.json({ message: "Tidak bisa menghapus akun yang sedang digunakan" }, { status: 400 });
  }

  try {
    await prisma.user.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return jsonError(error, "User masih memiliki data terkait");
  }
}
