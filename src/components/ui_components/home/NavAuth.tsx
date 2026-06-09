"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

/** Auth controls for the home navbar — swaps based on the NextAuth session. */
export default function NavAuth() {
  const { status } = useSession();

  if (status === "loading") {
    return <div className="h-9 w-24" aria-hidden />;
  }

  if (status === "authenticated") {
    return (
      <>
        <Link
          href="/dashboard"
          className="rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5 hover:shadow-[0_8px_18px_-7px_rgba(29,78,216,0.9)]"
        >
          Dashboard
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="rounded-full px-3.5 py-1.5 text-sm font-semibold text-ink/75 transition-colors hover:text-brand"
        >
          Sign out
        </button>
      </>
    );
  }

  return (
    <>
      <Link
        href="/auth/login"
        className="hidden rounded-full px-3.5 py-1.5 text-sm font-semibold text-ink/75 transition-colors hover:text-brand sm:block"
      >
        Sign in
      </Link>
      <Link
        href="/auth/signup"
        className="rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white shadow-[0_8px_18px_-7px_rgba(29,78,216,0.9)] transition-transform hover:-translate-y-0.5"
      >
        Get started
      </Link>
    </>
  );
}
