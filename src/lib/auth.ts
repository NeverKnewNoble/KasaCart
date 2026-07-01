/**
 * NextAuth (Auth.js v5) configuration — replaces Clerk.
 *
 * Strategy: JWT sessions (required by the Credentials provider), no DB adapter.
 *  - Credentials: email + password verified against `users.password_hash`.
 *  - Google OAuth: needs AUTH_GOOGLE_ID / AUTH_GOOGLE_SECRET.
 *
 * The `jwt` callback upserts the signed-in user into our own `users` table
 * (so Google sign-ins are persisted too) and stamps `id` + `role` onto the
 * token; `session` exposes them. New accounts default to role `USER`.
 *
 * Route protection lives in server code (the (portal) layout and
 * `requireStore()`), not in proxy/middleware — see the Next 16 proxy docs.
 */
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/password";
import type { UserRole } from "@/generated/prisma/enums";

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  session: { strategy: "jwt" },
  pages: { signIn: "/auth/login" },
  providers: [
    Google,
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        const email =
          typeof credentials?.email === "string"
            ? credentials.email.trim().toLowerCase()
            : "";
        const password =
          typeof credentials?.password === "string" ? credentials.password : "";
        if (!email || !password) return null;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user?.passwordHash) return null;

        const valid = await verifyPassword(password, user.passwordHash);
        if (!valid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.fullName ?? undefined,
          image: user.avatarUrl ?? undefined,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // Runs DB work only on sign-in (when `user` is present). Upsert by email
      // so Google accounts land in `users`; defaults new accounts to USER.
      if (user?.email) {
        const dbUser = await prisma.user.upsert({
          where: { email: user.email },
          update: {},
          create: {
            email: user.email,
            fullName: user.name ?? null,
            avatarUrl: user.image ?? null,
            role: "USER",
          },
        });
        token.id = dbUser.id;
        token.role = dbUser.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        if (token.id) session.user.id = token.id;
        if (token.role) session.user.role = token.role as UserRole;
      }
      return session;
    },
  },
});
