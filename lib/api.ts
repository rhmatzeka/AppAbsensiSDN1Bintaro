import { NextResponse } from "next/server";
import { Role } from "@prisma/client";
import { auth } from "@/lib/auth";

export async function requireUser() {
  const session = await auth();
  if (!session?.user) {
    return { user: null, response: NextResponse.json({ message: "Tidak terautentikasi" }, { status: 401 }) };
  }

  return { user: session.user, response: null };
}

export function requireAdmin(role: Role) {
  if (role !== Role.ADMIN) {
    return NextResponse.json({ message: "Akses hanya untuk admin" }, { status: 403 });
  }
  return null;
}

export function jsonError(error: unknown, fallback = "Terjadi kesalahan") {
  const message = error instanceof Error ? error.message : fallback;
  return NextResponse.json({ message }, { status: 500 });
}

export async function readJson<T>(request: Request) {
  return (await request.json()) as T;
}
