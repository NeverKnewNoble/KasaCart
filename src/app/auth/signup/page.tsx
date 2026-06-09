"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { toast } from "sonner";
import GoogleButton from "@/components/ui_components/auth/GoogleButton";

export default function SignupPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, email, password }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        toast.error(body.error ?? "Could not create your account.");
        return;
      }
      // Account created — sign in straight away.
      const signInRes = await signIn("credentials", { email, password, redirect: false });
      if (signInRes?.error) {
        toast.error("Account created, but sign-in failed. Try logging in.");
        router.push("/auth/login");
        return;
      }
      router.push("/dashboard");
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background px-5 py-16">
      <Link href="/" className="flex items-center gap-2.5">
        <span className="font-display text-[1.35rem] font-extrabold tracking-tight text-ink">
          Kasa<span className="text-brand">Cart</span>
        </span>
      </Link>

      <p className="mt-6 text-center text-ink/60">
        Create your free storefront in minutes.
      </p>

      <div className="mt-8 w-full max-w-sm rounded-2xl border border-brand/10 bg-surface p-6 shadow-[0_24px_60px_-30px_rgba(10,28,77,0.4)]">
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-fg/70">Full name</label>
            <input
              className="input"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Ama Mensah"
              autoComplete="name"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-fg/70">Email</label>
            <input
              type="email"
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              required
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-fg/70">Password</label>
            <input
              type="password"
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              autoComplete="new-password"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white shadow-[0_10px_22px_-10px_rgba(29,78,216,0.9)] transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
          >
            {loading ? "Creating account…" : "Create account"}
          </button>
        </form>

        <div className="my-4 flex items-center gap-3 text-xs text-fg/40">
          <span className="h-px flex-1 bg-brand/10" />
          or
          <span className="h-px flex-1 bg-brand/10" />
        </div>

        <GoogleButton label="Sign up with Google" />
      </div>

      <p className="mt-6 text-sm text-ink/60">
        Already have an account?{" "}
        <Link href="/auth/login" className="font-semibold text-brand hover:underline">
          Sign in
        </Link>
      </p>
    </main>
  );
}
