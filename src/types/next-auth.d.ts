import type { DefaultSession } from "next-auth";
import type { UserRole } from "@/generated/prisma/enums";

declare module "next-auth" {
  /** Session exposed to the app — adds our DB user id + role. */
  interface Session {
    user: {
      id: string;
      role: UserRole;
    } & DefaultSession["user"];
  }

  /** User returned from `authorize` / providers — carries the role. */
  interface User {
    role?: UserRole;
  }
}

// `next-auth/jwt` re-exports the JWT interface from `@auth/core/jwt`, so the
// augmentation must target the core module to actually merge.
declare module "@auth/core/jwt" {
  interface JWT {
    id?: string;
    role?: UserRole;
  }
}
