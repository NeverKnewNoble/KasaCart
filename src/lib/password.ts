/**
 * Password hashing for NextAuth credentials accounts.
 *
 * Uses bcryptjs (pure JS, no native build) so it runs anywhere our Node
 * route handlers do. Google-only accounts have no password and skip this.
 */
import bcrypt from "bcryptjs";

const ROUNDS = 10;

/** Hash a plaintext password for storage in `users.password_hash`. */
export function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, ROUNDS);
}

/** Compare a plaintext password against a stored bcrypt hash. */
export function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
