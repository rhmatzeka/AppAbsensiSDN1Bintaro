import type { Role } from "@prisma/client";
import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/login"
  },
  secret: process.env.NEXTAUTH_SECRET ?? process.env.AUTH_SECRET ?? (process.env.VERCEL ? undefined : "development-secret-change-me"),
  session: {
    strategy: "jwt"
  },
  providers: [],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.kelasId = user.kelasId;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? "";
        session.user.role = token.role as Role;
        session.user.kelasId = token.kelasId as string | null | undefined;
      }
      return session;
    }
  }
} satisfies NextAuthConfig;
