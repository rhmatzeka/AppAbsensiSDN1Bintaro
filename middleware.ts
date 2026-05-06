import { NextResponse } from "next/server";
import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";

const { auth } = NextAuth(authConfig);

export default auth((request) => {
  const isLoginPage = request.nextUrl.pathname === "/login";

  if (!request.auth?.user && !isLoginPage) {
    const loginUrl = new URL("/login", request.nextUrl);
    loginUrl.searchParams.set("callbackUrl", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (request.auth?.user && isLoginPage) {
    return NextResponse.redirect(new URL("/", request.nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico).*)"]
};
