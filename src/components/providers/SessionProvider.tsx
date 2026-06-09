"use client";

/**
 * Client wrapper around NextAuth's SessionProvider so the server root layout
 * can provide session context to client components (`useSession`).
 */
import { SessionProvider } from "next-auth/react";

export default function AuthSessionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SessionProvider>{children}</SessionProvider>;
}
