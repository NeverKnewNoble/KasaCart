// NextAuth (Auth.js) catch-all route — handles sign-in, sign-out, callbacks,
// session, and the OAuth dance. Config lives in `src/lib/auth.ts`.
import { handlers } from "@/lib/auth";

export const runtime = "nodejs";

export const { GET, POST } = handlers;
