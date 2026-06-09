/**
 * /api/register — create an email + password account.
 *
 * New accounts are always role `USER`. After a 201 the client signs the user
 * in via NextAuth credentials. Google sign-ups skip this and are created in
 * the NextAuth `jwt` callback instead.
 */
import { handle, readJson, created, ApiError } from "@/lib/api/http";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";

export const runtime = "nodejs";

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export const POST = handle(async (req) => {
  const body = await readJson(req);
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body.password === "string" ? body.password : "";
  const fullName = typeof body.fullName === "string" ? body.fullName.trim() : "";

  if (!EMAIL_RE.test(email)) {
    throw ApiError.badRequest("Enter a valid email address.");
  }
  if (password.length < 8) {
    throw ApiError.badRequest("Password must be at least 8 characters.");
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw ApiError.conflict("An account with this email already exists.");

  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({
    data: { email, passwordHash, fullName: fullName || null, role: "USER" },
  });

  return created({ id: user.id, email: user.email });
});
