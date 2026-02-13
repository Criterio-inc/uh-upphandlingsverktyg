import { prisma } from "@/lib/db";

/**
 * Runtime auto-migration for User/UserFeature tables.
 *
 * prisma migrate deploy cannot authenticate with Turso in the Vercel
 * build environment (prisma.config.ts only sends the URL, not the
 * auth token). This utility creates the tables via the runtime Prisma
 * client which has full Turso access.
 *
 * Uses CREATE TABLE IF NOT EXISTS — safe to call repeatedly and
 * concurrently across serverless cold starts.
 */

let _ensured = false;

export async function ensureUserTables(): Promise<void> {
  if (_ensured) return;

  try {
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "User" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "email" TEXT NOT NULL,
        "firstName" TEXT NOT NULL DEFAULT '',
        "lastName" TEXT NOT NULL DEFAULT '',
        "imageUrl" TEXT NOT NULL DEFAULT '',
        "isAdmin" BOOLEAN NOT NULL DEFAULT false,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "UserFeature" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "userId" TEXT NOT NULL,
        "featureKey" TEXT NOT NULL,
        "enabled" BOOLEAN NOT NULL DEFAULT true,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "UserFeature_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
      )
    `);

    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "UserFeature_userId_idx" ON "UserFeature"("userId")
    `);

    await prisma.$executeRawUnsafe(`
      CREATE UNIQUE INDEX IF NOT EXISTS "UserFeature_userId_featureKey_key" ON "UserFeature"("userId", "featureKey")
    `);

    _ensured = true;
  } catch (err) {
    console.error("ensureUserTables failed:", err);
  }
}
