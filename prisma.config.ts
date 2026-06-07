// Prisma CLI configuration (Prisma 7).
// Loads env from .env so DATABASE_URL / DIRECT_URL are available to the CLI.
import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    // `prisma db seed` / post-migrate seeding runs this.
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    // Migrations & introspection need a DIRECT (unpooled) Neon connection.
    // Fall back to DATABASE_URL if DIRECT_URL isn't set.
    url: process.env["DIRECT_URL"] ?? process.env["DATABASE_URL"],
  },
});
