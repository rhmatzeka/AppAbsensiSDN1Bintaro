import { NextRequest, NextResponse } from "next/server";
import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";

const { auth } = NextAuth(authConfig);

function getRequestOrigin(request: NextRequest) {
  const forwardedProto = request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim();
  const forwardedHost = request.headers.get("x-forwarded-host")?.split(",")[0]?.trim();
  const host = forwardedHost || request.headers.get("host") || request.nextUrl.host;
  const protocol = forwardedProto || request.nextUrl.protocol.replace(":", "") || "https";

  return `${protocol}://${host}`;
}

export default auth((request) => {
  const isLoginPage = request.nextUrl.pathname === "/login";
  const isLandingPage = request.nextUrl.pathname === "/";
  const requestOrigin = getRequestOrigin(request);

  if (!request.auth?.user && !isLoginPage && !isLandingPage) {
    const loginUrl = new URL("/login", requestOrigin);
    loginUrl.searchParams.set("callbackUrl", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (request.auth?.user && isLoginPage) {
    return NextResponse.redirect(new URL("/dashboard", requestOrigin));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\..*).*)"]
};
