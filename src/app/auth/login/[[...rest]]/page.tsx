import { SignIn } from "@clerk/nextjs";
import Link from "next/link";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background px-5 py-16">
      <Link href="/" className="flex items-center gap-2.5">
        <span className="font-display text-[1.35rem] font-extrabold tracking-tight text-ink">
          Kasa<span className="text-brand">Cart</span>
        </span>
      </Link>

      <p className="mt-6 text-center text-ink/60">
        Welcome back. Sign in to manage your store.
      </p>

      <div className="mt-8">
        <SignIn
          fallbackRedirectUrl="/dashboard"
          appearance={{
            variables: { colorPrimary: "#1d4ed8", borderRadius: "0.7rem" },
            elements: {
              card: "shadow-[0_24px_60px_-30px_rgba(10,28,77,0.4)] border border-brand/10",
            },
          }}
        />
      </div>
    </main>
  );
}
