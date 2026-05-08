import { NextResponse, type NextRequest } from "next/server";
import { Role } from "@prisma/client";
import bcrypt from "bcryptjs";
import { jsonError, readJson, requireAdmin, requireUser } from "@/lib/api";
import { prisma } from "@/lib/prisma";

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

export async function GET() {
  const { user, response } = await requireUser();
  if (response) return response;
  const forbidden = requireAdmin(user.role);
  if (forbidden) return forbidden;

  try {
    const users = await prisma.user.findMany({
      select: selectUser,
      orderBy: [{ role: "asc" }, { name: "asc" }]
    });
    return NextResponse.json(users);
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
    const body = await readJson<UserPayload>(request);
    const name = body.name?.trim();
    const email = body.email?.toLowerCase().trim();
    const password = body.password ?? "";
    const role = body.role ?? Role.GURU;

    if (!name || !email || !password) {
      return NextResponse.json({ message: "Nama, email, dan password wajib diisi" }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ message: "Password minimal 6 karakter" }, { status: 400 });
    }
    if (role === Role.GURU && !body.kelasId) {
      return NextResponse.json({ message: "Guru wajib ditugaskan ke kelas" }, { status: 400 });
    }

    const created = await prisma.user.create({
      data: {
        name,
        email,
        password: await bcrypt.hash(password, 12),
        role,
        kelasId: role === Role.GURU ? body.kelasId : null
      },
      select: selectUser
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}
