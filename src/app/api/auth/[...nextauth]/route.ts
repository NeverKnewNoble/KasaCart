// NextAuth (Auth.js) catch-all route — handles sign-in, sign-out, callbacks,
// session, and the OAuth dance. Config lives in `src/auth.ts`.
import { handlers } from "@/auth";

export const runtime = "nodejs";

export const { GET, POST } = handlers;
