-- Migrate auth from Clerk to NextAuth: drop the Clerk link, add password + role.

-- CreateEnum
CREATE TYPE "user_role" AS ENUM ('ADMIN', 'USER');

-- DropIndex
DROP INDEX "users_clerk_user_id_key";

-- AlterTable
ALTER TABLE "users" DROP COLUMN "clerk_user_id",
ADD COLUMN     "password_hash" TEXT,
ADD COLUMN     "role" "user_role" NOT NULL DEFAULT 'USER';
